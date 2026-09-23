import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/preview/",
        "/share/",
      ],
    },
    sitemap: "https://turnivo.in/sitemap.xml",
  }
}
