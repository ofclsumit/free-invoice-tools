import type { MetadataRoute } from "next"
import { invoiceGeneratorDictionary, quotationGeneratorDictionary, toolContentDictionary } from "@/lib/seo/content-dictionary"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://quotestream.com"

  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },

    // Static info pages
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },

    // Guide pages
    { url: `${baseUrl}/guides/how-to-create-invoice`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/guides/gst-invoice-format`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/guides/quotation-vs-invoice`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ]

  // Add all programmatic routes for Invoice Generator (including variants)
  for (const [key, content] of Object.entries(invoiceGeneratorDictionary)) {
    routes.push({
      url: `${baseUrl}/${content.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: key === "default" ? 0.9 : 0.8,
    })
  }

  // Add all programmatic routes for Quotation Generator
  for (const [, content] of Object.entries(quotationGeneratorDictionary)) {
    routes.push({
      url: `${baseUrl}/${content.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    })
  }

  // Add all tool routes from the main dictionary
  for (const content of Object.values(toolContentDictionary)) {
    routes.push({
      url: `${baseUrl}/${content.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  }

  // Add stand-alone SEO pages (already have their own metadata)
  const extraPages = [
    "rent-receipt-generator",
    "salary-slip-generator",
  ]
  for (const page of extraPages) {
    if (!routes.some(r => r.url === `${baseUrl}/${page}`)) {
      routes.push({
        url: `${baseUrl}/${page}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>()
  return routes.filter(r => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })
}
