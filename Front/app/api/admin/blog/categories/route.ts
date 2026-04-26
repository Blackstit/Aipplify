import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { readCategories, writeCategories, readPosts, writePosts } from "@/lib/blog-admin"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const cats = readCategories()
  const posts = readPosts()
  const counts = Object.fromEntries(cats.map((c) => [c, posts.filter((p) => p.category === c).length]))

  return NextResponse.json({ categories: cats, counts })
}

export async function POST(req: Request) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const cats = readCategories()
  if (cats.includes(name.trim())) return NextResponse.json({ error: "Already exists" }, { status: 409 })

  const updated = [...cats, name.trim()].sort()
  writeCategories(updated)

  return NextResponse.json({ categories: updated })
}

export async function PATCH(req: Request) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { old: oldName, next: newName } = await req.json()
  if (!oldName || !newName?.trim()) return NextResponse.json({ error: "Names required" }, { status: 400 })

  const cats = readCategories()
  if (!cats.includes(oldName)) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (cats.includes(newName.trim()) && newName.trim() !== oldName) {
    return NextResponse.json({ error: "Name already exists" }, { status: 409 })
  }

  // Rename in posts too
  const posts = readPosts()
  writePosts(posts.map((p) => (p.category === oldName ? { ...p, category: newName.trim() } : p)))

  const updated = cats.map((c) => (c === oldName ? newName.trim() : c)).sort()
  writeCategories(updated)

  return NextResponse.json({ categories: updated })
}

export async function DELETE(req: Request) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await req.json()
  const updated = readCategories().filter((c) => c !== name)
  writeCategories(updated)

  return NextResponse.json({ categories: updated })
}
