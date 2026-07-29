import { supabase } from "@/lib/supabase/client"
import { prisma } from "@/lib/prisma/client"
import Link from "next/link"
import { ShareClient } from "./share-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface PageProps {
  params: Promise<{ documentId: string }>
}

export default async function SharePage({ params }: PageProps) {
  const { documentId } = await params
  let documentData: any = null
  let documentType = ""
  let template = ""

  try {
    // 1. Try to load from Supabase if configured
    if (supabase) {
      const { data, error } = await supabase
        .from("shared_documents")
        .select("*")
        .eq("id", documentId)
        .maybeSingle()

      if (!error && data) {
        documentData = data.document_data
        documentType = data.document_type
        template = data.template
      }
    }

    // 2. Fall back to local SQLite if document not found in Supabase or Supabase is offline
    if (!documentData) {
      const link = await prisma.shareLink.findUnique({
        where: { id: documentId },
      })

      if (link) {
        const payload = JSON.parse(link.data)
        documentData = payload
        documentType = payload.docType || "template"
        template = payload.templateName || ""
      }
    }
  } catch (error) {
    console.error("Error retrieving shared document:", error)
  }

  // 3. Render clean 404 if document doesn't exist
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
            This document does not exist or has been removed.
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
