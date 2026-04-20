import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminFromRequest } from "@/lib/adminGuard"
import type { ContactInquiryStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

const STATUSES = new Set(["NEW", "READ", "RESPONDED", "CLOSED"])

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const inquiry = await prisma.contactInquiry.findUnique({ where: { id: params.id } })
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(inquiry)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>

  const data: {
    status?: ContactInquiryStatus
    adminNote?: string | null
    handledByUserId?: string | null
    handledAt?: Date | null
  } = {}

  if (typeof body.status === "string") {
    const s = body.status.toUpperCase()
    if (!STATUSES.has(s)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    data.status = s as ContactInquiryStatus
    if (s !== "NEW") {
      data.handledByUserId = admin.id
      data.handledAt = new Date()
    } else {
      data.handledByUserId = null
      data.handledAt = null
    }
  }
  if (typeof body.adminNote === "string") {
    data.adminNote = body.adminNote.slice(0, 2000) || null
  } else if (body.adminNote === null) {
    data.adminNote = null
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  try {
    const updated = await prisma.contactInquiry.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(updated)
  } catch (e) {
    const code = (e as { code?: string })?.code
    if (code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 })
    console.error("contact-inquiries PATCH:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 })
  }
  try {
    await prisma.contactInquiry.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    const code = (e as { code?: string })?.code
    if (code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 })
    console.error("contact-inquiries DELETE:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
