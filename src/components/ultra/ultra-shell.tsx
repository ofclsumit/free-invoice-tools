"use client"

import { useEffect, useRef, type ReactNode } from "react"

export function UltraShell({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let W = 0, H = 0
    const particles: {
      x: number; y: number; vx: number; vy: number; r: number
      alpha: number; color: string; life: number; maxLife: number
      reset: (init: boolean) => void; update: () => void; draw: () => void
    }[] = []

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight }
    resize(); window.addEventListener("resize", resize)

    const COLORS = ["rgba(99,102,241,", "rgba(139,92,246,", "rgba(14,165,233,", "rgba(16,185,129,"]

    class Particle {
      x = 0; y = 0; vx = 0; vy = 0; r = 1; alpha = 0.5; color = COLORS[0]; life = 0; maxLife = 300
      constructor() { this.reset(true) }
      reset(init: boolean) {
        this.x = Math.random() * W; this.y = init ? Math.random() * H : H + 10
        this.vy = -(0.2 + Math.random() * 0.5); this.vx = (Math.random() - 0.5) * 0.3
        this.r = 1 + Math.random() * 2; this.alpha = 0.3 + Math.random() * 0.5
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
        this.life = 0; this.maxLife = 200 + Math.random() * 300
      }
      update() { this.x += this.vx; this.y += this.vy; this.life++; if (this.y < -10 || this.life > this.maxLife) this.reset(false) }
      draw() {
        const a = this.alpha * Math.sin((this.life / this.maxLife) * Math.PI)
        ctx!.beginPath(); ctx!.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx!.fillStyle = this.color + a + ")"; ctx!.fill()
      }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle())
    let animId: number
    function loop() { ctx!.clearRect(0, 0, W, H); particles.forEach(p => { p.update(); p.draw() }); animId = requestAnimationFrame(loop) }
    loop()
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize) }
  }, [])

  return (
    <>
      <svg style={{display:"none"}} aria-hidden="true">
        <defs>
          <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise"/>
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred"/>
            <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
      </svg>
      <div className="font-['Inter'] min-h-screen text-[#f1f5f9] overflow-hidden relative animate-[hue-shift_10s_ease-in-out_infinite_alternate]"
        style={{
          background: `
            radial-gradient(ellipse at 20% 10%, rgba(139,92,246,0.55) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 0%, rgba(59,130,246,0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 85%, rgba(16,185,129,0.35) 0%, transparent 50%),
            linear-gradient(160deg, #0f0a2a 0%, #0d1b3e 40%, #0a1628 100%)
          `
        }}
      >
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="orb orb1" />
          <div className="orb orb2" />
          <div className="orb orb3" />
          <div className="orb orb4" />
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <canvas ref={canvasRef} className="fixed inset-0 z-[1] pointer-events-none" />
        <div className="relative z-[2] px-5 py-10 max-w-[720px] mx-auto">{children}</div>
      </div>
    </>
  )
}
