"use client"

import { useState, useEffect } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface RefreshButtonProps {
  onRefresh: () => void
  lastUpdated?: Date
}

export function RefreshButton({ onRefresh, lastUpdated }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updateTime, setUpdateTime] = useState<Date>(lastUpdated || new Date())

  useEffect(() => {
    if (lastUpdated) {
      setUpdateTime(lastUpdated)
    }
  }, [lastUpdated])

  useEffect(() => {
    const interval = setInterval(() => {
      // Update time display every minute
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
      setUpdateTime(new Date())
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  const timeAgo = formatDistanceToNow(updateTime, { addSuffix: true })

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        Updated {timeAgo}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RotateCcw
          className={cn(
            "h-4 w-4 transition-transform duration-500",
            isRefreshing && "animate-spin"
          )}
        />
      </Button>
    </div>
  )
}
