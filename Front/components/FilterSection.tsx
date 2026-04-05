"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterSectionProps {
  title: string
  showHelp?: boolean
  showExclude?: boolean
  children: React.ReactNode
  excludeChildren?: React.ReactNode
  customHeader?: React.ReactNode
  onExcludeToggle?: (excluded: boolean) => void
  excluded?: boolean
}

export function FilterSection({
  title,
  showExclude = false,
  children,
  excludeChildren,
  customHeader,
  onExcludeToggle,
  excluded: externalExcluded,
}: FilterSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [internalExcluded, setInternalExcluded] = useState(false)
  const excluded = externalExcluded !== undefined ? externalExcluded : internalExcluded

  const handleExcludeToggle = () => {
    const newValue = !excluded
    if (onExcludeToggle) {
      onExcludeToggle(newValue)
    } else {
      setInternalExcluded(newValue)
    }
  }

  return (
    <div className="border-b border-gray-100 pb-3 last:border-b-0">
      <button
        type="button"
        className="flex items-center justify-between w-full py-1"
        onClick={() => setCollapsed(!collapsed)}
      >
        {customHeader || (
          <>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              {title}
            </h3>
            <div className="flex items-center gap-1">
              {showExclude && (
                <span
                  className={cn(
                    "h-4 px-1 text-[9px] rounded border cursor-pointer",
                    excluded
                      ? "border-rose-300 text-rose-600 bg-rose-50"
                      : "border-gray-200 text-gray-400",
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExcludeToggle()
                  }}
                >
                  <X className="h-2.5 w-2.5" />
                </span>
              )}
              {collapsed ? (
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
              )}
            </div>
          </>
        )}
      </button>
      {!collapsed && <div className="pt-1.5">{children}</div>}
      {!collapsed && excluded && excludeChildren && (
        <div className="mt-2 pt-2 border-t border-dashed border-rose-200">
          <p className="text-[10px] text-rose-500 mb-1 font-medium">Exclude</p>
          {excludeChildren}
        </div>
      )}
    </div>
  )
}

interface FilterButtonProps {
  label: string
  selected?: boolean
  onClick?: () => void
}

export function FilterButton({ label, selected = false, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
        selected
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200",
      )}
    >
      {label}
    </button>
  )
}

interface FilterTagProps {
  label: string
  onRemove: () => void
  variant?: "default" | "exclude"
}

export function FilterTag({ label, onRemove, variant = "default" }: FilterTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs",
        variant === "exclude" ? "bg-pink-100 text-gray-700" : "bg-green-100 text-gray-700",
      )}
    >
      {label}
      <button type="button" onClick={onRemove} className="hover:text-gray-900">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
