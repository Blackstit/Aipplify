import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { readSecrets } from "@/lib/admin-secrets"

export const dynamic = "force-dynamic"

const PLANS = {
  monthly:   { durationDays: 30,  amount: 9.99 },
  quarterly: { durationDays: 90,  amount: 24.99 },
  yearly:    { durationDays: 365, amount: 79.99 },
} as const

export async function POST(request: Request) {
  try {
    const { userId, period } = await request.json() as { userId: string; period: keyof typeof PLANS }

    if (!userId) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 })
    if (!PLANS[period]) return NextResponse.json({ error: "Invalid period" }, { status: 400 })

    const { oxapayKey } = readSecrets()
    if (!oxapayKey) return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 })

    const { durationDays, amount } = PLANS[period]
    const orderId = `APY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        plan: "STARTER",
        period,
        durationDays,
        amount,
        currency: "USDT",
        orderId,
        status: "PENDING",
      },
    })

    // Create OxaPay invoice
    const oxaRes = await fetch("https://api.oxapay.com/v1/payment/invoice", {
      method: "POST",
      headers: {
        "merchant_api_key": oxapayKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "USDT",
        lifetime: 60,
        order_id: orderId,
        callback_url: "https://aipplify.com/api/payments/oxapay/webhook",
        return_url: "https://aipplify.com/pricing?success=1",
        description: `Aipplify Pro — ${period} subscription`,
      }),
    })

    if (!oxaRes.ok) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "CANCELLED", adminNote: `OxaPay error: ${oxaRes.status}` } })
      throw new Error(`OxaPay error: ${oxaRes.status}`)
    }

    const oxaData = await oxaRes.json()
    const trackId: string = oxaData.data?.track_id
    const payUrl: string = oxaData.data?.payment_url

    if (!payUrl) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "CANCELLED", adminNote: "OxaPay returned no payment_url" } })
      throw new Error("No payment URL received from OxaPay")
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { oxapayTrackId: trackId, oxapayPayUrl: payUrl },
    })

    return NextResponse.json({ payUrl, orderId, paymentId: payment.id })
  } catch (err) {
    console.error("[payments/create]", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create payment" }, { status: 500 })
  }
}
