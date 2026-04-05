import { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/Footer"
import {
  Shield,
  Brain,
  Search,
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  Eye,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Clock,
  Globe,
  Zap,
} from "lucide-react"

export const metadata: Metadata = {
  title: "About Aipplify | AI-Powered Crypto & Web3 Job Board",
  description:
    "Aipplify uses AI to analyze crypto, Web3, and AI jobs for quality & safety. Learn our mission to fix job scams and help you find your next tech role.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Aipplify | AI-Powered Crypto & Web3 Job Board",
    description:
      "Aipplify uses AI to analyze crypto, Web3, and AI jobs for quality & safety. Learn our mission to fix job scams and help you find your next tech role.",
    url: "https://aipplify.com/about",
  },
}

const stats = [
  { value: "950+", label: "Active Jobs", icon: TrendingUp },
  { value: "385+", label: "Trusted Companies", icon: Building2 },
  { value: "10-Point", label: "AI Risk Score", icon: Shield },
  { value: "24/7", label: "AI Monitoring", icon: Eye },
]

const values = [
  {
    icon: Eye,
    title: "Radical Transparency",
    description:
      "Every job listing gets an open, AI-generated quality score. No hidden agendas — you see exactly what our algorithms see. We believe transparency is the antidote to job market fraud.",
  },
  {
    icon: Brain,
    title: "AI-First Approach",
    description:
      "We replace guesswork with data. Our models analyze salary benchmarks, company history, job description quality, and red-flag patterns — all in real time, at scale no human team can match.",
  },
  {
    icon: Heart,
    title: "Community Safety",
    description:
      "Every candidate deserves a safe job search. We flag high-risk listings before you even see them. Your time, data, and career decisions are protected by design.",
  },
]

const trustedCompanies = [
  "Coinbase",
  "Tether",
  "BitMEX",
  "Consensys",
  "Playrix",
  "Chainalysis",
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Shield className="h-4 w-4" />
            AI-Powered Job Board for Web3 &amp; Crypto
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            We Make AI, Crypto &amp; Web3
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Job Search Smarter and Safer
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
            The Web3 and AI job market is growing fast, but so are scams and fake
            listings. Aipplify scores every crypto, blockchain, and AI job for
            quality, salary fairness, and risk — so you can apply with zero
            doubt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all text-base"
            >
              Explore AI-Scored Jobs
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/for-recruiters"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-primary/40 hover:text-primary transition-all text-base"
            >
              Join as a Company
            </Link>
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
              The Problem We Saw in Tech Hiring
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              The crypto and AI job market is booming — but it's also a minefield.
              Candidates waste hours filtering through low-quality listings, and
              companies struggle to stand out among noise.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: AlertTriangle,
                color: "text-rose-500 bg-rose-50",
                title: "1 in 10 Listings Are Fake",
                text: "From phantom jobs to outright scams, the Web3 space has a trust deficit that costs candidates time, data, and sometimes money.",
              },
              {
                icon: DollarSign,
                color: "text-amber-500 bg-amber-50",
                title: "Salary Opacity",
                text: "Most crypto job listings hide compensation details. Candidates apply blind, only to discover the offer is 40% below market rate.",
              },
              {
                icon: Clock,
                color: "text-blue-500 bg-blue-50",
                title: "Hours Wasted on Verification",
                text: "Without reliable signals, job seekers spend hours researching each company. That's time better spent preparing and interviewing.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div
                  className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl ${item.color} mb-5`}
                >
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How Our AI Engine Works ── */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
              Meet the AI Engine Behind Aipplify
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Every single job listing on Aipplify passes through our
              AI-powered scoring pipeline. We analyze 8 quality criteria and
              produce a transparent 0–10 score — before the listing ever reaches
              you.
            </p>
          </div>

          {/* Pipeline visual */}
          <div className="relative mb-16">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-300 to-emerald-200 -translate-y-1/2" />
            <div className="grid md:grid-cols-3 gap-8 relative">
              {[
                {
                  step: "01",
                  icon: Globe,
                  title: "Ingest & Parse",
                  text: "We scan job sources 24/7, extracting structured data from every listing.",
                  gradient: "from-indigo-500 to-indigo-600",
                },
                {
                  step: "02",
                  icon: Brain,
                  title: "8-Criteria Analysis",
                  text: "Our AI evaluates salary fairness, description quality, company legitimacy, red flags, and more.",
                  gradient: "from-purple-500 to-purple-600",
                },
                {
                  step: "03",
                  icon: Shield,
                  title: "Score & Publish",
                  text: "Each job receives a transparent 0–10 AI Quality Score. High-risk listings are flagged instantly.",
                  gradient: "from-emerald-500 to-emerald-600",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center relative"
                >
                  <span className="text-[64px] font-black text-gray-100 absolute top-4 right-6 leading-none select-none">
                    {item.step}
                  </span>
                  <div
                    className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${item.gradient} text-white mb-5`}
                  >
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed relative">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-features */}
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "AI-Powered Risk Detection",
                text: "Automated red-flag scanning catches scam patterns, missing details, and suspicious phrasing before you apply.",
              },
              {
                icon: BarChart3,
                title: "Real-Time Salary Benchmarking",
                text: "We compare stated compensation against market data so you instantly know if an offer is fair.",
              },
              {
                icon: Search,
                title: "Semantic Search Technology",
                text: "Describe your ideal role in natural language. Our AI understands context, not just keywords, using OpenAI embeddings.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex gap-4 p-5 rounded-xl bg-white border border-gray-100"
              >
                <f.icon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {f.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Our Mission: Trust &amp; Transparency
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Our mission is to make hiring in Web3 and AI as reliable as
            traditional tech. We believe in open data, algorithmic
            transparency, and putting candidates first. Every decision we make
            is guided by a simple question:{" "}
            <em className="text-gray-900 font-medium">
              "Does this make the job search safer and fairer?"
            </em>
          </p>
          <p className="text-base text-gray-500 leading-relaxed">
            We're building the most trusted AI job board in the crypto ecosystem
            — one where verified companies meet vetted listings, and every
            candidate can apply with confidence.
          </p>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-14">
            Why Top Companies &amp; Candidates Choose Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                For Candidates
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Apply with confidence to AI-scored listings",
                  "Semantic search finds jobs by meaning, not keywords",
                  "24/7 AI monitoring flags new risks",
                  "Salary transparency on every listing",
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center mb-5">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                For Employers
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Attract top AI & Web3 talent globally",
                  "AI-verified listings boost your credibility",
                  "Featured placements for maximum visibility",
                  "Direct candidate contact tools",
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center mb-5">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-5">
                The Numbers That Define Us
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold">{s.value}</p>
                    <p className="text-xs text-white/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-14">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 mb-6">
                  <v.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {v.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted By ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Trusted by leading Web3 companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {trustedCompanies.map((name) => (
              <span
                key={name}
                className="text-xl font-bold text-gray-300 hover:text-gray-500 transition-colors select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            The Team
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            A global team of AI engineers, data scientists, and crypto natives
            united by one goal: making decentralized hiring safe and
            transparent.
          </p>
          <p className="text-base text-gray-500">
            We combine deep expertise in machine learning, natural language
            processing, and Web3 talent acquisition to build tools that protect
            candidates and empower companies.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-40" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Sparkles className="h-10 w-10 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            Ready to Find Your Next AI or Crypto Role?
          </h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed">
            Stop scrolling through unverified job boards. Start using AI to find
            safe, well-paid, and verified opportunities in Web3, crypto, and
            artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all text-base"
            >
              Browse Jobs Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/for-recruiters"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all text-base"
            >
              Join as a Company
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
