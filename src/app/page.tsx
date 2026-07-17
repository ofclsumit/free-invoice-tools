import dynamic from "next/dynamic"
import { HeroSection } from "@/components/landing/hero-section"
import { LandingNav } from "@/components/landing/landing-nav"
import { LandingFooter } from "@/components/landing/landing-footer"
import { ToolsSection } from "@/components/landing/tools-section"

// Below-the-fold sections are lazy-loaded to keep the initial bundle small.
const HowItWorksSection = dynamic(
  () => import("@/components/landing/how-it-works").then((m) => m.HowItWorksSection),
  { ssr: true }
)
const TestimonialsSection = dynamic(
  () => import("@/components/landing/testimonials").then((m) => m.TestimonialsSection),
  { ssr: true }
)
const FaqSection = dynamic(
  () => import("@/components/landing/faq").then((m) => m.FaqSection),
  { ssr: true }
)

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mesh overflow-x-hidden transition-colors duration-300">
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
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
            <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
