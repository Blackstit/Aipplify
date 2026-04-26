import type { AdminSecrets } from "./admin-secrets"

const LINKEDIN_API = "https://api.linkedin.com/v2"
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID!
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aipplify.com"
export const LINKEDIN_CALLBACK_URL = `${SITE_URL}/api/admin/linkedin/callback`

const SCOPES = "openid profile w_member_social w_organization_social r_organization_social"

// Convert ASCII text to Unicode Mathematical Sans-Serif Bold (renders bold on LinkedIn)
function toBold(text: string): string {
  return text.split("").map((c) => {
    const code = c.charCodeAt(0)
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d5d4 + code - 65) // A-Z
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d5ee + code - 97) // a-z
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ec + code - 48)  // 0-9
    return c
  }).join("")
}

export function getLinkedInAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_CALLBACK_URL,
    scope: SCOPES,
    state,
  })
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`
}

export const getLinkedInOrgAuthUrl = getLinkedInAuthUrl

export async function exchangeLinkedInCode(code: string): Promise<{ access_token: string }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: LINKEDIN_CALLBACK_URL,
    client_id: LINKEDIN_CLIENT_ID,
    client_secret: LINKEDIN_CLIENT_SECRET,
  })
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })
  if (!res.ok) throw new Error(`LinkedIn token exchange failed: ${await res.text()}`)
  return res.json()
}

export async function getLinkedInProfile(accessToken: string): Promise<{ id: string; name: string }> {
  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`LinkedIn profile fetch failed: ${await res.text()}`)
  const data = await res.json()
  return {
    id: data.sub as string,
    name: (`${data.given_name || ""} ${data.family_name || ""}`.trim() || (data.email as string) || "LinkedIn User"),
  }
}

export async function getLinkedInAdminOrgs(accessToken: string): Promise<{ id: string; name: string } | null> {
  try {
    const res = await fetch(
      `${LINKEDIN_API}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&count=1`,
      { headers: { Authorization: `Bearer ${accessToken}`, "X-Restli-Protocol-Version": "2.0.0" } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const element = data.elements?.[0]
    if (!element?.organization) return null

    const orgId = (element.organization as string).split(":").pop()!
    const orgRes = await fetch(`${LINKEDIN_API}/organizations/${orgId}?projection=(id,localizedName)`, {
      headers: { Authorization: `Bearer ${accessToken}`, "X-Restli-Protocol-Version": "2.0.0" },
    })
    if (!orgRes.ok) return { id: orgId, name: "LinkedIn Page" }
    const orgData = await orgRes.json()
    return { id: orgId, name: (orgData.localizedName as string) || "LinkedIn Page" }
  } catch {
    return null
  }
}

async function uploadCoverImage(accessToken: string, ownerUrn: string, imageUrl: string): Promise<string> {
  const registerRes = await fetch(`${LINKEDIN_API}/assets?action=registerUpload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: ownerUrn,
        serviceRelationships: [{ relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }],
      },
    }),
  })
  if (!registerRes.ok) throw new Error(`Register upload failed: ${await registerRes.text()}`)
  const { value } = await registerRes.json()
  const uploadUrl: string =
    value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl
  const assetUrn: string = value.asset

  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`)
  const imgBuffer = await imgRes.arrayBuffer()

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: imgBuffer,
  })
  if (!uploadRes.ok && uploadRes.status !== 201) throw new Error(`Image upload failed: ${uploadRes.status}`)
  return assetUrn
}

async function postArticleToLinkedIn(
  accessToken: string,
  authorUrn: string,
  post: { title: string; excerpt: string; slug: string; tags: string[] }
): Promise<string> {
  const blogUrl = `${SITE_URL}/blog/${post.slug}`
  const ogImageUrl = `${SITE_URL}/api/og/blog/${post.slug}`

  const hashtags = post.tags.slice(0, 5).map((t) => `#${t.replace(/[\s-]/g, "")}`).join(" ")
  // Bold title on its own line, then blank line, then excerpt, hashtags, link
  const commentary = `${toBold(post.title)}\n\n${post.excerpt}\n\n${hashtags}\n\n🔗 ${blogUrl}`

  let imageAssetUrn: string | null = null
  try {
    imageAssetUrn = await uploadCoverImage(accessToken, authorUrn, ogImageUrl)
  } catch (e) {
    console.warn("[LinkedIn] cover image upload failed, using link card:", e)
  }

  const shareContent = imageAssetUrn
    ? {
        shareCommentary: { text: commentary },
        shareMediaCategory: "IMAGE",
        media: [{ status: "READY", media: imageAssetUrn, title: { text: post.title } }],
      }
    : {
        shareCommentary: { text: commentary },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            description: { text: post.excerpt.slice(0, 256) },
            originalUrl: blogUrl,
            title: { text: post.title },
          },
        ],
      }

  const res = await fetch(`${LINKEDIN_API}/ugcPosts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: { "com.linkedin.ugc.ShareContent": shareContent },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  })

  if (!res.ok) throw new Error(`LinkedIn post failed (${res.status}): ${await res.text()}`)
  return res.headers.get("x-linkedin-id") || res.headers.get("x-restli-id") || "posted"
}

export type LinkedInPostTarget = "person" | "org" | "both"

export async function postToLinkedInWithTarget(
  secrets: Pick<AdminSecrets, "linkedinAccessToken" | "linkedinPersonId" | "linkedinOrgId">,
  target: LinkedInPostTarget,
  post: { title: string; excerpt: string; slug: string; tags: string[] }
): Promise<{ personPostId?: string; orgPostId?: string }> {
  const { linkedinAccessToken: token, linkedinPersonId, linkedinOrgId } = secrets
  if (!token) throw new Error("LinkedIn not connected")

  const result: { personPostId?: string; orgPostId?: string } = {}

  if ((target === "person" || target === "both") && linkedinPersonId) {
    result.personPostId = await postArticleToLinkedIn(token, `urn:li:person:${linkedinPersonId}`, post)
  }
  if ((target === "org" || target === "both") && linkedinOrgId) {
    result.orgPostId = await postArticleToLinkedIn(token, `urn:li:organization:${linkedinOrgId}`, post)
  }

  return result
}
