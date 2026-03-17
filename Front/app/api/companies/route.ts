import { NextResponse } from "next/server"
import { getAllCompanies } from "@/lib/mockCompanies"

export async function GET(request: Request) {
  try {
    const companies = getAllCompanies()
    return NextResponse.json(companies)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    )
  }
}
