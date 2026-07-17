import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { BreakEvenCalculatorClient } from "./break-even-calculator-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["break-even-calculator"]
  return generateToolMetadata(content)
}

export default function BreakEvenCalculatorPage() {
  const content = toolContentDictionary["break-even-calculator"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<BreakEvenCalculatorClient />} isUltra={true} />
  )
}
