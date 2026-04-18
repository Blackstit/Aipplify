import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { syncAllJobEcoVacancies } from "@/lib/parsers/job-eco"

export const dynamic = "force-dynamic"
// Allow up to 5 minutes for a full import (2400+ jobs × 13 pages).
export const maxDuration = 300

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 })
  }

  try {
    const result = await syncAllJobEcoVacancies()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Admin sync error:", error)
    return NextResponse.json(
      { error: "Sync failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
