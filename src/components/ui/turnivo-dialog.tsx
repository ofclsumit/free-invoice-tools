"use client"

import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock"

export interface TurnivoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
  showCloseButton?: boolean
  closeOnOutsideClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

export function TurnivoDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  maxWidth = "lg",
  showCloseButton = true,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  className = "",
}: TurnivoDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Manage Scroll Lock
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement
      lockBodyScroll()
    } else {
      unlockBodyScroll()
      previousActiveElement.current?.focus()
    }

    return () => {
      if (open) {
        unlockBodyScroll()
      }
    }
  }, [open])

  // Escape key handling
  useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, closeOnEscape, onOpenChange])

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }[maxWidth]

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "turnivo-dialog-title" : undefined}
          aria-describedby={description ? "turnivo-dialog-desc" : undefined}
        >
          {/* BACKDROP OVERLAY with Subtle Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (closeOnOutsideClick) onOpenChange(false)
            }}
            aria-hidden="true"
          />

          {/* DIALOG SURFACE */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 w-full ${maxWidthClasses} bg-white dark:bg-[#0f172a] border border-[#CBD5E1] dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col my-auto ${className}`}
          >
            {/* HEADER */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-white/10 shrink-0 bg-white dark:bg-[#0f172a]">
                <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                  {title && (
                    <h3
                      id="turnivo-dialog-title"
                      className="text-base sm:text-lg font-bold text-[#111827] dark:text-white truncate"
                    >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p
                      id="turnivo-dialog-desc"
                      className="text-xs text-slate-500 dark:text-slate-400 truncate"
                    >
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
                    aria-label="Close dialog"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* SCROLLABLE BODY */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
              {children}
            </div>

            {/* FOOTER */}
            {footer && (
              <div className="px-4 sm:px-6 py-3.5 border-t border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-black/20 shrink-0 flex items-center justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
