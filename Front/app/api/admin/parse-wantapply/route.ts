import { NextResponse } from "next/server"
import { parseAndSaveJobs } from "@/lib/parsers/wantapply"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const page = body.page || 1
    const maxPages = typeof body.maxPages === "number" ? body.maxPages : undefined // undefined = все страницы
    
    // TODO: Add authentication/authorization check here
    // For now, this endpoint is open - you should protect it!
    
    const authToken = body.authToken || process.env.WANTAPPLY_API_TOKEN
    const cookies = body.cookies || process.env.WANTAPPLY_COOKIES
    
    console.log(`Starting parser: page ${page}, maxPages: ${maxPages ?? "ALL"}`)
    
    const results = await parseAndSaveJobs(page, maxPages, authToken, cookies)
    
    return NextResponse.json({
      success: true,
      message: "Parsing completed",
      results: {
        jobsSaved: results.jobsSaved,
        jobsUpdated: results.jobsUpdated,
        companiesSaved: results.companiesSaved,
        errors: results.errors,
        totalErrors: results.errors.length
      }
    })
  } catch (error) {
    console.error("Parser error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse jobs"
      },
      { status: 500 }
    )
  }
}
