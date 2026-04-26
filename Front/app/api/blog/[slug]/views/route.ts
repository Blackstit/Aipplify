import { NextResponse } from "next/server"
import { incrementView } from "@/lib/blog-admin"

export const dynamic = "force-dynamic"

export async function POST(_req: Request, { params }: { params: { slug: string } }) {
  try {
    incrementView(params.slug)
  } catch {
    // non-critical
  }
  return NextResponse.json({ ok: true })
}
