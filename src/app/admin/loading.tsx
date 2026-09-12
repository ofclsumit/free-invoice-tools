import React from "react"
import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3.5 select-none animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center">
        {/* Subtle glowing halo */}
        <div className="absolute w-12 h-12 rounded-full bg-violet-500/20 blur-xl pointer-events-none" />
        {/* Circular Spinner */}
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
        Loading admin analytics...
      </p>
    </div>
  )
}
