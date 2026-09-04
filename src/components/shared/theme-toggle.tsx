"use client"

import React, { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const current = resolvedTheme || theme || "light"
    const nextTheme = current === "dark" ? "light" : "dark"

    // Check if View Transition API is supported and motion is not reduced
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!document.startViewTransition || isReduced) {
      setTheme(nextTheme)
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme)
    })

    transition.ready.then(() => {
      const isGoingDark = nextTheme === "dark"
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      document.documentElement.animate(
        {
          clipPath: isGoingDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 420,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: isGoingDark
            ? "::view-transition-new(root)"
            : "::view-transition-old(root)",
        }
      )
    })
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        aria-label="Toggle theme"
      >
        <span className="h-4 w-4" />
      </Button>
    )
  }

  const isDark = (resolvedTheme || theme) === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 relative overflow-hidden rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      onClick={handleToggle}
      aria-label="Toggle color theme"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <Sun
        className={`h-4 w-4 text-amber-500 transition-all duration-300 transform ${
          isDark
            ? "-rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 text-violet-400 transition-all duration-300 transform ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
      />
    </Button>
  )
}
