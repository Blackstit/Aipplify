"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, X } from "lucide-react"
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
  showHelp = false, 
  showExclude = true, 
  children,
  excludeChildren,
  customHeader,
  onExcludeToggle,
  excluded: externalExcluded
}: FilterSectionProps) {
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
    <>
      <Card>
        <CardHeader className="pb-3">
          {customHeader || (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">{title}</h3>
                {showHelp && (
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                )}
              </div>
              {showExclude && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-xs",
                    excluded && "bg-gray-100"
                  )}
                  onClick={handleExcludeToggle}
                >
                  <X className="h-3 w-3 mr-1" />
                  Exclude
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>
      
      {excluded && excludeChildren && (
        <Card className="border-dashed border-pink-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">
                Exclude <span className="text-pink-500 underline decoration-dashed">{title}</span>
              </h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {excludeChildren}
          </CardContent>
        </Card>
      )}
    </>
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
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        selected
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
    <span className={cn(
      "inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm",
      variant === "exclude" 
        ? "bg-pink-100 text-gray-700" 
        : "bg-green-100 text-gray-700"
    )}>
      {label}
      <button
        onClick={onRemove}
        className="hover:text-gray-900"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
