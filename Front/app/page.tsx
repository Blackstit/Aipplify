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
  Shield, Globe, Bot, ChevronRight,
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
]

const SEO_STEPS = [
  {
    icon: Eye, accent: "from-blue-500 to-cyan-500",
    title: "AI Scans Every Listing",
    text: "Our engine evaluates each job across 8 criteria: salary transparency, company reputation, scam risk, description quality, and more.",
  },
  {
    icon: BarChart3, accent: "from-violet-500 to-indigo-500",
    title: "Quality Score 0 – 10",
    text: "You instantly see which jobs are worth your time. High scores mean verified companies, fair salaries, and clear requirements.",
  },
  {
    icon: Lock, accent: "from-emerald-500 to-teal-500",
    title: "Scam Detection Built-In",
    text: "Suspicious patterns? AI flags them automatically. No more wasting hours researching whether a posting is real.",
  },
  {
    icon: Target, accent: "from-amber-500 to-orange-500",
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
        <section className="relative min-h-[85vh] flex items-center justify-center px-6">
          <PerspectiveGrid />
          <FloatingCards jobs={recentJobs} />

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
              {data.stats.total_vacancies > 0 ? (
                <>
                  <strong className="text-gray-700">{data.stats.total_vacancies.toLocaleString()}</strong> verified jobs from{" "}
                  <strong className="text-gray-700">{data.stats.total_companies.toLocaleString()}</strong> companies. Scored and analyzed by AI.
                </>
              ) : (
                <>Hundreds of verified jobs from top companies. Scored and analyzed by AI.</>
              )}
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

        {data.companies.length > 0 && (
          <section className="py-10 border-y border-gray-200/60 bg-gray-50/50">
            <p className="text-center text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
              Trusted by top companies
            </p>
            <CompaniesMarquee companies={data.companies} />
          </section>
        )}

        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {statValues.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} initial={stat.value} />
                </div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24 px-6 relative">
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
                  <div key={i} className={`group relative rounded-2xl overflow-hidden ${span}`}>
                    <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm" />
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${f.accent}`} />
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

        <section className="py-24 px-6 bg-gradient-to-b from-indigo-50/60 via-purple-50/30 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" aria-hidden="true" />

          <div className="max-w-6xl mx-auto relative z-10">
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
                <div key={i} className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-500">
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
                  <div className={`absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br ${s.accent} opacity-0 group-hover:opacity-[0.06] blur-2xl transition-opacity duration-500`} aria-hidden="true" />
                </div>
              ))}
            </div>

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

        <section className="py-20 px-6 bg-gray-50/80">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Browse Jobs by Category</h2>
              <p className="text-gray-500 text-lg">Find exactly what you are looking for</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={`/jobs?search=${cat.query}`}
                  className="group relative bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-500"
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

        {recentJobs.length > 0 && (
          <section className="py-20 px-6 overflow-hidden bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold">Latest Jobs</h2>
                <Link href="/jobs" className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  View all <ChevronRight className="h-4 w-4" />
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
