import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { ReverseGstCalculatorClient } from "./reverse-gst-calculator-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["reverse-gst-calculator"]
  return generateToolMetadata(content)
}

export default function ReverseGstCalculatorPage() {
  const content = toolContentDictionary["reverse-gst-calculator"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://Turnivo.in/${content.slug}`} tool={<ReverseGstCalculatorClient />} isUltra={true} />
  )
}
