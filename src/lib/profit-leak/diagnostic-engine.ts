export type CountryCode = "US" | "IN" | "OTHER"

export type BusinessType =
  | "retail"
  | "service"
  | "freelance"
  | "ecommerce"
  | "wholesale"
  | "other"

export type ImpactLevel = "HIGH IMPACT" | "MEDIUM IMPACT" | "LOW IMPACT" | "MONITOR"

export interface SupportedCurrency {
  code: string
  symbol: string
  label: string
  locale: string
}

export const SUPPORTED_CURRENCIES: Record<string, SupportedCurrency> = {
  USD: { code: "USD", symbol: "$", label: "USD ($) - US Dollar", locale: "en-US" },
  INR: { code: "INR", symbol: "₹", label: "INR (₹) - Indian Rupee", locale: "en-IN" },
  EUR: { code: "EUR", symbol: "€", label: "EUR (€) - Euro", locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", label: "GBP (£) - British Pound", locale: "en-GB" },
  CAD: { code: "CAD", symbol: "CA$", label: "CAD ($) - Canadian Dollar", locale: "en-CA" },
  AUD: { code: "AUD", symbol: "A$", label: "AUD ($) - Australian Dollar", locale: "en-AU" },
  SGD: { code: "SGD", symbol: "S$", label: "SGD ($) - Singapore Dollar", locale: "en-SG" },
  AED: { code: "AED", symbol: "AED", label: "AED (د.إ) - UAE Dirham", locale: "en-AE" },
}

export interface ProfitLeakInput {
  country: CountryCode
  businessType: BusinessType
  currencyCode: string
  monthlyRevenue: number

  // Common & Business Specific Cost Inputs
  cogs?: number // Cost of goods sold / direct delivery
  discounts?: number // Monthly discounts given or % discount
  discountRatePct?: number // Optional %
  paymentFees?: number // Payment processing or gateway fees
  advertisingSpend?: number // Ad spend (Meta/Google/Amazon ads)
  shippingFulfillment?: number // Shipping / delivery logistics
  returnsRefunds?: number // Returns / refund losses
  rtoLosses?: number // India specific: Return to Origin / COD shipping loss
  marketplaceFees?: number // Amazon / Flipkart / Etsy / Walmart commissions
  softwareSaaS?: number // Subscriptions & tool costs
  payrollLabor?: number // Payroll / wages
  contractors?: number // Freelancers / sub-contractors
  unbilledHoursAmount?: number // Service/Freelance: unbilled scope creep / revisions
  inventoryWasteSpoilage?: number // Retail/Wholesale: expired/damaged inventory
  badDebtAmount?: number // Wholesale: uncollectible accounts

  // Cash-Flow Pressure Inputs (NOT profit leaks)
  unpaidInvoicesReceivable?: number // Outstanding customer invoices / receivables
  inventoryTiedUp?: number // Capital tied up in sitting stock
  delayedPaymentsPeriodDays?: number // Average DSO or payment lag
  
  // Optional Deep Analysis metrics
  averageOrderValue?: number
  returnRatePct?: number
  customerAcquisitionCost?: number
  grossMarginPct?: number
}

export interface LeakItem {
  id: string
  category: string
  monthlyImpact: number
  annualImpact: number
  percentageOfRevenue: number
  impactLevel: ImpactLevel
  formulaUsed: string
  whyItMatters: string
  investigationSteps: string[]
  isCashFlowItem?: boolean
}

export interface BiggestLeakReport {
  category: string
  monthlyImpact: number
  annualImpact: number
  percentageOfRevenue: number
  whyItMatters: string
  whatToInvestigate: string
  actionChecklist: string[]
}

export interface ScenarioReductionModel {
  percentage: number
  monthlySavings: number
  annualSavings: number
  newAnnualLeakage: number
}

export interface DiagnosticResult {
  monthlyRevenue: number
  annualRevenue: number
  currency: SupportedCurrency
  country: CountryCode
  businessType: BusinessType

  // Costs Snapshot Breakdown
  coreCosts: number
  additionalCosts: number

  // Total Leakage
  totalMonthlyLeakage: number
  totalAnnualLeakage: number
  leakagePercentageOfRevenue: number

  // Ranked Leaks (Only true profit leaks)
  topLeaks: LeakItem[]

  // Biggest Leak Spotlight
  biggestLeak: BiggestLeakReport | null

  // Cash-Flow Pressure (Distinct from profit leaks)
  cashFlowPressures: LeakItem[]
  totalCashFlowPressureAmount: number

  // What-if Scenario Models for biggest leak
  scenarioModels: ScenarioReductionModel[]

  // Calculation Transparency Audit Trail
  formulasApplied: { category: string; formula: string; result: string }[]
}

export function formatCurrencyAmount(
  amount: number,
  currency: SupportedCurrency,
  includeDecimals = false
): string {
  const safeAmount = isNaN(amount) || !isFinite(amount) ? 0 : amount
  try {
    return safeAmount.toLocaleString(currency.locale, {
      minimumFractionDigits: includeDecimals ? 2 : 0,
      maximumFractionDigits: includeDecimals ? 2 : 0,
    })
  } catch {
    return safeAmount.toLocaleString("en-US", {
      minimumFractionDigits: includeDecimals ? 2 : 0,
      maximumFractionDigits: includeDecimals ? 2 : 0,
    })
  }
}

export function getImpactLevel(percentageOfRevenue: number): ImpactLevel {
  if (percentageOfRevenue >= 6) return "HIGH IMPACT"
  if (percentageOfRevenue >= 2.5) return "MEDIUM IMPACT"
  if (percentageOfRevenue > 0) return "LOW IMPACT"
  return "MONITOR"
}

export function runProfitLeakDiagnostic(input: ProfitLeakInput): DiagnosticResult {
  const revenue = Math.max(0, Number(input.monthlyRevenue) || 0)
  const annualRev = revenue * 12

  const currency =
    SUPPORTED_CURRENCIES[input.currencyCode] ||
    (input.country === "IN"
      ? SUPPORTED_CURRENCIES.INR
      : SUPPORTED_CURRENCIES.USD)

  const leakItems: LeakItem[] = []
  const cashFlowItems: LeakItem[] = []
  const formulas: { category: string; formula: string; result: string }[] = []

  const isIndia = input.country === "IN"
  const isUS = input.country === "US"

  // 1. DISCOUNTS & PROMOTIONAL LEAKAGE
  let discountLeak = Math.max(0, Number(input.discounts) || 0)
  if (!discountLeak && input.discountRatePct && revenue > 0) {
    discountLeak = (revenue * input.discountRatePct) / 100
  }
  if (discountLeak > 0) {
    const annual = discountLeak * 12
    const pct = revenue > 0 ? (discountLeak / revenue) * 100 : 0
    const formula =
      input.discountRatePct && !input.discounts
        ? `Monthly Revenue (${currency.symbol}${formatCurrencyAmount(revenue, currency)}) × Discount Rate (${input.discountRatePct}%)`
        : `Reported Monthly Customer Discounts & Price Concessions (${currency.symbol}${formatCurrencyAmount(discountLeak, currency)})`

    leakItems.push({
      id: "discounts",
      category: "Discounts & Price Concessions",
      monthlyImpact: discountLeak,
      annualImpact: annual,
      percentageOfRevenue: pct,
      impactLevel: getImpactLevel(pct),
      formulaUsed: formula,
      whyItMatters:
        "Every dollar or rupee discounted comes directly off your bottom line. An unmonitored 10% blanket discount can cut net operating profit by 30% to 50%.",
      investigationSteps: [
        "Audit which client segments or products frequently receive discretionary discounting.",
        "Replace blanket percentage discounts with value-add bonuses or tiered volume thresholds.",
        "Set strict approval limits for sales rep concessions.",
      ],
    })
    formulas.push({
      category: "Discounts",
      formula,
      result: `${currency.symbol}${formatCurrencyAmount(discountLeak, currency)}/mo (${pct.toFixed(1)}% of revenue)`,
    })
  }

  // 2. PAYMENT PROCESSING & GATEWAY FEES
  let paymentFeeLeak = Math.max(0, Number(input.paymentFees) || 0)
  if (!paymentFeeLeak && revenue > 0) {
    // Standard baseline estimate if left blank based on country/business
    const defaultRate = isIndia ? 0.02 : isUS ? 0.029 : 0.025
    paymentFeeLeak = revenue * defaultRate
  }
  if (paymentFeeLeak > 0) {
    const annual = paymentFeeLeak * 12
    const pct = revenue > 0 ? (paymentFeeLeak / revenue) * 100 : 0
    const pgName = isIndia
      ? "Razorpay, Cashfree, PayU & UPI Gateway Drag"
      : isUS
      ? "Credit Card Processing (Stripe, Square, Interchange Drag)"
      : "Merchant Processing & Gateway Interchange Fees"

    const formula = input.paymentFees
      ? `Reported Monthly Payment Gateway & Merchant Fees (${currency.symbol}${formatCurrencyAmount(paymentFeeLeak, currency)})`
      : `Estimated gateway drag: Monthly Revenue × ${isIndia ? "2.0%" : isUS ? "2.9%" : "2.5%"}`

    leakItems.push({
      id: "payment-fees",
      category: pgName,
      monthlyImpact: paymentFeeLeak,
      annualImpact: annual,
      percentageOfRevenue: pct,
      impactLevel: getImpactLevel(pct),
      formulaUsed: formula,
      whyItMatters:
        "Payment gateway micro-fees, currency conversion markups, failed transaction charges, and payout holding fees silently eat 2% to 3.5% of gross top-line revenue.",
      investigationSteps: [
        isIndia
          ? "Encourage direct zero-cost or low-cost UPI bank rails over high-fee international cards."
          : "Request custom volume pricing from Stripe/Square once monthly volume passes $30,000.",
        "Audit monthly gateway settlement statements for hidden chargeback or international surcharges.",
        "Review whether surcharge or convenience fee pass-through is legally viable in your jurisdiction.",
      ],
    })
    formulas.push({
      category: "Payment Processing",
      formula,
      result: `${currency.symbol}${formatCurrencyAmount(paymentFeeLeak, currency)}/mo (${pct.toFixed(1)}% of revenue)`,
    })
  }

  // 3. ADVERTISING & CUSTOMER ACQUISITION INEFFICIENCY
  const adSpend = Math.max(0, Number(input.advertisingSpend) || 0)
  if (adSpend > 0) {
    const annual = adSpend * 12
    const pct = revenue > 0 ? (adSpend / revenue) * 100 : 0
    const formula = `Reported Monthly Paid Advertising & Campaign Spend (${currency.symbol}${formatCurrencyAmount(adSpend, currency)})`

    leakItems.push({
      id: "advertising",
      category: "Advertising & Acquisition Cost Drag",
      monthlyImpact: adSpend,
      annualImpact: annual,
      percentageOfRevenue: pct,
      impactLevel: getImpactLevel(pct),
      formulaUsed: formula,
      whyItMatters:
        "Paid ad spend on Meta, Google, or Amazon without campaign-level contribution margin tracking results in unprofitable revenue expansion.",
      investigationSteps: [
        "Calculate true Return on Ad Spend (ROAS) after deducting product COGS, payment fees, and shipping.",
        "Identify and pause ad sets with customer acquisition cost (CAC) higher than first-order gross margin.",
        "Strengthen organic email/SMS repeat purchase loops to lower blended CAC.",
      ],
    })
    formulas.push({
      category: "Advertising",
      formula,
      result: `${currency.symbol}${formatCurrencyAmount(adSpend, currency)}/mo (${pct.toFixed(1)}% of revenue)`,
    })
  }

  // 4. RETURNS, REFUNDS & INDIA RTO LOSSES
  let returnLeak = Math.max(0, Number(input.returnsRefunds) || 0)
  const rtoLeak = Math.max(0, Number(input.rtoLosses) || 0)
  if (!returnLeak && input.returnRatePct && revenue > 0) {
    returnLeak = (revenue * input.returnRatePct) / 100
  }
  const totalReturnLoss = returnLeak + rtoLeak

  if (totalReturnLoss > 0) {
    const annual = totalReturnLoss * 12
    const pct = revenue > 0 ? (totalReturnLoss / revenue) * 100 : 0
    const returnTitle = isIndia
      ? "Product Returns, Customer Refunds & RTO (Failed COD) Losses"
      : "Product Returns, Restocking Drag & Refund Processing"

    const formula =
      rtoLeak > 0
        ? `Refunds (${currency.symbol}${formatCurrencyAmount(returnLeak, currency)}) + RTO Return Logistics (${currency.symbol}${formatCurrencyAmount(rtoLeak, currency)})`
        : `Monthly Refunded Revenue & Processing Restock Cost (${currency.symbol}${formatCurrencyAmount(totalReturnLoss, currency)})`

    leakItems.push({
      id: "returns",
      category: returnTitle,
      monthlyImpact: totalReturnLoss,
      annualImpact: annual,
      percentageOfRevenue: pct,
      impactLevel: getImpactLevel(pct),
      formulaUsed: formula,
      whyItMatters:
        "Returns do not just erase revenue; they generate two-way shipping costs, packaging destruction, inventory depreciation, and non-refundable merchant fees.",
      investigationSteps: [
        isIndia
          ? "Implement OTP verification or pre-call confirmation for Cash on Delivery (COD) orders to cut RTO."
          : "Analyze top 3 most returned SKUs for sizing inaccuracies, photography discrepancies, or quality defects.",
        "Tighten return windows and enforce customer-paid return shipping for discretionary remorse returns.",
        "Add detailed product dimensional guides, FAQs, and video walkthroughs on product landing pages.",
      ],
    })
    formulas.push({
      category: "Returns & Refunds",
      formula,
      result: `${currency.symbol}${formatCurrencyAmount(totalReturnLoss, currency)}/mo (${pct.toFixed(1)}% of revenue)`,
    })
  }

  // 5. MARKETPLACE COMMISSIONS & TAKE-RATE
  const marketplaceCommission = Math.max(0, Number(input.marketplaceFees) || 0)
  if (marketplaceCommission > 0) {
    const annual = marketplaceCommission * 12
    const pct = revenue > 0 ? (marketplaceCommission / revenue) * 100 : 0
    const formula = `Direct Channel Commission (Amazon / Flipkart / Marketplace Platform Fees) (${currency.symbol}${formatCurrencyAmount(marketplaceCommission, currency)})`

    leakItems.push({
      id: "marketplace-fees",
      category: isIndia
        ? "Amazon, Flipkart & Platform Commission Fees"
        : "Marketplace Commissions (Amazon, Walmart, Etsy Take-Rate)",
      monthlyImpact: marketplaceCommission,
      annualImpact: annual,
      percentageOfRevenue: pct,
      impactLevel: getImpactLevel(pct),
      formulaUsed: formula,
      whyItMatters:
        "Marketplace platform fees (referral fees, closing fees, fulfillment surcharge) often compound to 15%-30% of gross listing price.",
      investigationSteps: [
        "Audit fee breakdown SKU-by-SKU to detect miscategorized dimensional weight tiers.",
        "Build direct-to-consumer (D2C) retention channels to convert 1st-time marketplace buyers into repeat store buyers.",
        "Adjust marketplace retail prices to account for category referral fees rather than discounting below margin.",
      ],
    })
    formulas.push({
      category: "Marketplace Fees",
      formula,
      result: `${currency.symbol}${formatCurrencyAmount(marketplaceCommission, currency)}/mo (${pct.toFixed(1)}% of revenue)`,
    })
  }

  // 6. UNBILLED HOURS & SCOPE CREEP (Service / Agency / Freelance)
  const unbilledHours = Math.max(0, Number(input.unbilledHoursAmount) || 0)
  if (unbilledHours > 0) {
    const annual = unbilledHours * 12
    const pct = revenue > 0 ? (unbilledHours / revenue) * 100 : 0
    const formula = `Unbilled Scope Creep & Unaccounted Revision Hours Cost (${currency.symbol}${formatCurrencyAmount(unbilledHours, currency)})`

    leakItems.push({
      id: "unbilled-scope",
      category: "Unbilled Scope Creep & Out-of-Scope Revisions",
      monthlyImpact: unbilledHours,
      annualImpact: annual,
      percentageOfRevenue: pct,
      impactLevel: getImpactLevel(pct),
      formulaUsed: formula,
      whyItMatters:
        "Doing extra revisions or out-of-scope tasks for free drastically reduces your effective hourly rate and burns billable team capacity.",
      investigationSteps: [
        "Establish unambiguous Statements of Work (SOW) clearly bounding revisions included.",
        "Implement a formal change order process with written client approval before starting out-of-scope work.",
        "Track all internal time strictly on projects to measure actual vs estimated effort.",
      ],
    })
    formulas.push({
      category: "Unbilled Scope",
      formula,
      result: `${currency.symbol}${formatCurrencyAmount(unbilledHours, currency)}/mo (${pct.toFixed(1)}% of revenue)`,
    })
  }

  // 7. SOFTWARE, SAAS & SUBSCRIPTIONS
  const softwareLeak = Math.max(0, Number(input.softwareSaaS) || 0)
  if (softwareLeak > 0) {
    const annual = softwareLeak * 12
    const pct = revenue > 0 ? (softwareLeak / revenue) * 100 : 0
    const formula = `Reported Monthly Software, SaaS Subscriptions & Cloud Tool Licenses (${currency.symbol}${formatCurrencyAmount(softwareLeak, currency)})`

    leakItems.push({
      id: "software-saas",
      category: "Software, SaaS Subscriptions & Tool Overhead",
      monthlyImpact: softwareLeak,
      annualImpact: annual,
      percentageOfRevenue: pct,
      impactLevel: getImpactLevel(pct),
      formulaUsed: formula,
      whyItMatters:
        "SaaS subscriptions accumulate unnoticed across departments. Duplicate seat licenses and inactive tools silently drain cash every billing cycle.",
      investigationSteps: [
        "Perform a full credit card audit of all recurring monthly and annual software subscriptions.",
        "Deprovision unused seats and consolidate overlapping tool categories (e.g. project management, CRM).",
        "Switch monthly subscriptions to annual upfront billing only on core tools for 15-25% vendor discounts.",
      ],
    })
    formulas.push({
      category: "Software Subscriptions",
      formula,
      result: `${currency.symbol}${formatCurrencyAmount(softwareLeak, currency)}/mo (${pct.toFixed(1)}% of revenue)`,
    })
  }

  // 8. INVENTORY WASTE, SPOILAGE & DAMAGED STOCK
  const inventoryWaste = Math.max(0, Number(input.inventoryWasteSpoilage) || 0)
  if (inventoryWaste > 0) {
    const annual = inventoryWaste * 12
    const pct = revenue > 0 ? (inventoryWaste / revenue) * 100 : 0
    const formula = `Estimated Monthly Damaged, Expired, or Dead Inventory Write-offs (${currency.symbol}${formatCurrencyAmount(inventoryWaste, currency)})`

    leakItems.push({
      id: "inventory-waste",
      category: "Inventory Spoilage, Damage & Dead Stock Loss",
      monthlyImpact: inventoryWaste,
      annualImpact: annual,
      percentageOfRevenue: pct,
      impactLevel: getImpactLevel(pct),
      formulaUsed: formula,
      whyItMatters:
        "Inventory that spoils or sits until obsolescence represents a 100% loss of the initial capital invested plus ongoing storage costs.",
      investigationSteps: [
        "Calculate Inventory Turnover Ratio by SKU to identify slow-moving products early.",
        "Run targeted clearance flash sales or product bundling before items become completely unsellable.",
        "Improve warehouse packaging and handling protocols to minimize in-transit damage.",
      ],
    })
    formulas.push({
      category: "Inventory Waste",
      formula,
      result: `${currency.symbol}${formatCurrencyAmount(inventoryWaste, currency)}/mo (${pct.toFixed(1)}% of revenue)`,
    })
  }

  // 9. BAD DEBT & UNCOLLECTIBLE BALANCES
  const badDebt = Math.max(0, Number(input.badDebtAmount) || 0)
  if (badDebt > 0) {
    const annual = badDebt * 12
    const pct = revenue > 0 ? (badDebt / revenue) * 100 : 0
    const formula = `Monthly Write-offs from Defaulted / Uncollectible Accounts (${currency.symbol}${formatCurrencyAmount(badDebt, currency)})`

    leakItems.push({
      id: "bad-debt",
      category: "Uncollectible Bad Debt Write-Offs",
      monthlyImpact: badDebt,
      annualImpact: annual,
      percentageOfRevenue: pct,
      impactLevel: getImpactLevel(pct),
      formulaUsed: formula,
      whyItMatters:
        "Supplying goods or services that are never paid for destroys working capital and wipes out profits from multiple healthy sales.",
      investigationSteps: [
        "Institute formal credit checks and mandatory credit limits before extending terms to new B2B accounts.",
        "Require 50% upfront deposits or milestone billing for non-standard orders.",
        "Enforce strict dunning workflows with automated reminder escalation at 7, 15, and 30 days overdue.",
      ],
    })
    formulas.push({
      category: "Bad Debt",
      formula,
      result: `${currency.symbol}${formatCurrencyAmount(badDebt, currency)}/mo (${pct.toFixed(1)}% of revenue)`,
    })
  }

  // --- CRITICAL DISTINCTION: CASH-FLOW PRESSURE ITEMS ---
  // 10. UNPAID CUSTOMER INVOICES (Accounts Receivable)
  const unpaidInvoices = Math.max(0, Number(input.unpaidInvoicesReceivable) || 0)
  if (unpaidInvoices > 0) {
    const pct = revenue > 0 ? (unpaidInvoices / revenue) * 100 : 0
    cashFlowItems.push({
      id: "unpaid-invoices",
      category: "Outstanding Client Invoices (Accounts Receivable)",
      monthlyImpact: unpaidInvoices,
      annualImpact: unpaidInvoices,
      percentageOfRevenue: pct,
      impactLevel: unpaidInvoices > revenue ? "HIGH IMPACT" : "MEDIUM IMPACT",
      formulaUsed: `Total Uncollected Customer Invoices Currently Outstanding (${currency.symbol}${formatCurrencyAmount(unpaidInvoices, currency)})`,
      whyItMatters:
        "This is NOT lost profit; this is earned revenue trapped in your clients' bank accounts, restricting your operational payroll and purchasing liquidity.",
      investigationSteps: [
        "Shorten payment terms from Net-60/Net-30 to Net-14 or Net-7 with 2% early-payment discounts.",
        "Implement automated payment reminders 3 days before due date and on due date.",
        "Halt new milestone delivery for clients with overdue balances past 15 days.",
      ],
      isCashFlowItem: true,
    })
  }

  // 11. INVENTORY CAPITAL TIED UP
  const sittingInventory = Math.max(0, Number(input.inventoryTiedUp) || 0)
  if (sittingInventory > 0) {
    const pct = revenue > 0 ? (sittingInventory / revenue) * 100 : 0
    cashFlowItems.push({
      id: "inventory-tied-up",
      category: "Capital Tied Up in Excess Stock",
      monthlyImpact: sittingInventory,
      annualImpact: sittingInventory,
      percentageOfRevenue: pct,
      impactLevel: sittingInventory > revenue * 2 ? "HIGH IMPACT" : "MEDIUM IMPACT",
      formulaUsed: `Valuation of Slow-Moving Stock Sitting in Storage (${currency.symbol}${formatCurrencyAmount(sittingInventory, currency)})`,
      whyItMatters:
        "Inventory sitting in a warehouse is working capital that cannot be spent on marketing, hiring, or buffer reserves until sold.",
      investigationSteps: [
        "Switch to Just-In-Time (JIT) supplier ordering for high-cost, slow-velocity items.",
        "Liquidate bottom 20% slow-moving inventory at cost to recover liquid working capital immediately.",
        "Negotiate supplier consignment or smaller minimum order quantities (MOQs).",
      ],
      isCashFlowItem: true,
    })
  }

  // Sort profit leaks strictly descending by monthly impact
  leakItems.sort((a, b) => b.monthlyImpact - a.monthlyImpact)

  const totalMonthlyLeakage = leakItems.reduce((acc, cur) => acc + cur.monthlyImpact, 0)
  const totalAnnualLeakage = totalMonthlyLeakage * 12
  const leakagePercentageOfRevenue = revenue > 0 ? (totalMonthlyLeakage / revenue) * 100 : 0

  // Identify Biggest Leak
  let biggestLeak: BiggestLeakReport | null = null
  if (leakItems.length > 0) {
    const top = leakItems[0]
    biggestLeak = {
      category: top.category,
      monthlyImpact: top.monthlyImpact,
      annualImpact: top.annualImpact,
      percentageOfRevenue: top.percentageOfRevenue,
      whyItMatters: top.whyItMatters,
      whatToInvestigate: `Your ${top.category.toLowerCase()} is your single largest profit drag, consuming approximately ${top.percentageOfRevenue.toFixed(1)}% of monthly revenue (${currency.symbol}${formatCurrencyAmount(top.monthlyImpact, currency)}/mo). Review direct contract rates, operational policies, and campaign-level returns immediately.`,
      actionChecklist: top.investigationSteps,
    }
  }

  // What-If Scenario models for the top leak (or total leakage if top leak exists)
  const scenarioPercentages = [5, 10, 15, 20]
  const targetForScenario = biggestLeak ? biggestLeak.monthlyImpact : totalMonthlyLeakage
  const scenarioModels: ScenarioReductionModel[] = scenarioPercentages.map((p) => {
    const monthlySav = (targetForScenario * p) / 100
    const annualSav = monthlySav * 12
    const newAnnualLeak = Math.max(0, totalAnnualLeakage - annualSav)
    return {
      percentage: p,
      monthlySavings: monthlySav,
      annualSavings: annualSav,
      newAnnualLeakage: newAnnualLeak,
    }
  })

  const totalCashFlowPressureAmount = cashFlowItems.reduce((acc, cur) => acc + cur.monthlyImpact, 0)

  const coreCosts =
    Math.max(0, Number(input.cogs) || 0) +
    Math.max(0, Number(input.payrollLabor) || 0) +
    Math.max(0, Number(input.contractors) || 0) +
    Math.max(0, Number(input.shippingFulfillment) || 0)

  const additionalCosts = totalMonthlyLeakage

  return {
    monthlyRevenue: revenue,
    annualRevenue: annualRev,
    currency,
    country: input.country,
    businessType: input.businessType,
    coreCosts,
    additionalCosts,
    totalMonthlyLeakage,
    totalAnnualLeakage,
    leakagePercentageOfRevenue,
    topLeaks: leakItems,
    biggestLeak,
    cashFlowPressures: cashFlowItems,
    totalCashFlowPressureAmount,
    scenarioModels,
    formulasApplied: formulas,
  }
}
