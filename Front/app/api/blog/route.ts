import { NextResponse } from "next/server"
import { getAllBlogPosts } from "@/lib/mockBlog"

export async function GET(request: Request) {
  try {
    const posts = getAllBlogPosts()
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    )
  }
}
