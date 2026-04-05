import { Metadata } from "next"
import Link from "next/link"
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
  Crown,
  ArrowRight,
  Building2,
  UserPlus,
  FileSearch,
  CheckCircle2,
  ChevronDown,
  Lock,
  Globe,
  BadgeCheck,
} from "lucide-react"
import { FAQSection } from "./FAQSection"

export const metadata: Metadata = {
  title: "Post Crypto & Web3 Jobs with AI | Recruiter Tools | Aipplify",
  description:
    "Post jobs to 950+ active AI, Crypto & Web3 candidates. Use AI resume screening, smart matching, and analytics. Start hiring better talent today.",
  alternates: { canonical: "/for-recruiters" },
  openGraph: {
    title: "Post Crypto & Web3 Jobs with AI | Recruiter Tools | Aipplify",
    description:
      "Post jobs to 950+ active AI, Crypto & Web3 candidates. Use AI resume screening, smart matching, and analytics. Start hiring better talent today.",
    url: "https://aipplify.com/for-recruiters",
  },
}

const features = [
  {
    icon: Sparkles,
    title: "AI Job Matching",
    benefit:
      "We automatically find candidates whose skills match your requirements. No more scrolling through irrelevant resumes — our algorithm does the filtering for you.",
  },
  {
    icon: Target,
    title: "Smart Targeting",
    benefit:
      "Reach candidates by exact skill stack, seniority, location, and salary expectations. Precision targeting means fewer wasted interviews and faster closes.",
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    benefit:
      "Get real-time alerts when a high-match candidate applies or enters the platform. Be the first company to reach out — speed wins in Web3 hiring.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    benefit:
      "Track views, clicks, applications, and conversion rates for every listing. Data-driven hiring means you know exactly what's working and what to improve.",
  },
  {
    icon: Bot,
    title: "AI Resume Screening",
    benefit:
      "Our AI scores each resume 0–10 based on your job description. Only see the top 30% of candidates — saving hours of manual review per role.",
  },
  {
    icon: Mail,
    title: "Direct Contact",
    benefit:
      "Message candidates directly without intermediaries or third-party fees. Build relationships from the first touchpoint — no middlemen.",
  },
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
      "Up to 100 applications/month",
    ],
    popular: false,
    cta: "Get Started",
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
      "Direct candidate contact",
    ],
    popular: true,
    cta: "Try Now",
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
      "Custom analytics & reports",
      "Unlimited applications",
      "Featured + Verified badge",
      "API integration",
      "White label option",
    ],
    popular: false,
    cta: "Contact Us",
  },
]

const roles = [
  { label: "Smart Contract Developer", query: "smart contract developer" },
  { label: "Machine Learning Engineer", query: "machine learning engineer" },
  { label: "Solidity Developer", query: "solidity developer" },
  { label: "Data Scientist (Crypto)", query: "data scientist crypto" },
  { label: "DevOps (Blockchain)", query: "devops blockchain" },
  { label: "Web3 Frontend", query: "web3 frontend" },
  { label: "Rust Developer", query: "rust developer" },
  { label: "Product Manager (DeFi)", query: "product manager defi" },
  { label: "Security Auditor", query: "security auditor" },
  { label: "Full-Stack (Node + React)", query: "full stack node react" },
]

const trustedCompanies = [
  "Coinbase",
  "Tether",
  "BitMEX",
  "Consensys",
  "Playrix",
  "Chainalysis",
]

export default function ForRecruitersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Building2 className="h-4 w-4" />
            For Recruiters &amp; Hiring Teams
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Hire Top AI, Crypto &amp; Web3
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Talent Faster with AI
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
            Post jobs, get AI-scored resumes, and hire in days — not months.
            Trusted by 385+ companies in crypto, blockchain, and artificial
            intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ScrollToPricingButton className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all text-base">
              View Plans &amp; Pricing
            </ScrollToPricingButton>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-primary/40 hover:text-primary transition-all text-base"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trusted By ── */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Trusted by 385+ Companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
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

      {/* ── 3 Steps ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Start Hiring on Aipplify in 3 Steps
            </h2>
            <p className="text-lg text-gray-600">
              From sign-up to your first qualified candidate — it takes minutes,
              not weeks.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: UserPlus,
                title: "Create Account",
                text: "Sign up in 30 seconds. Choose a plan that fits your hiring volume — from startups to enterprise.",
                gradient: "from-indigo-500 to-indigo-600",
              },
              {
                step: "02",
                icon: FileSearch,
                title: "Post Job with AI Scoring",
                text: "Publish your listing and our AI automatically verifies it, scores it for quality, and optimizes visibility.",
                gradient: "from-purple-500 to-purple-600",
              },
              {
                step: "03",
                icon: Users,
                title: "Get Matched Candidates",
                text: "AI finds and ranks the best-fit candidates from our talent pool. Review scored resumes and contact directly.",
                gradient: "from-emerald-500 to-emerald-600",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center relative"
              >
                <span className="text-[72px] font-black text-gray-50 absolute top-3 right-5 leading-none select-none">
                  {s.step}
                </span>
                <div
                  className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${s.gradient} text-white mb-5`}
                >
                  <s.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed relative">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (with benefits) ── */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All Tools for Effective Recruitment
            </h2>
            <p className="text-lg text-gray-600">
              Every feature is designed to save you time and deliver better
              hires.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {f.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pricing Plans for Every Team Size
            </h2>
            <p className="text-lg text-gray-600">
              AI-powered hiring at a fraction of the cost. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 flex flex-col relative ${
                  plan.popular
                    ? "border-primary border-2 shadow-lg shadow-primary/10"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                      <Crown className="h-3.5 w-3.5" />
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 ml-1.5 text-sm">
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="mt-auto block">
                  <button
                    type="button"
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                      plan.popular
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                        : "border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">
            Compared to LinkedIn Recruiter ($600+/mo), our AI-powered plans{" "}
            <span className="font-semibold text-primary">
              save you up to 80%
            </span>{" "}
            on hiring Web3 and crypto talent.
          </p>
        </div>
      </section>

      {/* ── Popular Roles ── */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              We Help You Fill Critical Tech Roles
            </h2>
            <p className="text-lg text-gray-600">
              Our candidates specialize in the most in-demand Web3, crypto, and
              AI positions.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {roles.map((r) => (
              <Link
                key={r.label}
                href={`/jobs?search=${encodeURIComponent(r.query)}`}
                className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary hover:shadow-sm transition-all"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Safety for Recruiters ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Safety for Recruiters
            </h2>
            <p className="text-lg text-gray-600">
              In the crypto space, trust matters on both sides. We protect
              recruiters too.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "No Fake Candidates",
                text: "AI flags suspicious profiles, duplicate accounts, and bot-generated applications before they reach your inbox.",
              },
              {
                icon: BadgeCheck,
                title: "Verified Company Badge",
                text: "Enterprise plan companies get a Verified badge — boosting trust with top-tier candidates and improving response rates.",
              },
              {
                icon: Lock,
                title: "Secure Payments & Data",
                text: "All transactions are encrypted. Candidate data is handled under strict privacy policies — no data resale, ever.",
              },
            ].map((s) => (
              <div key={s.title} className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
                  <s.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <FAQSection />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-40" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Sparkles className="h-10 w-10 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            Ready to Find Your Next Star Employee?
          </h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed">
            Stop competing on outdated job boards. Start using AI to attract
            top-tier crypto, Web3, and AI talent — faster and cheaper than
            anywhere else.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/recruiter/jobs/new"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all text-base"
            >
              Post a Job Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all text-base"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
