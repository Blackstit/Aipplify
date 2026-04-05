"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  companyName: string
}

function generateFAQs(name: string) {
  return [
    {
      q: `Does ${name} hire remotely?`,
      a: `Many positions at ${name} are remote-friendly. Check individual job listings on Aipplify for location details — each posting specifies whether the role is remote, hybrid, or onsite.`,
    },
    {
      q: `What is the interview process at ${name}?`,
      a: `Interview processes vary by role, but typically include: recruiter screen, technical assessment or take-home, 2-4 rounds of interviews (technical, system design, behavioral), and a final team fit conversation. Preparation tips are available on our blog.`,
    },
    {
      q: `How much does ${name} pay?`,
      a: `Salaries vary by role and seniority. You can see AI-estimated salary ranges on each job listing on Aipplify. Crypto and Web3 companies often include token/equity compensation on top of base salary.`,
    },
    {
      q: `How do I apply to ${name} through Aipplify?`,
      a: `Browse open positions above, click on a role that interests you, review the AI quality score and details, then follow the apply instructions. Every listing includes direct application links or contact information.`,
    },
  ]
}

export function CompanyFAQ({ companyName }: Props) {
  const faqs = generateFAQs(companyName)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

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
                className="w-full flex items-center justify-between px-5 py-4 text-left"
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
                <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
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
