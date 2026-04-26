import { NextResponse } from "next/server"
import { readSecrets, writeSecrets } from "@/lib/admin-secrets"
import { exchangeLinkedInCode, getLinkedInProfile, getLinkedInAdminOrgs } from "@/lib/linkedin"

export const dynamic = "force-dynamic"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aipplify.com"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")
  const errorDesc = searchParams.get("error_description")

  if (error) {
    const msg = errorDesc || error
    return NextResponse.redirect(`${SITE_URL}/admin/settings?linkedin_error=${encodeURIComponent(msg)}`)
  }

  const secrets = readSecrets()
  if (!code || !state || state !== secrets.linkedinOAuthState) {
    return NextResponse.redirect(`${SITE_URL}/admin/settings?linkedin_error=invalid_state`)
  }

  try {
    const { access_token } = await exchangeLinkedInCode(code)
    const profile = await getLinkedInProfile(access_token)
    const org = await getLinkedInAdminOrgs(access_token)

    const existingOrg = secrets.linkedinOrgId
      ? { id: secrets.linkedinOrgId, name: secrets.linkedinOrgName || "LinkedIn Page" }
      : null

    writeSecrets({
      linkedinAccessToken: access_token,
      linkedinPersonId: profile.id,
      linkedinPersonName: profile.name,
      // Keep existing org data if new token doesn't have org scopes
      linkedinOrgId: org?.id ?? existingOrg?.id,
      linkedinOrgName: org?.name ?? existingOrg?.name,
      linkedinPostTarget: secrets.linkedinPostTarget ?? ((org ?? existingOrg) ? "org" : "person"),
      linkedinAutoPost: secrets.linkedinAutoPost ?? true,
      linkedinOAuthState: undefined,
    })

    const orgMsg = org ? `&org=${encodeURIComponent(org.name)}` : ""
    return NextResponse.redirect(`${SITE_URL}/admin/settings?linkedin_connected=1${orgMsg}`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error"
    return NextResponse.redirect(`${SITE_URL}/admin/settings?linkedin_error=${encodeURIComponent(msg)}`)
  }
}
