"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Eye, RotateCcw, Plus, Trash2, Save
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { savePreviewData } from "@/lib/preview-store"

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
  const router = useRouter()

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

  const getState = useCallback((): LetterData => ({ senderName, senderCompany, senderAddress, recipientName, recipientCompany, recipientAddress, letterDate, subject, letterBody, signature, companyLogo }), [senderName, senderCompany, senderAddress, recipientName, recipientCompany, recipientAddress, letterDate, subject, letterBody, signature, companyLogo])
  const setState = useCallback((d: LetterData) => {
    setSenderName(d.senderName || ""); setSenderCompany(d.senderCompany || ""); setSenderAddress(d.senderAddress || "")
    setRecipientName(d.recipientName || ""); setRecipientCompany(d.recipientCompany || ""); setRecipientAddress(d.recipientAddress || "")
    setLetterDate(d.letterDate || new Date().toISOString().split("T")[0]); setSubject(d.subject || ""); setLetterBody(d.letterBody || ""); setSignature(d.signature || ""); setCompanyLogo(d.companyLogo || "")
  }, [])

  const handleSave = () => { if (!validate()) return; saveData(getState()); toast({ title: "Letter saved as draft!" }) }
  const handleRevert = () => { const s = loadSaved(); if (!s) { toast({ title: "No saved letter found", variant: "destructive" }); return }; setState(s); toast({ title: "Reverted to saved draft" }) }

  const resetForm = useCallback(() => {
    setSenderName(""); setSenderCompany(""); setSenderAddress(""); setRecipientName(""); setRecipientCompany(""); setRecipientAddress(""); setLetterDate(new Date().toISOString().split("T")[0]); setSubject(""); setLetterBody(""); setSignature(""); setCompanyLogo("")
  }, [])

  const handleShowPreview = useCallback(() => {
    if (!validate()) return
    const id = savePreviewData({
      docType: "business-letter",
      title: "Business Letter Preview",
      fileName: `business-letter-${subject || "letter"}.pdf`,
      data: { senderName, senderCompany, senderAddress, recipientName, recipientCompany, recipientAddress, letterDate, subject, letterBody, signature, companyLogo },
    })
    router.push(`/preview/${id}`)
  }, [validate, subject, senderName, senderCompany, senderAddress, recipientName, recipientCompany, recipientAddress, letterDate, letterBody, signature, companyLogo, router])

  if (!mounted) return null

  return (
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
            <Button onClick={handleShowPreview} className="gap-2 bg-gradient-to-r from-slate-600 to-slate-800 text-white border-0 font-semibold flex-1"><Eye className="h-4 w-4" /> SHOW PREVIEW</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
