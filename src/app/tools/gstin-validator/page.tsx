"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, CheckCircle2, XCircle, Download } from "lucide-react"
import { generateGSTINValidationPDF } from "@/lib/pdf/generate-gstin-validation"

const STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan",
  "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram", "16": "Tripura",
  "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
  "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "28": "Andhra Pradesh",
  "29": "Karnataka", "30": "Goa", "31": "Lakshadweep", "32": "Kerala",
  "33": "Tamil Nadu", "34": "Puducherry", "35": "Andaman & Nicobar", "36": "Telangana",
  "37": "Andhra Pradesh (New)", "38": "Ladakh",
}

export default function GstinValidatorPage() {
  const [gstin, setGstin] = useState("")
  const [result, setResult] = useState<{ valid: boolean; state?: string; msg: string } | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const validate = () => {
    const clean = gstin.toUpperCase().trim()
    if (clean.length !== 15) {
      setResult({ valid: false, msg: "GSTIN must be exactly 15 characters" })
      return
    }
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(clean)) {
      setResult({ valid: false, msg: "Invalid GSTIN format. Expected: 2-digit state + 10-digit PAN + entity code + Z + checksum" })
      return
    }
    const stateCode = clean.substring(0, 2)
    const state = STATE_CODES[stateCode]
    if (!state) {
      setResult({ valid: false, msg: `Invalid state code: ${stateCode}` })
      return
    }
    setResult({ valid: true, state, msg: `Valid GSTIN. State: ${state}` })
  }

  const handleDownloadPDF = async () => {
    if (!result) return
    setIsDownloading(true)
    try {
      await generateGSTINValidationPDF({
        gstin,
        valid: result.valid,
        state: result.state,
        msg: result.msg,
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
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4">
            <Search className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">GSTIN Validator</h1>
          <p className="text-muted-foreground mt-2">Validate GSTIN format and identify the state</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-6 shadow-glass">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Enter GSTIN</label>
            <Input
              placeholder="27ABCDE1234F1Z5"
              value={gstin}
              onChange={e => { setGstin(e.target.value); setResult(null) }}
              className="h-12 text-lg font-mono tracking-wider uppercase"
              maxLength={15}
            />
            <p className="text-xs text-muted-foreground">15-character GST Identification Number</p>
          </div>

          <Button onClick={validate} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 font-semibold gap-2 h-11">
            <Search className="h-4 w-4" /> Validate
          </Button>

          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl flex items-start gap-3 ${result.valid ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"}`}>
                {result.valid ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="font-medium text-sm">{result.valid ? "Valid GSTIN" : "Invalid GSTIN"}</p>
                  <p className="text-xs mt-0.5 opacity-80">{result.msg}</p>
                </div>
              </div>
              <Button onClick={handleDownloadPDF} disabled={isDownloading} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 font-semibold gap-2">
                <Download className="h-4 w-4" /> {isDownloading ? "Generating PDF..." : "Download Verification PDF"}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-display font-semibold">GSTIN Format</h2>
          </div>
          <div className="p-5 text-sm text-muted-foreground space-y-2">
            <p><strong>Format:</strong> <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">27ABCDE1234F1Z5</code></p>
            <ul className="space-y-1 text-xs list-disc pl-4">
              <li>First 2 digits: State Code</li>
              <li>Next 10 digits: PAN of business</li>
              <li>Next 1 digit: Entity number (1-9 or A-Z)</li>
              <li>Next 1 digit: Always <strong>Z</strong></li>
              <li>Last 1 digit: Checksum (0-9 or A-Z)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
