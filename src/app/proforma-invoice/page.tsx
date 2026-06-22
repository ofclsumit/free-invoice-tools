import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { ProformaInvoiceClient } from "./proforma-invoice-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["proforma-invoice"]
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
      canonical: `https://quoteflow.in/${content.slug}`,
    },
  }
}

export default function ProformaInvoicePage() {
  const content = toolContentDictionary["proforma-invoice"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<ProformaInvoiceClient />} />
  )
}
