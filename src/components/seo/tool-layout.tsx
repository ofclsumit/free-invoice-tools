import React from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { JsonLd } from "./json-ld"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { RelatedTools, RelatedTool } from "./related-tools"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export interface ToolLayoutProps {
  title: string
  description: string
  h1: string
  heroDescription: string
  tool: React.ReactNode
  howToUse: { title: string; steps: string[] }
  features: string[]
  benefits: string[]
  faqs: { question: string; answer: string }[]
  relatedTools: RelatedTool[]
  schemaUrl: string
  isUltra?: boolean
}

export function ToolLayout({
  title,
  description,
  h1,
  heroDescription,
  tool,
  howToUse = { title: "How to use", steps: [] },
  features = [],
  benefits = [],
  faqs = [],
  relatedTools = [],
  schemaUrl,
  isUltra = false,
}: ToolLayoutProps) {
  
  // --- JSON-LD STRUCTURED DATA SCHEMAS ---

  // 1. WebApplication Schema
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description: description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    url: schemaUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  }

  // 2. SoftwareApplication Schema
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: h1,
    description: description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    url: schemaUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  }

  // 3. Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Turnivo",
    url: "https://Turnivo.in",
    logo: "https://Turnivo.in/logo.png",
    description: "Create professional business documents in seconds for free with Turnivo.",
  }

  // 4. Website Schema with SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Turnivo",
    url: "https://Turnivo.in",
    potentialAction: {
      "@type": "SearchAction",
      "target": "https://Turnivo.in/#tools?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  // 5. BreadcrumbList Schema (Home > Business Documents > Tool Name)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://Turnivo.in" },
      { "@type": "ListItem", position: 2, name: "Business Documents", item: "https://Turnivo.in/#tools" },
      { "@type": "ListItem", position: 3, name: h1, item: schemaUrl },
    ],
  }

  // 6. FAQPage Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  // 7. HowTo Schema
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howToUse.title || `How to use ${h1}`,
    description: description,
    step: howToUse.steps.map((step, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: step.substring(0, 40) + "...",
      text: step,
      url: `${schemaUrl}#step-${idx + 1}`
    }))
  }

  if (isUltra) {
    return (
      <>
        <JsonLd data={webAppSchema} />
        <JsonLd data={softwareAppSchema} />
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <JsonLd data={breadcrumbSchema} />
        {faqs.length > 0 && <JsonLd data={faqSchema} />}
        {howToUse.steps.length > 0 && <JsonLd data={howToSchema} />}
        
        <div className="font-['Inter'] min-h-screen w-full text-foreground overflow-hidden py-8 px-4 sm:py-12 bg-mesh transition-colors duration-300 relative">
          <style dangerouslySetInnerHTML={{ __html: `
            .tool-particle {
              position: absolute;
              border-radius: 9999px;
              background: rgba(196,181,253,0.9);
              box-shadow: 0 0 8px rgba(167,139,250,0.9);
              pointer-events: none;
              animation: toolParticleFloat 14s ease-in-out infinite;
            }
            @keyframes toolParticleFloat {
              0%,100% { transform: translateY(0) translateX(0); opacity: 0.25; }
              50% { transform: translateY(-22px) translateX(10px); opacity: 0.7; }
            }
          `}} />
          <div className="tool-particle" style={{ top: "18%", left: "16%", width: 4, height: 4, animationDelay: "0s" }} />
          <div className="tool-particle" style={{ top: "30%", right: "12%", width: 6, height: 6, animationDelay: "-3s" }} />
          <div className="tool-particle" style={{ top: "62%", left: "10%", width: 3, height: 3, animationDelay: "-6s" }} />
          <div className="tool-particle" style={{ bottom: "22%", right: "18%", width: 5, height: 5, animationDelay: "-9s" }} />
          <div className="tool-particle" style={{ top: "44%", left: "24%", width: 3, height: 3, animationDelay: "-4.5s" }} />
          <div className="tool-particle" style={{ top: "24%", right: "26%", width: 4, height: 4, animationDelay: "-7.5s" }} />

          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>

          <svg style={{display:"none"}} aria-hidden="true">
            <defs>
              <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise"/>
                <feGaussianBlur in="noise" stdDeviation="2" result="blurred"/>
                <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
            </defs>
          </svg>

          {/* Main Tool Interface without outer border wrapper */}
          <div className="w-full max-w-4xl mx-auto mb-16">
            {tool}
          </div>

          {/* Long Form Content for SEO */}
          <div className="max-w-4xl mx-auto space-y-16 text-foreground pb-12">
            <article className="prose prose-gray dark:prose-invert max-w-none space-y-12 prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
              
              {/* How To Use */}
              {howToUse.steps.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold font-display text-foreground">{howToUse.title}</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {howToUse.steps.map((step, idx) => (
                      <div key={idx} id={`step-${idx + 1}`} className="saas-card-premium p-6 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 brand-gradient" />
                        <div className="text-4xl font-bold text-indigo-600/30 dark:text-[#a78bfa]/40 mb-4">0{idx + 1}</div>
                        <p className="font-medium text-foreground">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Features & Benefits */}
              {(features.length > 0 || benefits.length > 0) && (
                <div className="grid md:grid-cols-2 gap-8">
                  {features.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold font-display mb-6 text-foreground">Key Features</h2>
                      <ul className="space-y-4">
                        {features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-[#a78bfa] shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {benefits.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold font-display mb-6 text-foreground">Why Use This Tool?</h2>
                      <ul className="space-y-4">
                        {benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}

              {/* FAQs */}
              {faqs.length > 0 && (
                <section className="border-t border-border pt-12">
                  <h2 className="text-2xl font-bold font-display mb-8 text-foreground">Frequently Asked Questions</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`} className="border-border">
                        <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              )}
              
            </article>

            {/* Internal Linking */}
            {relatedTools.length > 0 && (
              <div className="border-t border-border pt-12">
                <RelatedTools tools={relatedTools} isUltra={true} />
              </div>
            )}
            
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={softwareAppSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqs.length > 0 && <JsonLd data={faqSchema} />}
      {howToUse.steps.length > 0 && <JsonLd data={howToSchema} />}
      
      <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 relative">
        <style dangerouslySetInnerHTML={{ __html: `
          .tool-particle {
            position: absolute;
            border-radius: 9999px;
            background: rgba(196,181,253,0.9);
            box-shadow: 0 0 8px rgba(167,139,250,0.9);
            pointer-events: none;
            animation: toolParticleFloat 14s ease-in-out infinite;
          }
          @keyframes toolParticleFloat {
            0%,100% { transform: translateY(0) translateX(0); opacity: 0.25; }
            50% { transform: translateY(-22px) translateX(10px); opacity: 0.7; }
          }
        `}} />
        <div className="tool-particle" style={{ top: "18%", left: "16%", width: 4, height: 4, animationDelay: "0s" }} />
        <div className="tool-particle" style={{ top: "30%", right: "12%", width: 6, height: 6, animationDelay: "-3s" }} />
        <div className="tool-particle" style={{ top: "62%", left: "10%", width: 3, height: 3, animationDelay: "-6s" }} />
        <div className="tool-particle" style={{ bottom: "22%", right: "18%", width: 5, height: 5, animationDelay: "-9s" }} />
        <div className="tool-particle" style={{ top: "44%", left: "24%", width: 3, height: 3, animationDelay: "-4.5s" }} />
        <div className="tool-particle" style={{ top: "24%", right: "26%", width: 4, height: 4, animationDelay: "-7.5s" }} />

        {/* Header & Navigation */}
        <div className="max-w-4xl mx-auto mb-10 px-1">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2.5 font-display font-bold text-xl hover:opacity-90 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shrink-0">
                <img src="/logo.png" alt="Turnivo Logo" title="𝘛𝘜𝘙𝘕𝘐𘘝𝘖 Logo" width="32" height="32" className="w-8 h-8 object-cover animate-fade-in" />
              </div>
              <span className="text-[#c084fc]">
                {"\uD835\uDE1B\uD835\uDE1C\uD835\uDE19\uD835\uDE15\uD835\uDE10\uD835\uDE1D\uD835\uDE16"}
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to Home
              </Link>
            </div>
          </div>
            
          <div className="text-center space-y-4 mt-8">
            {/* On-page Breadcrumbs for accessibility/SEO */}
            <nav className="flex items-center justify-center text-[11px] font-semibold text-muted-foreground gap-2 tracking-wide" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>&gt;</span>
              <a href="/#tools" className="hover:text-foreground transition-colors">Business Documents</a>
              <span>&gt;</span>
              <span className="text-foreground truncate max-w-[180px] font-bold" aria-current="page">{h1}</span>
            </nav>

            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white brand-gradient shadow-md shadow-violet-500/30 animate-pulse">
              Turnivo Tool
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-gray-900 dark:text-white">
              {h1}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {heroDescription}
            </p>
          </div>
        </div>

        {/* Main Tool Interface */}
        <div className="w-full max-w-4xl mx-auto saas-card-premium p-4 sm:p-6 mb-16">
          {tool}
        </div>

        {/* Long Form Content for SEO */}
        <div className="max-w-4xl mx-auto space-y-16">
          <article className="prose prose-gray dark:prose-invert max-w-none space-y-12">
            
            {/* How To Use */}
            <section>
              <h2 className="text-2xl font-bold font-display">{howToUse.title}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {howToUse.steps.map((step, idx) => (
                  <div key={idx} id={`step-${idx + 1}`} className="saas-card-premium p-6 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 brand-gradient" />
                    <div className="text-4xl font-bold text-primary/20 mb-4">0{idx + 1}</div>
                    <p className="font-medium text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Features & Benefits */}
            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-2xl font-bold font-display mb-6">Key Features</h2>
                <ul className="space-y-4">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-display mb-6">Why Use This Tool?</h2>
                <ul className="space-y-4">
                  {benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* FAQs */}
            <section className="border-t border-border pt-12">
              <h2 className="text-2xl font-bold font-display mb-8">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
            
          </article>

          {/* Internal Linking */}
          <RelatedTools tools={relatedTools} isUltra={true} />
          
        </div>
      </div>
    </>
  )
}
