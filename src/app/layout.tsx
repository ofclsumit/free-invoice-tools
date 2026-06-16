import type { Metadata, Viewport } from "next"
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/shared/theme-provider"
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
  metadataBase: new URL("https://quoteflow.in"),
  title: {
    default: "QuoteFlow — GST Invoice & Quotation Generator for Indian Businesses",
    template: "%s | QuoteFlow",
  },
  description:
    "Create professional GST invoices and quotations in seconds. Free forever. No signup needed. Instant PDF download. Perfect for Indian freelancers and businesses.",
  keywords: [
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
  authors: [{ name: "QuoteFlow" }],
  creator: "QuoteFlow",
  publisher: "QuoteFlow",
  alternates: {
    canonical: "https://quoteflow.in",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "QuoteFlow",
    title: "QuoteFlow — Fastest GST Invoice Generator for India",
    description:
      "Create professional GST invoices in seconds. Free forever. Instant PDF download. No signup needed.",
    url: "https://quoteflow.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuoteFlow — GST Invoice Generator",
    description: "Create professional GST invoices in seconds. Free forever. No signup needed.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "QuoteFlow",
                url: "https://quoteflow.in",
                description:
                  "Create professional GST invoices and quotations in seconds. Free forever.",
                foundingDate: "2024",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "QuoteFlow",
                url: "https://quoteflow.in",
                description:
                  "Free GST invoice generator for Indian businesses. Create invoices, quotations, and more.",
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://quoteflow.in/search?q={search_term_string}",
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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
