import Script from "next/script"
import Link from "next/link"
import { ArrowLeft, Calculator, TrendingDown, Calendar, Download, CheckCircle } from "lucide-react"

export const metadata = {
  title: "Free EMI Calculator | Calculate Loan EMI Online | QuoteFlow",
  description:
    "Calculate your monthly EMI for home loan, car loan, personal loan instantly. Free online EMI calculator with amortization schedule. No signup needed.",
  alternates: {
    canonical: "https://quoteflow.in/calculator/emi-calculator",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      "name": "How is EMI calculated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "EMI is calculated using the formula: EMI = [P x R x (1+R)^N] / [(1+R)^N - 1], where P is the loan amount, R is the monthly interest rate, and N is the number of monthly installments.",
      },
    },
    {
      "@type": "Question",
      "name": "What is the difference between flat rate and reducing balance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Flat rate interest is calculated on the full loan amount for the entire tenure, while reducing balance interest is calculated on the outstanding principal. Reducing balance is more common and results in lower total interest.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I use this EMI calculator for any loan type?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our EMI calculator works for home loans, car loans, personal loans, education loans, and any other type of loan where EMI is applicable.",
      },
    },
  ],
}

const features = [
  { icon: Calculator, title: "Instant Calculation", desc: "Calculate EMI, total interest, and total payment instantly as you type." },
  { icon: TrendingDown, title: "Amortization Schedule", desc: "View a complete year-wise or month-wise breakup of principal and interest." },
  { icon: Calendar, title: "Flexible Tenure", desc: "Choose between months or years for loan tenure." },
  { icon: Download, title: "Download Results", desc: "Download your amortization schedule as PDF for reference." },
]

const steps = [
  { num: "01", title: "Enter Loan Amount", desc: "Enter the total loan amount you wish to borrow." },
  { num: "02", title: "Set Rate & Tenure", desc: "Input the interest rate and choose the repayment period." },
  { num: "03", title: "View EMI Schedule", desc: "See your monthly EMI, total interest payable, and full amortization table." },
]

export default function EMICalculatorPage() {
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
              Free EMI Calculator
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Calculate your monthly EMI for home loans, car loans, personal loans, and more. View the complete
              amortization schedule with principal and interest breakup. Free, instant, no signup.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link
                href="/tools/emi-calculator"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <Calculator className="h-4 w-4" /> Calculate EMI Now
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
                href="/tools/emi-calculator"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Calculate Your EMI <CheckCircle className="h-4 w-4" />
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
                { q: "How is EMI calculated?", a: "EMI is calculated using the formula: EMI = [P x R x (1+R)^N] / [(1+R)^N - 1], where P is the loan amount, R is the monthly interest rate, and N is the number of monthly installments." },
                { q: "What is the difference between flat rate and reducing balance?", a: "Flat rate interest is calculated on the full loan amount for the entire tenure, while reducing balance interest is calculated on the outstanding principal. Reducing balance is more common and results in lower total interest." },
                { q: "Can I use this EMI calculator for any loan type?", a: "Yes, our EMI calculator works for home loans, car loans, personal loans, education loans, and any other type of loan where EMI is applicable." },
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
