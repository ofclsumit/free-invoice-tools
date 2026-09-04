"use client"

import React, { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { SWAPAD_CONFIG, isRouteEligibleForSwapad } from "@/lib/swapad/config"

interface SwapadAdProps {
  className?: string
}

export function SwapadAd({ className = "" }: SwapadAdProps) {
  const pathname = usePathname()
  const adContainerRef = useRef<HTMLDivElement>(null)
  const [isEligible, setIsEligible] = useState<boolean>(false)

  useEffect(() => {
    setIsEligible(isRouteEligibleForSwapad(pathname))
  }, [pathname])

  useEffect(() => {
    if (!isEligible || !SWAPAD_CONFIG.ENABLED) return

    const container = adContainerRef.current
    if (!container) return

    // Clear any previous ad script instance inside this container to prevent duplicate elements
    container.innerHTML = ""

    try {
      // Create the exact Swapad script element
      const script = document.createElement("script")
      script.src = SWAPAD_CONFIG.SCRIPT_URL
      script.setAttribute("data-swapboard", SWAPAD_CONFIG.SWAPBOARD_ID)
      script.async = true
      script.crossOrigin = "anonymous"

      // Handle loading failure gracefully without affecting the host application
      script.onerror = () => {
        // Silently handle adblock or network errors
      }

      container.appendChild(script)
    } catch {
      // Failsafe catch to ensure third-party scripts never crash React
    }

    return () => {
      if (container) {
        container.innerHTML = ""
      }
    }
  }, [isEligible, pathname])

  // Never render on excluded pages, during print, or if disabled
  if (!isEligible || !SWAPAD_CONFIG.ENABLED) {
    return null
  }

  return (
    <div
      aria-label="Advertisement"
      className={`no-print print:hidden w-full max-w-4xl mx-auto my-8 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-300 ${className}`}
    >
      <div
        ref={adContainerRef}
        className="w-full flex justify-center items-center min-h-[50px] max-w-full overflow-hidden"
      />
    </div>
  )
}
