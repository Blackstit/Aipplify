import Link from "next/link"
import Image from "next/image"
import { BlogPost } from "@/lib/mockBlog"
import { Card } from "@/components/ui/card"
import { Tag } from "./Tag"
import { Clock, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  const publishedTime = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="overflow-hidden hover:shadow-md hover:border-primary transition-all duration-200 cursor-pointer h-full">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-primary">{post.category}</span>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{post.readTime}</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm text-gray-600">{post.author.name}</span>
            </div>
            <span className="text-xs text-gray-500">{publishedTime}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} className="text-xs">{tag}</Tag>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
}
