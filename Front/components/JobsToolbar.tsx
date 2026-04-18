"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshButton } from "./RefreshButton"

interface JobsToolbarProps {
  totalJobs: number
  /** UI value: newest | oldest | salary-high … (синхронизировать с родителем / URL) */
  sortBy: string
  onSortChange?: (sortBy: string) => void
  onHideViewedChange?: (hide: boolean) => void
  onRefresh?: () => void
  lastUpdated?: Date
}

export function JobsToolbar({
  totalJobs,
  sortBy,
  onSortChange,
  onHideViewedChange,
  onRefresh,
  lastUpdated,
}: JobsToolbarProps) {
  const [hideViewed, setHideViewed] = useState(false)

  const handleSortChange = (value: string) => {
    onSortChange?.(value)
  }

  const handleHideViewedChange = (checked: boolean) => {
    setHideViewed(checked)
    onHideViewedChange?.(checked)
  }

  const handleRefresh = async () => {
    // Reload the page or refetch jobs
    if (onRefresh) {
      await onRefresh()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="salary-high">Salary: High</SelectItem>
            <SelectItem value="salary-low">Salary: Low</SelectItem>
            <SelectItem value="score-high">AI Score: High</SelectItem>
            <SelectItem value="score-low">AI Score: Low</SelectItem>
            <SelectItem value="relevance">Relevance</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hide-viewed"
            checked={hideViewed}
            onCheckedChange={(checked) => handleHideViewedChange(checked as boolean)}
          />
          <Label htmlFor="hide-viewed" className="text-sm cursor-pointer">
            Hide viewed
          </Label>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {totalJobs.toLocaleString()} jobs
        </span>
        <RefreshButton onRefresh={handleRefresh} lastUpdated={lastUpdated} />
      </div>
    </div>
  )
}
