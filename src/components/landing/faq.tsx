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
    <section id="faq" className="py-14 sm:py-20 relative z-20">
      <div className="max-w-2xl sm:max-w-[700px] mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2.5 mb-8 sm:mb-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Questions & answers
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-white/50">
            Everything you need to know about Turnivo.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="
                rounded-[18px]
                border border-black/[0.07] bg-white/70
                dark:border-white/[0.08] dark:bg-white/[0.03]
                backdrop-blur-xl
                px-5 sm:px-6
                shadow-[0_1px_2px_0_rgba(23,22,43,0.04)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]
                transition-all duration-200
                hover:border-violet-300/60 dark:hover:border-white/[0.14]
                hover:bg-white dark:hover:bg-white/[0.05]
                data-[state=open]:border-violet-400/40 dark:data-[state=open]:border-white/[0.16]
                data-[state=open]:bg-white dark:data-[state=open]:bg-white/[0.06]
                data-[state=open]:shadow-[0_8px_24px_-12px_rgba(124,58,237,0.2)]
              "
            >
              <AccordionTrigger className="text-left text-[14.5px] font-semibold text-zinc-900 dark:text-white hover:no-underline py-4 sm:py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[13.5px] text-zinc-600 dark:text-white/60 leading-relaxed pb-5 pt-1">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
