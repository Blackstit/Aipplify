import { NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/adminGuard"
import { readSecrets, writeSecrets, maskKey } from "@/lib/admin-secrets"
import type { LinkedInPostTarget } from "@/lib/admin-secrets"

export const dynamic = "force-dynamic"

function secretsPayload() {
  const s = readSecrets()
  return {
    openrouterKey: maskKey(s.openrouterKey),
    linkedinConnected: !!s.linkedinAccessToken,
    linkedinPersonName: s.linkedinPersonName,
    linkedinOrgName: s.linkedinOrgName,
    linkedinHasOrg: !!s.linkedinOrgId,
    linkedinPostTarget: s.linkedinPostTarget ?? (s.linkedinOrgId ? "org" : "person"),
    linkedinAutoPost: s.linkedinAutoPost ?? false,
  }
}

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json(secretsPayload())
}

export async function PATCH(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (admin.role !== "ADMIN") return NextResponse.json({ error: "Admin role required" }, { status: 403 })

  const body = await request.json().catch(() => ({}))

  if (typeof body.openrouterKey === "string") writeSecrets({ openrouterKey: body.openrouterKey.trim() })
  if (typeof body.linkedinAutoPost === "boolean") writeSecrets({ linkedinAutoPost: body.linkedinAutoPost })
  if (["person", "org", "both"].includes(body.linkedinPostTarget)) {
    writeSecrets({ linkedinPostTarget: body.linkedinPostTarget as LinkedInPostTarget })
  }
  if (body.disconnectLinkedIn === true) {
    writeSecrets({
      linkedinAccessToken: undefined,
      linkedinPersonId: undefined,
      linkedinPersonName: undefined,
      linkedinOrgId: undefined,
      linkedinOrgName: undefined,
      linkedinPostTarget: undefined,
      linkedinAutoPost: undefined,
    })
  }

  return NextResponse.json(secretsPayload())
}
