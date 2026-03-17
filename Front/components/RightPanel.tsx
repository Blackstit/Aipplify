"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Crown } from "lucide-react"
import { ContactManagerBanner } from "./ContactManagerBanner"

export function RightPanel() {
  const features = [
    "AI job matching",
    "Resume AI score",
    "Direct recruiter contacts",
    "Auto apply"
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Aipplify Plus</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full bg-gradient-primary hover:bg-gradient-primary-hover text-white">
            Upgrade
          </Button>
        </CardContent>
      </Card>

      <ContactManagerBanner />
    </div>
  )
}
