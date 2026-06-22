import Link from "next/link"
import { Calculator, FileText, Search, Receipt, Package, ShoppingCart, TrendingUp, Hash, ClipboardList, ArrowRight, Landmark, Percent, Banknote, PieChart, Tag, DollarSign, StickyNote, FileEdit, PenTool, CreditCard, FileSignature } from "lucide-react"

const toolCategories = [
  {
    label: "Document Generators",
    tools: [
      { href: "/invoice-generator", icon: FileText, title: "Invoice Generator", desc: "Create professional GST invoices with instant PDF download", color: "from-violet-500 to-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
      { href: "/quotation-generator", icon: ClipboardList, title: "Quotation Generator", desc: "Create professional quotations for your clients", color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
      { href: "/proforma-invoice", icon: FileEdit, title: "Proforma Invoice", desc: "Generate proforma invoices for advance billing", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/purchase-order", icon: ShoppingCart, title: "Purchase Order", desc: "Create professional purchase orders for suppliers", color: "from-teal-500 to-teal-600", bg: "bg-teal-50 dark:bg-teal-950/30" },
      { href: "/delivery-challan", icon: Package, title: "Delivery Challan", desc: "Generate delivery challans for goods transport", color: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
      { href: "/receipt-generator", icon: Receipt, title: "Receipt Generator", desc: "Generate payment receipts for any transaction", color: "from-pink-500 to-pink-600", bg: "bg-pink-50 dark:bg-pink-950/30" },
      { href: "/cash-receipt", icon: Banknote, title: "Cash Receipt", desc: "Generate cash payment receipts", color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
      { href: "/payment-receipt", icon: CreditCard, title: "Payment Receipt", desc: "Formal payment receipts with transaction details", color: "from-rose-500 to-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
      { href: "/rent-receipt", icon: StickyNote, title: "Rent Receipt", desc: "Generate rent receipts for tenants", color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
      { href: "/salary-slip", icon: FileText, title: "Salary Slip", desc: "Generate employee salary slips", color: "from-purple-500 to-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
      { href: "/estimate-generator", icon: PenTool, title: "Estimate Generator", desc: "Create project estimates for clients", color: "from-amber-500 to-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
      { href: "/credit-note", icon: FileSignature, title: "Credit Note", desc: "Generate credit notes for returns/refunds", color: "from-green-500 to-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
      { href: "/debit-note", icon: FileEdit, title: "Debit Note", desc: "Generate debit notes for purchases", color: "from-orange-500 to-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
      { href: "/business-letter", icon: PenTool, title: "Business Letter", desc: "Create professional business letters", color: "from-slate-500 to-slate-600", bg: "bg-slate-50 dark:bg-slate-950/30" },
    ],
  },
  {
    label: "Financial Calculators",
    tools: [
      { href: "/gst-calculator", icon: Calculator, title: "GST Calculator", desc: "Calculate GST inclusive/exclusive amounts instantly", color: "from-blue-500 to-violet-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/reverse-gst-calculator", icon: Calculator, title: "Reverse GST Calculator", desc: "Find base amount from GST-inclusive total", color: "from-teal-500 to-cyan-600", bg: "bg-teal-50 dark:bg-teal-950/30" },
      { href: "/gst-split-calculator", icon: PieChart, title: "GST Split Calculator", desc: "Split amounts across different GST rate categories", color: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
      { href: "/gst-rate-finder", icon: Search, title: "GST Rate Finder", desc: "Find GST rates by product or service category", color: "from-sky-500 to-indigo-600", bg: "bg-sky-50 dark:bg-sky-950/30" },
      { href: "/emi-calculator", icon: Calculator, title: "EMI Calculator", desc: "Calculate monthly loan instalments", color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
      { href: "/loan-calculator", icon: Landmark, title: "Loan Calculator", desc: "Calculate loan payments, interest and total cost", color: "from-blue-500 to-indigo-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/interest-calculator", icon: Percent, title: "Interest Calculator", desc: "Calculate simple and compound interest", color: "from-purple-500 to-pink-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
      { href: "/profit-margin", icon: TrendingUp, title: "Profit Margin Calculator", desc: "Calculate profit margin, markup, and selling price", color: "from-amber-500 to-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
      { href: "/break-even-calculator", icon: TrendingUp, title: "Break-Even Calculator", desc: "Calculate break-even point in units and revenue", color: "from-rose-500 to-red-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
      { href: "/commission-calculator", icon: DollarSign, title: "Commission Calculator", desc: "Calculate sales commission amounts", color: "from-cyan-500 to-blue-600", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
      { href: "/discount-calculator", icon: Tag, title: "Discount Calculator", desc: "Calculate savings and final price after discount", color: "from-green-500 to-emerald-600", bg: "bg-green-50 dark:bg-green-950/30" },
    ],
  },
  {
    label: "Utilities & Tools",
    tools: [
      { href: "/hsn-finder", icon: Hash, title: "HSN Code Finder", desc: "Search HSN/SAC codes for products and services", color: "from-orange-500 to-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
      { href: "/gstin-validator", icon: Search, title: "GSTIN Validator", desc: "Validate any GSTIN and identify state", color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    ],
  },
]

export function ToolsSection() {
  return (
    <section id="tools" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-widest uppercase">Free Tools</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight">
            27+ free business tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The most comprehensive free toolkit for Indian businesses. No signup required. Use anytime.
          </p>
        </div>

        {toolCategories.map((category) => (
          <div key={category.label} className="mb-14">
            <h3 className="text-lg font-display font-semibold mb-6 text-muted-foreground">{category.label}</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {category.tools.map((tool) => {
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
                    <h4 className="font-display font-semibold text-sm mb-2 group-hover:text-blue-600 transition-colors">{tool.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
