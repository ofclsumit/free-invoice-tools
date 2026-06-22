import Link from "next/link"
import { Zap } from "lucide-react"

const footerLinks = {
  "Document Generators": [
    { label: "Invoice Generator", href: "/invoice-generator" },
    { label: "Quotation Generator", href: "/quotation-generator" },
    { label: "Proforma Invoice", href: "/proforma-invoice" },
    { label: "Purchase Order", href: "/purchase-order" },
    { label: "Delivery Challan", href: "/delivery-challan" },
    { label: "Rent Receipt", href: "/rent-receipt" },
    { label: "Salary Slip", href: "/salary-slip" },
    { label: "Receipt Generator", href: "/receipt-generator" },
    { label: "Cash Receipt", href: "/cash-receipt" },
    { label: "Payment Receipt", href: "/payment-receipt" },
    { label: "Estimate Generator", href: "/estimate-generator" },
    { label: "Credit Note", href: "/credit-note" },
    { label: "Debit Note", href: "/debit-note" },
    { label: "Business Letter", href: "/business-letter" },
  ],
  Calculators: [
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
    <footer className="border-t border-border bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                QuoteFlow
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              India&apos;s most comprehensive free business document platform. Create invoices, quotations, receipts and more.
            </p>
            <p className="text-xs text-muted-foreground">
              Made in India 🇮🇳 · 100% Free · No Signup
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="font-display font-semibold text-sm mb-4">{category}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
            &copy; {new Date().getFullYear()} QuoteFlow. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            27+ free business tools for India
          </p>
        </div>
      </div>
    </footer>
  )
}
