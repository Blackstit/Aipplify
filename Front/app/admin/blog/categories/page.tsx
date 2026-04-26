"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import {
  FolderOpen, Plus, ArrowLeft, Edit2, Trash2,
  Check, X, Loader2, FileText, Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Category {
  name: string
  count: number
}

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const editRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    const user = getCurrentUser()
    if (!user) return
    const r = await fetch("/api/admin/blog/categories", {
      headers: { "x-user-id": user.id },
    })
    const d = await r.json()
    setCategories(d.categories || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (editingName && editRef.current) editRef.current.focus()
  }, [editingName])

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError("Category already exists")
      return
    }
    setAdding(true)
    setError(null)
    const user = getCurrentUser()
    if (!user) return
    const r = await fetch("/api/admin/blog/categories", {
      method: "POST",
      headers: { "x-user-id": user.id, "content-type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (r.ok) {
      setNewName("")
      showToast(`Category "${name}" added`)
      await load()
    } else {
      const d = await r.json()
      setError(d.error || "Failed to add category")
    }
    setAdding(false)
  }

  const startEdit = (name: string) => {
    setEditingName(name)
    setEditValue(name)
  }

  const cancelEdit = () => {
    setEditingName(null)
    setEditValue("")
  }

  const handleRename = async (oldName: string) => {
    const newVal = editValue.trim()
    if (!newVal || newVal === oldName) { cancelEdit(); return }
    if (categories.some((c) => c.name.toLowerCase() === newVal.toLowerCase() && c.name !== oldName)) {
      setError("A category with that name already exists")
      return
    }
    setSaving(oldName)
    setError(null)
    const user = getCurrentUser()
    if (!user) return
    const r = await fetch("/api/admin/blog/categories", {
      method: "PATCH",
      headers: { "x-user-id": user.id, "content-type": "application/json" },
      body: JSON.stringify({ oldName, newName: newVal }),
    })
    if (r.ok) {
      cancelEdit()
      showToast(`Renamed to "${newVal}"`)
      await load()
    } else {
      const d = await r.json()
      setError(d.error || "Failed to rename")
    }
    setSaving(null)
  }

  const handleDelete = async (name: string, count: number) => {
    const warning = count > 0
      ? `"${name}" is used by ${count} post${count === 1 ? "" : "s"}. Those posts will keep the category name but it will be removed from the list. Continue?`
      : `Delete category "${name}"?`
    if (!confirm(warning)) return
    setDeleting(name)
    const user = getCurrentUser()
    if (!user) return
    const r = await fetch("/api/admin/blog/categories", {
      method: "DELETE",
      headers: { "x-user-id": user.id, "content-type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (r.ok) {
      showToast(`Deleted "${name}"`)
      await load()
    } else {
      const d = await r.json()
      setError(d.error || "Failed to delete")
    }
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-green-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-gray-400" />
              Blog Categories
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {categories.length} categor{categories.length === 1 ? "y" : "ies"} total
            </p>
          </div>
        </div>
      </div>

      {/* Add new */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Add new category</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. DeFi Careers"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setError(null) }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-9 text-sm flex-1"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="gap-1.5 shrink-0"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </Button>
        </div>
        {error && (
          <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
            <X className="h-3 w-3" /> {error}
          </p>
        )}
      </div>

      {/* Category list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No categories yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => {
              const isEditing = editingName === cat.name
              const isSaving = saving === cat.name
              const isDeleting = deleting === cat.name

              return (
                <li
                  key={cat.name}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors",
                    isDeleting && "opacity-40",
                  )}
                >
                  <FolderOpen className="h-4 w-4 text-gray-300 shrink-0" />

                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        ref={editRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(cat.name)
                          if (e.key === "Escape") cancelEdit()
                        }}
                        className="h-7 text-sm flex-1"
                      />
                      <button
                        onClick={() => handleRename(cat.name)}
                        disabled={!!isSaving}
                        className="p-1 rounded text-green-600 hover:bg-green-50 transition-colors"
                        title="Save"
                      >
                        {isSaving
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Check className="h-4 w-4" />
                        }
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 rounded text-gray-400 hover:bg-gray-100 transition-colors"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-gray-800">
                        {cat.name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <FileText className="h-3 w-3" />
                        {cat.count} post{cat.count === 1 ? "" : "s"}
                      </span>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => startEdit(cat.name)}
                          className="p-1.5 text-gray-400 hover:text-primary rounded-md hover:bg-gray-100 transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.name, cat.count)}
                          disabled={isDeleting}
                          className="p-1.5 text-gray-300 hover:text-rose-500 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          {isDeleting
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />
                          }
                        </button>
                      </div>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Renaming a category will update all posts using that category automatically.
        Deleting a category does not change existing posts.
      </p>
    </div>
  )
}
