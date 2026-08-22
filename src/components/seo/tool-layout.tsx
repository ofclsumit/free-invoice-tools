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
import { StarsBackground } from "../shared/stars-background"
import { SiteLogo } from "@/components/shared/site-logo"

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

  const isCalculator = [
    "gst-calculator", "reverse-gst-calculator", "gst-split-calculator",
    "discount-calculator", "profit-margin", "break-even-calculator",
    "commission-calculator", "emi-calculator", "loan-calculator", "interest-calculator"
  ].some(slug => schemaUrl?.includes(slug));

  const isUtility = [
    "hsn-finder", "gstin-validator", "gst-rate-finder"
  ].some(slug => schemaUrl?.includes(slug));

  const categoryName = isCalculator 
    ? "Financial Calculators" 
    : isUtility 
    ? "Utilities & Tools" 
    : "Document Generators";

  const categoryHref = isCalculator 
    ? "/#cat-calculators" 
    : isUtility 
    ? "/#cat-utilities" 
    : "/#cat-document";

  const categoryBadge = isCalculator 
    ? "Financial Calculator" 
    : isUtility 
    ? "Utility & Tool" 
    : "Document Generator";

  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={softwareAppSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqs.length > 0 && <JsonLd data={faqSchema} />}
      {howToUse.steps.length > 0 && <JsonLd data={howToSchema} />}
      
      <StarsBackground className="min-h-screen py-8 px-4 sm:py-12 relative text-foreground">

        {/* Header & Navigation */}
        <div className="max-w-4xl mx-auto mb-10 px-1">
          <div className="flex items-center justify-between">
            <SiteLogo />
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
              <a href={categoryHref} className="hover:text-foreground transition-colors">{categoryName}</a>
              <span>&gt;</span>
              <span className="text-foreground truncate max-w-[180px] font-bold" aria-current="page">{h1}</span>
            </nav>

            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white brand-gradient shadow-md shadow-violet-500/30 animate-pulse">
              {categoryBadge}
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
        <div className={isUltra ? "w-full max-w-4xl mx-auto mb-16" : "w-full max-w-4xl mx-auto saas-card-premium p-4 sm:p-6 mb-16"}>
          {tool}
        </div>

        {/* Long Form Content for SEO */}
        <div className="max-w-4xl mx-auto space-y-16">
          <article className="prose prose-gray dark:prose-invert max-w-none space-y-12 prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
            
            {/* How To Use */}
            {howToUse.steps.length > 0 && (
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
            )}

            {/* Features & Benefits */}
            {(features.length > 0 || benefits.length > 0) && (
              <div className="grid md:grid-cols-2 gap-8">
                {features.length > 0 && (
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
                )}

                {benefits.length > 0 && (
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
                )}
              </div>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
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
            )}
            
          </article>

          {/* Internal Linking */}
          {relatedTools.length > 0 && (
            <div className="border-t border-border pt-12">
              <RelatedTools tools={relatedTools} isUltra={true} />
            </div>
          )}
          
        </div>
      </StarsBackground>
    </>
  )
}
