"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, ZoomIn, ZoomOut } from "lucide-react"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { tryNativeShare, openWhatsApp, openEmail } from "@/lib/share-utils"
import { ShareButton } from "@/components/shared/share-button"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import type { InvoiceData as TemplateInvoiceData } from "@/components/invoice-templates/data/invoiceTypes"

interface PreviewShellProps {
  children: React.ReactNode
  title: string
  fileName: string
  onBack: () => void
  invoiceData?: TemplateInvoiceData
  templateName?: string
  printRootId?: string
}

export function PreviewShell({
  children,
  title,
  fileName,
  onBack,
  invoiceData,
  templateName,
  printRootId = "preview-print-root",
}: PreviewShellProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoom, setZoom] = useState(1)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = useCallback(async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById(printRootId)
      if (node) {
        await exportNodeToPdf(node, fileName)
        toast({ title: "PDF downloaded!" })
      }
    } catch {
      toast({ title: "Error generating PDF", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }, [fileName, printRootId, toast])

  const handlePrint = useCallback(() => window.print(), [])

  const generateBlob = useCallback(async () => {
    const node = document.getElementById(printRootId)
    if (!node) return null
    const { exportNodeToPdf: pdf } = await import("@/components/invoice-templates/components")
    return pdf(node, fileName, true) as Promise<Blob>
  }, [fileName, printRootId])

  const handleWhatsAppShare = useCallback(async () => {
    setIsGenerating(true)
    try {
      const blob = await generateBlob()
      if (!blob) { setIsGenerating(false); return }
      const msg = `Please find attached: ${title}`
      const shared = await tryNativeShare(blob, fileName, title, msg)
      if (!shared) {
        const dlUrl = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = dlUrl; a.download = fileName; a.click(); URL.revokeObjectURL(dlUrl)
        openWhatsApp(msg)
      }
    } catch { toast({ title: "Failed to share", variant: "destructive" }) }
    finally { setIsGenerating(false) }
  }, [fileName, title, generateBlob, toast])

  const handleEmailShare = useCallback(async () => {
    setIsGenerating(true)
    try {
      const blob = await generateBlob()
      if (!blob) { setIsGenerating(false); return }
      const body = `Dear Sir/Madam,\n\nPlease find attached the document.\n\nBest regards`
      const shared = await tryNativeShare(blob, fileName, title, body)
      if (!shared) {
        const dlUrl = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = dlUrl; a.download = fileName; a.click(); URL.revokeObjectURL(dlUrl)
        openEmail("", title, body)
      }
    } catch { toast({ title: "Failed to send email", variant: "destructive" }) }
    finally { setIsGenerating(false) }
  }, [fileName, title, generateBlob, toast])

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating PDF..." />}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 rounded-full shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-sm font-semibold truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 mr-2 border border-border">
                <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-medium w-10 text-center select-none">{Math.round(zoom * 100)}%</span>
                <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors" onClick={() => setZoom(z => Math.min(3, z + 0.1))}>
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                {invoiceData && templateName && (
                  <ShareButton invoiceData={invoiceData} template={templateName} title={title} />
                )}
                <button onClick={handleWhatsAppShare} title="WhatsApp" className="h-8 w-8 flex items-center justify-center rounded-lg border border-input bg-background shadow-sm hover:bg-accent transition-colors">
                  <img src="/wh.svg" alt="WhatsApp" className="h-4 w-4" />
                </button>
                <button onClick={handleEmailShare} title="Email" className="h-8 w-8 flex items-center justify-center rounded-lg border border-input bg-background shadow-sm hover:bg-accent transition-colors">
                  <img src="/email.svg" alt="Email" className="h-4 w-4" />
                </button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handlePrint}>
                  <Printer className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button size="sm" className="h-8 gap-1.5 text-xs bg-gradient-to-r from-gray-800 to-gray-900 text-white border-0" onClick={handleDownloadPDF}>
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div ref={previewContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          <div className="shadow-2xl rounded-sm overflow-hidden border border-border/50 bg-white" style={{ width: "100%", maxWidth: "210mm", transform: `scale(${zoom})`, transformOrigin: "top center" }}>
            <div id={printRootId}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
