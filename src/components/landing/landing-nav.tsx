"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Menu, X, Zap, ArrowRight, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const { scrollY } = useScroll()
  const headerBg = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,0.7)"])
  const headerBgDark = useTransform(scrollY, [0, 80], ["rgba(5,1,12,0)", "rgba(11,6,24,0.7)"])
  const headerBlur = useTransform(scrollY, [0, 80], [0, 18])
  const headerBorder = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,0.12)"])
  const headerBorderDark = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,0.1)"])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#how-it-works", label: "Features" },
    { href: "/invoice-generator", label: "Templates" },
    { href: "/#tools", label: "Pricing" },
  ]

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Light mode background */}
      <motion.div
        className="absolute inset-0 dark:hidden"
        style={{
          background: headerBg,
          backdropFilter: `blur(${headerBlur}px)`,
          borderBottom: useTransform(headerBorder, (v) => `1px solid ${v}`),
        }}
      />
      {/* Dark mode background (glassmorphism when scrolled) */}
      <motion.div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: headerBgDark,
          backdropFilter: `blur(${headerBlur}px)`,
          borderBottom: useTransform(headerBorderDark, (v) => `1px solid ${v}`),
        }}
      />

      <div className={cn("relative transition-all duration-300", isScrolled ? "shadow-sm" : "")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-glow-sm">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                QuoteFlow
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/invoice-generator" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex">
                <span className="flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Login
                </span>
              </Link>
              <Link href="/invoice-generator" className="hidden md:inline-flex">
                <Button size="sm" className="h-9 gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:from-violet-700 hover:to-indigo-700">
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <button
                className="rounded-lg p-2 transition-colors hover:bg-accent md:hidden"
                onClick={() => setIsMobileOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile drawer */}
          <AnimatePresence>
            {isMobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden md:hidden"
              >
                <div className="space-y-1 border-t border-border bg-background/95 py-4 backdrop-blur-xl">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="block rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ))}
                  <Link
                    href="/invoice-generator"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                  <Link
                    href="/invoice-generator"
                    onClick={() => setIsMobileOpen(false)}
                    className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}
