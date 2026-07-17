"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, LayoutTemplate } from "lucide-react"
import GlassInvoiceCard from "./GlassInvoiceCard"

export function HeroSection() {
  return (
    <section className="hero-root relative w-full overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-root {
          min-height: 70vh;
          padding-top: 7.5rem;
          padding-bottom: 0;
          background: linear-gradient(180deg,#05010C 0%,#0B0618 30%,#140A2E 70%,#1A1045 100%);
          color: #ECE9F5;
        }
        @media (max-width: 1023px) { .hero-root { min-height: 75vh; } }
        @media (max-width: 639px) { .hero-root { min-height: auto; padding-bottom: 3rem; } }

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

        .hero-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 9999px;
          border: 1px solid rgba(167,139,250,0.16);
          transform: translate(-50%,-50%) rotateX(58deg);
          transform-style: preserve-3d;
          pointer-events: none;
        }
        .hero-ring-1 {
          width: 360px;
          height: 360px;
          animation: heroRingSpin 26s linear infinite;
        }
        .hero-ring-2 {
          width: 520px;
          height: 520px;
          border-color: rgba(139,92,246,0.12);
          animation: heroRingSpinRev 34s linear infinite;
        }
        .hero-ring-3 {
          width: 680px;
          height: 680px;
          border-color: rgba(124,58,237,0.08);
          animation: heroRingSpin 44s linear infinite;
        }
        @keyframes heroRingSpin {
          from { transform: translate(-50%,-50%) rotateX(58deg) rotateZ(0deg); }
          to { transform: translate(-50%,-50%) rotateX(58deg) rotateZ(360deg); }
        }
        @keyframes heroRingSpinRev {
          from { transform: translate(-50%,-50%) rotateX(58deg) rotateZ(360deg); }
          to { transform: translate(-50%,-50%) rotateX(58deg) rotateZ(0deg); }
        }
        .hero-ring-dot {
          position: absolute;
          top: -4px;
          left: 50%;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #C4B5FD;
          box-shadow: 0 0 14px rgba(167,139,250,0.95), 0 0 4px rgba(167,139,250,0.7);
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

        .hero-float {
          animation: heroFloat 7s ease-in-out infinite;
        }
        @keyframes heroFloat {
          0%,100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-16px) rotate(2deg); }
        }

        .hero-card-glow {
          animation: heroCardGlow 5s ease-in-out infinite;
        }
        @keyframes heroCardGlow {
          0%,100% { opacity: 0.55; }
          50% { opacity: 0.9; }
        }

        .hero-btn-primary {
          background: linear-gradient(90deg,#8B5CF6,#A855F7,#7C3AED);
          box-shadow: 0 10px 30px -4px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .hero-btn-primary:hover {
          box-shadow: 0 14px 44px -2px rgba(167,139,250,0.75), inset 0 1px 0 rgba(255,255,255,0.5);
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

        .hero-fade {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 140px;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(26,16,69,0) 0%, rgba(11,6,24,0) 55%, rgba(5,1,12,0.9) 100%);
        }
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
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 pt-6 pb-16 text-center">
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

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/invoice-generator" className="group relative">
            <span className="absolute -inset-0.5 rounded-full bg-violet-600/40 blur-lg opacity-50 transition-opacity duration-300 group-hover:opacity-90 pointer-events-none" />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="hero-btn-primary relative flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white transition-all duration-300"
            >
              Create Free Invoice
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </motion.button>
          </Link>

          <Link href="/#tools">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="hero-btn-secondary flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white transition-all duration-300"
            >
              <LayoutTemplate size={18} className="text-violet-300" />
              Browse Templates
            </motion.button>
          </Link>
        </motion.div>

        {/* Center visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease: "easeOut" }}
          className="relative mt-12 flex w-full max-w-[540px] items-center justify-center"
        >
          {/* Orbital rings */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="hero-ring hero-ring-1"><span className="hero-ring-dot" /></div>
            <div className="hero-ring hero-ring-2"><span className="hero-ring-dot" style={{ background: "#A78BFA" }} /></div>
            <div className="hero-ring hero-ring-3"><span className="hero-ring-dot" style={{ background: "#8B5CF6" }} /></div>
          </div>

          {/* Soft purple glow behind card */}
          <div className="hero-card-glow pointer-events-none absolute h-[320px] w-[320px] rounded-full bg-violet-600/30 blur-3xl" />

          {/* Glass invoice card */}
          <div className="hero-float relative z-10">
            <GlassInvoiceCard />
          </div>
        </motion.div>
      </div>

      {/* Smooth fade into the Tools section */}
      <div className="hero-fade" />
    </section>
  )
}
