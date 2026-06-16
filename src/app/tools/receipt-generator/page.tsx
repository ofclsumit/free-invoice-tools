"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Receipt, Download } from "lucide-react"
import { generateReceiptPDF } from "@/lib/pdf/generate-receipt"

export default function ReceiptGeneratorPage() {
  const [payer, setPayer] = useState("")
  const [amount, setAmount] = useState("")
  const [purpose, setPurpose] = useState("")
  const [mode, setMode] = useState("Cash")
  const [generated, setGenerated] = useState(false)
  const [receiptNo, setReceiptNo] = useState("")
  const [receiptDate, setReceiptDate] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  const handleGenerate = () => {
    if (payer && amount) {
      setReceiptNo(String(Math.floor(Math.random() * 10000)).padStart(4, "0"))
      setReceiptDate(new Date().toLocaleDateString("en-IN"))
      setGenerated(true)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      await generateReceiptPDF({
        receiptNo,
        date: receiptDate,
        payer,
        amount: parseFloat(amount) || 0,
        purpose,
        mode,
      })
    } catch (error) {
      console.error("PDF generation failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mesh py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 mb-4">
            <Receipt className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">Receipt Generator</h1>
          <p className="text-muted-foreground mt-2">Generate a simple payment receipt</p>
        </div>

        {!generated ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-5 shadow-glass">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Received From</Label>
              <Input placeholder="Payer name" value={payer} onChange={e => setPayer(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Amount (₹)</Label>
              <Input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Purpose</Label>
              <Textarea placeholder="Payment for..." value={purpose} onChange={e => setPurpose(e.target.value)} className="text-sm resize-none" rows={2} />
            </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Payment Mode</Label>
                <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-2">
                  {["Cash", "Bank Transfer", "UPI", "Cheque"].map(m => (
                    <button key={m} onClick={() => setMode(m)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${mode === m ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white" : "border border-border text-muted-foreground hover:text-foreground"}`}
                    >{m}</button>
                  ))}
                </div>
              </div>
            <Button onClick={handleGenerate} className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 font-semibold gap-2">
              <Receipt className="h-4 w-4" /> Generate Receipt
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-4 shadow-glass">
            <div className="text-center border-b border-border pb-4">
              <h2 className="font-display font-bold text-lg">Payment Receipt</h2>
              <p className="text-xs text-muted-foreground">Receipt #{receiptNo}</p>
              <p className="text-xs text-muted-foreground">{receiptDate}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Received From</span><span className="font-medium">{payer}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-display font-bold text-xl text-pink-600">₹{fmt(parseFloat(amount) || 0)}</span></div>
              {purpose && <div className="flex justify-between"><span className="text-muted-foreground">Purpose</span><span>{purpose}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Payment Mode</span><span>{mode}</span></div>
            </div>
            <div className="h-px bg-border" />
            <p className="text-xs text-muted-foreground text-center">This is a computer-generated receipt</p>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleDownloadPDF} disabled={isDownloading} className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 font-semibold gap-2">
                <Download className="h-4 w-4" /> {isDownloading ? "Downloading..." : "Download PDF"}
              </Button>
              <Button onClick={() => setGenerated(false)} variant="outline" className="flex-1">New Receipt</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
