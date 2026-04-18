import { NextResponse } from "next/server"
import { getSiteSettings } from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const s = await getSiteSettings()
    return NextResponse.json(s, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } })
  } catch (e) {
    console.error("site-settings public GET:", e)
    return NextResponse.json(
      { showPublicJobViewCounts: true, showPublicWatchingCount: true },
      { status: 200 },
    )
  }
}
