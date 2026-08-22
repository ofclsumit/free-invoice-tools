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
      <div className="font-sans w-full text-foreground">
        {children}
      </div>
    </>
  )
}
