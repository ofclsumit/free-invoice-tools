import Script from "next/script"
import Link from "next/link"
import { FileText, CheckCircle } from "lucide-react"
import { SiteLogo } from "@/components/shared/site-logo"

export const metadata = {
  title: "GST Invoice Format | Guide | QuoteFlow",
  description:
    "Complete guide to GST invoice format in India. Learn about mandatory fields, CGST/SGST/IGST, HSN codes, and download a free GST invoice template.",
  alternates: {
    canonical: "https://quoteflow.in/guides/gst-invoice-format",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      "name": "What is the difference between CGST, SGST, and IGST?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CGST (Central GST) and SGST (State GST) are charged on intra-state sales — half the GST rate goes to the central government and half to the state government. IGST (Integrated GST) is charged on inter-state sales and is collected by the central government.",
      },
    },
    {
      "@type": "Question",
      "name": "Is GST invoice mandatory for all businesses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GST invoice is mandatory for businesses registered under GST. Businesses with turnover below the threshold can issue a regular bill, but if they are voluntarily registered, GST invoice rules apply.",
      },
    },
    {
      "@type": "Question",
      "name": "What are HSN and SAC codes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HSN (Harmonized System of Nomenclature) codes classify goods for GST purposes. SAC (Services Accounting Code) codes classify services. Including them on invoices helps in tax filing and compliance.",
      },
    },
  ],
}

export default function GSTInvoiceFormatPage() {
  return (
    <>
      <Script id="json-ld-1" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="min-h-screen bg-mesh py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <SiteLogo className="mb-8" />

          <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">Guide</p>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-4">
            GST Invoice Format: Complete Guide for Indian Businesses
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            A GST-compliant invoice must include specific fields as mandated by the GST Act. This guide explains
            every requirement, the difference between CGST/SGST/IGST, and how to format your invoices correctly.
          </p>

          <div className="glass-card p-8 mb-10">
            <h2 className="text-xl font-display font-semibold mb-4">What Is a GST Invoice?</h2>
            <p className="text-muted-foreground leading-relaxed">
              A GST invoice is a document issued by a GST-registered supplier for every taxable supply of goods or
              services. It serves as proof of supply and enables the buyer to claim Input Tax Credit (ITC). The format
              is prescribed under Rule 46 of the CGST Rules, 2017.
            </p>
          </div>

          <div className="glass-card p-8 mb-10">
            <h2 className="text-xl font-display font-semibold mb-4">Mandatory Fields in a GST Invoice</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Invoice number (unique, sequential)",
                "Invoice date",
                "Seller's name, address, and GSTIN",
                "Buyer's name, address, and GSTIN (if registered)",
                "Place of supply",
                "HSN code for goods / SAC code for services",
                "Description of goods or services",
                "Quantity and unit",
                "Taxable value per item",
                "Rate of GST (CGST + SGST or IGST)",
                "Amount of GST charged",
                "Total invoice value",
                "Signature of supplier",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 mb-10">
            <h2 className="text-xl font-display font-semibold mb-4">CGST, SGST, and IGST Explained</h2>
            <div className="space-y-4">
              <div className="border border-border rounded-xl p-4">
                <h3 className="font-display font-semibold text-sm mb-1">Intra-State Sales (Same State)</h3>
                <p className="text-sm text-muted-foreground">
                  When the seller and buyer are in the same state, GST is split equally as CGST (Central GST) and SGST
                  (State GST). For example, on a ₹10,000 sale at 18% GST, you charge ₹9,000 CGST and ₹9,000 SGST.
                </p>
              </div>
              <div className="border border-border rounded-xl p-4">
                <h3 className="font-display font-semibold text-sm mb-1">Inter-State Sales (Different States)</h3>
                <p className="text-sm text-muted-foreground">
                  When the seller and buyer are in different states, IGST (Integrated GST) is charged at the full rate.
                  The central government collects IGST and later distributes the state portion to the destination state.
                </p>
              </div>
              <div className="border border-border rounded-xl p-4">
                <h3 className="font-display font-semibold text-sm mb-1">GST Rate Breakdown</h3>
                <p className="text-sm text-muted-foreground">
                  GST rates are 0%, 5%, 12%, 18%, and 28%. For intra-state sales, each rate is split: 2.5% CGST + 2.5%
                  SGST (for 5%), 6% + 6% (for 12%), 9% + 9% (for 18%), and 14% + 14% (for 28%).
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 mb-10">
            <h2 className="text-xl font-display font-semibold mb-4">Sample GST Invoice Format</h2>
            <div className="bg-muted rounded-xl p-6 text-sm font-mono leading-relaxed">
              <p className="font-semibold mb-2">TAX INVOICE</p>
              <p>ABC Traders</p>
              <p>GSTIN: 27ABCDE1234F1Z5</p>
              <p>Mumbai, Maharashtra</p>
              <p className="my-2 border-t border-border pt-2" />
              <p>Invoice No: INV-2025-0001</p>
              <p>Date: 15 Jan 2025</p>
              <p className="my-2 border-t border-border pt-2" />
              <p>Buyer: XYZ Retail</p>
              <p>GSTIN: 29XYZAB5678G1Z6</p>
              <p>Hyderabad, Telangana</p>
              <p className="my-2 border-t border-border pt-2" />
              <p>Place of Supply: Telangana (36)</p>
              <p className="my-2 border-t border-border pt-2" />
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1 pr-2">#</th>
                    <th className="text-left py-1 pr-2">HSN</th>
                    <th className="text-left py-1 pr-2">Description</th>
                    <th className="text-right py-1 pr-2">Qty</th>
                    <th className="text-right py-1 pr-2">Rate</th>
                    <th className="text-right py-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 pr-2">1</td>
                    <td className="py-1 pr-2">6204</td>
                    <td className="py-1 pr-2">Cotton Shirts</td>
                    <td className="text-right py-1 pr-2">50</td>
                    <td className="text-right py-1 pr-2">₹500</td>
                    <td className="text-right py-1">₹25,000</td>
                  </tr>
                </tbody>
              </table>
              <p className="my-2 border-t border-border pt-2" />
              <p>Taxable Value: ₹25,000</p>
              <p>CGST @ 9%: ₹2,250</p>
              <p>SGST @ 9%: ₹2,250</p>
              <p className="font-bold">Total: ₹29,500</p>
            </div>
          </div>

          <div className="glass-card p-8 mb-10 text-center">
            <h2 className="text-xl font-display font-semibold mb-2">Generate GST-Compliant Invoices Free</h2>
            <p className="text-muted-foreground mb-4">
              Use QuoteFlow to create professional GST invoices instantly. Auto-calculates CGST/SGST/IGST.
            </p>
            <Link
              href="/tools/invoice-generator"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <FileText className="h-4 w-4" /> Create GST Invoice
            </Link>
          </div>

          <section>
            <h2 className="text-2xl font-display font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {[
                { q: "What is the difference between CGST, SGST, and IGST?", a: "CGST (Central GST) and SGST (State GST) are charged on intra-state sales — half the GST rate goes to the central government and half to the state government. IGST (Integrated GST) is charged on inter-state sales and is collected by the central government." },
                { q: "Is GST invoice mandatory for all businesses?", a: "GST invoice is mandatory for businesses registered under GST. Businesses with turnover below the threshold can issue a regular bill, but if they are voluntarily registered, GST invoice rules apply." },
                { q: "What are HSN and SAC codes?", a: "HSN (Harmonized System of Nomenclature) codes classify goods for GST purposes. SAC (Services Accounting Code) codes classify services. Including them on invoices helps in tax filing and compliance." },
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
