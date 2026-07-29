import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ToolLayout } from "@/components/seo/tool-layout"
import { quotationGeneratorDictionary } from "@/lib/seo/content-dictionary"
import { QuotationGenerator } from "@/components/quotation/quotation-generator"

export function generateStaticParams() {
  const types = Object.keys(quotationGeneratorDictionary).filter((key) => key !== "default")
  return [
    { type: [] },
    ...types.map((type) => ({ type: [type] })),
  ]
}

export async function generateMetadata({ params }: { params: Promise<{ type?: string[] }> }): Promise<Metadata> {
  const resolvedParams = await params
  const typeKey = resolvedParams.type?.[0] || "default"
  const content = quotationGeneratorDictionary[typeKey]
  
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

export default async function QuotationGeneratorDynamicPage({ params }: { params: Promise<{ type?: string[] }> }) {
  const resolvedParams = await params
  const typeKey = resolvedParams.type?.[0] || "default"
  const content = quotationGeneratorDictionary[typeKey]

  if (!content) {
    notFound()
  }

  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://Turnivo.in/${content.slug}`} tool={<QuotationGenerator />} />
  )
}
