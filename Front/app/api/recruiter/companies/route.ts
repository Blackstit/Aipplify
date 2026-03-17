import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

    const companies = await prisma.company.findMany({
      where: {
        ownerUserId: userId,
      },
      include: {
        _count: {
          select: {
            jobs: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      companies: companies.map((company) => ({
        id: company.id,
        slug: company.slug,
        name: company.name,
        website: company.website,
        description: company.description,
        logo: company.logoUrl,
        verified: company.verified,
        jobsCount: company._count.jobs,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      })),
      total: companies.length,
    })
  } catch (error) {
    console.error("Error fetching recruiter companies:", error)
    return NextResponse.json(
      { error: "Failed to fetch companies", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, website, description, logoUrl } = body

    // TODO: Get user ID from session/auth
    const userId = body.userId // Temporary: should come from auth

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      )
    }

    // Generate slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    let slug = baseSlug
    let counter = 1
    while (await prisma.company.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const company = await prisma.company.create({
      data: {
        slug,
        name,
        website: website || null,
        description: description || null,
        logoUrl: logoUrl || null,
        verified: false,
        ownerUserId: userId,
      },
    })

    return NextResponse.json({
      id: company.id,
      slug: company.slug,
      name: company.name,
      website: company.website,
      description: company.description,
      logo: company.logoUrl,
      verified: company.verified,
      jobsCount: 0,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    })
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json(
      { error: "Failed to create company", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
