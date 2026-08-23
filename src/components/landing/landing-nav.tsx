"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { SiteLogo } from "@/components/shared/site-logo"
import { cn } from "@/lib/utils"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsScrolled(scrolled)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#cat-document", label: "Document Generators" },
    { href: "#cat-calculators", label: "Financial Calculators" },
    { href: "#cat-utilities", label: "Utilities & Tools" },
  ]

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-4 left-4 right-4 z-50 max-w-6xl mx-auto rounded-full transition-all duration-300",
        isScrolled
          ? "bg-white/80 dark:bg-[#0d0a1b]/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20"
          : "bg-transparent border border-transparent"
      )}
    >

      {/* Content wrapper */}
      <div className={cn(
        "relative transition-all duration-300",
        isScrolled ? "shadow-sm" : ""
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo with hover scaling and aura glow */}
            <SiteLogo />

            {/* Desktop Nav - Crystal glass link tiles with animated glowing underline */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative group px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/10 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                >
                  <span className="relative">
                    {link.label}
                    <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-400 to-[#c084fc] scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-full" />
                  </span>
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              {/* Premium Minimalist Animated Mobile menu toggle button */}
              <button
                className="md:hidden flex flex-col justify-center items-center w-8 h-8 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-colors focus:outline-none"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle menu"
              >
                <div className="space-y-1">
                  <span className={cn(
                    "block w-5 h-[1.5px] bg-slate-800 dark:bg-slate-200 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
                    isMobileOpen ? "rotate-45 translate-y-[5.5px]" : ""
                  )} />
                  <span className={cn(
                    "block w-5 h-[1.5px] bg-slate-800 dark:bg-slate-200 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
                    isMobileOpen ? "opacity-0 scale-x-0" : ""
                  )} />
                  <span className={cn(
                    "block w-5 h-[1.5px] bg-slate-800 dark:bg-slate-200 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
                    isMobileOpen ? "-rotate-45 -translate-y-[5.5px]" : ""
                  )} />
                </div>
              </button>
            </div>
          </div>

          {/* Floating Dropdown Panel (Floats 8px directly below the capsule navbar) */}
          <AnimatePresence>
            {isMobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-[calc(100%+8px)] left-0 right-0 md:hidden bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-black/5 dark:border-white/10 p-4 rounded-2xl shadow-xl shadow-black/10 flex flex-col gap-1.5"
              >
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 rounded-xl transition-all"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
