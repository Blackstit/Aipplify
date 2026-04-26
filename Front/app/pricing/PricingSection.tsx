"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Crown, Zap, ChevronDown, AlertCircle, Loader2 } from "lucide-react"
import { getCurrentUser } from "@/lib/session"

// ─── Plans ────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: 9.99,
    per: "/ month",
    billedAs: "Billed monthly",
    badge: null,
    saveLabel: null,
    description: "Full access, cancel anytime.",
  },
  {
    id: "quarterly",
    label: "3 Months",
    price: 24.99,
    perMonth: 8.33,
    per: "/ 3 months",
    billedAs: "Billed every 3 months",
    badge: "Most Popular",
    saveLabel: "Save 17%",
    description: "Best for an active job search.",
  },
  {
    id: "yearly",
    label: "Yearly",
    price: 79.99,
    perMonth: 6.67,
    per: "/ year",
    billedAs: "Billed annually",
    badge: "Best Value",
    saveLabel: "Save 33%",
    description: "Perfect if you're continuously growing.",
  },
] as const

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: "What exactly is a Match Check?",
    a: "A Match Check uses AI to compare your candidate profile against a specific job across 5 key criteria: Skills & Tech Stack, Experience Level, Work Type & Location, Domain & Industry, and Education & Certifications. You get a score out of 100, a verdict, a summary, and a list of your strengths and gaps for that role.",
  },
  {
    q: "How many free checks do I get?",
    a: "Every registered account gets 3 free Match Checks — no card or crypto payment required. After that, you'll need a Pro subscription to run more checks.",
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes. You can cancel at any time from your account settings. Your Pro access continues until the end of your billing period — no immediate cutoff.",
  },
  {
    q: "What happens to my existing match results after I cancel?",
    a: "All your saved match results remain in your account forever, even on the free plan. You just won't be able to run new checks until you resubscribe.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept cryptocurrency (USDT) only. Payments are processed securely via OxaPay. Your subscription activates automatically the moment the blockchain transaction is confirmed — usually within a few minutes.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a full refund within 48 hours of your first payment if you're not satisfied. Contact us at support@aipplify.com and we'll sort it out.",
  },
  {
    q: "How long does a crypto payment take to confirm?",
    a: "Most USDT transactions confirm within 1–5 minutes on the network. Once confirmed, your Pro access is activated automatically — no manual action needed.",
  },
]

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-gray-900 text-sm sm:text-base">{q}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="text-sm text-gray-600 leading-relaxed pb-5 -mt-1">{a}</p>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PricingSection() {
  const router = useRouter()
  const [selected, setSelected] = useState<"monthly" | "quarterly" | "yearly">("quarterly")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const plan = PLANS.find((p) => p.id === selected)!

  const handleCheckout = async () => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/auth?returnTo=/pricing")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, period: selected }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create invoice")
      window.location.href = data.payUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Pricing cards ── */}
      <section id="plans" className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 mb-4">
              <Crown className="h-3.5 w-3.5" />Simple pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              One plan. Everything included.
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-base">
              Unlimited AI match checks — pick the billing cycle that suits your job search.
            </p>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 gap-1 shadow-sm">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    selected === p.id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {p.label}
                  {p.saveLabel && (
                    <span className={`absolute -top-2.5 -right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      selected === p.id ? "bg-white text-purple-700" : "bg-green-500 text-white"
                    }`}>
                      {p.saveLabel}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected plan card */}
          <div className="max-w-lg mx-auto">
            <div className="relative bg-white rounded-3xl border-2 border-indigo-500 shadow-2xl shadow-indigo-100 overflow-hidden">
              {/* Top gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-600" />

              <div className="p-8 sm:p-10">
                {/* Badge */}
                {plan.badge && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-3 py-1 mb-5">
                    <Crown className="h-3 w-3" />{plan.badge}
                  </span>
                )}

                {/* Price */}
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-gray-400 pb-1.5 text-base">{plan.per}</span>
                </div>
                {"perMonth" in plan && (
                  <p className="text-sm text-indigo-600 font-semibold mb-1">
                    ${plan.perMonth}/month · {plan.saveLabel}
                  </p>
                )}
                <p className="text-sm text-gray-400 mb-8">{plan.billedAs} · {plan.description}</p>

                {/* CTA */}
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold gap-2 h-12 text-base rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-70"
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" />Creating invoice…</>
                  ) : (
                    <><Zap className="h-5 w-5" />Pay ${plan.price} in USDT</>
                  )}
                </Button>

                {error && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
                  </div>
                )}

                <p className="text-xs text-center text-gray-400 mt-3">
                  Paid via cryptocurrency (USDT) · Activates instantly on confirmation
                </p>

                {/* Features */}
                <div className="mt-8 pt-8 border-t border-gray-100 space-y-3.5">
                  {[
                    "Unlimited AI Match Checks",
                    "5-criteria breakdown per job",
                    "Strengths & gaps analysis",
                    "All AI-scored jobs on Aipplify",
                    "Save & revisit all match results",
                    "Priority email support",
                    "Early access to new features",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                      <span className="text-sm text-gray-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Free plan note */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Free plan</p>
                  <p className="text-xs text-gray-500 mt-0.5">Always free — sign up in seconds</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => router.push("/auth")}>
                  Sign up free
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {["Browse all jobs", "AI quality scores", "3 Match Checks", "Save jobs"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Frequently asked questions</h2>
            <p className="text-gray-500">Still have questions? Email us at{" "}
              <a href="mailto:support@aipplify.com" className="text-indigo-600 hover:underline">support@aipplify.com</a>
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-200 px-6">
            {FAQ.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
