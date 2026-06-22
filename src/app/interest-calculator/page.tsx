import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { InterestCalculatorClient } from "./interest-calculator-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["interest-calculator"]
  return generateToolMetadata(content)
}

export default function InterestCalculatorPage() {
  const content = toolContentDictionary["interest-calculator"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<InterestCalculatorClient />} />
  )
}
