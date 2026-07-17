"use client"
import Link from "next/link"
import { Calculator, FileText, Search, Receipt, Package, ShoppingCart, TrendingUp, Hash, ClipboardList, ArrowRight, Landmark, Percent, Banknote, PieChart, Tag, DollarSign, StickyNote, FileEdit, PenTool, CreditCard, FileSignature, IndianRupee, Home, ArrowLeftRight, Building, CalendarDays } from "lucide-react"

export const toolCategories = [
  {
    label: "Document Generators",
    tools: [
      { href: "/invoice-generator", icon: FileText, title: "Invoice Generator", desc: "Create professional GST invoices with instant PDF download", color: "from-violet-500 to-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
      { href: "/quotation-generator", icon: ClipboardList, title: "Quotation Generator", desc: "Create professional quotations for your clients", color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
      { href: "/proforma-invoice", icon: FileEdit, title: "Proforma Invoice", desc: "Generate proforma invoices for advance billing", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/purchase-order", icon: ShoppingCart, title: "Purchase Order", desc: "Create professional purchase orders for suppliers", color: "from-teal-500 to-teal-600", bg: "bg-teal-50 dark:bg-teal-950/30" },
      { href: "/delivery-challan", icon: Package, title: "Delivery Challan", desc: "Generate delivery challans for goods transport", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/payment-receipt", icon: IndianRupee, title: "Payment Receipt", desc: "Create formal payment receipts with transaction details", color: "from-cyan-500 to-blue-600", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
      { href: "/rent-receipt", icon: Home, title: "Rent Receipt", desc: "Create house rent receipts for HRA", color: "from-blue-500 to-teal-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/salary-slip", icon: FileText, title: "Salary Slip", desc: "Generate employee salary slips", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/estimate-generator", icon: PenTool, title: "Estimate Generator", desc: "Create project estimates for clients", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/credit-note", icon: FileSignature, title: "Credit Note", desc: "Generate credit notes for returns/refunds", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/debit-note", icon: FileEdit, title: "Debit Note", desc: "Generate debit notes for purchases", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/business-letter", icon: PenTool, title: "Business Letter", desc: "Create professional business letters", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
    ],
  },
  {
    label: "Financial Calculators",
    tools: [
      { href: "/gst-calculator", icon: Calculator, title: "GST Calculator", desc: "Calculate forward and reverse GST", color: "from-blue-500 to-indigo-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/reverse-gst-calculator", icon: ArrowLeftRight, title: "Reverse GST", desc: "Calculate base price from GST inclusive amount", color: "from-cyan-500 to-blue-600", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
      { href: "/gst-split-calculator", icon: PieChart, title: "GST Split Calculator", desc: "Split amounts across different GST rate categories", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/gst-rate-finder", icon: Search, title: "GST Rate Finder", desc: "Find GST rates by product or service category", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/emi-calculator", icon: CalendarDays, title: "EMI Calculator", desc: "Calculate loan EMIs and amortization", color: "from-indigo-500 to-blue-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
      { href: "/loan-calculator", icon: Building, title: "Loan Calculator", desc: "Detailed loan analysis and schedules", color: "from-teal-500 to-cyan-600", bg: "bg-teal-50 dark:bg-teal-950/30" },
      { href: "/interest-calculator", icon: Percent, title: "Interest Calculator", desc: "Calculate simple and compound interest", color: "from-blue-500 to-cyan-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
      { href: "/profit-margin", icon: TrendingUp, title: "Profit Margin Calculator", desc: "Calculate profit margin, markup, and selling price", color: "from-amber-500 to-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
      { href: "/break-even-calculator", icon: TrendingUp, title: "Break-Even Calculator", desc: "Calculate break-even point in units and revenue", color: "from-rose-500 to-red-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
      { href: "/commission-calculator", icon: DollarSign, title: "Commission Calculator", desc: "Calculate sales commission amounts", color: "from-cyan-500 to-blue-600", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
      { href: "/discount-calculator", icon: Tag, title: "Discount Calculator", desc: "Calculate savings and final price after discount", color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
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
    <section id="tools" className="tools-section-root">
      <style dangerouslySetInnerHTML={{ __html: `
        .tools-section-root {
          width: 100%;
          font-family: 'Inter', sans-serif;
          padding: 5rem 1.25rem 5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          background: transparent;
          color: var(--foreground);
        }
        
        .tools-section-container {
          max-width: 920px;
          width: 100%;
        }

        .tools-section-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .tools-section-eyebrow {
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: #4f46e5;
          margin-bottom: .6rem;
        }
        
        .dark .tools-section-eyebrow {
          color: #a78bfa;
        }

        .tools-section-title {
          font-size: 2.4rem;
          font-weight: 700;
          color: var(--foreground);
          letter-spacing: -.03em;
          line-height: 1.1;
        }

        .tools-section-sub {
          font-size: .95rem;
          color: var(--muted-foreground);
          margin-top: .55rem;
        }

        .section {
          margin-bottom: 2.5rem;
          width: 100%;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: .65rem;
          margin-bottom: 1.25rem;
        }

        .section-icon {
          width: 28px;
          height: 28px;
          border-radius: .6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-icon svg {
          width: 16px;
          height: 16px;
        }

        .section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--foreground);
          letter-spacing: -.01em;
        }

        .section-count {
          font-size: .72rem;
          font-weight: 600;
          color: var(--muted-foreground);
          margin-left: auto;
          background: var(--secondary);
          border: 1px solid var(--border);
          padding: .15rem .65rem;
          border-radius: 2rem;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: .75rem;
        }

        @media (max-width: 480px) {
          .tools-grid {
            grid-template-columns: 1fr 1fr;
          }
          .tools-section-title {
            font-size: 1.75rem;
          }
        }

        .section-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
          margin: 1.75rem 0;
        }

        .icon-calc {
          background: linear-gradient(135deg, rgba(139,92,246,.2), rgba(59,130,246,.1));
          color: #6366f1;
        }
        
        .dark .icon-calc {
          background: linear-gradient(135deg, rgba(139,92,246,.3), rgba(59,130,246,.2));
          color: #a78bfa;
        }

        .icon-util {
          background: linear-gradient(135deg, rgba(16,185,129,.2), rgba(52,211,153,.1));
          color: #10b981;
        }
        
        .dark .icon-util {
          background: linear-gradient(135deg, rgba(16,185,129,.25), rgba(52,211,153,.15));
          color: #34d399;
        }

        .icon-doc {
          background: linear-gradient(135deg, rgba(251,191,36,.2), rgba(245,158,11,.1));
          color: #d97706;
        }
        
        .dark .icon-doc {
          background: linear-gradient(135deg, rgba(251,191,36,.25), rgba(245,158,11,.15));
          color: #fbbf24;
        }
      ` }} />

      <svg style={{ display: "none" }} aria-hidden="true">
        <defs>
          <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
            <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="tools-section-container">
        <div className="tools-section-header">
          <p className="tools-section-eyebrow">Tool Hub</p>
          <h2 className="tools-section-title">Financial Calculators &amp; Tools</h2>
          <p className="tools-section-sub">Everything you need to manage your business finances — all in one place</p>
        </div>

        {toolCategories.map((category, idx) => {
          let CategoryIcon = FileText
          let iconClass = "icon-doc"
          if (category.label === "Financial Calculators") {
            CategoryIcon = Calculator
            iconClass = "icon-calc"
          } else if (category.label === "Utilities & Tools") {
            CategoryIcon = Search
            iconClass = "icon-util"
          }

          return (
            <div key={category.label}>
              {idx > 0 && <div className="section-divider" />}
              <div className="section">
                <div className="section-header">
                  <span className={`section-icon ${iconClass}`}>
                    <CategoryIcon />
                  </span>
                  <span className="section-title">{category.label}</span>
                  <span className="section-count">{category.tools.length} tools</span>
                </div>
                <div className="tools-grid">
                  {category.tools.map((tool) => {
                    const ToolIcon = tool.icon
                    let badge = "Generator"
                    if (category.label === "Financial Calculators") {
                      badge = "Calculator"
                    } else if (category.label === "Utilities & Tools") {
                      badge = "Utility"
                    }
                    return (
                      <Link key={tool.href} href={tool.href} className="tool-card">
                        <div className="glass-filter" />
                        <div className="glass-overlay" />
                        <div className="glass-specular" />
                        <div className="glass-content">
                          <span className="tc-name">
                            <ToolIcon />
                            {tool.title}
                          </span>
                          <span className="tc-desc">{tool.desc}</span>
                          <span className="tc-badge">{badge}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
