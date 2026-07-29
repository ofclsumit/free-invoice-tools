# Turnivo — GST Invoice & Quotation Generator

A modern, fast, mobile-first SaaS application for creating GST-compliant invoices and quotations, built for Indian freelancers and businesses. Built to be faster and simpler than Zoho Invoice, Refrens, Vyapar, and Invoicely.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth.js v5 (Credentials + Google OAuth)
- **Forms:** React Hook Form + Zod validation
- **PDF generation:** jsPDF + jspdf-autotable (client-side, instant, no server round-trip)
- **QR codes:** `qrcode` (UPI payment QR embedded in PDFs)
- **Charts:** Recharts
- **PWA:** next-pwa (installable, offline-capable shell)

## Project Structure

```
Turnivo/
├── prisma/
│   └── schema.prisma          # Full DB schema: Users, Clients, Invoices, Quotations, Items, Templates, Settings
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout (fonts, theme provider)
│   │   ├── globals.css                 # Design tokens, glassmorphism, status badges
│   │   ├── middleware.ts               # Route protection (auth gating)
│   │   ├── auth/signin, signup/        # Auth pages
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Sidebar + topbar shell
│   │   │   ├── page.tsx                # Stats, revenue chart, recent activity
│   │   │   ├── invoices/                # List + /new generator
│   │   │   ├── quotations/              # List + /new generator
│   │   │   ├── clients/                 # Client management
│   │   │   └── settings/                # Business profile, UPI, branding
│   │   ├── tools/                      # Free SEO tools (GST calculator, etc.)
│   │   └── api/
│   │       ├── auth/[...nextauth]      # NextAuth handler
│   │       ├── auth/register           # Credential registration
│   │       ├── invoices/               # CRUD + server-side tax calculation
│   │       ├── quotations/             # CRUD + /convert (quote→invoice)
│   │       └── clients/                # CRUD
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (button, input, select, etc.)
│   │   ├── landing/              # Hero, features, pricing, FAQ, testimonials
│   │   ├── dashboard/            # Stats cards, sidebar, charts, activity feeds
│   │   ├── invoice/               # Invoice form + live preview
│   │   ├── quotation/             # Quotation form + live preview
│   │   └── shared/                # Theme provider/toggle, user menu, session provider
│   ├── lib/
│   │   ├── auth/                 # NextAuth config
│   │   ├── prisma/               # Prisma client singleton
│   │   ├── pdf/                  # generate-invoice.ts, generate-quotation.ts
│   │   └── utils.ts              # GST math, GSTIN validation, formatting helpers
│   └── hooks/
│       └── use-toast.ts
└── package.json
```

## Database Schema (Prisma)

Core models: `User`, `Client`, `Invoice`, `InvoiceItem`, `Quotation`, `QuotationItem`, `Template`, `Settings`, plus NextAuth's `Account`/`Session`/`VerificationToken`.

Key design choices:
- **Snapshot fields on Invoice/Quotation** (`businessName`, `clientName`, etc.) — so historical documents don't change if you later edit your business profile or a client's saved details.
- **`publicToken`** on Invoice/Quotation — enables shareable public links without exposing internal IDs.
- **`InvoiceStatus` / `QuotationStatus` enums** — drive the status-tracking feature (Draft → Sent → Viewed → Paid/Overdue, or Draft → Sent → Accepted/Rejected/Expired → Converted).
- **`GstType` enum** (`CGST_SGST` / `IGST` / `EXEMPT`) per line item — correctly models intra-state vs inter-state GST.

## Getting Started

### 1. Prerequisites
- Node.js 18.18+ 
- PostgreSQL 14+ (or a hosted instance — Neon, Supabase, Railway, RDS)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Fill in:
- `DATABASE_URL` — your Postgres connection string
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional, for Google sign-in
- `SMTP_*` — optional, for "Email Invoice" feature

### 4. Set up the database
```bash
npm run db:generate   # generate Prisma client
npm run db:push       # push schema to your database (or use db:migrate for migrations)
```

### 5. Run the dev server
```bash
npm run dev
```
Visit `http://localhost:3000`.

## Key Features Implemented

**GST Invoice Generator** (`/dashboard/invoices/new`)
- Live-updating preview panel as you type (split-pane desktop layout)
- Per-line-item HSN/SAC code, quantity, unit, rate, discount %, GST rate
- Auto-calculates CGST/SGST (intra-state) or IGST (inter-state) per item
- Subtotal, discount, tax breakdown, and grand total computed client-side for instant preview, **and recomputed server-side on save** (API never trusts client math)
- Amount-in-words (Indian numbering: Lakh/Crore) rendered into the PDF
- One-click PDF download (`generate-invoice.ts` — pure client-side jsPDF, no server roundtrip needed for instant export)
- UPI QR code auto-embedded in the PDF footer when a UPI ID is provided
- WhatsApp share with pre-filled message
- Status tracking enum: Draft/Sent/Viewed/Paid/Overdue/Cancelled

**Quotation Generator** (`/dashboard/quotations/new`)
- Same live-preview pattern, violet-themed to visually distinguish from invoices
- "Convert to Invoice" — both a client-side flow (`sessionStorage` handoff into the invoice generator) and a server-side endpoint (`POST /api/quotations/[id]/convert`) that copies line items into a new Invoice inside a DB transaction and marks the quotation `CONVERTED`
- Status enum: Draft/Sent/Viewed/Accepted/Rejected/Expired/Converted

**Client Management** (`/dashboard/clients`)
- Search, summary stats, per-client billing history surface (invoice count, total billed, last invoice date)

**Free SEO Tools** (`/tools`)
- GST Calculator (inclusive/exclusive toggle, CGST/SGST split) implemented in full
- Index page scaffolds the rest (GSTIN validator, HSN finder, receipt generator, purchase order, delivery challan, profit margin calculator) — same pattern, swap the calculation logic

**Security**
- NextAuth session-gated `middleware.ts` protects all `/dashboard/*` routes
- Every API route re-checks `session.user.id` ownership before reading/writing (no trusting client-supplied user IDs)
- Zod validation on every API input
- Simple in-memory rate limiter on invoice creation (swap for Redis/Upstash in production)
- Prisma parameterized queries throughout — no raw SQL, no injection surface

## PDF Generation Approach

PDFs are generated **entirely client-side** with `jsPDF` + `jspdf-autotable` (`src/lib/pdf/generate-invoice.ts`, `generate-quotation.ts`). This is the single biggest speed differentiator vs. competitors that round-trip to a server (often via headless Chrome/Puppeteer) to render PDFs — Turnivo's "Download PDF" is instant because the browser does the rendering work directly from the already-computed form state.

The UPI QR code is generated with the `qrcode` package using the standard `upi://pay?pa=...&pn=...&am=...&cu=INR` deep-link format, which is scannable by any UPI app (GPay, PhonePe, Paytm, BHIM).

## Deployment

### Vercel (recommended)
```bash
npm i -g vercel
vercel
```
Set the same environment variables from `.env.example` in the Vercel project settings. Use a serverless-friendly Postgres provider (Neon, Supabase, or Vercel Postgres) since Vercel functions are stateless/ephemeral.

### Docker
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Database migrations in production
```bash
npx prisma migrate deploy
```

## Performance Notes

- Server Components by default for static/landing content — only interactive forms (`"use client"`) ship JS
- Fonts loaded via `next/font/google` with `display: swap` — no render-blocking font requests
- Charts (`recharts`) and PDF libraries (`jspdf`, `qrcode`) are dynamically imported inside the PDF-generation function rather than bundled into the initial page load
- Tailwind's JIT compiler keeps shipped CSS minimal
- Images should be served via `next/image` (remote patterns already configured in `next.config.js`) once real logo/avatar uploads are wired to a storage provider

## What's Stubbed vs. Fully Wired

To keep this deliverable buildable, a few areas use realistic mock data in the UI (dashboard stats, invoice/quotation list tables, client list) while the **underlying API routes and Prisma schema are fully real** and ready to swap in:
- Replace the `MOCK_*` arrays in `dashboard/invoices/page.tsx`, `dashboard/clients/page.tsx`, and `components/dashboard/*` with `fetch` calls (or React Server Component direct Prisma queries) against the already-implemented `/api/invoices`, `/api/clients`, `/api/quotations` routes.
- File upload for logo/signature needs a storage provider wired in (Vercel Blob, S3, or Cloudinary) — the Settings page UI is ready, just needs the upload handler.
- Email sending (`nodemailer`) needs real SMTP credentials; the "Email Invoice" button is present in the UI and ready to call a new `/api/invoices/[id]/send` route using the configured SMTP settings.
