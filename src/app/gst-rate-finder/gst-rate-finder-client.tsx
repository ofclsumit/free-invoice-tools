"use client"
import { useState } from "react"
import { Search, Download, RotateCcw } from "lucide-react"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraHeader, UltraCard, UltraTextInput, UltraPrimaryButton,
} from "@/components/ultra/ultra-components"

const GST_RATE_DATA = [
  { category: "Food & Agriculture", hsn: "0101-2309", description: "Live animals, meat, fish, dairy, vegetables, grains", rate: 0, cgst: 0, sgst: 0 },
  { category: "Food & Agriculture", hsn: "1701-1905", description: "Sugar, bakery items, preserved foods", rate: 5, cgst: 2.5, sgst: 2.5 },
  { category: "Food & Agriculture", hsn: "2106", description: "Processed food, packaged items", rate: 18, cgst: 9, sgst: 9 },
  { category: "Electronics", hsn: "8471", description: "Computers, laptops, tablets", rate: 18, cgst: 9, sgst: 9 },
  { category: "Electronics", hsn: "8517", description: "Mobile phones, telephone equipment", rate: 12, cgst: 6, sgst: 6 },
  { category: "Electronics", hsn: "8523", description: "Storage devices, USB drives, memory cards", rate: 18, cgst: 9, sgst: 9 },
  { category: "Electronics", hsn: "8528", description: "Monitors, projectors, TVs", rate: 18, cgst: 9, sgst: 9 },
  { category: "Electronics", hsn: "8443", description: "Printers, scanners, photocopiers", rate: 18, cgst: 9, sgst: 9 },
  { category: "Services", hsn: "9983", description: "IT services, software development", rate: 18, cgst: 9, sgst: 9 },
  { category: "Services", hsn: "9985", description: "Restaurant and food catering services", rate: 5, cgst: 2.5, sgst: 2.5 },
  { category: "Services", hsn: "9964", description: "Transport services", rate: 5, cgst: 2.5, sgst: 2.5 },
  { category: "Services", hsn: "9972", description: "Hotel accommodation (below ₹7,500/night)", rate: 12, cgst: 6, sgst: 6 },
  { category: "Textiles", hsn: "5007", description: "Silk fabrics", rate: 5, cgst: 2.5, sgst: 2.5 },
  { category: "Textiles", hsn: "5208", description: "Cotton fabrics", rate: 5, cgst: 2.5, sgst: 2.5 },
  { category: "Textiles", hsn: "5407", description: "Synthetic fabrics", rate: 5, cgst: 2.5, sgst: 2.5 },
  { category: "Textiles", hsn: "6101-6204", description: "Apparel and clothing (above ₹1,000)", rate: 12, cgst: 6, sgst: 6 },
  { category: "Textiles", hsn: "6403", description: "Leather footwear", rate: 18, cgst: 9, sgst: 9 },
  { category: "Automobiles", hsn: "8703", description: "Motor cars, SUVs, passenger vehicles", rate: 28, cgst: 14, sgst: 14 },
  { category: "Automobiles", hsn: "8711", description: "Motorcycles, scooters, mopeds", rate: 28, cgst: 14, sgst: 14 },
  { category: "Automobiles", hsn: "4011", description: "Tyres and tubes for vehicles", rate: 18, cgst: 9, sgst: 9 },
  { category: "Automobiles", hsn: "8415", description: "Air conditioning machines for vehicles", rate: 28, cgst: 14, sgst: 14 },
  { category: "Healthcare", hsn: "3003", description: "Medicaments, pharmaceuticals", rate: 12, cgst: 6, sgst: 6 },
  { category: "Healthcare", hsn: "9018", description: "Medical instruments and appliances", rate: 12, cgst: 6, sgst: 6 },
  { category: "Healthcare", hsn: "2840", description: "Pharmaceutical products", rate: 12, cgst: 6, sgst: 6 },
  { category: "Furniture", hsn: "9401", description: "Seats, chairs, sofas", rate: 18, cgst: 9, sgst: 9 },
  { category: "Furniture", hsn: "9403", description: "Furniture and wooden fixtures", rate: 18, cgst: 9, sgst: 9 },
  { category: "Publishing & Stationery", hsn: "4901", description: "Printed books, newspapers, brochures", rate: 0, cgst: 0, sgst: 0 },
  { category: "Publishing & Stationery", hsn: "4818", description: "Toilet paper, paper towels, stationery", rate: 12, cgst: 6, sgst: 6 },
  { category: "Luxury Goods", hsn: "7101-7113", description: "Precious metals, gemstones, jewellery", rate: 3, cgst: 1.5, sgst: 1.5 },
  { category: "Luxury Goods", hsn: "4202", description: "Luxury handbags, suitcases, leather goods", rate: 18, cgst: 9, sgst: 9 },
  { category: "Luxury Goods", hsn: "9503", description: "Toys, games, sports equipment", rate: 18, cgst: 9, sgst: 9 },
  { category: "Chemicals", hsn: "3204", description: "Paints, dyes, synthetic colouring matter", rate: 18, cgst: 9, sgst: 9 },
  { category: "Chemicals", hsn: "3401", description: "Soaps, detergents, surface-active products", rate: 18, cgst: 9, sgst: 9 },
  { category: "Construction", hsn: "6810", description: "Cement, concrete, building materials", rate: 28, cgst: 14, sgst: 14 },
  { category: "Construction", hsn: "4403", description: "Wood in the rough, timber", rate: 5, cgst: 2.5, sgst: 2.5 },
  { category: "Energy", hsn: "2701", description: "Coal, lignite, peat", rate: 5, cgst: 2.5, sgst: 2.5 },
  { category: "Energy", hsn: "2710", description: "Petroleum oils, lubricants", rate: 18, cgst: 9, sgst: 9 },
]

export function GstRateFinderClient() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", ...new Set(GST_RATE_DATA.map(d => d.category))]

  const filtered = GST_RATE_DATA.filter(d => {
    const matchesSearch = d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.hsn.includes(search) || d.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "All" || d.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <UltraShell>
      <UltraHeader badge="GST Rate Finder" title={<>GST Rate<br/>Finder</>} subtitle="Look up GST rates by category, HSN code, or product description." />

      <UltraCard>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#f1f5f9]/65 z-10" />
          <UltraTextInput
            placeholder="Search by category, HSN code, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                  : "bg-black/40 border border-white/[0.12] text-[#f1f5f9]/65 hover:text-[#f1f5f9]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-[#f1f5f9]/65">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
          <UltraPrimaryButton className="!px-3 !py-1.5 !text-xs !rounded-lg">
            <Download className="h-3 w-3" /> Export
          </UltraPrimaryButton>
        </div>

        <div className="bg-white/[0.07] border border-white/[0.12] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_60px_60px_60px] sm:grid-cols-[120px_1fr_70px_60px_60px_60px] gap-2 sm:gap-3 px-3 sm:px-5 py-3 text-xs font-semibold text-[#f1f5f9]/65 uppercase tracking-wider border-b border-white/[0.12] bg-black/30">
            <span className="hidden sm:inline">Category</span><span className="sm:hidden">Cat.</span><span>Description</span><span>HSN</span><span>GST</span><span>CGST</span><span>SGST</span>
          </div>
          <div className="divide-y divide-white/[0.06] max-h-[600px] overflow-y-auto">
            {filtered.map((d, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_80px_60px_60px_60px] sm:grid-cols-[120px_1fr_70px_60px_60px_60px] gap-2 sm:gap-3 px-3 sm:px-5 py-3 text-sm hover:bg-white/[0.04] transition-colors">
                <span className="text-xs font-medium text-[#f1f5f9]/65 truncate">{d.category}</span>
                <span className="text-[#f1f5f9]/65 truncate text-xs sm:text-sm" title={d.description}>{d.description}</span>
                <span className="font-mono text-xs text-indigo-400 truncate">{d.hsn}</span>
                <span className={`font-bold ${d.rate === 0 ? "text-emerald-400" : d.rate >= 28 ? "text-rose-400" : "text-amber-400"}`}>{d.rate}%</span>
                <span className="text-xs text-[#f1f5f9]/65">{d.cgst}%</span>
                <span className="text-xs text-[#f1f5f9]/65">{d.sgst}%</span>
              </div>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-[#f1f5f9]/65 py-8">No GST rates found for &quot;{search}&quot;</p>
        )}

        <p className="text-xs text-[#f1f5f9]/50 text-center mt-6">GST rates are indicative. Please refer to official GST portal for accurate rates.</p>
      </UltraCard>
    </UltraShell>
  )
}
