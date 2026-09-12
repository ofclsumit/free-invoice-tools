"use client"

import { useEffect, useRef } from "react"
import { trackToolOpen } from "@/lib/analytics/tracker"

/**
 * Hook to automatically record a tool_open event when a tool page mounts.
 * Runs strictly once per tool session mount.
 */
export function useToolTracking(toolId: string) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (!trackedRef.current && toolId) {
      trackedRef.current = true
      trackToolOpen(toolId)
    }
  }, [toolId])
}
