import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { getSiteSettings, updateSiteSettings } from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const settings = await getSiteSettings()
  return NextResponse.json(settings)
}

export async function PATCH(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 })
  }
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  await updateSiteSettings({
    showPublicJobViewCounts: typeof body.showPublicJobViewCounts === "boolean" ? body.showPublicJobViewCounts : undefined,
    showPublicWatchingCount: typeof body.showPublicWatchingCount === "boolean" ? body.showPublicWatchingCount : undefined,
  })
  const settings = await getSiteSettings()
  return NextResponse.json(settings)
}
