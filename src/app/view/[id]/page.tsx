import { prisma } from "@/lib/prisma/client"
import { notFound } from "next/navigation"
import { SharedDocumentView } from "./shared-document-view"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ d?: string }>
}) {
  const { id } = await params
  const sp = await searchParams

  if (sp.d) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-[210mm] mx-auto">
          <SharedDocumentView encodedData={sp.d} />
        </div>
      </div>
    )
  }

  const link = await prisma.shareLink.findUnique({ where: { id } })

  if (!link || new Date() > link.expiresAt) {
    notFound()
  }

  const { invoiceData, template } = JSON.parse(link.data)

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-[210mm] mx-auto">
        <SharedDocumentView invoiceData={invoiceData} template={template || "StudioTemplate"} />
      </div>
    </div>
  )
}
