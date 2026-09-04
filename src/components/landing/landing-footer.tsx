import Link from "next/link"
import { Zap } from "lucide-react"
import { SiteLogo } from "@/components/shared/site-logo"

const footerLinks = {
  "Document Generators": [
    { label: "Invoice Generator", href: "/invoice-generator" },
    { label: "Quotation Generator", href: "/quotation-generator" },
    { label: "Resume Generator", href: "/resume-generator" },
    { label: "Proforma Invoice", href: "/proforma-invoice" },
    { label: "Purchase Order", href: "/purchase-order" },
    { label: "Delivery Challan", href: "/delivery-challan" },
    { label: "Rent Receipt", href: "/rent-receipt" },
    { label: "Salary Slip", href: "/salary-slip" },
    { label: "Payment Receipt", href: "/payment-receipt" },
    { label: "Estimate Generator", href: "/estimate-generator" },
    { label: "Credit Note", href: "/credit-note" },
    { label: "Debit Note", href: "/debit-note" },
    { label: "Business Letter", href: "/business-letter" },
  ],
  Calculators: [
    { label: "Profit Leak Detector", href: "/profit-leak-detector" },
    { label: "Subscription Leak Detector", href: "/subscription-leak-detector" },
    { label: "GST Calculator", href: "/gst-calculator" },
    { label: "Reverse GST Calculator", href: "/reverse-gst-calculator" },
    { label: "GST Split Calculator", href: "/gst-split-calculator" },
    { label: "GST Rate Finder", href: "/gst-rate-finder" },
    { label: "EMI Calculator", href: "/emi-calculator" },
    { label: "Loan Calculator", href: "/loan-calculator" },
    { label: "Interest Calculator", href: "/interest-calculator" },
    { label: "Profit Margin Calculator", href: "/profit-margin" },
    { label: "Break-Even Calculator", href: "/break-even-calculator" },
    { label: "Commission Calculator", href: "/commission-calculator" },
    { label: "Discount Calculator", href: "/discount-calculator" },
  ],
  Resources: [
    { label: "HSN Code Finder", href: "/hsn-finder" },
    { label: "GSTIN Validator", href: "/gstin-validator" },
    { label: "How to Create Invoice", href: "/guides/how-to-create-invoice" },
    { label: "GST Invoice Format", href: "/guides/gst-invoice-format" },
    { label: "Quotation vs Invoice", href: "/guides/quotation-vs-invoice" },
    { label: "Rent Receipt Guide", href: "/rent-receipt-generator" },
    { label: "Salary Slip Guide", href: "/salary-slip-generator" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-6 gap-8 sm:gap-10">
          <div className="col-span-2 md:col-span-2 space-y-4 pr-0 sm:pr-4">
            <SiteLogo size="sm" />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              India&apos;s most comprehensive free business document platform. Create invoices, quotations, receipts, and run financial calculations in seconds.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-black/[0.03] dark:bg-white/[0.05] text-muted-foreground border border-border">
              <span>Made in India 🇮🇳</span>
              <span>·</span>
              <span>100% Free</span>
              <span>·</span>
              <span>No Signup</span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1 md:col-span-1">
              <p className="font-display font-semibold text-xs sm:text-sm text-foreground mb-3.5 tracking-tight">{category}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors block truncate"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Turnivo. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            25+ free business document tools &amp; calculators for India
          </p>
        </div>
      </div>
    </footer>
  )
}
