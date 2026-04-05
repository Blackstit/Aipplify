import Link from "next/link"
import { BlogPost } from "@/lib/mockBlog"
import { Clock } from "lucide-react"

interface BlogCardProps {
  post: BlogPost
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200 h-full flex flex-col">
        <div className="aspect-[16/9] relative overflow-hidden">
          <img
            src={post.image}
            alt={post.imageAlt || post.title}
            loading="lazy"
            width={600}
            height={340}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-wider text-white bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-md">
            {post.category}
          </span>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {post.title}
          </h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-1">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-primary leading-none">
                  {getInitials(post.author.name)}
                </span>
              </div>
              <span className="text-xs text-gray-600 font-medium truncate">
                {post.author.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0 whitespace-nowrap">
              <span>{formatDate(post.publishedAt)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
