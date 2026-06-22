import Script from "next/script"
import Link from "next/link"
import { ArrowLeft, Calculator, Percent, RefreshCw, Download, CheckCircle } from "lucide-react"

export const metadata = {
  title: "Free GST Calculator | Calculate GST Online | QuoteFlow",
  description:
    "Calculate GST inclusive and exclusive amounts instantly. Supports all GST rates (0%, 5%, 12%, 18%, 28%). Free online GST calculator for Indian businesses.",
  alternates: {
    canonical: "https://quoteflow.in/calculator/gst-calculator",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      "name": "How do I calculate GST?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "To calculate GST, multiply the taxable amount by the GST rate and divide by 100. For GST-exclusive amounts: GST = Amount × Rate / 100. For GST-inclusive amounts: GST = Amount × Rate / (100 + Rate).",
      },
    },
    {
      "@type": "Question",
      "name": "What is the difference between GST exclusive and inclusive?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GST exclusive means the price shown does not include GST — tax is added on top. GST inclusive means the price shown already includes the GST component.",
      },
    },
    {
      "@type": "Question",
      "name": "What are the GST rates in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "India has four main GST slabs: 5% (essential items), 12% (standard goods), 18% (most goods and services), and 28% (luxury items). Some items like fresh food are exempt (0%).",
      },
    },
    {
      "@type": "Question",
      "name": "Can I use this GST calculator for filing returns?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "This calculator helps you compute GST amounts quickly, but you should verify calculations before filing GST returns. Always reconcile with your accounting software.",
      },
    },
  ],
}

const features = [
  { icon: Calculator, title: "GST Exclusive/Inclusive", desc: "Calculate GST for both exclusive and inclusive price scenarios." },
  { icon: Percent, title: "All GST Rates", desc: "Supports 0%, 5%, 12%, 18%, and 28% GST slabs." },
  { icon: RefreshCw, title: "Instant Toggle", desc: "Switch between exclusive and inclusive mode with one click." },
  { icon: Download, title: "Download PDF", desc: "Download your GST calculation as a PDF for record keeping." },
]

const steps = [
  { num: "01", title: "Enter Amount", desc: "Enter the total invoice amount or the base price." },
  { num: "02", title: "Select GST Rate", desc: "Choose the applicable GST rate from 0%, 5%, 12%, 18%, or 28%." },
  { num: "03", title: "Get Results", desc: "See the GST amount, CGST/SGST/IGST breakup, and total instantly." },
]

export default function GSTCalculatorPage() {
  return (
    <>
      <Script id="json-ld-1" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="min-h-screen bg-mesh">
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Calculator className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">Free Online Tool</p>
            <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight mb-4">
              Free GST Calculator
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Calculate GST amounts instantly — whether you need GST-exclusive or GST-inclusive pricing. Supports all
              GST rates (0%, 5%, 12%, 18%, 28%) with CGST/SGST/IGST breakup. Free, no signup.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link
                href="/tools/gst-calculator"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <Calculator className="h-4 w-4" /> Calculate GST Now
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 px-4 bg-white/50 dark:bg-gray-950/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">Features</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f) => (
                <div key={f.title} className="glass-card p-5 text-center space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">How It Works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {steps.map((s) => (
                <div key={s.num} className="text-center">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-bold text-primary">{s.num}</span>
                  </div>
                  <h3 className="font-display font-semibold mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/tools/gst-calculator"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Calculate GST Now <CheckCircle className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 px-4 bg-white/50 dark:bg-gray-950/50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {[
                { q: "How do I calculate GST?", a: "To calculate GST, multiply the taxable amount by the GST rate and divide by 100. For GST-exclusive amounts: GST = Amount × Rate / 100. For GST-inclusive amounts: GST = Amount × Rate / (100 + Rate)." },
                { q: "What is the difference between GST exclusive and inclusive?", a: "GST exclusive means the price shown does not include GST — tax is added on top. GST inclusive means the price shown already includes the GST component." },
                { q: "What are the GST rates in India?", a: "India has four main GST slabs: 5% (essential items), 12% (standard goods), 18% (most goods and services), and 28% (luxury items). Some items like fresh food are exempt (0%)." },
                { q: "Can I use this GST calculator for filing returns?", a: "This calculator helps you compute GST amounts quickly, but you should verify calculations before filing GST returns. Always reconcile with your accounting software." },
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
          </div>
        </section>
      </div>
    </>
  )
}
