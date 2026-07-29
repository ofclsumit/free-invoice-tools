import { FileText } from "lucide-react"
import { SiteLogo } from "@/components/shared/site-logo"

export const metadata = {
  title: "Terms of Service | Turnivo",
  description:
    "Turnivo terms of service — the terms governing your use of our free GST invoice and quotation generator.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-mesh py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <SiteLogo className="mb-8" />

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
          </div>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to Turnivo. By using our website and tools, you agree to these terms. Please read them carefully.
          </p>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Turnivo (&ldquo;the Service&rdquo;), you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service. If you do not agree, please do not use the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">2. Description of Service</h2>
            <p>
              Turnivo provides free online tools for generating GST invoices, quotations, receipts, and other
              business documents. All document processing is performed client-side in your browser. We do not store your
              financial data on our servers. The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
              without any warranty.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">3. User Responsibilities</h2>
            <p>As a user of Turnivo, you agree to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>Provide accurate and complete information when using our tools.</li>
              <li>Comply with all applicable laws, including GST regulations in India.</li>
              <li>Not misuse the Service for fraudulent, illegal, or unauthorized purposes.</li>
              <li>Not attempt to disrupt, overload, or compromise the Service.</li>
              <li>
                Understand that documents you generate are for reference purposes and may need professional review
                before use.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">4. Intellectual Property</h2>
            <p>
              The Turnivo name, logo, design, and software code are the intellectual property of Turnivo. You may
              not copy, modify, distribute, sell, or reverse-engineer any part of the Service without prior written
              consent.
            </p>
            <p className="mt-2">
              However, the documents you create using Turnivo — invoices, quotations, receipts — are entirely your
              property. We claim no ownership over the content you generate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">5. Limitation of Liability</h2>
            <p>
              Turnivo is provided free of charge. To the maximum extent permitted by law, Turnivo and its creators
              shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from
              your use of the Service.
            </p>
            <p className="mt-2">
              We do not guarantee that the Service will be uninterrupted, error-free, or that generated documents comply
              with specific legal or regulatory requirements. You are responsible for reviewing documents for accuracy
              and consulting with a qualified professional if needed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be posted on this page with an
              updated date. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mt-8 mb-3">7. Contact</h2>
            <p>
              For questions about these terms, please reach out at{" "}
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
