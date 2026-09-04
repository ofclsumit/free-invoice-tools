export type CountryCode = "US" | "IN" | "OTHER"

export type UserType = "personal" | "business"

export type BillingFrequency = "monthly" | "quarterly" | "annual" | "weekly"

export type UsageFrequency = "never" | "rarely" | "sometimes" | "often" | "daily"

export type LastUsedTime =
  | "never"
  | "last_7_days"
  | "last_30_days"
  | "months_1_to_3"
  | "more_than_3_months_ago"
  | "not_sure"

export type SubscriptionCategory =
  | "software"
  | "streaming"
  | "cloud_storage"
  | "marketing"
  | "design"
  | "productivity"
  | "finance"
  | "education"
  | "membership"
  | "news"
  | "gaming"
  | "other"

export interface SubscriptionItem {
  id: string
  name: string
  category: SubscriptionCategory
  cost: number
  billingFrequency: BillingFrequency
  usageFrequency: UsageFrequency
  lastUsed: LastUsedTime
  previousCost?: number
  seats?: number
  isBusiness?: boolean
  notes?: string
}

export type ReviewReasonTag =
  | "POTENTIALLY UNUSED"
  | "POTENTIAL OVERLAP"
  | "PRICE INCREASE"
  | "HIGH COST"

export interface FlaggedSubscription {
  item: SubscriptionItem
  reasons: ReviewReasonTag[]
  primaryReason: string
  suggestedAction: string
  monthlyEquivalent: number
  annualCost: number
  priceIncreaseAmount?: number
  priceIncreasePct?: number
}

export interface OverlapGroup {
  category: SubscriptionCategory
  categoryLabel: string
  items: SubscriptionItem[]
  totalMonthlyCost: number
  totalAnnualCost: number
}

export interface DiagnosticResult {
  items: SubscriptionItem[]
  totalItems: number
  totalMonthlySpend: number
  totalAnnualSpend: number
  potentialMonthlyReviewAmount: number
  potentialAnnualReviewAmount: number
  reviewPercentageOfSpend: number
  flaggedSubscriptions: FlaggedSubscription[]
  biggestReviewItem?: FlaggedSubscription
  overlapGroups: OverlapGroup[]
  priceIncreaseItems: {
    item: SubscriptionItem
    previousCost: number
    currentCost: number
    monthlyIncrease: number
    annualIncrease: number
    increasePct: number
  }[]
  categoryBreakdown: {
    category: SubscriptionCategory
    label: string
    count: number
    monthlySpend: number
    annualSpend: number
    percentageOfTotal: number
  }[]
  formulasApplied: {
    concept: string
    formula: string
    result: string
  }[]
}

export interface SupportedCurrency {
  code: string
  symbol: string
  label: string
  locale: string
}

export const SUPPORTED_CURRENCIES: Record<string, SupportedCurrency> = {
  USD: { code: "USD", symbol: "$", label: "USD ($) - United States", locale: "en-US" },
  INR: { code: "INR", symbol: "₹", label: "INR (₹) - India", locale: "en-IN" },
  EUR: { code: "EUR", symbol: "€", label: "EUR (€) - European Union", locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", label: "GBP (£) - United Kingdom", locale: "en-GB" },
  CAD: { code: "CAD", symbol: "CA$", label: "CAD ($) - Canada", locale: "en-CA" },
  AUD: { code: "AUD", symbol: "AU$", label: "AUD ($) - Australia", locale: "en-AU" },
  SGD: { code: "SGD", symbol: "SG$", label: "SGD ($) - Singapore", locale: "en-SG" },
  AED: { code: "AED", symbol: "AED", label: "AED (د.إ) - UAE", locale: "ar-AE" },
}

export const CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  software: "Software & SaaS",
  streaming: "Streaming & Media",
  cloud_storage: "Cloud Storage & Backup",
  marketing: "Marketing & SEO",
  design: "Design & Creative",
  productivity: "Productivity & Office",
  finance: "Finance & Accounting",
  education: "Education & Learning",
  membership: "Membership & Clubs",
  news: "News & Publications",
  gaming: "Gaming & Entertainment",
  other: "Other Subscriptions",
}

export const USAGE_LABELS: Record<UsageFrequency, string> = {
  never: "Never",
  rarely: "Rarely",
  sometimes: "Sometimes",
  often: "Often",
  daily: "Daily",
}

export const LAST_USED_LABELS: Record<LastUsedTime, string> = {
  never: "Never used",
  last_7_days: "Within last 7 days",
  last_30_days: "Within last 30 days",
  months_1_to_3: "1–3 months ago",
  more_than_3_months_ago: "3+ months ago",
  not_sure: "Not sure",
}

export const BILLING_LABELS: Record<BillingFrequency, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  weekly: "Weekly",
}

// Convert any billing frequency to monthly equivalent
export function calculateMonthlyEquivalent(cost: number, frequency: BillingFrequency): number {
  if (cost <= 0) return 0
  switch (frequency) {
    case "monthly":
      return cost
    case "quarterly":
      return cost / 3
    case "annual":
      return cost / 12
    case "weekly":
      return (cost * 52) / 12
    default:
      return cost
  }
}

// Convert any billing frequency to annual cost
export function calculateAnnualCost(cost: number, frequency: BillingFrequency): number {
  if (cost <= 0) return 0
  switch (frequency) {
    case "monthly":
      return cost * 12
    case "quarterly":
      return cost * 4
    case "annual":
      return cost
    case "weekly":
      return cost * 52
    default:
      return cost * 12
  }
}

export function formatCurrencyAmount(
  amount: number,
  currency: SupportedCurrency
): string {
  const rounded = Math.round(amount * 100) / 100
  const isWhole = Number.isInteger(rounded)

  try {
    return new Intl.NumberFormat(currency.locale, {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(rounded)
  } catch {
    return rounded.toLocaleString("en-US", {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    })
  }
}

export function runSubscriptionDiagnostic(items: SubscriptionItem[]): DiagnosticResult {
  if (!items || items.length === 0) {
    return {
      items: [],
      totalItems: 0,
      totalMonthlySpend: 0,
      totalAnnualSpend: 0,
      potentialMonthlyReviewAmount: 0,
      potentialAnnualReviewAmount: 0,
      reviewPercentageOfSpend: 0,
      flaggedSubscriptions: [],
      overlapGroups: [],
      priceIncreaseItems: [],
      categoryBreakdown: [],
      formulasApplied: [],
    }
  }

  // 1. Calculate base spend
  let totalMonthlySpend = 0
  let totalAnnualSpend = 0

  const processedItems = items.map((item) => {
    const monthly = calculateMonthlyEquivalent(item.cost, item.billingFrequency)
    const annual = calculateAnnualCost(item.cost, item.billingFrequency)
    totalMonthlySpend += monthly
    totalAnnualSpend += annual
    return { item, monthly, annual }
  })

  // 2. Identify Potential Category Overlaps
  const categoryCounts: Record<SubscriptionCategory, SubscriptionItem[]> = {
    software: [],
    streaming: [],
    cloud_storage: [],
    marketing: [],
    design: [],
    productivity: [],
    finance: [],
    education: [],
    membership: [],
    news: [],
    gaming: [],
    other: [],
  }

  items.forEach((item) => {
    categoryCounts[item.category].push(item)
  })

  const overlapGroups: OverlapGroup[] = []
  const overlappingCategorySet = new Set<SubscriptionCategory>()

  Object.entries(categoryCounts).forEach(([catKey, catItems]) => {
    const category = catKey as SubscriptionCategory
    // Only flag category overlap if there are 2 or more items and category is not "other"
    if (catItems.length >= 2 && category !== "other") {
      overlappingCategorySet.add(category)
      let groupMonthly = 0
      let groupAnnual = 0
      catItems.forEach((i) => {
        groupMonthly += calculateMonthlyEquivalent(i.cost, i.billingFrequency)
        groupAnnual += calculateAnnualCost(i.cost, i.billingFrequency)
      })
      overlapGroups.push({
        category,
        categoryLabel: CATEGORY_LABELS[category],
        items: catItems,
        totalMonthlyCost: groupMonthly,
        totalAnnualCost: groupAnnual,
      })
    }
  })

  // 3. Price Increase Tracking
  const priceIncreaseItems: {
    item: SubscriptionItem
    previousCost: number
    currentCost: number
    monthlyIncrease: number
    annualIncrease: number
    increasePct: number
  }[] = []

  items.forEach((item) => {
    if (item.previousCost !== undefined && item.previousCost > 0 && item.cost > item.previousCost) {
      const prevMonthly = calculateMonthlyEquivalent(item.previousCost, item.billingFrequency)
      const currMonthly = calculateMonthlyEquivalent(item.cost, item.billingFrequency)
      const monthlyInc = currMonthly - prevMonthly
      const annualInc = monthlyInc * 12
      const incPct = ((item.cost - item.previousCost) / item.previousCost) * 100

      priceIncreaseItems.push({
        item,
        previousCost: item.previousCost,
        currentCost: item.cost,
        monthlyIncrease: monthlyInc,
        annualIncrease: annualInc,
        increasePct: incPct,
      })
    }
  })

  // 4. Flag Subscriptions with Transparent Reasons
  const flaggedSubscriptions: FlaggedSubscription[] = []
  const avgMonthlySpendPerItem = items.length > 0 ? totalMonthlySpend / items.length : 0

  processedItems.forEach(({ item, monthly, annual }) => {
    const reasons: ReviewReasonTag[] = []
    let primaryReason = ""
    let suggestedAction = ""

    // Condition A: Potentially Unused
    const isUnused =
      item.usageFrequency === "never" ||
      item.usageFrequency === "rarely" ||
      item.lastUsed === "more_than_3_months_ago" ||
      item.lastUsed === "never"

    if (isUnused) {
      reasons.push("POTENTIALLY UNUSED")
      if (item.lastUsed === "more_than_3_months_ago") {
        primaryReason = "Last used more than 3 months ago with infrequent activity."
      } else if (item.usageFrequency === "never" || item.lastUsed === "never") {
        primaryReason = "Marked as never actively used since starting subscription."
      } else {
        primaryReason = "Reported usage is rare compared to ongoing recurring cost."
      }
      suggestedAction = "Check whether you or your team still need this service before the next renewal date."
    }

    // Condition B: Potential Overlap
    const hasOverlap = overlappingCategorySet.has(item.category)
    if (hasOverlap) {
      reasons.push("POTENTIAL OVERLAP")
      if (!primaryReason) {
        primaryReason = `You have multiple subscriptions under ${CATEGORY_LABELS[item.category]}.`
        suggestedAction = "Compare feature sets across similar tools to see if a single subscription meets your needs."
      }
    }

    // Condition C: Price Increase
    const priceChange = priceIncreaseItems.find((p) => p.item.id === item.id)
    if (priceChange) {
      reasons.push("PRICE INCREASE")
      if (!primaryReason) {
        primaryReason = `Cost increased by +${priceChange.increasePct.toFixed(1)}% compared to your previous rate.`
        suggestedAction = "Review whether the higher price point still aligns with the value you receive."
      }
    }

    // Condition D: High Relative Cost (Top spend item > 1.75x average if total monthly > 0)
    if (monthly > avgMonthlySpendPerItem * 1.75 && items.length >= 3 && monthly > 30) {
      reasons.push("HIGH COST")
      if (!primaryReason) {
        primaryReason = "Represents a significantly higher proportion of your total subscription budget."
        suggestedAction = "Evaluate if all purchased seats or premium tier features are being fully utilized."
      }
    }

    if (reasons.length > 0) {
      flaggedSubscriptions.push({
        item,
        reasons,
        primaryReason,
        suggestedAction:
          suggestedAction ||
          "Review usage and necessity before your next upcoming renewal.",
        monthlyEquivalent: monthly,
        annualCost: annual,
        priceIncreaseAmount: priceChange?.monthlyIncrease,
        priceIncreasePct: priceChange?.increasePct,
      })
    }
  })

  // Sort flagged items descending by annual cost
  flaggedSubscriptions.sort((a, b) => b.annualCost - a.annualCost)

  // 5. Calculate Review Spend Totals (Sum of unique flagged items)
  let potentialMonthlyReviewAmount = 0
  let potentialAnnualReviewAmount = 0

  flaggedSubscriptions.forEach((f) => {
    potentialMonthlyReviewAmount += f.monthlyEquivalent
    potentialAnnualReviewAmount += f.annualCost
  })

  const reviewPercentageOfSpend =
    totalAnnualSpend > 0 ? (potentialAnnualReviewAmount / totalAnnualSpend) * 100 : 0

  // 6. Spotlight Biggest Review Item
  const biggestReviewItem = flaggedSubscriptions.length > 0 ? flaggedSubscriptions[0] : undefined

  // 7. Category Breakdown
  const categoryBreakdown = Object.entries(categoryCounts)
    .filter(([_, catItems]) => catItems.length > 0)
    .map(([catKey, catItems]) => {
      const category = catKey as SubscriptionCategory
      let monthly = 0
      let annual = 0
      catItems.forEach((i) => {
        monthly += calculateMonthlyEquivalent(i.cost, i.billingFrequency)
        annual += calculateAnnualCost(i.cost, i.billingFrequency)
      })
      return {
        category,
        label: CATEGORY_LABELS[category],
        count: catItems.length,
        monthlySpend: monthly,
        annualSpend: annual,
        percentageOfTotal: totalAnnualSpend > 0 ? (annual / totalAnnualSpend) * 100 : 0,
      }
    })
    .sort((a, b) => b.annualSpend - a.annualSpend)

  // 8. Formulas applied
  const formulasApplied = [
    {
      concept: "Monthly Spend Normalization",
      formula: "Monthly Equivalent = Cost × (Frequency Multiplier: Annual ÷ 12, Quarterly ÷ 3, Weekly × 52 ÷ 12)",
      result: `${items.length} subscriptions normalized to equivalent monthly cadence`,
    },
    {
      concept: "Annualized Total Spend",
      formula: "Annual Spend = Monthly Equivalent Total × 12",
      result: `Annualized overall commitment`,
    },
    {
      concept: "Potential Cost to Review",
      formula: "Sum of Annual Cost for subscriptions flagged as Potentially Unused, Potential Overlap, Price Increase, or High Cost",
      result: `${flaggedSubscriptions.length} flagged out of ${items.length} total subscriptions`,
    },
  ]

  return {
    items,
    totalItems: items.length,
    totalMonthlySpend,
    totalAnnualSpend,
    potentialMonthlyReviewAmount,
    potentialAnnualReviewAmount,
    reviewPercentageOfSpend,
    flaggedSubscriptions,
    biggestReviewItem,
    overlapGroups,
    priceIncreaseItems,
    categoryBreakdown,
    formulasApplied,
  }
}
