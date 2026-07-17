"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import {
  IndianRupee,
  QrCode,
  BadgePercent,
  CheckCircle2,
} from "lucide-react"

const rows = [
  { item: "Website Design", qty: 1, price: 14999 },
  { item: "Dev Services", qty: 2, price: 29999 },
  { item: "Hosting Setup", qty: 1, price: 4999 },
]

const total = rows.reduce((s, r) => s + r.qty * r.price, 0)

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}

export function GlassDocument() {
  const floatRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-2xl bg-purple-500/10 blur-[60px] scale-110 animate-pulse-slow" />

      <motion.div
        ref={floatRef}
        className="relative w-[200px] sm:w-[260px] aspect-[3/4] rounded-2xl overflow-hidden cursor-default select-none"
        style={{
          backdropFilter: "blur(24px) saturate(1.8)",
          WebkitBackdropFilter: "blur(24px) saturate(1.8)",
          background:
            "linear-gradient(145deg, rgba(180, 140, 255, 0.25) 0%, rgba(100, 60, 200, 0.15) 40%, rgba(60, 30, 120, 0.2) 100%)",
          border: "1px solid rgba(200, 170, 255, 0.3)",
          boxShadow:
            "0 0 40px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(200, 170, 255, 0.15)",
        }}
        animate={{
          y: [0, -8, 0],
          rotateX: [2, -1, 2],
          rotateY: [-3, 3, -3],
        }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotateX: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotateY: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        {/* Specular highlight */}
        <div
          className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(200,170,255,0.05) 100%)",
          }}
        />

        {/* Metallic edge shine */}
        <div
          className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
          style={{
            boxShadow:
              "inset 0.5px 0.5px 0 rgba(255,255,255,0.4), inset -0.5px -0.5px 0 rgba(200,170,255,0.2)",
          }}
        />

        {/* Content */}
        <div className="relative z-20 p-4 sm:p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[8px] sm:text-[10px] font-bold shadow-lg shadow-purple-500/30">
                Q
              </div>
              <span className="text-white/60 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase">
                Invoice
              </span>
            </div>
            <BadgePercent className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400/70" />
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent mb-3" />

          {/* Table header */}
          <div className="flex text-[7px] sm:text-[8px] text-white/40 font-medium uppercase tracking-wider mb-1.5">
            <span className="flex-1">Item</span>
            <span className="w-6 sm:w-8 text-right">Qty</span>
            <span className="w-12 sm:w-16 text-right">Price</span>
          </div>

          {/* Table rows */}
          <div className="flex-1 space-y-1">
            {rows.map((r, i) => (
              <div
                key={i}
                className="flex items-center text-white/80 text-[8px] sm:text-[10px]"
              >
                <span className="flex-1 truncate">{r.item}</span>
                <span className="w-6 sm:w-8 text-right text-white/50">
                  {r.qty}
                </span>
                <span className="w-12 sm:w-16 text-right font-medium">
                  {formatPrice(r.qty * r.price)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent my-2" />

          {/* Total */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] sm:text-[11px] font-bold text-white/90">
              Total
            </span>
            <span className="text-[11px] sm:text-[13px] font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
              {formatPrice(total)}
            </span>
          </div>

          {/* Footer icons */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                <IndianRupee className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-300/70" />
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                <QrCode className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-300/70" />
              </div>
              <div className="px-1.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 flex items-center gap-0.5">
                <BadgePercent className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-purple-300/80" />
                <span className="text-[6px] sm:text-[7px] font-bold text-purple-300/80">
                  GST
                </span>
              </div>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400/80" />
          </div>
        </div>

        {/* Bottom neon glow */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 rounded-full blur-[12px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(168,85,247,0.4) 0%, transparent 70%)",
          }}
        />
      </motion.div>
    </div>
  )
}
