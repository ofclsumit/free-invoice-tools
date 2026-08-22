"use client"

import React, { useEffect, useState, useRef, Suspense } from "react"
import { usePathname } from "next/navigation"

interface TopLoadingBarProps {
  isLoading?: boolean
  className?: string
}

function TopLoadingBarInner({ isLoading, className = "" }: TopLoadingBarProps) {
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const isFirstMount = useRef(true)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  // Automatic trigger on route pathname changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    clearTimers()
    setVisible(true)
    setActive(true)
    setProgress(20)

    const t1 = setTimeout(() => setProgress(65), 70)
    const t2 = setTimeout(() => setProgress(90), 180)
    const t3 = setTimeout(() => setProgress(100), 350)
    const t4 = setTimeout(() => {
      setVisible(false)
      setActive(false)
      setProgress(0)
    }, 500)

    timersRef.current = [t1, t2, t3, t4]

    return clearTimers
  }, [pathname])

  // Explicit prop control
  useEffect(() => {
    if (isLoading === undefined) return
    clearTimers()

    if (isLoading) {
      setVisible(true)
      setActive(true)
      setProgress(25)
      const t1 = setTimeout(() => setProgress(75), 150)
      const t2 = setTimeout(() => setProgress(90), 400)
      timersRef.current = [t1, t2]
    } else if (active) {
      setProgress(100)
      const t = setTimeout(() => {
        setVisible(false)
        setActive(false)
        setProgress(0)
      }, 250)
      timersRef.current = [t]
    }
  }, [isLoading])

  if (!visible) return null

  return (
    <div
      role="progressbar"
      aria-label="Navigation progress"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`fixed top-0 left-0 right-0 z-[999999] h-[3px] w-full pointer-events-none overflow-hidden bg-transparent ${className}`}
    >
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(139,92,246,0.55)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: "width, opacity",
          transitionDuration: progress === 100 ? "300ms" : "200ms",
        }}
      />
    </div>
  )
}

export function TopLoadingBar(props: TopLoadingBarProps) {
  return (
    <Suspense fallback={null}>
      <TopLoadingBarInner {...props} />
    </Suspense>
  )
}
