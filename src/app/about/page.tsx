import Link from "next/link"
import { Zap, Lock, Globe, Heart } from "lucide-react"
import { SiteLogo } from "@/components/shared/site-logo"

export const metadata = {
  title: "About | QuoteFlow",
  description:
    "Learn about QuoteFlow — the free GST invoice and quotation generator built for Indian freelancers and small businesses.",
}

const values = [
  {
    icon: Heart,
    title: "Free for Everyone",
    desc: "No hidden charges, no 'free trial ends tomorrow'. Our tools stay free because we believe financial tools should be accessible to every Indian entrepreneur.",
  },
  {
    icon: Zap,
    title: "Client-Side Privacy",
    desc: "All document processing happens in your browser. Your financial data never leaves your device. No servers, no storage, no snooping.",
  },
  {
    icon: Lock,
    title: "Built for India",
    desc: "GST compliance, UPI QR codes, Indian number formats — every feature is tailored for the Indian business ecosystem.",
  },
  {
    icon: Globe,
    title: "Open Web",
    desc: "QuoteFlow is a Progressive Web App (PWA). It works on any device, anywhere, with no installation required.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-mesh py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <SiteLogo className="mb-8" />

        <div className="mb-10">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">About</p>
          <h1 className="text-4xl font-display font-bold tracking-tight">Why QuoteFlow?</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed">
            QuoteFlow was born from a simple frustration: every invoice tool for Indian businesses was either expensive,
            clunky, or required signing up for yet another account. We wanted something fast, private, and genuinely
            free.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Today, QuoteFlow is a growing suite of tools — invoice generator, quotation maker, GST calculator, HSN code
            finder, rent receipt generator, and more — all following the same philosophy: your data stays yours.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          {values.map((v) => (
            <div key={v.title} className="glass-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-6">
          <section>
            <h2 className="text-xl font-display font-semibold mb-3">How Is It Free?</h2>
            <p className="text-muted-foreground">
              QuoteFlow runs entirely in your browser. There are no servers processing your documents, no storage costs
              for invoices, and no infrastructure scaling bills. This client-side architecture keeps our operational
              costs near zero, and we pass those savings on to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-3">The Tech Stack</h2>
            <p className="text-muted-foreground">
              Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and shadcn/ui. PDFs are generated on-device
              using react-to-print. The entire application is deployed on Vercel&apos;s edge network for fast global
              access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-3">The Team</h2>
            <p className="text-muted-foreground">
              QuoteFlow is built by a small team of developers and designers who understand the pain points of running a
              business in India. We&apos;re remote-first, privacy-first, and committed to keeping our tools free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-3">Join Us</h2>
            <p className="text-muted-foreground">
              Have feedback or ideas?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                We&apos;d love to hear from you
              </Link>
              . QuoteFlow is built for the community, and your input shapes every feature.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
