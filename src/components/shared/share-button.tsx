"use client"

import { useState, useRef, useEffect } from "react"
import { Share2, X, Copy, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import QRCode from "qrcode"
import { buildShareUrl } from "@/lib/share-utils"
import { TurnivoDialog } from "@/components/ui/turnivo-dialog"

interface ShareButtonProps {
  invoiceData: any
  template: string
  title?: string
  disabled?: boolean
}

export function ShareButton({ invoiceData, template, title, disabled }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const prevMousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!showModal) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [showModal])

  const handleShare = async () => {
    if (disabled) return
    setIsLoading(true)
    setError("")
    try {
      const url = buildShareUrl({ invoiceData, template, title, _t: Date.now() })
      setShareUrl(url)
      const qr = await QRCode.toDataURL(url, { width: 256, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
      setQrDataUrl(qr)
      setShowModal(true)
      toast({ title: "Share link created!" })
    } catch (e: any) {
      setError(e.message || "Failed to create share link")
      toast({ title: "Failed to create share link", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast({ title: "Link copied to clipboard!" })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQR = () => {
    const link = document.createElement("a")
    link.download = `share-qr-${Date.now()}.png`
    link.href = qrDataUrl
    link.click()
  }

  return (
    <>
      <button
        onClick={handleShare}
        disabled={disabled || isLoading}
        title="Share via link"
        className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm transition-colors ${
          disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-accent cursor-pointer"
        }`}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
      </button>

      <TurnivoDialog
        open={showModal}
        onOpenChange={setShowModal}
        title="Share Document"
        description="Share this document via link or QR code."
        maxWidth="sm"
        footer={
          <div className="flex gap-2 w-full">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleDownloadQR}>
              Download QR
            </Button>
            <Button size="sm" className="flex-1 text-xs" onClick={handleCopyLink}>
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {qrDataUrl && (
            <div className="flex justify-center">
              <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 rounded-xl border border-border" />
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-200 dark:border-white/10">
            <span className="text-xs truncate flex-1 font-mono text-slate-700 dark:text-slate-300">{shareUrl}</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="shrink-0 h-7 w-7 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Copy share URL"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
      </TurnivoDialog>
    </>
  )
}
