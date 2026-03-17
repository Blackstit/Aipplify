import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transformJob } from "@/lib/jobs"

export async function GET(request: Request) {
  try {
    // TODO: Get user ID from session/auth
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") // Temporary: should come from auth
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      )
    }

    const jobs = await prisma.job.findMany({
      where: {
        createdByUserId: userId,
      },
      include: {
        company: true,
      },
      orderBy: [
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json({
      jobs: jobs.map(transformJob),
      total: jobs.length,
    })
  } catch (error) {
    console.error("Error fetching recruiter jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
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
      status = "DRAFT",
    } = body

    // TODO: Get user ID from session/auth
    const userId = body.userId // Temporary: should come from auth

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      )
    }

    // Generate slug
    const baseSlug = `${title.toLowerCase().replace(/\s+/g, "-")}-at-${companyId || "company"}`
    let slug = baseSlug
    let counter = 1
    while (await prisma.job.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const job = await prisma.job.create({
      data: {
        slug,
        title,
        description,
        requirements: requirements || null,
        salaryText: salaryText || null,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        currency: currency || null,
        locationText: locationText || "Not specified",
        workType: workType?.toUpperCase() || "REMOTE",
        experience: experience?.toUpperCase() || "MID",
        tags: tags || [],
        featured: false, // Only available with premium subscription
        verified: false, // Only available with premium subscription
        source: "COMPANY_ADDED",
        status: status.toUpperCase() || "DRAFT",
        recruiterContact: recruiterContact || null,
        companyId: companyId || null,
        createdByUserId: userId,
      },
      include: {
        company: true,
      },
    })

    return NextResponse.json(transformJob(job))
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json(
      { error: "Failed to create job", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
