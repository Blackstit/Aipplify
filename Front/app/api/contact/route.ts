import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { ContactInquirySource } from "@prisma/client"

export const dynamic = "force-dynamic"

const VALID_SOURCES = new Set([
  "CONTACT_PAGE",
  "RECRUITER_FORM",
  "RECRUITER_BANNER",
  "OTHER",
])

const VALID_METHODS = new Set(["telegram", "whatsapp", "email", "phone"])

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Tiny in-memory rate limit — keeps the admin inbox from being spammed.
// 5 sends per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000
const LIMIT = 5
const buckets = new Map<string, { hits: number; resetAt: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const b = buckets.get(ip)
  if (!b || b.resetAt < now) {
    buckets.set(ip, { hits: 1, resetAt: now + WINDOW_MS })
    return false
  }
  if (b.hits >= LIMIT) return true
  b.hits += 1
  return false
}

function firstHeader(h: Headers, name: string): string | null {
  const v = h.get(name)
  if (!v) return null
  return v.split(",")[0].trim() || null
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>

    const name = String(body.name || "").trim()
    const email = body.email ? String(body.email).trim() : ""
    const contactMethodRaw = body.contactMethod ? String(body.contactMethod).trim().toLowerCase() : ""
    const contactValue = body.contactValue ? String(body.contactValue).trim() : ""
    const subject = body.subject ? String(body.subject).trim() : ""
    const message = String(body.message || "").trim()
    const sourceRaw = String(body.source || "OTHER").trim().toUpperCase()
    const pageUrl = body.pageUrl ? String(body.pageUrl).slice(0, 512) : ""

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!message || message.length < 5) {
      return NextResponse.json(
        { error: "Message is too short (min 5 characters)" },
        { status: 400 },
      )
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long (max 5000 characters)" },
        { status: 400 },
      )
    }
    if (name.length > 120 || subject.length > 200) {
      return NextResponse.json({ error: "Fields too long" }, { status: 400 })
    }

    const hasEmail = email.length > 0
    const hasContact = contactMethodRaw.length > 0 && contactValue.length > 0
    if (!hasEmail && !hasContact) {
      return NextResponse.json(
        { error: "Please provide an email or a contact method" },
        { status: 400 },
      )
    }
    if (hasEmail && !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }
    if (hasContact && !VALID_METHODS.has(contactMethodRaw)) {
      return NextResponse.json({ error: "Unsupported contact method" }, { status: 400 })
    }

    const source: ContactInquirySource = (VALID_SOURCES.has(sourceRaw)
      ? sourceRaw
      : "OTHER") as ContactInquirySource

    const ip =
      firstHeader(request.headers, "x-forwarded-for") ||
      firstHeader(request.headers, "x-real-ip") ||
      null
    const userAgent = request.headers.get("user-agent")?.slice(0, 512) || null

    if (ip && rateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      )
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: name.slice(0, 120),
        email: hasEmail ? email.slice(0, 200) : null,
        contactMethod: hasContact ? contactMethodRaw : null,
        contactValue: hasContact ? contactValue.slice(0, 200) : null,
        subject: subject ? subject.slice(0, 200) : null,
        message: message.slice(0, 5000),
        source,
        pageUrl: pageUrl || null,
        ipAddress: ip,
        userAgent,
      },
      select: { id: true, createdAt: true },
    })

    return NextResponse.json({
      success: true,
      id: inquiry.id,
      createdAt: inquiry.createdAt,
      message: "Got it! We'll get back to you shortly.",
    })
  } catch (error) {
    console.error("contact POST:", error)
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 },
    )
  }
}
