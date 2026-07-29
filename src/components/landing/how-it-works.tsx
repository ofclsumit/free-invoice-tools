"use client"

import { CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Add your business details",
    description: "Enter your business name, GSTIN, address, and logo once. We remember it for all future invoices.",
  },
  {
    number: "02",
    title: "Add client & line items",
    description: "Select an existing client or add a new one. Add products/services with HSN codes and GST rates.",
  },
  {
    number: "03",
    title: "Preview & download PDF",
    description: "View dynamic layouts instantly. Export crystal-clear, 100% digital vector PDFs with fully copyable and searchable text.",
  },
  {
    number: "04",
    title: "Share & get paid",
    description: "Generate secure cloud-backed database sharing links with Copy URL, or launch native device file-share sheets in one click.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">Simple process</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">From zero to paid in 4 steps</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Most users create their first invoice in under 2 minutes.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-[calc(100%+2rem)] h-px bg-gradient-to-r from-border to-transparent z-0" />
              )}
              <div className="glass-card-liquid text-center h-full">
                <div className="glass-filter" />
                <div className="glass-overlay" />
                <div className="glass-specular" />
                <div className="glass-content p-6 relative z-10">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-display font-bold text-lg shadow-lg shadow-blue-500/25 mb-5 mx-auto">
                    {step.number}
                  </div>
                  <h3 className="font-display font-semibold text-base mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
