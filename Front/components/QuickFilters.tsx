"use client"

import { useState } from "react"
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
    <div className="grid grid-cols-2 gap-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onChange(filter.id, !filter.checked)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
            filter.checked
              ? "bg-gradient-primary text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {filter.checked && <Check className="h-4 w-4" />}
          {filter.label}
        </button>
      ))}
    </div>
  )
}
