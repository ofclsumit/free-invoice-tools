import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { DeliveryChallanClient } from "./delivery-challan-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["delivery-challan"]
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

export default function DeliveryChallanPage() {
  const content = toolContentDictionary["delivery-challan"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<DeliveryChallanClient />} />
  )
}
