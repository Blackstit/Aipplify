"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { GA_ID, pageview } from "@/lib/analytics"
import { getCurrentUser } from "@/lib/session"

function GAPageTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const qs = searchParams.toString()
    const url = qs ? `${pathname}?${qs}` : pathname
    // Send to Google Analytics
    pageview(url)
    // Send to our own DB tracker (fire-and-forget).
    // document.referrer is only useful on first hit in the tab, so we let the server
    // decide whether to record it (first visit wins). We also forward the current user
    // id (if any) so we can link an anonymous visitor cookie to a user account.
    const currentUser = getCurrentUser()
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        userId: currentUser?.id ?? null,
      }),
    }).catch(() => {})
  }, [pathname, searchParams])

  return null
}

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GAPageTracker />
      </Suspense>
    </>
  )
}
