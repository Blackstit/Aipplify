"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { CompanyInfo } from "@/lib/companies"
import { CompanyLogo } from "@/components/CompanyLogo"
import {
  Search,
  Building2,
  ChevronDown,
  ArrowRight,
  Briefcase,
} from "lucide-react"

interface Props {
  companies: CompanyInfo[]
}

type SortOption = "jobs" | "name-asc" | "name-desc"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export function CompaniesClient({ companies }: Props) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("jobs")
  const [letterFilter, setLetterFilter] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = [...companies]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.industry && c.industry.toLowerCase().includes(q)),
      )
    }

    if (letterFilter) {
      result = result.filter((c) =>
        c.name.toUpperCase().startsWith(letterFilter),
      )
    }

    switch (sort) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "jobs":
      default:
        result.sort((a, b) => b.jobCount - a.jobCount)
    }

    return result
  }, [companies, search, sort, letterFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Building2 className="h-4 w-4" />
          {companies.length}+ Companies
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Companies Hiring in AI, Crypto &amp; Web3
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore top employers and find your next career opportunity at
          verified companies.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setLetterFilter(null)
            }}
            placeholder="Search companies..."
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm"
          />
        </div>
      </div>

      {/* Alphabet filter + sort */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setLetterFilter(null)}
            className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
              !letterFilter
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-primary"
            }`}
          >
            All
          </button>
          {ALPHABET.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() =>
                setLetterFilter(letterFilter === l ? null : l)
              }
              className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                letterFilter === l
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-9 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="jobs">Most jobs</option>
            <option value="name-asc">A → Z</option>
            <option value="name-desc">Z → A</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No companies found</p>
          <p className="text-gray-400 text-sm mt-1">
            Try a different search or filter
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {filtered.map((company) => (
            <Link
              key={company.slug}
              href={`/companies/${company.slug}`}
              className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <CompanyLogo
                  logo={company.logo}
                  name={company.name}
                  size={48}
                  className="rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                    {company.name}
                  </h2>
                  {company.industry && (
                    <p className="text-xs text-gray-500 truncate">
                      {company.industry}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Briefcase className="h-3 w-3" />
                  {company.jobCount} open{" "}
                  {company.jobCount === 1 ? "position" : "positions"}
                </span>
                <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  View <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
