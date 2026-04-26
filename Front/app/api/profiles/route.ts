import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { generateProfileEmbedding, profileToText } from "@/lib/profile-parser"
import type { ProfileFormData } from "@/types/profile"

const j = (v: unknown) => v as Prisma.InputJsonValue

export const dynamic = "force-dynamic"

// GET /api/profiles?userId=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const profiles = await prisma.candidateProfile.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      firstName: true,
      lastName: true,
      location: true,
      summary: true,
      skills: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ profiles })
}

// POST /api/profiles — create new profile
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, rawText, pdfFilename, ...formData } = body as {
      userId: string
      rawText?: string
      pdfFilename?: string
    } & ProfileFormData

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
    if (!formData.title?.trim()) return NextResponse.json({ error: "Profile title is required" }, { status: 400 })

    // Generate embedding in background — skip if no key
    const embedding = await generateProfileEmbedding(formData).catch(() => [])

    // Optionally generate raw text representation for embedding
    const textForEmbed = rawText || profileToText(formData)

    const profile = await prisma.candidateProfile.create({
      data: {
        userId,
        title: formData.title,
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        email: formData.email || null,
        phone: formData.phone || null,
        location: formData.location || null,
        summary: formData.summary || null,
        website: formData.website || null,
        linkedin: formData.linkedin || null,
        github: formData.github || null,
        twitter: formData.twitter || null,
        skills: formData.skills || [],
        experience: j(formData.experience || []),
        education: j(formData.education || []),
        projects: j(formData.projects || []),
        portfolio: j(formData.portfolio || []),
        certifications: j(formData.certifications || []),
        languages: j(formData.languages || []),
        pdfFilename: pdfFilename || null,
        rawText: textForEmbed || null,
        embedding,
      },
    })

    return NextResponse.json({ success: true, profile })
  } catch (err) {
    console.error("[profiles POST]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create profile" },
      { status: 500 }
    )
  }
}
