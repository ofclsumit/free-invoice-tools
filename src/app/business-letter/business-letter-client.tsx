"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Eye, RotateCcw, Plus, Trash2, Save,
  Building2, User, FileText, PenTool, FileSignature, Paperclip
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { savePreviewData } from "@/lib/preview-store"
import { savePreviewSession, consumePreviewSession } from "@/lib/preview-session"
import { ImageUploadField, type ImageEditSettings, DEFAULT_IMAGE_EDIT_SETTINGS } from "@/components/shared/image-editor"

const STORAGE_KEY = "qf_business_letter"

export interface BusinessLetterData {
  companyLogo?: string
  senderName: string
  senderTitle?: string
  senderCompany: string
  senderAddress: string
  senderPhone?: string
  senderEmail?: string

  recipientName: string
  recipientTitle?: string
  recipientCompany: string
  recipientAddress: string
  recipientEmail?: string

  letterDate: string
  referenceNo?: string
  subject: string

  salutation?: string
  letterBody: string
  valediction?: string

  signature?: string
  signatureImage?: string
  ccRecipients?: string
  enclosures?: string
}

function loadSaved(): BusinessLetterData | null {
  if (typeof window === "undefined") return null
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

function saveData(data: BusinessLetterData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

const COMMON_SALUTATIONS = [
  "Dear Sir/Madam,",
  "Dear Mr. Sharma,",
  "Dear Ms. Patel,",
  "To Whom It May Concern,",
  "Respected Sir,",
]

const COMMON_VALEDICTIONS = [
  "Sincerely,",
  "Yours faithfully,",
  "Warm regards,",
  "Best regards,",
  "With warm appreciation,",
]

export function BusinessLetterClient() {
  const { toast } = useToast()
  const router = useRouter()

  // Sender Letterhead
  const [companyLogo, setCompanyLogo] = useState("")
  const [logoOriginal, setLogoOriginal] = useState("")
  const [logoSettings, setLogoSettings] = useState<ImageEditSettings>(DEFAULT_IMAGE_EDIT_SETTINGS)
  const [senderName, setSenderName] = useState("")
  const [senderTitle, setSenderTitle] = useState("")
  const [senderCompany, setSenderCompany] = useState("")
  const [senderAddress, setSenderAddress] = useState("")
  const [senderPhone, setSenderPhone] = useState("")
  const [senderEmail, setSenderEmail] = useState("")

  // Recipient Details
  const [recipientName, setRecipientName] = useState("")
  const [recipientTitle, setRecipientTitle] = useState("")
  const [recipientCompany, setRecipientCompany] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")

  // Letter Metadata
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split("T")[0])
  const [referenceNo, setReferenceNo] = useState("")
  const [subject, setSubject] = useState("")

  // Letter Content
  const [salutation, setSalutation] = useState("Dear Sir/Madam,")
  const [letterBody, setLetterBody] = useState(
    "I am writing this letter to formally bring to your attention our recent project developments and proposal outline.\n\nWe appreciate the opportunity to collaborate and look forward to your affirmative response regarding the next steps."
  )
  const [valediction, setValediction] = useState("Sincerely,")

  // Signatory & Annexures
  const [signature, setSignature] = useState("")
  const [signatureImage, setSignatureImage] = useState("")
  const [signatureOriginal, setSignatureOriginal] = useState("")
  const [signatureSettings, setSignatureSettings] = useState<ImageEditSettings>(DEFAULT_IMAGE_EDIT_SETTINGS)
  const [ccRecipients, setCcRecipients] = useState("")
  const [enclosures, setEnclosures] = useState("")

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const r = new FileReader()
      r.onloadend = () => setCompanyLogo(r.result as string)
      r.readAsDataURL(file)
    }
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const r = new FileReader()
      r.onloadend = () => setSignatureImage(r.result as string)
      r.readAsDataURL(file)
    }
  }

  const validate = useCallback(() => {
    if (!senderName.trim()) {
      toast({ title: "Sender name is required", variant: "destructive" })
      return false
    }
    if (!recipientName.trim()) {
      toast({ title: "Recipient name is required", variant: "destructive" })
      return false
    }
    if (!subject.trim()) {
      toast({ title: "Letter subject is required", variant: "destructive" })
      return false
    }
    if (!letterBody.trim()) {
      toast({ title: "Letter body cannot be empty", variant: "destructive" })
      return false
    }
    return true
  }, [senderName, recipientName, subject, letterBody, toast])

  const getState = useCallback((): BusinessLetterData => ({
    companyLogo,
    senderName, senderTitle, senderCompany, senderAddress, senderPhone, senderEmail,
    recipientName, recipientTitle, recipientCompany, recipientAddress, recipientEmail,
    letterDate, referenceNo, subject,
    salutation, letterBody, valediction,
    signature, signatureImage, ccRecipients, enclosures,
  }), [
    companyLogo,
    senderName, senderTitle, senderCompany, senderAddress, senderPhone, senderEmail,
    recipientName, recipientTitle, recipientCompany, recipientAddress, recipientEmail,
    letterDate, referenceNo, subject,
    salutation, letterBody, valediction,
    signature, signatureImage, ccRecipients, enclosures,
  ])

  const setState = useCallback((d: BusinessLetterData) => {
    setCompanyLogo(d.companyLogo || "")
    setSenderName(d.senderName || "")
    setSenderTitle(d.senderTitle || "")
    setSenderCompany(d.senderCompany || "")
    setSenderAddress(d.senderAddress || "")
    setSenderPhone(d.senderPhone || "")
    setSenderEmail(d.senderEmail || "")

    setRecipientName(d.recipientName || "")
    setRecipientTitle(d.recipientTitle || "")
    setRecipientCompany(d.recipientCompany || "")
    setRecipientAddress(d.recipientAddress || "")
    setRecipientEmail(d.recipientEmail || "")

    setLetterDate(d.letterDate || new Date().toISOString().split("T")[0])
    setReferenceNo(d.referenceNo || "")
    setSubject(d.subject || "")

    setSalutation(d.salutation || "Dear Sir/Madam,")
    setLetterBody(d.letterBody || "")
    setValediction(d.valediction || "Sincerely,")

    setSignature(d.signature || "")
    setSignatureImage(d.signatureImage || "")
    setCcRecipients(d.ccRecipients || "")
    setEnclosures(d.enclosures || "")
  }, [])

  useEffect(() => {
    setMounted(true)
    const session = consumePreviewSession<BusinessLetterData>("business-letter")
    if (session?.formValues) {
      setState(session.formValues)
      if (session.extraState?.logoOriginal) setLogoOriginal(session.extraState.logoOriginal)
      if (session.extraState?.logoSettings) setLogoSettings(session.extraState.logoSettings)
      if (session.extraState?.signatureOriginal) setSignatureOriginal(session.extraState.signatureOriginal)
      if (session.extraState?.signatureSettings) setSignatureSettings(session.extraState.signatureSettings)
    }
  }, [setState])

  const handleSave = () => {
    if (!validate()) return
    saveData(getState())
    toast({ title: "Business letter saved as draft!", description: "Saved securely to your browser." })
  }

  const handleRevert = () => {
    const s = loadSaved()
    if (!s) {
      toast({ title: "No saved letter found", variant: "destructive" })
      return
    }
    setState(s)
    toast({ title: "Reverted to saved draft" })
  }

  const resetForm = useCallback(() => {
    setCompanyLogo("")
    setLogoOriginal("")
    setLogoSettings(DEFAULT_IMAGE_EDIT_SETTINGS)
    setSenderName("")
    setSenderTitle("")
    setSenderCompany("")
    setSenderAddress("")
    setSenderPhone("")
    setSenderEmail("")
    setRecipientName("")
    setRecipientTitle("")
    setRecipientCompany("")
    setRecipientAddress("")
    setRecipientEmail("")
    setLetterDate(new Date().toISOString().split("T")[0])
    setReferenceNo("")
    setSubject("")
    setSalutation("Dear Sir/Madam,")
    setLetterBody("")
    setValediction("Sincerely,")
    setSignature("")
    setSignatureImage("")
    setSignatureOriginal("")
    setSignatureSettings(DEFAULT_IMAGE_EDIT_SETTINGS)
    setCcRecipients("")
    setEnclosures("")
  }, [])

  const handleShowPreview = useCallback(() => {
    if (!validate()) return
    const currentState = getState()
    savePreviewSession("business-letter", currentState, {
      logoOriginal,
      logoSettings,
      signatureOriginal,
      signatureSettings,
    })
    const id = savePreviewData({
      docType: "business-letter",
      title: "Business Letter Preview",
      fileName: `letter-${(subject || "letter").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}.pdf`,
      data: currentState,
    })
    router.push(`/preview/${id}`)
  }, [validate, getState, subject, router, logoOriginal, logoSettings, signatureOriginal, signatureSettings])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Top Sticky Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold">Business Letter Generator</h1>
          <p className="text-xs text-muted-foreground">Draft executive letters, formal agreements, notices, and official correspondence</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleRevert} title="Revert to last saved">
            <RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Revert</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleSave}>
            <Save className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Save Draft</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Section 1: Sender Information & Letterhead */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <Building2 className="h-3.5 w-3.5" />
            </span>
            Sender / Organization Letterhead
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-start gap-4">
                <ImageUploadField
                  assetType="logo"
                  compact={true}
                  value={companyLogo}
                  originalValue={logoOriginal}
                  settings={logoSettings}
                  onChange={(editedUrl, orig, newSettings) => {
                    setCompanyLogo(editedUrl);
                    setLogoOriginal(orig);
                    setLogoSettings(newSettings);
                  }}
                  onRemove={() => {
                    setCompanyLogo("");
                    setLogoOriginal("");
                    setLogoSettings(DEFAULT_IMAGE_EDIT_SETTINGS);
                  }}
                />
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs font-medium">Sender Full Name *</Label>
                  <Input
                    placeholder="e.g. Vikramaditya Singhania"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sender Title / Designation</Label>
              <Input
                placeholder="e.g. Managing Director"
                value={senderTitle}
                onChange={e => setSenderTitle(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Company / Organization Name</Label>
              <Input
                placeholder="e.g. Singhania Global Enterprises"
                value={senderCompany}
                onChange={e => setSenderCompany(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Sender Address</Label>
              <Textarea
                placeholder="e.g. 5th Floor, Corporate Towers, BKC, Mumbai 400051"
                value={senderAddress}
                onChange={e => setSenderAddress(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Phone</Label>
              <Input
                placeholder="e.g. +91 22 2654 3210"
                value={senderPhone}
                onChange={e => setSenderPhone(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email</Label>
              <Input
                placeholder="e.g. director@singhaniaglobal.com"
                value={senderEmail}
                onChange={e => setSenderEmail(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Recipient Details */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <User className="h-3.5 w-3.5" />
            </span>
            Recipient Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Recipient Full Name *</Label>
              <Input
                placeholder="e.g. Dr. Rajeshwari Menon"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Recipient Title / Designation</Label>
              <Input
                placeholder="e.g. Head of Procurement & Strategy"
                value={recipientTitle}
                onChange={e => setRecipientTitle(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Recipient Organization / Company</Label>
              <Input
                placeholder="e.g. Apex Biotech Ltd"
                value={recipientCompany}
                onChange={e => setRecipientCompany(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Recipient Email (Optional)</Label>
              <Input
                placeholder="e.g. r.menon@apexbiotech.com"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Recipient Address</Label>
              <Textarea
                placeholder="e.g. Technopark Phase 3, Kazhakkoottam, Thiruvananthapuram, Kerala 695581"
                value={recipientAddress}
                onChange={e => setRecipientAddress(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Letter Details & Subject */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <FileText className="h-3.5 w-3.5" />
            </span>
            Letter Metadata & Subject
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Letter Date *</Label>
              <Input
                type="date"
                value={letterDate}
                onChange={e => setLetterDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Reference Number (Optional)</Label>
              <Input
                placeholder="e.g. REF: SGE/2026/LTR-089"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Letter Subject Line *</Label>
              <Input
                placeholder="e.g. Formal Proposal for Strategic Enterprise Cloud Modernization Partnership"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="h-9 text-sm font-semibold"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Letter Body & Formal Editor */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <PenTool className="h-3.5 w-3.5" />
            </span>
            Formal Letter Content
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Salutation</Label>
              <Input
                placeholder="e.g. Dear Dr. Menon,"
                value={salutation}
                onChange={e => setSalutation(e.target.value)}
                className="h-9 text-sm"
              />
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SALUTATIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSalutation(s)}
                    className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-muted-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Main Letter Body *</Label>
              <Textarea
                placeholder="Compose your professional letter body here. Use multiple paragraphs for clear executive communication..."
                value={letterBody}
                onChange={e => setLetterBody(e.target.value)}
                rows={10}
                className="text-sm font-sans leading-relaxed resize-y min-h-[220px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Formal Sign-Off / Valediction</Label>
              <Input
                placeholder="e.g. Sincerely,"
                value={valediction}
                onChange={e => setValediction(e.target.value)}
                className="h-9 text-sm"
              />
              <div className="flex flex-wrap gap-1.5">
                {COMMON_VALEDICTIONS.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValediction(v)}
                    className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-muted-foreground transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Signatory, Digital Signature, CC & Enclosures */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <FileSignature className="h-3.5 w-3.5" />
            </span>
            Signatory & Attachments
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Signatory Title / Name</Label>
              <Input
                placeholder="e.g. Authorized Signatory / Managing Director"
                value={signature}
                onChange={e => setSignature(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <ImageUploadField
                label="Digital Signature Image / Stamp (Optional)"
                assetType="signature"
                aspectRatio="signature"
                value={signatureImage}
                originalValue={signatureOriginal}
                settings={signatureSettings}
                onChange={(editedUrl, orig, newSettings) => {
                  setSignatureImage(editedUrl);
                  setSignatureOriginal(orig);
                  setSignatureSettings(newSettings);
                }}
                onRemove={() => {
                  setSignatureImage("");
                  setSignatureOriginal("");
                  setSignatureSettings(DEFAULT_IMAGE_EDIT_SETTINGS);
                }}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" /> Carbon Copy (CC) (Optional)
              </Label>
              <Input
                placeholder="e.g. CC: Chief Financial Officer, Legal Advisory Board"
                value={ccRecipients}
                onChange={e => setCcRecipients(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" /> Enclosures / Attachments (Optional)
              </Label>
              <Input
                placeholder="e.g. Enclosures: 1. Project Schedule Draft, 2. Non-Disclosure Agreement"
                value={enclosures}
                onChange={e => setEnclosures(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Bottom Action Area */}
        <div className="flex flex-wrap gap-3 pb-8">
          <Button
            onClick={handleShowPreview}
            className="gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-0 font-semibold h-11 text-sm shadow-md flex-1"
          >
            <Eye className="h-4 w-4" /> SHOW PREVIEW & DOWNLOAD
          </Button>
        </div>
      </div>
    </div>
  )
}
