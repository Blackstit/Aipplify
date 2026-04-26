import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/Footer"
import { getLandingData } from "@/lib/landing-data"
import { HeroSearch } from "@/components/home/HeroSearch"
import { AnimatedCounter } from "@/components/home/AnimatedCounter"
import { CompaniesMarquee } from "@/components/home/CompaniesMarquee"
import { JobColumnsMarquee } from "@/components/home/JobColumnsMarquee"
import { FloatingCards } from "@/components/home/FloatingCards"
import {
  ArrowRight, Briefcase, Sparkles, Zap, TrendingUp,
  Shield, Globe, Bot, Search,
  Brain, Code, Cpu, Database, Laptop, Rocket, Target, BarChart3,
  Lock, Eye, DollarSign, Award,
} from "lucide-react"

export const dynamic = "force-dynamic"

const FEATURES = [
  {
    icon: Bot, title: "AI-Powered Scoring",
    desc: "Every job is analyzed and scored by AI for quality, salary transparency, and risk assessment.",
    accent: "from-violet-500 to-indigo-500", size: "lg" as const,
    detail: "10-point scoring system with 8 criteria",
  },
  {
    icon: Sparkles, title: "Semantic Search",
    desc: "Find jobs by meaning, not just keywords. Describe your ideal role in natural language.",
    accent: "from-blue-500 to-cyan-500", size: "lg" as const,
    detail: "Powered by OpenAI embeddings",
  },
  {
    icon: Shield, title: "Risk Detection",
    desc: "AI flags suspicious postings so you can apply with confidence.",
    accent: "from-emerald-500 to-teal-500", size: "sm" as const,
    detail: "Scam protection built-in",
  },
  {
    icon: TrendingUp, title: "Smart Matching",
    desc: "Advanced filters by skills, domains, salary, and AI score.",
    accent: "from-amber-500 to-orange-500", size: "sm" as const,
    detail: "100+ filterable skills",
  },
  {
    icon: Globe, title: "Global Opportunities",
    desc: "Remote, hybrid, and on-site positions from companies worldwide.",
    accent: "from-pink-500 to-rose-500", size: "sm" as const,
    detail: "Tech, fintech, crypto & more",
  },
  {
    icon: Zap, title: "Real-Time Updates",
    desc: "New jobs appear instantly. No stale listings — everything is fresh.",
    accent: "from-purple-500 to-fuchsia-500", size: "sm" as const,
    detail: "Updated continuously",
  },
  {
    icon: Lock, title: "Verified Companies",
    desc: "Every employer passes a legitimacy check before a posting goes live.",
    accent: "from-slate-500 to-gray-600", size: "sm" as const,
    detail: "No ghost jobs, no farms",
  },
  {
    icon: DollarSign, title: "Salary Transparency",
    desc: "Hidden ranges are extracted from listings and benchmarked against market data.",
    accent: "from-lime-500 to-emerald-500", size: "sm" as const,
    detail: "Market benchmarks included",
  },
]

const SEO_STEPS = [
  {
    icon: Eye, accent: "from-blue-500 to-cyan-500",
    title: "AI Scans Every Listing",
    text: "Our engine evaluates each job across 8 criteria: salary transparency, company reputation, scam risk, description quality, and more.",
    proof: "8 criteria analysed",
  },
  {
    icon: BarChart3, accent: "from-violet-500 to-indigo-500",
    title: "Quality Score 0 – 10",
    text: "You instantly see which jobs are worth your time. High scores mean verified companies, fair salaries, and clear requirements.",
    proof: "Transparent 0–10 scale",
  },
  {
    icon: Lock, accent: "from-emerald-500 to-teal-500",
    title: "Scam Detection Built-In",
    text: "Suspicious patterns? AI flags them automatically. No more wasting hours researching whether a posting is real.",
    proof: "Auto-flagged risks",
  },
  {
    icon: Target, accent: "from-amber-500 to-orange-500",
    title: "Semantic Search",
    text: 'Describe your ideal role in plain English — "remote ML engineer at a crypto startup" — and let AI find the matches.',
    proof: "Natural language queries",
  },
]

const CATEGORIES = [
  { label: "Remote Jobs",          query: "remote",               icon: Globe,      count: "450+", accent: "from-blue-500 to-cyan-500" },
  { label: "AI & ML Jobs",         query: "ai+machine+learning",  icon: Brain,      count: "210+", accent: "from-violet-500 to-indigo-500" },
  { label: "Crypto Jobs",          query: "crypto",               icon: DollarSign, count: "180+", accent: "from-amber-500 to-orange-500" },
  { label: "Web3 Jobs",            query: "web3",                 icon: Rocket,     count: "120+", accent: "from-fuchsia-500 to-pink-500" },
  { label: "Data Science",         query: "data+scientist",       icon: Database,   count: "90+",  accent: "from-emerald-500 to-teal-500" },
  { label: "Blockchain Developer", query: "blockchain+developer", icon: Code,       count: "75+",  accent: "from-sky-500 to-blue-500" },
  { label: "Smart Contracts",      query: "solidity",             icon: Cpu,        count: "60+",  accent: "from-rose-500 to-red-500" },
  { label: "DevOps & Infra",       query: "devops",               icon: Laptop,     count: "55+",  accent: "from-slate-500 to-gray-600" },
]

const POPULAR_ROLES = [
  { label: "Smart Contract Developer",   query: "smart+contract+developer" },
  { label: "Machine Learning Engineer",  query: "machine+learning+engineer" },
  { label: "Data Scientist (Crypto)",    query: "data+scientist+crypto" },
  { label: "Web3 Frontend Developer",    query: "web3+frontend" },
  { label: "DevOps (Blockchain)",        query: "devops+blockchain" },
  { label: "Solidity Developer",         query: "solidity+developer" },
  { label: "AI Research Engineer",       query: "ai+research+engineer" },
  { label: "DeFi Protocol Engineer",     query: "defi+engineer" },
]

function PerspectiveGrid({ variant = "light" }: { variant?: "light" | "dark" }) {
  const stroke = variant === "dark" ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.07)"
  const fadeFrom = variant === "dark" ? "rgb(17,24,39)" : "rgb(248,250,252)"

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg
        className="absolute w-[200%] h-[200%] -left-1/2 -top-1/4"
        style={{
          transform: "perspective(600px) rotateX(60deg)",
          transformOrigin: "center top",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${variant}`} width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke={stroke} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${variant})`} />
      </svg>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${fadeFrom}00 30%, ${fadeFrom} 85%)`,
        }}
      />
    </div>
  )
}

export default async function Home() {
  const data = await getLandingData()
  const recentJobs = data.recent_jobs.filter((j) => Boolean(j.slug?.trim()))

  const statValues: { value: number; suffix: string; label: string }[] = [
    { value: data.stats.total_vacancies || 800, suffix: "+", label: "Active Jobs" },
    { value: data.stats.total_companies || 300, suffix: "+", label: "Companies" },
    { value: 24, suffix: "/7", label: "AI Monitoring" },
    { value: 10, suffix: ".0", label: "Score System" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[70%] h-[70%] bg-gradient-to-tr from-blue-500/5 via-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-10 pb-16">
          <PerspectiveGrid />

          {/* Soft colour wash behind the headline */}
          <div
            aria-hidden="true"
            className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[90%] max-w-[1100px] h-[420px] pointer-events-none"
            style={{
              background:
                "radial-gradient(closest-side, rgba(139,92,246,0.16), rgba(236,72,153,0.08) 55%, transparent 75%)",
              filter: "blur(30px)",
            }}
          />

          {/* Dotted pattern overlay */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none hero-dots opacity-70" />

          <FloatingCards jobs={recentJobs} />

          <div className="text-center max-w-5xl mx-auto relative z-10">
            {/* Live ticker */}
            <div
              className="hero-rise inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-gray-200/80 bg-white/80 backdrop-blur-md shadow-[0_4px_20px_-8px_rgba(99,102,241,0.2)]"
              style={{ animationDelay: "0s" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700">
                Live
              </span>
              <span className="h-3 w-px bg-gray-300" />
              <span className="text-xs text-gray-600">
                <span className="font-bold text-gray-900 tabular-nums">
                  {Math.max(data.stats.total_vacancies, 800).toLocaleString()}
                </span>{" "}
                jobs scored by AI
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-8 text-6xl md:text-7xl lg:text-[104px] font-extrabold tracking-tight leading-[0.95]">
              <span
                className="hero-rise block"
                style={{ animationDelay: "0.08s" }}
              >
                Less searching.
              </span>
              <span
                className="hero-rise block relative mt-2"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="gradient-shimmer bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent inline-block">
                  More landing.
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 12"
                  fill="none"
                  preserveAspectRatio="none"
                  className="absolute left-[6%] right-[6%] -bottom-2 md:-bottom-3 w-[88%] h-3 md:h-4 overflow-visible"
                >
                  <path
                    d="M 4 8 Q 75 0 150 7 T 296 7"
                    stroke="url(#heroSwoosh)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="swoosh-draw"
                    pathLength={100}
                  />
                  <defs>
                    <linearGradient id="heroSwoosh" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p
              className="hero-rise mt-8 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
              style={{ animationDelay: "0.32s" }}
            >
              AI scores every listing across <span className="text-gray-800 font-semibold">8 criteria</span> — salary,
              company, clarity, risk and more. You see only the jobs worth your time.
            </p>

            {/* Search bar */}
            <div
              className="hero-rise mt-10"
              style={{ animationDelay: "0.44s" }}
            >
              <HeroSearch />
            </div>

            {/* CTAs */}
            <div
              className="hero-rise mt-8 flex flex-col sm:flex-row justify-center gap-3"
              style={{ animationDelay: "0.56s" }}
            >
              <Link href="/jobs">
                <Button
                  size="lg"
                  className="btn-shine h-12 px-8 rounded-xl bg-gradient-primary hover:bg-gradient-primary-hover text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Browse All Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/for-recruiters">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 rounded-xl border-gray-300 hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-0.5"
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  For Recruiters
                </Button>
              </Link>
            </div>

            {/* Trust strip */}
            <div
              className="hero-rise mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-gray-500"
              style={{ animationDelay: "0.68s" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                Scam detection built-in
              </span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Updated continuously
              </span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                No ghost jobs, no noise
              </span>
            </div>
          </div>
        </section>

        <section className="relative py-24 px-6 overflow-hidden border-y border-gray-200/70 bg-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99,102,241,0.07), transparent 70%)",
            }}
          />

          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-5">
                <span className="h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-700">
                  By the numbers
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
                Aipplify,{" "}
                <span className="gradient-shimmer bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  measured
                </span>
                .
              </h2>
            </div>

            {/* Stats panel */}
            <div className="relative rounded-3xl border border-gray-200/70 bg-white/70 backdrop-blur-sm shadow-[0_30px_80px_-40px_rgba(99,102,241,0.4)] overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent"
              />
              <div
                aria-hidden="true"
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-[70%] h-48 rounded-full blur-3xl opacity-60 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(139,92,246,0.25), transparent 70%)",
                }}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200/70">
                {statValues.map((stat, i) => (
                  <div key={i} className="relative text-center p-8 md:p-10">
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-[0_0_14px_rgba(139,92,246,0.7)]"
                    />
                    <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent tabular-nums leading-none">
                      <AnimatedCounter
                        target={stat.value}
                        suffix={stat.suffix}
                        initial={stat.value}
                      />
                    </div>
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {data.companies.length > 0 && (
              <div className="mt-16">
                <div className="flex items-center gap-4 mb-10">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-gray-200" />
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm">
                    <div className="flex -space-x-1.5">
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 rounded-full ring-2 ring-white bg-gradient-to-br from-indigo-500 to-purple-500"
                      />
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 rounded-full ring-2 ring-white bg-gradient-to-br from-purple-500 to-fuchsia-500"
                      />
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 rounded-full ring-2 ring-white bg-gradient-to-br from-fuchsia-500 to-pink-500"
                      />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-700">
                      Trusted by {data.companies.length.toLocaleString()}+ teams
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 to-gray-200" />
                </div>

                <div className="fade-edges">
                  <CompaniesMarquee companies={data.companies} />
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="py-28 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" />
          <PerspectiveGrid variant="dark" />

          {/* Soft purple top spotlight */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] pointer-events-none"
            style={{
              background:
                "radial-gradient(closest-side, rgba(139,92,246,0.35), rgba(236,72,153,0.15) 60%, transparent 75%)",
              filter: "blur(40px)",
            }}
          />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
                </span>
                <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-indigo-200/90">
                  The Platform
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-5">
                Why{" "}
                <span className="gradient-shimmer bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Aipplify
                </span>
                ?
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                Not just another job board. AI analyzes every listing end-to-end — so you spend time
                applying, not filtering noise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:auto-rows-[240px]">
              {/* HERO — AI Scoring (2×2) */}
              <div className="beam-border rounded-2xl p-[1px] lg:col-span-2 lg:row-span-2 group">
                <div className="relative h-full w-full rounded-[15px] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 p-8 overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="absolute -top-32 -right-20 w-80 h-80 rounded-full blur-3xl opacity-40"
                    style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.55), transparent 70%)" }}
                  />

                  <div className="relative z-10 flex items-start justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.25em] uppercase text-indigo-300/90 mb-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Live Analysis
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        AI-Powered Scoring
                      </h3>
                      <p className="text-gray-400 max-w-md leading-relaxed">
                        Every listing is evaluated across 8 criteria — salary, company, clarity,
                        risk and more — and ranked <span className="text-indigo-300">0&nbsp;to&nbsp;10</span>.
                      </p>
                    </div>
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-[0_12px_40px_-10px_rgba(139,92,246,0.75)] ring-1 ring-white/10">
                      <Bot className="h-7 w-7 text-white" />
                    </div>
                  </div>

                  {/* Demo — analyzed jobs */}
                  <div className="relative z-10 space-y-2.5 mt-7">
                    {[
                      { title: "Senior ML Engineer · Anthropic", score: "9.4", accent: "from-emerald-400 to-teal-400", w: "94%", delay: "0s" },
                      { title: "Product Designer · Figma",      score: "8.7", accent: "from-violet-400 to-indigo-400", w: "87%", delay: "0.25s" },
                      { title: "Blockchain Developer · Remote", score: "7.1", accent: "from-amber-400 to-orange-400", w: "71%", delay: "0.5s" },
                      { title: "DevOps Engineer · Stripe",      score: "9.1", accent: "from-fuchsia-400 to-pink-400",  w: "91%", delay: "0.75s" },
                    ].map((j, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-200 truncate font-medium">{j.title}</p>
                          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${j.accent} score-bar`}
                              style={{
                                ["--w" as string]: j.w,
                                animationDelay: j.delay,
                              } as React.CSSProperties}
                            />
                          </div>
                        </div>
                        <div className="text-right tabular-nums">
                          <div className="text-xl font-bold bg-gradient-to-br from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                            {j.score}
                          </div>
                          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Score</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Travelling scan line over the demo */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-8 top-40 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent scan-line"
                  />
                </div>
              </div>

              {/* WIDE — Semantic Search (2×1) */}
              <div className="beam-border rounded-2xl p-[1px] lg:col-span-2">
                <div className="relative h-full w-full rounded-[15px] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 p-6 overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30"
                    style={{ background: "radial-gradient(closest-side, rgba(59,130,246,0.6), transparent 70%)" }}
                  />
                  <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Semantic Search</h3>
                      <p className="text-sm text-gray-400">
                        Describe your dream role — AI finds matches by meaning.
                      </p>
                    </div>
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(59,130,246,0.7)] ring-1 ring-white/10">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                    <Search className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-100 font-mono typing-caret">
                      remote ML engineer at a crypto startup
                    </span>
                  </div>

                  <div className="relative z-10 mt-3 flex flex-wrap gap-2">
                    {[
                      { t: "Anthropic", score: "9.4" },
                      { t: "Chainlink", score: "8.9" },
                      { t: "Coinbase",  score: "8.3" },
                    ].map((m) => (
                      <span
                        key={m.t}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[11px] font-medium text-indigo-200"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {m.t} <span className="text-indigo-400/80">· {m.score}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SMALL cards — remaining features */}
              {FEATURES.slice(2).map((f, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-0.5"
                >
                  {/* Hover spotlight from top */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(260px 180px at 50% 0%, rgba(139,92,246,0.22), transparent 70%)",
                    }}
                  />
                  {/* Accent corner glow */}
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute -bottom-16 -right-16 w-36 h-36 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br ${f.accent}`}
                  />

                  <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                    <div>
                      <div
                        className={`h-11 w-11 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(139,92,246,0.5)] ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300 mb-4`}
                      >
                        <f.icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-white mb-1.5">{f.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-medium mt-3">
                      {f.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-28 px-6 overflow-hidden bg-gradient-to-b from-indigo-50/60 via-purple-50/30 to-white">
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"
            aria-hidden="true"
          />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-200/70 shadow-sm mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-700">
                  How It Works
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-[1.05]">
                From listing to landing —
                <span className="block mt-2">
                  in{" "}
                  <span className="gradient-shimmer bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                    four smart steps
                  </span>
                  .
                </span>
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                Aipplify is the first AI-powered job board dedicated to artificial intelligence, cryptocurrency and Web3 careers.
                Every listing is analysed automatically so you apply only to quality opportunities.
              </p>
            </div>

            {/* Steps path */}
            <div className="relative mb-20">
              {/* Flowing connector line behind numbered markers (desktop only) */}
              <div
                aria-hidden="true"
                className="hidden lg:block path-flow absolute top-0 left-[12.5%] right-[12.5%] h-[2px] -translate-y-1/2 rounded-full opacity-70"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 pt-6">
                {SEO_STEPS.map((s, i) => (
                  <div key={i} className="relative group">
                    {/* Numbered circle atop the card */}
                    <div
                      className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-gradient-to-br ${s.accent} flex items-center justify-center text-white font-bold text-lg shadow-[0_10px_30px_-8px_rgba(139,92,246,0.55)] ring-4 ring-white group-hover:scale-110 transition-transform duration-300`}
                    >
                      {i + 1}
                    </div>

                    {/* Card */}
                    <div className="relative h-full bg-white rounded-2xl border border-gray-200 p-6 pt-10 hover:shadow-[0_20px_50px_-20px_rgba(99,102,241,0.35)] hover:border-indigo-200 transition-all duration-500">
                      {/* hover spotlight */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background:
                            "radial-gradient(260px 200px at 50% 0%, rgba(99,102,241,0.08), transparent 70%)",
                        }}
                      />

                      <div
                        className={`mx-auto h-11 w-11 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-4 shadow-md ring-1 ring-white/60`}
                      >
                        <s.icon className="h-5 w-5 text-white" />
                      </div>

                      <h3 className="text-base font-bold text-gray-900 mb-2 text-center">
                        {s.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed text-center">
                        {s.text}
                      </p>

                      <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                          {s.proof}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular roles panel */}
            <div className="relative rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-sm p-8 md:p-10 overflow-hidden shadow-[0_30px_80px_-40px_rgba(99,102,241,0.3)]">
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-40 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(139,92,246,0.35), transparent 70%)",
                }}
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(236,72,153,0.3), transparent 70%)",
                }}
              />

              <div className="relative grid lg:grid-cols-[320px_1fr] gap-8 lg:gap-10 items-start">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-700 text-[11px] font-semibold uppercase tracking-[0.25em] mb-4">
                    <Target className="h-3.5 w-3.5" />
                    Popular Roles
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight leading-tight">
                    Every serious tech role we track
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    From blockchain engineers to ML scientists. 100+ skill categories, smart filters
                    and semantic search.
                  </p>
                  <Link
                    href="/jobs"
                    className="group/link mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Browse all categories
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                  {POPULAR_ROLES.map((r) => (
                    <Link
                      key={r.label}
                      href={`/jobs?search=${r.query}`}
                      className="group/chip inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gradient-to-br from-white to-gray-50 text-sm font-medium text-gray-700 hover:border-indigo-300 hover:from-indigo-50/70 hover:to-white hover:text-indigo-700 hover:shadow-sm transition-all"
                    >
                      {r.label}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover/chip:opacity-100 group-hover/chip:translate-x-0 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              <p className="relative text-xs text-gray-400 mt-8 leading-relaxed max-w-4xl">
                Whether you&apos;re looking for remote AI jobs, crypto internships or senior Web3 positions,
                Aipplify&apos;s semantic search and smart filters help you find the perfect match.
                Join thousands of tech professionals who use Aipplify to advance their careers in decentralized tech.
              </p>
            </div>
          </div>
        </section>

        <section className="relative py-24 px-6 overflow-hidden bg-gray-50/80">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.05), transparent 70%)",
            }}
          />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-5">
                <span className="h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-700">
                  Categories
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05] mb-4">
                Pick your{" "}
                <span className="gradient-shimmer bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  lane
                </span>
                .
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto text-lg">
                From AI and ML to Web3 and DeFi — here are the hottest tracks we&apos;re seeing right now.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={`/jobs?search=${cat.query}`}
                  className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-indigo-200 transition-all duration-500 hover:-translate-y-0.5"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(220px 180px at 50% 0%, rgba(99,102,241,0.09), transparent 70%)",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute -bottom-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br ${cat.accent}`}
                  />

                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className={`h-11 w-11 rounded-xl bg-gradient-to-br ${cat.accent} flex items-center justify-center shadow-[0_10px_24px_-8px_rgba(99,102,241,0.45)] ring-1 ring-white/60 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <cat.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-extrabold bg-gradient-to-br ${cat.accent} bg-clip-text text-transparent tabular-nums leading-none`}
                        >
                          {cat.count}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-1 font-semibold">
                          jobs
                        </div>
                      </div>
                    </div>
                    <p className="text-base font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {cat.label}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-gray-400 group-hover:text-indigo-600 transition-colors">
                      Explore
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {recentJobs.length > 0 && (
          <section className="relative py-24 px-6 overflow-hidden bg-white">
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 55% 40% at 50% 0%, rgba(236,72,153,0.05), transparent 70%)",
              }}
            />
            <div className="relative max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 mb-5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-700">
                      Live Feed
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
                    Freshest jobs,
                    <br className="hidden sm:block" />{" "}
                    <span className="gradient-shimmer bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                      already scored
                    </span>
                    .
                  </h2>
                  <p className="mt-4 text-gray-500 text-lg max-w-xl">
                    New listings arrive continuously. AI scores, verifies and routes them to your feed.
                  </p>
                </div>

                <Link
                  href="/jobs"
                  className="group hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm text-sm font-semibold text-gray-700 hover:text-indigo-700 transition-all shrink-0 whitespace-nowrap"
                >
                  View all jobs
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* SEO-friendly list of latest jobs — indexable by crawlers and visible with JS off */}
              <ul className="sr-only">
                {recentJobs.slice(0, 12).map((j) => (
                  <li key={`seo-${j.id}`}>
                    <Link href={`/jobs/${encodeURIComponent(j.slug.trim())}`}>
                      {j.title} at {j.company_name}
                    </Link>
                  </li>
                ))}
              </ul>

              <JobColumnsMarquee jobs={recentJobs} />

              <div className="md:hidden mt-10 flex justify-center">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:text-indigo-700 hover:border-indigo-300 transition-all"
                >
                  View all jobs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-3xl py-16 px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgY3g9IjMwIiBjeT0iMzAiIHI9IjEiLz48L2c+PC9zdmc+')] opacity-50" aria-hidden="true" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to find your next opportunity?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join hundreds of professionals who found their dream job through AI-powered matching
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/jobs">
                  <Button size="lg" className="h-12 px-8 rounded-xl bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                    Browse Jobs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/for-recruiters">
                  <Button size="lg" className="h-12 px-8 rounded-xl bg-white/15 border-2 border-white/50 text-white hover:bg-white/25 font-semibold backdrop-blur-sm">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Post a Job
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
