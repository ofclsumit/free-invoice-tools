import Link from "next/link"
import { ArrowLeft, Home, FileText, Calculator, ClipboardList, Receipt, Search, Sparkles, HelpCircle } from "lucide-react"
import { SiteLogo } from "@/components/shared/site-logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const quickLinks = [
    {
      title: "GST Invoice Generator",
      desc: "Create professional GST invoices with instant PDF download",
      href: "/invoice-generator",
      icon: FileText,
      badge: "Popular",
      color: "text-violet-500",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      title: "Quotation Generator",
      desc: "Create professional quotation estimates for clients",
      href: "/quotation-generator",
      icon: ClipboardList,
      badge: "Free",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "GST Calculator",
      desc: "Calculate inclusive and exclusive GST amounts in seconds",
      href: "/gst-calculator",
      icon: Calculator,
      badge: "Utility",
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Rent Receipt Generator",
      desc: "Generate HRA-compliant rent receipts for tax exemption",
      href: "/rent-receipt",
      icon: Receipt,
      badge: "HRA",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ]

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-between overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/20 via-indigo-500/15 to-pink-500/10 rounded-full blur-3xl opacity-70 dark:opacity-40" />
        <div className="absolute -bottom-40 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-blue-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl opacity-60 dark:opacity-30" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-border/40 backdrop-blur-md bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <SiteLogo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main 404 Hero Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center flex-1 flex flex-col justify-center">
        {/* Animated Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-semibold uppercase tracking-wider mx-auto mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Error 404 · Page Not Found</span>
        </div>

        {/* Big Stylized 404 */}
        <h1 className="text-7xl sm:text-9xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 dark:from-violet-400 dark:via-indigo-300 dark:to-purple-400 select-none drop-shadow-sm">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-4 mb-3">
          Oops! Looks like this page got lost in transit.
        </h2>

        <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-8">
          The page or document you are looking for might have been moved, renamed, or no longer exists. Explore our popular tools below or return home.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <Button asChild size="lg" className="rounded-xl gap-2 font-semibold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/">
              <Home className="w-4 h-4" />
              Return to Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl gap-2 font-medium border-border/80 hover:bg-muted">
            <Link href="/#tools">
              <Search className="w-4 h-4" />
              Browse 27+ Free Tools
            </Link>
          </Button>
        </div>

        {/* Popular Tools Fast Navigation Grid */}
        <div className="text-left w-full pt-6 border-t border-border/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-5">
            Or Jump Straight Into Popular Tools
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {quickLinks.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group relative p-4 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-purple-500/40 transition-all duration-200 hover:shadow-md backdrop-blur-sm flex items-start gap-3.5"
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${tool.bg}`}>
                    <Icon className={`w-5 h-5 ${tool.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {tool.title}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {tool.badge}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Turnivo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-foreground transition-colors flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Need Help? Contact Support
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
