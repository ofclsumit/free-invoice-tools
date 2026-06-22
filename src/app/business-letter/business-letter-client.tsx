"use client"
import { useState, useEffect, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"

export function BusinessLetterClient() {
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
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null; // Prevent hydration mismatch
  
const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `business-letter-${subject || "draft"}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompanyLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  if (showPreview) {
    return (
      <>
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Button variant="outline" onClick={() => setShowPreview(false)} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" /> Edit Letter
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-slate-600 to-slate-800 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <InvoicePreview hideToolbar={true}>
                <div
                  className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full"
                  style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}
                >
                  {companyLogo && (
                    <div className="mb-8">
                      <img src={companyLogo} alt="Company Logo" className="h-16 object-contain" />
                    </div>
                  )}

                  <div className="mb-8">
                    <p className="font-semibold text-gray-900">{senderName || "Sender Name"}</p>
                    <p className="text-gray-600">{senderCompany}</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{senderAddress}</p>
                  </div>

                  <div className="text-right mb-8">
                    <p className="text-gray-600">{letterDate}</p>
                  </div>

                  <div className="mb-8">
                    <p className="font-semibold text-gray-900">{recipientName || "Recipient Name"}</p>
                    <p className="text-gray-600">{recipientCompany}</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{recipientAddress}</p>
                  </div>

                  {subject && (
                    <div className="mb-6">
                      <p className="font-bold text-gray-900">Subject: {subject}</p>
                    </div>
                  )}

                  <div className="mb-12">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {letterBody || "Dear Sir/Madam,\n\n[Letter content goes here...]\n\nSincerely,"}
                    </p>
                  </div>

                  <div className="mt-16">
                    <p className="font-semibold text-gray-900">{senderName || "Sender Name"}</p>
                    <p className="text-gray-600">{signature || signature}</p>
                  </div>
                </div>
              </InvoicePreview>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Label className="text-xs font-medium">Company Logo</Label>
        <div className="flex items-center gap-2">
          <Input type="file" accept="image/*" onChange={handleLogoUpload} className="h-9 text-sm flex-1" />
          {companyLogo && <div className="h-9 w-9 rounded border border-border overflow-hidden flex-shrink-0"><img src={companyLogo} alt="Logo" className="h-full w-full object-cover" /></div>}
        </div>
      </div>

      <div className="h-px bg-border" />

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sender</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Name</Label>
            <Input placeholder="Your name" value={senderName} onChange={e => setSenderName(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Company</Label>
            <Input placeholder="Your company" value={senderCompany} onChange={e => setSenderCompany(e.target.value)} className="h-9 text-sm" />
          </div>
        </div>
        <div className="space-y-1.5 mt-4">
          <Label className="text-xs font-medium">Address</Label>
          <Textarea placeholder="Your full address" value={senderAddress} onChange={e => setSenderAddress(e.target.value)} className="text-sm resize-none" rows={2} />
        </div>
      </div>

      <div className="h-px bg-border" />

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recipient</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Name</Label>
            <Input placeholder="Recipient name" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Company</Label>
            <Input placeholder="Recipient company" value={recipientCompany} onChange={e => setRecipientCompany(e.target.value)} className="h-9 text-sm" />
          </div>
        </div>
        <div className="space-y-1.5 mt-4">
          <Label className="text-xs font-medium">Address</Label>
          <Textarea placeholder="Recipient full address" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} className="text-sm resize-none" rows={2} />
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Date</Label>
          <Input type="date" className="h-9 text-sm" value={letterDate} onChange={e => setLetterDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Subject</Label>
          <Input placeholder="Subject of the letter" value={subject} onChange={e => setSubject(e.target.value)} className="h-9 text-sm" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Letter Body</Label>
        <Textarea
          placeholder="Dear Sir/Madam,&#10;&#10;Write your letter here...&#10;&#10;Sincerely,"
          value={letterBody}
          onChange={e => setLetterBody(e.target.value)}
          className="text-sm min-h-[200px] resize-y"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Signature / Title</Label>
        <Input placeholder="Your designation / title" value={signature} onChange={e => setSignature(e.target.value)} className="h-9 text-sm" />
      </div>

      <Button onClick={() => setShowPreview(true)} className="w-full bg-gradient-to-r from-slate-600 to-slate-800 text-white border-0 font-semibold gap-2">
        <Eye className="h-4 w-4" /> Show Preview
      </Button>
    </div>
  )
}
