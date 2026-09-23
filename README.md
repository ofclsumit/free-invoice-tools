# Turnivo — Free Professional Business Tools & Document Generator

Turnivo is India's most comprehensive free business document platform. Create GST-compliant invoices, quotations, receipts, salary slips, resumes, and run financial diagnostics in seconds.

## Architecture

Turnivo is built as a pure, high-performance client-side web application with zero remote database dependencies:
- **No Database:** No Supabase, PostgreSQL, or SQLite requirements.
- **No User Tracking:** Zero server-side tracking, database telemetry, or analytics bottlenecks.
- **No Authentication Required:** Instant public access to all 28+ tools without logins or paywalls.
- **Client-Side Document Processing:** All calculations, formatting, previews, and PDF generation happen 100% locally in the user's browser.
- **Privacy-First:** User financial data and document inputs remain on their own device.

## Tech Stack

- **Framework:** Next.js (App Router, Static & Dynamic Page Optimization)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Radix UI primitives
- **Icons:** Lucide React
- **Animations:** Framer Motion & GSAP
- **Forms & Validation:** React Hook Form + Zod
- **Document Previews:** Client-side HTML preview engine with zoom/pan and responsive viewport
- **PDF Generation:** Multi-page selectable vector PDF pipeline (`jsPDF` + `html2canvas` + print CSS)
- **QR Codes:** `qrcode` (UPI payment QR code generation)
- **Deployment:** Fully static / serverless edge deployable (Vercel, Cloudflare, etc.)

## Getting Started

### 1. Prerequisites
- Node.js 18.18+

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Build for production
```bash
npm run build
```

## License

Private © Turnivo. All rights reserved.
