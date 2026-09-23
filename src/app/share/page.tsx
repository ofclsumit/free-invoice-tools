import Link from "next/link"
import { ShareClient } from "./[documentId]/share-client"
import { decodeShareData } from "@/lib/share-utils"

interface PageProps {
  searchParams: Promise<{ d?: string }>
}

export default async function ShareRootPage({ searchParams }: PageProps) {
  const { d } = await searchParams
  let documentData: any = null
  let documentType = ""
  let template = ""

  if (d) {
    try {
      const decoded = decodeShareData(d) as any
      if (decoded) {
        documentData = decoded.invoiceData || decoded.data || decoded
        documentType = decoded.template || decoded.docType || "invoice"
        template = decoded.template || ""
      }
    } catch {
      documentData = null
    }
  }

  if (!documentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="text-center max-w-sm w-full bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 border border-border">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-semibold mb-2 text-foreground">Document Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This document link is invalid or has expired.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-4 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium text-sm hover:opacity-95 shadow-md shadow-blue-500/10 transition-opacity"
          >
            Go to TURNIVO
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 dark:bg-gray-950">
      <div className="max-w-[210mm] mx-auto">
        <ShareClient
          documentData={documentData}
          documentType={documentType}
          template={template}
        />
      </div>
    </div>
  )
}
