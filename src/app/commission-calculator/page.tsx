import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { CommissionCalculatorClient } from "./commission-calculator-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["commission-calculator"]
  return generateToolMetadata(content)
}

export default function CommissionCalculatorPage() {
  const content = toolContentDictionary["commission-calculator"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<CommissionCalculatorClient />} />
  )
}
