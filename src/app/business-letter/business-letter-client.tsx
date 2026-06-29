"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Download, Eye, X, ZoomIn, ZoomOut, RotateCcw, Printer, Plus, Trash2, Save
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { tryNativeShare, generateShareUrl, openWhatsApp, openEmail } from "@/lib/share-utils"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"

const STORAGE_KEY = "qf_business_letter"

interface LetterData {
  senderName: string; senderCompany: string; senderAddress: string
  recipientName: string; recipientCompany: string; recipientAddress: string
  letterDate: string; subject: string; letterBody: string; signature: string; companyLogo: string
}

function loadSaved(): LetterData | null {
  if (typeof window === "undefined") return null
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null } catch { return null }
}

function saveData(data: LetterData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function BusinessLetterClient() {
  const { toast } = useToast()
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoom, setZoom] = useState(1)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const [senderName, setSenderName] = useState("")
  const [senderCompany, setSenderCompany] = useState("")
  const [senderAddress, setSenderAddress] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [recipientCompany, setRecipientCompany] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split("T")[0])
  const [subject, setSubject] = useState("")
  const [letterBody, setLetterBody] = useState("")
  const [signature, setSignature] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onloadend = () => setCompanyLogo(r.result as string); r.readAsDataURL(file) }
  }

  const validate = useCallback(() => {
    if (!senderName) { toast({ title: "Sender name is required", variant: "destructive" }); return false }
    if (!recipientName) { toast({ title: "Recipient name is required", variant: "destructive" }); return false }
    return true
  }, [senderName, recipientName, toast])

  const togglePreview = useCallback(() => {
    if (showPreview) setShowPreview(false); else if (validate()) setShowPreview(true)
  }, [showPreview, validate])

  const handleDownloadPDF = async (returnBlob?: boolean): Promise<Blob | void> => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("letter-print-root")
      if (node) {
        const blob = await exportNodeToPdf(node, `business-letter-${subject || "draft"}.pdf`, true)
        if (returnBlob) return blob; toast({ title: "Letter PDF downloaded!" })
      }
    } catch { toast({ title: "Error generating PDF", variant: "destructive" }) } finally { setIsGenerating(false) }
  }

  const handlePrint = () => window.print()

  const getState = useCallback((): LetterData => ({ senderName, senderCompany, senderAddress, recipientName, recipientCompany, recipientAddress, letterDate, subject, letterBody, signature, companyLogo }), [senderName, senderCompany, senderAddress, recipientName, recipientCompany, recipientAddress, letterDate, subject, letterBody, signature, companyLogo])
  const setState = useCallback((d: LetterData) => {
    setSenderName(d.senderName || ""); setSenderCompany(d.senderCompany || ""); setSenderAddress(d.senderAddress || "")
    setRecipientName(d.recipientName || ""); setRecipientCompany(d.recipientCompany || ""); setRecipientAddress(d.recipientAddress || "")
    setLetterDate(d.letterDate || new Date().toISOString().split("T")[0]); setSubject(d.subject || ""); setLetterBody(d.letterBody || ""); setSignature(d.signature || ""); setCompanyLogo(d.companyLogo || "")
  }, [])

  const handleSave = () => { if (!validate()) return; saveData(getState()); toast({ title: "Letter saved as draft!" }) }
  const handleRevert = () => { const s = loadSaved(); if (!s) { toast({ title: "No saved letter found", variant: "destructive" }); return }; setState(s); toast({ title: "Reverted to saved draft" }) }

  const handleWhatsAppShare = async () => {
    if (!validate()) return; setIsGenerating(true)
    try {
      const node = document.getElementById("letter-print-root")
      if (!node) { toast({ title: "Could not generate PDF", variant: "destructive" }); setIsGenerating(false); return }
      const fileName = `business-letter-${subject || "letter"}.pdf`
      const blob = await exportNodeToPdf(node, fileName, true)
      const msg = `Business Letter: ${subject || "Letter"}`
      const shared = await tryNativeShare(blob, fileName, msg, msg)
      if (!shared) {
        const dlUrl = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = dlUrl; a.download = fileName; a.click(); URL.revokeObjectURL(dlUrl)
        openWhatsApp(msg)
      }
    } catch { toast({ title: "Failed to share", variant: "destructive" }) } finally { setIsGenerating(false) }
  }

  const handleEmailReceipt = async () => {
    if (!validate()) return; setIsGenerating(true)
    try {
      const node = document.getElementById("letter-print-root")
      if (!node) { toast({ title: "Could not generate PDF", variant: "destructive" }); setIsGenerating(false); return }
      const fileName = `business-letter-${subject || "letter"}.pdf`
      const blob = await exportNodeToPdf(node, fileName, true)
      const body = `Dear ${recipientName},\n\nPlease find attached the letter.\n\nBest regards,\n${senderName}`
      const shared = await tryNativeShare(blob, fileName, subject || "Business Letter", body)
      if (!shared) {
        const dlUrl = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = dlUrl; a.download = fileName; a.click(); URL.revokeObjectURL(dlUrl)
        openEmail("", subject || "Business Letter", body)
      }
    } catch { toast({ title: "Failed to send", variant: "destructive" }) } finally { setIsGenerating(false) }
  }

  const resetForm = useCallback(() => {
    setSenderName(""); setSenderCompany(""); setSenderAddress(""); setRecipientName(""); setRecipientCompany(""); setRecipientAddress(""); setLetterDate(new Date().toISOString().split("T")[0]); setSubject(""); setLetterBody(""); setSignature(""); setCompanyLogo("")
  }, [])

  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = "hidden"; document.documentElement.style.overflow = "hidden"
      document.body.style.touchAction = "none"; document.documentElement.style.touchAction = "none"
    } else {
      document.body.style.overflow = ""; document.documentElement.style.overflow = ""
      document.body.style.touchAction = ""; document.documentElement.style.touchAction = ""
      setZoom(1)
    }
    return () => { document.body.style.overflow = ""; document.documentElement.style.overflow = ""; document.body.style.touchAction = ""; document.documentElement.style.touchAction = "" }
  }, [showPreview])

  if (!mounted) return null

  const renderLetter = () => (
    <div className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full" style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}>
      {companyLogo && <div className="mb-8"><img src={companyLogo} alt="Logo" className="h-16 object-contain" /></div>}
      <div className="mb-8">
        <p className="font-semibold text-gray-900">{senderName || "Sender Name"}</p>
        <p className="text-gray-600">{senderCompany}</p>
        <p className="text-gray-600 whitespace-pre-wrap">{senderAddress}</p>
      </div>
      <div className="text-right mb-8"><p className="text-gray-600">{letterDate}</p></div>
      <div className="mb-8">
        <p className="font-semibold text-gray-900">{recipientName || "Recipient Name"}</p>
        <p className="text-gray-600">{recipientCompany}</p>
        <p className="text-gray-600 whitespace-pre-wrap">{recipientAddress}</p>
      </div>
      {subject && <div className="mb-6"><p className="font-bold text-gray-900">Subject: {subject}</p></div>}
      <div className="mb-12"><p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{letterBody || "Dear Sir/Madam,\n\n[Letter content...]\n\nSincerely,"}</p></div>
      <div className="mt-16">
        <p className="font-semibold text-gray-900">{senderName || "Sender Name"}</p>
        <p className="text-gray-600">{signature}</p>
      </div>
    </div>
  )

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating PDF..." />}

      <div id="letter-print-root" className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
        <InvoicePreview hideToolbar={true}>{renderLetter()}</InvoicePreview>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/80 backdrop-blur-md animate-in fade-in duration-300" style={{ overscrollBehavior: "contain" }}>
          <div className="relative w-full h-full flex flex-col max-w-[1200px] mx-auto bg-white/5 dark:bg-black/5 shadow-2xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white dark:bg-gray-950 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-4 w-4" /></Button>
                <h2 className="text-lg font-display font-semibold hidden sm:block">Letter Preview</h2>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1 ml-4 border border-border">
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-black shadow-sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}><ZoomOut className="h-3.5 w-3.5" /></Button>
                  <span className="text-xs font-medium w-12 text-center select-none">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-black shadow-sm" onClick={() => setZoom(z => Math.min(3, z + 0.1))}><ZoomIn className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-slate-600 to-slate-800 text-white border-0 font-semibold" onClick={() => handleDownloadPDF()} disabled={isGenerating}>
                  <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>
            <div ref={previewContainerRef} className="flex-1 overflow-y-auto p-0 sm:p-2 md:p-4 flex flex-col items-center" style={{ cursor: "grab", overscrollBehavior: "contain" }}>
              <div className="shadow-2xl rounded-sm overflow-hidden border border-border/50 bg-white" style={{ width: "100%", maxWidth: "210mm", transform: `scale(${zoom})`, transformOrigin: "top center", margin: "0 auto" }}>
                <InvoicePreview hideToolbar={true}>{renderLetter()}</InvoicePreview>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
          <div>
            <h1 className="text-xl font-display font-bold">New Business Letter</h1>
            <p className="text-xs text-muted-foreground">Create a professional business letter</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleRevert} title="Revert to last saved"><RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Revert</span></Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleSave}><Save className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Save Draft</span></Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={resetForm}><RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Reset</span></Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-slate-500" /> Sender</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs font-medium">Name *</Label><Input placeholder="Your name" value={senderName} onChange={e => setSenderName(e.target.value)} className="h-9 text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-medium">Company</Label><Input placeholder="Your company" value={senderCompany} onChange={e => setSenderCompany(e.target.value)} className="h-9 text-sm" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Address</Label><Textarea placeholder="Your full address" value={senderAddress} onChange={e => setSenderAddress(e.target.value)} className="text-sm resize-none" rows={2} /></div>
            </section>

            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-blue-500" /> Recipient</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs font-medium">Name *</Label><Input placeholder="Recipient name" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="h-9 text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-medium">Company</Label><Input placeholder="Recipient company" value={recipientCompany} onChange={e => setRecipientCompany(e.target.value)} className="h-9 text-sm" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Address</Label><Textarea placeholder="Recipient full address" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} className="text-sm resize-none" rows={2} /></div>
            </section>

            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-amber-500" /> Letter Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs font-medium">Date</Label><Input type="date" className="h-9 text-sm" value={letterDate} onChange={e => setLetterDate(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs font-medium">Subject</Label><Input placeholder="Subject of the letter" value={subject} onChange={e => setSubject(e.target.value)} className="h-9 text-sm" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Letter Body</Label><Textarea placeholder="Dear Sir/Madam,\n\nWrite your letter here...\n\nSincerely," value={letterBody} onChange={e => setLetterBody(e.target.value)} className="text-sm min-h-[200px] resize-y" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Signature / Title</Label><Input placeholder="Your designation / title" value={signature} onChange={e => setSignature(e.target.value)} className="h-9 text-sm" /></div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Company Logo (Optional)</Label>
                <div className="relative border-2 border-dashed border-border rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group h-28 w-full max-w-[200px] overflow-hidden">
                  {companyLogo ? (<><img src={companyLogo} alt="Logo" className="max-h-full max-w-full object-contain p-2" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={(e) => { e.preventDefault(); setCompanyLogo("") }}><Trash2 className="h-5 w-5 text-white" /></div></>) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center"><Plus className="h-5 w-5 text-muted-foreground mb-1" /><span className="text-[10px] text-muted-foreground font-medium">Upload Logo</span><input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} /></label>
                  )}
                </div>
              </div>
            </section>

            <div className="flex flex-wrap gap-3 pb-6">
              <Button onClick={togglePreview} className="gap-2 bg-gradient-to-r from-slate-600 to-slate-800 text-white border-0 font-semibold flex-1"><Eye className="h-4 w-4" /> SHOW PREVIEW</Button>
              <button onClick={handleWhatsAppShare} title="Share on WhatsApp" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm transition-colors hover:bg-accent cursor-pointer"><img src="/wh.svg" alt="WhatsApp" className="h-5 w-5" /></button>
              <button onClick={handleEmailReceipt} title="Email Letter" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm transition-colors hover:bg-accent cursor-pointer"><img src="/email.svg" alt="Email" className="h-5 w-5" /></button>
              <Button variant="outline" className="gap-2" onClick={handlePrint}><Printer className="h-4 w-4" /> Print</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
