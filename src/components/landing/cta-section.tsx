import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function CtaSection() {
  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass-card-liquid p-12 sm:p-16">
          <div className="glass-filter" />
          <div className="glass-overlay" />
          <div className="glass-specular" />

          <div className="glass-content relative z-10 space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 dark:bg-white/10 backdrop-blur-sm mx-auto">
              <Zap className="h-7 w-7 text-indigo-600 dark:text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
              Ready to get paid faster?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Join 8,500+ Indian businesses using Turnivo to create professional invoices
              and collect payments without the hassle.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/invoice-generator" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="saas-btn-primary h-12 px-8 text-base shadow-xl w-full"
                >
                  Start for free — no card needed
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#tools" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="saas-btn-outline h-12 px-8 text-base w-full"
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
