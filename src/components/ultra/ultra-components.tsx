"use client"

import type { ReactNode, InputHTMLAttributes } from "react"

/* ─── NAV (Unified: Handled by ToolLayout) ─── */
export function UltraNav() {
  return null
}

/* ─── PAGE WRAPPER ─── */
export function UltraPage({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex flex-col items-center">
      {children}
    </div>
  )
}

/* ─── TWO-COLUMN GRID ─── */
export function UltraGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
      {children}
    </div>
  )
}

/* ─── HEADER (Unified: Handled by ToolLayout) ─── */
export function UltraBadge({ children }: { children: ReactNode }) {
  return null
}

export function UltraTitle({ children }: { children: ReactNode }) {
  return null
}

export function UltraSubtitle({ children }: { children: ReactNode }) {
  return null
}

export function UltraHeader({ badge, title, subtitle }: { badge?: ReactNode; title?: ReactNode; subtitle?: ReactNode }) {
  return null
}

/* ─── CARD ─── */
export function UltraCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[1.5rem] overflow-hidden transition-all duration-300 bg-white dark:bg-card border border-slate-200 dark:border-white/[.12] shadow-sm hover:shadow-md dark:shadow-[0_8px_32px_rgba(0,0,0,.4)] hover:-translate-y-[2px] ${className}`}
    >
      <div className="relative z-[3] p-[1.85rem] pb-[1.75rem] text-slate-900 dark:text-white">
        {children}
      </div>
    </div>
  )
}

/* ─── CARD HEADER ─── */
export function UltraCardHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-[1.35rem]">
      <span className="w-[3px] h-[1.05rem] rounded-full shrink-0 bg-gradient-to-b from-violet-500 to-indigo-500" />
      <span className="text-[1rem] font-bold text-slate-900 dark:text-white">{title}</span>
    </div>
  )
}

/* ─── SECTION LABEL ─── */
export function UltraSectionLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[.75rem] font-bold tracking-[.07em] uppercase text-slate-700 dark:text-[#a78bfa]/90 mb-[.4rem]">
      {children}
    </label>
  )
}

/* ─── TOGGLE ─── */
export function UltraToggle<T extends string | number = string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-[.25rem] bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-[.9rem] p-[.28rem] mb-[1.35rem]">
      {options.map(o => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 py-[.55rem] px-[.6rem] rounded-[.65rem] text-[.82rem] font-semibold cursor-pointer font-sans transition-all duration-200 whitespace-nowrap ${
            value === o.value
              ? "bg-white text-violet-900 shadow-sm border border-slate-200 dark:bg-gradient-to-r dark:from-[#8b5cf6]/60 dark:to-[#3b82f6]/45 dark:text-white dark:border-transparent dark:shadow-[0_2px_12px_rgba(139,92,246,.35)]"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-white/45 dark:hover:text-white/70 dark:hover:bg-white/[.06]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ─── INPUT ─── */
export function UltraInput(props: InputHTMLAttributes<HTMLInputElement> & { currencySymbol?: string; suffix?: string }) {
  const { currencySymbol, suffix, className = "", ...rest } = props
  return (
    <div className="mb-4">
      <label className="block text-[.75rem] font-bold tracking-[.07em] uppercase text-slate-700 dark:text-[#a78bfa]/90 mb-[.4rem]">{props.placeholder || "Input"}</label>
      <div className="flex items-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/[.12] rounded-[.75rem] overflow-hidden transition-all duration-200 focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-500/20 shadow-xs">
        {currencySymbol && <span className="px-[.75rem] py-[.7rem] text-[.88rem] font-bold text-slate-700 dark:text-[#a78bfa]/80 bg-slate-100 dark:bg-[#7c3aed]/10 border-r border-slate-200 dark:border-white/[.08] shrink-0">{currencySymbol}</span>}
        <input
          {...rest}
          className={`flex-1 min-w-0 px-[.9rem] py-[.7rem] bg-transparent border-none text-slate-900 dark:text-white text-[.97rem] font-medium font-sans outline-none placeholder:text-slate-400 dark:placeholder-white/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className}`}
        />
        {suffix && <span className="px-[.75rem] py-[.7rem] text-[.88rem] font-bold text-slate-700 dark:text-[#a78bfa]/80 bg-slate-100 dark:bg-[#7c3aed]/10 border-l border-slate-200 dark:border-white/[.08] shrink-0">{suffix}</span>}
      </div>
    </div>
  )
}

export function UltraTextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props
  return (
    <div className="mb-4">
      <label className="block text-[.75rem] font-bold tracking-[.07em] uppercase text-slate-700 dark:text-[#a78bfa]/90 mb-[.4rem]">{props.placeholder || "Input"}</label>
      <input
        {...rest}
        className={`w-full px-[.9rem] py-[.7rem] bg-white dark:bg-black/30 border border-slate-300 dark:border-white/[.12] rounded-[.75rem] text-slate-900 dark:text-white text-[.9rem] font-sans outline-none transition-all duration-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 placeholder:text-slate-400 dark:placeholder-white/25 shadow-xs ${className}`}
      />
    </div>
  )
}

/* ─── RATE SELECTOR ─── */
export function UltraRateSelector({ rates, value, selectedRate, onChange, onSelect, labels }: { rates: number[]; value?: number; selectedRate?: number; onChange?: (v: number) => void; onSelect?: (v: number) => void; labels?: Record<number, string> }) {
  const currentRate = typeof value === "number" ? value : (typeof selectedRate === "number" ? selectedRate : rates[0])
  const handler = onChange || onSelect || (() => {})
  return (
    <div className="mb-4">
      <label className="block text-[.75rem] font-bold tracking-[.07em] uppercase text-slate-700 dark:text-[#a78bfa]/90 mb-[.4rem]">Rate</label>
      <div className="flex gap-2 flex-wrap">
        {rates.map(rate => (
          <button
            key={rate}
            type="button"
            onClick={() => handler(rate)}
            className={`flex-1 min-w-[60px] py-[.55rem] px-[.6rem] rounded-[.65rem] text-[.82rem] font-semibold cursor-pointer font-sans transition-all duration-200 ${
              currentRate === rate
                ? "bg-violet-600 text-white shadow-sm dark:bg-gradient-to-r dark:from-[#8b5cf6]/60 dark:to-[#3b82f6]/45 dark:shadow-[0_2px_12px_rgba(139,92,246,.35)]"
                : "bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 dark:bg-black/30 dark:border-white/[.12] dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[.06]"
            }`}
          >
            {rate}%
            {labels?.[rate] && <span className={`block text-[10px] font-normal mt-0.5 ${currentRate === rate ? "text-violet-100" : "text-slate-500 dark:text-white/45"}`}>{labels[rate]}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── DIVIDER ─── */
export function UltraDivider() {
  return <div className="h-px bg-slate-200 dark:bg-gradient-to-r dark:from-transparent dark:via-white/[.08] dark:to-transparent my-6" />
}

/* ─── RESULTS ─── */
export function UltraResultCard({ label, value, color = "main" }: { label: string; value: ReactNode; sub?: string; color?: "main" | "green" | "amber" | "blue" | "purple"; animated?: boolean }) {
  const isHighlight = color === "main"
  return (
    <div className={`flex items-center justify-between px-4 py-[.85rem] rounded-[.75rem] border gap-3 ${
      isHighlight
        ? "bg-gradient-to-r from-violet-50 to-indigo-50/80 border-violet-200 dark:from-[#8b5cf6]/22 dark:to-[#3b82f6]/15 dark:border-[#8b5cf6]/35"
        : "bg-slate-50 border-slate-200 dark:bg-black/25 dark:border-white/[.08]"
    }`}>
      <span className="text-[.84rem] text-slate-600 dark:text-white/60 font-medium shrink-0">{label}</span>
      <span className={`text-right font-bold ${
        isHighlight
          ? "text-[1.2rem] text-violet-950 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#c4b5fd] dark:to-[#93c5fd]"
          : "text-[1rem] text-slate-900 dark:text-white"
      }`}>
        {value}
      </span>
    </div>
  )
}

export function UltraResultsGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-[.65rem] mb-4 ${className}`}>{children}</div>
}

/* ─── EMPTY STATE ─── */
export function UltraEmptyState({ message = "Enter your values and tap", actionText = "Calculate" }: { message?: string; actionText?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] text-slate-400 dark:text-white/40 text-center gap-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400 dark:text-violet-400/60">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p className="text-[.88rem] text-slate-600 dark:text-white/60 leading-relaxed">
        {message}<br />
        <strong className="text-violet-700 dark:text-[#a78bfa]">{actionText}</strong>
      </p>
    </div>
  )
}

/* ─── SPLIT ROW ─── */
export function UltraSplitRow({ label, value, dotColor }: { label: string; value: string; dotColor: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0 border-b border-slate-100 dark:border-white/[.04] last:border-b-0">
      <span className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-white/65">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dotColor }} />
        {label}
      </span>
      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white" style={{ color: dotColor }}>{value}</span>
    </div>
  )
}

export function UltraSplitContainer({ children }: { children: ReactNode }) {
  return <div className="p-4 sm:p-5 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/[.06] mt-2">{children}</div>
}

/* ─── PROGRESS ─── */
export function UltraProgressBar({ label, value, percent, color }: { label: string; value?: number; percent?: number; color?: "indigo" | "emerald" }) {
  const finalVal = typeof value === "number" ? value : (typeof percent === "number" ? percent : 0)
  return (
    <div className="mt-[.2rem] px-4 py-[.85rem] bg-slate-50 dark:bg-black/25 border border-slate-200 dark:border-white/[.07] rounded-[.75rem]">
      <div className="flex justify-between text-[.75rem] font-semibold text-slate-700 dark:text-white/45 mb-2">
        <span>{label}</span>
        <span className="font-mono text-slate-900 dark:text-white font-bold">{finalVal.toFixed(1)}%</span>
      </div>
      <div className="h-[8px] bg-slate-200 dark:bg-white/[.1] rounded-[2rem] overflow-hidden">
        <div
          className="h-full rounded-[2rem] transition-all duration-700 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#a78bfa] dark:to-[#60a5fa]"
          style={{ width: `${Math.min(finalVal, 100)}%` }}
        />
      </div>
    </div>
  )
}

/* ─── BUTTONS ─── */
export function UltraPrimaryButton({ children, onClick, disabled = false, className = "", id }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-5 py-[.82rem] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-[.9rem] text-[.93rem] font-bold cursor-pointer font-sans transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
    >
      {children}
    </button>
  )
}

export function UltraResetButton({ onClick, children = "↺ Reset" }: { onClick: () => void; children?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-[.82rem] px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-white/[.08] dark:hover:bg-white/[.14] dark:border-white/[.15] dark:text-white/70 rounded-[.9rem] text-[.9rem] font-semibold cursor-pointer font-sans transition-all duration-200"
    >
      {children}
    </button>
  )
}

/* ─── RATE TABLE ─── */
export function UltraRateTable({ rows, onSelect }: { rows: { rate: string; label: string; desc: string }[]; onSelect?: (rate: string) => void }) {
  const colorMap: Record<string, string> = {
    "0%": "bg-slate-100 text-slate-700 dark:bg-white/8 dark:text-slate-400",
    "5%": "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
    "12%": "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400",
    "18%": "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-400",
    "28%": "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400",
  }
  return (
    <div className="mt-5 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/[.12] rounded-[.75rem] p-6 shadow-xs">
      <div className="text-xs font-bold tracking-[.06em] uppercase text-slate-700 dark:text-white/65 mb-4">Rate Reference</div>
      {rows.map(row => (
        <div
          key={row.rate}
          onClick={() => onSelect?.(row.rate)}
          className="flex items-center gap-3.5 py-2.5 border-b border-slate-100 dark:border-white/[.04] last:border-b-0 cursor-pointer transition-all duration-200 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[.04] -mx-2 px-2"
        >
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 min-w-[44px] text-center ${colorMap[row.rate] || "bg-slate-100 text-slate-700"}`}>{row.rate}</span>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white/90">{row.label}</span>
            <span className="text-[12.5px] text-slate-600 dark:text-white/65 ml-2">{row.desc}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
