"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ButtonLoaderProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
  className?: string
  spinnerClassName?: string
}

export function ButtonLoader({
  isLoading,
  loadingText,
  children,
  className = "",
  spinnerClassName = "",
}: ButtonLoaderProps) {
  if (!isLoading) {
    return <>{children}</>
  }

  return (
    <span className={cn("inline-flex items-center justify-center gap-2", className)}>
      <Loader2
        className={cn("h-4 w-4 animate-spin text-current shrink-0", spinnerClassName)}
        aria-hidden="true"
      />
      <span>{loadingText || children}</span>
    </span>
  )
}
