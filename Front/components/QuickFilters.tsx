"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickFilter {
  id: string
  label: string
  checked: boolean
}

interface QuickFiltersProps {
  filters: QuickFilter[]
  onChange: (id: string, checked: boolean) => void
}

export function QuickFilters({ filters, onChange }: QuickFiltersProps) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {filters.map((filter) => (
        <label
          key={filter.id}
          className="flex items-center gap-1.5 cursor-pointer select-none group"
        >
          <span
            className={cn(
              "inline-flex items-center justify-center w-4 h-4 rounded border transition-colors",
              filter.checked
                ? "bg-primary border-primary"
                : "border-gray-300 group-hover:border-gray-400",
            )}
            onClick={() => onChange(filter.id, !filter.checked)}
          >
            {filter.checked && <Check className="h-3 w-3 text-white" />}
          </span>
          <span
            className="text-xs text-gray-600 group-hover:text-gray-900"
            onClick={() => onChange(filter.id, !filter.checked)}
          >
            {filter.label}
          </span>
        </label>
      ))}
    </div>
  )
}
