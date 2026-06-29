"use client"
import { useState } from "react"
import { Search, Download } from "lucide-react"
import { generateGSTINValidationPDF } from "@/lib/pdf/generate-gstin-validation"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraHeader, UltraCard, UltraTextInput, UltraDivider, UltraResultCard, UltraPrimaryButton
} from "@/components/ultra/ultra-components"

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

export function GstinValidatorClient() {
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
    <UltraShell>
      <UltraHeader
        badge="Validator"
        title="GSTIN Validator"
        subtitle="Validate GST Identification Numbers and identify the registered state"
      />
      <UltraCard>
        <UltraTextInput
          placeholder="Enter GSTIN"
          value={gstin}
          onChange={e => { setGstin(e.target.value); setResult(null) }}
          maxLength={15}
          className="uppercase tracking-wider font-mono"
        />
        <p className="text-[11px] text-[#f1f5f9]/65 -mt-4 mb-5">15-character GST Identification Number</p>

        <UltraPrimaryButton onClick={validate} className="w-full mb-6">
          <Search className="h-4 w-4" />
          Validate
        </UltraPrimaryButton>

        {result && (
          <>
            <UltraDivider />
            {result.valid ? (
              <UltraResultCard
                color="green"
                label="Valid GSTIN"
                value={result.state || ""}
                sub={result.msg}
              />
            ) : (
              <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/8">
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-rose-400 mb-1.5">Invalid GSTIN</div>
                <div className="text-rose-300 text-sm">{result.msg}</div>
              </div>
            )}

            <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isDownloading} className="w-full mt-4">
              <Download className="h-4 w-4" />
              {isDownloading ? "Generating PDF..." : "Download Verification PDF"}
            </UltraPrimaryButton>
          </>
        )}

        <div className="mt-8 bg-black/30 rounded-xl border border-white/[0.06] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-[#f1f5f9]">GSTIN Format</h3>
          </div>
          <div className="px-5 py-4 text-sm text-[#f1f5f9]/65 space-y-2">
            <p><strong className="text-[#f1f5f9]">Format:</strong> <code className="font-mono text-xs bg-white/[0.06] px-1.5 py-0.5 rounded text-indigo-300">27ABCDE1234F1Z5</code></p>
            <ul className="space-y-1 text-xs list-disc pl-4">
              <li>First 2 digits: State Code</li>
              <li>Next 10 digits: PAN of business</li>
              <li>Next 1 digit: Entity number (1-9 or A-Z)</li>
              <li>Next 1 digit: Always <strong className="text-[#f1f5f9]">Z</strong></li>
              <li>Last 1 digit: Checksum (0-9 or A-Z)</li>
            </ul>
          </div>
        </div>
      </UltraCard>
    </UltraShell>
  )
}
