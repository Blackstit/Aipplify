import { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aipplify.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/recruiter/", "/profile", "/auth"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
