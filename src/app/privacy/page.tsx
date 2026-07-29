import { Shield } from "lucide-react"
import { SiteLogo } from "@/components/shared/site-logo"

export const metadata = {
  title: "Privacy Policy | Turnivo",
  description:
    "Turnivo privacy policy — how we handle, store, and protect your data. All processing is done client-side in your browser.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-mesh py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <SiteLogo className="mb-8" />

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
          </div>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            At Turnivo, your privacy matters. This policy explains what data we collect, how we use it, and your
            rights. The short version: <strong>all invoice data stays in your browser</strong> — we never see it.
          </p>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">Information We Collect</h2>
            <p>
              Turnivo is designed to work without an account. We collect the bare minimum needed to provide the
              service:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Usage data</strong> — anonymous page views and feature interactions via cookies (see below).
              </li>
              <li>
                <strong>Invoice data</strong> — company name, client details, line items, GST numbers — all stored
                exclusively in your browser&apos;s localStorage. We never upload, store, or process this data on our
                servers.
              </li>
              <li>
                <strong>Contact form data</strong> — if you reach out via our contact form, we receive your name, email,
                and message solely to respond to your inquiry.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>To provide and improve the Turnivo application.</li>
              <li>To respond to support requests and feedback.</li>
              <li>To analyze aggregate usage patterns so we can build better features.</li>
            </ul>
            <p className="mt-2">We do not sell, rent, or share your personal data with third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">Data Storage &amp; Processing</h2>
            <p>
              Turnivo uses a <strong>client-first architecture</strong>. Every invoice, quotation, receipt, and
              document you create is generated and rendered inside your browser using JavaScript. Your data is saved to{" "}
              <code className="text-sm bg-muted px-1.5 py-0.5 rounded">localStorage</code> — the same storage websites
              use to remember your preferences. It never touches our servers.
            </p>
            <p className="mt-2">
              When you download a PDF, the document is generated entirely on your device. We do not store copies of your
              invoices, quotations, or any financial data on our backend.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">Cookies</h2>
            <p>We use minimal cookies for essential functionality:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Theme preference</strong> — remembers whether you prefer light or dark mode.
              </li>
              <li>
                <strong>Analytics</strong> — we may use anonymous analytics (e.g., page views) to understand which
                features are most popular. No personally identifiable information is collected.
              </li>
            </ul>
            <p className="mt-2">
              You can disable cookies in your browser settings, though some features may not work as expected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">Third-Party Services</h2>
            <p>Turnivo uses the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Vercel</strong> — hosting provider. Vercel may collect standard server logs (IP address, request
                timing) for operational purposes.
              </li>
              <li>
                <strong>Google Fonts</strong> — typeface delivery. Font files are loaded from Google&apos;s CDN.
              </li>
            </ul>
            <p className="mt-2">
              We do not use tracking pixels, social media widgets, or advertising networks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">Your Rights</h2>
            <p>You have full control over your data:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Access</strong> — view all data stored in your browser by checking Developer Tools → Application
                → Local Storage.
              </li>
              <li>
                <strong>Deletion</strong> — clear all Turnivo data by going to Settings → Clear Data, or clearing your
                browser&apos;s localStorage for this site.
              </li>
              <li>
                <strong>Export</strong> — use the export feature in the app to download your data as JSON.
              </li>
              <li>
                <strong>Withdraw consent</strong> — simply stop using the site. No further action is needed.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">Contact</h2>
            <p>
              If you have questions about this policy or your data, reach out at{" "}
              <a href="mailto:support@Turnivo.in" className="text-primary hover:underline">
                support@Turnivo.in
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
