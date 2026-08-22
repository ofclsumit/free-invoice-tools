"use client"
import { useState } from "react"
import { Search, Download } from "lucide-react"
import { generateGSTINValidationPDF } from "@/lib/pdf/generate-gstin-validation"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraNav, UltraPage, UltraGrid,
  UltraHeader, UltraCard, UltraCardHeader, UltraEmptyState, UltraTextInput, UltraDivider, UltraResultCard, UltraPrimaryButton
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
      <UltraNav />
      <UltraPage>
        <UltraHeader
          badge="Validator"
          title="GSTIN Validator"
          subtitle="Validate GST Identification Numbers and identify the registered state"
        />

        <UltraGrid>
          <UltraCard>
            <UltraCardHeader title="Validate" />

            <UltraTextInput
              placeholder="Enter GSTIN"
              value={gstin}
              onChange={e => { setGstin(e.target.value); setResult(null) }}
              maxLength={15}
              className="uppercase tracking-wider font-mono"
            />
            <p className="text-[11.5px] text-slate-500 dark:text-white/60 -mt-3 mb-5 font-medium">15-character GST Identification Number</p>

            <UltraPrimaryButton onClick={validate} className="w-full">
              <Search className="h-4 w-4" />
              Validate GSTIN
            </UltraPrimaryButton>
          </UltraCard>

          <UltraCard>
            <UltraCardHeader title="Result" />

            {result ? (
              <>
                {result.valid ? (
                  <UltraResultCard
                    color="green"
                    label="Valid GSTIN"
                    value={result.state || ""}
                    sub={result.msg}
                  />
                ) : (
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10 mb-4">
                    <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-rose-700 dark:text-rose-400 mb-1">Invalid GSTIN</div>
                    <div className="text-rose-900 dark:text-rose-300 text-sm font-medium">{result.msg}</div>
                  </div>
                )}

                <UltraDivider />

                <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isDownloading} className="w-full">
                  <Download className="h-4 w-4" />
                  {isDownloading ? "Generating PDF..." : "Download Verification PDF"}
                </UltraPrimaryButton>
              </>
            ) : (
              <UltraEmptyState message="Enter a GSTIN and tap" actionText="Validate GSTIN" />
            )}

            <UltraDivider />

            <div className="bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/[0.06] overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-white/[0.06] bg-slate-100/70 dark:bg-black/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">GSTIN Structure Reference</h3>
              </div>
              <div className="px-4 py-3 text-sm text-slate-700 dark:text-white/70 space-y-2">
                <p><strong className="text-slate-900 dark:text-white">Example:</strong> <code className="font-mono text-xs bg-slate-200 dark:bg-white/[0.06] px-1.5 py-0.5 rounded text-violet-800 dark:text-indigo-300 font-bold">27ABCDE1234F1Z5</code></p>
                <ul className="space-y-1 text-xs list-disc pl-4 text-slate-600 dark:text-white/60">
                  <li><strong>First 2 digits:</strong> State Code (e.g., 27 for Maharashtra)</li>
                  <li><strong>Next 10 characters:</strong> PAN of business entity</li>
                  <li><strong>13th character:</strong> Entity number (1-9 or A-Z)</li>
                  <li><strong>14th character:</strong> Default character &apos;Z&apos;</li>
                  <li><strong>15th character:</strong> Checksum validation code</li>
                </ul>
              </div>
            </div>
          </UltraCard>
        </UltraGrid>
      </UltraPage>
    </UltraShell>
  )
}
