import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const domain = "https://turnivo.in"

  return [
    // 1. Homepage
    {
      url: `${domain}/`,
      changeFrequency: "weekly",
      priority: 1.0,
    },

    // 2. Major Document Generators
    {
      url: `${domain}/invoice-generator`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${domain}/quotation-generator`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${domain}/proforma-invoice`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${domain}/purchase-order`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${domain}/delivery-challan`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${domain}/payment-receipt`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${domain}/rent-receipt`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${domain}/salary-slip`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${domain}/estimate-generator`,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    // 3. Specialized Invoice Generators
    {
      url: `${domain}/invoice-generator/freelancer`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/invoice-generator/gst-invoice`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/invoice-generator/tax-invoice`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/invoice-generator/consultant`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/invoice-generator/designer`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/invoice-generator/developer`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/invoice-generator/tuition`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/invoice-generator/shop`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/invoice-generator/agency`,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // 4. Secondary Document Tools
    {
      url: `${domain}/credit-note`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/debit-note`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/business-letter`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/rent-receipt-generator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/salary-slip-generator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // 5. Financial Calculators & Utilities
    {
      url: `${domain}/gst-calculator`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${domain}/reverse-gst-calculator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/gst-split-calculator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/gst-rate-finder`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/emi-calculator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/loan-calculator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/interest-calculator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/profit-margin`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/break-even-calculator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/commission-calculator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/discount-calculator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/hsn-finder`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/gstin-validator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${domain}/calculator/gst-calculator`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/calculator/emi-calculator`,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // 6. Business Guides
    {
      url: `${domain}/guides/gst-invoice-format`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/guides/how-to-create-invoice`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/guides/quotation-vs-invoice`,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // 7. Blog Hub & Articles
    {
      url: `${domain}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${domain}/blog/best-invoice-generator-india`,
      lastModified: new Date("2026-06-23T10:25:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/blog/gst-billing-guide`,
      lastModified: new Date("2026-06-23T10:30:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/blog/gst-invoice-format-guide`,
      lastModified: new Date("2026-06-23T10:10:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/blog/how-to-create-gst-invoice-in-india`,
      lastModified: new Date("2026-06-23T10:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/blog/how-to-generate-professional-invoices`,
      lastModified: new Date("2026-06-23T10:20:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/blog/invoice-format-pdf-download`,
      lastModified: new Date("2026-06-23T10:05:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/blog/invoice-vs-quotation`,
      lastModified: new Date("2026-06-23T10:15:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/blog/proforma-invoice-explained`,
      lastModified: new Date("2026-06-23T10:45:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/blog/quotation-format-businesses`,
      lastModified: new Date("2026-06-23T10:40:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${domain}/blog/receipt-format-pdf`,
      lastModified: new Date("2026-06-23T10:35:00Z"),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // 8. Company & Legal
    {
      url: `${domain}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${domain}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${domain}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${domain}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
}
