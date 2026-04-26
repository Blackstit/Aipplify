"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
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
  ArrowLeft,
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

function uid() { return Math.random().toString(36).slice(2, 10) }

function SkillsInput({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [input, setInput] = useState("")
  const add = () => {
    const s = input.trim()
    if (s && !skills.includes(s)) onChange([...skills, s])
    setInput("")
  }
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input placeholder="Add a skill and press Enter" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }} className="text-sm" />
        <Button type="button" variant="outline" size="sm" onClick={add}><Plus className="h-3 w-3" /></Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {skills.map((s) => (
          <span key={s} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
            {s}
            <button type="button" onClick={() => onChange(skills.filter((x) => x !== s))}><X className="h-3 w-3 opacity-60 hover:opacity-100" /></button>
          </span>
        ))}
      </div>
    </div>
  )
}

function Section({ icon, title, count, children, defaultOpen = false }: { icon: React.ReactNode; title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-gray-500">{icon}</span>
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{count}</span>}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  )
}

function ExperienceForm({ item, onChange, onRemove }: { item: WorkExperience; onChange: (v: WorkExperience) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="text-sm"><span className="font-medium">{item.role || "Position"}</span>{item.company && <span className="text-gray-500"> @ {item.company}</span>}</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
          {open ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="p-4 grid grid-cols-2 gap-3">
          <div><Label className="text-xs mb-1 block">Company</Label><Input value={item.company} onChange={(e) => onChange({ ...item, company: e.target.value })} className="text-sm" /></div>
          <div><Label className="text-xs mb-1 block">Role</Label><Input value={item.role} onChange={(e) => onChange({ ...item, role: e.target.value })} className="text-sm" /></div>
          <div><Label className="text-xs mb-1 block">Start</Label><Input value={item.start} placeholder="2022-01" onChange={(e) => onChange({ ...item, start: e.target.value })} className="text-sm" /></div>
          <div><Label className="text-xs mb-1 block">End</Label><Input value={item.end} placeholder="Present" onChange={(e) => onChange({ ...item, end: e.target.value })} className="text-sm" /></div>
          <div className="col-span-2"><Label className="text-xs mb-1 block">Description</Label>
            <textarea className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3}
              value={item.description} onChange={(e) => onChange({ ...item, description: e.target.value })} /></div>
        </div>
      )}
    </div>
  )
}

function EducationForm({ item, onChange, onRemove }: { item: Education; onChange: (v: Education) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="text-sm"><span className="font-medium">{item.degree || "Degree"}</span>{item.school && <span className="text-gray-500"> @ {item.school}</span>}</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
          {open ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs mb-1 block">School</Label><Input value={item.school} onChange={(e) => onChange({ ...item, school: e.target.value })} className="text-sm" /></div>
          <div><Label className="text-xs mb-1 block">Degree</Label><Input value={item.degree} onChange={(e) => onChange({ ...item, degree: e.target.value })} className="text-sm" /></div>
          <div><Label className="text-xs mb-1 block">Field</Label><Input value={item.field} onChange={(e) => onChange({ ...item, field: e.target.value })} className="text-sm" /></div>
          <div><Label className="text-xs mb-1 block">Start</Label><Input value={item.start} onChange={(e) => onChange({ ...item, start: e.target.value })} className="text-sm" /></div>
          <div><Label className="text-xs mb-1 block">End</Label><Input value={item.end} onChange={(e) => onChange({ ...item, end: e.target.value })} className="text-sm" /></div>
        </div>
      )}
    </div>
  )
}

function ProjectForm({ item, onChange, onRemove }: { item: Project; onChange: (v: Project) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(false)
  const [techInput, setTechInput] = useState("")
  const addTech = () => {
    const t = techInput.trim()
    if (t && !item.tech.includes(t)) onChange({ ...item, tech: [...item.tech, t] })
    setTechInput("")
  }
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(!open)}>
        <span className="text-sm font-medium">{item.name || "Project"}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
          {open ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs mb-1 block">Name</Label><Input value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })} className="text-sm" /></div>
            <div><Label className="text-xs mb-1 block">URL</Label><Input value={item.url ?? ""} onChange={(e) => onChange({ ...item, url: e.target.value })} className="text-sm" /></div>
          </div>
          <div><Label className="text-xs mb-1 block">Description</Label>
            <textarea className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2}
              value={item.description} onChange={(e) => onChange({ ...item, description: e.target.value })} /></div>
          <div>
            <Label className="text-xs mb-1 block">Technologies</Label>
            <div className="flex gap-2 mb-1">
              <Input value={techInput} placeholder="React..." onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech() } }} className="text-sm" />
              <Button type="button" variant="outline" size="sm" onClick={addTech}><Plus className="h-3 w-3" /></Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {item.tech.map((t) => (
                <span key={t} className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5">
                  {t}<button type="button" onClick={() => onChange({ ...item, tech: item.tech.filter((x) => x !== t) })}><X className="h-2 w-2" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EditProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [form, setForm] = useState<ProfileFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/profiles/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          const p = d.profile
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
            skills: p.skills ?? [],
            experience: (p.experience ?? []).map((e: Partial<WorkExperience>) => ({ id: uid(), ...e })),
            education: (p.education ?? []).map((e: Partial<Education>) => ({ id: uid(), ...e })),
            projects: (p.projects ?? []).map((e: Partial<Project>) => ({ id: uid(), tech: [], ...e })),
            portfolio: (p.portfolio ?? []).map((e: Partial<PortfolioItem>) => ({ id: uid(), ...e })),
            certifications: (p.certifications ?? []).map((e: Partial<Certification>) => ({ id: uid(), ...e })),
            languages: (p.languages ?? []).map((e: Partial<Language>) => ({ id: uid(), ...e })),
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const set = <K extends keyof ProfileFormData>(key: K) =>
    (val: ProfileFormData[K]) => setForm((f) => f ? { ...f, [key]: val } : f)

  const handleSave = async () => {
    const user = getCurrentUser()
    if (!user || !form) return
    if (!form.title.trim()) { setSaveError("Profile title is required"); return }
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")
      router.push("/profiles")
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
  if (!form) return <div className="min-h-screen flex items-center justify-center text-gray-500">Profile not found.</div>

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/profiles")} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-gray-500 text-sm">Update your candidate profile</p>
          </div>
        </div>

        <Section icon={<Globe className="h-4 w-4" />} title="Personal Information" defaultOpen>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Profile Title <span className="text-red-500">*</span></Label>
              <Input value={form.title} onChange={(e) => set("title")(e.target.value)} />
            </div>
            <div><Label className="text-xs mb-1 block">First Name</Label><Input value={form.firstName} onChange={(e) => set("firstName")(e.target.value)} /></div>
            <div><Label className="text-xs mb-1 block">Last Name</Label><Input value={form.lastName} onChange={(e) => set("lastName")(e.target.value)} /></div>
            <div><Label className="text-xs mb-1 block">Email</Label><Input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} /></div>
            <div><Label className="text-xs mb-1 block">Phone</Label><Input value={form.phone} onChange={(e) => set("phone")(e.target.value)} /></div>
            <div className="col-span-2"><Label className="text-xs mb-1 block">Location</Label><Input value={form.location} onChange={(e) => set("location")(e.target.value)} /></div>
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Summary</Label>
              <textarea className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4}
                value={form.summary} onChange={(e) => set("summary")(e.target.value)} />
            </div>
          </div>
        </Section>

        <Section icon={<LinkIcon className="h-4 w-4" />} title="Links & Social">
          <div className="grid grid-cols-2 gap-3">
            {(["website", "linkedin", "github", "twitter"] as const).map((key) => (
              <div key={key}>
                <Label className="text-xs mb-1 block capitalize">{key === "twitter" ? "Twitter / X" : key}</Label>
                <Input value={form[key]} placeholder="https://..." onChange={(e) => set(key)(e.target.value)} className="text-sm" />
              </div>
            ))}
          </div>
        </Section>

        <Section icon={<Code2 className="h-4 w-4" />} title="Skills" count={form.skills.length}>
          <SkillsInput skills={form.skills} onChange={set("skills")} />
        </Section>

        <Section icon={<Briefcase className="h-4 w-4" />} title="Work Experience" count={form.experience.length}>
          {form.experience.map((e, i) => (
            <ExperienceForm key={e.id} item={e}
              onChange={(v) => set("experience")(form.experience.map((x, j) => j === i ? v : x))}
              onRemove={() => set("experience")(form.experience.filter((_, j) => j !== i))} />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("experience")([...form.experience, { id: uid(), company: "", role: "", start: "", end: "", description: "" }])} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />Add Position
          </Button>
        </Section>

        <Section icon={<GraduationCap className="h-4 w-4" />} title="Education" count={form.education.length}>
          {form.education.map((e, i) => (
            <EducationForm key={e.id} item={e}
              onChange={(v) => set("education")(form.education.map((x, j) => j === i ? v : x))}
              onRemove={() => set("education")(form.education.filter((_, j) => j !== i))} />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("education")([...form.education, { id: uid(), school: "", degree: "", field: "", start: "", end: "" }])} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />Add Education
          </Button>
        </Section>

        <Section icon={<Code2 className="h-4 w-4" />} title="Projects" count={form.projects.length}>
          {form.projects.map((e, i) => (
            <ProjectForm key={e.id} item={e}
              onChange={(v) => set("projects")(form.projects.map((x, j) => j === i ? v : x))}
              onRemove={() => set("projects")(form.projects.filter((_, j) => j !== i))} />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("projects")([...form.projects, { id: uid(), name: "", url: "", description: "", tech: [] }])} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />Add Project
          </Button>
        </Section>

        <Section icon={<LinkIcon className="h-4 w-4" />} title="Portfolio Links" count={form.portfolio.length}>
          {form.portfolio.map((e, i) => (
            <div key={e.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-center">
              <Input value={e.title} placeholder="Title" onChange={(ev) => set("portfolio")(form.portfolio.map((x, j) => j === i ? { ...x, title: ev.target.value } : x))} className="text-sm" />
              <Input value={e.url} placeholder="https://..." onChange={(ev) => set("portfolio")(form.portfolio.map((x, j) => j === i ? { ...x, url: ev.target.value } : x))} className="text-sm" />
              <button type="button" onClick={() => set("portfolio")(form.portfolio.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("portfolio")([...form.portfolio, { id: uid(), title: "", url: "", description: "" }])} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />Add Link
          </Button>
        </Section>

        <Section icon={<Award className="h-4 w-4" />} title="Certifications" count={form.certifications.length}>
          {form.certifications.map((e, i) => (
            <div key={e.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-start">
              <div>
                <Input value={e.name} placeholder="Certificate name" onChange={(ev) => set("certifications")(form.certifications.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))} className="text-sm mb-1" />
                <Input value={e.issuer} placeholder="Issuer" onChange={(ev) => set("certifications")(form.certifications.map((x, j) => j === i ? { ...x, issuer: ev.target.value } : x))} className="text-sm" />
              </div>
              <div>
                <Input value={e.date} placeholder="YYYY-MM" onChange={(ev) => set("certifications")(form.certifications.map((x, j) => j === i ? { ...x, date: ev.target.value } : x))} className="text-sm mb-1" />
                <Input value={e.url ?? ""} placeholder="URL" onChange={(ev) => set("certifications")(form.certifications.map((x, j) => j === i ? { ...x, url: ev.target.value } : x))} className="text-sm" />
              </div>
              <button type="button" onClick={() => set("certifications")(form.certifications.filter((_, j) => j !== i))} className="mt-2 text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("certifications")([...form.certifications, { id: uid(), name: "", issuer: "", date: "", url: "" }])} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />Add Certification
          </Button>
        </Section>

        <Section icon={<Languages className="h-4 w-4" />} title="Languages" count={form.languages.length}>
          {form.languages.map((e, i) => (
            <div key={e.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-center">
              <Input value={e.language} placeholder="Language" onChange={(ev) => set("languages")(form.languages.map((x, j) => j === i ? { ...x, language: ev.target.value } : x))} className="text-sm" />
              <select value={e.level} onChange={(ev) => set("languages")(form.languages.map((x, j) => j === i ? { ...x, level: ev.target.value } : x))}
                className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {["Native", "Fluent", "Advanced", "Intermediate", "Basic"].map((l) => <option key={l}>{l}</option>)}
              </select>
              <button type="button" onClick={() => set("languages")(form.languages.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("languages")([...form.languages, { id: uid(), language: "", level: "Intermediate" }])} className="w-full gap-2 mt-1">
            <Plus className="h-3 w-3" />Add Language
          </Button>
        </Section>

        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between gap-4">
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="ml-auto flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/profiles")}>Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={saving} className="bg-gradient-primary hover:bg-gradient-primary-hover text-white gap-2 px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
