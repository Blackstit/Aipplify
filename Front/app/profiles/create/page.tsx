"use client"

import { Suspense, useCallback, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResumeParsingOverlay } from "@/components/profiles/ResumeParsingOverlay"
import {
  Upload,
  FileText,
  X,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Languages,
  Globe,
} from "lucide-react"
import type {
  ProfileFormData,
  WorkExperience,
  Education,
  Project,
  PortfolioItem,
  Certification,
  Language,
} from "@/types/profile"

// ─── helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const empty: ProfileFormData = {
  title: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  website: "",
  linkedin: "",
  github: "",
  twitter: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  portfolio: [],
  certifications: [],
  languages: [],
}

// ─── Skill chips ─────────────────────────────────────────────────────────────

function SkillsInput({
  skills,
  onChange,
}: {
  skills: string[]
  onChange: (s: string[]) => void
}) {
  const [input, setInput] = useState("")

  const add = () => {
    const s = input.trim()
    if (s && !skills.includes(s)) onChange([...skills, s])
    setInput("")
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input
          placeholder="Add a skill and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add() }
          }}
          className="text-sm"
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {skills.map((s) => (
          <span
            key={s}
            className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5"
          >
            {s}
            <button type="button" onClick={() => onChange(skills.filter((x) => x !== s))}>
              <X className="h-3 w-3 opacity-60 hover:opacity-100" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({
  icon,
  title,
  count,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode
  title: string
  count?: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-500">{icon}</span>
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && (
            <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  )
}

// ─── Experience item form ─────────────────────────────────────────────────────

function ExperienceForm({
  item,
  onChange,
  onRemove,
}: {
  item: WorkExperience
  onChange: (v: WorkExperience) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(!item.company)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="text-sm">
          <span className="font-medium">{item.role || "New Position"}</span>
          {item.company && <span className="text-gray-500"> @ {item.company}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }} className="text-red-400 hover:text-red-600">
            <Trash2 className="h-3 w-3" />
          </button>
          {open ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="p-4 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1 block">Company</Label>
            <Input value={item.company} onChange={(e) => onChange({ ...item, company: e.target.value })} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Role / Title</Label>
            <Input value={item.role} onChange={(e) => onChange({ ...item, role: e.target.value })} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Start (YYYY-MM)</Label>
            <Input value={item.start} placeholder="2022-01" onChange={(e) => onChange({ ...item, start: e.target.value })} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">End (YYYY-MM or Present)</Label>
            <Input value={item.end} placeholder="Present" onChange={(e) => onChange({ ...item, end: e.target.value })} className="text-sm" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs mb-1 block">Description</Label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={item.description}
              onChange={(e) => onChange({ ...item, description: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Education item form ──────────────────────────────────────────────────────

function EducationForm({
  item,
  onChange,
  onRemove,
}: {
  item: Education
  onChange: (v: Education) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(!item.school)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="text-sm">
          <span className="font-medium">{item.degree || "Degree"}</span>
          {item.school && <span className="text-gray-500"> @ {item.school}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }} className="text-red-400 hover:text-red-600">
            <Trash2 className="h-3 w-3" />
          </button>
          {open ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs mb-1 block">School / University</Label>
            <Input value={item.school} onChange={(e) => onChange({ ...item, school: e.target.value })} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Degree</Label>
            <Input value={item.degree} placeholder="Bachelor's" onChange={(e) => onChange({ ...item, degree: e.target.value })} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Field of Study</Label>
            <Input value={item.field} placeholder="Computer Science" onChange={(e) => onChange({ ...item, field: e.target.value })} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Start Year</Label>
            <Input value={item.start} placeholder="2018" onChange={(e) => onChange({ ...item, start: e.target.value })} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">End Year</Label>
            <Input value={item.end} placeholder="2022" onChange={(e) => onChange({ ...item, end: e.target.value })} className="text-sm" />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Project item form ────────────────────────────────────────────────────────

function ProjectForm({
  item,
  onChange,
  onRemove,
}: {
  item: Project
  onChange: (v: Project) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(!item.name)
  const [techInput, setTechInput] = useState("")

  const addTech = () => {
    const t = techInput.trim()
    if (t && !item.tech.includes(t)) onChange({ ...item, tech: [...item.tech, t] })
    setTechInput("")
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(!open)}>
        <span className="text-sm font-medium">{item.name || "New Project"}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }} className="text-red-400 hover:text-red-600">
            <Trash2 className="h-3 w-3" />
          </button>
          {open ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Project Name</Label>
              <Input value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">URL</Label>
              <Input value={item.url ?? ""} placeholder="https://..." onChange={(e) => onChange({ ...item, url: e.target.value })} className="text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Description</Label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={item.description}
              onChange={(e) => onChange({ ...item, description: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Technologies</Label>
            <div className="flex gap-2 mb-1">
              <Input
                value={techInput}
                placeholder="React, Node.js, ..."
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech() } }}
                className="text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTech}><Plus className="h-3 w-3" /></Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {item.tech.map((t) => (
                <span key={t} className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5">
                  {t}
                  <button type="button" onClick={() => onChange({ ...item, tech: item.tech.filter((x) => x !== t) })}>
                    <X className="h-2 w-2" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Simple list item (portfolio, certifications, languages) ──────────────────

function PortfolioForm({ item, onChange, onRemove }: { item: PortfolioItem; onChange: (v: PortfolioItem) => void; onRemove: () => void }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-start">
      <Input value={item.title} placeholder="Title" onChange={(e) => onChange({ ...item, title: e.target.value })} className="text-sm" />
      <Input value={item.url} placeholder="https://..." onChange={(e) => onChange({ ...item, url: e.target.value })} className="text-sm" />
      <button type="button" onClick={onRemove} className="mt-2 text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
    </div>
  )
}

function CertForm({ item, onChange, onRemove }: { item: Certification; onChange: (v: Certification) => void; onRemove: () => void }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-start">
      <div>
        <Input value={item.name} placeholder="Certificate name" onChange={(e) => onChange({ ...item, name: e.target.value })} className="text-sm mb-1" />
        <Input value={item.issuer} placeholder="Issuer" onChange={(e) => onChange({ ...item, issuer: e.target.value })} className="text-sm" />
      </div>
      <div>
        <Input value={item.date} placeholder="YYYY-MM" onChange={(e) => onChange({ ...item, date: e.target.value })} className="text-sm mb-1" />
        <Input value={item.url ?? ""} placeholder="URL (optional)" onChange={(e) => onChange({ ...item, url: e.target.value })} className="text-sm" />
      </div>
      <button type="button" onClick={onRemove} className="mt-2 text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
    </div>
  )
}

function LangForm({ item, onChange, onRemove }: { item: Language; onChange: (v: Language) => void; onRemove: () => void }) {
  const levels = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"]
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-center">
      <Input value={item.language} placeholder="Language" onChange={(e) => onChange({ ...item, language: e.target.value })} className="text-sm" />
      <select
        value={item.level}
        onChange={(e) => onChange({ ...item, level: e.target.value })}
        className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {levels.map((l) => <option key={l}>{l}</option>)}
      </select>
      <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
    </div>
  )
}

// ─── Drop zone ────────────────────────────────────────────────────────────────

function DropZone({
  onFile,
  parsing,
  filename,
}: {
  onFile: (f: File) => void
  parsing: boolean
  filename: string | null
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      if (f?.type === "application/pdf") onFile(f)
    },
    [onFile]
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !parsing && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
        dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
      />
      {filename ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle className="h-10 w-10 text-green-500" />
          <p className="text-sm font-medium text-gray-700">{filename}</p>
          <p className="text-xs text-gray-400">Click to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Upload className="h-10 w-10 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">Drop your PDF resume here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse · PDF only · up to 10 MB</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreateProfilePageWrapper() {
  return <Suspense><CreateProfilePage /></Suspense>
}

function CreateProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo")
  const [form, setForm] = useState<ProfileFormData>(empty)
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pdfFilename, setPdfFilename] = useState<string | null>(null)

  const set = <K extends keyof ProfileFormData>(key: K) =>
    (val: ProfileFormData[K]) => setForm((f) => ({ ...f, [key]: val }))

  const handleFile = async (file: File) => {
    setParsing(true)
    setParseError(null)
    setPdfFilename(file.name)

    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/profiles/parse", { method: "POST", body: fd })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Parse failed")

      const p = data.parsed ?? {}

      setForm({
        title: p.title ?? "",
        firstName: p.firstName ?? "",
        lastName: p.lastName ?? "",
        email: p.email ?? "",
        phone: p.phone ?? "",
        location: p.location ?? "",
        summary: p.summary ?? "",
        website: p.website ?? "",
        linkedin: p.linkedin ?? "",
        github: p.github ?? "",
        twitter: p.twitter ?? "",
        skills: Array.isArray(p.skills) ? p.skills : [],
        experience: (p.experience ?? []).map((e: Partial<WorkExperience>) => ({ id: uid(), ...e })),
        education: (p.education ?? []).map((e: Partial<Education>) => ({ id: uid(), ...e })),
        projects: (p.projects ?? []).map((e: Partial<Project>) => ({ id: uid(), tech: [], ...e })),
        portfolio: (p.portfolio ?? []).map((e: Partial<PortfolioItem>) => ({ id: uid(), ...e })),
        certifications: (p.certifications ?? []).map((e: Partial<Certification>) => ({ id: uid(), ...e })),
        languages: (p.languages ?? []).map((e: Partial<Language>) => ({ id: uid(), ...e })),
      })
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse resume")
    } finally {
      setParsing(false)
    }
  }

  const handleSave = async () => {
    const user = getCurrentUser()
    if (!user) { router.push("/auth"); return }
    if (!form.title.trim()) { setSaveError("Profile title is required"); return }

    setSaving(true)
    setSaveError(null)

    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, pdfFilename, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")
      router.push(returnTo ?? "/profiles")
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const addExperience = () =>
    set("experience")([...form.experience, { id: uid(), company: "", role: "", start: "", end: "", description: "" }])
  const addEducation = () =>
    set("education")([...form.education, { id: uid(), school: "", degree: "", field: "", start: "", end: "" }])
  const addProject = () =>
    set("projects")([...form.projects, { id: uid(), name: "", url: "", description: "", tech: [] }])
  const addPortfolio = () =>
    set("portfolio")([...form.portfolio, { id: uid(), title: "", url: "", description: "" }])
  const addCertification = () =>
    set("certifications")([...form.certifications, { id: uid(), name: "", issuer: "", date: "", url: "" }])
  const addLanguage = () =>
    set("languages")([...form.languages, { id: uid(), language: "", level: "Intermediate" }])

  return (
    <div className="min-h-screen bg-background">
      {parsing && <ResumeParsingOverlay />}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        {/* Context banner when coming from a job match */}
        {returnTo && (
          <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-800">
            <span className="text-lg">✦</span>
            <span>Create your profile below — after saving you'll be sent back to check your match score.</span>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">Create Profile</h1>
          <p className="text-gray-500 text-sm">Upload your CV to auto-fill, or fill in the form manually.</p>
        </div>

        {/* Drop zone */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">Import from PDF resume</span>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">AI-powered</span>
          </div>
          <DropZone onFile={handleFile} parsing={parsing} filename={pdfFilename} />
          {parseError && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <X className="h-4 w-4 flex-shrink-0" />
              {parseError}
            </div>
          )}
        </div>

        {/* ── Personal info ── */}
        <Section icon={<Globe className="h-4 w-4" />} title="Personal Information" defaultOpen>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Profile Title <span className="text-red-500">*</span></Label>
              <Input
                value={form.title}
                placeholder="e.g. Senior React Developer"
                onChange={(e) => set("title")(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">First Name</Label>
              <Input value={form.firstName} onChange={(e) => set("firstName")(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Last Name</Label>
              <Input value={form.lastName} onChange={(e) => set("lastName")(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Phone</Label>
              <Input value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Location</Label>
              <Input value={form.location} placeholder="City, Country" onChange={(e) => set("location")(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Summary</Label>
              <textarea
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Brief professional summary…"
                value={form.summary}
                onChange={(e) => set("summary")(e.target.value)}
              />
            </div>
          </div>
        </Section>

        {/* ── Links ── */}
        <Section icon={<LinkIcon className="h-4 w-4" />} title="Links & Social">
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["website", "Website"],
                ["linkedin", "LinkedIn"],
                ["github", "GitHub"],
                ["twitter", "Twitter / X"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label className="text-xs mb-1 block">{label}</Label>
                <Input
                  value={form[key]}
                  placeholder="https://..."
                  onChange={(e) => set(key)(e.target.value)}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Skills ── */}
        <Section icon={<Code2 className="h-4 w-4" />} title="Skills" count={form.skills.length}>
          <SkillsInput skills={form.skills} onChange={set("skills")} />
        </Section>

        {/* ── Experience ── */}
        <Section icon={<Briefcase className="h-4 w-4" />} title="Work Experience" count={form.experience.length}>
          {form.experience.map((e, i) => (
            <ExperienceForm
              key={e.id}
              item={e}
              onChange={(v) => set("experience")(form.experience.map((x, j) => (j === i ? v : x)))}
              onRemove={() => set("experience")(form.experience.filter((_, j) => j !== i))}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addExperience} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />
            Add Position
          </Button>
        </Section>

        {/* ── Education ── */}
        <Section icon={<GraduationCap className="h-4 w-4" />} title="Education" count={form.education.length}>
          {form.education.map((e, i) => (
            <EducationForm
              key={e.id}
              item={e}
              onChange={(v) => set("education")(form.education.map((x, j) => (j === i ? v : x)))}
              onRemove={() => set("education")(form.education.filter((_, j) => j !== i))}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addEducation} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />
            Add Education
          </Button>
        </Section>

        {/* ── Projects ── */}
        <Section icon={<Code2 className="h-4 w-4" />} title="Projects" count={form.projects.length}>
          {form.projects.map((e, i) => (
            <ProjectForm
              key={e.id}
              item={e}
              onChange={(v) => set("projects")(form.projects.map((x, j) => (j === i ? v : x)))}
              onRemove={() => set("projects")(form.projects.filter((_, j) => j !== i))}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addProject} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />
            Add Project
          </Button>
        </Section>

        {/* ── Portfolio ── */}
        <Section icon={<LinkIcon className="h-4 w-4" />} title="Portfolio Links" count={form.portfolio.length}>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
            <span className="text-xs text-gray-400 font-medium">Title</span>
            <span className="text-xs text-gray-400 font-medium">URL</span>
            <span />
          </div>
          {form.portfolio.map((e, i) => (
            <PortfolioForm
              key={e.id}
              item={e}
              onChange={(v) => set("portfolio")(form.portfolio.map((x, j) => (j === i ? v : x)))}
              onRemove={() => set("portfolio")(form.portfolio.filter((_, j) => j !== i))}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addPortfolio} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />
            Add Portfolio Link
          </Button>
        </Section>

        {/* ── Certifications ── */}
        <Section icon={<Award className="h-4 w-4" />} title="Certifications" count={form.certifications.length}>
          {form.certifications.map((e, i) => (
            <CertForm
              key={e.id}
              item={e}
              onChange={(v) => set("certifications")(form.certifications.map((x, j) => (j === i ? v : x)))}
              onRemove={() => set("certifications")(form.certifications.filter((_, j) => j !== i))}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addCertification} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />
            Add Certification
          </Button>
        </Section>

        {/* ── Languages ── */}
        <Section icon={<Languages className="h-4 w-4" />} title="Languages" count={form.languages.length}>
          {form.languages.map((e, i) => (
            <LangForm
              key={e.id}
              item={e}
              onChange={(v) => set("languages")(form.languages.map((x, j) => (j === i ? v : x)))}
              onRemove={() => set("languages")(form.languages.filter((_, j) => j !== i))}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addLanguage} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />
            Add Language
          </Button>
        </Section>

        {/* ── Save ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            {pdfFilename
              ? "Resume parsed — review the data above and save."
              : "Fill in your details above, then save your profile."}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            <Button type="button" variant="outline" onClick={() => router.push("/profiles")}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-primary hover:bg-gradient-primary-hover text-white gap-2 px-6"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Save Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
