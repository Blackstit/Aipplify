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

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true },
    })
    if (!job || job.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Job not found or not published" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    })
    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
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

    // Note: Job.applyCount is incremented separately via /api/jobs/[slug]/apply-click
    // (one count per viewer per day) so clicks on Apply Now reflect immediately,
    // independent of whether the user has an Application record.
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
