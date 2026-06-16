import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 p-12 sm:p-16">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mx-auto">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              Ready to get paid faster?
            </h2>
            <p className="text-lg text-blue-100 max-w-xl mx-auto">
              Join 8,500+ Indian businesses using QuoteFlow to create professional invoices
              and collect payments without the hassle.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-white text-blue-600 hover:bg-blue-50 font-semibold text-base shadow-xl"
                >
                  Start for free — no card needed
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#tools">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 border-white/30 text-white hover:bg-white/10 font-semibold text-base"
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
