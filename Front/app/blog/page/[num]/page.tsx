import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import {
  getPaginatedBlogPosts,
  getAllBlogPosts,
  BLOG_PER_PAGE,
} from "@/lib/mockBlog"
import { BlogPageLayout } from "../../BlogPageLayout"

type Props = {
  params: { num: string }
}

export async function generateStaticParams() {
  const all = getAllBlogPosts()
  const totalPages = Math.ceil(all.length / BLOG_PER_PAGE)
  return Array.from({ length: totalPages }, (_, i) => ({
    num: String(i + 1),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pageNum = parseInt(params.num, 10)
  if (isNaN(pageNum) || pageNum < 1) return { title: "Blog — Aipplify" }

  if (pageNum === 1) {
    return {
      title: "AI, Crypto & Web3 Career Blog | Aipplify",
      alternates: { canonical: "/blog" },
    }
  }

  return {
    title: `Blog — Page ${pageNum} | Aipplify`,
    description: `Page ${pageNum} of the Aipplify career blog. Guides, salary data, and career advice for AI, Crypto & Web3 professionals.`,
    alternates: { canonical: `/blog/page/${pageNum}` },
    robots: { index: true, follow: true },
  }
}

export default function BlogPaginatedPage({ params }: Props) {
  const pageNum = parseInt(params.num, 10)

  if (isNaN(pageNum) || pageNum < 1) notFound()
  if (pageNum === 1) redirect("/blog")

  const { posts, totalPages, total, page } = getPaginatedBlogPosts(pageNum)

  if (pageNum > totalPages) notFound()

  const prevUrl = page === 2 ? "/blog" : `/blog/page/${page - 1}`
  const nextUrl = page < totalPages ? `/blog/page/${page + 1}` : null

  return (
    <>
      <head>
        <link rel="prev" href={prevUrl} />
        {nextUrl && <link rel="next" href={nextUrl} />}
      </head>
      <BlogPageLayout
        posts={posts}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </>
  )
}
