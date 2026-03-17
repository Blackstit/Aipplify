import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transformJob } from "@/lib/jobs"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Try to find by slug first, then by id
    let job = await prisma.job.findUnique({
      where: { slug: id },
      include: {
        company: true,
      },
    })

    if (!job) {
      job = await prisma.job.findUnique({
        where: { id },
        include: {
          company: true,
        },
      })
    }

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(transformJob(job))
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json(
      { error: "Failed to fetch job", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      title,
      description,
      requirements,
      salaryText,
      salaryMin,
      salaryMax,
      currency,
      locationText,
      workType,
      experience,
      tags,
      featured,
      verified,
      companyId,
      recruiterContact,
      status,
    } = body

    // TODO: Verify user owns this job
    let job = await prisma.job.findUnique({
      where: { slug: id },
    })

    if (!job) {
      job = await prisma.job.findUnique({
        where: { id },
      })
    }

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: {
        title,
        description,
        requirements: requirements !== undefined ? requirements : job.requirements,
        salaryText: salaryText !== undefined ? salaryText : job.salaryText,
        salaryMin: salaryMin !== undefined ? salaryMin : job.salaryMin,
        salaryMax: salaryMax !== undefined ? salaryMax : job.salaryMax,
        currency: currency !== undefined ? currency : job.currency,
        locationText: locationText !== undefined ? locationText : job.locationText,
        workType: workType ? workType.toUpperCase() : job.workType,
        experience: experience ? experience.toUpperCase() : job.experience,
        tags: tags !== undefined ? tags : job.tags,
        featured: job.featured, // Keep existing value - only available with premium subscription
        verified: job.verified, // Keep existing value - only available with premium subscription
        companyId: companyId !== undefined ? companyId : job.companyId,
        recruiterContact: recruiterContact !== undefined ? recruiterContact : job.recruiterContact,
        status: status ? status.toUpperCase() : job.status,
      },
      include: {
        company: true,
      },
    })

    return NextResponse.json(transformJob(updatedJob))
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json(
      { error: "Failed to update job", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    // TODO: Verify user owns this job
    let job = await prisma.job.findUnique({
      where: { slug: id },
    })

    if (!job) {
      job = await prisma.job.findUnique({
        where: { id },
      })
    }

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    await prisma.job.delete({
      where: { id: job.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json(
      { error: "Failed to delete job", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
