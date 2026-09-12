"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Printer,
  Share2,
  ZoomIn,
  ZoomOut,
  Loader2,
  Download,
} from "lucide-react"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { useToast } from "@/hooks/use-toast"
import { trackPreview, trackShare, trackPdfDownload } from "@/lib/analytics/tracker"

const HeartBeat = () => (
  <span className="inline-block animate-pulse text-red-500" style={{ animationDuration: "1.5s" }}>
    ❤️
  </span>
)

const A4_WIDTH_PX = 793.7 // 210mm at 96 DPI
const A4_HEIGHT_PX = 1122.5 // 297mm at 96 DPI
const MIN_ZOOM = 0.3
const MAX_ZOOM = 3.0
const ZOOM_STEPS = [0.35, 0.45, 0.55, 0.7, 0.85, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0]

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
  const [isSharing, setIsSharing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Track preview event on mount
  useEffect(() => {
    if (documentType) {
      trackPreview(documentType)
    }
  }, [documentType])

  // Viewport & Zoom / Pan State
  const [zoom, setZoom] = useState<number>(1)
  const [panX, setPanX] = useState<number>(0)
  const [panY, setPanY] = useState<number>(0)
  const [fitScale, setFitScale] = useState<number>(1)
  const [fitScreenScale, setFitScreenScale] = useState<number>(1)
  const [isGesturing, setIsGesturing] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  const viewportRef = useRef<HTMLDivElement>(null)
  const contentWrapperRef = useRef<HTMLDivElement>(null)
  const docContainerRef = useRef<HTMLDivElement>(null)

  // Gesture state tracking refs
  const touchStateRef = useRef<{
    initialDist: number
    initialZoom: number
    midpointX: number
    midpointY: number
    startX: number
    startY: number
    startPanX: number
    startPanY: number
    lastTapTime: number
    isPinching: boolean
    isPanning: boolean
  }>({
    initialDist: 0,
    initialZoom: 1,
    midpointX: 0,
    midpointY: 0,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    lastTapTime: 0,
    isPinching: false,
    isPanning: false,
  })

  // Calculate Responsive Fit Scales based on container dimensions
  const updateFitScales = useCallback(() => {
    if (!viewportRef.current) return

    const rect = viewportRef.current.getBoundingClientRect()
    const viewportWidth = rect.width
    const viewportHeight = rect.height

    if (viewportWidth <= 0) return

    // Safe padding around document
    const horizontalPad = viewportWidth < 480 ? 16 : viewportWidth < 768 ? 32 : 48
    const verticalPad = viewportWidth < 480 ? 24 : 48

    const availableW = Math.max(260, viewportWidth - horizontalPad)
    const availableH = Math.max(300, viewportHeight - verticalPad)

    // Calculate fit width
    const calculatedFitWidth = Math.min(availableW / A4_WIDTH_PX, 1.0)
    // Calculate fit full page height
    const calculatedFitScreen = Math.min(availableW / A4_WIDTH_PX, availableH / A4_HEIGHT_PX, 1.0)

    setFitScale(calculatedFitWidth)
    setFitScreenScale(calculatedFitScreen)

    return { fitWidth: calculatedFitWidth, fitScreen: calculatedFitScreen }
  }, [])

  // Initial Auto-Fit on Mount and Window Resize / Orientation Change
  useEffect(() => {
    setMounted(true)
    const scales = updateFitScales()
    if (scales) {
      // On mobile viewports (< 768px), default to fit width for immediate full A4 visibility
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setZoom(scales.fitWidth)
      } else {
        // On desktop, default to 1.0 (100%) or fitWidth if screen is narrow
        setZoom(Math.min(1.0, scales.fitWidth))
      }
    }

    const handleResize = () => {
      const res = updateFitScales()
      if (res && typeof window !== "undefined" && window.innerWidth < 768) {
        // Keep fitted on mobile orientation change
        setZoom((prevZoom) => {
          // If user was roughly at fit scale, re-align to new fit scale
          if (Math.abs(prevZoom - fitScale) < 0.1) {
            return res.fitWidth
          }
          return prevZoom
        })
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)

    // ResizeObserver for container size shifts
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined" && viewportRef.current) {
      ro = new ResizeObserver(() => {
        handleResize()
      })
      ro.observe(viewportRef.current)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
      ro?.disconnect()
    }
  }, [updateFitScales])

  // Zoom In / Out Handlers with smooth stepping
  const handleZoomIn = useCallback(() => {
    setZoom((curr) => {
      const next = ZOOM_STEPS.find((s) => s > curr + 0.04) || Math.min(MAX_ZOOM, curr + 0.15)
      return Math.min(MAX_ZOOM, Number(next.toFixed(2)))
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((curr) => {
      const prev = [...ZOOM_STEPS].reverse().find((s) => s < curr - 0.04) || Math.max(MIN_ZOOM, curr - 0.15)
      return Math.max(MIN_ZOOM, Number(prev.toFixed(2)))
    })
  }, [])

  const handleFitToWidth = useCallback(() => {
    const scales = updateFitScales()
    if (scales) {
      setZoom(Number(scales.fitWidth.toFixed(2)))
      setPanX(0)
      setPanY(0)
    }
  }, [updateFitScales])

  const handleResetZoom100 = useCallback(() => {
    setZoom(1.0)
    setPanX(0)
    setPanY(0)
  }, [])

  // Keyboard Shortcuts (+, -, 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return
      }

      if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault()
        handleZoomOut()
      } else if (e.key === "0") {
        e.preventDefault()
        handleFitToWidth()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleZoomIn, handleZoomOut, handleFitToWidth])

  // Desktop Mouse Wheel Zoom (Ctrl + Wheel)
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.08 : -0.08
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((z + delta).toFixed(2)))))
    }
  }, [])

  // Touch Gesture Engine: Multi-Touch Pinch Zoom + 1-Finger Pan + Double Tap
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      const state = touchStateRef.current

      if (e.touches.length === 2) {
        // 2-Finger Pinch Start
        e.preventDefault()
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        state.initialDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        state.initialZoom = zoom
        state.midpointX = (t1.clientX + t2.clientX) / 2
        state.midpointY = (t1.clientY + t2.clientY) / 2
        state.isPinching = true
        state.isPanning = false
        setIsGesturing(true)
      } else if (e.touches.length === 1) {
        // 1-Finger Pan or Tap
        const t1 = e.touches[0]
        state.startX = t1.clientX
        state.startY = t1.clientY
        state.startPanX = panX
        state.startPanY = panY
        state.isPinching = false
        state.isPanning = true

        // Double-Tap Detection
        const now = Date.now()
        if (now - state.lastTapTime < 300) {
          // Double tapped!
          e.preventDefault()
          if (Math.abs(zoom - fitScale) < 0.08) {
            // Zoom in to comfortable 1.25x reading scale
            setZoom(1.25)
          } else {
            // Return to fit scale
            setZoom(fitScale)
            setPanX(0)
            setPanY(0)
          }
          state.lastTapTime = 0
          return
        }
        state.lastTapTime = now
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      const state = touchStateRef.current

      if (e.touches.length === 2 && state.isPinching) {
        // Pinching in progress
        e.preventDefault()
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        if (state.initialDist > 0) {
          const ratio = dist / state.initialDist
          const targetZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, state.initialZoom * ratio))
          setZoom(Number(targetZoom.toFixed(3)))
        }
      } else if (e.touches.length === 1 && state.isPanning && zoom > fitScale * 1.05) {
        // Panning when zoomed in
        const t1 = e.touches[0]
        const dx = t1.clientX - state.startX
        const dy = t1.clientY - state.startY

        // Only hijack event if movement is significant
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          setIsGesturing(true)
          const newPanX = state.startPanX + dx
          const newPanY = state.startPanY + dy

          // Soft boundary clamping
          const maxPanX = Math.max(40, (A4_WIDTH_PX * zoom) / 2)
          setPanX(Math.max(-maxPanX, Math.min(maxPanX, newPanX)))
          setPanY(Math.max(-300, Math.min(300, newPanY)))
        }
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      const state = touchStateRef.current
      if (e.touches.length === 0) {
        state.isPinching = false
        state.isPanning = false
        setIsGesturing(false)

        // Reset pan if zoom returned to fitScale
        if (zoom <= fitScale * 1.02) {
          setPanX(0)
          setPanY(0)
        }
      } else if (e.touches.length === 1) {
        state.isPinching = false
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: false })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)
    el.addEventListener("touchcancel", onTouchEnd)

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [zoom, panX, panY, fitScale])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // Native File Sharing
  const handleNativeShare = useCallback(async () => {
    setIsSharing(true)
    try {
      const node = document.getElementById(printRootId)
      if (!node) throw new Error("Document element not found")

      const blob = await exportNodeToPdf(node, fileName, true)
      if (!blob) throw new Error("Failed to generate PDF")

      const file = new File([blob], fileName, { type: "application/pdf" })
      const shareText = `Here is your document "${title}" generated professionally on Turnivo.\n\nCreate free invoices, reports, and receipts at https://turnivo.in 🇮🇳`

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: title,
          text: shareText,
          files: [file],
        })
        trackShare(documentType || "invoice")
      } else {
        const dlUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = dlUrl
        a.download = fileName
        a.click()
        URL.revokeObjectURL(dlUrl)
        trackPdfDownload(documentType || "invoice")
        toast({
          title: "Downloaded to your device",
          description: "Native sharing is not supported by your browser. The PDF is saved!",
        })
      }
    } catch (err: any) {
      toast({
        title: "Failed to share document",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }, [fileName, title, printRootId, toast, documentType])

  const handleDownloadPdf = useCallback(async () => {
    setIsDownloading(true)
    try {
      const node = document.getElementById(printRootId)
      if (!node) throw new Error("Document element not found")

      await exportNodeToPdf(node, fileName, false, documentType)
      toast({
        title: "Download Started",
        description: `"${fileName}" is saving to your device.`,
      })
    } catch (err: any) {
      toast({
        title: "Failed to generate PDF",
        description: err?.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }, [fileName, printRootId, documentType, toast])

  const currentZoomPercentage = Math.round(zoom * 100)

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0E1A] flex flex-col select-none overflow-hidden">
        {/* ============================================================ */}
        {/* TOP TOOLBAR: FULLY RESPONSIVE ACROSS 320px TO DESKTOP */}
        {/* ============================================================ */}
        <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-[#0F1422]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-xs">
          <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-1.5 sm:gap-3">
            {/* Left: Back to Edit / Document Title */}
            <div className="flex items-center gap-2 min-w-0 shrink">
              {!hideBack && onBack && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="h-8.5 px-2.5 sm:px-3 rounded-xl shrink-0 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors shadow-2xs"
                  aria-label="Back to Edit"
                >
                  <ArrowLeft className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden xs:inline">Back</span>
                </Button>
              )}
              <h1 className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-white hidden md:block max-w-[200px] lg:max-w-[320px]">
                {title}
              </h1>
            </div>

            {/* Center: Universal Zoom & Pan Controls Pill */}
            <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-0.5 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= MIN_ZOOM}
                className="h-7.5 w-7.5 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Zoom Out"
                title="Zoom Out (-)"
              >
                <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (Math.abs(zoom - fitScale) < 0.05) {
                    handleResetZoom100()
                  } else {
                    handleFitToWidth()
                  }
                }}
                className="px-1.5 sm:px-2.5 h-7.5 sm:h-8 flex items-center justify-center text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-mono min-w-[42px] sm:min-w-[48px]"
                aria-label="Current Zoom Percentage"
                title="Click to toggle Fit Width / 100%"
              >
                {currentZoomPercentage}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= MAX_ZOOM}
                className="h-7.5 w-7.5 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Zoom In"
                title="Zoom In (+)"
              >
                <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-0.5" />

              <button
                type="button"
                onClick={handleFitToWidth}
                className={`px-2 sm:px-2.5 h-7.5 sm:h-8 flex items-center justify-center rounded-lg text-[10.5px] sm:text-xs font-bold transition-all ${
                  Math.abs(zoom - fitScale) < 0.05
                    ? "bg-white dark:bg-white/15 text-violet-600 dark:text-violet-300 shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10"
                }`}
                aria-label="Fit to Screen"
                title="Fit to Screen Width (0)"
              >
                Fit
              </button>
            </div>

            {/* Right: Actions (Share, Print) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {!hideShare && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8.5 gap-1.5 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 shadow-2xs transition-colors"
                  onClick={handleNativeShare}
                  disabled={isSharing || isDownloading}
                  aria-label="Share Document"
                >
                  {isSharing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span className="hidden xs:inline">Share</span>
                </Button>
              )}

              {/* Download PDF Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 gap-1.5 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 shadow-2xs transition-colors"
                onClick={handleDownloadPdf}
                disabled={isDownloading || isSharing}
                aria-label="Download PDF"
              >
                {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />}
                <span className="hidden sm:inline">Download PDF</span>
              </Button>

              {/* Primary Print Button */}
              <Button
                size="sm"
                className="h-8.5 px-3.5 sm:px-4 gap-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-md shadow-violet-500/20 active:scale-98 transition-all"
                onClick={handlePrint}
                aria-label="Print Document"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print</span>
              </Button>
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* VIEWPORT CANVAS (TOUCH PINCH-TO-ZOOM + PAN + CENTERING) */}
        {/* ============================================================ */}
        <main
          ref={viewportRef}
          onWheel={handleWheel}
          className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-x-auto overflow-y-auto relative touch-pan-y"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div
            ref={contentWrapperRef}
            className="min-h-full w-full py-4 sm:py-8 px-2 sm:px-6 flex flex-col items-center justify-start relative"
          >
            {/* Visual Scaling Spacer: Maintains Exact Document Bounds for Scrolling */}
            <div
              className="preview-scaling-spacer"
              style={{
                width: `${A4_WIDTH_PX * zoom}px`,
                maxWidth: "none",
                position: "relative",
                margin: "0 auto",
                transform: `translate3d(${panX}px, ${panY}px, 0)`,
                transition: isGesturing
                  ? "none"
                  : "transform 0.18s cubic-bezier(0.25, 1, 0.5, 1), width 0.18s cubic-bezier(0.25, 1, 0.5, 1)",
                willChange: "transform, width",
              }}
            >
              {/* Inner Scaled Canvas: Physical Fixed A4 Document Layout */}
              <div
                className="preview-scaled-canvas"
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  minWidth: `${A4_WIDTH_PX}px`,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  transition: isGesturing ? "none" : "transform 0.18s cubic-bezier(0.25, 1, 0.5, 1)",
                  willChange: "transform",
                }}
              >
                {/* Visual A4 Paper Container with Clean Paper Shadow */}
                <div
                  ref={docContainerRef}
                  className="preview-paper-container bg-white text-slate-900 rounded-xs shadow-[0_4px_24px_-2px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.06)] border border-slate-200/80 dark:border-white/10"
                  style={{
                    width: `${A4_WIDTH_PX}px`,
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                >
                  {/* Clean unscaled HTML Document Root for PDF Exporter */}
                  <div id={printRootId}>
                    {children}
                  </div>
                </div>
              </div>
            </div>

            {/* Viewer Footer */}
            <footer className="w-full max-w-[210mm] mt-8 pb-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-white/10 pt-4">
              <p className="mb-1">
                Made with <HeartBeat /> in India
              </p>
              <p>&copy; {new Date().getFullYear()} TURNIVO. All rights reserved.</p>
            </footer>
          </div>
        </main>
      </div>
    </>
  )
}
