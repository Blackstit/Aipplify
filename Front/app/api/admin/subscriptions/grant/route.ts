import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminFromRequest } from "@/lib/adminGuard"

export const dynamic = "force-dynamic"

// POST — grant or extend subscription manually
export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { userId, plan = "STARTER", durationDays = 30, note } = await request.json() as {
    userId: string; plan?: string; durationDays?: number; note?: string
  }

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const now = new Date()
  const end = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

  const sub = await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: plan as never,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: end,
      grantedByAdmin: true,
      adminNote: note ?? `Granted by admin for ${durationDays} days`,
    },
    update: {
      plan: plan as never,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
      grantedByAdmin: true,
      adminNote: note ?? `Extended by admin for ${durationDays} days`,
    },
  })

  // Create a Payment record to track admin grants
  await prisma.payment.create({
    data: {
      userId,
      plan: plan as never,
      period: `admin-grant-${durationDays}d`,
      durationDays,
      amount: 0,
      currency: "ADMIN",
      orderId: `ADMIN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      status: "PAID",
      paidAt: now,
      grantedByAdmin: true,
      adminNote: note ?? `Granted by admin`,
    },
  })

  return NextResponse.json({ subscription: sub })
}

// DELETE — revoke subscription
export async function DELETE(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { userId, note } = await request.json() as { userId: string; note?: string }
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const sub = await prisma.subscription.update({
    where: { userId },
    data: {
      plan: "FREE",
      status: "CANCELED",
      cancelAtPeriodEnd: false,
      adminNote: note ?? "Revoked by admin",
    },
  }).catch(() => null)

  return NextResponse.json({ subscription: sub })
}
