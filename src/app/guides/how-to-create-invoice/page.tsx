import Script from "next/script"
import Link from "next/link"
import { FileText, CheckCircle, AlertCircle } from "lucide-react"
import { SiteLogo } from "@/components/shared/site-logo"

export const metadata = {
  title: "How to Create an Invoice | Guide | QuoteFlow",
  description:
    "Learn how to create a professional invoice step by step. Includes GST invoice requirements, key elements, and tips for Indian freelancers and businesses.",
  alternates: {
    canonical: "https://quoteflow.in/guides/how-to-create-invoice",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the difference between an invoice and a bill?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An invoice is a request for payment sent by a seller to a buyer, while a bill is the document a buyer receives as a record of what they owe. In practice they refer to the same document.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to include GST on my invoice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If your business is registered under GST and your annual turnover exceeds the threshold (₹40 lakh for goods, ₹20 lakh for services), you must charge GST and issue a GST-compliant invoice.",
      },
    },
    {
      "@type": "Question",
      name: "Can I create an invoice without a GST number?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. If you are not GST-registered, you can still issue a regular invoice. However, you cannot charge GST or claim input tax credit.",
      },
    },
    {
      "@type": "Question",
      name: "What software can I use to create invoices for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "QuoteFlow is a free online invoice generator that works in your browser. No signup needed, no data stored on servers, and instant PDF download.",
      },
    },
    {
      "@type": "Question",
      name: "Is an invoice a legal document?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, an invoice is a legally recognized document that serves as evidence of a transaction between a seller and a buyer. It is used for accounting, tax filing, and dispute resolution.",
      },
    },
  ],
}

const steps = [
  { title: "Add your business details", desc: "Start with your company name, address, GSTIN (if registered), and logo. This establishes credibility and helps the buyer identify the seller." },
  { title: "Add client information", desc: "Include the buyer's name, billing address, shipping address (if different), and their GSTIN for B2B transactions. Accurate details ensure the invoice is valid for tax purposes." },
  { title: "List your products or services", desc: "For each line item, provide a clear description, quantity, unit price, and GST rate. The total amount is calculated automatically." },
  { title: "Apply taxes and discounts", desc: "Specify the applicable GST rate (0%, 5%, 12%, 18%, or 28%). The system splits it into CGST and SGST for intra-state sales, or IGST for inter-state sales." },
  { title: "Set payment terms", desc: "Define the due date, payment methods accepted (bank transfer, UPI, cheque), and any late payment penalties. This sets clear expectations." },
  { title: "Review and send", desc: "Preview the invoice, make any final adjustments, and download as PDF. Share it via email or WhatsApp directly from the app." },
]

export default function HowToCreateInvoicePage() {
  return (
    <>
      <Script id="json-ld-1" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="min-h-screen bg-mesh py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <SiteLogo className="mb-8" />

          <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">Guide</p>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-4">
            How to Create an Invoice: Step-by-Step Guide
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Whether you&apos;re a freelancer, small business owner, or accountant, knowing how to create a proper
            invoice is essential. This guide walks you through everything — from the basics to GST-compliant invoicing.
          </p>

          <div className="glass-card p-8 mb-10">
            <h2 className="text-xl font-display font-semibold mb-4">What Is an Invoice?</h2>
            <p className="text-muted-foreground leading-relaxed">
              An invoice is a commercial document issued by a seller to a buyer that itemizes products or services
              provided and specifies the amount due. It serves as a formal request for payment and is a critical record
              for accounting, tax filing, and legal purposes. In India, GST invoices must follow a format prescribed by
              the GST Act.
            </p>
          </div>

          <div className="glass-card p-8 mb-10">
            <h2 className="text-xl font-display font-semibold mb-4">Key Elements of an Invoice</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Invoice number and date",
                "Seller name, address, and GSTIN",
                "Buyer name, address, and GSTIN (for B2B)",
                "Itemized list with HSN/SAC codes",
                "Quantity, rate, and amount per item",
                "GST rate and tax amount (CGST/SGST/IGST)",
                "Subtotal, discount, and total amount",
                "Payment terms and due date",
                "Bank details or UPI QR code",
                "Signature and stamp (if applicable)",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-display font-bold mb-6">Step-by-Step Guide</h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="glass-card p-6 flex gap-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="glass-card p-8 mb-10 border-l-4 border-l-amber-500">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-display font-semibold mb-2">GST Invoice Requirements</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  For GST-registered businesses in India, an invoice must include:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li>Invoice number (unique, sequential)</li>
                  <li>Invoice date</li>
                  <li>Seller&apos;s name, address, and GSTIN</li>
                  <li>Buyer&apos;s name, address, and GSTIN (if registered)</li>
                  <li>HSN code for goods or SAC code for services</li>
                  <li>Taxable value and GST amount (CGST + SGST or IGST)</li>
                  <li>Place of supply</li>
                  <li>Signature of the supplier</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 mb-10">
            <h2 className="text-xl font-display font-semibold mb-4">Tips for Effective Invoicing</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Send invoices promptly</strong> — issue invoices immediately after delivering goods or services to improve cash flow.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Use clear descriptions</strong> — vague line items can lead to payment delays and disputes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Set clear payment terms</strong> — specify due dates, late fees, and accepted payment methods upfront.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Number invoices sequentially</strong> — use a consistent format like INV-2025-0001 for easier tracking.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Keep copies</strong> — maintain records of all invoices for tax filing and reconciliation.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-8 mb-10 text-center">
            <h2 className="text-xl font-display font-semibold mb-2">Ready to Create Your First Invoice?</h2>
            <p className="text-muted-foreground mb-4">
              Use our free invoice generator — no signup, no watermarks, instant PDF download.
            </p>
            <Link
              href="/tools/invoice-generator"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <FileText className="h-4 w-4" /> Create Invoice Now
            </Link>
          </div>

          <section>
            <h2 className="text-2xl font-display font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {[
                { q: "What is the difference between an invoice and a bill?", a: "An invoice is a request for payment sent by a seller to a buyer, while a bill is the document a buyer receives as a record of what they owe. In practice they refer to the same document." },
                { q: "Do I need to include GST on my invoice?", a: "If your business is registered under GST and your annual turnover exceeds the threshold (₹40 lakh for goods, ₹20 lakh for services), you must charge GST and issue a GST-compliant invoice." },
                { q: "Can I create an invoice without a GST number?", a: "Yes. If you are not GST-registered, you can still issue a regular invoice. However, you cannot charge GST or claim input tax credit." },
                { q: "What software can I use to create invoices for free?", a: "QuoteFlow is a free online invoice generator that works in your browser. No signup needed, no data stored on servers, and instant PDF download." },
                { q: "Is an invoice a legal document?", a: "Yes, an invoice is a legally recognized document that serves as evidence of a transaction between a seller and a buyer. It is used for accounting, tax filing, and dispute resolution." },
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
