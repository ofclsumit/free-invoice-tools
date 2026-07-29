import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ToolLayout } from "@/components/seo/tool-layout"
import { invoiceGeneratorDictionary } from "@/lib/seo/content-dictionary"
import { InvoiceGenerator } from "@/components/invoice/invoice-generator"

// Generate static routes for all dictionary entries
export function generateStaticParams() {
  const types = Object.keys(invoiceGeneratorDictionary).filter((key) => key !== "default")
  return [
    { type: [] }, // Root /invoice-generator
    ...types.map((type) => ({ type: [type] })),
  ]
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: { params: Promise<{ type?: string[] }> }): Promise<Metadata> {
  const resolvedParams = await params
  const typeKey = resolvedParams.type?.[0] || "default"
  const content = invoiceGeneratorDictionary[typeKey]
  
  if (!content) {
    return {}
  }

  return {
    title: content.title,
    description: content.metaDescription,
    openGraph: {
      title: content.title,
      description: content.metaDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.metaDescription,
    },
    alternates: {
      canonical: `https://Turnivo.in/${content.slug}`,
    },
  }
}

export default async function InvoiceGeneratorDynamicPage({ params }: { params: Promise<{ type?: string[] }> }) {
  const resolvedParams = await params
  const typeKey = resolvedParams.type?.[0] || "default"
  const content = invoiceGeneratorDictionary[typeKey]

  if (!content) {
    notFound()
  }

  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://Turnivo.in/${content.slug}`} tool={<InvoiceGenerator />} />
  )
}
