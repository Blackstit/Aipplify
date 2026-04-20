"use client"

import Link from "next/link"
import { CompanyLogo } from "@/components/CompanyLogo"
import { companySlug } from "@/lib/companies"
import type { LandingCompany } from "@/lib/landing-data"

function MarqueeRow({
  companies,
  direction = "left",
  speed = 30,
}: {
  companies: LandingCompany[]
  direction?: "left" | "right"
  speed?: number
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

export function CompaniesMarquee({ companies }: { companies: LandingCompany[] }) {
  if (companies.length === 0) return null
  const row1 = companies.slice(0, 20)
  const row2 = companies.slice(20, 40)
  return (
    <>
      <MarqueeRow companies={row1} direction="left" speed={35} />
      {row2.length > 0 && <MarqueeRow companies={row2} direction="right" speed={40} />}
    </>
  )
}
