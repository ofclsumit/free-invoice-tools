"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, ZoomIn, ZoomOut } from "lucide-react"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"

interface PreviewShellProps {
  children: React.ReactNode
  title: string
  fileName: string
  onBack: () => void
  printRootId?: string
}

export function PreviewShell({
  children,
  title,
  fileName,
  onBack,
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
          <footer className="w-full max-w-[210mm] mt-8 pb-4 text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
            <p className="mb-1">Made with <span className="text-red-400">&hearts;</span> in India</p>
            <p>&copy; {new Date().getFullYear()} quickinvoicepro.vercel.app &mdash; All rights reserved.</p>
          </footer>
        </div>
      </div>
    </>
  )
}
