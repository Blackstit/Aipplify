import { readSecrets } from "@/lib/admin-secrets"
import type { ProfileFormData } from "@/types/profile"

const PARSE_SYSTEM = `You are an expert resume/CV parser. Extract all structured information and return ONLY valid JSON — no markdown, no explanation, no code blocks.`

const PARSE_PROMPT = `Parse the attached resume/CV into this exact JSON structure. Use empty string for missing text fields, empty arrays for missing lists. Never return null.

{
  "title": "current job title or primary desired role",
  "firstName": "first name",
  "lastName": "last name",
  "email": "email address",
  "phone": "phone number",
  "location": "city, country",
  "summary": "professional summary or objective",
  "website": "personal website url",
  "linkedin": "linkedin profile url",
  "github": "github profile url",
  "twitter": "twitter/x url",
  "skills": ["skill1", "skill2"],
  "experience": [
    {"id":"1","company":"Company Name","role":"Job Title","start":"YYYY-MM","end":"YYYY-MM or Present","description":"Responsibilities and achievements"}
  ],
  "education": [
    {"id":"1","school":"University Name","degree":"Bachelor/Master/PhD","field":"Field of Study","start":"YYYY","end":"YYYY"}
  ],
  "projects": [
    {"id":"1","name":"Project Name","url":"","description":"What the project does","tech":["React","Node.js"]}
  ],
  "certifications": [
    {"id":"1","name":"Certificate Name","issuer":"Issuing Organization","date":"YYYY-MM","url":""}
  ],
  "languages": [
    {"id":"1","language":"English","level":"Native"}
  ],
  "portfolio": [
    {"id":"1","title":"Portfolio Item Title","url":"https://...","description":""}
  ]
}`

// Send the raw PDF to OpenRouter — the PDF Parser Engine plugin extracts the text
export async function parseResumeViaPDF(file: File): Promise<Partial<ProfileFormData>> {
  const { openrouterKey } = readSecrets()
  if (!openrouterKey) throw new Error("OpenRouter API key not configured")

  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openrouterKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://aipplify.com",
      "X-Title": "Aipplify Resume Parser",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-haiku",
      temperature: 0.1,
      max_tokens: 4096,
      plugins: [{ id: "file-parser", pdf: { engine: "mistral-ocr" } }],
      messages: [
        { role: "system", content: PARSE_SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "file",
              file: {
                filename: file.name,
                file_data: `data:application/pdf;base64,${base64}`,
              },
            },
            {
              type: "text",
              text: PARSE_PROMPT,
            },
          ],
        },
      ],
    }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err?.error?.message || `OpenRouter API error: ${resp.status}`)
  }

  const data = await resp.json()
  const content: string = data.choices?.[0]?.message?.content ?? "{}"

  try {
    return JSON.parse(content) as Partial<ProfileFormData>
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as Partial<ProfileFormData>
    throw new Error("LLM returned non-JSON response")
  }
}

export async function generateProfileEmbedding(profile: Partial<ProfileFormData>): Promise<number[]> {
  const { openrouterKey } = readSecrets()
  if (!openrouterKey) return []

  const text = [
    profile.title,
    profile.summary,
    profile.skills?.join(", "),
    profile.experience?.map((e) => `${e.role} at ${e.company}: ${e.description}`).join(" "),
    profile.education?.map((e) => `${e.degree} ${e.field} at ${e.school}`).join(" "),
    profile.projects?.map((p) => `${p.name}: ${p.description} (${p.tech?.join(", ")})`).join(" "),
  ]
    .filter(Boolean)
    .join("\n")

  if (!text.trim()) return []

  const resp = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openrouterKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://aipplify.com",
      "X-Title": "Aipplify Profile Embeddings",
    },
    body: JSON.stringify({ model: "openai/text-embedding-3-small", input: text }),
  })

  if (!resp.ok) return []

  const data = await resp.json()
  return data.data?.[0]?.embedding ?? []
}

export function profileToText(profile: Partial<ProfileFormData>): string {
  const lines: string[] = []

  if (profile.title) lines.push(`Title: ${profile.title}`)
  if (profile.firstName || profile.lastName)
    lines.push(`Name: ${[profile.firstName, profile.lastName].filter(Boolean).join(" ")}`)
  if (profile.location) lines.push(`Location: ${profile.location}`)
  if (profile.summary) lines.push(`Summary: ${profile.summary}`)
  if (profile.skills?.length) lines.push(`Skills: ${profile.skills.join(", ")}`)

  profile.experience?.forEach((e) => {
    lines.push(`Experience: ${e.role} at ${e.company} (${e.start}–${e.end}): ${e.description}`)
  })
  profile.education?.forEach((e) => {
    lines.push(`Education: ${e.degree} in ${e.field} at ${e.school}`)
  })
  profile.projects?.forEach((p) => {
    lines.push(`Project: ${p.name} — ${p.description} [${p.tech?.join(", ")}]`)
  })

  return lines.join("\n")
}
