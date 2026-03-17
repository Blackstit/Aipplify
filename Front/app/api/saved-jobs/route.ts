import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get saved jobs for a user
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

    const savedJobs = await prisma.application.findMany({
      where: {
        userId,
        status: "SAVED",
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      jobs: savedJobs.map((app) => ({
        id: app.job.id,
        slug: app.job.slug,
        title: app.job.title,
        company: {
          name: app.job.company?.name || "Unknown Company",
          logo: app.job.company?.logoUrl || null,
          verified: app.job.company?.verified || false,
        },
        salary: app.job.salaryText || 
          (app.job.salaryMin && app.job.salaryMax 
            ? `${app.job.salaryMin} - ${app.job.salaryMax} ${app.job.currency || ""}`.trim()
            : app.job.salaryMin 
              ? `From ${app.job.salaryMin} ${app.job.currency || ""}`.trim()
              : "Not specified"),
        location: app.job.locationText,
        experience: app.job.experience.toLowerCase(),
        tags: app.job.tags,
        postedAt: app.job.postedAt?.toISOString() || app.job.createdAt.toISOString(),
        featured: app.job.featured,
        verified: app.job.verified || app.job.company?.verified || false,
        savedAt: app.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching saved jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch saved jobs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST - Save a job
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

    // Check if already saved
    const existing = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    })

    if (existing) {
      if (existing.status === "SAVED") {
        return NextResponse.json({
          success: true,
          message: "Job already saved",
          saved: true,
        })
      } else {
        // Update status to SAVED
        await prisma.application.update({
          where: { id: existing.id },
          data: { status: "SAVED" },
        })
        return NextResponse.json({
          success: true,
          message: "Job saved",
          saved: true,
        })
      }
    }

    // Create new saved job
    await prisma.application.create({
      data: {
        userId,
        jobId,
        status: "SAVED",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Job saved",
      saved: true,
    })
  } catch (error) {
    console.error("Error saving job:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// DELETE - Unsave a job
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")
    const userId = searchParams.get("userId")

    if (!jobId || !userId) {
      return NextResponse.json(
        { error: "jobId and userId are required" },
        { status: 400 }
      )
    }

    const application = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Job not found in saved jobs" },
        { status: 404 }
      )
    }

    // If status is SAVED, delete it. If it's APPLIED, keep it but don't show as saved
    if (application.status === "SAVED") {
      await prisma.application.delete({
        where: { id: application.id },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Job unsaved",
      saved: false,
    })
  } catch (error) {
    console.error("Error unsaving job:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
