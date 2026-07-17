import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { GstCalculatorClient } from "./gst-calculator-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["gst-calculator"]
  return generateToolMetadata(content)
}

export default function GstCalculatorPage() {
  const content = toolContentDictionary["gst-calculator"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<GstCalculatorClient />} isUltra={true} />
  )
}
