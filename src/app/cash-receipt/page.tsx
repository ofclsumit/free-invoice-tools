import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { CashReceiptClient } from "./cash-receipt-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["cash-receipt"]
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

export default function CashReceiptPage() {
  const content = toolContentDictionary["cash-receipt"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<CashReceiptClient />} />
  )
}
