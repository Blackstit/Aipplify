"use client"

import { Button } from "@/components/ui/button"

interface ScrollToPricingButtonProps {
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function ScrollToPricingButton({ children, className, size = "lg" }: ScrollToPricingButtonProps) {
  const scrollToPricing = () => {
    const element = document.getElementById("pricing")
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <Button 
      size={size}
      className={className}
      onClick={scrollToPricing}
    >
      {children}
    </Button>
  )
}
