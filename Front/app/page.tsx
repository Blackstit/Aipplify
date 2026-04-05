"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Footer } from "@/components/Footer"
import { ScoreBadge } from "@/components/ScoreBadge"
import { CompanyLogo } from "@/components/CompanyLogo"
import type { JobFrontend } from "@/lib/jobs"
import {
  ArrowRight, Briefcase, Search, Sparkles, Zap, TrendingUp,
  Shield, Users, Globe, Bot, ChevronRight, Loader2,
  Brain, Code, Cpu, Database, Laptop, Rocket, Target, BarChart3,
  Lock, Eye, DollarSign, Award,
} from "lucide-react"
import { companySlug } from "@/lib/companies"

interface LandingCompany {
  name: string
  logo_url: string
  industry: string | null
  job_count: number
}

interface LandingJob {
  id: string
  slug: string
  title: string
  company_name: string
  salary_min: number | null
  salary_max: number | null
  location_type: string | null
  ai_score: number | null
}

interface LandingData {
  stats: { total_vacancies: number; total_companies: number }
  companies: LandingCompany[]
  recent_jobs: LandingJob[]
}

function parseLandingJson(json: unknown): LandingData | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null
  const o = json as Record<string, unknown>
  const stats = o.stats
  if (!stats || typeof stats !== "object" || Array.isArray(stats)) return null
  const s = stats as Record<string, unknown>
  if (typeof s.total_vacancies !== "number" || typeof s.total_companies !== "number") return null
  if (!Array.isArray(o.companies) || !Array.isArray(o.recent_jobs)) return null
  return json as LandingData
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, visible } = useInView()
  useEffect(() => {
    if (!visible) return
    const duration = 1500
    const steps = 40
    const inc = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += inc
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [visible, target])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

function MarqueeRow({ companies, direction = "left", speed = 30 }: {
  companies: LandingCompany[]; direction?: "left" | "right"; speed?: number
}) {
  if (companies.length === 0) return null
  const doubled = [...companies, ...companies]
  const dur = companies.length * speed

  return (
    <div className="relative overflow-hidden py-3 group">
      <div
        className={`flex gap-6 w-max ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ animationDuration: `${dur}s` }}
      >
        {doubled.map((c, i) => (
          <Link
            key={`${c.name}-${i}`}
            href={`/companies/${companySlug(c.name)}`}
            className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all shrink-0"
          >
            <CompanyLogo logo={c.logo_url} name={c.name} size={32} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{c.name}</p>
              <p className="text-[11px] text-gray-400">{c.job_count} jobs</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function stableUnit(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function FloatingCards({ jobs }: { jobs: LandingJob[] }) {
  if (jobs.length === 0) return null
  const positions = [
    { top: 8, left: 2 }, { top: 55, left: 5 }, { top: 28, left: 78 },
    { top: 72, left: 82 }, { top: 15, left: 65 }, { top: 68, left: 22 },
    { top: 38, left: 88 }, { top: 82, left: 55 }, { top: 5, left: 42 },
    { top: 45, left: -3 },
  ]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {jobs.slice(0, 10).map((job, i) => {
        const pos = positions[i % positions.length]
        const h = hashString(job.id)
        const delay = stableUnit(h + i * 1337) * 8
        const dur = 10 + stableUnit(h + i * 7331) * 8
        return (
          <div
            key={`${job.id}-${i}`}
            className="absolute opacity-0 animate-float-card"
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              animationDelay: `${delay.toFixed(1)}s`,
              animationDuration: `${dur.toFixed(1)}s`,
            }}
          >
            <div className="bg-white/50 backdrop-blur-md border border-gray-200/30 rounded-xl px-3.5 py-2 shadow-sm max-w-[190px]">
              <p className="text-[11px] font-medium text-gray-600 truncate">{job.title}</p>
              <p className="text-[10px] text-gray-400 truncate">{job.company_name}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PerspectiveGrid({ variant = "light" }: { variant?: "light" | "dark" }) {
  const stroke = variant === "dark" ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.07)"
  const fadeFrom = variant === "dark" ? "rgb(17,24,39)" : "rgb(248,250,252)"

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<{ type: string; text: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiMode, setAiMode] = useState(false)
  const [aiResults, setAiResults] = useState<LandingJob[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (aiMode || !query || query.length < 2) { setSuggestions([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/jobs/search-suggestions?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.suggestions || [])
        }
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [query, aiMode])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    if (aiMode) {
      setAiLoading(true)
      try {
        const res = await fetch(`/api/jobs?limit=5&search=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          const jobs = (data.jobs || []) as JobFrontend[]
          setAiResults(
            jobs.map((j) => ({
              id: j.id,
              slug: j.slug,
              title: j.title,
              company_name: j.company.name,
              salary_min: j.salaryMin ?? null,
              salary_max: j.salaryMax ?? null,
              location_type: j.workType,
              ai_score: null,
            }))
          )
        }
      } catch {}
      setAiLoading(false)
    } else {
      router.push(`/jobs?search=${encodeURIComponent(query)}`)
    }
  }, [query, aiMode, router])

  const handleSelect = (text: string) => {
    setQuery(text)
    setShowSuggestions(false)
    router.push(`/jobs?search=${encodeURIComponent(text)}`)
  }

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder={aiMode ? "Describe your ideal job in natural language..." : "Job title, skill, or company..."}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
            className="pl-12 h-14 text-base rounded-xl border-gray-300 bg-white/90 backdrop-blur-sm shadow-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={aiLoading}
          size="lg"
          className="h-14 px-6 rounded-xl bg-gradient-primary hover:bg-gradient-primary-hover text-white shadow-lg"
        >
          {aiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          type="button"
          onClick={() => { setAiMode(!aiMode); setAiResults([]) }}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all px-3 py-1 rounded-full ${
            aiMode ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-primary"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Search
        </button>
        <span className="text-gray-300">|</span>
        <div className="flex gap-2">
          {["React Developer", "Product Manager", "Data Analyst"].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSelect(q)}
              className="text-xs text-gray-400 hover:text-primary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && !aiMode && (
        <div className="absolute top-16 left-0 right-12 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(s.text)}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
            >
              {s.type === "job"
                ? <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                : <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />}
              <span className="text-gray-800">{s.text}</span>
            </button>
          ))}
        </div>
      )}

      {aiMode && aiResults.length > 0 && (
        <div className="absolute top-16 left-0 right-12 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
          <p className="px-4 py-1 text-xs text-gray-400">AI results</p>
          {aiResults.map((j) => (
            <Link
              key={j.id}
              href={`/jobs/${j.slug}`}
              className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-gray-900 truncate block">{j.title}</span>
                  <span className="text-xs text-gray-500">{j.company_name}</span>
                </div>
                <ScoreBadge score={j.ai_score} size="sm" />
              </div>
            </Link>
          ))}
          <Link
            href={`/jobs?search=${encodeURIComponent(query)}`}
            className="block px-4 py-2 text-xs text-primary hover:bg-gray-50 font-medium"
          >
            View all results &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}

function JobCard({ job }: { job: LandingJob }) {
  const salaryText = job.salary_min && job.salary_max
    ? `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`
    : job.salary_max
      ? `Up to $${(job.salary_max / 1000).toFixed(0)}k`
      : null

  return (
    <Link
      href={`/jobs/${encodeURIComponent(job.slug.trim())}`}
      className="block p-4 rounded-xl border border-gray-200/80 bg-white hover:border-primary/30 hover:shadow-lg transition-all group shrink-0"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{job.title}</p>
        <ScoreBadge score={job.ai_score} size="sm" />
      </div>
      <p className="text-xs text-gray-500 mb-2 truncate">{job.company_name}</p>
      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        {salaryText && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{salaryText}</span>}
        {job.location_type && <span className="capitalize">{job.location_type}</span>}
      </div>
    </Link>
  )
}

function JobColumnsMarquee({ jobs }: { jobs: LandingJob[] }) {
  const cols = 4
  const columns: LandingJob[][] = Array.from({ length: cols }, () => [])
  jobs.forEach((j, i) => columns[i % cols].push(j))
  for (const col of columns) {
    if (col.length === 0) continue
    while (col.length < 4) {
      const take = Math.min(4 - col.length, col.length)
      col.push(...col.slice(0, take))
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-[420px] overflow-hidden relative">
      {columns.map((col, ci) => {
        if (col.length === 0) return null
        const direction = ci % 2 === 0 ? "up" : "down"
        const doubled = [...col, ...col]
        const dur = 20 + ci * 5
        return (
          <div key={ci} className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
            <div
              className={`flex flex-col gap-3 ${direction === "up" ? "animate-scroll-up" : "animate-scroll-down"}`}
              style={{ animationDuration: `${dur}s` }}
            >
              {doubled.map((job, ji) => (
                <JobCard key={`${job.id}-${ji}`} job={job} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

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
]

const SEO_STEPS = [
  {
    icon: Eye,
    accent: "from-blue-500 to-cyan-500",
    title: "AI Scans Every Listing",
    text: "Our engine evaluates each job across 8 criteria: salary transparency, company reputation, scam risk, description quality, and more.",
  },
  {
    icon: BarChart3,
    accent: "from-violet-500 to-indigo-500",
    title: "Quality Score 0 – 10",
    text: "You instantly see which jobs are worth your time. High scores mean verified companies, fair salaries, and clear requirements.",
  },
  {
    icon: Lock,
    accent: "from-emerald-500 to-teal-500",
    title: "Scam Detection Built-In",
    text: "Suspicious patterns? AI flags them automatically. No more wasting hours researching whether a posting is real.",
  },
  {
    icon: Target,
    accent: "from-amber-500 to-orange-500",
    title: "Semantic Search",
    text: 'Describe your ideal role in plain English — "remote ML engineer at a crypto startup" — and let AI find the matches.',
  },
]

const CATEGORIES = [
  { label: "Remote Jobs",          query: "remote",               icon: Globe,    count: "450+" },
  { label: "AI & ML Jobs",         query: "ai+machine+learning",  icon: Brain,    count: "210+" },
  { label: "Crypto Jobs",          query: "crypto",               icon: DollarSign, count: "180+" },
  { label: "Web3 Jobs",            query: "web3",                 icon: Rocket,   count: "120+" },
  { label: "Data Science",         query: "data+scientist",       icon: Database, count: "90+" },
  { label: "Blockchain Developer", query: "blockchain+developer", icon: Code,     count: "75+" },
  { label: "Smart Contracts",      query: "solidity",             icon: Cpu,      count: "60+" },
  { label: "DevOps & Infra",       query: "devops",               icon: Laptop,   count: "55+" },
]

const POPULAR_ROLES = [
  { label: "Smart Contract Developer",  query: "smart+contract+developer" },
  { label: "Machine Learning Engineer",  query: "machine+learning+engineer" },
  { label: "Data Scientist (Crypto)",    query: "data+scientist+crypto" },
  { label: "Web3 Frontend Developer",    query: "web3+frontend" },
  { label: "DevOps (Blockchain)",        query: "devops+blockchain" },
  { label: "Solidity Developer",         query: "solidity+developer" },
  { label: "AI Research Engineer",       query: "ai+research+engineer" },
  { label: "DeFi Protocol Engineer",     query: "defi+engineer" },
]

function SeoContentSection() {
  const steps = useInView(0.1)

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-indigo-50/60 via-purple-50/30 to-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10" ref={steps.ref}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
            <Award className="h-4 w-4" />
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            How Aipplify Helps You Find the Best<br className="hidden sm:block" /> AI, Crypto &amp; Web3 Jobs
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Aipplify is the first AI-powered job board dedicated to artificial intelligence, cryptocurrency, and Web3 careers.
            Every listing is analyzed automatically so you apply only to quality opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {SEO_STEPS.map((s, i) => (
            <div
              key={i}
              className={`group relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-500 ${
                steps.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: steps.visible ? `${i * 100}ms` : "0ms" }}
            >
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Step {i + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1.5">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.text}</p>
                </div>
              </div>
              <div className={`absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br ${s.accent} opacity-0 group-hover:opacity-[0.06] blur-2xl transition-opacity duration-500`} />
            </div>
          ))}
        </div>

        {/* Popular roles with links */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Tech Roles We Fill</h2>
          <p className="text-sm text-gray-500 mb-5">
            From blockchain developers to machine learning engineers — explore 100+ skill categories.
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_ROLES.map((r) => (
              <Link
                key={r.label}
                href={`/jobs?search=${r.query}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
              >
                <ChevronRight className="h-3 w-3" />
                {r.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Whether you&apos;re looking for remote AI jobs, crypto internships, or senior Web3 positions, Aipplify&apos;s semantic search and smart filters help you find the perfect match.
            Join thousands of tech professionals who use Aipplify to advance their careers in decentralized tech.
          </p>
        </div>
      </div>
    </section>
  )
}

function CategoriesSection() {
  const cats = useInView(0.1)

  return (
    <section className="py-20 px-6 bg-gray-50/80" ref={cats.ref}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Browse Jobs by Category</h2>
          <p className="text-gray-500 text-lg">Find exactly what you are looking for</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.label}
              href={`/jobs?search=${cat.query}`}
              className={`group relative bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-500 ${
                cats.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
              style={{ transitionDelay: cats.visible ? `${i * 60}ms` : "0ms" }}
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <cat.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-0.5 group-hover:text-primary transition-colors">{cat.label}</p>
              <p className="text-xs text-gray-400 font-medium">{cat.count} positions</p>
              <ArrowRight className="absolute top-5 right-5 h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [data, setData] = useState<LandingData | null>(null)

  useEffect(() => {
    fetch("/api/landing")
      .then((r) => r.json())
      .then((json) => setData(parseLandingJson(json)))
      .catch(() => setData(null))
  }, [])

  const row1 = data?.companies?.slice(0, 20) ?? []
  const row2 = data?.companies?.slice(20, 40) ?? []
  const recentJobsForMarquee = data?.recent_jobs?.filter((j) => Boolean(j.slug?.trim())) ?? []

  const feat1 = useInView()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[70%] h-[70%] bg-gradient-to-tr from-blue-500/5 via-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <section className="relative min-h-[85vh] flex items-center justify-center px-6">
          <PerspectiveGrid />
          <FloatingCards jobs={data?.recent_jobs || []} />

          <div className="text-center space-y-8 max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
              <Sparkles className="h-4 w-4" />
              AI-Powered Job Board
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Find the job you
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                actually deserve
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
              {data?.stats
                ? <><strong className="text-gray-700">{data.stats.total_vacancies.toLocaleString()}</strong> verified jobs from <strong className="text-gray-700">{data.stats.total_companies.toLocaleString()}</strong> companies. Scored and analyzed by AI.</>
                : <>Hundreds of verified jobs from top companies. Scored and analyzed by AI.</>}
            </p>

            <div>
              <HeroSearch />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/jobs">
                <Button size="lg" className="h-12 px-8 rounded-xl bg-gradient-primary hover:bg-gradient-primary-hover text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  Browse All Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/for-recruiters">
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl border-gray-300 hover:border-primary hover:bg-primary/5 transition-all">
                  <Briefcase className="mr-2 h-4 w-4" />
                  For Recruiters
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {row1.length > 0 && (
          <section className="py-10 border-y border-gray-200/60 bg-gray-50/50">
            <p className="text-center text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
              Trusted by top companies
            </p>
            <MarqueeRow companies={row1} direction="left" speed={35} />
            {row2.length > 0 && <MarqueeRow companies={row2} direction="right" speed={40} />}
          </section>
        )}

        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: data?.stats?.total_vacancies ?? 800, suffix: "+", label: "Active Jobs" },
              { value: data?.stats?.total_companies ?? 300, suffix: "+", label: "Companies" },
              { value: 24, suffix: "/7", label: "AI Monitoring" },
              { value: 10, suffix: ".0", label: "Score System" },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24 px-6 relative" ref={feat1.ref}>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-gray-900" />
          <PerspectiveGrid variant="dark" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-3">Platform</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 text-white">
                Why <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Aipplify</span>?
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto text-lg">
                Not just another job board. AI analyzes every listing so you don&apos;t waste time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">
              {FEATURES.map((f, i) => {
                const span = f.size === "lg" ? "lg:col-span-2" : ""
                return (
                  <div
                    key={i}
                    className={`group relative rounded-2xl overflow-hidden ${span} transition-all duration-700 motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
                      feat1.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    }`}
                    style={{ transitionDelay: feat1.visible ? `${i * 50}ms` : "0ms" }}
                  >
                    <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm" />
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${f.accent}`} style={{ opacity: 0 }} />
                    <div className="absolute inset-[1px] rounded-2xl bg-gray-900/90 group-hover:bg-gray-900/70 transition-colors duration-500" />

                    <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                      <div>
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                          <f.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1.5">{f.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium mt-2">{f.detail}</p>
                    </div>

                    <div className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <SeoContentSection />
        <CategoriesSection />

        {recentJobsForMarquee.length > 0 && (
          <section className="py-20 px-6 overflow-hidden bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold">Latest Jobs</h2>
                <Link href="/jobs" className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <JobColumnsMarquee jobs={recentJobsForMarquee} />
            </div>
          </section>
        )}

        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-3xl py-16 px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgY3g9IjMwIiBjeT0iMzAiIHI9IjEiLz48L2c+PC9zdmc+')] opacity-50" />
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
