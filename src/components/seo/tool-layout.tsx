import React from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { JsonLd } from "./json-ld"
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
}: ToolLayoutProps) {
  // Generate Schemas
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://quoteflow.in" },
      { "@type": "ListItem", position: 2, name: h1, item: schemaUrl },
    ],
  }

  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      
      <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12">
        
        {/* Header & Navigation */}
        <div className="max-w-[1400px] mx-auto mb-10 px-1">
          <Link href="/" className="inline-flex items-center gap-2.5 font-display font-bold text-xl hover:opacity-90 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-glow-sm shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              QuoteFlow
            </span>
          </Link>
            
            <div className="text-center space-y-4 mt-6">
              <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-gray-900 dark:text-white">
                {h1}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {heroDescription}
              </p>
            </div>
        </div>

        {/* Main Tool Interface */}
        <div className="w-full max-w-[1400px] mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-border p-4 sm:p-6 shadow-glass mb-16">
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
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-border">
                    <div className="text-4xl font-bold text-primary/20 mb-4">0{idx + 1}</div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{step}</p>
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
          <RelatedTools tools={relatedTools} />
          
        </div>
      </div>
    </>
  )
}
