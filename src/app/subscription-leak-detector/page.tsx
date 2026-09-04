import { Metadata } from "next"
import Link from "next/link"
import { ToolLayout } from "@/components/seo/tool-layout"
import { toolContentDictionary } from "@/lib/seo/content-dictionary"
import { generateToolMetadata } from "@/lib/seo/metadata-helper"
import { SubscriptionLeakClient } from "./subscription-leak-client"
import {
  Layers,
  AlertCircle,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Building2,
  User,
  Sparkles,
  HelpCircle,
  Scale,
  DollarSign,
  TrendingUp,
} from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const content = toolContentDictionary["subscription-leak-detector"]
  return generateToolMetadata(content)
}

export default function SubscriptionLeakDetectorPage() {
  const content = toolContentDictionary["subscription-leak-detector"]

  return (
    <ToolLayout
      {...content}
      description={content.metaDescription}
      schemaUrl={`https://turnivo.in/${content.slug}`}
      tool={
        <div className="space-y-12">
          <SubscriptionLeakClient />

          {/* COMPREHENSIVE EDITORIAL & EDUCATIONAL GUIDE */}
          <section className="pt-12 border-t border-slate-200 dark:border-white/10 space-y-12 text-slate-800 dark:text-slate-200">
            {/* Section 1: What Is a Subscription Leak? */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                What Is a Subscription Leak?
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                A <strong>subscription leak</strong> is an unmonitored recurring charge for software, media streaming, cloud storage, memberships, or SaaS tools that you no longer actively use, duplicate elsewhere, or continue paying for at inflated renewal rates.
              </p>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Because individual recurring fees often look small—such as $15/month or ₹499/month—they slip beneath everyday financial scrutiny. Over a year, five overlooked subscriptions easily compound to hundreds or thousands of dollars in silent budget drain.
              </p>
            </div>

            {/* Section 2: How the Subscription Leak Detector Works */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                How the Subscription Leak Detector Works
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Rather than acting as an invasive bank-scraping tool, the TURNIVO Subscription Leak Detector uses a <strong>client-side deterministic audit engine</strong>. You enter your recurring services, and the diagnostic analyzes your portfolio across four transparent dimensions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span className="p-1 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                    1. Inactivity & Dormancy
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Flags subscriptions marked as &ldquo;Never used&rdquo; or last active more than 3 months ago so you can cancel before the next auto-renewal.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span className="p-1 rounded bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300">
                      <Layers className="w-4 h-4" />
                    </span>
                    2. Functional Category Overlap
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Groups tools in identical categories (such as multiple design suites or cloud storage providers) to evaluate if consolidation is viable.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span className="p-1 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                    3. Price Increases & Tier Creep
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Calculates annual financial impact when vendors increase monthly renewal prices, ensuring you reassess the tool&apos;s actual ROI.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span className="p-1 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                      <Scale className="w-4 h-4" />
                    </span>
                    4. Spend Proportion & Outliers
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Highlights subscriptions that consume a disproportionate share of your recurring budget, prompting team seat and tier reviews.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: How Much Do Subscriptions Cost Per Year? */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                How Much Do Subscriptions Cost Per Year?
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                A common psychological trap in subscription billing is <em>unit discounting</em>. A service priced at $49/month or ₹3,500/month feels affordable on an invoice-by-invoice basis. However, over a 12-month cycle, that single subscription represents an annualized commitment of $588 or ₹42,000.
              </p>

              <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-xl">
                <table className="w-full text-xs sm:text-sm text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-black/40 text-slate-900 dark:text-white font-bold">
                    <tr>
                      <th className="p-3 border-b border-slate-200 dark:border-white/10">Billing Interval</th>
                      <th className="p-3 border-b border-slate-200 dark:border-white/10">Example Price</th>
                      <th className="p-3 border-b border-slate-200 dark:border-white/10 text-right">Annual Commitment</th>
                      <th className="p-3 border-b border-slate-200 dark:border-white/10">Cumulative 3-Year Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    <tr>
                      <td className="p-3 font-medium">Weekly App Service</td>
                      <td className="p-3 font-mono">$4.99 / week</td>
                      <td className="p-3 font-mono font-bold text-right text-slate-900 dark:text-white">$259.48 / yr</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">$778.44</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Standard SaaS Tool</td>
                      <td className="p-3 font-mono">$29.00 / month</td>
                      <td className="p-3 font-mono font-bold text-right text-slate-900 dark:text-white">$348.00 / yr</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">$1,044.00</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Professional Creative Suite</td>
                      <td className="p-3 font-mono">$79.99 / month</td>
                      <td className="p-3 font-mono font-bold text-right text-slate-900 dark:text-white">$959.88 / yr</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">$2,879.64</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Team CRM / Workspace (5 Seats)</td>
                      <td className="p-3 font-mono">$150.00 / month</td>
                      <td className="p-3 font-mono font-bold text-right text-slate-900 dark:text-white">$1,800.00 / yr</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">$5,400.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: How to Find and Audit Unused Subscriptions */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                How to Find and Audit Unused Subscriptions
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Conducting a quarterly subscription audit takes less than 15 minutes and yields immediate financial clarity:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase">Step 01</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Review Credit Card & Bank Statements</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Check your last 60 days of credit card statements for recurring auto-debit charges from Apple, Google Play, Stripe, Razorpay, or PayPal.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase">Step 02</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assess 30-Day Activity</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ask: <em>&ldquo;Did I open or utilize this service in the last 30 days?&rdquo;</em> If the answer is no, mark it as a candidate for pause or cancellation.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase">Step 03</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Export & Track Audit Plan</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Use our Download Report feature to generate a printable PDF checklist of upcoming renewals and review dates for your team or household.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: How Businesses Can Control Recurring Software Costs */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 rounded-full bg-violet-600 shrink-0" />
                How Businesses Can Control Recurring Software Costs
              </h2>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                For commercial teams and agencies, <strong>seat sprawl</strong> is the primary source of subscription leakage. When team members change roles or depart, recurring licenses in Slack, Figma, GitHub, Jira, or Zoom often remain active indefinitely.
              </p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                <li><strong>Deactivate Orphaned Seats:</strong> Match active software seat counts against your current employee payroll ledger.</li>
                <li><strong>Consolidate Multi-Tool Workflows:</strong> Standardize communication and task tracking across one platform rather than paying for redundant team apps.</li>
                <li><strong>Negotiate Annual Terms for Core Tools:</strong> While unused subscriptions should be cancelled, core tools you use daily typically offer 15%–25% discounts when switched from monthly to annual billing.</li>
              </ul>
            </div>

            {/* Section 6: Relevant Tools */}
            <div className="p-6 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/30 rounded-2xl space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Explore More Financial & Cost Diagnostics on TURNIVO
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/profit-leak-detector"
                  className="p-3 bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-xl hover:border-violet-500 transition-colors group"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 flex items-center justify-between">
                    Profit Leak Detector <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                    Audit business COGS, advertising waste, payment fees, and margins.
                  </span>
                </Link>

                <Link
                  href="/profit-margin"
                  className="p-3 bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-xl hover:border-violet-500 transition-colors group"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 flex items-center justify-between">
                    Profit Margin Calculator <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                    Calculate gross margin, net margin, and markup percentages.
                  </span>
                </Link>

                <Link
                  href="/break-even-calculator"
                  className="p-3 bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-xl hover:border-violet-500 transition-colors group"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 flex items-center justify-between">
                    Break-Even Calculator <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                    Find unit sales volume required to cover fixed overhead.
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      }
    />
  )
}
