import Script from "next/script"

type SchemaType = "Article" | "FAQPage" | "SoftwareApplication" | "BreadcrumbList"

interface SchemaProps {
  type: SchemaType
  data: any
}

export function SchemaMarkup({ type, data }: SchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  }

  return (
    <Script
      id={`schema-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  )
}
