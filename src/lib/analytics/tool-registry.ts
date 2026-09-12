/**
 * TURNIVO — CENTRAL TOOL REGISTRY
 * Authoritative registry of all 28 tools across Document Generators,
 * Financial Calculators, and Utilities & Tools.
 */

export interface ToolDefinition {
  id: string
  name: string
  category: "Document Generators" | "Financial Calculators" | "Utilities & Tools"
  slug: string
  url: string
  exportFormat: string
  aliases?: string[]
}

export const TOOL_CATEGORIES = [
  "Document Generators",
  "Financial Calculators",
  "Utilities & Tools",
] as const

export type ToolCategoryName = (typeof TOOL_CATEGORIES)[number]

export const TOOLS_REGISTRY: ToolDefinition[] = [
  // ==========================================
  // 1. Document Generators (13 tools)
  // ==========================================
  {
    id: "invoice-generator",
    name: "Invoice Generator",
    category: "Document Generators",
    slug: "invoice-generator",
    url: "/invoice-generator",
    exportFormat: "PDF & Print",
    aliases: ["invoice", "template"],
  },
  {
    id: "quotation-generator",
    name: "Quotation Generator",
    category: "Document Generators",
    slug: "quotation-generator",
    url: "/quotation-generator",
    exportFormat: "PDF & Print",
    aliases: ["quotation"],
  },
  {
    id: "resume-generator",
    name: "Resume Generator",
    category: "Document Generators",
    slug: "resume-generator",
    url: "/resume-generator",
    exportFormat: "PDF & Print",
    aliases: ["resume"],
  },
  {
    id: "proforma-invoice",
    name: "Proforma Invoice",
    category: "Document Generators",
    slug: "proforma-invoice",
    url: "/proforma-invoice",
    exportFormat: "PDF & Print",
    aliases: ["proforma"],
  },
  {
    id: "purchase-order",
    name: "Purchase Order",
    category: "Document Generators",
    slug: "purchase-order",
    url: "/purchase-order",
    exportFormat: "PDF & Print",
    aliases: ["po"],
  },
  {
    id: "delivery-challan",
    name: "Delivery Challan",
    category: "Document Generators",
    slug: "delivery-challan",
    url: "/delivery-challan",
    exportFormat: "PDF & Print",
    aliases: ["challan"],
  },
  {
    id: "payment-receipt",
    name: "Payment Receipt",
    category: "Document Generators",
    slug: "payment-receipt",
    url: "/payment-receipt",
    exportFormat: "PDF & Print",
    aliases: ["receipt"],
  },
  {
    id: "rent-receipt",
    name: "Rent Receipt",
    category: "Document Generators",
    slug: "rent-receipt",
    url: "/rent-receipt",
    exportFormat: "PDF & Print",
    aliases: ["rent-receipt-generator"],
  },
  {
    id: "salary-slip",
    name: "Salary Slip",
    category: "Document Generators",
    slug: "salary-slip",
    url: "/salary-slip",
    exportFormat: "PDF & Print",
    aliases: ["salary-slip-generator", "payslip"],
  },
  {
    id: "estimate-generator",
    name: "Estimate Generator",
    category: "Document Generators",
    slug: "estimate-generator",
    url: "/estimate-generator",
    exportFormat: "PDF & Print",
    aliases: ["estimate"],
  },
  {
    id: "credit-note",
    name: "Credit Note",
    category: "Document Generators",
    slug: "credit-note",
    url: "/credit-note",
    exportFormat: "PDF & Print",
    aliases: ["cn"],
  },
  {
    id: "debit-note",
    name: "Debit Note",
    category: "Document Generators",
    slug: "debit-note",
    url: "/debit-note",
    exportFormat: "PDF & Print",
    aliases: ["dn"],
  },
  {
    id: "business-letter",
    name: "Business Letter",
    category: "Document Generators",
    slug: "business-letter",
    url: "/business-letter",
    exportFormat: "PDF & Print",
    aliases: ["letter"],
  },

  // ==========================================
  // 2. Financial Calculators (13 tools)
  // ==========================================
  {
    id: "profit-leak-detector",
    name: "Profit Leak Detector",
    category: "Financial Calculators",
    slug: "profit-leak-detector",
    url: "/profit-leak-detector",
    exportFormat: "PDF Audit Report",
    aliases: ["pld", "profit-leak"],
  },
  {
    id: "subscription-leak-detector",
    name: "Subscription Leak Detector",
    category: "Financial Calculators",
    slug: "subscription-leak-detector",
    url: "/subscription-leak-detector",
    exportFormat: "PDF Audit Report",
    aliases: ["sld", "subscription-leak"],
  },
  {
    id: "gst-calculator",
    name: "GST Calculator",
    category: "Financial Calculators",
    slug: "gst-calculator",
    url: "/gst-calculator",
    exportFormat: "PDF Calculation Report",
    aliases: ["gst"],
  },
  {
    id: "reverse-gst-calculator",
    name: "Reverse GST Calculator",
    category: "Financial Calculators",
    slug: "reverse-gst-calculator",
    url: "/reverse-gst-calculator",
    exportFormat: "PDF Calculation Report",
    aliases: ["reverse-gst"],
  },
  {
    id: "gst-split-calculator",
    name: "GST Split Calculator",
    category: "Financial Calculators",
    slug: "gst-split-calculator",
    url: "/gst-split-calculator",
    exportFormat: "PDF Calculation Report",
    aliases: ["gst-split"],
  },
  {
    id: "gst-rate-finder",
    name: "GST Rate Finder",
    category: "Financial Calculators",
    slug: "gst-rate-finder",
    url: "/gst-rate-finder",
    exportFormat: "PDF Rate Table Export",
    aliases: ["gst-rates"],
  },
  {
    id: "emi-calculator",
    name: "EMI Calculator",
    category: "Financial Calculators",
    slug: "emi-calculator",
    url: "/emi-calculator",
    exportFormat: "PDF Repayment Schedule",
    aliases: ["emi"],
  },
  {
    id: "loan-calculator",
    name: "Loan Calculator",
    category: "Financial Calculators",
    slug: "loan-calculator",
    url: "/loan-calculator",
    exportFormat: "PDF Loan Schedule Report",
    aliases: ["loan"],
  },
  {
    id: "interest-calculator",
    name: "Interest Calculator",
    category: "Financial Calculators",
    slug: "interest-calculator",
    url: "/interest-calculator",
    exportFormat: "PDF Interest Report",
    aliases: ["interest"],
  },
  {
    id: "profit-margin",
    name: "Profit Margin Calculator",
    category: "Financial Calculators",
    slug: "profit-margin",
    url: "/profit-margin",
    exportFormat: "PDF Margin Breakdown",
    aliases: ["profit-margin-calculator"],
  },
  {
    id: "break-even-calculator",
    name: "Break-Even Calculator",
    category: "Financial Calculators",
    slug: "break-even-calculator",
    url: "/break-even-calculator",
    exportFormat: "PDF Analysis Report",
    aliases: ["break-even"],
  },
  {
    id: "commission-calculator",
    name: "Commission Calculator",
    category: "Financial Calculators",
    slug: "commission-calculator",
    url: "/commission-calculator",
    exportFormat: "PDF Calculation Report",
    aliases: ["commission"],
  },
  {
    id: "discount-calculator",
    name: "Discount Calculator",
    category: "Financial Calculators",
    slug: "discount-calculator",
    url: "/discount-calculator",
    exportFormat: "PDF Calculation Report",
    aliases: ["discount"],
  },

  // ==========================================
  // 3. Utilities & Tools (2 tools)
  // ==========================================
  {
    id: "hsn-finder",
    name: "HSN Code Finder",
    category: "Utilities & Tools",
    slug: "hsn-finder",
    url: "/hsn-finder",
    exportFormat: "PDF HSN List Export",
    aliases: ["hsn-code-finder", "hsn"],
  },
  {
    id: "gstin-validator",
    name: "GSTIN Validator",
    category: "Utilities & Tools",
    slug: "gstin-validator",
    url: "/gstin-validator",
    exportFormat: "PDF Verification Report",
    aliases: ["gst-validator", "gstin"],
  },
]

// Create fast lookup map for IDs and aliases
const lookupMap = new Map<string, ToolDefinition>()

for (const tool of TOOLS_REGISTRY) {
  lookupMap.set(tool.id.toLowerCase(), tool)
  lookupMap.set(tool.slug.toLowerCase(), tool)
  if (tool.aliases) {
    for (const alias of tool.aliases) {
      lookupMap.set(alias.toLowerCase(), tool)
    }
  }
}

/**
 * Resolves any tool ID, slug, or alias to the canonical ToolDefinition.
 */
export function getToolById(idOrSlug: string): ToolDefinition | undefined {
  if (!idOrSlug) return undefined
  const cleaned = idOrSlug.trim().toLowerCase().replace(/^\//, "")
  return lookupMap.get(cleaned)
}

/**
 * Checks if a given tool ID or alias exists in Turnivo.
 */
export function isValidToolId(idOrSlug: string): boolean {
  return Boolean(getToolById(idOrSlug))
}

/**
 * Returns all canonical tools.
 */
export function getAllTools(): ToolDefinition[] {
  return TOOLS_REGISTRY
}

/**
 * Returns tools grouped by category.
 */
export function getToolsByCategory(category: ToolCategoryName): ToolDefinition[] {
  return TOOLS_REGISTRY.filter((t) => t.category === category)
}
