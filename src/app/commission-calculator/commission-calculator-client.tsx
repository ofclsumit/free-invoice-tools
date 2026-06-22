"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Download } from "lucide-react"

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
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Sale Amount (₹)</Label>
        <Input
          type="number"
          placeholder="Enter total sale amount"
          value={saleAmount}
          onChange={e => setSaleAmount(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Commission Rate (%)</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="Enter commission rate"
          value={commissionRate}
          onChange={e => setCommissionRate(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Your Split Share (%)</Label>
        <Input
          type="number"
          placeholder="Enter your split percentage (default 100)"
          value={splitRatio}
          onChange={e => setSplitRatio(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
        <p className="text-xs text-muted-foreground">Your share of the total commission (0-100%)</p>
      </div>

      {sale > 0 && (
        <div className="space-y-3 pt-2">
          <div className="h-px bg-border" />
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Commission ({rate}%)</span>
              <span className="font-semibold text-cyan-600">₹{fmt(commissionAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Your Share ({split}%)</span>
              <span className="font-display font-bold text-xl text-emerald-600 dark:text-emerald-400">₹{fmt(yourShare)}</span>
            </div>
            {split < 100 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Other Party Share ({(100 - split).toFixed(0)}%)</span>
                <span className="font-semibold text-muted-foreground">₹{fmt(otherShare)}</span>
              </div>
            )}
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="font-display font-bold">Net Amount After Commission</span>
              <span className="font-display font-bold text-blue-600 dark:text-blue-400">₹{fmt(netAmount)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2 flex-1" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" /> Reset
        </Button>
        <Button 
          variant="outline" 
          className="gap-2 flex-1 border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800"
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
        >
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>
    </div>
  )
}
