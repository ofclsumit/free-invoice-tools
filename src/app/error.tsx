"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp, LifeBuoy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteLogo } from "@/components/shared/site-logo"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-between overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-rose-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl opacity-70 dark:opacity-30" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-border/40 backdrop-blur-md bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <SiteLogo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </header>

      {/* Main Error Content */}
      <main className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-12 text-center flex-1 flex flex-col justify-center">
        {/* Glowing Error Icon */}
        <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 dark:bg-rose-500/15 flex items-center justify-center shadow-lg shadow-rose-500/5">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3 tracking-tight">
          Something unexpected happened
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
          We encountered a temporary issue while loading this page. Your data is safe locally on your device.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <Button
            onClick={() => reset()}
            size="lg"
            className="rounded-xl gap-2 font-semibold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl gap-2 font-medium border-border hover:bg-muted"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>

        {/* Technical Details Toggle */}
        <div className="w-full text-left bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Technical Details {error.digest ? `(ID: ${error.digest.slice(0, 8)})` : ""}</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="mt-3 pt-3 border-t border-border/40 text-xs font-mono text-muted-foreground/90 break-words leading-relaxed bg-muted/40 p-3 rounded-lg">
              {error.message || "An unknown runtime error occurred."}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Turnivo. All rights reserved.</p>
          <Link href="/contact" className="hover:text-foreground transition-colors flex items-center gap-1">
            <LifeBuoy className="w-3.5 h-3.5" />
            Report an issue
          </Link>
        </div>
      </footer>
    </div>
  )
}
