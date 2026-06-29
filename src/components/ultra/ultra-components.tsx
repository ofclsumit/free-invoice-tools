"use client"

import type { ReactNode, InputHTMLAttributes, ButtonHTMLAttributes } from "react"

export function UltraBadge({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold tracking-[0.1em] uppercase px-3.5 py-1 rounded-full mb-5 animate-pulseBadge">
      <div className="w-[5px] h-[5px] bg-indigo-400 rounded-full animate-blink" />
      {children}
    </div>
  )
}

export function UltraTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-['Space_Grotesk'] text-[clamp(32px,6vw,52px)] font-bold leading-[1.1] bg-gradient-to-r from-white via-indigo-300 to-indigo-400 bg-clip-text text-transparent mb-3.5 tracking-[-0.02em]">
      {children}
    </h1>
  )
}

export function UltraSubtitle({ children }: { children: ReactNode }) {
  return <p className="text-[#f1f5f9]/65 text-[15px] leading-relaxed max-w-[460px] mx-auto">{children}</p>
}

export function UltraHeader({ badge, title, subtitle }: { badge?: ReactNode; title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="text-center mb-12 animate-[fadeSlideUp_0.8s_ease_both]">
      {badge && <UltraBadge>{badge}</UltraBadge>}
      <UltraTitle>{title}</UltraTitle>
      {subtitle && <UltraSubtitle>{subtitle}</UltraSubtitle>}
    </div>
  )
}

export function UltraCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-2xl p-9 overflow-hidden transition-all duration-500 hover:-translate-y-[3px] ${className}`}
      style={{
        boxShadow: "0 0 0 1px rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.18), 0 16px 40px rgba(0,0,0,0.45), 0 4px 12px rgba(139,92,246,0.2)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)"
      }}
    >
      <div className="glass-filter" style={{filter:"url(#lg-dist)"}} />
      <div className="glass-overlay" />
      <div className="glass-specular" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 via-purple-500/60 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" style={{zIndex:4}} />
      <div className="relative z-[3] animate-[fadeSlideUp_0.8s_0.15s_ease_both]">
        {children}
      </div>
    </div>
  )
}

export function UltraToggle({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 bg-black/30 rounded-[.9rem] p-[.28rem] mb-7">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 py-[.55rem] px-[.6rem] text-xs sm:text-sm font-semibold rounded-[.65rem] transition-all duration-300 whitespace-nowrap ${
            value === o.value
              ? "bg-gradient-to-r from-indigo-500/75 to-purple-500/75 text-white shadow-lg shadow-indigo-500/35"
              : "text-[#f1f5f9]/45 hover:text-[#f1f5f9]/70 hover:bg-white/[0.06]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function UltraInput(props: InputHTMLAttributes<HTMLInputElement> & { currencySymbol?: string; suffix?: string }) {
  const { currencySymbol, suffix, className = "", ...rest } = props
  return (
    <div className="space-y-2 mb-6">
      <label className="text-[.72rem] font-bold tracking-[.07em] uppercase text-[#a78bfa]/90 block">{props.placeholder || "Input"}</label>
      <div className="flex items-center bg-black/30 border border-white/[0.12] rounded-[.75rem] overflow-hidden transition-all duration-300 focus-within:border-[#a78bfa]/60 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]">
        {currencySymbol && <span className="px-[.7rem] py-[.7rem] text-[.88rem] font-bold text-[#a78bfa]/70 bg-[#7c3aed]/10 border-r border-white/[0.08] shrink-0">{currencySymbol}</span>}
        <input
          {...rest}
          className={`flex-1 min-w-0 bg-transparent border-none text-white text-[.97rem] font-medium outline-none px-[.9rem] py-[.7rem] ${className}`}
        />
        {suffix && <span className="px-[.7rem] py-[.7rem] text-[.88rem] font-bold text-[#a78bfa]/70 bg-[#7c3aed]/10 border-l border-white/[0.08] shrink-0">{suffix}</span>}
      </div>
    </div>
  )
}

export function UltraTextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props
  return (
    <div className="space-y-2 mb-6">
      <label className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#f1f5f9]/65 block">{props.placeholder || "Input"}</label>
      <input
        {...rest}
        className={`w-full bg-black/40 border border-white/[0.12] rounded-xl text-white text-sm outline-none transition-all duration-300 focus:border-indigo-500/60 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] focus:bg-black/50 px-4 py-3 ${className}`}
      />
    </div>
  )
}

export function UltraRateSelector({ rates, value, onChange, labels }: { rates: number[]; value: number; onChange: (v: number) => void; labels?: Record<number, string> }) {
  return (
    <div className="space-y-2 mb-6">
      <label className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#f1f5f9]/65 block">Rate</label>
      <div className="flex gap-2 flex-wrap">
        {rates.map(rate => (
          <button
            key={rate}
            onClick={() => onChange(rate)}
            className={`flex-1 min-w-[60px] px-3 py-3 rounded-xl text-sm font-semibold font-['Space_Grotesk'] text-center transition-all duration-300 relative overflow-hidden ${
              value === rate
                ? "border border-indigo-500/70 text-white bg-indigo-500/15 shadow-lg shadow-indigo-500/25 -translate-y-0.5"
                : "bg-black/40 border border-white/[0.12] text-[#f1f5f9]/65 hover:border-white/20 hover:text-[#f1f5f9] hover:bg-white/[0.05] hover:-translate-y-px"
            }`}
          >
            {rate}%
            {labels?.[rate] && <span className="block text-[10px] font-normal text-[#f1f5f9]/65 mt-0.5 tracking-[0.05em]">{labels[rate]}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

export function UltraDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-7" />
}

export function UltraResultCard({ label, value, sub, color = "main", animated = true }: { label: string; value: ReactNode; sub?: string; color?: "main" | "green" | "amber" | "blue" | "purple"; animated?: boolean }) {
  const colorMap = {
    main: "bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border-indigo-500/25",
    green: "bg-emerald-500/8 border-emerald-500/20",
    amber: "bg-amber-500/8 border-amber-500/20",
    blue: "bg-sky-500/8 border-sky-500/20",
    purple: "bg-purple-500/8 border-purple-500/20",
  }
  const valueColorMap = {
    main: "text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-300",
    green: "text-emerald-400",
    amber: "text-amber-400",
    blue: "text-sky-400",
    purple: "text-purple-400",
  }
  const spanMap = color === "main" ? "col-span-full" : ""
  return (
    <div className={`p-5 rounded-xl border border-white/[0.07] transition-transform duration-300 hover:-translate-y-0.5 ${colorMap[color]} ${spanMap}`}>
      <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#f1f5f9]/65 mb-1.5">{label}</div>
      <div className={`font-['Space_Grotesk'] text-xl sm:text-2xl font-bold leading-none transition-all duration-500 ${valueColorMap[color]} ${animated ? "animate-[countUp_0.35s_cubic-bezier(0.4,0,0.2,1)_both]" : ""}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-[#f1f5f9]/65 mt-1">{sub}</div>}
    </div>
  )
}

export function UltraResultsGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 ${className}`}>{children}</div>
}

export function UltraSplitRow({ label, value, dotColor }: { label: string; value: string; dotColor: string }) {
  return (
    <div className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
      <span className="flex items-center gap-2 text-xs sm:text-sm text-[#f1f5f9]/65">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
        {label}
      </span>
      <span className="font-['Space_Grotesk'] text-sm sm:text-base font-semibold" style={{ color: dotColor }}>{value}</span>
    </div>
  )
}

export function UltraSplitContainer({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 sm:p-5 bg-black/30 rounded-xl border border-white/[0.06] mt-2">
      {children}
    </div>
  )
}

export function UltraProgressBar({ label, value, color = "indigo" }: { label: string; value: number; color?: "indigo" | "emerald" }) {
  const colorClass = color === "indigo" ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gradient-to-r from-emerald-500 to-emerald-400"
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[11px] text-[#f1f5f9]/65 mb-1.5">
        <span>{label}</span>
        <span>{value.toFixed(1)}%</span>
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  )
}

export function UltraPrimaryButton({ children, onClick, disabled = false, className = "" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-5 py-[.82rem] bg-gradient-to-r from-[#7c3aed]/75 to-[#3b82f6]/60 border border-[#a78bfa]/45 rounded-[.9rem] text-white text-[.93rem] font-bold cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(139,92,246,0.35)] hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(139,92,246,0.55)] hover:from-[#7c3aed]/90 hover:to-[#3b82f6]/75 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
    >
      {children}
    </button>
  )
}

export function UltraResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full mt-6 py-[.82rem] bg-white/[0.08] border border-white/[0.15] rounded-[.9rem] text-white/60 text-[.9rem] font-medium font-['Inter'] cursor-pointer transition-all duration-300 hover:bg-white/[0.14] hover:text-white"
    >
      ↺ Reset calculator
    </button>
  )
}

export function UltraRateTable({ rows, onSelect }: { rows: { rate: string; label: string; desc: string }[]; onSelect?: (rate: string) => void }) {
  const colorMap: Record<string, string> = {
    "0%": "bg-[#f1f5f9]/8 text-slate-400",
    "5%": "bg-emerald-500/15 text-emerald-400",
    "12%": "bg-sky-500/15 text-sky-400",
    "18%": "bg-purple-500/15 text-purple-400",
    "28%": "bg-rose-500/15 text-rose-400",
  }
  return (
    <div className="mt-5 bg-white/[0.06] border border-white/[0.12] rounded-xl p-6 backdrop-blur-md animate-[fadeSlideUp_0.8s_0.3s_ease_both]">
      <div className="text-xs font-semibold tracking-[0.06em] uppercase text-[#f1f5f9]/65 mb-4">Rate Reference</div>
      {rows.map(row => (
        <div
          key={row.rate}
          onClick={() => onSelect?.(row.rate)}
          className="flex items-center gap-3.5 py-2.5 border-b border-white/[0.04] last:border-b-0 cursor-pointer transition-all duration-200 rounded-lg hover:bg-white/[0.04] -mx-2 px-2"
        >
          <span className={`font-['Space_Grotesk'] text-xs font-bold px-2.5 py-1 rounded-full shrink-0 min-w-[44px] text-center ${colorMap[row.rate] || "bg-white/10 text-slate-400"}`}>{row.rate}</span>
          <div>
            <span className="text-xs font-semibold text-white/80">{row.label}</span>
            <span className="text-[12.5px] text-[#f1f5f9]/65 ml-2">{row.desc}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
