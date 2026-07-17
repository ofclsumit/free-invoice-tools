"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Menu, X, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, useScroll, useTransform } from "framer-motion"

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll()
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.8)"]
  )
  const headerBgDark = useTransform(
    scrollY,
    [0, 100],
    ["rgba(3,0,20,0)", "rgba(3,0,20,0.8)"]
  )
  const headerBlur = useTransform(scrollY, [0, 100], [0, 24])
  const headerBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0,0,0,0)", "rgba(0,0,0,0.1)"]
  )
  const headerBorderDark = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.08)"]
  )
  const headerY = useTransform(scrollY, [0, 100], [0, 0])
  const headerScale = useTransform(scrollY, [0, 100], [1, 1])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#cat-document", label: "Document Generators" },
    { href: "#cat-calculators", label: "Financial Calculators" },
    { href: "#cat-utilities", label: "Utilities & Tools" },
  ]

  return (
    <motion.header
      ref={headerRef}
      style={{
        y: headerY,
        scale: headerScale,
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Light mode background */}
      <motion.div
        className="absolute inset-0 dark:hidden"
        style={{
          background: headerBg,
          backdropFilter: `blur(${headerBlur}px)`,
          borderBottom: useTransform(headerBorder, v => `1px solid ${v}`),
        }}
      />
      {/* Dark mode background */}
      <motion.div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: headerBgDark,
          backdropFilter: `blur(${headerBlur}px)`,
          borderBottom: useTransform(headerBorderDark, v => `1px solid ${v}`),
        }}
      />
      {/* Content */}
      <div className={cn(
        "relative transition-all duration-300",
        isScrolled ? "shadow-sm" : ""
      )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-glow-sm">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              QuoteFlow
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* Mobile menu */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {isMobileOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl py-4 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
        </div>
      </div>
    </motion.header>
  )
}
