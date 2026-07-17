import Link from "next/link"
import { Zap, Twitter, Github, Linkedin, Youtube, MessageCircle } from "lucide-react"

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Invoice Generator", href: "/invoice-generator" },
      { label: "Quotation Generator", href: "/quotation-generator" },
      { label: "GST Calculator", href: "/gst-calculator" },
      { label: "Purchase Order", href: "/purchase-order" },
      { label: "All Tools", href: "/#tools" },
    ],
  },
  {
    title: "Templates",
    links: [
      { label: "Modern", href: "/invoice-generator" },
      { label: "Corporate", href: "/invoice-generator" },
      { label: "Minimal", href: "/invoice-generator" },
      { label: "Creative", href: "/invoice-generator" },
      { label: "GST India", href: "/invoice-generator" },
    ],
  },
  {
    title: "Business Documents",
    links: [
      { label: "Proforma Invoice", href: "/proforma-invoice" },
      { label: "Delivery Challan", href: "/delivery-challan" },
      { label: "Payment Receipt", href: "/payment-receipt" },
      { label: "Salary Slip", href: "/salary-slip" },
      { label: "Credit Note", href: "/credit-note" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "How to Create Invoice", href: "/guides/how-to-create-invoice" },
      { label: "GST Invoice Format", href: "/guides/gst-invoice-format" },
      { label: "Quotation vs Invoice", href: "/guides/quotation-vs-invoice" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
]

const socials = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: MessageCircle, href: "https://wa.me", label: "WhatsApp" },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-white dark:bg-[#05010C]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-glow-sm">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                QuoteFlow
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              India&apos;s most comprehensive free business document platform. Create invoices, quotations, receipts and more in seconds.
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-500"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 font-display text-sm font-semibold tracking-tight text-foreground">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-violet-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} QuoteFlow. All rights reserved.
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            Made in India 🇮🇳 · 100% Free · No Signup
          </p>
        </div>
      </div>
    </footer>
  )
}
