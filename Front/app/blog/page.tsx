import { Metadata } from "next"
import { getPaginatedBlogPosts, getAllBlogPosts, BLOG_CATEGORIES } from "@/lib/mockBlog"

export const dynamic = "force-dynamic"
import { BlogPageLayout } from "./BlogPageLayout"
import { BlogListClient } from "./BlogListClient"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
  title: "AI, Crypto & Web3 Career Blog | Aipplify",
  description:
    "Practical guides, industry trends, and career advice for AI, Crypto & Web3 professionals. Job search tips, salary data, and hiring insights.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "AI, Crypto & Web3 Career Blog | Aipplify",
    description:
      "Practical guides, industry trends, and career advice for AI, Crypto & Web3 professionals.",
    url: "https://aipplify.com/blog",
  },
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const hasClientFilters =
    searchParams.category || searchParams.s || searchParams.sort

  if (hasClientFilters) {
    const posts = getAllBlogPosts()
    const categories = BLOG_CATEGORIES as unknown as string[]
    return (
      <div className="min-h-screen bg-gray-50/50">
        <BlogListClient
          posts={posts}
          categories={categories}
          initialCategory={
            typeof searchParams.category === "string"
              ? searchParams.category
              : undefined
          }
          initialSearch={
            typeof searchParams.s === "string" ? searchParams.s : undefined
          }
        />
        <Footer />
      </div>
    )
  }

  const { posts, totalPages, total } = getPaginatedBlogPosts(1)

  return (
    <>
      {totalPages > 1 && (
        <head>
          <link rel="next" href="/blog/page/2" />
        </head>
      )}
      <BlogPageLayout posts={posts} page={1} totalPages={totalPages} total={total} />
    </>
  )
}
