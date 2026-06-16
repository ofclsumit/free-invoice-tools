"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

const benefits = [
  "Free forever — no credit card needed",
  "Instant PDF download",
  "WhatsApp & email sharing",
  "Works on mobile",
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-mesh pt-16">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-3xl mx-auto">
          <div className="text-center lg:text-center space-y-8">
            <div className="inline-flex">
              <Badge
                variant="outline"
                className="px-4 py-1.5 text-sm font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-full gap-2"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                India&apos;s fastest GST invoice generator
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight tracking-tight">
              Create GST Invoices{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  in seconds
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C50 4 150 -2 298 8"
                    stroke="url(#underline-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="underline-gradient" x1="0" y1="0" x2="300" y2="0">
                      <stop stopColor="#2563eb" />
                      <stop offset="1" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Professional GST invoices, quotations, and billing documents — built for Indian 
              freelancers and businesses. Faster than Zoho, simpler than Vyapar. 
              <strong className="text-foreground"> Free forever.</strong>
            </p>

            <ul className="space-y-2.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/#tools">
                <Button size="lg" variant="outline" className="h-12 px-8 font-semibold text-base">
                  Explore All Tools
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              No credit card · No watermarks · No hidden fees
            </p>
          </div>
        </div>

        {/* Social proof numbers */}
        <div className="mt-20 pt-12 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { value: "50,000+", label: "Invoices created" },
            { value: "8,500+", label: "Active businesses" },
            { value: "₹120Cr+", label: "Invoiced amount" },
            { value: "4.9 / 5", label: "Average rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-bold text-2xl sm:text-3xl text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
