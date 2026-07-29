import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { RentReceiptClient } from "./rent-receipt-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["rent-receipt"]
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

export default function RentReceiptPage() {
  const content = toolContentDictionary["rent-receipt"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://Turnivo.in/${content.slug}`} tool={<RentReceiptClient />} />
  )
}
