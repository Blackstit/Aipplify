import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap } from "lucide-react"

interface PromoCardProps {
  variant?: "default" | "ai"
}

export function PromoCard({ variant = "default" }: PromoCardProps) {
  if (variant === "ai") {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">AI Job Matching</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get personalized job recommendations based on your experience and skills
              </p>
              <Button size="sm" variant="outline">
                Try for free
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Be among the first to apply!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Recruiters often choose from the first 50 candidates. Subscribe to filters and receive new job openings in the bot!
            </p>
            <Button size="sm">
              Configure filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
