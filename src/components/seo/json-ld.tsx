import Script from "next/script"
export function JsonLd({ data }: { data: any }) {
  return (
    <Script
      id="seo-json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
