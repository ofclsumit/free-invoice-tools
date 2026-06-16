import Link from "next/link"
import { Zap } from "lucide-react"

const footerLinks = {
  Product: [
    { label: "GST Invoice Generator", href: "/tools/invoice-generator" },
    { label: "Quotation Generator", href: "/tools/quotation-generator" },
    { label: "GST Calculator", href: "/tools/gst-calculator" },
    { label: "HSN Code Finder", href: "/tools/hsn-finder" },
    { label: "Receipt Generator", href: "/tools/receipt-generator" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Changelog", href: "/changelog" },
    { label: "Careers", href: "/careers" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Refund Policy", href: "/refunds" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Status", href: "/status" },
    { label: "API Docs", href: "/api-docs" },
  ],
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
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
              India&apos;s fastest GST invoice and quotation generator. Built with ❤️ for Indian businesses.
            </p>
            <p className="text-xs text-muted-foreground">
              Made in India 🇮🇳
            </p>
          </div>

          {/* Links */}
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
            © {new Date().getFullYear()} QuoteFlow. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            GST compliant invoice software for India
          </p>
        </div>
      </div>
    </footer>
  )
}
