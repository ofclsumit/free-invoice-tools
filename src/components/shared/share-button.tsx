"use client"

import { useState, useRef, useEffect } from "react"
import { Share2, X, Copy, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import QRCode from "qrcode"

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
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceData, template, title }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create share link")
      }
      const { id } = await res.json()
      const baseUrl = window.location.origin
      const url = `${baseUrl}/view/${id}`
      setShareUrl(url)

      const qr = await QRCode.toDataURL(url, { width: 256, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
      setQrDataUrl(qr)
      setShowModal(true)
      toast({ title: "Share link created! Valid for 15 minutes." })
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-display font-semibold mb-1">Share Document</h3>
            <p className="text-xs text-muted-foreground mb-4">This link will expire in 15 minutes.</p>

            {qrDataUrl && (
              <div className="flex justify-center mb-4">
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-xl border border-border" />
              </div>
            )}

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-border mb-3">
              <span className="text-xs truncate flex-1 font-mono">{shareUrl}</span>
              <button
                onClick={handleCopyLink}
                className="shrink-0 h-7 w-7 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleDownloadQR}>
                Download QR
              </Button>
              <Button size="sm" className="flex-1 text-xs" onClick={handleCopyLink}>
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
