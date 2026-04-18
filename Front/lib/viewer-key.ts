/**
 * Stable anonymous key for job view / presence dedupe.
 * Prefer first-party cookie from pageview tracker; fall back to client header.
 */
export function getViewerKeyFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || ""
  const m = cookieHeader.match(/(?:^|;\s*)aipplify_vid=([^;]+)/)
  if (m?.[1]) {
    const v = decodeURIComponent(m[1].trim())
    if (v.length >= 8 && v.length <= 128) return `c:${v}`
  }
  const h = request.headers.get("x-viewer-key")?.trim()
  if (h && /^[a-zA-Z0-9_-]{8,128}$/.test(h)) return `k:${h}`
  return null
}

export function utcDayString(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}
