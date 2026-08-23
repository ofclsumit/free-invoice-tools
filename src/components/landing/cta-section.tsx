import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function CtaSection() {
  return (
    <section className="py-24 bg-transparent relative z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="
          rounded-[26px] p-10 sm:p-14
          border border-black/[0.07] bg-white/70
          dark:border-white/[0.08] dark:bg-white/[0.03]
          backdrop-blur-xl
          shadow-[0_1px_2px_0_rgba(23,22,43,0.04)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]
          transition-all duration-200
          hover:border-violet-300/60 dark:hover:border-white/[0.14]
          hover:shadow-[0_14px_32px_-14px_rgba(124,58,237,0.25)]
        ">
          <div className="space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border border-violet-500/25 text-violet-600 dark:text-violet-300 mx-auto">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Ready to get paid faster?
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-white/50 max-w-xl mx-auto">
              Join 8,500+ Indian businesses using Turnivo to create professional invoices
              and collect payments without the hassle.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/invoice-generator" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 px-8 text-sm font-semibold rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/25 w-full"
                >
                  Start for free — no card needed
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#tools" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-sm font-semibold rounded-full border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 w-full"
                >
                  Explore All Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
