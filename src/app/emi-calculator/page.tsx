import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { EmiCalculatorClient } from "./emi-calculator-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["emi-calculator"]
  return generateToolMetadata(content)
}

export default function EmiCalculatorPage() {
  const content = toolContentDictionary["emi-calculator"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<EmiCalculatorClient />} isUltra={true} />
  )
}
