"use client"

import { Eye, Send } from "lucide-react"
import { cn } from "@/lib/utils"

const pill =
  "inline-flex items-center gap-1 rounded-full border tabular-nums font-semibold tracking-tight shadow-sm backdrop-blur-sm transition-all"

export function JobMetricPills({
  views,
  applies,
  size = "md",
  className,
}: {
  views: number
  applies: number
  size?: "sm" | "md"
  className?: string
}) {
  const sm = size === "sm"
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span
        className={cn(
          pill,
          "border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-indigo-900",
          sm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        )}
        title="Unique visits (per visitor per day)"
      >
        <Eye className={cn("text-indigo-500", sm ? "h-3 w-3" : "h-3.5 w-3.5")} />
        {views.toLocaleString()}
      </span>
      <span
        className={cn(
          pill,
          "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-emerald-900",
          sm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        )}
        title="Apply clicks recorded on Aipplify"
      >
        <Send className={cn("text-emerald-600", sm ? "h-3 w-3" : "h-3.5 w-3.5")} />
        {applies.toLocaleString()}
      </span>
    </div>
  )
}
