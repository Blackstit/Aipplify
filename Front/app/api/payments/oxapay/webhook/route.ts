import { NextResponse } from "next/server"
import { createHmac } from "crypto"
import { prisma } from "@/lib/prisma"
import { readSecrets } from "@/lib/admin-secrets"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const hmacHeader = request.headers.get("HMAC") ?? request.headers.get("hmac") ?? ""

    const { oxapayKey } = readSecrets()
    if (oxapayKey) {
      const expected = createHmac("sha512", oxapayKey).update(rawBody).digest("hex")
      if (expected !== hmacHeader) {
        console.warn("[oxapay/webhook] Invalid HMAC — ignoring")
        return new Response("ok", { status: 200 }) // always return 200 to prevent retries on bad sig
      }
    }

    const payload = JSON.parse(rawBody)
    const { status, order_id, track_id, txs } = payload as {
      status: string; order_id: string; track_id: string
      txs?: Array<{ tx_hash: string; network: string; currency: string }>
    }

    if (!order_id) return new Response("ok", { status: 200 })

    const payment = await prisma.payment.findUnique({ where: { orderId: order_id } })
    if (!payment) return new Response("ok", { status: 200 })

    // Map OxaPay status to our enum
    const statusMap: Record<string, string> = {
      Paid: "PAID",
      Paying: "PAYING",
      Expired: "EXPIRED",
      Underpaid: "UNDERPAID",
      Refunded: "REFUNDED",
    }
    const newStatus = statusMap[status] ?? payment.status

    const tx = txs?.[0]
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus as never,
        oxapayTrackId: track_id ?? payment.oxapayTrackId,
        ...(newStatus === "PAID" && {
          paidAt: new Date(),
          txHash: tx?.tx_hash,
          txNetwork: tx?.network,
          txCurrency: tx?.currency,
        }),
      },
    })

    // Activate subscription on successful payment
    if (newStatus === "PAID") {
      const now = new Date()
      const end = new Date(now.getTime() + payment.durationDays * 24 * 60 * 60 * 1000)

      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        create: {
          userId: payment.userId,
          plan: payment.plan,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: end,
          lastPaymentId: payment.id,
        },
        update: {
          plan: payment.plan,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: end,
          cancelAtPeriodEnd: false,
          lastPaymentId: payment.id,
        },
      })
    }

    return new Response("ok", { status: 200 })
  } catch (err) {
    console.error("[oxapay/webhook]", err)
    return new Response("ok", { status: 200 }) // always 200 to OxaPay
  }
}
