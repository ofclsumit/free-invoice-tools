"use client"

import { useState, useRef, useCallback } from "react"
import { Check, QrCode, FileText, IndianRupee } from "lucide-react"

export default function GlassInvoiceCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState({ x: 50, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Throttle mouse move via rAF to keep 60fps and avoid excessive re-renders
  const frame = useRef<number | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      // Max 5deg rotation
      const rotY = (px - 0.5) * 10 // -5..5
      const rotX = (0.5 - py) * 10 // -5..5
      setTilt({ x: rotX, y: rotY })
      setGlow({ x: px * 100, y: py * 100 })
      frame.current = null
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
    setGlow({ x: 50, y: 0 })
  }, [])

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ perspective: 1200 }}
    >
      {/* Purple glow that follows cursor */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-[36px] opacity-70 blur-3xl transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle at " +
            glow.x +
            "% " +
            glow.y +
            "%, rgba(167,139,250,0.55) 0%, rgba(124,58,237,0.25) 35%, rgba(10,6,30,0) 70%)",
        }}
      />

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="invoice-card-float relative w-[300px] cursor-pointer select-none touch-none sm:w-[330px] md:w-[370px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.06] p-6 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25),0_30px_60px_rgba(0,0,0,0.55),0_0_50px_rgba(139,92,246,0.18)] backdrop-blur-2xl sm:p-7 md:p-8"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
            transition: "transform 0.18s cubic-bezier(0.25,1,0.5,1)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Cursor-following soft reflection */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(420px circle at " +
                glow.x +
                "% " +
                glow.y +
                "%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 60%)",
            }}
          />
          {/* Static top sheen */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

          {/* Header: Company logo + Invoice title */}
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_4px_14px_rgba(124,58,237,0.5)]">
                <FileText size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] font-bold leading-tight text-white">QuoteFlow Inc.</p>
                <p className="text-[10px] text-slate-400">GST: 27AAPFQ1234A1Z5</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                INVOICE
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">#INV-2026-0917</p>
            </div>
          </div>

          <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          {/* Item table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Item</span>
              <span>Amount</span>
            </div>
            {[
              { name: "Brand Identity Design", sub: "Logo & Guidelines", amt: "₹12,500" },
              { name: "Web Development", sub: "Landing Page Build", amt: "₹28,000" },
              { name: "Monthly Retainer", sub: "Support & SEO", amt: "₹9,500" },
            ].map((row) => (
              <div
                key={row.name}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5"
              >
                <div>
                  <p className="text-[12px] font-semibold text-slate-100">{row.name}</p>
                  <p className="text-[10px] text-slate-400">{row.sub}</p>
                </div>
                <span className="font-mono text-[12px] font-medium text-slate-200">{row.amt}</span>
              </div>
            ))}
          </div>

          <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          {/* Total + Paid + GST + QR */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Due</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl">
                ₹50,000
              </p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                <Check size={11} strokeWidth={3} /> PAID
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              {/* QR Code */}
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/90 shadow-lg">
                <QrCode size={40} className="text-slate-900" />
              </div>
              {/* GST badge */}
              <div className="rounded-md border border-violet-400/30 bg-violet-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300">
                GST
              </div>
            </div>
          </div>

          {/* Currency row */}
          <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-white/[0.06] pt-3 text-[10px] text-slate-400">
            <IndianRupee size={12} className="text-violet-300" />
            Currency: INR · Taxable as per CGST/SGST
          </div>
        </div>
      </div>

      <style jsx>{`
        .invoice-card-float {
          animation: invoiceFloat 7s ease-in-out infinite,
            invoiceGlow 5s ease-in-out infinite;
        }
        @keyframes invoiceFloat {
          0%,
          100% {
            transform: translateY(0) rotate(-1.5deg);
          }
          50% {
            transform: translateY(-14px) rotate(1.5deg);
          }
        }
        @keyframes invoiceGlow {
          0%,
          100% {
            filter: drop-shadow(0 0 18px rgba(139, 92, 246, 0.35));
          }
          50% {
            filter: drop-shadow(0 0 34px rgba(167, 139, 250, 0.6));
          }
        }
      `}</style>
    </div>
  )
}
