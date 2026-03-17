import { cn } from "@/lib/utils"

interface TagProps {
  children: React.ReactNode
  className?: string
}

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700",
        className
      )}
    >
      {children}
    </span>
  )
}
