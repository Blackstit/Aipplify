import { NextResponse } from "next/server"
import { parseAndSaveJobs } from "@/lib/parsers/cryptojobslist"

export async function POST(request: Request) {
  try {
    const results = await parseAndSaveJobs()

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
    console.error("Error parsing CryptoJobsList RSS:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
