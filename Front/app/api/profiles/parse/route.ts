import { NextResponse } from "next/server"
import { parseResumeViaPDF } from "@/lib/profile-parser"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 })
    }

    const parsed = await parseResumeViaPDF(file)

    return NextResponse.json({
      success: true,
      filename: file.name,
      parsed,
    })
  } catch (err) {
    console.error("[profiles/parse] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to parse resume" },
      { status: 500 }
    )
  }
}
