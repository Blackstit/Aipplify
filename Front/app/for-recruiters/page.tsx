"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/Footer"
import { ScrollToPricingButton } from "@/components/ScrollToPricingButton"
import { 
  Check, 
  Sparkles, 
  Zap, 
  Target, 
  Users, 
  TrendingUp,
  Shield,
  BarChart3,
  Bot,
  Mail,
  Crown
} from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Job Matching",
    description: "Automatically find perfect candidates using advanced AI algorithms"
  },
  {
    icon: Target,
    title: "Smart Targeting",
    description: "Precise targeting based on skills, experience, and preferences"
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    description: "Get instant notifications about new matching candidates"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Detailed analytics on applications, views, and conversions"
  },
  {
    icon: Bot,
    title: "AI Resume Screening",
    description: "Automatic resume screening with relevance scoring"
  },
  {
    icon: Mail,
    title: "Direct Contact",
    description: "Direct contact with candidates without intermediaries"
  }
]

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "per month",
    description: "For small teams and startups",
    features: [
      "Up to 5 active job postings",
      "AI candidate matching",
      "Basic analytics",
      "Email support",
      "Up to 100 applications/month"
    ],
    popular: false,
    cta: "Get Started"
  },
  {
    name: "Professional",
    price: "$99",
    period: "per month",
    description: "For growing companies",
    features: [
      "Up to 20 active job postings",
      "AI matching + resume screening",
      "Advanced analytics",
      "Priority support",
      "Up to 500 applications/month",
      "Featured placement",
      "Direct candidate contact"
    ],
    popular: true,
    cta: "Try Now"
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "per month",
    description: "For large organizations",
    features: [
      "Unlimited job postings",
      "All AI features",
      "Personal account manager",
      "Custom analytics",
      "Unlimited applications",
      "Featured + Verified status",
      "API integration",
      "White label option"
    ],
    popular: false,
    cta: "Contact Us"
  }
]

export default function ForRecruitersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-background py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Find the Best Candidates with{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Post jobs, get quality applications, and find perfect employees faster
            </p>
            <div className="flex gap-4 justify-center">
              <ScrollToPricingButton
                size="lg"
                className="bg-gradient-primary hover:bg-gradient-primary-hover text-white"
              >
                Get Started Free
              </ScrollToPricingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-gray-600 text-lg">
              All the tools you need for effective recruitment in one place
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pricing Plans</h2>
            <p className="text-gray-600 text-lg">
              Choose a plan that fits your company
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={plan.popular ? "border-primary border-2 relative flex flex-col" : "flex flex-col"}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-primary text-white text-sm font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                      <Crown className="h-4 w-4" />
                      Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-2">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth" className="mt-auto">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="pt-12 pb-12">
              <Shield className="h-16 w-16 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Join hundreds of companies already using Aipplify to find talent
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/auth">
                  <Button size="lg" className="bg-gradient-primary hover:bg-gradient-primary-hover text-white">
                    Create Account
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
