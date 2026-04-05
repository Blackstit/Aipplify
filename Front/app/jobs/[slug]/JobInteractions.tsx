"use client"

import { useEffect } from "react"
import { ApplyButton } from "@/components/ApplyButton"
import { SaveJobButton } from "@/components/SaveJobButton"

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
    try {
      const viewed = JSON.parse(localStorage.getItem("viewedJobs") || "[]") as string[]
      if (!viewed.includes(props.jobSlug)) {
        viewed.push(props.jobSlug)
        if (viewed.length > 500) viewed.splice(0, viewed.length - 500)
        localStorage.setItem("viewedJobs", JSON.stringify(viewed))
        window.dispatchEvent(new Event("job-viewed"))
      }
    } catch {}
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
