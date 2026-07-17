"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useRef, useCallback } from "react"
import { ArrowRight, LayoutTemplate } from "lucide-react"
import GlassInvoiceCard from "./GlassInvoiceCard"

const stats = [
  { value: "25+", label: "Business Tools" },
  { value: "150+", label: "Templates" },
  { value: "100%", label: "Free" },
  { value: "GST", label: "Ready" },
]

const noiseDataUri =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

export function HeroSection() {
  const [pointer, setPointer] = useState({ x: 50, y: 30 })
  const frame = useRef<number | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      setPointer({ x: px, y: py })
      frame.current = null
    })
  }, [])

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="hero-root relative w-full overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-root {
          min-height: 70vh;
          padding-top: 8.5rem;
          padding-bottom: 2.5rem;
          display: flex;
          align-items: center;
          background: linear-gradient(180deg,#05010C 0%,#0B0618 35%,#120A28 70%,#170F3C 100%);
          color: #fff;
        }
        @media (max-width: 1023px) { .hero-root { min-height: 75vh; } }
        @media (max-width: 639px) { .hero-root { min-height: auto; padding-top: 7rem; padding-bottom: 2rem; } }

        /* Large radial glow */
        .hero-radial {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 1200px; height: 900px;
          max-width: 170vw;
          background: radial-gradient(ellipse at 50% 35%, rgba(139,92,246,0.32) 0%, rgba(124,58,237,0.12) 38%, rgba(7,4,20,0) 68%);
          filter: blur(8px);
          pointer-events: none;
          animation: heroGlowBreathe 9s ease-in-out infinite;
        }
        @keyframes heroGlowBreathe {
          0%,100% { opacity: 0.85; }
          50% { opacity: 1; }
        }

        /* Cursor-reactive glow */
        .hero-cursor-glow {
          position: absolute; inset: 0;
          pointer-events: none;
          background: radial-gradient(600px circle at var(--cx,50%) var(--cy,30%), rgba(167,139,250,0.18) 0%, rgba(124,58,237,0) 55%);
          transition: background 0.2s ease-out;
        }

        /* Noise texture */
        .hero-noise {
          position: absolute; inset: 0;
          pointer-events: none;
          opacity: 0.04;
          mix-blend-mode: overlay;
        }

        /* Vignette */
        .hero-vignette {
          position: absolute; inset: 0;
          pointer-events: none;
          background: radial-gradient(120% 90% at 50% 28%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.55) 100%);
        }

        .hero-particle {
          position: absolute;
          border-radius: 9999px;
          background: rgba(196,181,253,0.85);
          box-shadow: 0 0 8px rgba(167,139,250,0.85);
          pointer-events: none;
          animation: heroParticleFloat 16s ease-in-out infinite;
        }
        @keyframes heroParticleFloat {
          0%,100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-26px) translateX(12px); opacity: 0.6; }
        }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border-radius: 9999px;
          padding: 0.4rem 1rem;
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
          color: #d8d2f0;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .hero-gradient-text {
          background: linear-gradient(90deg,#C4B5FD 0%,#A78BFA 25%,#8B5CF6 50%,#C084FC 75%,#C4B5FD 100%);
          background-size: 220% 100%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: heroTextShift 6s linear infinite;
        }
        @keyframes heroTextShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 220% 50%; }
        }

        .hero-btn-primary {
          background: linear-gradient(90deg,#8B5CF6,#A855F7,#7C3AED);
          box-shadow: 0 10px 30px -4px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .hero-btn-primary:hover {
          box-shadow: 0 16px 46px -2px rgba(167,139,250,0.8), inset 0 1px 0 rgba(255,255,255,0.5);
        }

        .hero-btn-secondary {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.16);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .hero-btn-secondary:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.3);
        }

        .hero-stat-card {
          border-radius: 1rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.035);
          backdrop-filter: blur(8px);
          padding: 1rem 1.25rem;
        }

        .hero-fade {
          position: absolute; left: 0; right: 0; bottom: 0;
          height: 130px; pointer-events: none;
          background: linear-gradient(180deg, rgba(23,15,60,0) 0%, rgba(11,6,24,0) 55%, rgba(5,1,12,0.95) 100%);
        }
      ` }} />

      {/* Background layers */}
      <div className="hero-radial" />
      <div
        className="hero-cursor-glow"
        style={{ ["--cx" as any]: `${pointer.x}%`, ["--cy" as any]: `${pointer.y}%` }}
      />
      <div className="hero-noise" style={{ backgroundImage: noiseDataUri }} />
      <div className="hero-vignette" />

      {/* Particles */}
      <div className="hero-particle" style={{ top: "20%", left: "14%", width: 4, height: 4, animationDelay: "0s" }} />
      <div className="hero-particle" style={{ top: "32%", right: "13%", width: 6, height: 6, animationDelay: "-4s" }} />
      <div className="hero-particle" style={{ top: "60%", left: "9%", width: 3, height: 3, animationDelay: "-7s" }} />
      <div className="hero-particle" style={{ bottom: "24%", right: "16%", width: 5, height: 5, animationDelay: "-10s" }} />
      <div className="hero-particle" style={{ top: "46%", left: "22%", width: 3, height: 3, animationDelay: "-5.5s" }} />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="hero-badge">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.9)]" />
            Free Business Document Platform
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08 }}
          className="mt-7 max-w-3xl text-4xl font-extrabold leading-[1.18] tracking-tight sm:text-5xl md:text-6xl"
        >
          <span className="text-white">Professional Business Documents.</span>{" "}
          <span className="hero-gradient-text">Made Simple.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18 }}
          className="mt-5 max-w-[650px] text-[15px] leading-relaxed text-slate-400 sm:text-[17px]"
        >
          Create invoices, quotations, GST invoices, purchase orders and more in seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28 }}
          className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link href="/invoice-generator" className="group relative">
            <span className="absolute -inset-0.5 rounded-full bg-violet-600/40 blur-lg opacity-50 transition-opacity duration-300 group-hover:opacity-90 pointer-events-none" />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="hero-btn-primary relative flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold text-white transition-all duration-300"
            >
              Start Creating
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </motion.button>
          </Link>

          <Link href="/invoice-generator">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="hero-btn-secondary flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold text-white transition-all duration-300"
            >
              <LayoutTemplate size={18} className="text-violet-300" />
              Browse Templates
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="hero-stat-card">
              <p className="font-display text-xl font-extrabold text-white sm:text-2xl">{s.value}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Center visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.45, ease: "easeOut" }}
          className="relative mt-14 flex w-full items-center justify-center"
        >
          <GlassInvoiceCard />
        </motion.div>
      </div>

      {/* Fade into tools */}
      <div className="hero-fade" />
    </section>
  )
}
