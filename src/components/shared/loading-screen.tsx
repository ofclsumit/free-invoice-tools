"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setMounted(true)
    setProgress(20)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + (100 - prev) * 0.15
      })
    }, 150)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (!mounted || typeof window === "undefined" || !document.body) {
    return null
  }

  return createPortal(
    <div className="fixed top-0 left-0 right-0 z-[99999] h-[3px] w-full bg-black/[0.05] dark:bg-white/[0.05] overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#3b82f6] shadow-[0_0_8px_rgba(139,92,246,0.5)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>,
    document.body
  )
}
