import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { ProfitMarginClient } from "./profit-margin-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["profit-margin"]
  return generateToolMetadata(content)
}

export default function ProfitMarginPage() {
  const content = toolContentDictionary["profit-margin"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<ProfitMarginClient />} />
  )
}
