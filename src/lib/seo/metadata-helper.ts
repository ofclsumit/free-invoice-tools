import { Metadata } from "next"
import { toolContentDictionary, invoiceGeneratorDictionary, quotationGeneratorDictionary, SeoContent } from "./content-dictionary"

export function getToolContent(slug: string): SeoContent | null {
  return toolContentDictionary[slug] || null
}

export function generateToolMetadata(content: SeoContent): Metadata {
  return {
    title: content.title,
    description: content.metaDescription,
    openGraph: {
      title: content.title,
      description: content.metaDescription,
      type: "website",
      siteName: "QuoteFlow",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.metaDescription,
    },
    alternates: {
      canonical: `https://quoteflow.in/${content.slug}`,
    },
  }
}

export function getAllContentSlugs(): string[] {
  const invoiceSlugs = Object.values(invoiceGeneratorDictionary).map(c => c.slug)
  const quotationSlugs = Object.values(quotationGeneratorDictionary).map(c => c.slug)
  const toolSlugs = Object.keys(toolContentDictionary)
  return [...new Set([...invoiceSlugs, ...quotationSlugs, ...toolSlugs])]
}
