"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        }}
        exit={{
          opacity: 0,
          y: -10,
          filter: "blur(6px)",
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {/* Branded sweep overlay that animates on every route change */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[100]"
          initial={{ scaleY: 1, transformOrigin: "top" }}
          animate={{ scaleY: 0, transformOrigin: "bottom", transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } }}
          style={{
            background:
              "linear-gradient(135deg, #8B5CF6 0%, #6366F1 45%, #A855F7 100%)",
          }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
