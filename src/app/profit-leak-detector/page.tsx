import { Metadata } from "next"
import Link from "next/link"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { ProfitLeakClient } from "./profit-leak-client"
import {
  TrendingDown,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  Building2,
  ShoppingCart,
  Briefcase,
  Layers,
  HelpCircle,
  BarChart,
  Scale,
  Percent,
} from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["profit-leak-detector"]
  return generateToolMetadata(content)
}

export default function ProfitLeakDetectorPage() {
  const content = toolContentDictionary["profit-leak-detector"]

  return (
    <ToolLayout
      {...content}
      description={content.metaDescription}
      schemaUrl={`https://turnivo.in/${content.slug}`}
      tool={
        <div className="space-y-12">
          <ProfitLeakClient />

          {/* COMPREHENSIVE EDITORIAL & EDUCATIONAL GUIDE */}
          <section className="pt-12 border-t border-slate-200 dark:border-white/10 space-y-12 text-slate-800 dark:text-slate-200">
            {/* Section 1: What Is a Profit Leak? */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                What Is a Profit Leak?
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                A <strong>profit leak</strong> is an unmonitored operational expense, pricing concession, process inefficiency, or transactional micro-drag that silently reduces your business&apos;s net bottom-line earnings. Unlike catastrophic business losses, profit leaks do not appear as sudden red flags. Instead, they compound gradually across hundreds of daily transactions, subscriptions, discounts, and customer interactions.
              </p>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                For instance, a 5% unbudgeted discount offered by sales reps combined with a 2.9% merchant payment fee and a 7% return rate can easily consume more than <strong>40% of an enterprise&apos;s total operating profit</strong>, even when top-line revenue looks healthy.
              </p>
            </div>

            {/* Section 2: How the Profit Leak Detector Works */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                How the Profit Leak Detector Works
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                The TURNIVO Profit Leak Detector is built on a <strong>100% deterministic financial diagnostic engine</strong>. Rather than applying generic static formulas, the detector follows an analytical workflow:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Step 1: Regional Calibration
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Market-Specific Cost Engines
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Adapts currency ($ USD or ₹ INR) and evaluates country-specific structures like US payment interchange or Indian GST, COD, and RTO logistics.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Step 2: Diagnosis & Ranking
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Isolates True Profit Leaks
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ranks your leaks in descending order of financial impact, spotlighting your single largest vulnerability with root-cause analysis.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Step 3: Action & Modeling
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Scenario Modeling & Audit
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Simulates potential profit recoveries (5% to 20% leak reduction) and generates a printable grayscale PDF audit report.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Common Profit Leaks in Small Businesses */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                Common Profit Leaks in Small Businesses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Percent className="w-4 h-4 text-rose-500" />
                    Unmonitored Discounts & Price Concessions
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Offering informal discounts to close sales lowers your gross margin percentage faster than any fixed overhead increase. Calculate your true markup with the{" "}
                    <Link href="/profit-margin" className="text-violet-600 dark:text-violet-400 underline font-semibold">
                      Profit Margin Calculator
                    </Link>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-500" />
                    Merchant Gateway & Micro-Fees Drag
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Payment processors charge transaction fees, cross-border currency conversion fees, and payout holding rates. In the US, Stripe/Square fees average 2.9% + $0.30; in India, gateway drag hovers around 2% plus 18% GST on the fee.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    SaaS Subscription Sprawl & Inactive Seats
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Recurring software licenses, project management tools, and cloud storage seats accumulate unnoticed on company credit cards long after employees depart or projects conclude.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-purple-500" />
                    Unbilled Revision Hours & Scope Creep
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Failing to bound client revisions or provide formal change orders dilutes your team&apos;s effective hourly billing rate. Standardize client quotes using the{" "}
                    <Link href="/quotation-generator" className="text-violet-600 dark:text-violet-400 underline font-semibold">
                      Quotation Generator
                    </Link>.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Profit Leaks in Ecommerce */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                Profit Leaks in Ecommerce & D2C Brands
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Direct-to-Consumer (D2C) and marketplace sellers on Amazon, Flipkart, Walmart, and Shopify face unique high-velocity profit drains:
              </p>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                <li>
                  <strong>Customer Acquisition Cost (CAC) vs. Contribution Margin:</strong> Spending heavily on Meta or Google Ads without deducting product COGS, packaging, and merchant fees results in revenue growth that burns cash.
                </li>
                <li>
                  <strong>Two-Way Return Logistics Drag:</strong> In fashion and footwear ecommerce, return rates often reach 20% to 30%. Reverse shipping, repackaging, and unsellable open-box inventory consume the profits of two successful deliveries.
                </li>
                <li>
                  <strong>India D2C Cash-on-Delivery (COD) RTO Losses:</strong> In the Indian market, unverified COD orders suffer a 20%-35% Return-to-Origin (RTO) rate. Couriers charge two-way freight even when the customer refuses delivery at the door.
                </li>
                <li>
                  <strong>Marketplace Platform Commissions & Closing Fees:</strong> Amazon and Flipkart referral fees, fixed closing fees, and fulfillment weight-handling surcharges often take 18% to 32% of the customer retail price.
                </li>
              </ul>
            </div>

            {/* Section 5: Profit Leaks in Service Businesses */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                Profit Leaks in Service Businesses & Agencies
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Service providers, marketing agencies, consultancies, and software development shops sell billable time and domain expertise. For service businesses, profit leaks are primarily operational:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Unscoped Client Revisions
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Delivering &quot;quick favors&quot; or extra design iterations without logging additional billable hours erodes project profitability. Track your milestone billing with clean{" "}
                    <Link href="/invoice-generator" className="text-violet-600 dark:text-violet-400 underline font-semibold">
                      GST Invoices
                    </Link>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Contractor Utilization Gaps
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Hiring external subcontractors on flat monthly retainers when project scope drops creates fixed labor overhead that eats into retainer margins.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6: Profit Leakage vs Cash-Flow Problems */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                Profit Leakage vs Cash-Flow Problems
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                A critical principle in financial management is understanding the difference between <strong>lost profit</strong> and <strong>trapped working capital</strong>:
              </p>
              <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="p-3">Dimension</th>
                      <th className="p-3 text-rose-700 dark:text-rose-400">Profit Leakage (Permanent Loss)</th>
                      <th className="p-3 text-blue-700 dark:text-blue-400">Cash-Flow Pressure (Temporary Lockup)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Definition</td>
                      <td className="p-3">Expenses or concessions that permanently destroy margin.</td>
                      <td className="p-3">Earned capital that is temporarily illiquid.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Examples</td>
                      <td className="p-3">Payment gateway fees, discounts, return logistics, dead stock write-offs.</td>
                      <td className="p-3">Overdue client invoices (A/R), seasonal stock sitting in warehouses.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Financial Impact</td>
                      <td className="p-3">Reduces your net profit on the income statement.</td>
                      <td className="p-3">Creates short-term payroll and liquidity crunches on the balance sheet.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Resolution</td>
                      <td className="p-3">Renegotiate vendor rates, tighten return policies, reduce blanket discounts.</td>
                      <td className="p-3">Enforce strict Net-15 payment terms, invoice factoring, early-pay discounts.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 7: How to Investigate a Profit Leak */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                How to Investigate and Fix a Profit Leak
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    1. Audit Your Payment Processing Statements
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Examine monthly merchant processing statements for hidden interchange-plus surcharges, batch fees, and international currency markup fees. If monthly volume exceeds $30k (or ₹25 Lakhs), request custom volume interchange tiers.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    2. Eliminate Blanket Discounting
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Replace discretionary sales discounts with value-add bonuses or tiered order volume minimums. Calculate your volume sensitivity with the{" "}
                    <Link href="/break-even-calculator" className="text-violet-600 dark:text-violet-400 underline font-semibold">
                      Break-Even Calculator
                    </Link>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    3. Optimize Return Freight & RTO Verification
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    For Indian D2C businesses, require automated WhatsApp/OTP confirmation on all Cash on Delivery orders to eliminate 50%+ of RTO shipping losses. For US retail, update size guides to reduce fit-related returns.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    4. Conduct a Quarterly SaaS Subscription Purge
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Perform a complete credit card audit every 90 days. Deprovision inactive user seats, cancel duplicate project management tools, and negotiate annual billing discounts on essential software.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      }
      isUltra={true}
    />
  )
}
