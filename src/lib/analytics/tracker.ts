/**
 * TURNIVO — CENTRAL TELEMETRY & EVENT TRACKING SERVICE
 * 
 * Provides client-side methods to record tool usage, downloads, calculations,
 * and previews with idempotency, debouncing, and coarse device detection.
 */

import { getToolById } from "./tool-registry"

export type AnalyticsEventType =
  | "tool_open"
  | "calculate"
  | "preview"
  | "pdf_download"
  | "share"

export interface TrackEventOptions {
  toolId: string
  eventType: AnalyticsEventType
  downloadType?: string // e.g. "pdf", "print", "share"
  metadata?: Record<string, any>
  idempotencyKey?: string
}

// In-memory debounce cache to prevent rapid double-clicks from double-counting
const recentEventsCache = new Map<string, number>()
const DEBOUNCE_WINDOW_MS = 2500

/**
 * Gets or creates an anonymous session identifier for event grouping
 */
function getAnonymousSessionId(): string {
  if (typeof window === "undefined") return "server"
  try {
    let sid = window.sessionStorage.getItem("turnivo_sid")
    if (!sid) {
      sid = "s_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36)
      window.sessionStorage.setItem("turnivo_sid", sid)
    }
    return sid
  } catch {
    return "anon"
  }
}

/**
 * Coarse device type detection without invasive fingerprinting
 */
function getCoarseDeviceType(): "Mobile" | "Tablet" | "Desktop" {
  if (typeof window === "undefined") return "Desktop"
  const ua = navigator.userAgent.toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "Tablet"
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      navigator.userAgent
    ) ||
    window.innerWidth <= 768
  ) {
    return "Mobile"
  }
  return "Desktop"
}

/**
 * Core event tracking method
 */
export async function trackEvent({
  toolId,
  eventType,
  downloadType = "pdf",
  metadata,
  idempotencyKey,
}: TrackEventOptions): Promise<boolean> {
  if (typeof window === "undefined") return false

  // 1. Resolve canonical tool definition
  const tool = getToolById(toolId)
  if (!tool) {
    console.warn(`[Turnivo Analytics] Unrecognized tool ID: "${toolId}". Event discarded.`)
    return false
  }

  // 2. Debounce check: Prevent rapid duplicate clicks (e.g. double clicking "Download PDF")
  const debounceKey = `${tool.id}:${eventType}:${downloadType || ""}`
  const now = Date.now()
  const lastTime = recentEventsCache.get(debounceKey)
  if (lastTime && now - lastTime < DEBOUNCE_WINDOW_MS) {
    // Suppress rapid duplicate trigger
    return false
  }
  recentEventsCache.set(debounceKey, now)

  const finalIdempotencyKey =
    idempotencyKey || `${debounceKey}_${now}_${Math.random().toString(36).slice(2, 7)}`

  const payload = {
    toolId: tool.id,
    toolName: tool.name,
    category: tool.category,
    eventType,
    downloadType,
    deviceType: getCoarseDeviceType(),
    sessionId: getAnonymousSessionId(),
    idempotencyKey: finalIdempotencyKey,
    metadata,
  }

  try {
    const payloadStr = JSON.stringify(payload)

    // Use sendBeacon if available for non-blocking fire-and-forget
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payloadStr], { type: "application/json" })
      const sent = navigator.sendBeacon("/api/analytics/track", blob)
      if (sent) return true
    }

    // Fallback to fetch with keepalive
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payloadStr,
      keepalive: true,
    })

    return true
  } catch (err) {
    // Fail silently in client, never block user UX
    return false
  }
}

/**
 * Convenience helper: Track tool opened
 */
export function trackToolOpen(toolId: string) {
  return trackEvent({ toolId, eventType: "tool_open" })
}

/**
 * Convenience helper: Track calculation
 */
export function trackCalculation(toolId: string, metadata?: Record<string, any>) {
  return trackEvent({ toolId, eventType: "calculate", metadata })
}

/**
 * Convenience helper: Track preview viewed
 */
export function trackPreview(toolId: string, metadata?: Record<string, any>) {
  return trackEvent({ toolId, eventType: "preview", metadata })
}

/**
 * Convenience helper: Track PDF downloaded (ONLY called upon successful generation)
 */
export function trackPdfDownload(toolId: string, downloadType: string = "pdf") {
  return trackEvent({ toolId, eventType: "pdf_download", downloadType })
}

/**
 * Convenience helper: Track document shared
 */
export function trackShare(toolId: string, metadata?: Record<string, any>) {
  return trackEvent({ toolId, eventType: "share", metadata })
}
