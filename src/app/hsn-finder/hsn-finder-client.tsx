"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download } from "lucide-react"
import { generateHsnListPDF } from "@/lib/pdf/generate-hsn-list"

const HSN_CODES = [
  { code: "0101", description: "Live horses, asses, mules and hinnies", rate: "0%" },
  { code: "0201", description: "Fresh or chilled meat of bovine animals", rate: "0%" },
  { code: "0301", description: "Live fish", rate: "0%" },
  { code: "0401", description: "Milk and cream", rate: "5%" },
  { code: "0701", description: "Fresh or chilled potatoes", rate: "0%" },
  { code: "0901", description: "Coffee", rate: "5%" },
  { code: "1001", description: "Wheat and meslin", rate: "0%" },
  { code: "1701", description: "Cane or beet sugar", rate: "5%" },
  { code: "1905", description: "Bread, pastry, cakes, biscuits", rate: "5%" },
  { code: "2106", description: "Food preparations not elsewhere specified", rate: "18%" },
  { code: "2201", description: "Waters, including mineral waters", rate: "5%" },
  { code: "2309", description: "Animal feed preparations", rate: "5%" },
  { code: "2501", description: "Salt and pure sodium chloride", rate: "0%" },
  { code: "2701", description: "Coal", rate: "5%" },
  { code: "2710", description: "Petroleum oils", rate: "18%" },
  { code: "2840", description: "Pharmaceutical products", rate: "12%" },
  { code: "3003", description: "Medicaments", rate: "12%" },
  { code: "3204", description: "Synthetic organic colouring matter", rate: "18%" },
  { code: "3401", description: "Soap and organic surface-active products", rate: "18%" },
  { code: "3926", description: "Plastic articles", rate: "18%" },
  { code: "4011", description: "New pneumatic tyres of rubber", rate: "18%" },
  { code: "4202", description: "Trunks, suitcases, handbags", rate: "18%" },
  { code: "4403", description: "Wood in the rough", rate: "5%" },
  { code: "4818", description: "Toilet paper, paper towels", rate: "12%" },
  { code: "4901", description: "Printed books, brochures", rate: "0%" },
  { code: "5007", description: "Woven fabrics of silk", rate: "5%" },
  { code: "5208", description: "Cotton fabrics", rate: "5%" },
  { code: "5407", description: "Synthetic filament yarn fabrics", rate: "5%" },
  { code: "6101", description: "Men's overcoats of wool or cotton", rate: "12%" },
  { code: "6204", description: "Women's suits, jackets, dresses", rate: "12%" },
  { code: "6403", description: "Leather footwear", rate: "18%" },
  { code: "6911", description: "Tableware and kitchenware of porcelain", rate: "18%" },
  { code: "7010", description: "Glass bottles", rate: "18%" },
  { code: "7210", description: "Flat-rolled iron products", rate: "18%" },
  { code: "7318", description: "Screws, bolts, nuts of iron", rate: "18%" },
  { code: "7411", description: "Copper tubes and pipes", rate: "18%" },
  { code: "8413", description: "Pumps for liquids", rate: "18%" },
  { code: "8414", description: "Air or vacuum pumps, fans", rate: "18%" },
  { code: "8415", description: "Air conditioning machines", rate: "28%" },
  { code: "8443", description: "Printing machinery", rate: "18%" },
  { code: "8471", description: "Computers and laptops", rate: "18%" },
  { code: "8517", description: "Telephone sets, mobile phones", rate: "12%" },
  { code: "8523", description: "Storage devices (USB, memory cards)", rate: "18%" },
  { code: "8528", description: "Monitors and projectors", rate: "18%" },
  { code: "8529", description: "Parts for TV, radio, radar", rate: "18%" },
  { code: "8703", description: "Motor cars for transport of persons", rate: "28%" },
  { code: "8711", description: "Motorcycles and cycles with motor", rate: "28%" },
  { code: "9018", description: "Medical instruments and appliances", rate: "12%" },
  { code: "9401", description: "Seats and chairs", rate: "18%" },
  { code: "9403", description: "Furniture and parts thereof", rate: "18%" },
  { code: "9503", description: "Toys and models", rate: "18%" },
  { code: "9701", description: "Paintings and sculptures", rate: "12%" },
]

export function HsnFinderClient() {
  const [search, setSearch] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  
  const filtered = HSN_CODES.filter(h =>
    h.code.includes(search) || h.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      await generateHsnListPDF({
        searchQuery: search,
        items: filtered,
      })
    } catch (error) {
      console.error("PDF generation failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-11 text-sm"
          />
        </div>
        <Button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 font-semibold gap-2 h-11 w-full sm:w-auto">
          <Download className="h-4 w-4" /> {isDownloading ? "..." : "Export"}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_60px] sm:grid-cols-[100px_1fr_80px] gap-2 sm:gap-4 px-3 sm:px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30">
          <span>HSN Code</span><span>Description</span><span>GST Rate</span>
        </div>
        <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
          {filtered.map(h => (
            <div key={h.code} className="grid grid-cols-[80px_1fr_60px] sm:grid-cols-[100px_1fr_80px] gap-2 sm:gap-4 px-3 sm:px-5 py-3 text-sm hover:bg-muted/30 transition-colors">
              <span className="font-mono font-semibold text-blue-600 truncate">{h.code}</span>
              <span className="text-muted-foreground truncate" title={h.description}>{h.description}</span>
              <span className="font-semibold">{h.rate}</span>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No HSN codes found for &quot;{search}&quot;</p>
      )}

      <p className="text-xs text-muted-foreground text-center">This is a sample list. Consult official GST portal for complete HSN database.</p>
    </div>
  )
}
