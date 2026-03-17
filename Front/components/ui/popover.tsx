"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface PopoverTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface PopoverContentProps {
  className?: string
  align?: "start" | "center" | "end"
  children: React.ReactNode
}

const PopoverContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
}>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
})

export function Popover({ open, onOpenChange, children }: PopoverProps) {
  const triggerRef = React.useRef<HTMLElement>(null)
  
  return (
    <PopoverContext.Provider value={{ open, setOpen: onOpenChange, triggerRef }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  PopoverTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, asChild, ...props }, ref) => {
  const { open, setOpen, triggerRef } = React.useContext(PopoverContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref: (node: HTMLElement) => {
        triggerRef.current = node
        if (typeof ref === "function") {
          ref(node as HTMLButtonElement)
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement>).current = node as HTMLButtonElement
        }
      },
      onClick: (e: React.MouseEvent) => {
        setOpen(!open)
        if (children.props.onClick) {
          children.props.onClick(e)
        }
      },
    } as any)
  }

  return (
    <button
      ref={(node) => {
        triggerRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement>).current = node!
        }
      }}
      type="button"
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverContentProps
>(({ className, align = "start", children, ...props }, ref) => {
  const { open, setOpen, triggerRef } = React.useContext(PopoverContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  React.useEffect(() => {
    if (open && triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const contentRect = contentRef.current.getBoundingClientRect()
      
      let top = triggerRect.bottom + 4
      let left = triggerRect.left

      if (align === "start") {
        left = triggerRect.left
      } else if (align === "center") {
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
      } else if (align === "end") {
        left = triggerRect.right - contentRect.width
      }

      // Check if content goes off screen
      if (left + contentRect.width > window.innerWidth) {
        left = window.innerWidth - contentRect.width - 8
      }
      if (left < 0) {
        left = 8
      }

      contentRef.current.style.top = `${top}px`
      contentRef.current.style.left = `${left}px`
    }
  }, [open, align])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 w-72 rounded-md border border-gray-200 bg-white p-4 text-gray-900 shadow-lg outline-none mt-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
PopoverContent.displayName = "PopoverContent"
