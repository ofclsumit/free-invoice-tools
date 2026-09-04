import { Metadata } from "next"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { ResumeGeneratorClient } from "./resume-generator-client"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["resume-generator"]
  return {
    title: content.title,
    description: content.metaDescription,
    openGraph: {
      title: content.title,
      description: content.metaDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.metaDescription,
    },
    alternates: {
      canonical: `https://turnivo.in/${content.slug}`,
    },
  }
}

export default function ResumeGeneratorPage() {
  const content = toolContentDictionary["resume-generator"]
  return (
    <ToolLayout
      {...content}
      description={content.metaDescription}
      schemaUrl={`https://turnivo.in/${content.slug}`}
      tool={<ResumeGeneratorClient />}
    />
  )
}
