"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "shimmer rounded-md bg-[#EDEDED] dark:bg-[#1a202c]",
        className
      )}
      {...props}
    />
  )
}

export function SkeletonHeading({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-7 w-48 rounded-lg", className)}
      {...props}
    />
  )
}

export function SkeletonText({
  lines = 3,
  className,
  ...props
}: SkeletonProps & { lines?: number }) {
  const widths = ["w-full", "w-[88%]", "w-[65%]", "w-[78%]", "w-[50%]"]
  return (
    <div aria-hidden="true" className={cn("space-y-2.5", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5 rounded", widths[i % widths.length])}
        />
      ))}
    </div>
  )
}

export function SkeletonInput({
  label = true,
  className,
  ...props
}: SkeletonProps & { label?: boolean }) {
  return (
    <div aria-hidden="true" className={cn("space-y-1.5", className)} {...props}>
      {label && <Skeleton className="h-3.5 w-24 rounded" />}
      <Skeleton className="h-10 w-full rounded-lg border border-border/40" />
    </div>
  )
}

export function SkeletonButton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-10 w-32 rounded-lg", className)}
      {...props}
    />
  )
}

export function SkeletonCard({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "p-6 rounded-xl border border-border/60 bg-card/60 space-y-4",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <SkeletonText lines={2} />
        </>
      )}
    </div>
  )
}

export function SkeletonTable({
  rows = 4,
  columns = 4,
  className,
  ...props
}: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-xl border border-border/60 overflow-hidden bg-card/50",
        className
      )}
      {...props}
    >
      {/* Table Header */}
      <div className="bg-muted/40 px-4 py-3 border-b border-border/50 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20 rounded" />
        ))}
      </div>
      {/* Table Body */}
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="px-4 py-3.5 grid gap-4 items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn("h-3.5 rounded", c === 0 ? "w-32" : "w-16")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonDocumentForm({ className }: { className?: string }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading document generator form"
      className={cn("max-w-6xl mx-auto space-y-8 p-4 sm:p-6", className)}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Two columns: Seller & Customer info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard className="space-y-4">
          <Skeleton className="h-5 w-40 rounded" />
          <div className="space-y-3">
            <SkeletonInput />
            <SkeletonInput />
            <div className="grid grid-cols-2 gap-3">
              <SkeletonInput />
              <SkeletonInput />
            </div>
          </div>
        </SkeletonCard>
        <SkeletonCard className="space-y-4">
          <Skeleton className="h-5 w-40 rounded" />
          <div className="space-y-3">
            <SkeletonInput />
            <SkeletonInput />
            <div className="grid grid-cols-2 gap-3">
              <SkeletonInput />
              <SkeletonInput />
            </div>
          </div>
        </SkeletonCard>
      </div>

      {/* Items table skeleton */}
      <SkeletonCard className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <SkeletonTable rows={3} columns={5} />
      </SkeletonCard>

      {/* Bottom summary and action */}
      <div className="flex justify-end">
        <div className="w-full max-w-sm space-y-3 p-4 rounded-xl border border-border/50 bg-card/40">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="flex justify-between pt-2 border-t border-border/60">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-6 w-32 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
