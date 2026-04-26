import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeSecrets } from "@/lib/admin-secrets"
import { getLinkedInAuthUrl, getLinkedInOrgAuthUrl } from "@/lib/linkedin"
import { randomBytes } from "crypto"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = request.headers.get("x-user-id") || searchParams.get("x-user-id")

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  }).catch(() => null)

  if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const withOrg = searchParams.get("org") === "1"
  const state = randomBytes(16).toString("hex")
  writeSecrets({ linkedinOAuthState: state })

  const authUrl = withOrg ? getLinkedInOrgAuthUrl(state) : getLinkedInAuthUrl(state)
  return NextResponse.redirect(authUrl)
}
