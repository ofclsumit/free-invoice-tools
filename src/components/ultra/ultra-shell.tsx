"use client"

import type { ReactNode } from "react"

export function UltraShell({ children }: { children: ReactNode }) {
  return (
    <>
      <svg style={{display:"none"}} aria-hidden="true">
        <defs>
          <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise"/>
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred"/>
            <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
      </svg>
      <div
        className="font-['Inter'] min-h-screen text-white overflow-hidden relative"
        style={{
          background: `
            radial-gradient(ellipse at 20% 10%, rgba(139,92,246,0.55) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 0%, rgba(59,130,246,0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 85%, rgba(16,185,129,0.35) 0%, transparent 50%),
            linear-gradient(160deg, #0f0a2a 0%, #0d1b3e 40%, #0a1628 100%)
          `,
          animation: "hue-shift 10s ease-in-out infinite alternate"
        }}
      >
        <div className="px-5 py-10 max-w-[920px] mx-auto">
          {children}
        </div>
      </div>
    </>
  )
}
