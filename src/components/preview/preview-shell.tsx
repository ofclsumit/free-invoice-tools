"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Share2, ZoomIn, ZoomOut, Loader2, Copy } from "lucide-react"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"

const HeartBeat = () => (
  <span className="inline-block animate-pulse text-red-500" style={{ animationDuration: "1.5s" }}>❤️</span>
)

interface PreviewShellProps {
  children: React.ReactNode
  title: string
  fileName: string
  onBack?: () => void
  printRootId?: string
  hideBack?: boolean
  hideShare?: boolean
  documentType?: string
  template?: string
  documentData?: any
}

export function PreviewShell({
  children,
  title,
  fileName,
  onBack,
  printRootId = "preview-print-root",
  hideBack = false,
  hideShare = false,
  documentType,
  template,
  documentData,
}: PreviewShellProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
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

  // 1. Copy URL Action (Uploads document data to Supabase and copies public share URL)
  const handleShare = useCallback(async () => {
    if (!documentType || !documentData) {
      // Fallback: Copy current page URL to clipboard
      try {
        if (navigator.share) {
          await navigator.share({
            title: fileName,
            text: title,
            url: window.location.href,
          })
        } else {
          await navigator.clipboard.writeText(window.location.href)
          toast({
            title: "URL copied successfully.",
            description: "Anyone with this link can view and download this document.",
          })
        }
      } catch {}
      return
    }

    setIsCopying(true)
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: documentType,
          template: template || "",
          document_data: documentData,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to create public share link")
      }

      const { id } = await res.json()
      const shareUrl = `${window.location.origin}/share/${id}`

      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "URL copied successfully.",
        description: "Anyone with this link can view and download this document.",
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Failed to create public share link",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCopying(false)
    }
  }, [documentType, template, documentData, fileName, title, toast])

  // 2. Native File Sharing (Attached PDF + Template message)
  const handleNativeShare = useCallback(async () => {
    setIsSharing(true)
    try {
      const node = document.getElementById(printRootId)
      if (!node) {
        throw new Error("Preview element not found")
      }

      // Generate the PDF blob using the existing html2canvas/jspdf engine
      const blob = await exportNodeToPdf(node, fileName, true)
      if (!blob) {
        throw new Error("Failed to generate PDF document")
      }

      const file = new File([blob], fileName, { type: "application/pdf" })
      const shareText = `Here is your document "${title}" generated professionally via Turnivo.\n\nCreate invoices, quotations, bills, and more for free at https://turnivo.in 🇮🇳`

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: title,
          text: shareText,
          files: [file],
        })
      } else {
        // Fallback: Download PDF and show warning toast
        const dlUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = dlUrl
        a.download = fileName
        a.click()
        URL.revokeObjectURL(dlUrl)
        toast({
          title: "Native sharing not supported",
          description: "The PDF has been downloaded to your device. You can share it manually!",
        })
      }
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Failed to share document",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }, [fileName, title, printRootId, toast])

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating PDF..." />}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        {/* Glassmorphic Sticky Header */}
        <div className="no-print sticky top-0 z-30 bg-white/70 dark:bg-black/60 backdrop-blur-md border-b border-black/5 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              {!hideBack && onBack && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onBack} 
                  className="h-8 w-8 rounded-full shrink-0 bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 transition-all duration-200 shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h1 className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{title}</h1>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Glassmorphic Zoom Controls */}
              <div className="hidden sm:flex items-center gap-1 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-lg p-0.5 mr-2 border border-black/10 dark:border-white/10 shadow-sm">
                <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white/60 dark:hover:bg-white/10 transition-colors text-slate-800 dark:text-slate-200" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-semibold w-10 text-center select-none text-slate-800 dark:text-slate-200">{Math.round(zoom * 100)}%</span>
                <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white/60 dark:hover:bg-white/10 transition-colors text-slate-800 dark:text-slate-200" onClick={() => setZoom(z => Math.min(3, z + 0.1))}>
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Glassmorphic Action Buttons */}
              <div className="flex items-center gap-1">
                {!hideShare && (
                  <>
                    {/* Copy URL Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1.5 text-xs font-semibold bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:scale-102 active:scale-98" 
                      onClick={handleShare} 
                      disabled={isCopying || isSharing}
                    >
                      {isCopying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">Copy URL</span>
                    </Button>

                    {/* Native Share Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1.5 text-xs font-semibold bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:scale-102 active:scale-98" 
                      onClick={handleNativeShare} 
                      disabled={isCopying || isSharing}
                    >
                      {isSharing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1.5 text-xs font-semibold bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:scale-102 active:scale-98" 
                  onClick={handlePrint}
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </Button>

                {/* Brand Colored Primary Glassmorphic Button */}
                <Button 
                  size="sm" 
                  className="h-8 gap-1.5 text-xs font-bold bg-[#c084fc]/90 hover:bg-[#c084fc] dark:bg-[#c084fc]/80 dark:hover:bg-[#c084fc] text-white dark:text-black border-0 shadow-md shadow-purple-500/10 transition-all hover:scale-102 active:scale-98" 
                  onClick={handleDownloadPDF}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div ref={previewContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          <div className="shadow-2xl rounded-sm overflow-hidden border border-border/50 bg-white animate-in fade-in zoom-in-98 duration-300" style={{ width: "100%", maxWidth: "210mm", transform: `scale(${zoom})`, transformOrigin: "top center" }}>
            <div id={printRootId}>
              {children}
            </div>
          </div>
          <footer className="w-full max-w-[210mm] mt-8 pb-4 text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
            <p className="mb-1">Made with <HeartBeat /> in India</p>
            <p>&copy; {new Date().getFullYear()} {"\uD835\uDE1B\uD835\uDE1C\uD835\uDE19\uD835\uDE15\uD835\uDE10\uD835\uDE1D\uD835\uDE16"}. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </>
  )
}
