import Script from "next/script"
import Link from "next/link"
import { FileText, ClipboardList, ArrowRight } from "lucide-react"
import { SiteLogo } from "@/components/shared/site-logo"

export const metadata = {
  title: "Quotation vs Invoice | Guide | Turnivo",
  description:
    "Understand the key differences between a quotation and an invoice. Learn when to use each document for your Indian business.",
  alternates: {
    canonical: "https://Turnivo.in/guides/quotation-vs-invoice",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      "name": "Can a quotation be used as an invoice?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, a quotation is not a valid invoice. A quotation is an estimate provided before the sale, while an invoice is a formal request for payment after the goods or services have been delivered.",
      },
    },
    {
      "@type": "Question",
      "name": "Do I need both a quotation and an invoice?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For most business transactions, it is good practice to issue both: a quotation to set expectations and agree on price, and an invoice to request payment after delivery.",
      },
    },
    {
      "@type": "Question",
      "name": "Is a quotation legally binding?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A quotation is generally not legally binding until the buyer accepts it. Once accepted, it can form a binding contract. An invoice, on the other hand, represents an amount due and is legally enforceable.",
      },
    },
  ],
}

export default function QuotationVsInvoicePage() {
  return (
    <>
      <Script id="json-ld-1" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="min-h-screen bg-mesh py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <SiteLogo className="mb-8" />

          <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">Guide</p>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-4">
            Quotation vs Invoice: Key Differences Explained
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Many business owners use &ldquo;quotation&rdquo; and &ldquo;invoice&rdquo; interchangeably, but they serve
            very different purposes. This guide explains the difference and when to use each.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <div className="glass-card p-6">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-display font-semibold mb-2">Quotation</h2>
              <p className="text-sm text-muted-foreground">
                A quotation (or quote) is a document provided to a potential buyer before a sale. It outlines the
                proposed price, scope of work, and terms. Its purpose is to help the buyer decide whether to proceed.
              </p>
              <ul className="mt-3 text-sm text-muted-foreground space-y-1 list-disc pl-4">
                <li>Sent before the transaction</li>
                <li>Not a demand for payment</li>
                <li>Often has an expiry date</li>
                <li>Can be negotiated</li>
              </ul>
            </div>
            <div className="glass-card p-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-lg font-display font-semibold mb-2">Invoice</h2>
              <p className="text-sm text-muted-foreground">
                An invoice is a formal request for payment issued after goods or services have been delivered. It
                lists what was provided, the amount due, and payment instructions.
              </p>
              <ul className="mt-3 text-sm text-muted-foreground space-y-1 list-disc pl-4">
                <li>Sent after delivery</li>
                <li>Demands payment</li>
                <li>Has a due date</li>
                <li>Legally enforceable</li>
              </ul>
            </div>
          </div>

          <div className="glass-card p-8 mb-10 overflow-x-auto">
            <h2 className="text-xl font-display font-semibold mb-4">Side-by-Side Comparison</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 font-semibold">Aspect</th>
                  <th className="text-left py-3 pr-4 font-semibold text-blue-600 dark:text-blue-400">Quotation</th>
                  <th className="text-left py-3 font-semibold text-emerald-600 dark:text-emerald-400">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Timing", "Before sale", "After delivery"],
                  ["Purpose", "Propose price & scope", "Request payment"],
                  ["Legal status", "Offer (not binding until accepted)", "Legally enforceable demand"],
                  ["Payment", "No payment requested", "Payment due by a date"],
                  ["Negotiation", "Can be revised", "Fixed (unless credit note issued)"],
                  ["GST requirement", "Quote can be without GSTIN", "GSTIN mandatory for GST invoices"],
                  ["Accounting", "Not recorded as income", "Recorded as accounts receivable"],
                  ["Expiry", "Often has validity period", "No expiry (payment overdue possible)"],
                ].map(([aspect, quote, invoice]) => (
                  <tr key={aspect}>
                    <td className="py-3 pr-4 font-medium">{aspect}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{quote}</td>
                    <td className="py-3 text-muted-foreground">{invoice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-card p-8 mb-10">
            <h2 className="text-xl font-display font-semibold mb-4">When to Use a Quotation</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> A client asks for a price estimate before committing to a project.</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> You want to formalize the scope and cost before starting work.</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> You&apos;re bidding for a contract against other vendors.</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> The project involves custom work where pricing may vary.</li>
            </ul>
          </div>

          <div className="glass-card p-8 mb-10">
            <h2 className="text-xl font-display font-semibold mb-4">When to Use an Invoice</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> You have delivered the product or completed the service.</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> You need to formally request payment from a client.</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> You need a document for GST compliance and tax filing.</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> You want to track accounts receivable and overdue payments.</li>
            </ul>
          </div>

          <div className="glass-card p-8 mb-10">
            <h2 className="text-xl font-display font-semibold mb-2">Pro Tip: Convert Quotations to Invoices</h2>
            <p className="text-sm text-muted-foreground mb-4">
              With Turnivo, you can create a quotation first, and when the client accepts, convert it to an invoice
              with one click — all line items, pricing, and terms carry over automatically.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/quotation-generator"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <ClipboardList className="h-4 w-4" /> Create Quotation
              </Link>
              <Link
                href="/tools/invoice-generator"
                className="inline-flex items-center gap-2 border border-input bg-background px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent transition-colors"
              >
                <FileText className="h-4 w-4" /> Create Invoice
              </Link>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-display font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {[
                { q: "Can a quotation be used as an invoice?", a: "No, a quotation is not a valid invoice. A quotation is an estimate provided before the sale, while an invoice is a formal request for payment after the goods or services have been delivered." },
                { q: "Do I need both a quotation and an invoice?", a: "For most business transactions, it is good practice to issue both: a quotation to set expectations and agree on price, and an invoice to request payment after delivery." },
                { q: "Is a quotation legally binding?", a: "A quotation is generally not legally binding until the buyer accepts it. Once accepted, it can form a binding contract. An invoice, on the other hand, represents an amount due and is legally enforceable." },
              ].map((faq, i) => (
                <details key={i} className="glass-card p-5 group open:shadow-sm">
                  <summary className="font-display font-semibold text-sm cursor-pointer list-none flex items-center justify-between gap-4">
                    {faq.q}
                    <span className="text-muted-foreground shrink-0 transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
