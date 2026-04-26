"use client"

import { useEffect } from "react"

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/blog/${slug}/views`, { method: "POST" }).catch(() => {})
  }, [slug])
  return null
}
