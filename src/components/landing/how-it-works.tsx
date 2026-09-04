"use client"

import { ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Add your business details",
    description:
      "Enter your business name, GSTIN, address, and logo once. We securely remember it locally for all future invoices.",
  },
  {
    number: "02",
    title: "Add client & line items",
    description:
      "Select an existing client or add a new one. Add products/services with auto-calculated HSN codes and GST rates.",
  },
  {
    number: "03",
    title: "Preview & download PDF",
    description:
      "View live layouts instantly. Export crystal-clear, 100% digital vector PDFs with fully copyable and searchable text.",
  },
  {
    number: "04",
    title: "Send & get paid",
    description:
      "Download crisp PDFs, print directly, or launch native device file-share sheets and WhatsApp in one click.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-14 sm:py-20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12 sm:mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            From zero to paid in 4 steps
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-white/50 max-w-xl mx-auto">
            Most users create their first compliant invoice in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((step) => (
            <div
              key={step.number}
              className="
                group relative flex flex-col justify-between rounded-[22px] p-6 sm:p-7
                border border-black/[0.07] bg-white/70
                dark:border-white/[0.08] dark:bg-white/[0.03]
                backdrop-blur-xl
                shadow-[0_1px_2px_0_rgba(23,22,43,0.04)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]
                transition-all duration-200 ease-out
                hover:-translate-y-[3px] hover:bg-white dark:hover:bg-white/[0.06]
                hover:border-violet-300/60 dark:hover:border-white/[0.14]
                hover:shadow-[0_12px_28px_-12px_rgba(124,58,237,0.28)]
              "
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border border-violet-500/25 dark:border-white/10 text-violet-600 dark:text-violet-300 font-bold text-sm">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-[15.5px] font-semibold leading-snug text-zinc-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-white/45">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
