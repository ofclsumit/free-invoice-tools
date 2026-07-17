import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { GstSplitCalculatorClient } from "./gst-split-calculator-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["gst-split-calculator"]
  return generateToolMetadata(content)
}

export default function GstSplitCalculatorPage() {
  const content = toolContentDictionary["gst-split-calculator"]
  return (
    <ToolLayout {...content} description={content.metaDescription} schemaUrl={`https://quoteflow.in/${content.slug}`} tool={<GstSplitCalculatorClient />} isUltra={true} />
  )
}
