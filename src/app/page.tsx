import { HeroSection } from "@/components/landing/hero-section"
import { ToolsSection } from "@/components/landing/tools-section"
import { HowItWorksSection } from "@/components/landing/how-it-works"
import { TestimonialsSection } from "@/components/landing/testimonials"
import { FaqSection } from "@/components/landing/faq"
import { LandingNav } from "@/components/landing/landing-nav"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function LandingPage() {
  return (
    <div className="home-bg min-h-screen overflow-x-hidden transition-colors duration-300">
      <LandingNav />
      <main>
        <HeroSection />
        <ToolsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <LandingFooter />

      {/* Global liquid glass distortion filter */}
      <svg style={{ display: "none" }} aria-hidden="true">
        <defs>
          <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise"/>
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred"/>
            <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
      </svg>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-bg {
          background: linear-gradient(180deg,#05010C 0%,#0B0618 22%,#140A2E 55%,#1A1045 100%);
          color: #ECE9F5;
        }
      ` }} />
    </div>
  )
}
