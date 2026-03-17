import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { slug: params.slug },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    const count = await prisma.job.count({
      where: {
        companyId: company.id,
        status: "PUBLISHED",
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error counting company jobs:", error)
    return NextResponse.json(
      { error: "Failed to count jobs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
