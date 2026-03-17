"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { FilterTag } from "./FilterSection"

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder: string
  variant?: "default" | "exclude"
}

export function MultiSelect({ 
  options, 
  selected, 
  onSelectionChange, 
  placeholder,
  variant = "default"
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onSelectionChange(selected.filter(s => s !== option))
    } else {
      onSelectionChange([...selected, option])
    }
  }

  const handleRemove = (option: string) => {
    onSelectionChange(selected.filter(s => s !== option))
  }

  return (
    <div className="space-y-3">
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer",
            variant === "exclude" 
              ? "border-pink-300 bg-white" 
              : "border-border bg-card"
          )}
        >
          <span className={cn(
            "text-sm",
            searchQuery || selected.length > 0 ? "text-gray-900" : "text-gray-500"
          )}>
            {searchQuery || placeholder}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )} />
        </div>
        
        {isOpen && (
          <div className={cn(
            "absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto",
            variant === "exclude" ? "border-pink-300" : "border-border"
          )}>
            <div className="p-2 border-b">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="p-2 space-y-1">
              {filteredOptions.length === 0 ? (
                <div className="text-sm text-gray-500 p-2">No options found</div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleToggle(option)}
                  >
                    <Checkbox
                      checked={selected.includes(option)}
                      onCheckedChange={() => handleToggle(option)}
                    />
                    <Label className="flex-1 cursor-pointer text-sm">{option}</Label>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <FilterTag
              key={item}
              label={item}
              onRemove={() => handleRemove(item)}
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  )
}
