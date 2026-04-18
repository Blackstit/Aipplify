"use client"

import { useEffect } from "react"
import { ApplyButton } from "@/components/ApplyButton"
import { SaveJobButton } from "@/components/SaveJobButton"
import { trackJobView } from "@/lib/analytics"

interface Props {
  jobId: string
  jobSlug: string
  jobTitle: string
  company: { id: string; name: string; slug: string; logo: string | null; verified: boolean }
  salary: string
  location: string
  experience: string
  tags: string[]
  postedAt: string
  recruiterContact?: string | null
}

export function JobInteractions(props: Props) {
  useEffect(() => {
    trackJobView(props.jobSlug, props.jobTitle, props.company.name)
    try {
      const viewed = JSON.parse(localStorage.getItem("viewedJobs") || "[]") as string[]
      if (!viewed.includes(props.jobSlug)) {
        viewed.push(props.jobSlug)
        if (viewed.length > 500) viewed.splice(0, viewed.length - 500)
        localStorage.setItem("viewedJobs", JSON.stringify(viewed))
        window.dispatchEvent(new Event("job-viewed"))
      }
    } catch {}
  }, [props.jobSlug, props.jobTitle, props.company.name])

  // Unique daily view + presence heartbeat (used for “watching now” and view totals).
  useEffect(() => {
    let sid = ""
    try {
      sid = sessionStorage.getItem("aipplify_viewer_key") || ""
      if (!sid) {
        sid = crypto.randomUUID()
        sessionStorage.setItem("aipplify_viewer_key", sid)
      }
    } catch {
      return
    }
    const headers: HeadersInit = { "x-viewer-key": sid }
    const slug = encodeURIComponent(props.jobSlug)
    fetch(`/api/jobs/${slug}/view`, { method: "POST", credentials: "include", headers }).catch(() => {})
    const ping = () => {
      fetch(`/api/jobs/${slug}/presence`, { method: "POST", credentials: "include", headers }).catch(() => {})
    }
    ping()
    const interval = setInterval(ping, 25_000)
    const onVis = () => {
      if (document.visibilityState === "visible") ping()
    }
    document.addEventListener("visibilitychange", onVis)
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [props.jobSlug])

  return (
    <div className="space-y-3">
      <ApplyButton
        jobId={props.jobId}
        jobSlug={props.jobSlug}
        jobTitle={props.jobTitle}
        recruiterContact={props.recruiterContact ?? undefined}
      />
      <SaveJobButton
        jobId={props.jobId}
        jobSlug={props.jobSlug}
        jobTitle={props.jobTitle}
        company={props.company}
        salary={props.salary}
        location={props.location}
        experience={props.experience}
        tags={props.tags}
        postedAt={props.postedAt}
      />
    </div>
  )
}
