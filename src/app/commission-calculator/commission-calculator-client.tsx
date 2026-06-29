"use client"
import { useState } from "react"
import { Download } from "lucide-react"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraHeader, UltraCard, UltraInput, UltraResultsGrid, UltraResultCard, UltraPrimaryButton,
  UltraDivider, UltraResetButton
} from "@/components/ultra/ultra-components"

export function CommissionCalculatorClient() {
  const [saleAmount, setSaleAmount] = useState("")
  const [commissionRate, setCommissionRate] = useState("")
  const [splitRatio, setSplitRatio] = useState("100")

  const sale = parseFloat(saleAmount) || 0
  const rate = parseFloat(commissionRate) || 0
  const split = Math.min(Math.max(parseFloat(splitRatio) || 100, 0), 100)

  const commissionAmount = (sale * rate) / 100
  const yourShare = (commissionAmount * split) / 100
  const otherShare = commissionAmount - yourShare
  const netAmount = sale - commissionAmount

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleReset = () => {
    setSaleAmount(""); setCommissionRate(""); setSplitRatio("100")
  }

  return (
    <UltraShell>
      <UltraHeader
        badge="Calculator"
        title="Commission Calculator"
        subtitle="Calculate commission amounts and split shares"
      />
      <UltraCard>
        <UltraInput
          type="number"
          placeholder="Sale Amount"
          currencySymbol="₹"
          value={saleAmount}
          onChange={e => setSaleAmount(e.target.value)}
        />
        <UltraInput
          type="number"
          step="0.1"
          placeholder="Commission Rate"
          value={commissionRate}
          onChange={e => setCommissionRate(e.target.value)}
        />
        <UltraInput
          type="number"
          placeholder="Your Split Share"
          value={splitRatio}
          onChange={e => setSplitRatio(e.target.value)}
        />
        <p className="text-[11px] text-[#f1f5f9]/65 -mt-4 mb-6">Your share of the total commission (0-100%)</p>

        {sale > 0 && (
          <>
            <UltraDivider />
            <UltraResultsGrid>
              <UltraResultCard label={`Total Commission (${rate}%)`} value={`₹${fmt(commissionAmount)}`} color="blue" />
              <UltraResultCard label={`Your Share (${split}%)`} value={`₹${fmt(yourShare)}`} color="green" />
              {split < 100 && (
                <UltraResultCard label={`Other Party Share (${(100 - split).toFixed(0)}%)`} value={`₹${fmt(otherShare)}`} color="amber" />
              )}
              <UltraResultCard label="Net Amount After Commission" value={`₹${fmt(netAmount)}`} />
            </UltraResultsGrid>
          </>
        )}

        <UltraPrimaryButton
          onClick={async () => {
            if (!saleAmount || !commissionRate) {
              alert("Please enter sale amount and commission rate");
              return;
            }
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
          className="w-full mt-6"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </UltraPrimaryButton>

        <UltraResetButton onClick={handleReset} />
      </UltraCard>
    </UltraShell>
  )
}
