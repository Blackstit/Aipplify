import fs from "fs"
import path from "path"

const SECRETS_PATH = path.join(process.cwd(), "data/admin-secrets.json")

export type LinkedInPostTarget = "person" | "org" | "both"

export interface AdminSecrets {
  openrouterKey: string
  oxapayKey?: string
  linkedinAccessToken?: string
  linkedinPersonId?: string
  linkedinPersonName?: string
  linkedinOrgId?: string
  linkedinOrgName?: string
  linkedinPostTarget?: LinkedInPostTarget
  linkedinAutoPost?: boolean
  linkedinOAuthState?: string
}

export function readSecrets(): AdminSecrets {
  try {
    return JSON.parse(fs.readFileSync(SECRETS_PATH, "utf8"))
  } catch {
    return { openrouterKey: "" }
  }
}

export function writeSecrets(s: Partial<AdminSecrets>): AdminSecrets {
  const current = readSecrets()
  const next = { ...current, ...s }
  // Remove undefined keys
  for (const k of Object.keys(next) as (keyof AdminSecrets)[]) {
    if (next[k] === undefined) delete next[k]
  }
  fs.writeFileSync(SECRETS_PATH, JSON.stringify(next, null, 2), "utf8")
  return next
}

export function maskKey(key: string): string {
  if (!key || key.length < 8) return key ? "••••••••" : ""
  return "••••••••••••" + key.slice(-4)
}
