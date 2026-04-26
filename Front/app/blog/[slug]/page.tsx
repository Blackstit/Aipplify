import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getBlogPostBySlug,
  getRelatedPosts,
} from "@/lib/mockBlog"
import { buildBlogTitle, buildBlogDescription } from "@/lib/seo"
import { Footer } from "@/components/Footer"
import { ViewTracker } from "./ViewTracker"
import { BlogCard } from "@/components/BlogCard"
import { ArrowRight, Clock, ChevronRight, ChevronDown } from "lucide-react"
import { ArticleContent } from "./ArticleContent"
import { BlogCover } from "@/components/blog/BlogCover"

type Props = {
  params: { slug: string }
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug)
  if (!post) return { title: "Post Not Found — Aipplify Blog" }

  const title = buildBlogTitle(post.metaTitle || post.title)
  const description = buildBlogDescription(post.metaDescription || post.excerpt)

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `https://aipplify.com/blog/${post.slug}`,
      type: "article",
      images: [{ url: `https://aipplify.com/api/og/blog/${post.slug}`, alt: post.imageAlt || post.title, width: 1200, height: 628 }],
    },
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPostBySlug(params.slug)
  if (!post) notFound()

  const related = getRelatedPosts(params.slug, 3)

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `https://aipplify.com/api/og/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Aipplify",
      logo: {
        "@type": "ImageObject",
        url: "https://aipplify.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://aipplify.com/blog/${post.slug}`,
    },
  }

  const faqSchema =
    post.faq && post.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ViewTracker slug={params.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm text-gray-400 mb-6"
        >
          <Link
            href="/"
            className="hover:text-primary transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/blog"
            className="hover:text-primary transition-colors"
          >
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-600 truncate max-w-[300px]">
            {post.title}
          </span>
        </nav>

        <article>
          {/* Header */}
          <header className="mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-md mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-gray-900 leading-tight mb-5">
              {post.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {post.author.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {post.author.name}
                  </p>
                  {post.author.role && (
                    <p className="text-xs text-gray-500">{post.author.role}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{formatDate(post.publishedAt)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </header>

          {/* Featured image */}
          <div className="aspect-video rounded-2xl overflow-hidden mb-10">
            <BlogCover title={post.title} category={post.category} slug={post.slug} size="hero" />
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 mb-12">
            <ArticleContent content={post.content} />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-12">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* FAQ */}
          {post.faq && post.faq.length > 0 && (
            <section className="mb-12" aria-label="Frequently Asked Questions">
              <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {post.faq.map((item, i) => (
                  <details
                    key={i}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-semibold text-gray-900 pr-4">{item.q}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-5 pb-4 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 md:p-10 text-center text-white mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Ready to Take the Next Step?
            </h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Browse AI-scored jobs in crypto, Web3, and artificial intelligence
              — or post your own listing today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-indigo-700 font-bold hover:shadow-lg transition-all text-sm"
              >
                Browse AI Jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/for-recruiters"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all text-sm"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}
