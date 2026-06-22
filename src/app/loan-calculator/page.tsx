import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { LoanCalculatorClient } from "./loan-calculator-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["loan-calculator"]
  return generateToolMetadata(content)
}

export default function LoanCalculatorPage() {
  const content = toolContentDictionary["loan-calculator"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<LoanCalculatorClient />} />
  )
}
