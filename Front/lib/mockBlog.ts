import blogData from '@/data/blog.json'

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar: string
  }
  category: string
  tags: string[]
  publishedAt: string
  readTime: string
  image: string
}

export function getAllBlogPosts(): BlogPost[] {
  return blogData as BlogPost[]
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return (blogData as BlogPost[]).find(post => post.slug === slug)
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return (blogData as BlogPost[]).filter(post => post.category === category)
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return (blogData as BlogPost[]).filter(post => post.tags.includes(tag))
}
