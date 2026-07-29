"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "Is Turnivo really free?",
    a: "Yes! Our free plan lets you create 25 invoices and 10 quotations per month — more than enough for most freelancers and small businesses. There are no watermarks, no hidden charges, and no credit card required.",
  },
  {
    q: "Is Turnivo compliant with Indian GST rules?",
    a: "Yes. Turnivo automatically calculates CGST, SGST, and IGST based on whether the transaction is within the same state or interstate. It supports all GST rates (0%, 5%, 12%, 18%, 28%) and generates invoices in the format required by GST law.",
  },
  {
    q: "Can I add my company logo and signature?",
    a: "Yes! You can upload your company logo, and it will appear on all your invoices and quotations. You can also draw or upload a digital signature that gets embedded in every document.",
  },
  {
    q: "How does the UPI QR code work?",
    a: "Enter your UPI ID in your profile settings, and Turnivo will automatically generate a payment QR code and embed it inside every PDF invoice. Your clients can scan it directly from the invoice to pay you instantly.",
  },
  {
    q: "Can I convert a quotation to an invoice?",
    a: "Absolutely. When a client accepts your quotation, simply click 'Convert to Invoice' and all the details — client info, line items, terms — are automatically carried over. Just review and send.",
  },
  {
    q: "Can I share invoices on WhatsApp?",
    a: "Yes! Every invoice and quotation has a 'Share on WhatsApp' button. It opens WhatsApp with a pre-filled message containing a link to your invoice. Your client can view and download it from any device.",
  },
  {
    q: "Is my financial data secure?",
    a: "Your security is our top priority. All data is encrypted in transit and at rest. We never share your data with third parties. You can also export and delete all your data at any time.",
  },
  {
    q: "Can I use Turnivo on my phone?",
    a: "Yes! Turnivo is built mobile-first and works perfectly on all smartphones. You can create and send invoices on the go. You can also install it as a PWA (Progressive Web App) on your home screen.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-16 sm:py-24 bg-transparent">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">Questions & answers</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about Turnivo.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="glass-card-liquid border border-transparent px-6 data-[state=open]:shadow-sm"
            >
              <div className="glass-filter" />
              <div className="glass-overlay" />
              <div className="glass-specular" />
              <div className="glass-content relative z-10 w-full">
                <AccordionTrigger className="text-left font-display font-semibold text-sm hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
