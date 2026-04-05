"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    q: "How does AI resume screening work?",
    a: "When a candidate applies, our AI compares their resume against your job description using semantic analysis. It scores relevance from 0 to 10 across experience, skills, and seniority fit — so you only review the top 30% of applicants. This saves an average of 5 hours per open role.",
  },
  {
    q: "Can I post remote crypto jobs?",
    a: "Absolutely. Over 80% of jobs on Aipplify are remote positions. You can specify Remote, Hybrid, or Office and target candidates globally or by specific regions (US, EU, Asia).",
  },
  {
    q: "Is there a free trial for recruiters?",
    a: "We don't offer a free trial, but our Starter plan at $29/month lets you test the platform with up to 5 active listings — a fraction of what LinkedIn or Indeed charges for a single promoted listing.",
  },
  {
    q: "How do I know candidates are real?",
    a: "Our AI flags suspicious profiles, bot-generated applications, and duplicate accounts automatically. Enterprise clients also get access to verified candidate identity checks and activity scoring.",
  },
  {
    q: "What types of roles can I hire for?",
    a: "Aipplify specializes in AI, crypto, Web3, and blockchain roles — including Solidity developers, ML engineers, product managers, security auditors, DevOps, and more. If it's tech and touches crypto or AI, our talent pool has it.",
  },
  {
    q: "How is Aipplify different from LinkedIn or Indeed?",
    a: "Unlike generalist boards, we focus exclusively on crypto, Web3, and AI talent. Every listing is AI-scored for quality. Our candidate pool is niche and active — you won't waste time on irrelevant applicants. And our pricing is up to 80% lower.",
  },
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-gray-900 pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-gray-400 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
                )}
              >
                <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
