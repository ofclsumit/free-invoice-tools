"use client"

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface FullScreenLoaderProps {
  message?: string
  delayMs?: number // Threshold delay to prevent flashing for ultra-fast operations (default: 150ms)
  className?: string
}

export function FullScreenLoader({
  message = "Loading...",
  delayMs = 150,
  className = "",
}: FullScreenLoaderProps) {
  const [mounted, setMounted] = useState(false)
  const [show, setShow] = useState(delayMs === 0)

  useEffect(() => {
    setMounted(true)
    if (delayMs > 0) {
      const timer = setTimeout(() => setShow(true), delayMs)
      return () => clearTimeout(timer)
    }
  }, [delayMs])

  if (!mounted || !show || typeof window === "undefined" || !document.body) {
    return null
  }

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white/95 dark:bg-[#07090e]/95 backdrop-blur-md transition-opacity duration-200 ${className}`}
    >
      <div className="flex flex-col items-center gap-5 text-center select-none px-6">
        {/* Centered TURNIVO brand wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.35)]">
            <img
              src="/logo.png"
              alt="TURNIVO"
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="brand-wordmark brand-wordmark-theme text-[1.4rem] tracking-tight">
            TURNIVO
          </span>
        </div>

        {/* Minimal horizontal indeterminate loading bar */}
        <div className="w-44 h-[3px] bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-full animate-indeterminate shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
        </div>

        {/* Optional subtle status message */}
        {message && (
          <p className="text-xs font-medium text-muted-foreground tracking-wide -mt-1">
            {message}
          </p>
        )}
      </div>
    </div>,
    document.body
  )
}
