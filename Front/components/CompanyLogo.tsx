import { Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CompanyLogoProps {
  logo?: string | null
  name: string
  size?: number
  className?: string
}

export function CompanyLogo({ logo, name, size = 64, className }: CompanyLogoProps) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-lg", className)}
      />
    )
  }

  // Fallback placeholder
  const initials = name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-primary flex items-center justify-center text-white font-semibold",
        className
      )}
      style={{ width: size, height: size }}
    >
      {initials || <Building2 className="h-6 w-6" />}
    </div>
  )
}
