# Invoice Template Pack — 5 Professional Templates

Five distinct, production-ready invoice templates built with React + Tailwind CSS, inspired by Zoho Invoice, QuickBooks, FreshBooks, and Vyapar (plus one original minimalist design). All five share one data contract, so you can switch templates without touching your invoice data.

## What's inside

```
invoice-templates/
├── InvoiceTemplateGallery.jsx   ← single-file demo (all 5 templates + switcher, paste into any React app)
├── data/
│   ├── invoiceTypes.ts          ← shared TypeScript types + calculation engine (use this in your app)
│   └── sampleData.ts            ← example datasets (split GST, single GST, no GST)
├── components/
│   ├── LedgerTemplate.tsx       ← Template 1: Zoho-inspired
│   ├── ClassicBooksTemplate.tsx ← Template 2: QuickBooks-inspired
│   ├── StudioTemplate.tsx       ← Template 3: FreshBooks-inspired
│   ├── VyaparDesiTemplate.tsx   ← Template 4: Vyapar-inspired
│   ├── MinimalMonoTemplate.tsx  ← Template 5: Original minimalist
│   ├── InvoicePreview.tsx       ← wrapper: print root + mobile scaling + Print/Download buttons
│   └── index.ts                 ← barrel export
├── utils/
│   └── exportPdf.ts             ← print() helper + html2canvas/jsPDF raster export
└── styles/
    └── print.css                ← A4 print stylesheet (import once globally)
```

## The five templates

| # | Name | Inspired by | Identity |
|---|------|-------------|----------|
| 1 | **Ledger** | Zoho Invoice | Corporate blue, structured grid, Inter + IBM Plex Mono for aligned figures |
| 2 | **Classic Books** | QuickBooks | Forest green, serif headings, traditional ruled ledger table |
| 3 | **Studio** | FreshBooks | Warm coral, rounded cards, friendly Plus Jakarta Sans, card-based line items |
| 4 | **Vyapar Desi** | Vyapar | Compact GST-dense layout, saffron/maroon, boxed frame, amount-in-words, built for Indian SMB billing |
| 5 | **Minimal Mono** | — (original) | Near-black/white, hairline rules only, JetBrains Mono figures, stamp-style status mark |

## Quick start

### 1. Try it immediately
Open `InvoiceTemplateGallery.jsx` — it's fully self-contained (no imports beyond React), includes sample data, and has a working template switcher, a GST-mode toggle (No GST / Single GST / CGST+SGST split), and a desktop/mobile preview toggle. Drop it into any Tailwind-configured React project, or paste it into a Claude/CodeSandbox/StackBlitz React template.

### 2. Use individual templates in your app
```tsx
import { LedgerTemplate, InvoicePreview } from "./components";
import { sampleInvoiceSplitGst } from "./data/sampleData";
import "./styles/print.css"; // import once, globally

function InvoicePage() {
  return (
    <InvoicePreview fileName="invoice-INV-0143.pdf">
      <LedgerTemplate invoice={sampleInvoiceSplitGst} />
    </InvoicePreview>
  );
}
```

`InvoicePreview` gives you, for free:
- the `#invoice-print-root` id the print stylesheet targets
- automatic scale-to-fit on mobile viewports (the underlying sheet stays true A4 — it's visually scaled, not reflowed, so what you preview is what prints)
- a **Print** button (native browser dialog → "Save as PDF" produces a pixel-accurate A4 PDF, no dependencies)
- a **Download PDF** button (rasterizes via `html2canvas` + `jsPDF`, for a one-click download without the print dialog)

### 3. Bring your own data
All templates consume the same `InvoiceData` shape (`data/invoiceTypes.ts`). Build your object, pass it to whichever template component you like — they're interchangeable:

```ts
const invoice: InvoiceData = {
  invoiceNumber: "INV-0001",
  invoiceDate: "2026-06-21",
  currencySymbol: "₹",
  gstMode: "split", // "none" | "single" | "split"
  company: { name: "...", addressLines: [...], gstin: "..." },
  billTo: { name: "...", addressLines: [...] },
  items: [
    { id: "1", description: "...", quantity: 2, rate: 500, cgstPercent: 9, sgstPercent: 9 },
  ],
  // ...
};
```

## GST modes

The `gstMode` field controls how tax is shown and calculated, across **every** template identically (the math lives once, in `computeInvoiceTotals()`):

- **`"none"`** — no tax columns at all, for non-GST businesses or export invoices.
- **`"single"`** — one `gstPercent` per line item; displayed as a single GST column. (Internally split 50/50 into CGST/SGST for the totals math, since that's how most single-rate Indian invoices report it — only the display differs.)
- **`"split"`** — full `cgstPercent` / `sgstPercent` / `igstPercent` per line item, with separate CGST/SGST/IGST columns and totals. Use IGST-only lines for inter-state supply.

Switch modes by changing one field on the invoice object — no template code changes needed.

## Logo support

Set `company.logoUrl` to any image URL (or a data URI for an uploaded/local logo). If omitted, every template falls back to a clean monogram badge using the company's first initial, so the layout never breaks on missing assets.

## PDF export — two paths

1. **Browser print → Save as PDF** (`printInvoice()` / the Print button): zero dependencies, uses the print stylesheet, exact A4 sizing. This is the same approach Zoho/QuickBooks/FreshBooks use under the hood.
2. **One-click raster download** (`exportNodeToPdf()` / the Download PDF button): needs `html2canvas` and `jspdf`:
   ```bash
   npm install html2canvas jspdf
   ```
   Produces a downloadable `.pdf` without opening the system print dialog. Paginates automatically if content overflows one A4 page.

## Customizing colors/fonts

Each template hardcodes its identity (e.g., Ledger's blue, Classic Books' green) as either Tailwind utility classes or a couple of hex constants near the top of the component (e.g., `const green = "#1B4D3E"`). To re-theme, change those constants — the layout logic is independent of the color choices.

## Fonts used

Templates reference Google Fonts by family name (Inter, IBM Plex Mono, Source Serif 4, Plus Jakarta Sans, Noto Sans, JetBrains Mono). Load them via your app's `<head>` or `@import` — they're not bundled here. All templates fall back gracefully to system sans-serif if a font isn't loaded, so nothing breaks if you skip this step.
