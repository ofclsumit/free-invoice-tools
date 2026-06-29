"use client"
import { useState } from "react"
import { Download } from "lucide-react"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraNav, UltraPage, UltraGrid,
  UltraHeader, UltraCard, UltraInput,
  UltraResultsGrid, UltraResultCard, UltraPrimaryButton, UltraResetButton
} from "@/components/ultra/ultra-components"

export function CommissionCalculatorClient() {
  const [saleAmount, setSaleAmount] = useState("")
  const [commissionRate, setCommissionRate] = useState("")
  const [splitRatio, setSplitRatio] = useState("100")
  const [calculated, setCalculated] = useState(false)

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
            <div className="flex items-center gap-2 mb-[1.35rem]">
              <span className="w-[3px] h-[1.05rem] rounded-full shrink-0 bg-gradient-to-b from-[#a78bfa] to-[#60a5fa]" />
              <span className="text-[1rem] font-bold text-white/90">Calculate</span>
            </div>

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
              value={splitRatio}
              onChange={e => { setSplitRatio(e.target.value); setCalculated(false) }}
            />
            <p className="text-[11px] text-[#f1f5f9]/65 -mt-4 mb-6">Your share of the total commission (0-100%)</p>

            <div className="flex gap-3 mt-6">
              <button
                id="calc-btn"
                onClick={handleCalculate}
                className="flex-[2] py-[.82rem] px-5 bg-gradient-to-r from-[#8b5cf6]/75 to-[#3b82f6]/60 border border-[#a78bfa]/45 rounded-[.9rem] text-white text-[.93rem] font-bold cursor-pointer font-['Inter'] transition-all duration-300 shadow-[0_4px_20px_rgba(139,92,246,.35)] hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(139,92,246,.55)] hover:from-[#8b5cf6]/90 hover:to-[#3b82f6]/75"
              >
                Calculate
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-[.82rem] bg-white/[.08] border border-white/[.15] rounded-[.9rem] text-white/60 text-[.9rem] cursor-pointer font-['Inter'] transition-all duration-300 hover:bg-white/[.14] hover:text-white"
              >
                ↺ Reset
              </button>
            </div>
          </UltraCard>

          {/* ─── RESULTS CARD ─── */}
          <UltraCard>
            <div className="flex items-center gap-2 mb-[1.35rem]">
              <span className="w-[3px] h-[1.05rem] rounded-full shrink-0 bg-gradient-to-b from-[#a78bfa] to-[#60a5fa]" />
              <span className="text-[1rem] font-bold text-white/90">Results</span>
            </div>

            {!calculated || !(sale > 0 && rate > 0) ? (
              <div className="flex flex-col items-center justify-center min-h-[280px] text-white/35 text-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-[.88rem] leading-relaxed">Enter your values and tap<br /><strong className="text-[#a78bfa]/70">Calculate</strong></p>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-[#8b5cf6]/20 border border-[#8b5cf6]/45 rounded-[2rem] text-[.7rem] font-bold tracking-[.07em] uppercase text-[#c4a8ff]/95 mb-[.55rem] w-fit">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#a78bfa]/90 shrink-0" />
                  Commission Breakdown
                </div>

                <UltraResultsGrid>
                  <UltraResultCard label={`Total Commission (${rate}%)`} value={`₹${fmt(commissionAmount)}`} color="blue" />
                  <UltraResultCard label={`Your Share (${split}%)`} value={`₹${fmt(yourShare)}`} color="green" />
                  {split < 100 && (
                    <UltraResultCard label={`Other Party Share (${(100 - split).toFixed(0)}%)`} value={`₹${fmt(otherShare)}`} color="amber" />
                  )}
                  <UltraResultCard label="Net Amount After Commission" value={`₹${fmt(netAmount)}`} />
                </UltraResultsGrid>

                <UltraPrimaryButton
                  onClick={async () => {
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
                  }}
                  className="w-full mt-4"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </UltraPrimaryButton>
              </>
            )}
          </UltraCard>
        </UltraGrid>
      </UltraPage>
    </UltraShell>
  )
}
