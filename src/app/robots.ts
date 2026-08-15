import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/dashboard",
        "/account",
        "/settings",
        "/admin",
        "/preview/",
        "/share/",
        "/api/",
      ],
    },
    sitemap: "https://turnivo.in/sitemap.xml",
  }
}
