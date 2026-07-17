import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { GstRateFinderClient } from "./gst-rate-finder-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["gst-rate-finder"]
  return generateToolMetadata(content)
}

export default function GstRateFinderPage() {
  const content = toolContentDictionary["gst-rate-finder"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<GstRateFinderClient />} isUltra={true} />
  )
}
