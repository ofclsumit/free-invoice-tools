import Script from "next/script"
import Link from "next/link"
import { FileText, Download, Printer, Shield, CheckCircle } from "lucide-react"
import { SiteLogo } from "@/components/shared/site-logo"

export const metadata = {
  title: "Free Salary Slip Generator | Download PDF | QuoteFlow",
  description:
    "Generate professional salary slips online for free. Download as PDF. Perfect for employers and employees. No signup needed.",
  alternates: {
    canonical: "https://quoteflow.in/salary-slip-generator",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      "name": "What is a salary slip?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A salary slip (also called payslip) is a document issued by an employer to an employee that details the salary for a specific period, including earnings, deductions, and net pay.",
      },
    },
    {
      "@type": "Question",
      "name": "Is a salary slip mandatory?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, under Indian labor laws, employers must provide salary slips to all employees. It serves as proof of income for loans, visa applications, and tax filing.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I generate salary slips for my employees?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our free salary slip generator lets you create payslips for multiple employees with different salary structures.",
      },
    },
  ],
}

const features = [
  { icon: FileText, title: "Professional Design", desc: "Clean, professional salary slip format suitable for any organization." },
  { icon: Download, title: "Instant PDF Download", desc: "Download salary slips as PDF with all earnings and deductions clearly shown." },
  { icon: Printer, title: "Print Ready", desc: "Optimized for A4 printing with proper margins and layout." },
  { icon: Shield, title: "Client-Side Privacy", desc: "Your salary data stays in your browser. Nothing is uploaded to servers." },
]

const steps = [
  { num: "01", title: "Enter Employee Details", desc: "Add employee name, designation, department, and bank details." },
  { num: "02", title: "Configure Salary", desc: "Set basic pay, allowances, deductions like PF and TDS." },
  { num: "03", title: "Download Payslip", desc: "Preview and download the salary slip as a professional PDF." },
]

export default function SalarySlipGeneratorPage() {
  return (
    <>
      <Script id="json-ld-1" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="min-h-screen bg-mesh">
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <SiteLogo className="mb-8" />
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">Free Online Tool</p>
            <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight mb-4">
              Free Salary Slip Generator
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create professional salary slips and payslips for your employees in seconds. Download as PDF with all
              earnings, deductions, and net pay. No signup needed.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link
                href="/tools/salary-slip"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <FileText className="h-4 w-4" /> Generate Salary Slip
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
                href="/tools/salary-slip"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started Now <CheckCircle className="h-4 w-4" />
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
                { q: "What is a salary slip?", a: "A salary slip (also called payslip) is a document issued by an employer to an employee that details the salary for a specific period, including earnings, deductions, and net pay." },
                { q: "Is a salary slip mandatory?", a: "Yes, under Indian labor laws, employers must provide salary slips to all employees. It serves as proof of income for loans, visa applications, and tax filing." },
                { q: "Can I generate salary slips for my employees?", a: "Yes, our free salary slip generator lets you create payslips for multiple employees with different salary structures." },
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
