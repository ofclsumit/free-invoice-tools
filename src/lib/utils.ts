import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string, format = "short"): string {
  if (!dateStr) return ""
  try {
    const date = new Date(dateStr)
    if (format === "short") {
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    }
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  } catch {
    return dateStr
  }
}

export function calculateGST(amount: number, gstRate: number, type: "CGST_SGST" | "IGST" | "EXEMPT") {
  if (type === "EXEMPT") return { cgst: 0, sgst: 0, igst: 0, total: 0 }
  if (type === "IGST") {
    const igst = (amount * gstRate) / 100
    return { cgst: 0, sgst: 0, igst, total: igst }
  }
  const cgst = (amount * gstRate) / 200
  const sgst = cgst
  return { cgst, sgst, igst: 0, total: cgst + sgst }
}

export function generateInvoiceNumber(prefix = "INV", counter = 1): string {
  const year = new Date().getFullYear()
  return `${prefix}-${year}-${String(counter).padStart(4, "0")}`
}

export function validateGSTIN(gstin: string): boolean {
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return regex.test(gstin.toUpperCase())
}

export function getGSTINState(gstin: string): string {
  const stateCodes: Record<string, string> = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
    "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
    "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
    "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
    "16": "Tripura", "17": "Meghalaya", "18": "Assam",
    "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
    "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
    "26": "Dadra & Nagar Haveli and Daman & Diu", "27": "Maharashtra",
    "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
    "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
    "34": "Puducherry", "35": "Andaman & Nicobar Islands",
    "36": "Telangana", "37": "Andhra Pradesh (New)",
  }
  const code = gstin.substring(0, 2)
  return stateCodes[code] || "Unknown State"
}

export function slugify(str: string): string {
  return str.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
}

export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return function (...args: Parameters<T>) {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}

export function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() || "").join("")
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700", sent: "bg-blue-50 text-blue-700",
    viewed: "bg-purple-50 text-purple-700", paid: "bg-green-50 text-green-700",
    overdue: "bg-red-50 text-red-700", cancelled: "bg-gray-50 text-gray-400",
    accepted: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-700",
    expired: "bg-orange-50 text-orange-700", converted: "bg-teal-50 text-teal-700",
  }
  return colors[status.toLowerCase()] || "bg-gray-100 text-gray-700"
}
