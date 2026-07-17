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
          color: #ECE9F5;
        }
        @media (max-width: 1023px) { .hero-root { min-height: 75vh; } }
        @media (max-width: 639px) { .hero-root { min-height: auto; padding-bottom: 5rem; } }

        .hero-radial {
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

        .hero-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(120% 90% at 50% 22%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%);
        }

        .hero-particle {
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
          background: linear-gradient(90deg,#C4B5FD 0%,#A78BFA 25%,#8B5CF6 50%,#C084FC 75%,#C4B5FD 100%);
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: heroTextShift 6s linear infinite;
          filter: drop-shadow(0 2px 18px rgba(139,92,246,0.35));
        }
        @keyframes heroTextShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 220% 50%; }
        }

        /* Search bar */
        .hero-search-wrap { position: relative; width: 100%; max-width: 560px; margin: 0 auto; }
        .hero-search-box {
          display: flex; align-items: center; gap: .75rem;
          width: 100%;
          padding: .85rem 1rem;
          border-radius: 9999px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 10px 40px -12px rgba(124,58,237,0.4);
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .hero-search-box:focus-within {
          border-color: rgba(167,139,250,0.6);
          box-shadow: 0 0 0 4px rgba(139,92,246,0.18), 0 10px 40px -12px rgba(124,58,237,0.5);
        }
        .hero-search-box svg.search-ico { color: rgba(196,181,253,0.8); flex-shrink: 0; }
        .hero-search-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #fff; font-size: .98rem;
        }
        .hero-search-input::placeholder { color: rgba(196,181,253,0.55); }

        .hero-search-clear {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 9999px; flex-shrink: 0;
          color: rgba(196,181,253,0.7); transition: background .2s ease, color .2s ease;
        }
        .hero-search-clear:hover { background: rgba(255,255,255,0.08); color: #fff; }

        .hero-search-results {
          position: absolute; top: calc(100% + .6rem); left: 0; right: 0;
          background: rgba(13,8,30,0.92);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.1rem;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 20px 50px -12px rgba(0,0,0,0.6);
          overflow: hidden; z-index: 30;
          max-height: 360px; overflow-y: auto;
        }
        .hero-result-item {
          display: flex; align-items: center; gap: .75rem;
          padding: .8rem 1rem; text-align: left; width: 100%;
          color: #ECE9F5; text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background .15s ease;
        }
        .hero-result-item:last-child { border-bottom: none; }
        .hero-result-item:hover { background: rgba(139,92,246,0.16); }
        .hero-result-ico {
          width: 34px; height: 34px; border-radius: .7rem; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(139,92,246,0.18); color: #c4b5fd;
        }
        .hero-result-ico svg { width: 17px; height: 17px; }
        .hero-result-title { font-size: .9rem; font-weight: 600; }
        .hero-result-cat { font-size: .72rem; color: rgba(196,181,253,0.6); }
        .hero-result-arrow { margin-left: auto; color: rgba(196,181,253,0.5); }
        .hero-result-empty { padding: 1.25rem 1rem; text-align: center; color: rgba(196,181,253,0.6); font-size: .85rem; }
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
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="hero-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.9)]" />
            Free Business Document Platform
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
        >
          <span className="text-white">Professional Business Documents.</span>{" "}
          <span className="hero-gradient-text">Made Simple.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-5 max-w-2xl text-[15px] text-violet-100/70 sm:text-[17px]"
        >
          Create invoices, quotations, GST invoices, purchase orders, delivery challans and more in seconds.
        </motion.p>

        {/* Search bar to find tools */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-9 w-full"
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

        {/* Gentle cue to scroll into the tools below */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 text-center text-[13px] text-violet-100/45"
        >
          Explore all tools below — invoices, calculators, GST utilities &amp; more.
        </motion.p>
      </div>
    </section>
  )
}
