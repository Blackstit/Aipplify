import { Metadata } from "next"
import Link from "next/link"
import { getAllBlogPosts } from "@/lib/mockBlog"
import { BlogCard } from "@/components/BlogCard"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
  title: "Blog - Aipplify",
  description: "Career tips, industry insights, and job search advice",
}

export default function BlogPage() {
  const posts = getAllBlogPosts()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-gray-600 text-lg">
            Career tips, industry insights, and job search advice
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
