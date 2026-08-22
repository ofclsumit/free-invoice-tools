"use client"

import { useEffect, useRef, useState, useCallback } from "react"

const DRAFT_PREFIX = "turnivo_draft_"
const memoryDrafts = new Map<string, unknown>()

/**
 * Save draft data to session storage and memory
 */
export function saveDraft<T>(docType: string, data: T): void {
  if (!docType || !data) return
  memoryDrafts.set(docType, data)
  try {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DRAFT_PREFIX + docType, JSON.stringify(data))
    }
  } catch (err) {
    console.warn("Could not save draft to sessionStorage:", err)
  }
}

/**
 * Load draft data from session storage or memory
 */
export function loadDraft<T>(docType: string): T | null {
  if (!docType) return null
  const mem = memoryDrafts.get(docType)
  if (mem) return mem as T
  try {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem(DRAFT_PREFIX + docType)
      if (raw) {
        const parsed = JSON.parse(raw)
        memoryDrafts.set(docType, parsed)
        return parsed as T
      }
    }
  } catch (err) {
    console.warn("Could not load draft from sessionStorage:", err)
  }
  return null
}

/**
 * Clear draft for a specific document type
 */
export function clearDraft(docType: string): void {
  if (!docType) return
  memoryDrafts.delete(docType)
  try {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(DRAFT_PREFIX + docType)
    }
  } catch {}
}

/**
 * React hook to auto-save and auto-restore draft state across route navigation
 */
export function useAutoSaveDraft<T extends Record<string, any>>(
  docType: string,
  watchedValues: T,
  restoreCallback?: (draft: T) => void
) {
  const [isRestored, setIsRestored] = useState(false)
  const isInitialMount = useRef(true)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // 1. On Mount: Restore draft if present
  useEffect(() => {
    const draft = loadDraft<T>(docType)
    if (draft && restoreCallback) {
      try {
        restoreCallback(draft)
      } catch (err) {
        console.warn("Failed to restore draft:", err)
      }
    }
    setIsRestored(true)
  }, [docType]) // eslint-disable-line react-hooks/exhaustive-deps

  // 2. On change: Debounce auto-save active values
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (!isRestored) return

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      if (watchedValues && Object.keys(watchedValues).length > 0) {
        saveDraft(docType, watchedValues)
      }
    }, 400)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [docType, watchedValues, isRestored])

  const clearCurrentDraft = useCallback(() => {
    clearDraft(docType)
  }, [docType])

  const saveImmediately = useCallback(
    (values?: T) => {
      saveDraft(docType, values || watchedValues)
    },
    [docType, watchedValues]
  )

  return { isRestored, clearCurrentDraft, saveImmediately }
}
