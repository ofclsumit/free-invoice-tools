"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

function RouteLoadingBar() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    setLoading(true)
    setProgress(20)
    const t1 = setTimeout(() => setProgress(60), 100)
    const t2 = setTimeout(() => setProgress(85), 300)
    const t3 = setTimeout(() => { setProgress(100); setLoading(false) }, 600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] h-[3px] overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#3b82f6] shadow-[0_0_8px_rgba(139,92,246,0.5)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <RouteLoadingBar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
          exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
