"use client"

import React from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  FileText,
  FileSignature,
  FileSpreadsheet,
  ShoppingCart,
  Truck,
  Receipt,
  Home,
  Wallet,
  ClipboardList,
  FileMinus,
  FilePlus,
  Mail,
  Percent,
  RotateCcw,
  PieChart,
  Search,
  Landmark,
  Banknote,
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart3,
  Scale,
  HandCoins,
  Tag,
  Hash,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  X,
  FileCheck,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Tool & Category Data Model + Smart Badge System
// ---------------------------------------------------------------------------

export type ToolBadgeType = "NEW" | "TRENDING" | "POPULAR" | "UPDATED"

/**
 * Central configuration for badge durations in days.
 */
export const NEW_BADGE_DAYS = 30
export const UPDATED_BADGE_DAYS = 14

export type ToolItem = {
  id?: string
  href: string
  title: string
  name: string
  desc: string
  description: string
  icon: React.ComponentType<any>
  color?: string
  bg?: string
  createdAt?: string      // e.g. "2026-08-30" — automatically triggers NEW for NEW_BADGE_DAYS
  updatedAt?: string      // e.g. "2026-08-25" — automatically triggers UPDATED for UPDATED_BADGE_DAYS
  badge?: ToolBadgeType   // Manually configured badge: "TRENDING" | "POPULAR" | "UPDATED"
  badgeExpiresAt?: string // Optional manual badge expiry date
}

export type ToolCategory = {
  id: string
  label: string
  anchorId: string
  icon: React.ComponentType<any>
  accent: "violet" | "blue" | "emerald"
  tools: ToolItem[]
}

/**
 * Centralized helper: Determines the active badge for a tool based on priority:
 * 1. Automatic NEW (within NEW_BADGE_DAYS)
 * 2. Manual badge assignment (TRENDING / POPULAR / UPDATED)
 * 3. Automatic UPDATED (within UPDATED_BADGE_DAYS)
 * 4. null (No badge by default)
 */
export function getToolBadge(tool: ToolItem, currentDate = new Date()): ToolBadgeType | null {
  // 1. Automatic NEW check (Highest priority)
  if (tool.createdAt) {
    const createdDate = new Date(tool.createdAt)
    if (!isNaN(createdDate.getTime())) {
      const diffMs = currentDate.getTime() - createdDate.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      if (diffDays >= 0 && diffDays <= NEW_BADGE_DAYS) {
        return "NEW"
      }
    }
  }

  // 2. Explicit manual badge assignment
  if (tool.badge) {
    if (tool.badgeExpiresAt) {
      const expiryDate = new Date(tool.badgeExpiresAt)
      if (!isNaN(expiryDate.getTime()) && currentDate > expiryDate) {
        return null
      }
    }
    return tool.badge
  }

  // 3. Automatic UPDATED check
  if (tool.updatedAt) {
    const updatedDate = new Date(tool.updatedAt)
    if (!isNaN(updatedDate.getTime())) {
      const diffMs = currentDate.getTime() - updatedDate.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      if (diffDays >= 0 && diffDays <= UPDATED_BADGE_DAYS) {
        return "UPDATED"
      }
    }
  }

  return null
}

const BADGE_STYLES: Record<ToolBadgeType, string> = {
  NEW: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25 dark:border-violet-400/30",
  TRENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 dark:border-amber-400/30",
  POPULAR: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25 dark:border-blue-400/30",
  UPDATED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-400/30",
}

// ---------------------------------------------------------------------------
// Live Tools on turnivo.in
// ---------------------------------------------------------------------------

export const toolCategories: ToolCategory[] = [
  {
    id: "document-generators",
    label: "Document Generators",
    anchorId: "cat-document",
    icon: FileText,
    accent: "violet",
    tools: [
      {
        id: "invoice-generator",
        href: "/invoice-generator",
        title: "Invoice Generator",
        name: "Invoice Generator",
        desc: "Create professional GST invoices with instant PDF download",
        description: "Create professional GST invoices with instant PDF download",
        icon: FileText,
        color: "from-violet-500 to-violet-600",
        bg: "bg-violet-50 dark:bg-violet-950/30",
      },
      {
        id: "quotation-generator",
        href: "/quotation-generator",
        title: "Quotation Generator",
        name: "Quotation Generator",
        desc: "Create professional quotations for your clients",
        description: "Create professional quotations for your clients",
        icon: FileSignature,
        color: "from-indigo-500 to-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-950/30",
        badge: "TRENDING",
      },
      {
        id: "resume-generator",
        href: "/resume-generator",
        title: "Resume Generator",
        name: "Resume Generator",
        desc: "Create professional A4 resumes with live editor and PDF download",
        description: "Create professional A4 resumes with live editor and PDF download",
        icon: FileCheck,
        color: "from-purple-500 to-indigo-600",
        bg: "bg-purple-50 dark:bg-purple-950/30",
        createdAt: "2026-08-30",
      },
      {
        href: "/proforma-invoice",
        title: "Proforma Invoice",
        name: "Proforma Invoice",
        desc: "Generate proforma invoices for advance billing",
        description: "Generate proforma invoices for advance billing",
        icon: FileSpreadsheet,
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      {
        href: "/purchase-order",
        title: "Purchase Order",
        name: "Purchase Order",
        desc: "Create professional purchase orders for suppliers",
        description: "Create professional purchase orders for suppliers",
        icon: ShoppingCart,
        color: "from-teal-500 to-teal-600",
        bg: "bg-teal-50 dark:bg-teal-950/30",
      },
      {
        href: "/delivery-challan",
        title: "Delivery Challan",
        name: "Delivery Challan",
        desc: "Generate delivery challans for goods transport",
        description: "Generate delivery challans for goods transport",
        icon: Truck,
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      {
        href: "/payment-receipt",
        title: "Payment Receipt",
        name: "Payment Receipt",
        desc: "Create formal payment receipts with transaction details",
        description: "Create formal payment receipts with transaction details",
        icon: Receipt,
        color: "from-cyan-500 to-blue-600",
        bg: "bg-cyan-50 dark:bg-cyan-950/30",
      },
      {
        href: "/rent-receipt",
        title: "Rent Receipt",
        name: "Rent Receipt",
        desc: "Create house rent receipts for HRA",
        description: "Create house rent receipts for HRA",
        icon: Home,
        color: "from-blue-500 to-teal-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      {
        href: "/salary-slip",
        title: "Salary Slip",
        name: "Salary Slip",
        desc: "Generate employee salary slips",
        description: "Generate employee salary slips",
        icon: Wallet,
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      {
        href: "/estimate-generator",
        title: "Estimate Generator",
        name: "Estimate Generator",
        desc: "Create project estimates for clients",
        description: "Create project estimates for clients",
        icon: ClipboardList,
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      {
        href: "/credit-note",
        title: "Credit Note",
        name: "Credit Note",
        desc: "Generate credit notes for returns/refunds",
        description: "Generate credit notes for returns/refunds",
        icon: FileMinus,
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      {
        href: "/debit-note",
        title: "Debit Note",
        name: "Debit Note",
        desc: "Generate debit notes for purchases",
        description: "Generate debit notes for purchases",
        icon: FilePlus,
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      {
        href: "/business-letter",
        title: "Business Letter",
        name: "Business Letter",
        desc: "Create professional business letters",
        description: "Create professional business letters",
        icon: Mail,
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
    ],
  },
  {
    id: "financial-calculators",
    label: "Financial Calculators",
    anchorId: "cat-calculators",
    icon: Percent,
    accent: "blue",
    tools: [
      {
        id: "profit-leak-detector",
        href: "/profit-leak-detector",
        title: "Profit Leak Detector",
        name: "Profit Leak Detector",
        desc: "Identify hidden business costs and calculate profit leakage",
        description: "Identify hidden business costs and calculate profit leakage",
        icon: TrendingDown,
        color: "from-rose-500 to-violet-600",
        bg: "bg-rose-50 dark:bg-rose-950/30",
        createdAt: "2026-08-30",
        badge: "NEW",
      },
      {
        id: "subscription-leak-detector",
        href: "/subscription-leak-detector",
        title: "Subscription Leak Detector",
        name: "Subscription Leak Detector",
        desc: "Identify unused, duplicate, or overpriced subscriptions",
        description: "Identify unused, duplicate, or overpriced subscriptions",
        icon: Layers,
        color: "from-violet-500 to-indigo-600",
        bg: "bg-violet-50 dark:bg-violet-950/30",
        createdAt: "2026-08-30",
        badge: "NEW",
      },
      {
        id: "gst-calculator",
        href: "/gst-calculator",
        title: "GST Calculator",
        name: "GST Calculator",
        desc: "Calculate forward and reverse GST",
        description: "Calculate forward and reverse GST",
        icon: Percent,
        color: "from-blue-500 to-indigo-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
        badge: "POPULAR",
      },
      {
        href: "/reverse-gst-calculator",
        title: "Reverse GST",
        name: "Reverse GST",
        desc: "Calculate base price from GST inclusive amount",
        description: "Calculate base price from GST inclusive amount",
        icon: RotateCcw,
        color: "from-cyan-500 to-blue-600",
        bg: "bg-cyan-50 dark:bg-cyan-950/30",
      },
      {
        href: "/gst-split-calculator",
        title: "GST Split Calculator",
        name: "GST Split Calculator",
        desc: "Split amounts across different GST rate categories",
        description: "Split amounts across different GST rate categories",
        icon: PieChart,
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      {
        href: "/gst-rate-finder",
        title: "GST Rate Finder",
        name: "GST Rate Finder",
        desc: "Find GST rates by product or service category",
        description: "Find GST rates by product or service category",
        icon: Search,
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      {
        href: "/emi-calculator",
        title: "EMI Calculator",
        name: "EMI Calculator",
        desc: "Calculate loan EMIs and amortization",
        description: "Calculate loan EMIs and amortization",
        icon: Landmark,
        color: "from-indigo-500 to-blue-600",
        bg: "bg-indigo-50 dark:bg-indigo-950/30",
      },
      {
        href: "/loan-calculator",
        title: "Loan Calculator",
        name: "Loan Calculator",
        desc: "Detailed loan analysis and schedules",
        description: "Detailed loan analysis and schedules",
        icon: Banknote,
        color: "from-teal-500 to-cyan-600",
        bg: "bg-teal-50 dark:bg-teal-950/30",
      },
      {
        href: "/interest-calculator",
        title: "Interest Calculator",
        name: "Interest Calculator",
        desc: "Calculate simple and compound interest",
        description: "Calculate simple and compound interest",
        icon: TrendingUp,
        color: "from-blue-500 to-cyan-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      {
        href: "/profit-margin",
        title: "Profit Margin Calculator",
        name: "Profit Margin Calculator",
        desc: "Calculate profit margin, markup, and selling price",
        description: "Calculate profit margin, markup, and selling price",
        icon: BarChart3,
        color: "from-amber-500 to-amber-600",
        bg: "bg-amber-50 dark:bg-amber-950/30",
      },
      {
        href: "/break-even-calculator",
        title: "Break-Even Calculator",
        name: "Break-Even Calculator",
        desc: "Calculate break-even point in units and revenue",
        description: "Calculate break-even point in units and revenue",
        icon: Scale,
        color: "from-rose-500 to-red-600",
        bg: "bg-rose-50 dark:bg-rose-950/30",
      },
      {
        href: "/commission-calculator",
        title: "Commission Calculator",
        name: "Commission Calculator",
        desc: "Calculate sales commission amounts",
        description: "Calculate sales commission amounts",
        icon: HandCoins,
        color: "from-cyan-500 to-blue-600",
        bg: "bg-cyan-50 dark:bg-cyan-950/30",
      },
      {
        href: "/discount-calculator",
        title: "Discount Calculator",
        name: "Discount Calculator",
        desc: "Calculate savings and final price after discount",
        description: "Calculate savings and final price after discount",
        icon: Tag,
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
    ],
  },
  {
    id: "utilities-tools",
    label: "Utilities & Tools",
    anchorId: "cat-utilities",
    icon: ShieldCheck,
    accent: "emerald",
    tools: [
      {
        href: "/hsn-finder",
        title: "HSN Code Finder",
        name: "HSN Code Finder",
        desc: "Search HSN/SAC codes for products and services",
        description: "Search HSN/SAC codes for products and services",
        icon: Hash,
        color: "from-orange-500 to-orange-600",
        bg: "bg-orange-50 dark:bg-orange-950/30",
      },
      {
        href: "/gstin-validator",
        title: "GSTIN Validator",
        name: "GSTIN Validator",
        desc: "Validate any GSTIN and identify state",
        description: "Validate any GSTIN and identify state",
        icon: ShieldCheck,
        color: "from-emerald-500 to-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// ToolCard Component — Premium Liquid Glass Card
// ---------------------------------------------------------------------------

function ToolCard({
  tool,
  accent,
}: {
  tool: ToolItem
  accent: "violet" | "blue" | "emerald"
}) {
  const Icon = tool.icon
  const badge = getToolBadge(tool)

  // Category-specific subtle accent styling for the icon badge
  const iconAccentClasses = {
    violet:
      "bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 dark:from-violet-500/20 dark:to-fuchsia-500/10 border-violet-500/15 dark:border-white/[0.08] text-violet-600 dark:text-violet-300 group-hover:text-violet-500 dark:group-hover:text-violet-200",
    blue:
      "bg-gradient-to-br from-blue-500/15 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/10 border-blue-500/15 dark:border-white/[0.08] text-blue-600 dark:text-blue-300 group-hover:text-blue-500 dark:group-hover:text-blue-200",
    emerald:
      "bg-gradient-to-br from-emerald-500/15 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/10 border-emerald-500/15 dark:border-white/[0.08] text-emerald-600 dark:text-emerald-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-200",
  }[accent]

  const hoverBorderClasses = {
    violet: "hover:border-violet-300/60 dark:hover:border-white/[0.14] hover:shadow-[0_12px_28px_-12px_rgba(124,58,237,0.3)]",
    blue: "hover:border-blue-300/60 dark:hover:border-white/[0.14] hover:shadow-[0_12px_28px_-12px_rgba(59,130,246,0.3)]",
    emerald: "hover:border-emerald-300/60 dark:hover:border-white/[0.14] hover:shadow-[0_12px_28px_-12px_rgba(16,185,129,0.3)]",
  }[accent]

  return (
    <Link
      href={tool.href}
      className={`
        group relative flex flex-col justify-between rounded-[18px] p-4 sm:p-[18px]
        border border-black/[0.07] bg-white/70
        dark:border-white/[0.07] dark:bg-white/[0.03]
        backdrop-blur-xl
        shadow-[0_1px_2px_0_rgba(23,22,43,0.04)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]
        transition-all duration-200 ease-out
        hover:-translate-y-[3px] hover:bg-white dark:hover:bg-white/[0.06]
        ${hoverBorderClasses}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B0618]
        active:scale-[0.98]
        h-full min-h-[112px] sm:min-h-[118px]
      `}
    >
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`
                flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]
                border transition-colors duration-200
                ${iconAccentClasses}
              `}
            >
              <Icon size={17} strokeWidth={1.85} />
            </span>
            <h3 className="text-[14.5px] font-semibold leading-tight text-zinc-900 dark:text-white/90 truncate">
              {tool.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            {badge && (
              <span
                className={`
                  inline-flex items-center px-1.5 py-0.5 rounded-[5px]
                  text-[9.5px] font-bold tracking-wide uppercase leading-none border select-none
                  ${BADGE_STYLES[badge]}
                `}
                aria-label={`${badge} tool`}
              >
                {badge}
              </span>
            )}
            <ArrowRight
              size={16}
              strokeWidth={2}
              className="shrink-0 text-zinc-400 dark:text-white/30 transition-all duration-200 group-hover:translate-x-1 group-hover:text-violet-500 dark:group-hover:text-violet-300"
              aria-hidden="true"
            />
          </div>
        </div>

        <p className="mt-2.5 pl-12 text-[13px] leading-snug text-zinc-500 dark:text-white/45 line-clamp-2">
          {tool.desc}
        </p>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// CategorySection Component
// ---------------------------------------------------------------------------

function CategorySection({
  category,
  isSearching,
}: {
  category: ToolCategory
  isSearching: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Thresholds: Desktop displays up to 12 tools cleanly in the 4-column grid, Mobile displays 6
  const INITIAL_COUNT_DESKTOP = 12
  const INITIAL_COUNT_MOBILE = 6

  // When searching, show all matched tools
  const visibleTools = isSearching || expanded
    ? category.tools
    : category.tools.slice(0, INITIAL_COUNT_DESKTOP)

  // Determine if overflow button is needed
  const hasDesktopOverflow = category.tools.length > INITIAL_COUNT_DESKTOP
  const hasMobileOverflow = category.tools.length > INITIAL_COUNT_MOBILE

  const Icon = category.icon

  const catIconClasses = {
    violet:
      "bg-violet-500/[0.08] border-violet-500/[0.15] text-violet-600 dark:bg-white/[0.06] dark:border-white/[0.08] dark:text-violet-300",
    blue:
      "bg-blue-500/[0.08] border-blue-500/[0.15] text-blue-600 dark:bg-white/[0.06] dark:border-white/[0.08] dark:text-blue-300",
    emerald:
      "bg-emerald-500/[0.08] border-emerald-500/[0.15] text-emerald-600 dark:bg-white/[0.06] dark:border-white/[0.08] dark:text-emerald-300",
  }[category.accent]

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const }

  return (
    <section id={category.anchorId} className="mb-10 sm:mb-12 scroll-mt-24">
      {/* Category Header with Heading 2 and Accordion Toggle */}
      <h2>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls={`category-content-${category.id}`}
          className="
            group flex w-full items-center justify-between gap-3 rounded-2xl
            px-2 py-2.5 text-left
            transition-colors duration-150
            hover:bg-black/[0.02] dark:hover:bg-white/[0.02]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60
          "
        >
          <span className="flex items-center gap-3 min-w-0">
            <span
              className={`
                flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border
                ${catIconClasses}
              `}
            >
              <Icon size={16} strokeWidth={1.85} />
            </span>
            <span className="text-[17px] sm:text-[18px] font-semibold text-zinc-900 dark:text-white tracking-tight truncate">
              {category.label}
            </span>
          </span>

          <span className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-black/[0.04] dark:bg-white/[0.06] text-zinc-500 dark:text-white/45 border border-black/[0.04] dark:border-white/[0.06]">
              {category.tools.length} {category.tools.length === 1 ? "tool" : "tools"}
            </span>
            <ChevronDown
              size={18}
              className={`text-zinc-400 dark:text-white/40 transition-transform duration-200 ${
                collapsed ? "rotate-0" : "rotate-180"
              }`}
              aria-hidden="true"
            />
          </span>
        </button>
      </h2>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            id={`category-content-${category.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {/* Responsive Grid: 1 col (<560px), 2 cols (560-767px), 3 cols (768-1199px), 4 cols (>=1200px) */}
              <div
                className="
                  grid grid-cols-1
                  min-[560px]:grid-cols-2
                  md:grid-cols-3
                  min-[1200px]:grid-cols-4
                  gap-3 sm:gap-3.5
                "
              >
                {visibleTools.map((tool, i) => (
                  <div
                    key={tool.href}
                    className={
                      // Hide overflow items on mobile screen (<560px) in initial view, show on desktop or when expanded/searching
                      !expanded && !isSearching && i >= INITIAL_COUNT_MOBILE
                        ? "hidden min-[560px]:block"
                        : "block"
                    }
                  >
                    <ToolCard tool={tool} accent={category.accent} />
                  </div>
                ))}
              </div>

              {/* Show All / Show Less Button */}
              {!isSearching && (hasDesktopOverflow || hasMobileOverflow) && (
                <div
                  className={`mt-5 flex justify-center ${
                    !hasDesktopOverflow && hasMobileOverflow ? "min-[560px]:hidden" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => !e)}
                    className="
                      inline-flex items-center gap-1.5 rounded-full px-4 py-2
                      text-[13px] font-medium text-violet-600 dark:text-violet-300
                      border border-violet-500/[0.15] bg-white/70
                      dark:border-white/[0.08] dark:bg-white/[0.03]
                      backdrop-blur-md
                      transition-all duration-200
                      hover:bg-white hover:text-violet-700 hover:border-violet-500/[0.3]
                      dark:hover:bg-white/[0.07] dark:hover:text-violet-200 dark:hover:border-white/[0.15]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60
                      active:scale-[0.98]
                    "
                  >
                    {expanded ? "Show less" : "Show all tools"}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        expanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export function ToolsSection() {
  return (
    <section
      id="tools"
      className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-20 sm:pb-28"
    >
      {toolCategories.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          isSearching={false}
        />
      ))}
    </section>
  )
}

export default ToolsSection
