"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Star, Shield, Download } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 lg:pt-28">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950" />
      <div className="absolute inset-0 bg-mesh opacity-70" />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-violet-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/20 to-blue-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div className="inline-flex">
              <Badge
                variant="outline"
                className="px-4 py-1.5 text-sm font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-full gap-2"
              >
                <Sparkles className="h-3.5 w-3.5" />
                India&apos;s fastest GST invoice generator
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-[1.1] tracking-tight text-balance">
              Create GST Invoices{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  in Seconds
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

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg">
              Professional invoices, quotations, and billing documents — built for Indian 
              freelancers and businesses. 
              <strong className="text-foreground"> No signup. No cost. No watermarks.</strong>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/invoice-generator">
                <Button size="lg" className="h-14 px-8 text-base font-semibold gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
                  Create Free Invoice
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#tools">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold w-full sm:w-auto">
                  Explore All Tools
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  <strong className="text-foreground">4.9</strong> (2,100+ reviews)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-emerald-500" />
                Free forever
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Download className="h-4 w-4 text-blue-500" />
                Instant PDF
              </div>
            </div>

            {/* Featured on */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Trusted by businesses across India</p>
              <div className="flex items-center gap-6 flex-wrap">
                {["50,000+ Invoices", "8,500+ Businesses", "₹120Cr+ Invoiced"].map((text) => (
                  <span key={text} className="text-sm font-semibold text-foreground/80">
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Visual mockup */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main card */}
              <div className="relative rounded-2xl border border-border/50 bg-white dark:bg-gray-900 shadow-2xl shadow-blue-500/10 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-blue-50/50 to-violet-50/50 dark:from-gray-800/50 dark:to-gray-800/50">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-violet-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    </div>
                    <span className="text-sm font-semibold">Invoice #INV-2024-001</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-sm font-semibold">Sunil Traders</p>
                      <p className="text-xs text-muted-foreground">Mumbai, Maharashtra</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-semibold">23 Jun 2026</p>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <div className="flex justify-between items-center text-sm py-2">
                      <span className="text-muted-foreground">Product</span>
                      <span className="text-muted-foreground">Qty</span>
                      <span className="text-muted-foreground">Amount</span>
                    </div>
                    <div className="border-t border-border/30" />
                    {[
                      { item: "Office Furniture Set", qty: "2", amount: "₹24,000" },
                      { item: "Ergonomic Chair", qty: "5", amount: "₹37,500" },
                      { item: "LED Monitor 24\"", qty: "3", amount: "₹18,000" },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-2.5 border-b border-border/30 last:border-0">
                        <span className="font-medium">{row.item}</span>
                        <span className="text-muted-foreground">{row.qty}</span>
                        <span className="font-semibold">{row.amount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total (incl. GST)</span>
                    <div className="text-right">
                      <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">₹79,500</p>
                      <p className="text-xs text-muted-foreground">GST: 18% included</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex justify-center pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      Ready to download
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating card 1 */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center animate-bounce" style={{ animationDuration: "3s" }}>
                <Download className="h-8 w-8 text-white" />
              </div>

              {/* Floating card 2 */}
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-white dark:bg-gray-800 border border-border/50 shadow-lg px-4 py-3 flex items-center gap-3 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
                <div className="flex -space-x-2">
                  {["bg-blue-500", "bg-violet-500", "bg-emerald-500"].map((color, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${color} border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-white`}>
                      {["S", "A", "R"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold">Shared via WhatsApp</p>
                  <p className="text-[10px] text-muted-foreground">Instant delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
