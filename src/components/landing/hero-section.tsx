"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useMemo, useRef, useEffect } from "react"
import { Search, X, ArrowRight } from "lucide-react"
import { toolCategories } from "./tools-section"

const allTools = toolCategories.flatMap((c) =>
  c.tools.map((t) => ({ ...t, category: c.label }))
)

export function HeroSection() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    const lower = q.toLowerCase()
    return allTools
      .filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.desc.toLowerCase().includes(lower) ||
          t.category.toLowerCase().includes(lower)
      )
      .slice(0, 8)
  }, [query])

  return (
    <section className="hero-root relative w-full">
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-root {
          min-height: 70vh;
          padding-top: 8.5rem;
          padding-bottom: 6rem;
          background: transparent;
          color: var(--foreground);
          position: relative;
          z-index: 30;
        }
        .dark .hero-root { color: #ECE9F5; }
        @media (max-width: 1023px) { .hero-root { min-height: 75vh; } }
        @media (max-width: 639px) { .hero-root { min-height: auto; padding-bottom: 5rem; } }

        .dark .hero-radial {
          position: absolute;
          top: 8%;
          left: 50%;
          transform: translateX(-50%);
          width: 1100px;
          height: 1100px;
          max-width: 160vw;
          background: radial-gradient(circle at 50% 50%, rgba(139,92,246,0.35) 0%, rgba(124,58,237,0.16) 32%, rgba(10,6,30,0) 62%);
          filter: blur(10px);
          pointer-events: none;
          animation: heroGlowBreathe 9s ease-in-out infinite;
        }
        @keyframes heroGlowBreathe {
          0%,100% { opacity: 0.85; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.06); }
        }

        .dark .hero-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(120% 80% at 50% 12%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 55%);
        }

        .dark .hero-particle {
          position: absolute;
          border-radius: 9999px;
          background: rgba(196,181,253,0.9);
          box-shadow: 0 0 8px rgba(167,139,250,0.9);
          pointer-events: none;
          animation: heroParticleFloat 14s ease-in-out infinite;
        }
        @keyframes heroParticleFloat {
          0%,100% { transform: translateY(0) translateX(0); opacity: 0.25; }
          50% { transform: translateY(-22px) translateX(10px); opacity: 0.7; }
        }

        .hero-badge {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
        }

        .hero-gradient-text {
          background: linear-gradient(90deg, #6D28D9 0%, #7C3AED 35%, #6366F1 70%, #4F46E5 100%);
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: heroTextShift 6s linear infinite;
        }
        .dark .hero-gradient-text {
          background: linear-gradient(90deg,#C4B5FD 0%,#A78BFA 25%,#8B5CF6 50%,#C084FC 75%,#C4B5FD 100%);
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 18px rgba(139,92,246,0.35));
        }
        @keyframes heroTextShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 220% 50%; }
        }

        /* Search bar */
        .hero-search-wrap { position: relative; width: 100%; max-width: 580px; margin: 0 auto; }
        .hero-search-box {
          display: flex; align-items: center; gap: .85rem;
          width: 100%;
          padding: .95rem 1.25rem;
          border-radius: 9999px;
          background: rgba(255,255,255,0.92);
          border: 1.5px solid rgba(139,92,246,0.22);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 12px 35px -10px rgba(124,58,237,0.22), 0 0 0 1px rgba(255,255,255,0.8);
          transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        .hero-search-box:focus-within {
          border-color: rgba(139,92,246,0.8);
          box-shadow: 0 0 0 4px rgba(139,92,246,0.2), 0 16px 40px -10px rgba(124,58,237,0.35);
        }
        .hero-search-box svg.search-ico { color: #7c3aed; flex-shrink: 0; }
        .hero-search-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #0f172a; font-size: 1.02rem; font-weight: 500;
        }
        .hero-search-input::placeholder { color: rgba(71,85,105,0.65); font-weight: 400; }

        .hero-search-clear {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 9999px; flex-shrink: 0;
          color: rgba(71,85,105,0.7); transition: background .2s ease, color .2s ease;
        }
        .hero-search-clear:hover { background: rgba(15,23,42,0.06); color: #0f172a; }

        .hero-search-results {
          position: absolute; top: calc(100% + .6rem); left: 0; right: 0;
          background: rgba(255,255,255,0.98);
          border: 1px solid rgba(15,23,42,0.1);
          border-radius: 1.1rem;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 24px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(139,92,246,0.12);
          overflow: hidden; z-index: 40;
          max-height: 360px; overflow-y: auto;
        }
        .hero-result-item {
          display: flex; align-items: center; gap: .75rem;
          padding: .8rem 1rem; text-align: left; width: 100%;
          color: #1e1b4b; text-decoration: none;
          border-bottom: 1px solid rgba(15,23,42,0.06);
          transition: background .15s ease;
        }
        .hero-result-item:last-child { border-bottom: none; }
        .hero-result-item:hover { background: rgba(139,92,246,0.1); }
        .hero-result-ico {
          width: 34px; height: 34px; border-radius: .7rem; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(139,92,246,0.14); color: #7c3aed;
        }
        .hero-result-ico svg { width: 17px; height: 17px; }
        .hero-result-title { font-size: .9rem; font-weight: 600; }
        .hero-result-cat { font-size: .72rem; color: rgba(71,85,105,0.7); }
        .hero-result-arrow { margin-left: auto; color: rgba(99,102,241,0.5); }
        .hero-result-empty { padding: 1.25rem 1rem; text-align: center; color: rgba(71,85,105,0.7); font-size: .85rem; }

        /* Dark search bar */
        .dark .hero-search-box {
          background: rgba(18,12,38,0.85);
          border: 1.5px solid rgba(167,139,250,0.35);
          box-shadow: 0 14px 40px -10px rgba(124,58,237,0.45), 0 0 0 1px rgba(255,255,255,0.06);
        }
        .dark .hero-search-box:focus-within {
          border-color: rgba(196,181,253,0.8);
          box-shadow: 0 0 0 4px rgba(139,92,246,0.25), 0 16px 45px -10px rgba(124,58,237,0.6);
        }
        .dark .hero-search-box svg.search-ico { color: #c4b5fd; }
        .dark .hero-search-input { color: #fff; }
        .dark .hero-search-input::placeholder { color: rgba(196,181,253,0.6); }
        .dark .hero-search-clear { color: rgba(196,181,253,0.7); }
        .dark .hero-search-clear:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .dark .hero-search-results {
          background: rgba(10,6,24,0.98);
          border: 1px solid rgba(167,139,250,0.28);
          box-shadow: 0 24px 60px -12px rgba(0,0,0,0.75), 0 0 0 1px rgba(139,92,246,0.12);
        }
        .dark .hero-result-item { color: #ECE9F5; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .dark .hero-result-item:hover { background: rgba(139,92,246,0.16); }
        .dark .hero-result-ico { background: rgba(139,92,246,0.18); color: #c4b5fd; }
        .dark .hero-result-cat { color: rgba(196,181,253,0.6); }
        .dark .hero-result-arrow { color: rgba(196,181,253,0.5); }
        .dark .hero-result-empty { color: rgba(196,181,253,0.6); }
      ` }} />

      {/* Background layers */}
      <div className="hero-radial" />
      <div className="hero-vignette" />

      {/* Floating particles */}
      <div className="hero-particle" style={{ top: "18%", left: "16%", width: 4, height: 4, animationDelay: "0s" }} />
      <div className="hero-particle" style={{ top: "30%", right: "12%", width: 6, height: 6, animationDelay: "-3s" }} />
      <div className="hero-particle" style={{ top: "62%", left: "10%", width: 3, height: 3, animationDelay: "-6s" }} />
      <div className="hero-particle" style={{ bottom: "22%", right: "18%", width: 5, height: 5, animationDelay: "-9s" }} />
      <div className="hero-particle" style={{ top: "44%", left: "24%", width: 3, height: 3, animationDelay: "-4.5s" }} />
      <div className="hero-particle" style={{ top: "24%", right: "26%", width: 4, height: 4, animationDelay: "-7.5s" }} />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 pt-6 pb-16 text-center">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
        >
          <span className="text-foreground">Professional Business Documents.</span>{" "}
          <span className="hero-gradient-text">Made Simple.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 max-w-2xl text-[15px] text-muted-foreground sm:text-[17px]"
        >
          Create invoices, quotations, GST invoices, purchase orders, delivery challans and more in seconds.
        </motion.p>

        {/* Search bar to find tools */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 w-full"
          ref={wrapRef}
        >
          <div className="hero-search-wrap">
            <div className="hero-search-box">
              <Search size={20} className="search-ico" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    setOpen(false)
                    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })
                  }
                }}
                placeholder="Search Invoice, GST, Quotation, PDF..."
                className="hero-search-input"
                aria-label="Search tools"
              />
              {query && (
                <button className="hero-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
            </div>

            {open && query.trim() && (
              <div className="hero-search-results">
                {results.length === 0 ? (
                  <p className="hero-result-empty">No tools found for &ldquo;{query}&rdquo;.</p>
                ) : (
                  results.map((tool) => {
                    const ToolIcon = tool.icon
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="hero-result-item"
                        onClick={() => setOpen(false)}
                      >
                        <span className="hero-result-ico">
                          <ToolIcon />
                        </span>
                        <span className="flex flex-col">
                          <span className="hero-result-title">{tool.title}</span>
                          <span className="hero-result-cat">{tool.category}</span>
                        </span>
                        <ArrowRight size={16} className="hero-result-arrow" />
                      </Link>
                    )
                  })
                )}
              </div>
            )}
           </div>
         </motion.div>

        {/* Primary and secondary Call to Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3.5"
        >
          <Link
            href="/invoice-generator"
            className="
              inline-flex items-center justify-center gap-2 rounded-full px-6 py-3
              text-[15px] font-semibold text-white
              bg-gradient-to-r from-violet-600 to-indigo-600
              hover:from-violet-500 hover:to-indigo-500
              shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40
              transition-all duration-200 hover:-translate-y-0.5
              active:translate-y-0 active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2
            "
          >
            <span>Create an Invoice Free</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href="#tools"
            className="
              inline-flex items-center justify-center gap-2 rounded-full px-5 py-3
              text-[14.5px] font-semibold text-zinc-700 dark:text-zinc-200
              bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15
              border border-black/10 dark:border-white/15
              backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5
              active:translate-y-0 active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2
            "
          >
            <span>Explore All 25+ Tools</span>
          </a>
        </motion.div>

        {/* Gentle cue to scroll into the tools below */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 text-center text-[13px] text-muted-foreground"
        >
          Instant PDF download · 100% Free · No registration required
        </motion.p>
      </div>
    </section>
  )
}
