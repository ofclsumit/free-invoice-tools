"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface InlineLoaderProps {
  label?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function InlineLoader({
  label = "Loading...",
  size = "md",
  className = "",
}: InlineLoaderProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5 text-xs",
    md: "h-4 w-4 text-sm",
    lg: "h-5 w-5 text-base",
  }[size]

  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-2 text-muted-foreground font-medium",
        sizeClasses,
        className
      )}
    >
      <Loader2 className="animate-spin text-primary shrink-0" aria-hidden="true" />
      {label && <span>{label}</span>}
    </div>
  )
}
