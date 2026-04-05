import { Metadata } from "next"
import { getAllCompanies } from "@/lib/companies"
import { Footer } from "@/components/Footer"
import { CompaniesClient } from "./CompaniesClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "All Companies Hiring AI, Crypto & Web3 Talent | Aipplify",
  description:
    "Browse 395+ companies hiring for AI, Crypto and Web3 roles. See open positions, company reviews, and apply directly.",
  alternates: { canonical: "/companies" },
  openGraph: {
    title: "All Companies Hiring AI, Crypto & Web3 Talent | Aipplify",
    description:
      "Browse 395+ companies hiring for AI, Crypto and Web3 roles.",
    url: "https://aipplify.com/companies",
  },
}

export default async function CompaniesPage() {
  const companies = await getAllCompanies()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <CompaniesClient companies={companies} />

      {/* SEO bottom text */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Find Your Next Role at Top AI and Crypto Companies
          </h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-3">
            <p>
              Aipplify partners with {companies.length}+ trusted companies in the
              artificial intelligence, blockchain, and Web3 space. From industry
              giants to innovative startups, you will find verified job postings
              with AI-scored quality ratings that help you evaluate every
              opportunity before applying.
            </p>
            <p>
              Whether you are a Solidity developer looking for Coinbase careers, a
              machine learning engineer exploring Tether jobs, or a product
              manager interested in crypto companies hiring remotely — our
              AI-powered platform matches you with the right employer. Every
              listing is analyzed across 8 criteria including salary
              transparency, company verification, and risk detection.
            </p>
            <p>
              Top Web3 employers on Aipplify include exchanges, DeFi protocols,
              infrastructure providers, and AI-native startups. Many offer
              remote-first positions, competitive token compensation, and
              cutting-edge technical challenges. Browse the companies above, view
              their open positions, and apply with confidence knowing each role
              has been AI-verified for quality and safety.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
