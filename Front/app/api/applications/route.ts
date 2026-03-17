import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { jobId, userId } = body

    if (!jobId || !userId) {
      return NextResponse.json(
        { error: "jobId and userId are required" },
        { status: 400 }
      )
    }

    // Check if application already exists
    const existing = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Application already exists",
        application: existing,
      })
    }

    // Create new application
    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        status: "APPLIED",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Application created",
      application,
    })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
