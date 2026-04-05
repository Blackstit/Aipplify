"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { BlogPost } from "@/lib/mockBlog"
import { BlogCard } from "@/components/BlogCard"
import { Search, ChevronDown, ArrowRight, BookOpen, TrendingUp, Mail } from "lucide-react"

interface Props {
  posts: BlogPost[]
  categories: string[]
  initialCategory?: string
  initialSearch?: string
}

type SortOption = "newest" | "oldest"

const POSTS_PER_PAGE = 9

export function BlogListClient({
  posts,
  categories,
  initialCategory,
  initialSearch,
}: Props) {
  const [search, setSearch] = useState(initialSearch || "")
  const [category, setCategory] = useState(initialCategory || "All")
  const [sort, setSort] = useState<SortOption>("newest")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = [...posts]

    if (category !== "All") {
      result = result.filter((p) => p.category === category)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    result.sort((a, b) => {
      const da = new Date(a.publishedAt).getTime()
      const db = new Date(b.publishedAt).getTime()
      return sort === "newest" ? db - da : da - db
    })

    return result
  }, [posts, category, search, sort])

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE)
  const paginated = filtered.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE,
  )

  const popularPosts = [...posts]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 5)

  function handleCategoryChange(cat: string) {
    setCategory(cat)
    setPage(1)
  }

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          AI, Crypto &amp; Web3 Career Blog
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Practical guides, industry trends, and career advice for tech
          professionals.
        </p>
      </div>

      {/* Search bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm"
          />
        </div>
      </div>

      {/* Filters + Sort Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-9 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Main grid: cards + sidebar */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-10">
        {/* Cards */}
        <div>
          {paginated.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No articles found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try a different search or category
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginated.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                    page === n
                      ? "bg-primary text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-primary"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Popular Articles */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Popular Articles
            </h3>
            <div className="space-y-3">
              {popularPosts.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="flex gap-3 group"
                >
                  <span className="text-xs font-bold text-gray-300 mt-0.5 w-5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {p.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-5 w-5" />
              <h3 className="font-bold">Newsletter</h3>
            </div>
            <p className="text-sm text-white/80 mb-4 leading-relaxed">
              Get weekly career tips, salary data, and Web3 industry updates
              straight to your inbox.
            </p>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full h-10 px-3 rounded-lg bg-white/15 border border-white/20 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 mb-2.5"
            />
            <button
              type="button"
              className="w-full h-10 rounded-lg bg-white text-indigo-700 text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Subscribe
            </button>
          </div>

          {/* For Recruiters */}
          <Link
            href="/for-recruiters"
            className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-primary/40 hover:shadow-sm transition-all group"
          >
            <h3 className="font-bold text-gray-900 mb-2">For Recruiters</h3>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              Post jobs and find AI, Crypto &amp; Web3 talent with AI-powered
              tools.
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
              Learn more <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </aside>
      </div>
    </div>
  )
}
