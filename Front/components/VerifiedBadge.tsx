"use client"

import { CheckCircle2 } from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  type: "featured" | "verified"
  className?: string
}

export function VerifiedBadge({ type, className }: VerifiedBadgeProps) {
  if (type === "featured") {
    return (
      <Tooltip content="Featured job - Premium placement">
        <CheckCircle2 
          className={cn("h-4 w-4 text-yellow-500 flex-shrink-0 cursor-help", className)} 
        />
      </Tooltip>
    )
  }

  return (
    <Tooltip content="Verified company - Authenticated employer">
      <CheckCircle2 
        className={cn("h-4 w-4 text-primary flex-shrink-0 cursor-help", className)} 
      />
    </Tooltip>
  )
}
