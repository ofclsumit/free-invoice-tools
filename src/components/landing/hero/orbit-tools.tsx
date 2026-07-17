"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import {
  FileText,
  Sparkles,
  BadgePercent,
  ShoppingCart,
  Truck,
  Receipt,
  CreditCard,
  File,
  Image,
  QrCode,
  Scan,
  Calculator,
  FileCheck,
  NotebookText,
} from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

interface ToolInfo {
  name: string
  Icon: React.ElementType
  route: string
}

const tools: ToolInfo[] = [
  { name: "Invoice", Icon: FileText, route: "/invoice-generator" },
  { name: "Quotation", Icon: Sparkles, route: "/quotation-generator" },
  { name: "GST", Icon: BadgePercent, route: "/gst-calculator" },
  { name: "Purchase Order", Icon: ShoppingCart, route: "/purchase-order" },
  { name: "Delivery Challan", Icon: Truck, route: "/delivery-challan" },
  { name: "Receipt", Icon: Receipt, route: "/payment-receipt" },
  { name: "Salary Slip", Icon: CreditCard, route: "/salary-slip" },
  { name: "PDF", Icon: File, route: "/invoice-generator" },
  { name: "Image to PDF", Icon: Image, route: "#" },
  { name: "QR Code", Icon: QrCode, route: "#" },
  { name: "Barcode", Icon: Scan, route: "#" },
  { name: "Tax Calculator", Icon: Calculator, route: "/gst-calculator" },
  { name: "Estimate", Icon: FileCheck, route: "/estimate-generator" },
  { name: "Bill", Icon: NotebookText, route: "/proforma-invoice" },
]

function hashAngle(name: string, offset: number): number {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0
  }
  return ((Math.abs(h) + offset * 137) % 360)
}

const RINGS = [
  { radius: 280, count: 5 },  // outer ring
  { radius: 210, count: 5 },  // middle ring
  { radius: 150, count: 4 },  // inner ring
]

function getToolAnimData(index: number) {
  let ringIdx = 0
  let posInRing = index
  for (let r = 0; r < RINGS.length; r++) {
    if (posInRing < RINGS[r].count) {
      ringIdx = r
      break
    }
    posInRing -= RINGS[r].count
  }
  if (ringIdx >= RINGS.length) {
    ringIdx = RINGS.length - 1
    posInRing = posInRing % RINGS[ringIdx].count
  }

  const ring = RINGS[ringIdx]
  const orbitAngle = (posInRing / ring.count) * 360 + ringIdx * 15
  const orbitRadius = ring.radius

  const scatterAngle = hashAngle(tools[index].name, index * 73)
  const scatterRadius = 400 + (index % 3) * 120

  return { orbitAngle, orbitRadius, scatterAngle, scatterRadius, ringIdx }
}

export function OrbitTools() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const toolRefs = useRef<(HTMLDivElement | null)[]>([])
  const lineRefs = useRef<(SVGPathElement | null)[]>([])
  useEffect(() => {
    const proxy = { t: 0 }

    function updatePositions(t: number) {
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

      tools.forEach((_, i) => {
        const el = toolRefs.current[i]
        const line = lineRefs.current[i]
        if (!el) return

        const { orbitAngle, orbitRadius, scatterAngle, scatterRadius } =
          getToolAnimData(i)

        const angle = scatterAngle + (orbitAngle - scatterAngle) * eased
        const radius =
          scatterRadius + (orbitRadius - scatterRadius) * eased

        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius

        el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${1 - eased * 0.15})`
        el.style.opacity = `${Math.min(1, eased * 2 + 0.3)}`

        if (line) {
          const cx1 = x * 0.2
          const cy1 = y * 0.6
          const cx2 = x * 0.7
          const cy2 = y * 0.9
          line.setAttribute(
            "d",
            `M 0 0 C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x} ${y}`
          )
          line.style.opacity = `${Math.max(0, (t - 0.3) * 1.5)}`
        }
      })
    }

    const ctx = gsap.context(() => {
      gsap.to(proxy, {
        t: 1,
        ease: "none",
        onUpdate: () => updatePositions(proxy.t),
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      })
    }, sectionRef)

    updatePositions(0)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <div
      ref={sectionRef}
      className="absolute inset-0 pointer-events-none"
      style={{ perspective: "1000px" }}
    >
      {/* SVG connection lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
        style={{ transform: "translate(50%, 50%)" }}
      >
        <defs>
          <linearGradient id="orbit-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#818CF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {tools.map((_, i) => (
          <path
            key={i}
            ref={(el) => { lineRefs.current[i] = el }}
            fill="none"
            stroke="url(#orbit-glow)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ opacity: 0, transition: "opacity 0.1s" }}
          />
        ))}
      </svg>

      {/* Tool icons */}
      {tools.map((tool, i) => {
        const { orbitAngle, orbitRadius, scatterAngle, scatterRadius } =
          getToolAnimData(i)

        const scatterRad = (scatterAngle * Math.PI) / 180
        const sx = Math.cos(scatterRad) * scatterRadius
        const sy = Math.sin(scatterRad) * scatterRadius

        return (
          <div
            key={i}
            ref={(el) => { toolRefs.current[i] = el }}
            className="absolute top-1/2 left-1/2 z-10 pointer-events-auto"
            style={{
              transform: `translate(calc(-50% + ${sx}px), calc(-50% + ${sy}px))`,
              opacity: 0.3,
            }}
          >
            <Link href={tool.route}>
              <motion.div
                className="group relative"
                whileHover={{ scale: 1.1 }}
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(180,140,255,0.2) 0%, rgba(100,60,200,0.12) 100%)",
                    backdropFilter: "blur(12px) saturate(1.4)",
                    WebkitBackdropFilter: "blur(12px) saturate(1.4)",
                    border: "1px solid rgba(200,170,255,0.2)",
                    boxShadow:
                      "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  <tool.Icon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-300/80 group-hover:text-purple-200 transition-colors" />
                </div>

                {/* Hover glow */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow:
                      "0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.2)",
                  }}
                />

                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  <div className="px-2 py-1 rounded-md text-[10px] font-medium text-white/90"
                    style={{
                      background: "rgba(30,10,60,0.9)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(200,170,255,0.2)",
                    }}
                  >
                    {tool.name}
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
