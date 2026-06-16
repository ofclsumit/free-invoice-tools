import Link from "next/link"
import { Calculator, FileText, Search, Receipt, Package, ShoppingCart, TrendingUp, Hash, ClipboardList, ArrowRight } from "lucide-react"

const tools = [
  { href: "/tools/gst-calculator", icon: Calculator, title: "GST Calculator", desc: "Calculate GST inclusive and exclusive amounts for any rate — 5%, 12%, 18%, 28%", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { href: "/tools/invoice-generator", icon: FileText, title: "Free Invoice Generator", desc: "Create a professional GST invoice without signing up. Download as PDF instantly.", color: "from-violet-500 to-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { href: "/tools/quotation-generator", icon: ClipboardList, title: "Free Quotation Generator", desc: "Create professional quotations for your clients. Download as PDF.", color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  { href: "/tools/gstin-validator", icon: Search, title: "GSTIN Validator", desc: "Validate any GST Identification Number instantly. Check format and state code.", color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { href: "/tools/hsn-finder", icon: Hash, title: "HSN Code Finder", desc: "Search and find the right HSN or SAC code for any product or service.", color: "from-orange-500 to-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
  { href: "/tools/receipt-generator", icon: Receipt, title: "Receipt Generator", desc: "Generate simple payment receipts for any transaction. No GST needed.", color: "from-pink-500 to-pink-600", bg: "bg-pink-50 dark:bg-pink-950/30" },
  { href: "/tools/purchase-order", icon: ShoppingCart, title: "Purchase Order Generator", desc: "Create professional purchase orders for your suppliers.", color: "from-teal-500 to-teal-600", bg: "bg-teal-50 dark:bg-teal-950/30" },
  { href: "/tools/delivery-challan", icon: Package, title: "Delivery Challan", desc: "Generate delivery challans for goods transport without GST invoice.", color: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  { href: "/tools/profit-margin", icon: TrendingUp, title: "Profit Margin Calculator", desc: "Calculate your profit margin, markup, and selling price for any product.", color: "from-amber-500 to-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
]

export function ToolsSection() {
  return (
    <section id="tools" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-widest uppercase">Free Tools</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight">
            All tools at your fingertips
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Free tools for Indian businesses. No signup required. Use them anytime.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {tools.map(tool => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-border p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)]"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tool.bg} mb-4`}>
                  <div className={`bg-gradient-to-br ${tool.color} rounded-lg p-1.5`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="font-display font-semibold text-sm mb-2 group-hover:text-blue-600 transition-colors">{tool.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/#tools"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            View all tools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
