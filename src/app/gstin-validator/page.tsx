import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { GstinValidatorClient } from "./gstin-validator-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["gstin-validator"]
  return generateToolMetadata(content)
}

export default function GstinValidatorPage() {
  const content = toolContentDictionary["gstin-validator"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://Turnivo.in/${content.slug}`} tool={<GstinValidatorClient />} isUltra={true} />
  )
}
