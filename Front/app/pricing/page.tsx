import type { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/Footer"
import { PricingSection } from "./PricingSection"
import {
  Zap, Target, TrendingUp, Clock, Sparkles, Star,
  ArrowRight, Check, ChevronRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Aipplify Pro — Unlimited AI Job Matching | Pricing & Plans",
  description:
    "Stop guessing — know your fit before you apply. Aipplify Pro gives you unlimited AI match checks, 5-criteria profile analysis, and strengths & gaps breakdown for every job. From $6.67/month.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Aipplify Pro — Unlimited AI Job Matching",
    description:
      "AI-powered match checks for every job you're considering. Score your profile across 5 criteria, get a verdict, and know exactly where you stand — before clicking Apply.",
    url: "https://aipplify.com/pricing",
    type: "website",
  },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: Target,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    title: "Apply with confidence",
    body: "Every match check scores your profile across 5 AI criteria — Skills, Experience, Location, Domain, and Education — so you know your real chances before clicking Apply.",
  },
  {
    icon: Clock,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    title: "Save hours of guesswork",
    body: "Candidates who check their match first send fewer, better applications. No more shotgunning 50 jobs and hearing nothing — focus only on roles where you actually fit.",
  },
  {
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    title: "Get more interviews",
    body: "Understanding your gaps lets you tailor your application or profile before sending. A targeted cover letter referencing your actual fit score stands out from generic ones.",
  },
]

const COMPARE = [
  { feature: "Browse 1,000+ AI-scored jobs", free: true, pro: true },
  { feature: "Save & bookmark jobs", free: true, pro: true },
  { feature: "Company profiles & info", free: true, pro: true },
  { feature: "AI quality score per job", free: true, pro: true },
  { feature: "Candidate profile creation", free: true, pro: true },
  { feature: "Match Checks", free: "3 total", pro: "Unlimited" },
  { feature: "5-criteria AI breakdown", free: true, pro: true },
  { feature: "Strengths & gaps analysis", free: true, pro: true },
  { feature: "All match results saved", free: true, pro: true },
  { feature: "Priority support", free: false, pro: true },
  { feature: "Early access to new features", free: false, pro: true },
]

// ─── Components ───────────────────────────────────────────────────────────────

function FeatureRow({ feature, free, pro }: { feature: string; free: boolean | string; pro: boolean | string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-3.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{feature}</span>
      <div className="w-24 text-center">
        {typeof free === "string"
          ? <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">{free}</span>
          : free
            ? <Check className="h-4 w-4 text-gray-400 mx-auto" />
            : <span className="text-gray-200 text-lg leading-none mx-auto block text-center">—</span>}
      </div>
      <div className="w-24 text-center">
        {typeof pro === "string"
          ? <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-1">{pro}</span>
          : pro
            ? <Check className="h-4 w-4 text-indigo-500 mx-auto" />
            : <span className="text-gray-200 text-lg leading-none mx-auto block text-center">—</span>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {/* Grid texture */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        {/* Glow blobs */}
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-28 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-10">
            <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-400">Pricing</span>
          </nav>

          {/* Tag */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Aipplify Pro
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Stop guessing.
            <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Start matching.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Know your fit before you apply. Aipplify Pro gives you{" "}
            <span className="text-white font-semibold">unlimited AI match checks</span> — so every application you send has a real shot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="#plans">
              <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/40 hover:scale-105 text-base">
                <Zap className="h-5 w-5" />
                See Plans & Pricing
              </button>
            </Link>
            <Link href="/jobs">
              <button className="flex items-center gap-2 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-8 py-3.5 rounded-xl transition-colors text-base font-medium">
                Browse jobs first
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-14 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-indigo-400" />Free plan — no payment needed</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-indigo-400" />Paid via crypto (USDT)</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-indigo-400" />48-hour refund guarantee</span>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { value: "1,000+", label: "Jobs analyzed daily" },
            { value: "5", label: "AI criteria per match" },
            { value: "100", label: "Point match score" },
            { value: "3×", label: "Faster shortlisting" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 border border-purple-200 rounded-full px-3 py-1 mb-4">
              <Star className="h-3.5 w-3.5" />Why Pro
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Land the job — not just the interview
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
              AI match checks are the competitive edge most candidates don't have. Here's how Pro users get more responses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon: Icon, color, bg, border, title, body }) => (
              <div key={title} className={`rounded-2xl border ${border} ${bg} p-7`}>
                <div className={`h-12 w-12 rounded-xl ${bg} border ${border} flex items-center justify-center mb-5`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* How it works mini-section */}
          <div className="mt-16 bg-gray-950 rounded-3xl p-8 sm:p-12 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-600/20 blur-[80px] pointer-events-none" />
            <div className="relative">
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300 mb-4 block">How it works</span>
              <h3 className="text-2xl font-bold mb-8">From job page to match score in seconds</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { step: "01", title: "Open any job", body: "Find a role on Aipplify and click the Match & Cover Letter block." },
                  { step: "02", title: "Select your profile", body: "Choose which candidate profile to compare. AI reads both the job and your profile." },
                  { step: "03", title: "Get your score", body: "Receive a score /100, verdict, 5-criteria breakdown, and your top strengths & gaps — instantly." },
                ].map(({ step, title, body }) => (
                  <div key={step} className="flex gap-4">
                    <span className="text-3xl font-extrabold text-white/10 leading-none flex-shrink-0">{step}</span>
                    <div>
                      <p className="font-semibold text-white mb-1">{title}</p>
                      <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature comparison ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Free vs Pro — at a glance</h2>
            <p className="text-gray-500">Everything you need to decide.</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Feature</span>
              <div className="w-24 text-center">
                <span className="text-xs font-bold text-gray-600">Free</span>
              </div>
              <div className="w-24 text-center">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-2 py-0.5">
                  Pro
                </span>
              </div>
            </div>
            <div className="px-6">
              {COMPARE.map((row) => (
                <FeatureRow key={row.feature} {...row} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive pricing + FAQ (client) */}
      <PricingSection />

      {/* ── Final CTA ── */}
      <section className="py-24 bg-gray-950 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-purple-600/15 blur-[100px]" />
        </div>
        <div className="relative max-w-2xl mx-auto px-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Your next job starts with the right match.
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Join Aipplify Pro and stop sending applications into the void. Know your score. Know your gaps. Get hired.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="#plans">
              <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all text-base">
                <Zap className="h-5 w-5" />
                Get Aipplify Pro
              </button>
            </Link>
            <Link href="/jobs">
              <button className="text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-8 py-3.5 rounded-xl transition-colors text-base font-medium">
                Browse jobs for free
              </button>
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-5">Starting at $6.67/month · Cancel anytime · 48h refund guarantee</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
