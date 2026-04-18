import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminFromRequest } from "@/lib/adminGuard"
import type { Prisma, JobStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

const ALLOWED_STATUSES: JobStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { company: true },
  })
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ job })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const data: Prisma.JobUpdateInput = {}
  if (typeof body.featured === "boolean") data.featured = body.featured
  if (typeof body.verified === "boolean") data.verified = body.verified
  if (typeof body.status === "string" && ALLOWED_STATUSES.includes(body.status as JobStatus)) {
    data.status = body.status as JobStatus
  }
  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim()

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  try {
    const updated = await prisma.job.update({ where: { id: params.id }, data, include: { company: true } })
    return NextResponse.json({ job: updated })
  } catch (err) {
    if ((err as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    console.error("Admin PATCH job error:", err)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // Only admins can hard-delete to avoid losing job-eco-backed data by accident from moderators.
  if (admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 })
  }

  try {
    await prisma.job.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if ((err as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    console.error("Admin DELETE job error:", err)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
