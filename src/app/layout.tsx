import type { Metadata, Viewport } from "next"
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import "@/components/invoice-templates/styles/print.css"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { PageTransition } from "@/components/shared/page-transition"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://quotestream.com"),
  title: {
    default: "QuoteStream — Free Professional Invoice & Quotation Generator",
    template: "%s | QuoteStream",
  },
  description:
    "Create professional invoices, quotations, and GST bills in seconds. The best free online platform for generating business documents in India. Fast, mobile-friendly, and SEO-optimized.",
  keywords: [
    "QuoteStream",
    "GST invoice generator",
    "quotation generator India",
    "free invoice maker",
    "GST billing software",
    "invoice generator India",
    "online invoice generator",
    "GST invoice format",
    "quotation format India",
    "Indian invoice software",
    "free GST billing",
  ],
  authors: [{ name: "QuoteStream" }],
  creator: "QuoteStream",
  publisher: "QuoteStream",
  alternates: {
    canonical: "https://quotestream.com",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "QuoteStream",
    title: "QuoteStream — Create Professional Invoices & Quotations in Seconds",
    description:
      "Create professional GST invoices and quotations in seconds. Free forever. Instant PDF download. No signup needed.",
    url: "https://quotestream.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuoteStream — Free Professional Invoice Generator",
    description: "Create professional GST invoices and quotations in seconds. Free forever. No signup needed.",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="global-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "QuoteStream",
                url: "https://quotestream.com",
                description:
                  "Create professional GST invoices and quotations in seconds. The best free online platform for generating business documents in India.",
                foundingDate: "2024",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "QuoteStream",
                url: "https://quotestream.com",
                description:
                  "Free GST invoice generator for Indian businesses. Create invoices, quotations, receipts, and more.",
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://quotestream.com/search?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <PageTransition>{children}</PageTransition>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
