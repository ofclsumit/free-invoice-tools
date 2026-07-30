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
    a: "Yes! Turnivo is 100% free with no limits, no watermarks, no hidden subscriptions, and no credit card required. You can generate unlimited invoices, quotations, receipts, and challans without any restriction.",
  },
  {
    q: "Do I need to sign up or create an account?",
    a: "No signup or account creation is required whatsoever. You can start creating documents immediately. All tool operations work instantly.",
  },
  {
    q: "Is my financial data secure and private?",
    a: "Absolutely. Turnivo is built privacy-first. All document compilation, pricing calculations, and PDF generation happen locally inside your web browser. No document details are sent to or stored on our servers.",
  },
  {
    q: "Is Turnivo compliant with Indian GST rules?",
    a: "Yes. Turnivo supports standard B2B/B2C GST billing, automatic CGST/SGST/IGST splits, custom HSN/SAC codes, and generates invoices in compliant layouts specified under GST laws.",
  },
  {
    q: "Can I add my company logo and signature?",
    a: "Yes! You can upload your business logo, customize terms, and embed an authorized digital signature directly onto the print-ready PDF document.",
  },
  {
    q: "Can I share invoices on WhatsApp or generate on my phone?",
    a: "Yes. Turnivo is built mobile-first and works perfectly on all smartphones. You can share PDFs directly via WhatsApp/Email share sheets, and install Turnivo as a Progressive Web App (PWA) on your home screen.",
  },
  {
    q: "What documents can I generate using Turnivo?",
    a: "You can generate Tax Invoices, Quotations, Proforma Invoices, Purchase Orders, Delivery Challans, Rent Receipts, and Salary Slips, alongside using our suite of financial calculators.",
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
