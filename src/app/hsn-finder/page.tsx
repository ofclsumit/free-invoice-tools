import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { HsnFinderClient } from "./hsn-finder-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["hsn-finder"]
  return generateToolMetadata(content)
}

export default function HsnFinderPage() {
  const content = toolContentDictionary["hsn-finder"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://Turnivo.in/${content.slug}`} tool={<HsnFinderClient />} isUltra={true} />
  )
}
