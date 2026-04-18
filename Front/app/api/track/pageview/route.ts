import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Paths we don't want to track at all
const SKIP_PREFIXES = ["/api/", "/_next/", "/admin", "/favicon"]

// 1 year — visitor cookie lifespan
const VISITOR_COOKIE = "aipplify_vid"
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function generateVisitorId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  )
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null
  const parts = header.split(/;\s*/)
  for (const p of parts) {
    const idx = p.indexOf("=")
    if (idx === -1) continue
    if (p.slice(0, idx) === name) return decodeURIComponent(p.slice(idx + 1))
  }
  return null
}

function normalizeReferrer(ref: string | null | undefined, host: string | null): string | null {
  if (!ref) return null
  try {
    const u = new URL(ref)
    // If the referrer is the site itself, it's an internal navigation — ignore.
    if (host && u.host === host) return null
    return u.origin + u.pathname
  } catch {
    return null
  }
}

/** Extract the real client IP. Honors common reverse-proxy headers. */
function readIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0]!.trim()
  const real = request.headers.get("x-real-ip")
  if (real) return real.trim()
  return null
}

/** Best-effort country code from common edge-CDN headers (CF / Vercel / Netlify). */
function readCountry(request: Request): string | null {
  const cf = request.headers.get("cf-ipcountry")
  if (cf && cf !== "XX") return cf.toUpperCase()
  const vercel = request.headers.get("x-vercel-ip-country")
  if (vercel) return vercel.toUpperCase()
  const generic = request.headers.get("x-country-code")
  if (generic) return generic.toUpperCase()
  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const path: unknown = body?.path
    const referrer: unknown = body?.referrer
    const userIdRaw: unknown = body?.userId

    if (!path || typeof path !== "string") {
      return NextResponse.json({ ok: false })
    }
    if (SKIP_PREFIXES.some((p) => path.startsWith(p))) {
      return NextResponse.json({ ok: false })
    }

    const host = request.headers.get("host")
    const ref = normalizeReferrer(typeof referrer === "string" ? referrer : null, host)
    const userAgent = request.headers.get("user-agent")?.slice(0, 300) ?? null
    const ip = readIp(request)
    const country = readCountry(request)
    const userId = typeof userIdRaw === "string" && userIdRaw.length > 0 ? userIdRaw : null

    // Visitor cookie
    let visitorId = readCookie(request.headers.get("cookie"), VISITOR_COOKIE)
    let isNew = false
    if (!visitorId) {
      visitorId = generateVisitorId()
      isNew = true
    }

    const now = new Date()
    const day = now.toISOString().slice(0, 10)

    if (isNew) {
      await prisma.visitor.create({
        data: {
          id: visitorId,
          firstSeen: now,
          lastSeen: now,
          pageViews: 1,
          firstPath: path,
          firstReferrer: ref,
          userAgent,
          ip,
          country,
          userId,
        },
      })
    } else {
      // Update last-seen/pageViews unconditionally; only update ip/country/userId
      // when we actually have new info so we don't clobber previously-known values.
      const updateData: Record<string, unknown> = {
        lastSeen: now,
        pageViews: { increment: 1 },
      }
      if (ip) updateData.ip = ip
      if (country) updateData.country = country
      if (userId) updateData.userId = userId
      if (userAgent) updateData.userAgent = userAgent

      const updated = await prisma.visitor.updateMany({
        where: { id: visitorId },
        data: updateData,
      })
      if (updated.count === 0) {
        await prisma.visitor.create({
          data: {
            id: visitorId,
            firstSeen: now,
            lastSeen: now,
            pageViews: 1,
            firstPath: path,
            firstReferrer: ref,
            userAgent,
            ip,
            country,
            userId,
          },
        })
        isNew = true
      }
    }

    await prisma.pageView.create({
      data: {
        visitorId,
        path,
        referrer: ref,
      },
    })

    // Aggregated daily counter (kept for the top-pages widget)
    await prisma.dailyPageView.upsert({
      where: { path_day: { path, day } },
      create: { path, day, views: 1 },
      update: { views: { increment: 1 } },
    })

    const res = NextResponse.json({ ok: true })
    if (isNew) {
      res.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: VISITOR_COOKIE_MAX_AGE,
      })
    }
    return res
  } catch {
    return NextResponse.json({ ok: false })
  }
}
