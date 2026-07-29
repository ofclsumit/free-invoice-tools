import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { DiscountCalculatorClient } from "./discount-calculator-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["discount-calculator"]
  return generateToolMetadata(content)
}

export default function DiscountCalculatorPage() {
  const content = toolContentDictionary["discount-calculator"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://Turnivo.in/${content.slug}`} tool={<DiscountCalculatorClient />} isUltra={true} />
  )
}
