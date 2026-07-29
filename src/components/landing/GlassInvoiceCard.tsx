import { useState, useRef } from "react"
import { Check, DollarSign, QrCode, FileText } from "lucide-react"

export default function GlassInvoiceCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    // Calculate rotation angles based on cursor position on card
    const x = (e.clientX - rect.left - rect.width / 2) / 12
    const y = (e.clientY - rect.top - rect.height / 2) / 12
    setCoords({ x, y })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setCoords({ x: 0, y: 0 })
  }

  // Add highly responsive touch support for mobile users to experience the tilt effect
  const handleTouchStart = () => {
    setIsHovered(true)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return
    const touch = e.touches[0]
    const rect = cardRef.current.getBoundingClientRect()
    
    // Calculate rotation angles based on touch position relative to the card's center
    const x = (touch.clientX - rect.left - rect.width / 2) / 8 // Slightly higher sensitivity on mobile for easier feel
    const y = (touch.clientY - rect.top - rect.height / 2) / 8
    
    // Constrain the coordinates to prevent extreme tilt on far drags
    const constrainedX = Math.max(-25, Math.min(25, x))
    const constrainedY = Math.max(-25, Math.min(25, y))
    
    setCoords({ x: constrainedX, y: constrainedY })
  }

  const handleTouchEnd = () => {
    setIsHovered(false)
    setCoords({ x: 0, y: 0 })
  }

  return (
    <div 
      className="relative w-[310px] sm:w-[340px] md:w-[380px] lg:w-[410px] h-[410px] sm:h-[440px] md:h-[480px] lg:h-[510px] flex items-center justify-center cursor-pointer select-none touch-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={cardRef}
      style={{ perspective: 1000 }}
    >
      {/* Floating glowing background orb behind the card */}
      <div 
        className="absolute -inset-4 rounded-[32px] bg-gradient-to-tr from-violet-600/35 to-indigo-600/25 opacity-50 blur-2xl lg:blur-3xl transition-transform duration-300 pointer-events-none"
        style={{
          transform: `translate3d(${coords.x * 0.4}px, ${coords.y * 0.4}px, -15px) rotateX(${-coords.y * 0.5}deg) rotateY(${coords.x * 0.5}deg)`,
        }}
      />

      {/* Main Glassmorphic Card */}
      <div
        className="w-full h-full bg-[#0a0720]/75 border border-white/10 rounded-[28px] md:rounded-[32px] p-6 sm:p-7 md:p-8 lg:p-9 flex flex-col justify-between backdrop-blur-2xl relative overflow-hidden shadow-[inset_0_1.5px_2.5px_rgba(255,255,255,0.2),0_25px_50px_rgba(0,0,0,0.65),0_0_40px_rgba(139,92,246,0.15)]"
        style={{
          transform: `rotateX(${-coords.y}deg) rotateY(${coords.x}deg) translateY(${isHovered ? -8 : 0}px)`,
          transition: "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Sleek diagonal light reflection sweeping effect on hover */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            transform: `skewX(-25deg) translateX(${isHovered ? '250%' : '-150%'})`,
          }}
        />

        {/* Inner ambient glow nodes */}
        <div className="absolute top-0 left-0 w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-violet-500/25 to-transparent blur-xl lg:blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-tl from-indigo-500/15 to-transparent blur-xl lg:blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div>
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[9px] md:text-[10px] text-emerald-400 font-semibold uppercase tracking-[0.18em]">
                Live Payment
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-400/20 text-[9px] md:text-[10px] text-[#A78BFA] font-medium font-mono uppercase tracking-wider">
              INV-2026-09
            </div>
          </div>

          {/* Title & Currency Icon */}
          <div className="flex justify-between items-start mb-4 lg:mb-6">
            <div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
                INVOICE
              </h3>
              <p className="text-[11px] md:text-[12px] text-slate-400 tracking-wide mt-1">
                Turnivo Inc.
              </p>
            </div>
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <DollarSign size={18} className="text-violet-300 md:w-[20px] md:h-[20px]" />
            </div>
          </div>

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-4 lg:my-6" />

          {/* Interactive Line Items */}
          <div className="space-y-4 lg:space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[12px] md:text-[13px] lg:text-[14px] font-semibold text-slate-100">Design System Architecture</p>
                <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Premium UI Layout Kit</p>
              </div>
              <span className="text-[12px] md:text-[13px] lg:text-[14px] font-mono font-medium text-slate-200">$1,250.00</span>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-[12px] md:text-[13px] lg:text-[14px] font-semibold text-slate-100">Cloud Service Integration</p>
                <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Automated APIs & DB Sync</p>
              </div>
              <span className="text-[12px] md:text-[13px] lg:text-[14px] font-mono font-medium text-slate-200">$450.00</span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-4 lg:my-6" />
        </div>

        {/* Bottom Metadata & Stats */}
        <div className="space-y-5 lg:space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] md:text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Total Amount Due
              </p>
              <p className="text-2xl md:text-3xl lg:text-[32px] font-display font-extrabold text-white mt-1 tracking-tight leading-none">
                $1,700.00
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] md:text-[12px] font-bold text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg">
              <Check size={11} strokeWidth={3} /> PAID
            </div>
          </div>

          {/* Luxury Technical Bottom Row widgets */}
          <div className="grid grid-cols-4 gap-2 pt-3.5 md:pt-4 border-t border-white/[0.06]">
            <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors duration-200">
              <QrCode size={15} className="text-violet-300 md:w-[17px] md:h-[17px]" />
              <span className="text-[8px] md:text-[9px] font-mono text-slate-400 mt-1 uppercase font-semibold">QR Pay</span>
            </div>
            <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors duration-200">
              <span className="text-[11px] md:text-[12px] font-extrabold text-violet-300 font-mono tracking-tighter leading-none mt-0.5">GST</span>
              <span className="text-[8px] md:text-[9px] font-mono text-slate-400 mt-1 uppercase font-semibold">Reg</span>
            </div>
            <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors duration-200">
              <FileText size={15} className="text-violet-300 md:w-[17px] md:h-[17px]" />
              <span className="text-[8px] md:text-[9px] font-mono text-slate-400 mt-1 uppercase font-semibold">PDF</span>
            </div>
            <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors duration-200">
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-violet-400/20 flex items-center justify-center border border-violet-400/30">
                <Check size={9} className="text-violet-300" strokeWidth={3} />
              </div>
              <span className="text-[8px] md:text-[9px] font-mono text-slate-400 mt-1 uppercase font-semibold">Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
