import React from "react"

export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-[920px] mx-auto px-5 py-10 flex flex-col items-center animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center mb-10 w-full flex flex-col items-center">
        <div className="h-4 w-24 bg-white/10 dark:bg-white/10 bg-slate-200 rounded-full mb-3" />
        <div className="h-12 w-64 bg-white/15 dark:bg-white/15 bg-slate-300 rounded-xl mb-4" />
        <div className="h-4 w-80 bg-white/10 dark:bg-white/10 bg-slate-200 rounded-md" />
      </div>

      {/* Two Column Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        {/* Left Card: Input Skeleton */}
        <div className="relative rounded-[1.75rem] overflow-hidden border border-white/[0.08] bg-[#0f111a]/40 p-[1.85rem] h-[400px] flex flex-col gap-6"
             style={{
               boxShadow: "0 0 0 1px rgba(255,255,255,.08), 0 8px 32px rgba(0,0,0,.3)"
             }}>
          <div className="flex items-center gap-2">
            <div className="w-[3px] h-[1.05rem] bg-gradient-to-b from-[#a78bfa] to-[#60a5fa] rounded-full" />
            <div className="h-5 w-24 bg-white/15 rounded-md" />
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-white/10 rounded" />
              <div className="h-10 w-full bg-white/10 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-white/10 rounded" />
              <div className="h-10 w-full bg-white/10 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="h-10 w-full bg-white/10 rounded-xl" />
            </div>
          </div>
          <div className="mt-auto flex gap-3">
            <div className="h-11 flex-[2] bg-white/15 rounded-xl" />
            <div className="h-11 flex-1 bg-white/10 rounded-xl" />
          </div>
        </div>

        {/* Right Card: Result Skeleton */}
        <div className="relative rounded-[1.75rem] overflow-hidden border border-white/[0.08] bg-[#0f111a]/40 p-[1.85rem] h-[400px] flex flex-col gap-6"
             style={{
               boxShadow: "0 0 0 1px rgba(255,255,255,.08), 0 8px 32px rgba(0,0,0,.3)"
             }}>
          <div className="flex items-center gap-2">
            <div className="w-[3px] h-[1.05rem] bg-gradient-to-b from-[#a78bfa] to-[#60a5fa] rounded-full" />
            <div className="h-5 w-20 bg-white/15 rounded-md" />
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div className="h-4 w-48 bg-white/10 rounded-md" />
            <div className="h-3 w-32 bg-white/5 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
