"use client"

import type { ReactNode, InputHTMLAttributes } from "react"

/* ─── NAV ─── */
export function UltraNav() {
  return (
    <nav className="flex items-center justify-between max-w-[920px] mx-auto w-full px-5 pt-10 pb-0">
      <a href="https://Turnivo.vercel.app/" className="inline-flex items-center gap-[.45rem] text-white/65 no-underline text-[.85rem] font-semibold transition-colors hover:text-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Home
      </a>
      <span className="text-[.88rem] font-bold text-[#c084fc] tracking-[.06em]">{"\uD835\uDE1B\uD835\uDE1C\uD835\uDE19\uD835\uDE15\uD835\uDE10\uD835\uDE1D\uD835\uDE16"}</span>
    </nav>
  )
}

/* ─── PAGE WRAPPER ─── */
export function UltraPage({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[920px] mx-auto w-full px-5 py-10 flex flex-col items-center">
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

/* ─── HEADER ─── */
export function UltraBadge({ children }: { children: ReactNode }) {
  return (
    <div className="text-[.72rem] font-bold tracking-[.15em] uppercase text-[#a78bfa]/80 mb-[.6rem]">
      {children}
    </div>
  )
}

export function UltraTitle({ children }: { children: ReactNode }) {
  return (
    <h1
      className="font-['Inter'] text-[clamp(28px,5vw,2.4rem)] font-bold leading-[1.1] tracking-[-.03em] text-white mb-3"
      style={{textShadow:"0 2px 30px rgba(139,92,246,.5)"}}
    >
      {children}
    </h1>
  )
}

export function UltraSubtitle({ children }: { children: ReactNode }) {
  return <p className="text-[.95rem] text-white/55 mt-[.55rem] max-w-[460px] mx-auto">{children}</p>
}

export function UltraHeader({ badge, title, subtitle }: { badge?: ReactNode; title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="text-center mb-8">
      {badge && <UltraBadge>{badge}</UltraBadge>}
      <UltraTitle>{title}</UltraTitle>
      {subtitle && <UltraSubtitle>{subtitle}</UltraSubtitle>}
    </div>
  )
}

/* ─── GLASS CARD ─── */
export function UltraCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[1.75rem] overflow-hidden transition-all duration-300 hover:-translate-y-[3px] ${className}`}
      style={{
        boxShadow: "0 0 0 1px rgba(255,255,255,.12), 0 8px 32px rgba(0,0,0,.4), 0 2px 8px rgba(0,0,0,.3)"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,.18), 0 16px 40px rgba(0,0,0,.45), 0 4px 12px rgba(139,92,246,.2)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,.12), 0 8px 32px rgba(0,0,0,.4), 0 2px 8px rgba(0,0,0,.3)"
      }}
    >
      <div className="absolute inset-0 z-0 backdrop-blur-[18px] saturate-[1.6] -webkit-backdrop-blur-[18px] saturate-[1.6]" style={{filter:"url(#lg-dist)",isolation:"isolate"}} />
      <div className="absolute inset-0 z-[1] bg-white/[.1]" />
      <div className="absolute inset-0 z-[2] rounded-inherit overflow-hidden" style={{boxShadow:"inset 1.5px 1.5px 0 rgba(255,255,255,.5), inset -1px -1px 0 rgba(255,255,255,.08), inset 0 0 8px rgba(255,255,255,.12)"}} />
      <div className="relative z-[3] p-[1.85rem] sm:p-[1.85rem] pb-[1.75rem]">
        {children}
      </div>
    </div>
  )
}

/* ─── TOGGLE ─── */
export function UltraToggle({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-[.25rem] bg-black/30 rounded-[.9rem] p-[.28rem] mb-[1.35rem]">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 py-[.55rem] px-[.6rem] border-none bg-transparent rounded-[.65rem] text-[.8rem] font-semibold cursor-pointer font-['Inter'] transition-all duration-300 whitespace-nowrap ${
            value === o.value
              ? "bg-gradient-to-r from-[#8b5cf6]/60 to-[#3b82f6]/45 text-white shadow-[0_2px_12px_rgba(139,92,246,.35)]"
              : "text-white/45 hover:text-white/70 hover:bg-white/[.06]"
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
      <label className="block text-[.72rem] font-bold tracking-[.07em] uppercase text-[#a78bfa]/90 mb-[.4rem]">{props.placeholder || "Input"}</label>
      <div className="flex items-center bg-black/30 border border-white/[.12] rounded-[.75rem] overflow-hidden transition-all duration-300 focus-within:border-[#a78bfa]/60 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,.2)]">
        {currencySymbol && <span className="px-[.7rem] py-[.7rem] text-[.88rem] font-bold text-[#a78bfa]/70 bg-[#7c3aed]/10 border-r border-white/[.08] shrink-0">{currencySymbol}</span>}
        <input
          {...rest}
          className={`flex-1 min-w-0 px-[.9rem] py-[.7rem] bg-transparent border-none text-white text-[.97rem] font-medium font-['Inter'] outline-none placeholder-white/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className}`}
        />
        {suffix && <span className="px-[.7rem] py-[.7rem] text-[.88rem] font-bold text-[#a78bfa]/70 bg-[#7c3aed]/10 border-l border-white/[.08] shrink-0">{suffix}</span>}
      </div>
    </div>
  )
}

export function UltraTextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props
  return (
    <div className="mb-4">
      <label className="block text-[.72rem] font-bold tracking-[.07em] uppercase text-[#a78bfa]/90 mb-[.4rem]">{props.placeholder || "Input"}</label>
      <input
        {...rest}
        className={`w-full px-[.9rem] py-[.7rem] bg-black/30 border border-white/[.12] rounded-[.75rem] text-white text-[.88rem] font-['Inter'] outline-none transition-all duration-300 focus:border-[#a78bfa]/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,.2)] placeholder-white/25 ${className}`}
      />
    </div>
  )
}

/* ─── RATE SELECTOR ─── */
export function UltraRateSelector({ rates, value, onChange, labels }: { rates: number[]; value: number; onChange: (v: number) => void; labels?: Record<number, string> }) {
  return (
    <div className="mb-4">
      <label className="block text-[.72rem] font-bold tracking-[.07em] uppercase text-[#a78bfa]/90 mb-[.4rem]">Rate</label>
      <div className="flex gap-2 flex-wrap">
        {rates.map(rate => (
          <button
            key={rate}
            onClick={() => onChange(rate)}
            className={`flex-1 min-w-[60px] py-[.55rem] px-[.6rem] border-none bg-transparent rounded-[.65rem] text-[.8rem] font-semibold cursor-pointer font-['Inter'] transition-all duration-300 ${
              value === rate
                ? "bg-gradient-to-r from-[#8b5cf6]/60 to-[#3b82f6]/45 text-white shadow-[0_2px_12px_rgba(139,92,246,.35)]"
                : "bg-black/30 border border-white/[.12] text-white/45 hover:text-white/70 hover:bg-white/[.06]"
            }`}
          >
            {rate}%
            {labels?.[rate] && <span className="block text-[10px] font-normal text-white/45 mt-0.5">{labels[rate]}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── DIVIDER ─── */
export function UltraDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-white/[.08] to-transparent my-7" />
}

/* ─── RESULTS ─── */
export function UltraResultCard({ label, value, sub, color = "main", animated = true }: { label: string; value: ReactNode; sub?: string; color?: "main" | "green" | "amber" | "blue" | "purple"; animated?: boolean }) {
  const isHighlight = color === "main"
  return (
    <div className={`flex items-center justify-between px-4 py-[.78rem] bg-black/25 border rounded-[.75rem] gap-2 ${isHighlight ? "bg-gradient-to-r from-[#8b5cf6]/22 to-[#3b82f6]/15 border-[#8b5cf6]/35" : "border-white/[.08]"}`}>
      <span className="text-[.82rem] text-white/55 font-medium shrink-0">{label}</span>
      <span className={`text-right font-bold ${isHighlight ? "text-[1.1rem] text-transparent bg-clip-text bg-gradient-to-r from-[#c4b5fd] to-[#93c5fd]" : "text-[.95rem] text-white"}`}>
        {value}
      </span>
    </div>
  )
}

export function UltraResultsGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-[.65rem] mb-4 ${className}`}>{children}</div>
}

/* ─── SPLIT ROW ─── */
export function UltraSplitRow({ label, value, dotColor }: { label: string; value: string; dotColor: string }) {
  return (
    <div className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
      <span className="flex items-center gap-2 text-xs sm:text-sm text-white/65">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
        {label}
      </span>
      <span className="text-sm sm:text-base font-semibold" style={{ color: dotColor }}>{value}</span>
    </div>
  )
}

export function UltraSplitContainer({ children }: { children: ReactNode }) {
  return <div className="p-4 sm:p-5 bg-black/30 rounded-xl border border-white/[.06] mt-2">{children}</div>
}

/* ─── PROGRESS ─── */
export function UltraProgressBar({ label, value, color = "indigo" }: { label: string; value: number; color?: "indigo" | "emerald" }) {
  return (
    <div className="mt-[.2rem] px-4 py-[.85rem] bg-black/25 border border-white/[.07] rounded-[.75rem]">
      <div className="flex justify-between text-[.71rem] font-semibold text-white/45 mb-2">
        <span>{label}</span>
        <span>{value.toFixed(1)}%</span>
      </div>
      <div className="h-[7px] bg-white/[.1] rounded-[2rem] overflow-hidden">
        <div
          className={`h-full rounded-[2rem] transition-all duration-700 bg-gradient-to-r from-[#a78bfa] to-[#60a5fa]`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}

/* ─── BUTTONS ─── */
export function UltraPrimaryButton({ children, onClick, disabled = false, className = "" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-5 py-[.82rem] bg-gradient-to-r from-[#8b5cf6]/75 to-[#3b82f6]/60 border border-[#a78bfa]/45 rounded-[.9rem] text-white text-[.93rem] font-bold cursor-pointer font-['Inter'] transition-all duration-300 shadow-[0_4px_20px_rgba(139,92,246,.35)] hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(139,92,246,.55)] hover:from-[#8b5cf6]/90 hover:to-[#3b82f6]/75 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
    >
      {children}
    </button>
  )
}

export function UltraResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full mt-6 py-[.82rem] bg-white/[.08] border border-white/[.15] rounded-[.9rem] text-white/60 text-[.9rem] cursor-pointer font-['Inter'] transition-all duration-300 hover:bg-white/[.14] hover:text-white"
    >
      ↺ Reset calculator
    </button>
  )
}

/* ─── RATE TABLE ─── */
export function UltraRateTable({ rows, onSelect }: { rows: { rate: string; label: string; desc: string }[]; onSelect?: (rate: string) => void }) {
  const colorMap: Record<string, string> = {
    "0%": "bg-white/8 text-slate-400",
    "5%": "bg-emerald-500/15 text-emerald-400",
    "12%": "bg-sky-500/15 text-sky-400",
    "18%": "bg-purple-500/15 text-purple-400",
    "28%": "bg-rose-500/15 text-rose-400",
  }
  return (
    <div className="mt-5 bg-black/30 border border-white/[.12] rounded-[.75rem] p-6">
      <div className="text-xs font-semibold tracking-[.06em] uppercase text-white/65 mb-4">Rate Reference</div>
      {rows.map(row => (
        <div
          key={row.rate}
          onClick={() => onSelect?.(row.rate)}
          className="flex items-center gap-3.5 py-2.5 border-b border-white/[.04] last:border-b-0 cursor-pointer transition-all duration-200 rounded-lg hover:bg-white/[.04] -mx-2 px-2"
        >
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 min-w-[44px] text-center ${colorMap[row.rate] || "bg-white/10 text-slate-400"}`}>{row.rate}</span>
          <div>
            <span className="text-xs font-semibold text-white/80">{row.label}</span>
            <span className="text-[12.5px] text-white/65 ml-2">{row.desc}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
