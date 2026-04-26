import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { generateProfileEmbedding, profileToText } from "@/lib/profile-parser"
import type { ProfileFormData } from "@/types/profile"

const j = (v: unknown) => v as Prisma.InputJsonValue

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

// GET /api/profiles/[id]
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const profile = await prisma.candidateProfile.findUnique({ where: { id } })
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ profile })
}

// PUT /api/profiles/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, rawText, pdfFilename, ...formData } = body as {
      userId: string
      rawText?: string
      pdfFilename?: string
    } & ProfileFormData

    const existing = await prisma.candidateProfile.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const embedding = await generateProfileEmbedding(formData).catch(() => existing.embedding)
    const textForEmbed = rawText || profileToText(formData)

    const updated = await prisma.candidateProfile.update({
      where: { id },
      data: {
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
        pdfFilename: pdfFilename || existing.pdfFilename,
        rawText: textForEmbed || existing.rawText,
        embedding,
      },
    })

    return NextResponse.json({ success: true, profile: updated })
  } catch (err) {
    console.error("[profiles PUT]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update profile" },
      { status: 500 }
    )
  }
}

// DELETE /api/profiles/[id]?userId=...
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const existing = await prisma.candidateProfile.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (existing.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await prisma.candidateProfile.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[profiles DELETE]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete profile" },
      { status: 500 }
    )
  }
}
