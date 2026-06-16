"use client"
import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, Download } from "lucide-react"
import { generateProfitMarginPDF } from "@/lib/pdf/generate-profit-margin"

export default function ProfitMarginPage() {
  const [cost, setCost] = useState("")
  const [selling, setSelling] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  const c = parseFloat(cost) || 0
  const s = parseFloat(selling) || 0
  const profit = s - c
  const margin = s > 0 ? (profit / s) * 100 : 0
  const markup = c > 0 ? (profit / c) * 100 : 0

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      await generateProfitMarginPDF({
        cost: c,
        selling: s,
        profit,
        margin,
        markup,
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
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-4">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">Profit Margin Calculator</h1>
          <p className="text-muted-foreground mt-2">Calculate profit margin, markup, and selling price</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-5 shadow-glass">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cost Price (₹)</Label>
            <Input type="number" placeholder="Enter cost price" value={cost} onChange={e => setCost(e.target.value)} className="h-11 text-lg font-semibold" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Selling Price (₹)</Label>
            <Input type="number" placeholder="Enter selling price" value={selling} onChange={e => setSelling(e.target.value)} className="h-11 text-lg font-semibold" />
          </div>

          {(c > 0 || s > 0) && (
            <div className="space-y-4 pt-2">
              <div className="h-px bg-border" />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-display font-bold text-amber-600">{profit >= 0 ? "+" : ""}₹{fmt(profit)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Profit / Loss</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-display font-bold text-emerald-600">{margin.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Profit Margin</p>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-display font-bold text-blue-600">{markup.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Markup Percentage</p>
              </div>

              <Button onClick={handleDownloadPDF} disabled={isDownloading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 font-semibold gap-2">
                <Download className="h-4 w-4" /> {isDownloading ? "Generating Report..." : "Download PDF Analysis"}
              </Button>
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground space-y-1">
            <p><strong>Profit Margin</strong> = (Selling Price - Cost) ÷ Selling Price × 100</p>
            <p><strong>Markup</strong> = (Selling Price - Cost) ÷ Cost × 100</p>
          </div>
        </div>
      </div>
    </div>
  )
}
