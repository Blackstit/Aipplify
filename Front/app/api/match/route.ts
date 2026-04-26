import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { readSecrets } from "@/lib/admin-secrets"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const FREE_LIMIT = 3

const MATCH_PROMPT = (jobText: string, candidateText: string) => `You are an expert HR analyst. Analyze the candidate vs job match.

JOB:
${jobText}

CANDIDATE:
${candidateText}

Rate the match on exactly 5 criteria (each 0-20 points). Return ONLY valid JSON, no markdown:
{
  "criteria":[
    {"name":"Skills & Tech Stack","icon":"💻","score":X,"max":20,"verdict":"Strong|Good|Partial|Weak","comment":"2 concise sentences."},
    {"name":"Experience Level","icon":"📈","score":X,"max":20,"verdict":"Strong|Good|Partial|Weak","comment":"2 concise sentences."},
    {"name":"Work Type & Location","icon":"🌍","score":X,"max":20,"verdict":"Strong|Good|Partial|Weak","comment":"2 concise sentences."},
    {"name":"Domain & Industry","icon":"🏢","score":X,"max":20,"verdict":"Strong|Good|Partial|Weak","comment":"2 concise sentences."},
    {"name":"Education & Certs","icon":"🎓","score":X,"max":20,"verdict":"Strong|Good|Partial|Weak","comment":"2 concise sentences."}
  ],
  "totalScore":X,
  "verdict":"Excellent Match|Strong Match|Good Match|Partial Match|Weak Match",
  "summary":"2-3 sentences: overall assessment + top advice.",
  "topStrengths":["strength1","strength2","strength3"],
  "gaps":["gap1","gap2"]
}`

function buildJobText(job: Record<string, unknown>): string {
  return [
    `Title: ${job.title}`,
    `Experience: ${job.experience}`,
    `Work Type: ${job.workType}`,
    `Location: ${job.location}`,
    `Skills: ${Array.isArray(job.skills) ? (job.skills as string[]).join(", ") : ""}`,
    `Description: ${String(job.description ?? "").slice(0, 1500)}`,
    job.requirements ? `Requirements: ${String(job.requirements).slice(0, 800)}` : "",
  ].filter(Boolean).join("\n")
}

function buildCandidateText(profile: Record<string, unknown>): string {
  const lines: string[] = []
  if (profile.title) lines.push(`Target Role: ${profile.title}`)
  if (profile.summary) lines.push(`Summary: ${profile.summary}`)
  if (Array.isArray(profile.skills) && profile.skills.length)
    lines.push(`Skills: ${(profile.skills as string[]).join(", ")}`)
  const exp = profile.experience as Array<Record<string, string>> | undefined
  exp?.forEach((e) => lines.push(`Experience: ${e.role} at ${e.company} (${e.start}–${e.end}): ${e.description}`))
  const edu = profile.education as Array<Record<string, string>> | undefined
  edu?.forEach((e) => lines.push(`Education: ${e.degree} in ${e.field} at ${e.school}`))
  if (!lines.length && profile.rawText)
    lines.push(String(profile.rawText).slice(0, 2000))
  return lines.join("\n")
}

// GET /api/match?userId=...&jobId=...  — fetch saved match for a job
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const jobId = searchParams.get("jobId")
  if (!userId || !jobId) return NextResponse.json({ match: null })

  const match = await prisma.savedMatch.findUnique({ where: { userId_jobId: { userId, jobId } } })
  return NextResponse.json({ match })
}

// POST /api/match — run analysis and save
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, profileId, job } = body as {
      userId: string
      profileId: string
      job: Record<string, unknown>
    }

    if (!userId) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 })
    if (!job?.title) return NextResponse.json({ error: "Job data required" }, { status: 400 })

    // Quota check
    const [subscription, used] = await Promise.all([
      prisma.subscription.findUnique({ where: { userId }, select: { plan: true, status: true } }),
      prisma.matchCheckLog.count({ where: { userId } }),
    ])
    const hasUnlimited = subscription?.status === "ACTIVE" && subscription?.plan !== "FREE"
    if (!hasUnlimited && used >= FREE_LIMIT) {
      return NextResponse.json({ error: "QUOTA_EXCEEDED", quotaUsed: used, quotaLimit: FREE_LIMIT }, { status: 402 })
    }

    // Resolve profile
    const dbProfile = await prisma.candidateProfile.findFirst({ where: { id: profileId, userId } })
    if (!dbProfile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    const candidateText = buildCandidateText(dbProfile as unknown as Record<string, unknown>)
    if (!candidateText.trim()) return NextResponse.json({ error: "Profile has no data" }, { status: 400 })

    // LLM call
    const { openrouterKey } = readSecrets()
    if (!openrouterKey) return NextResponse.json({ error: "OpenRouter key not configured" }, { status: 500 })

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aipplify.com",
        "X-Title": "Aipplify Match Analyzer",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-haiku",
        temperature: 0.2,
        max_tokens: 1500,
        messages: [{ role: "user", content: MATCH_PROMPT(buildJobText(job), candidateText) }],
      }),
    })

    if (!resp.ok) throw new Error(`LLM error: ${resp.status}`)
    const data = await resp.json()
    const content: string = data.choices?.[0]?.message?.content ?? "{}"

    let result: Record<string, unknown>
    try { result = JSON.parse(content) }
    catch {
      const m = content.match(/\{[\s\S]*\}/)
      if (!m) throw new Error("Invalid LLM response")
      result = JSON.parse(m[0])
    }

    const j = (v: unknown) => v as Prisma.InputJsonValue

    // Save / upsert match result
    const savedMatch = await prisma.savedMatch.upsert({
      where: { userId_jobId: { userId, jobId: String(job.id) } },
      create: {
        userId,
        jobId: String(job.id),
        jobSlug: String(job.slug ?? ""),
        jobTitle: String(job.title),
        companyName: job.companyName ? String(job.companyName) : null,
        score: Number(result.totalScore ?? 0),
        verdict: String(result.verdict ?? ""),
        summary: String(result.summary ?? ""),
        criteria: j(result.criteria ?? []),
        strengths: j(result.topStrengths ?? []),
        gaps: j(result.gaps ?? []),
      },
      update: {
        score: Number(result.totalScore ?? 0),
        verdict: String(result.verdict ?? ""),
        summary: String(result.summary ?? ""),
        criteria: j(result.criteria ?? []),
        strengths: j(result.topStrengths ?? []),
        gaps: j(result.gaps ?? []),
      },
    })

    // Log usage
    await prisma.matchCheckLog.create({
      data: { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, userId, jobId: String(job.id) },
    })

    const newUsed = used + 1
    return NextResponse.json({
      match: savedMatch,
      quotaInfo: { used: newUsed, limit: FREE_LIMIT, hasUnlimited, remaining: hasUnlimited ? Infinity : Math.max(0, FREE_LIMIT - newUsed) },
    })
  } catch (err) {
    console.error("[match POST]", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Analysis failed" }, { status: 500 })
  }
}
