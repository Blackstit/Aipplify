import { NextResponse } from "next/server"
import { parseAndSaveJobs } from "@/lib/parsers/degencryptojobs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const page = body.page || 1
    const maxPages = body.maxPages || undefined

    const results = await parseAndSaveJobs(page, maxPages)

    return NextResponse.json({
      success: true,
      message: "Parsing completed",
      results: {
        jobsSaved: results.jobsSaved,
        jobsUpdated: results.jobsUpdated,
        companiesSaved: results.companiesSaved,
        errors: results.errors,
        totalErrors: results.errors.length,
      },
    })
  } catch (error) {
    console.error("Error parsing DegenCryptoJobs:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
