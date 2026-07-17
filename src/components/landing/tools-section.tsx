"use client"
import Link from "next/link"
import { useState, useMemo } from "react"
import { Calculator, FileText, Search, Receipt, Package, ShoppingCart, TrendingUp, Hash, ClipboardList, ArrowRight, Landmark, Percent, Banknote, PieChart, Tag, DollarSign, StickyNote, FileEdit, PenTool, CreditCard, FileSignature, IndianRupee, Home, ArrowLeftRight, Building, CalendarDays, LayoutGrid, X } from "lucide-react"

const toolCategories = [
  {
    label: "Document Generators",
    icon: FileText,
    accent: "doc",
    tools: [
      { href: "/invoice-generator", icon: FileText, title: "Invoice Generator", desc: "Create professional GST invoices with instant PDF download" },
      { href: "/quotation-generator", icon: ClipboardList, title: "Quotation Generator", desc: "Create professional quotations for your clients" },
      { href: "/proforma-invoice", icon: FileEdit, title: "Proforma Invoice", desc: "Generate proforma invoices for advance billing" },
      { href: "/purchase-order", icon: ShoppingCart, title: "Purchase Order", desc: "Create professional purchase orders for suppliers" },
      { href: "/delivery-challan", icon: Package, title: "Delivery Challan", desc: "Generate delivery challans for goods transport" },
      { href: "/payment-receipt", icon: IndianRupee, title: "Payment Receipt", desc: "Create formal payment receipts with transaction details" },
      { href: "/rent-receipt", icon: Home, title: "Rent Receipt", desc: "Create house rent receipts for HRA" },
      { href: "/salary-slip", icon: FileText, title: "Salary Slip", desc: "Generate employee salary slips" },
      { href: "/estimate-generator", icon: PenTool, title: "Estimate Generator", desc: "Create project estimates for your clients" },
      { href: "/credit-note", icon: FileSignature, title: "Credit Note", desc: "Generate credit notes for returns/refunds" },
      { href: "/debit-note", icon: FileEdit, title: "Debit Note", desc: "Generate debit notes for purchases" },
      { href: "/business-letter", icon: PenTool, title: "Business Letter", desc: "Create professional business letters" },
    ],
  },
  {
    label: "Financial Calculators",
    icon: Calculator,
    accent: "calc",
    tools: [
      { href: "/gst-calculator", icon: Calculator, title: "GST Calculator", desc: "Calculate forward and reverse GST" },
      { href: "/reverse-gst-calculator", icon: ArrowLeftRight, title: "Reverse GST", desc: "Calculate base price from GST inclusive amount" },
      { href: "/gst-split-calculator", icon: PieChart, title: "GST Split Calculator", desc: "Split amounts across different GST rate categories" },
      { href: "/gst-rate-finder", icon: Search, title: "GST Rate Finder", desc: "Find GST rates by product or service category" },
      { href: "/emi-calculator", icon: CalendarDays, title: "EMI Calculator", desc: "Calculate loan EMIs and amortization" },
      { href: "/loan-calculator", icon: Building, title: "Loan Calculator", desc: "Detailed loan analysis and schedules" },
      { href: "/interest-calculator", icon: Percent, title: "Interest Calculator", desc: "Calculate simple and compound interest" },
      { href: "/profit-margin", icon: TrendingUp, title: "Profit Margin Calculator", desc: "Calculate profit margin, markup, and selling price" },
      { href: "/break-even-calculator", icon: TrendingUp, title: "Break-Even Calculator", desc: "Calculate break-even point in units and revenue" },
      { href: "/commission-calculator", icon: DollarSign, title: "Commission Calculator", desc: "Calculate sales commission amounts" },
      { href: "/discount-calculator", icon: Tag, title: "Discount Calculator", desc: "Calculate savings and final price after discount" },
    ],
  },
  {
    label: "Utilities & Tools",
    icon: Search,
    accent: "util",
    tools: [
      { href: "/hsn-finder", icon: Hash, title: "HSN Code Finder", desc: "Search HSN/SAC codes for products and services" },
      { href: "/gstin-validator", icon: Search, title: "GSTIN Validator", desc: "Validate any GSTIN and identify state" },
    ],
  },
]

const allTools = toolCategories.flatMap((c) =>
  c.tools.map((t) => ({ ...t, category: c.label, accent: c.accent }))
)

export function ToolsSection() {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState<string>("All")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allTools.filter((t) => {
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      const matchesCat = active === "All" || t.category === active
      return matchesQuery && matchesCat
    })
  }, [query, active])

  const tabs = ["All", ...toolCategories.map((c) => c.label)]

  return (
    <section id="tools" className="tools-section-root">
      <style dangerouslySetInnerHTML={{ __html: `
        .tools-section-root {
          width: 100%;
          font-family: 'Inter', sans-serif;
          padding: 4.5rem 1.25rem 5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          color: var(--foreground);
        }

        .tools-section-container {
          max-width: 1080px;
          width: 100%;
        }

        .tools-section-header { text-align: center; margin-bottom: 2.25rem; }

        .tools-section-eyebrow {
          font-size: .72rem; font-weight: 700; letter-spacing: .15em;
          text-transform: uppercase; color: #4f46e5; margin-bottom: .6rem;
        }
        .dark .tools-section-eyebrow { color: #a78bfa; }

        .tools-section-title {
          font-size: 2.2rem; font-weight: 800; color: var(--foreground);
          letter-spacing: -.03em; line-height: 1.12;
        }

        .tools-section-sub {
          font-size: .95rem; color: var(--muted-foreground); margin-top: .55rem;
          max-width: 44rem; margin-left: auto; margin-right: auto;
        }

        /* Search bar */
        .tools-search {
          position: relative;
          max-width: 520px;
          margin: 0 auto 1.75rem;
        }
        .tools-search-input {
          width: 100%;
          height: 52px;
          padding: 0 1rem 0 3rem;
          border-radius: 9999px;
          font-size: .95rem;
          color: var(--foreground);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }
        .dark .tools-search-input { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
        .tools-search-input::placeholder { color: var(--muted-foreground); }
        .tools-search-input:focus {
          border-color: rgba(139,92,246,0.6);
          box-shadow: 0 0 0 4px rgba(139,92,246,0.15);
          background: rgba(255,255,255,0.08);
        }
        .tools-search-icon {
          position: absolute; left: 1.05rem; top: 50%; transform: translateY(-50%);
          color: var(--muted-foreground); pointer-events: none;
        }
        .tools-search-clear {
          position: absolute; right: .65rem; top: 50%; transform: translateY(-50%);
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 9999px;
          color: var(--muted-foreground); transition: background .2s ease, color .2s ease;
        }
        .tools-search-clear:hover { background: var(--secondary); color: var(--foreground); }

        /* Category tabs */
        .tools-tabs {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
          gap: .5rem; margin: 0 auto 2.25rem; max-width: max-content;
          padding: .35rem; border-radius: 9999px;
          border: 1px solid var(--border); background: var(--card);
          box-shadow: 0 1px 2px rgba(0,0,0,.04);
        }
        .dark .tools-tabs { background: rgba(255,255,255,.03); border-color: rgba(255,255,255,.1); }
        .tools-tab {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .5rem 1rem; border-radius: 9999px;
          font-size: .85rem; font-weight: 600; color: var(--muted-foreground);
          cursor: pointer; white-space: nowrap; border: 1px solid transparent;
          transition: all .2s ease;
        }
        .tools-tab:hover { color: var(--foreground); background: var(--secondary); }
        .tools-tab.active {
          color: #fff; background: linear-gradient(90deg,#8B5CF6,#7C3AED);
          box-shadow: 0 6px 16px -4px rgba(139,92,246,.5);
        }
        .tools-tab svg { width: 15px; height: 15px; }

        /* Grid */
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }
        @media (max-width: 520px) {
          .tools-grid { grid-template-columns: 1fr 1fr; gap: .75rem; }
          .tools-section-title { font-size: 1.7rem; }
        }

        /* Premium cards */
        .tool-card-il {
          position: relative;
          display: flex; flex-direction: column;
          text-decoration: none;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.2rem 1.1rem 1.05rem;
          overflow: hidden;
          transition: transform .25s cubic-bezier(.175,.885,.32,1.2), box-shadow .2s ease, border-color .2s ease;
          will-change: transform;
        }
        .tool-card-il:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 36px -12px rgba(124,58,237,.32);
          border-color: rgba(139,92,246,.45);
        }

        .tool-icon-tile {
          width: 46px; height: 46px; border-radius: .85rem;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: .85rem; flex-shrink: 0;
        }
        .tool-icon-tile svg { width: 23px; height: 23px; }

        .doc-tile { background: linear-gradient(135deg, rgba(139,92,246,.18), rgba(99,102,241,.1)); color: #7c3aed; }
        .dark .doc-tile { background: linear-gradient(135deg, rgba(139,92,246,.3), rgba(99,102,241,.2)); color: #c4b5fd; }
        .calc-tile { background: linear-gradient(135deg, rgba(59,130,246,.18), rgba(14,165,233,.1)); color: #2563eb; }
        .dark .calc-tile { background: linear-gradient(135deg, rgba(59,130,246,.3), rgba(14,165,233,.2)); color: #93c5fd; }
        .util-tile { background: linear-gradient(135deg, rgba(16,185,129,.18), rgba(52,211,153,.1)); color: #059669; }
        .dark .util-tile { background: linear-gradient(135deg, rgba(16,185,129,.28), rgba(52,211,153,.18)); color: #6ee7b7; }

        .tool-title { font-size: .97rem; font-weight: 700; line-height: 1.3; color: var(--foreground); }
        .tool-desc { font-size: .8rem; color: var(--muted-foreground); margin-top: .35rem; line-height: 1.4; }
        .tool-arrow {
          margin-top: auto; padding-top: .8rem; color: #8b5cf6;
          opacity: 0; transform: translateX(-6px); transition: all .25s ease;
        }
        .tool-card-il:hover .tool-arrow { opacity: 1; transform: translateX(0); }

        .tools-empty { text-align: center; color: var(--muted-foreground); padding: 3rem 0; font-size: .95rem; }
      ` }} />

      <div className="tools-section-container">
        <div className="tools-section-header">
          <p className="tools-section-eyebrow">All-in-One Tool Hub</p>
          <h2 className="tools-section-title">Every tool you need for your business documents</h2>
          <p className="tools-section-sub">
            Create invoices, quotations, GST documents and more — plus calculators and utilities to manage your finances. All 100% free.
          </p>
        </div>

        {/* Search bar */}
        <div className="tools-search">
          <Search size={18} className="tools-search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Invoice, GST, Quotation, PDF..."
            className="tools-search-input"
            aria-label="Search tools"
          />
          {query && (
            <button className="tools-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="tools-tabs">
          {tabs.map((tab) => {
            const Icon = tab === "All" ? LayoutGrid : toolCategories.find((c) => c.label === tab)!.icon
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActive(tab)}
                className={`tools-tab ${active === tab ? "active" : ""}`}
              >
                <Icon />
                {tab}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        <div className="tools-grid">
          {filtered.map((tool) => {
            const ToolIcon = tool.icon
            return (
              <Link key={tool.href} href={tool.href} className="tool-card-il">
                <span className={`tool-icon-tile ${tool.accent === "doc" ? "doc-tile" : tool.accent === "calc" ? "calc-tile" : "util-tile"}`}>
                  <ToolIcon />
                </span>
                <span className="tool-title">{tool.title}</span>
                <span className="tool-desc">{tool.desc}</span>
                <span className="tool-arrow">
                  <ArrowRight size={18} />
                </span>
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <p className="tools-empty">No tools found for &ldquo;{query}&rdquo;. Try another keyword.</p>
        )}
      </div>
    </section>
  )
}
