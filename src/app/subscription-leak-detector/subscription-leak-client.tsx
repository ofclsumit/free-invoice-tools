"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Edit2,
  Download,
  Eye,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Sliders,
  Layers,
  TrendingUp,
  Building2,
  User,
  Zap,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { SubscriptionLeakDocument } from "@/components/calculator-documents"
import { BrandLogo } from "@/components/shared/brand-logo"
import { TurnivoSelect, TurnivoSelectOption } from "@/components/ui/turnivo-select"
import { TurnivoDialog } from "@/components/ui/turnivo-dialog"
import {
  CountryCode,
  UserType,
  BillingFrequency,
  UsageFrequency,
  LastUsedTime,
  SubscriptionCategory,
  SubscriptionItem,
  SupportedCurrency,
  SUPPORTED_CURRENCIES,
  CATEGORY_LABELS,
  USAGE_LABELS,
  LAST_USED_LABELS,
  BILLING_LABELS,
  runSubscriptionDiagnostic,
  formatCurrencyAmount,
  calculateMonthlyEquivalent,
  calculateAnnualCost,
} from "@/lib/subscription-leak/subscription-engine"

// Minimal Circular Stroke Spinner
function CircleLoader({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin text-current shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path
        className="opacity-85"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Smooth Number Counter Component
function AnimatedCounter({
  value,
  currency,
  duration = 650,
}: {
  value: number
  currency: SupportedCurrency
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)

  useEffect(() => {
    const startValue = prevValueRef.current
    const endValue = value
    if (startValue === endValue) return

    const startTime = performance.now()

    const updateCounter = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * ease

      if (progress < 1) {
        setDisplayValue(current)
        requestAnimationFrame(updateCounter)
      } else {
        setDisplayValue(endValue)
        prevValueRef.current = endValue
      }
    }

    requestAnimationFrame(updateCounter)
  }, [value, duration])

  return <span>{formatCurrencyAmount(displayValue, currency)}</span>
}

export function SubscriptionLeakClient() {
  const router = useRouter()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Settings & Context
  const [country, setCountry] = useState<CountryCode>("US")
  const [currencyCode, setCurrencyCode] = useState<string>("USD")
  const [userType, setUserType] = useState<UserType>("personal")
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")

  // 2. Subscriptions State
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([])

  // Modal Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdvancedFields, setShowAdvancedFields] = useState(false)

  // Form Fields State
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState<SubscriptionCategory>("software")
  const [formCost, setFormCost] = useState("")
  const [formBilling, setFormBilling] = useState<BillingFrequency>("monthly")
  const [formUsage, setFormUsage] = useState<UsageFrequency>("sometimes")
  const [formLastUsed, setFormLastUsed] = useState<LastUsedTime>("last_30_days")
  const [formPrevCost, setFormPrevCost] = useState("")
  const [formSeats, setFormSeats] = useState("")
  const [formNotes, setFormNotes] = useState("")

  // Scenario & UI States
  const [scenarioItemCount, setScenarioItemCount] = useState<number>(1)
  const [showFormulas, setShowFormulas] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Handle Country selection with smart currency defaults
  const handleCountryChange = (c: CountryCode) => {
    setCountry(c)
    if (c === "US") setCurrencyCode("USD")
    else if (c === "IN") setCurrencyCode("INR")
  }

  const currentCurrency =
    SUPPORTED_CURRENCIES[currencyCode] ||
    (country === "IN" ? SUPPORTED_CURRENCIES.INR : SUPPORTED_CURRENCIES.USD)

  const fmt = (n: number) => formatCurrencyAmount(n, currentCurrency)

  // Run Diagnostic Engine
  const diagnostic = useMemo(() => {
    return runSubscriptionDiagnostic(subscriptions)
  }, [subscriptions])

  // Select Option Arrays for TurnivoSelect
  const currencyOptions: TurnivoSelectOption[] = useMemo(() => {
    return Object.values(SUPPORTED_CURRENCIES).map((c) => ({
      value: c.code,
      label: c.label,
      sub: `${c.code} (${c.symbol})`,
    }))
  }, [])

  const categoryOptions: TurnivoSelectOption[] = useMemo(() => {
    return Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
      value: k,
      label: v,
    }))
  }, [])

  const billingOptions: TurnivoSelectOption[] = useMemo(() => {
    return Object.entries(BILLING_LABELS).map(([k, v]) => ({
      value: k,
      label: v,
    }))
  }, [])

  const usageOptions: TurnivoSelectOption[] = useMemo(() => {
    return Object.entries(USAGE_LABELS).map(([k, v]) => ({
      value: k,
      label: v,
    }))
  }, [])

  const lastUsedOptions: TurnivoSelectOption[] = useMemo(() => {
    return Object.entries(LAST_USED_LABELS).map(([k, v]) => ({
      value: k,
      label: v,
    }))
  }, [])

  // Open Modal to Add
  const handleOpenAddModal = () => {
    setEditingId(null)
    setFormName("")
    setFormCategory("software")
    setFormCost("")
    setFormBilling("monthly")
    setFormUsage("sometimes")
    setFormLastUsed("last_30_days")
    setFormPrevCost("")
    setFormSeats("")
    setFormNotes("")
    setShowAdvancedFields(false)
    setIsModalOpen(true)
  }

  // Open Modal to Edit
  const handleOpenEditModal = (item: SubscriptionItem) => {
    setEditingId(item.id)
    setFormName(item.name)
    setFormCategory(item.category)
    setFormCost(item.cost.toString())
    setFormBilling(item.billingFrequency)
    setFormUsage(item.usageFrequency)
    setFormLastUsed(item.lastUsed)
    setFormPrevCost(item.previousCost !== undefined ? item.previousCost.toString() : "")
    setFormSeats(item.seats !== undefined ? item.seats.toString() : "")
    setFormNotes(item.notes || "")
    setShowAdvancedFields(
      Boolean(item.previousCost || item.seats || item.notes)
    )
    setIsModalOpen(true)
  }

  // Save Subscription
  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault()
    const nameTrimmed = formName.trim()
    const costNum = parseFloat(formCost)

    if (!nameTrimmed) {
      toast({
        title: "Subscription Name Required",
        description: "Please enter a name for the subscription.",
        variant: "destructive",
      })
      return
    }

    if (isNaN(costNum) || costNum <= 0) {
      toast({
        title: "Valid Cost Required",
        description: "Please enter a cost greater than zero.",
        variant: "destructive",
      })
      return
    }

    const prevCostNum = parseFloat(formPrevCost)
    const seatsNum = parseInt(formSeats, 10)

    const updatedItem: SubscriptionItem = {
      id: editingId || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: nameTrimmed,
      category: formCategory,
      cost: costNum,
      billingFrequency: formBilling,
      usageFrequency: formUsage,
      lastUsed: formLastUsed,
      previousCost: !isNaN(prevCostNum) && prevCostNum > 0 ? prevCostNum : undefined,
      seats: !isNaN(seatsNum) && seatsNum > 0 ? seatsNum : undefined,
      isBusiness: userType === "business",
      notes: formNotes.trim() || undefined,
    }

    if (editingId) {
      setSubscriptions((prev) =>
        prev.map((i) => (i.id === editingId ? updatedItem : i))
      )
      toast({
        title: "Subscription Updated",
        description: `Updated details for ${nameTrimmed}.`,
      })
    } else {
      setSubscriptions((prev) => [...prev, updatedItem])
      toast({
        title: "Subscription Added",
        description: `Added ${nameTrimmed} to your diagnostic list.`,
      })
    }

    setIsModalOpen(false)
  }

  // Delete Subscription
  const handleDeleteSubscription = (id: string, name: string) => {
    setSubscriptions((prev) => prev.filter((i) => i.id !== id))
    toast({
      title: "Subscription Removed",
      description: `Removed ${name} from your list.`,
    })
  }

  // Load Sample Subscriptions
  const handleLoadSampleData = () => {
    const isIndia = country === "IN"
    const sampleItems: SubscriptionItem[] = isIndia
      ? [
          {
            id: "sample-1",
            name: "Adobe Creative Cloud",
            category: "design",
            cost: 4200,
            billingFrequency: "monthly",
            usageFrequency: "rarely",
            lastUsed: "more_than_3_months_ago",
            previousCost: 3600,
          },
          {
            id: "sample-2",
            name: "Canva Pro",
            category: "design",
            cost: 499,
            billingFrequency: "monthly",
            usageFrequency: "daily",
            lastUsed: "last_7_days",
          },
          {
            id: "sample-3",
            name: "Netflix Premium",
            category: "streaming",
            cost: 649,
            billingFrequency: "monthly",
            usageFrequency: "sometimes",
            lastUsed: "last_30_days",
          },
          {
            id: "sample-4",
            name: "Disney+ Hotstar",
            category: "streaming",
            cost: 1499,
            billingFrequency: "annual",
            usageFrequency: "rarely",
            lastUsed: "months_1_to_3",
          },
          {
            id: "sample-5",
            name: "Google One (2TB)",
            category: "cloud_storage",
            cost: 6500,
            billingFrequency: "annual",
            usageFrequency: "daily",
            lastUsed: "last_7_days",
          },
          {
            id: "sample-6",
            name: "Gym Membership",
            category: "membership",
            cost: 2500,
            billingFrequency: "monthly",
            usageFrequency: "never",
            lastUsed: "never",
          },
        ]
      : [
          {
            id: "sample-1",
            name: "Adobe Creative Cloud",
            category: "design",
            cost: 59.99,
            billingFrequency: "monthly",
            usageFrequency: "rarely",
            lastUsed: "more_than_3_months_ago",
            previousCost: 52.99,
          },
          {
            id: "sample-2",
            name: "Canva Pro",
            category: "design",
            cost: 12.99,
            billingFrequency: "monthly",
            usageFrequency: "daily",
            lastUsed: "last_7_days",
          },
          {
            id: "sample-3",
            name: "Netflix Premium 4K",
            category: "streaming",
            cost: 22.99,
            billingFrequency: "monthly",
            usageFrequency: "sometimes",
            lastUsed: "last_30_days",
          },
          {
            id: "sample-4",
            name: "Disney+ Hulu Bundle",
            category: "streaming",
            cost: 19.99,
            billingFrequency: "monthly",
            usageFrequency: "rarely",
            lastUsed: "months_1_to_3",
          },
          {
            id: "sample-5",
            name: "Slack Pro (3 Seats)",
            category: "productivity",
            cost: 26.25,
            billingFrequency: "monthly",
            usageFrequency: "daily",
            lastUsed: "last_7_days",
            seats: 3,
          },
          {
            id: "sample-6",
            name: "Digital Fitness App",
            category: "membership",
            cost: 149.99,
            billingFrequency: "annual",
            usageFrequency: "never",
            lastUsed: "never",
          },
        ]

    setSubscriptions(sampleItems)
    toast({
      title: "Sample Subscriptions Loaded",
      description: "You can now edit, delete, or add your own items.",
    })
  }

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompanyLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const getDocData = () => ({
    diagnostic,
    currency: currentCurrency,
    country,
    userType,
    companyName: companyName.trim() || undefined,
    companyLogo,
  })

  const handlePreviewPDF = () => {
    setIsPreviewing(true)
    const id = savePreviewData({
      docType: "subscription-leak-detector",
      title: "Subscription Leak Diagnostic Report Preview",
      fileName: `subscription-leak-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(
          node,
          `subscription-leak-report-${new Date().toISOString().split("T")[0]}.pdf`
        )
      }
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Modeled Scenario Calculations
  const scenarioSavings = useMemo(() => {
    const flagged = diagnostic.flaggedSubscriptions
    if (flagged.length === 0) return { monthly: 0, annual: 0 }

    const countToReview = Math.min(flagged.length, scenarioItemCount)
    let annualSum = 0
    let monthlySum = 0

    for (let i = 0; i < countToReview; i++) {
      annualSum += flagged[i].annualCost
      monthlySum += flagged[i].monthlyEquivalent
    }

    return { monthly: monthlySum, annual: annualSum }
  }, [diagnostic.flaggedSubscriptions, scenarioItemCount])

  return (
    <>
      {/* Hidden print document for instant export (client only) */}
      {mounted && (
        <div
          className="absolute -left-[9999px] -top-[9999px] pointer-events-none"
          style={{ width: "210mm", minWidth: "210mm", maxWidth: "210mm" }}
          aria-hidden="true"
        >
          <SubscriptionLeakDocument {...getDocData()} />
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto space-y-5 sm:space-y-6">
        {/* TOP CONFIGURATION: Country, Currency & Profile */}
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                Where Is Your Subscription Money Going?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Find recurring subscriptions that may be unused, duplicated, or costing more than they are worth.
              </p>
            </div>

            {/* Profile Toggle (Personal vs Business) */}
            <div className="flex bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10 self-stretch sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setUserType("personal")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  userType === "personal"
                    ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" /> Personal
              </button>
              <button
                type="button"
                onClick={() => setUserType("business")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  userType === "business"
                    ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Business
              </button>
            </div>
          </div>

          {/* Country Selection */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-slate-100 dark:border-white/10">
            {[
              { id: "US", label: "United States", flag: "🇺🇸", sub: "USD ($)" },
              { id: "IN", label: "India", flag: "🇮🇳", sub: "INR (₹)" },
              { id: "OTHER", label: "Other", flag: "🌐", sub: "International" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleCountryChange(item.id as CountryCode)}
                className={`p-2.5 sm:p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-w-0 ${
                  country === item.id
                    ? "bg-violet-50/80 dark:bg-violet-950/40 border-violet-500 text-slate-900 dark:text-white ring-2 ring-violet-500/20 shadow-xs"
                    : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <span className="text-lg sm:text-xl">{item.flag}</span>
                <div className="mt-1.5 min-w-0">
                  <span className="text-xs sm:text-sm font-bold block truncate">
                    {item.label}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    {item.sub}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Currency Picker if Other using TurnivoSelect */}
          <AnimatePresence>
            {country === "OTHER" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Your Currency
                  </label>
                  <TurnivoSelect
                    value={currencyCode}
                    onChange={(val) => setCurrencyCode(val)}
                    options={currencyOptions}
                    searchable
                    placeholder="Search currencies..."
                    size="sm"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SUBSCRIPTIONS MANAGER LIST */}
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Your Recurring Subscriptions
                <span className="text-xs bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                  {subscriptions.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add subscriptions individually to analyze where costs compound.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full xs:w-auto">
              {subscriptions.length === 0 && (
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="flex-1 xs:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  Load Sample Data
                </button>
              )}
              <button
                type="button"
                id="add-subscription-btn"
                onClick={handleOpenAddModal}
                className="flex-1 xs:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Subscription
              </button>
            </div>
          </div>

          {/* EMPTY STATE */}
          {subscriptions.length === 0 ? (
            <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  No subscriptions added yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add your recurring software, streaming, cloud storage, or business tools to find where money may be leaking.
                </p>
              </div>
              <div className="pt-2 flex flex-col xs:flex-row justify-center items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="w-full xs:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" /> + Add First Subscription
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="w-full xs:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                >
                  Load Sample Subscriptions
                </button>
              </div>
            </div>
          ) : (
            /* SUBSCRIPTIONS CARDS LIST WITH REAL BRAND LOGOS */
            <div className="space-y-2.5">
              {subscriptions.map((item) => {
                const monthly = calculateMonthlyEquivalent(item.cost, item.billingFrequency)
                const annual = calculateAnnualCost(item.cost, item.billingFrequency)
                const flagged = diagnostic.flaggedSubscriptions.find(
                  (f) => f.item.id === item.id
                )

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3.5 sm:p-4 bg-slate-50 dark:bg-black/25 border border-slate-200 dark:border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      {/* Authentic Brand Logo / Neutral Fallback */}
                      <BrandLogo name={item.name} size="md" />

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-semibold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                            {CATEGORY_LABELS[item.category]}
                          </span>
                          {flagged && (
                            <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              Review ({flagged.reasons[0]})
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            Usage: <strong className="text-slate-700 dark:text-slate-200">{USAGE_LABELS[item.usageFrequency]}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Last active: <strong className="text-slate-700 dark:text-slate-200">{LAST_USED_LABELS[item.lastUsed]}</strong>
                          </span>
                          {item.seats && (
                            <>
                              <span>•</span>
                              <span>{item.seats} Seats</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-white/5">
                      <div className="text-left sm:text-right">
                        <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {currentCurrency.symbol}{fmt(item.cost)}{" "}
                          <span className="text-xs font-normal text-slate-500">
                            / {item.billingFrequency}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-slate-400 font-mono">
                          {item.billingFrequency !== "monthly" && `(${currentCurrency.symbol}${fmt(monthly)}/mo • `}
                          {currentCurrency.symbol}{fmt(annual)}/yr
                          {item.billingFrequency !== "monthly" && ")"}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                          title="Edit Subscription"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubscription(item.id, item.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete Subscription"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* DIAGNOSTIC RESULTS DASHBOARD */}
        {subscriptions.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {/* 1. PRIMARY RESULT SUMMARY CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 sm:p-7 md:p-8 shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-6">
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-widest text-violet-400 block">
                    Total Recurring Spend
                  </span>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight break-words">
                    {currentCurrency.symbol}
                    <AnimatedCounter
                      value={diagnostic.totalMonthlySpend}
                      currency={currentCurrency}
                    />
                    <span className="text-xs sm:text-sm font-normal text-slate-300 ml-1.5 sm:ml-2">
                      / month
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 pt-1 flex flex-wrap items-center gap-2">
                    <span>
                      Annualized Spend:{" "}
                      <strong className="text-white">
                        {currentCurrency.symbol}
                        <AnimatedCounter
                          value={diagnostic.totalAnnualSpend}
                          currency={currentCurrency}
                        />
                        /year
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">
                      {subscriptions.length} active subscription{subscriptions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* PDF Action Buttons with Clean Circle Loader */}
                <div className="flex flex-col xs:flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={handlePreviewPDF}
                    disabled={isPreviewing}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {isPreviewing ? (
                      <>
                        <CircleLoader className="w-3.5 h-3.5" />
                        Preparing Preview...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" /> Preview Report
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPdf}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <CircleLoader className="w-3.5 h-3.5" />
                        Preparing PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Download Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. POTENTIAL ANNUAL COST TO REVIEW CALLOUT */}
            <div className="bg-white dark:bg-card border-2 border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Potential Annual Cost to Review
                </span>
                <span className="text-xs text-slate-500">
                  {diagnostic.flaggedSubscriptions.length} of {subscriptions.length} services flagged
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {currentCurrency.symbol}
                  <AnimatedCounter
                    value={diagnostic.potentialAnnualReviewAmount}
                    currency={currentCurrency}
                  />
                  <span className="text-xs sm:text-sm font-normal text-slate-500 ml-1.5">
                    / year ({currentCurrency.symbol}{fmt(diagnostic.potentialMonthlyReviewAmount)}/mo)
                  </span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 w-fit">
                  {diagnostic.reviewPercentageOfSpend.toFixed(1)}% of your total spend
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/10 pt-2.5">
                This is the annual cost of subscriptions flagged based on user-entered usage frequency, activity dates, category overlap, or price increases. It is an audit guide, not guaranteed savings.
              </p>
            </div>

            {/* 3. BIGGEST SUBSCRIPTION TO REVIEW SPOTLIGHT */}
            {diagnostic.biggestReviewItem && (
              <div className="bg-white dark:bg-card border-2 border-violet-500/40 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider bg-violet-600 text-white shadow-xs">
                    <Zap className="w-3.5 h-3.5" /> Biggest Subscription to Review
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-violet-900 dark:text-violet-300">
                    {currentCurrency.symbol}{fmt(diagnostic.biggestReviewItem.annualCost)}/year
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <BrandLogo name={diagnostic.biggestReviewItem.item.name} size="lg" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {diagnostic.biggestReviewItem.item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {CATEGORY_LABELS[diagnostic.biggestReviewItem.item.category]} • {currentCurrency.symbol}{fmt(diagnostic.biggestReviewItem.item.cost)}/{diagnostic.biggestReviewItem.item.billingFrequency}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-white/10 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <p>
                    <strong className="text-slate-900 dark:text-white">Why Flagged:</strong> {diagnostic.biggestReviewItem.primaryReason}
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Suggested Action:</strong> {diagnostic.biggestReviewItem.suggestedAction}
                  </p>
                </div>
              </div>
            )}

            {/* 4. SUBSCRIPTIONS TO REVIEW LIST */}
            {diagnostic.flaggedSubscriptions.length > 0 && (
              <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Subscriptions Flagged For Review
                </h3>

                <div className="space-y-2.5">
                  {diagnostic.flaggedSubscriptions.map((f, idx) => (
                    <div
                      key={f.item.id}
                      className="p-3.5 bg-slate-50 dark:bg-black/25 border border-slate-200 dark:border-white/10 rounded-xl space-y-2"
                    >
                      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <BrandLogo name={f.item.name} size="sm" />
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {idx + 1}. {f.item.name}
                              </span>
                              {f.reasons.map((r) => (
                                <span
                                  key={r}
                                  className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {CATEGORY_LABELS[f.item.category]} • {USAGE_LABELS[f.item.usageFrequency]} (Last used: {LAST_USED_LABELS[f.item.lastUsed]})
                            </p>
                          </div>
                        </div>

                        <div className="text-left xs:text-right font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white shrink-0">
                          {currentCurrency.symbol}{fmt(f.annualCost)}/yr
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 border-t border-slate-200/60 dark:border-white/5 leading-snug">
                        {f.primaryReason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. POTENTIAL OVERLAPS & PRICE INCREASES */}
            {(diagnostic.overlapGroups.length > 0 || diagnostic.priceIncreaseItems.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {diagnostic.overlapGroups.length > 0 && (
                  <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-violet-600" />
                      Potential Category Overlap
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Multiple active tools in the same functional domain. Review if consolidating features is practical.
                    </p>
                    <div className="space-y-2 pt-1">
                      {diagnostic.overlapGroups.map((g) => (
                        <div
                          key={g.category}
                          className="p-2.5 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/10 text-xs space-y-1"
                        >
                          <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                            <span>{g.categoryLabel} ({g.items.length})</span>
                            <span className="font-mono">{currentCurrency.symbol}{fmt(g.totalAnnualCost)}/yr</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            {g.items.map((i) => i.name).join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {diagnostic.priceIncreaseItems.length > 0 && (
                  <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                      Reported Price Increases
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Recurring rate changes compared to previous billing terms.
                    </p>
                    <div className="space-y-2 pt-1">
                      {diagnostic.priceIncreaseItems.map((p) => (
                        <div
                          key={p.item.id}
                          className="p-2.5 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/10 text-xs space-y-1"
                        >
                          <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                            <span>{p.item.name}</span>
                            <span className="text-rose-600 font-mono">+{p.increasePct.toFixed(1)}%</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Old: {currentCurrency.symbol}{fmt(p.previousCost)} → New: {currentCurrency.symbol}{fmt(p.currentCost)} (+{currentCurrency.symbol}{fmt(p.annualIncrease)}/yr)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. WHAT-IF SCENARIO MODELER */}
            {diagnostic.flaggedSubscriptions.length > 0 && (
              <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-violet-600" />
                    What-If Optimization Scenario
                  </span>
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                    Modeled Simulation
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((num) => {
                    const disabled = num > diagnostic.flaggedSubscriptions.length
                    return (
                      <button
                        key={num}
                        type="button"
                        disabled={disabled}
                        onClick={() => setScenarioItemCount(num)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          scenarioItemCount === num && !disabled
                            ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                            : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        }`}
                      >
                        Review Top {num}
                      </button>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 pt-2 border-t border-slate-100 dark:border-white/10 text-center">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                    <span className="text-[10px] sm:text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                      Modeled Monthly Reduction
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-emerald-900 dark:text-emerald-200">
                      +{currentCurrency.symbol}
                      <AnimatedCounter
                        value={scenarioSavings.monthly}
                        currency={currentCurrency}
                        duration={350}
                      />
                      /mo
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                    <span className="text-[10px] sm:text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                      Modeled Annual Gain
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-emerald-900 dark:text-emerald-200">
                      +{currentCurrency.symbol}
                      <AnimatedCounter
                        value={scenarioSavings.annual}
                        currency={currentCurrency}
                        duration={350}
                      />
                      /year
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Scenario estimate based on reviewing the top {Math.min(scenarioItemCount, diagnostic.flaggedSubscriptions.length)} flagged subscription(s). Not guaranteed savings.
                </p>
              </div>
            )}

            {/* 7. HOW WE CALCULATED THIS (Formula Transparency) */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-card">
              <button
                type="button"
                onClick={() => setShowFormulas(!showFormulas)}
                className="w-full p-3.5 sm:p-4 bg-slate-50 dark:bg-black/20 flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors gap-2"
              >
                <span className="flex items-center gap-2 truncate">
                  <HelpCircle className="w-4 h-4 text-violet-500 shrink-0" />
                  <span className="truncate">How we calculated this (Formula Transparency)</span>
                </span>
                <span className="text-xs text-violet-600 dark:text-violet-400 font-semibold shrink-0">
                  {showFormulas ? "Hide ▲" : "Inspect ▼"}
                </span>
              </button>

              <AnimatePresence>
                {showFormulas && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 sm:p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/10 overflow-x-auto">
                      {diagnostic.formulasApplied.map((f, i) => (
                        <div key={i} className="pb-2 border-b border-slate-100 dark:border-white/5 last:border-b-0">
                          <strong className="text-slate-900 dark:text-white">
                            {f.concept}:
                          </strong>{" "}
                          <code className="bg-slate-100 dark:bg-black/40 px-1.5 py-0.5 rounded font-mono text-[10px] sm:text-[10.5px] break-all">
                            {f.formula}
                          </code>
                          <div className="text-slate-500 mt-0.5 text-[11px]">
                            {f.result}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 8. REPORT BRANDING & BOTTOM ACTIONS */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Report Customization (Optional for PDF Export)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <input
                  type="text"
                  placeholder="Entity / Name (e.g. Alex Miller / Acme Corp)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg text-xs outline-none focus:border-violet-500 transition-colors w-full min-w-0"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 dark:file:bg-white/10 dark:file:text-white border border-slate-300 dark:border-white/10 rounded-lg p-0.5 bg-slate-50 dark:bg-black/30 w-full min-w-0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePreviewPDF}
                  disabled={isPreviewing}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isPreviewing ? (
                    <>
                      <CircleLoader className="w-4 h-4" />
                      Preparing Preview...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Preview Diagnostic Report
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isGeneratingPdf ? (
                    <>
                      <CircleLoader className="w-4 h-4" />
                      Preparing PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download Report (PDF)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT SUBSCRIPTION DIALOG USING TURNIVODIALOG & TURNIVOSELECT */}
      <TurnivoDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingId ? "Edit Subscription" : "Add Subscription"}
        description="Enter recurring billing and usage details to evaluate potential cost leaks."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSubscription} className="space-y-4">
          {/* 1. Subscription Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Subscription / Service Name <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="e.g. Figma Pro, Netflix, Slack, Gym"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                autoFocus
              />
              {formName.trim() && (
                <BrandLogo name={formName} size="md" />
              )}
            </div>
          </div>

          {/* 2. Category & Billing Frequency using TurnivoSelect */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <TurnivoSelect
                value={formCategory}
                onChange={(val) => setFormCategory(val as SubscriptionCategory)}
                options={categoryOptions}
                size="md"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Billing Frequency
              </label>
              <TurnivoSelect
                value={formBilling}
                onChange={(val) => setFormBilling(val as BillingFrequency)}
                options={billingOptions}
                size="md"
              />
            </div>
          </div>

          {/* 3. Cost */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Recurring Cost ({BILLING_LABELS[formBilling]}) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20">
              <span className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                {currentCurrency.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                required
                placeholder="e.g. 15.00"
                value={formCost}
                onChange={(e) => setFormCost(e.target.value)}
                className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none min-w-0"
              />
            </div>
          </div>

          {/* 4. Usage & Last Used using TurnivoSelect */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                How often do you use this?
              </label>
              <TurnivoSelect
                value={formUsage}
                onChange={(val) => setFormUsage(val as UsageFrequency)}
                options={usageOptions}
                size="md"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                When did you last use it?
              </label>
              <TurnivoSelect
                value={formLastUsed}
                onChange={(val) => setFormLastUsed(val as LastUsedTime)}
                options={lastUsedOptions}
                size="md"
              />
            </div>
          </div>

          {/* 5. Collapsible More Details */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvancedFields(!showAdvancedFields)}
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              {showAdvancedFields ? "Hide additional details ▲" : "+ More details (price changes, seats, notes) ▼"}
            </button>

            {showAdvancedFields && (
              <div className="space-y-3 pt-3 mt-2 border-t border-slate-100 dark:border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Previous Price (if changed)
                    </label>
                    <div className="flex items-center bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden">
                      <span className="px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10">
                        {currentCurrency.symbol}
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="e.g. 10.00"
                        value={formPrevCost}
                        onChange={(e) => setFormPrevCost(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Number of Seats / Users
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1 or 5"
                      value={formSeats}
                      onChange={(e) => setFormSeats(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Notes / Purpose
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Used for marketing campaigns, renews in November"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              {editingId ? "Save Changes" : "Add Subscription"}
            </button>
          </div>
        </form>
      </TurnivoDialog>
    </>
  )
}
