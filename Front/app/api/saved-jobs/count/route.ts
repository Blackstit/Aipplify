import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    const count = await prisma.application.count({
      where: {
        userId,
        status: "SAVED",
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error counting saved jobs:", error)
    return NextResponse.json(
      { error: "Failed to count saved jobs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
