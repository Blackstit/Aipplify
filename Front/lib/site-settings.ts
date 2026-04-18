import { prisma } from "@/lib/prisma"

const SITE_ID = "default" as const

export type PublicSiteSettings = {
  showPublicJobViewCounts: boolean
  showPublicWatchingCount: boolean
}

export async function getSiteSettings(): Promise<PublicSiteSettings> {
  const row = await prisma.siteSettings.upsert({
    where: { id: SITE_ID },
    create: { id: SITE_ID },
    update: {},
    select: {
      showPublicJobViewCounts: true,
      showPublicWatchingCount: true,
    },
  })
  return row
}

export async function updateSiteSettings(data: Partial<PublicSiteSettings>) {
  const payload: Partial<PublicSiteSettings> = {}
  if (typeof data.showPublicJobViewCounts === "boolean") {
    payload.showPublicJobViewCounts = data.showPublicJobViewCounts
  }
  if (typeof data.showPublicWatchingCount === "boolean") {
    payload.showPublicWatchingCount = data.showPublicWatchingCount
  }
  return prisma.siteSettings.upsert({
    where: { id: SITE_ID },
    create: { id: SITE_ID, ...payload },
    update: payload,
  })
}
