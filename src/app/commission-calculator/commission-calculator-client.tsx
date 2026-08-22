"use client"
import { useState } from "react"
import { Download } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraNav, UltraPage, UltraGrid,
  UltraHeader, UltraCard, UltraCardHeader, UltraEmptyState, UltraInput,
  UltraResultsGrid, UltraResultCard, UltraPrimaryButton, UltraResetButton
} from "@/components/ultra/ultra-components"

export function CommissionCalculatorClient() {
  const [saleAmount, setSaleAmount] = useState("")
  const [commissionRate, setCommissionRate] = useState("")
  const [splitRatio, setSplitRatio] = useState("100")
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const sale = parseFloat(saleAmount) || 0
  const rate = parseFloat(commissionRate) || 0
  const split = Math.min(Math.max(parseFloat(splitRatio) || 100, 0), 100)

  const commissionAmount = (sale * rate) / 100
  const yourShare = (commissionAmount * split) / 100
  const otherShare = commissionAmount - yourShare
  const netAmount = sale - commissionAmount

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (sale > 0 && rate > 0) setCalculated(true)
    else {
      setCalculated(false)
      const btn = document.getElementById("calc-btn")
      if (btn) { btn.style.animation = "none"; void btn.offsetWidth; btn.style.animation = "shake .4s ease" }
    }
  }

  const handleReset = () => {
    setSaleAmount(""); setCommissionRate(""); setSplitRatio("100"); setCalculated(false)
  }

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating Commission PDF..." />}
      <UltraShell>
      <UltraNav />
      <UltraPage>
        <UltraHeader
          badge="Calculator"
          title="Commission\nCalculator"
          subtitle="Calculate commission amounts and split shares — instant results"
        />

        <UltraGrid>
          {/* ─── CALCULATE CARD ─── */}
          <UltraCard>
            <UltraCardHeader title="Calculate Commission" />

            <UltraInput
              type="number"
              placeholder="Sale Amount"
              currencySymbol="₹"
              value={saleAmount}
              onChange={e => { setSaleAmount(e.target.value); setCalculated(false) }}
            />

            <UltraInput
              type="number"
              step="0.1"
              placeholder="Commission Rate"
              suffix="%"
              value={commissionRate}
              onChange={e => { setCommissionRate(e.target.value); setCalculated(false) }}
            />

            <UltraInput
              type="number"
              placeholder="Your Split Share"
              suffix="%"
              value={splitRatio}
              onChange={e => { setSplitRatio(e.target.value); setCalculated(false) }}
            />
            <p className="text-[11.5px] text-slate-500 dark:text-white/60 -mt-3 mb-6 font-medium">Your share of the total commission (0-100%)</p>

            <div className="flex gap-3 mt-6">
              <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
                Calculate
              </UltraPrimaryButton>
              <UltraResetButton onClick={handleReset} />
            </div>
          </UltraCard>

          {/* ─── RESULTS CARD ─── */}
          <UltraCard>
            <UltraCardHeader title="Results" />

            {!calculated || !(sale > 0 && rate > 0) ? (
              <UltraEmptyState actionText="Calculate" />
            ) : (
              <>
                <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                  <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                  Commission Breakdown
                </div>

                <UltraResultsGrid>
                  <UltraResultCard label={`Total Commission (${rate}%)`} value={`₹${fmt(commissionAmount)}`} color="blue" />
                  <UltraResultCard label={`Your Share (${split}%)`} value={`₹${fmt(yourShare)}`} color="main" />
                  {split < 100 && (
                    <UltraResultCard label={`Other Party Share (${(100 - split).toFixed(0)}%)`} value={`₹${fmt(otherShare)}`} color="amber" />
                  )}
                  <UltraResultCard label="Net Amount After Commission" value={`₹${fmt(netAmount)}`} color="green" />
                </UltraResultsGrid>

                <UltraPrimaryButton
                  onClick={async () => {
                    setIsGenerating(true)
                    try {
                      const { generateCommissionPDF } = await import("@/lib/pdf/generate-commission");
                      await generateCommissionPDF({
                        sale,
                        rate,
                        split,
                        commissionAmount,
                        yourShare,
                        otherShare,
                        netAmount
                      });
                    } finally {
                      setIsGenerating(false)
                    }
                  }}
                  disabled={isGenerating}
                  className="w-full mt-4"
                >
                  <Download className="h-4 w-4" />
                  {isGenerating ? "Generating..." : "Download PDF"}
                </UltraPrimaryButton>
              </>
            )}
          </UltraCard>
        </UltraGrid>
      </UltraPage>
        </UltraShell>
    </>
  )
}
