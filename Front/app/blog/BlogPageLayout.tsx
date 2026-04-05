import Link from "next/link"
import { BlogPost, BLOG_CATEGORIES, getAllBlogPosts } from "@/lib/mockBlog"
import { BlogCard } from "@/components/BlogCard"
import { Footer } from "@/components/Footer"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Mail,
} from "lucide-react"

interface Props {
  posts: BlogPost[]
  page: number
  totalPages: number
  total: number
}

function pageUrl(p: number): string {
  return p <= 1 ? "/blog" : `/blog/page/${p}`
}

export function BlogPageLayout({ posts, page, totalPages, total }: Props) {
  const categories = BLOG_CATEGORIES as unknown as string[]
  const popularPosts = getAllBlogPosts().slice(0, 5)

  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)

  return (
    <div className="min-h-screen bg-gray-50/50">
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

        {/* Search (links to /blog for client-side filtering) */}
        <div className="max-w-xl mx-auto mb-8">
          <Link
            href="/blog"
            className="relative block"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <div className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white text-sm flex items-center text-gray-400 shadow-sm hover:border-primary/40 transition-colors">
              Search articles...
            </div>
          </Link>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}
              className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-primary/40 hover:text-primary transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-10">
          {/* Cards */}
          <div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* SEO Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Blog pagination"
                className="flex items-center justify-center gap-2 mt-10"
              >
                {page > 1 ? (
                  <Link
                    href={pageUrl(page - 1)}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-primary transition-colors flex items-center gap-1"
                    rel="prev"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-300 cursor-not-allowed flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </span>
                )}

                {pages.map((n) => (
                  <Link
                    key={n}
                    href={pageUrl(n)}
                    className={`h-9 w-9 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                      page === n
                        ? "bg-primary text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:border-primary"
                    }`}
                    aria-current={page === n ? "page" : undefined}
                  >
                    {n}
                  </Link>
                ))}

                {page < totalPages ? (
                  <Link
                    href={pageUrl(page + 1)}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-primary transition-colors flex items-center gap-1"
                    rel="next"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-300 cursor-not-allowed flex items-center gap-1">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </nav>
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
      <Footer />
    </div>
  )
}
