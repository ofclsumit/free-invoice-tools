"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import {
  Download,
  Eye,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Sliders,
  Info,
  Building2,
  Briefcase,
  ShoppingCart,
  Layers,
  Store,
  Factory,
  RotateCcw,
  Zap,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { ProfitLeakDocument } from "@/components/calculator-documents"
import { TurnivoSelect, TurnivoSelectOption } from "@/components/ui/turnivo-select"
import {
  CountryCode,
  BusinessType,
  ProfitLeakInput,
  SupportedCurrency,
  SUPPORTED_CURRENCIES,
  runProfitLeakDiagnostic,
  formatCurrencyAmount,
} from "@/lib/profit-leak/diagnostic-engine"

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

// Clean Grayscale Result Skeleton Component (Fully Responsive)
function ResultSkeleton() {
  return (
    <div
      className="space-y-4 sm:space-y-6 animate-pulse w-full overflow-hidden"
      aria-busy="true"
      aria-label="Loading diagnostic results"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2">
        <div className="space-y-2 w-full sm:w-auto">
          <div className="h-6 sm:h-7 w-48 sm:w-64 bg-slate-200 dark:bg-white/10 rounded-lg" />
          <div className="h-3.5 sm:h-4 w-full sm:w-80 bg-slate-200/70 dark:bg-white/5 rounded" />
        </div>
        <div className="h-8 w-28 bg-slate-200 dark:bg-white/10 rounded-lg" />
      </div>

      {/* Primary Result Summary Skeleton */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
        <div className="h-3 w-32 sm:w-40 bg-white/20 rounded" />
        <div className="h-8 sm:h-10 w-44 sm:w-60 bg-white/20 rounded-lg" />
        <div className="h-3.5 sm:h-4 w-full max-w-xs bg-white/15 rounded" />
      </div>

      {/* Spotlight Biggest Leak Skeleton */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
          <div className="h-5 w-40 sm:w-44 bg-slate-200 dark:bg-white/10 rounded-full" />
          <div className="h-5 w-20 sm:w-24 bg-slate-200 dark:bg-white/10 rounded" />
        </div>
        <div className="h-5 sm:h-6 w-48 sm:w-52 bg-slate-200 dark:bg-white/10 rounded" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-full bg-slate-200/70 dark:bg-white/5 rounded" />
          <div className="h-3.5 w-4/5 bg-slate-200/70 dark:bg-white/5 rounded" />
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
          <div className="h-3.5 w-32 bg-slate-200 dark:bg-white/10 rounded" />
          <div className="h-3 w-3/4 bg-slate-200/60 dark:bg-white/5 rounded" />
          <div className="h-3 w-2/3 bg-slate-200/60 dark:bg-white/5 rounded" />
        </div>
      </div>

      {/* 3 Things to Investigate Skeleton */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 md:p-6 space-y-3">
        <div className="h-4 w-44 sm:w-48 bg-slate-200 dark:bg-white/10 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/25 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2"
            >
              <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded" />
              <div className="h-4 w-28 bg-slate-200 dark:bg-white/10 rounded" />
              <div className="h-3 w-full bg-slate-200/70 dark:bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Ranked Top Leaks Breakdown Skeleton */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 md:p-6 space-y-3">
        <div className="h-4 w-40 sm:w-44 bg-slate-200 dark:bg-white/10 rounded" />
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/25 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2"
            >
              <div className="flex justify-between items-center gap-2">
                <div className="h-4 w-32 sm:w-40 bg-slate-200 dark:bg-white/10 rounded" />
                <div className="h-4 w-16 sm:w-20 bg-slate-200 dark:bg-white/10 rounded" />
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Smooth Number Counter Component
function AnimatedCounter({
  value,
  currency,
  duration = 750,
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

function AnimatedPercentage({
  value,
  duration = 750,
}: {
  value: number
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

  return <span>{displayValue.toFixed(1)}%</span>
}

export function ProfitLeakClient() {
  const router = useRouter()
  const { toast } = useToast()

  // Current Guided Step: 1 = Business, 2 = Core Costs, 3 = Additional Costs, 4 = Cash Flow, 5 = Results
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Business Profile States
  const [country, setCountry] = useState<CountryCode>("US")
  const [currencyCode, setCurrencyCode] = useState<string>("USD")
  const [businessType, setBusinessType] = useState<BusinessType>("ecommerce")
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")

  // 2. Revenue & Core Costs
  const [revenue, setRevenue] = useState("")
  const [cogs, setCogs] = useState("")
  const [payrollLabor, setPayrollLabor] = useState("")
  const [shippingFulfillment, setShippingFulfillment] = useState("")
  const [paymentFees, setPaymentFees] = useState("")

  // 3. Additional Operating Costs
  const [discounts, setDiscounts] = useState("")
  const [discountRatePct, setDiscountRatePct] = useState("")
  const [advertisingSpend, setAdvertisingSpend] = useState("")
  const [returnsRefunds, setReturnsRefunds] = useState("")
  const [rtoLosses, setRtoLosses] = useState("")
  const [marketplaceFees, setMarketplaceFees] = useState("")
  const [softwareSaaS, setSoftwareSaaS] = useState("")
  const [contractors, setContractors] = useState("")
  const [unbilledHoursAmount, setUnbilledHoursAmount] = useState("")
  const [inventoryWasteSpoilage, setInventoryWasteSpoilage] = useState("")
  const [badDebtAmount, setBadDebtAmount] = useState("")

  // 4. Cash-Flow Pressure Inputs
  const [unpaidInvoices, setUnpaidInvoices] = useState("")
  const [inventoryTiedUp, setInventoryTiedUp] = useState("")

  // "I Don't Know" helper states for optional fields
  const [dontKnowFields, setDontKnowFields] = useState<Record<string, boolean>>({})

  // Asynchronous action states
  const [isCalculating, setIsCalculating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [showFormulas, setShowFormulas] = useState(false)
  const [selectedReductionPct, setSelectedReductionPct] = useState<number>(10)

  // Handle Country selection with smart currency defaults
  const handleCountryChange = (c: CountryCode) => {
    setCountry(c)
    if (c === "US") setCurrencyCode("USD")
    else if (c === "IN") setCurrencyCode("INR")
  }

  const currentCurrency =
    SUPPORTED_CURRENCIES[currencyCode] ||
    (country === "IN" ? SUPPORTED_CURRENCIES.INR : SUPPORTED_CURRENCIES.USD)

  const toggleDontKnow = (fieldKey: string) => {
    setDontKnowFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }))
  }

  // Diagnostic Input Data Payload
  const diagnosticInput: ProfitLeakInput = useMemo(() => {
    return {
      country,
      businessType,
      currencyCode,
      monthlyRevenue: parseFloat(revenue) || 0,
      cogs: dontKnowFields["cogs"] ? undefined : parseFloat(cogs) || undefined,
      payrollLabor: dontKnowFields["payrollLabor"] ? undefined : parseFloat(payrollLabor) || undefined,
      shippingFulfillment: dontKnowFields["shippingFulfillment"] ? undefined : parseFloat(shippingFulfillment) || undefined,
      discounts: dontKnowFields["discounts"] ? undefined : parseFloat(discounts) || undefined,
      discountRatePct: dontKnowFields["discounts"] ? undefined : parseFloat(discountRatePct) || undefined,
      paymentFees: dontKnowFields["paymentFees"] ? undefined : parseFloat(paymentFees) || undefined,
      advertisingSpend: dontKnowFields["advertisingSpend"] ? undefined : parseFloat(advertisingSpend) || undefined,
      returnsRefunds: dontKnowFields["returnsRefunds"] ? undefined : parseFloat(returnsRefunds) || undefined,
      rtoLosses: dontKnowFields["rtoLosses"] ? undefined : parseFloat(rtoLosses) || undefined,
      marketplaceFees: dontKnowFields["marketplaceFees"] ? undefined : parseFloat(marketplaceFees) || undefined,
      softwareSaaS: dontKnowFields["softwareSaaS"] ? undefined : parseFloat(softwareSaaS) || undefined,
      contractors: dontKnowFields["contractors"] ? undefined : parseFloat(contractors) || undefined,
      unbilledHoursAmount: dontKnowFields["unbilledHoursAmount"] ? undefined : parseFloat(unbilledHoursAmount) || undefined,
      inventoryWasteSpoilage: dontKnowFields["inventoryWasteSpoilage"] ? undefined : parseFloat(inventoryWasteSpoilage) || undefined,
      badDebtAmount: dontKnowFields["badDebtAmount"] ? undefined : parseFloat(badDebtAmount) || undefined,
      unpaidInvoicesReceivable: dontKnowFields["unpaidInvoices"] ? undefined : parseFloat(unpaidInvoices) || undefined,
      inventoryTiedUp: dontKnowFields["inventoryTiedUp"] ? undefined : parseFloat(inventoryTiedUp) || undefined,
    }
  }, [
    country,
    businessType,
    currencyCode,
    revenue,
    cogs,
    payrollLabor,
    shippingFulfillment,
    discounts,
    discountRatePct,
    paymentFees,
    advertisingSpend,
    returnsRefunds,
    rtoLosses,
    marketplaceFees,
    softwareSaaS,
    contractors,
    unbilledHoursAmount,
    inventoryWasteSpoilage,
    badDebtAmount,
    unpaidInvoices,
    inventoryTiedUp,
    dontKnowFields,
  ])

  const diagnosticResult = useMemo(() => {
    return runProfitLeakDiagnostic(diagnosticInput)
  }, [diagnosticInput])

  const handleNext = () => {
    if (currentStep === 2) {
      const revNum = parseFloat(revenue) || 0
      if (revNum <= 0) {
        toast({
          title: "Monthly Revenue Required",
          description: "Please enter your average monthly revenue to proceed.",
          variant: "destructive",
        })
        return
      }
    }
    if (currentStep === 4) {
      setIsCalculating(true)
      setTimeout(() => {
        setIsCalculating(false)
        setCurrentStep(5)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 300)
      return
    }
    setCurrentStep((prev) => Math.min(5, prev + 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompanyLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const getDocData = () => ({
    diagnostic: diagnosticResult,
    companyName: companyName.trim() || undefined,
    companyLogo,
  })

  const handlePreviewPDF = () => {
    setIsPreviewing(true)
    const id = savePreviewData({
      docType: "profit-leak-detector",
      title: "Profit Leak Diagnostic Report Preview",
      fileName: `profit-leak-report-${new Date().toISOString().split("T")[0]}.pdf`,
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
          `profit-leak-report-${new Date().toISOString().split("T")[0]}.pdf`
        )
      }
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const fmt = (n: number) => formatCurrencyAmount(n, currentCurrency)

  // Selected scenario calculation
  const targetLeakAmount = diagnosticResult.biggestLeak
    ? diagnosticResult.biggestLeak.monthlyImpact
    : diagnosticResult.totalMonthlyLeakage
  const scenarioMonthlySavings = (targetLeakAmount * selectedReductionPct) / 100
  const scenarioAnnualSavings = scenarioMonthlySavings * 12

  // Progress Steps Definition
  const steps = [
    { num: 1, label: "Business" },
    { num: 2, label: "Core Costs" },
    { num: 3, label: "Other Costs" },
    { num: 4, label: "Cash Flow" },
    { num: 5, label: "Results" },
  ]

  // Business Type Cards config
  const businessTypesList: {
    id: BusinessType
    title: string
    desc: string
    icon: React.ComponentType<any>
  }[] = [
    {
      id: "ecommerce",
      title: "Ecommerce / D2C",
      desc: "Online store, Shopify, Amazon & direct shipping",
      icon: ShoppingCart,
    },
    {
      id: "service",
      title: "Service Business",
      desc: "Consultancies, agencies & B2B service firms",
      icon: Briefcase,
    },
    {
      id: "retail",
      title: "Retail / Shop",
      desc: "Physical storefronts, local shops & counter sales",
      icon: Store,
    },
    {
      id: "freelance",
      title: "Freelance / Agency",
      desc: "Independent professionals, creatives & studios",
      icon: Layers,
    },
    {
      id: "wholesale",
      title: "Wholesale / Distribution",
      desc: "B2B suppliers, freight, bulk orders & storage",
      icon: Factory,
    },
    {
      id: "other",
      title: "Other Commercial",
      desc: "General business operations & trade",
      icon: Building2,
    },
  ]

  const stepContainerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.28,
        ease: "easeOut",
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: { duration: 0.18, ease: "easeInOut" },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  }

  return (
    <>
      {/* Hidden print document for instant export (client only) */}
      {mounted && (
        <div
          className="absolute -left-[9999px] -top-[9999px] pointer-events-none"
          style={{ width: "210mm", minWidth: "210mm", maxWidth: "210mm" }}
          aria-hidden="true"
        >
          <ProfitLeakDocument {...getDocData()} />
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* MINIMAL STEP PROGRESS INDICATOR (Fully Responsive) */}
        <nav
          aria-label="Diagnostic Steps"
          className="flex items-center justify-between px-2.5 sm:px-5 py-2.5 sm:py-3 bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs transition-colors duration-200 w-full overflow-hidden"
        >
          {steps.map((step, idx) => {
            const isActive = currentStep === step.num
            const isDone = currentStep > step.num
            return (
              <div key={step.num} className="flex items-center flex-1 last:flex-none min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (step.num < currentStep) setCurrentStep(step.num)
                  }}
                  disabled={step.num > currentStep}
                  className={`group flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs font-semibold transition-all duration-200 shrink-0 ${
                    isActive
                      ? "text-violet-600 dark:text-violet-400 font-bold"
                      : isDone
                      ? "text-slate-700 dark:text-slate-300 hover:text-violet-600"
                      : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <motion.span
                    layout
                    className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-[11px] font-bold transition-all duration-200 shrink-0 ${
                      isActive
                        ? "bg-violet-600 text-white shadow-sm ring-2 ring-violet-500/20"
                        : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 dark:bg-white/10 text-slate-400"
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : step.num}
                  </motion.span>
                  <span className="hidden md:inline truncate">{step.label}</span>
                </button>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded transition-colors duration-300 min-w-[8px] ${
                      currentStep > step.num
                        ? "bg-emerald-500/60"
                        : "bg-slate-200 dark:bg-white/10"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </nav>

        {/* STEP TRANSITIONS CONTAINER */}
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* STEP 1: BUSINESS PROFILE & LOCATION */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              variants={stepContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 md:p-7 shadow-xs space-y-5 sm:space-y-6"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                  Let&apos;s understand your business
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  A few details will help us focus on the profit leaks that matter most to you.
                </p>
              </motion.div>

              {/* Country Selector */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Where is your business based?
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { id: "US", label: "United States", flag: "🇺🇸", sub: "USD ($)" },
                    { id: "IN", label: "India", flag: "🇮🇳", sub: "INR (₹)" },
                    { id: "OTHER", label: "Other", flag: "🌐", sub: "International" },
                  ].map((item) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCountryChange(item.id as CountryCode)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 min-w-0 ${
                        country === item.id
                          ? "bg-violet-50/80 dark:bg-violet-950/40 border-violet-500 text-slate-900 dark:text-white ring-2 ring-violet-500/20 shadow-xs"
                          : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                      }`}
                    >
                      <span className="text-lg sm:text-xl">{item.flag}</span>
                      <div className="mt-1.5 sm:mt-2 min-w-0">
                        <span className="text-xs sm:text-sm font-bold block truncate">
                          {item.label}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {item.sub}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Custom Currency Picker if Other */}
              <AnimatePresence>
                {country === "OTHER" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 p-3 sm:p-3.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Select Your Accounting Currency
                      </label>
                      <TurnivoSelect
                        value={currencyCode}
                        onChange={(val) => setCurrencyCode(val)}
                        options={Object.values(SUPPORTED_CURRENCIES).map((c) => ({
                          value: c.code,
                          label: c.label,
                          sub: `${c.code} (${c.symbol})`,
                        }))}
                        searchable
                        placeholder="Search accounting currencies..."
                        size="sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Business Type Cards */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  What type of business do you run?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {businessTypesList.map((item) => {
                    const Icon = item.icon
                    const isSelected = businessType === item.id
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        whileHover={{ y: -2, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setBusinessType(item.id)}
                        className={`p-3 sm:p-3.5 rounded-xl border text-left flex items-start gap-2.5 sm:gap-3 transition-all duration-200 relative ${
                          isSelected
                            ? "bg-violet-50/80 dark:bg-violet-950/40 border-violet-500 text-slate-900 dark:text-white ring-2 ring-violet-500/20 shadow-xs"
                            : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                        }`}
                      >
                        <span
                          className={`p-2 rounded-lg shrink-0 transition-colors duration-200 ${
                            isSelected
                              ? "bg-violet-600 text-white"
                              : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="flex-1 pr-4 min-w-0">
                          <span className="text-xs sm:text-sm font-bold block truncate">
                            {item.title}
                          </span>
                          <span className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-snug block">
                            {item.desc}
                          </span>
                        </div>

                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-3 right-3 w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </motion.span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Step 1 Actions */}
              <motion.div variants={itemVariants} className="flex justify-end pt-2">
                <motion.button
                  type="button"
                  whileHover={{ y: -1, transition: { duration: 0.15 } }}
                  whileTap={{ y: 0 }}
                  onClick={handleNext}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all duration-200"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: REVENUE & CORE COSTS */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              variants={stepContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 md:p-7 shadow-xs space-y-5 sm:space-y-6"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                  Start with your main numbers
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Use your average monthly figures. Estimates are based on what you enter.
                </p>
              </motion.div>

              {/* PRIMARY INPUT: Monthly Revenue */}
              <motion.div
                variants={itemVariants}
                className="p-3.5 sm:p-4 bg-violet-50/70 dark:bg-violet-950/20 border-2 border-violet-500/40 rounded-xl space-y-1.5 transition-all duration-200"
              >
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Average Monthly Revenue <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-violet-700 dark:text-violet-400">
                    Required
                  </span>
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                  Your average total sales for one month before subtracting any expenses.
                </p>
                <div className="flex items-center bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden shadow-xs focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all duration-200 min-w-0">
                  <span className="px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-violet-700 dark:text-violet-300 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                    {currentCurrency.symbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 50000"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="flex-1 px-3 py-2 sm:py-2.5 bg-transparent border-none text-sm sm:text-base font-semibold text-slate-900 dark:text-white outline-none min-w-0"
                    autoFocus
                  />
                </div>
              </motion.div>

              {/* CORE COSTS GRID */}
              <motion.div variants={itemVariants} className="space-y-4 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block border-b border-slate-200 dark:border-white/10 pb-1">
                  Core Operating Costs
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* 1. Product / Service Cost (COGS) */}
                  {(businessType === "ecommerce" ||
                    businessType === "retail" ||
                    businessType === "wholesale" ||
                    businessType === "other") && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          Product / Delivery Cost
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleDontKnow("cogs")}
                            className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded transition-colors ${
                              dontKnowFields["cogs"]
                                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                            }`}
                          >
                            {dontKnowFields["cogs"] ? "✓ Unsure" : "I don't know"}
                          </button>
                          <span className="text-[10px] text-slate-400">Optional</span>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-tight">
                        What you spend to manufacture or buy what you sell.
                      </p>
                      <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                        <span className="px-2.5 py-2 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                          {currentCurrency.symbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          placeholder={dontKnowFields["cogs"] ? "Auto-estimated" : "e.g. 20000"}
                          value={dontKnowFields["cogs"] ? "" : cogs}
                          disabled={dontKnowFields["cogs"]}
                          onChange={(e) => setCogs(e.target.value)}
                          className="flex-1 px-2.5 py-2 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none disabled:opacity-50 min-w-0"
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. Labor / Payroll */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        Labor / Team Payroll
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleDontKnow("payrollLabor")}
                          className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded transition-colors ${
                            dontKnowFields["payrollLabor"]
                              ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                          }`}
                        >
                          {dontKnowFields["payrollLabor"] ? "✓ Unsure" : "I don't know"}
                        </button>
                        <span className="text-[10px] text-slate-400">Optional</span>
                      </div>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-tight">
                      Monthly employee salaries or contractor wages.
                    </p>
                    <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                      <span className="px-2.5 py-2 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                        {currentCurrency.symbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder={dontKnowFields["payrollLabor"] ? "Auto-estimated" : "e.g. 10000"}
                        value={dontKnowFields["payrollLabor"] ? "" : payrollLabor}
                        disabled={dontKnowFields["payrollLabor"]}
                        onChange={(e) => setPayrollLabor(e.target.value)}
                        className="flex-1 px-2.5 py-2 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none disabled:opacity-50 min-w-0"
                      />
                    </div>
                  </div>

                  {/* 3. Shipping / Fulfillment */}
                  {(businessType === "ecommerce" ||
                    businessType === "retail" ||
                    businessType === "wholesale") && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          Shipping & Fulfillment
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleDontKnow("shippingFulfillment")}
                            className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded transition-colors ${
                              dontKnowFields["shippingFulfillment"]
                                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                            }`}
                          >
                            {dontKnowFields["shippingFulfillment"] ? "✓ Unsure" : "I don't know"}
                          </button>
                          <span className="text-[10px] text-slate-400">Optional</span>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-tight">
                        Monthly courier, freight, or warehouse fulfillment costs.
                      </p>
                      <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                        <span className="px-2.5 py-2 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                          {currentCurrency.symbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          placeholder={dontKnowFields["shippingFulfillment"] ? "Auto-estimated" : "e.g. 3500"}
                          value={dontKnowFields["shippingFulfillment"] ? "" : shippingFulfillment}
                          disabled={dontKnowFields["shippingFulfillment"]}
                          onChange={(e) => setShippingFulfillment(e.target.value)}
                          className="flex-1 px-2.5 py-2 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none disabled:opacity-50 min-w-0"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. Payment & Platform Gateway Fees */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        Payment & Platform Fees
                      </span>
                      <span className="text-[10px] text-violet-600 dark:text-violet-400 shrink-0">
                        Auto-estimated if empty
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-tight">
                      {country === "IN"
                        ? "Razorpay / UPI / PG micro-fees (~2.0% baseline)"
                        : "Stripe / Square / card processing fees (~2.9% baseline)"}
                    </p>
                    <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                      <span className="px-2.5 py-2 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                        {currentCurrency.symbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Leave blank for standard estimate"
                        value={paymentFees}
                        disabled={dontKnowFields["paymentFees"]}
                        onChange={(e) => setPaymentFees(e.target.value)}
                        className="flex-1 px-2.5 py-2 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none disabled:opacity-50 min-w-0"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 Actions */}
              <motion.div
                variants={itemVariants}
                className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/10 gap-2"
              >
                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-semibold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ y: -1, transition: { duration: 0.15 } }}
                  whileTap={{ y: 0 }}
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all duration-200"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: ADDITIONAL OPERATING COSTS */}
          {/* ============================================================ */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              variants={stepContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 md:p-7 shadow-xs space-y-5 sm:space-y-6"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                  Check for hidden operating drains
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  These optional categories often hide the biggest profit leaks. Skip any that do not apply.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3.5 sm:space-y-4">
                {/* DISCOUNTS & CONCESSIONS (Responsive Input Row) */}
                <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5 transition-all duration-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      Customer Discounts & Price Concessions
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">
                      Optional
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Discretionary price cuts, coupons, or client concessions given per month.
                  </p>
                  <div className="flex flex-col xs:flex-row gap-2">
                    <div className="flex-1 flex items-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200 min-w-0">
                      <span className="px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                        {currentCurrency.symbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Monthly amount (e.g. 2500)"
                        value={discounts}
                        onChange={(e) => setDiscounts(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none min-w-0"
                      />
                    </div>
                    <div className="w-full xs:w-28 flex items-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="or %"
                        value={discountRatePct}
                        onChange={(e) => setDiscountRatePct(e.target.value)}
                        className="w-full px-2 py-1.5 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none text-right min-w-0"
                      />
                      <span className="px-2 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-l border-slate-200 dark:border-white/10 shrink-0">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* ADVERTISING SPEND */}
                {(businessType === "ecommerce" ||
                  businessType === "retail" ||
                  businessType === "freelance" ||
                  businessType === "other") && (
                  <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5 transition-all duration-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        Paid Advertising Spend (Meta, Google, Amazon Ads)
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleDontKnow("advertisingSpend")}
                          className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded transition-colors ${
                            dontKnowFields["advertisingSpend"]
                              ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                          }`}
                        >
                          {dontKnowFields["advertisingSpend"] ? "✓ Unsure" : "I don't know"}
                        </button>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Optional
                        </span>
                      </div>
                    </div>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                      Average monthly budget allocated to paid acquisition channels.
                    </p>
                    <div className="flex items-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                      <span className="px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                        {currentCurrency.symbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder={dontKnowFields["advertisingSpend"] ? "Auto-estimated" : "e.g. 5000"}
                        value={dontKnowFields["advertisingSpend"] ? "" : advertisingSpend}
                        disabled={dontKnowFields["advertisingSpend"]}
                        onChange={(e) => setAdvertisingSpend(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none disabled:opacity-50 min-w-0"
                      />
                    </div>
                  </div>
                )}

                {/* RETURNS & INDIA RTO */}
                {(businessType === "ecommerce" ||
                  businessType === "retail" ||
                  businessType === "wholesale") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5 transition-all duration-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          Returns & Refunds
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleDontKnow("returnsRefunds")}
                            className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded transition-colors ${
                              dontKnowFields["returnsRefunds"]
                                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                            }`}
                          >
                            {dontKnowFields["returnsRefunds"] ? "✓ Unsure" : "I don't know"}
                          </button>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            Optional
                          </span>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-tight">
                        Monthly customer refund costs & restocking losses.
                      </p>
                      <div className="flex items-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                        <span className="px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                          {currentCurrency.symbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          placeholder={dontKnowFields["returnsRefunds"] ? "Auto-estimated" : "e.g. 1800"}
                          value={dontKnowFields["returnsRefunds"] ? "" : returnsRefunds}
                          disabled={dontKnowFields["returnsRefunds"]}
                          onChange={(e) => setReturnsRefunds(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none disabled:opacity-50 min-w-0"
                        />
                      </div>
                    </div>

                    {country === "IN" && (
                      <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5 transition-all duration-200">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            COD / RTO Logistics
                          </span>
                          <span className="text-[10px] text-violet-600 font-semibold shrink-0">
                            India
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-tight">
                          Two-way courier charges on rejected Cash on Delivery parcels.
                        </p>
                        <div className="flex items-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                          <span className="px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                            {currentCurrency.symbol}
                          </span>
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 1200"
                            value={rtoLosses}
                            onChange={(e) => setRtoLosses(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none min-w-0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MARKETPLACE COMMISSION */}
                {(businessType === "ecommerce" ||
                  businessType === "retail" ||
                  businessType === "wholesale") && (
                  <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5 transition-all duration-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {country === "IN"
                          ? "Amazon / Flipkart Platform Fees"
                          : "Marketplace Commissions (Amazon, Etsy, Take-Rate)"}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleDontKnow("marketplaceFees")}
                          className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded transition-colors ${
                            dontKnowFields["marketplaceFees"]
                              ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                          }`}
                        >
                          {dontKnowFields["marketplaceFees"] ? "✓ Unsure" : "I don't know"}
                        </button>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Optional
                        </span>
                      </div>
                    </div>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                      Platform closing and referral commissions paid on channel sales.
                    </p>
                    <div className="flex items-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                      <span className="px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                        {currentCurrency.symbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder={dontKnowFields["marketplaceFees"] ? "Auto-estimated" : "e.g. 3500"}
                        value={dontKnowFields["marketplaceFees"] ? "" : marketplaceFees}
                        disabled={dontKnowFields["marketplaceFees"]}
                        onChange={(e) => setMarketplaceFees(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none disabled:opacity-50 min-w-0"
                      />
                    </div>
                  </div>
                )}

                {/* UNBILLED SCOPE CREEP FOR SERVICE / FREELANCE */}
                {(businessType === "service" || businessType === "freelance") && (
                  <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5 transition-all duration-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        Unbilled Scope Creep & Extra Revision Hours Value
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleDontKnow("unbilledHoursAmount")}
                          className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded transition-colors ${
                            dontKnowFields["unbilledHoursAmount"]
                              ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                          }`}
                        >
                          {dontKnowFields["unbilledHoursAmount"] ? "✓ Unsure" : "I don't know"}
                        </button>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Optional
                        </span>
                      </div>
                    </div>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                      Estimated monthly value of free revisions or out-of-scope work.
                    </p>
                    <div className="flex items-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                      <span className="px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                        {currentCurrency.symbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder={dontKnowFields["unbilledHoursAmount"] ? "Auto-estimated" : "e.g. 1500"}
                        value={dontKnowFields["unbilledHoursAmount"] ? "" : unbilledHoursAmount}
                        disabled={dontKnowFields["unbilledHoursAmount"]}
                        onChange={(e) => setUnbilledHoursAmount(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none disabled:opacity-50 min-w-0"
                      />
                    </div>
                  </div>
                )}

                {/* SOFTWARE / SAAS */}
                <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5 transition-all duration-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      Software, SaaS Subscriptions & Tool Licenses
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleDontKnow("softwareSaaS")}
                        className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded transition-colors ${
                          dontKnowFields["softwareSaaS"]
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                        }`}
                      >
                        {dontKnowFields["softwareSaaS"] ? "✓ Unsure" : "I don't know"}
                      </button>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Optional
                      </span>
                    </div>
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                    Monthly recurring software seats, CRM, design apps, and hosting.
                  </p>
                  <div className="flex items-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                    <span className="px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                      {currentCurrency.symbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder={dontKnowFields["softwareSaaS"] ? "Auto-estimated" : "e.g. 800"}
                      value={dontKnowFields["softwareSaaS"] ? "" : softwareSaaS}
                      disabled={dontKnowFields["softwareSaaS"]}
                      onChange={(e) => setSoftwareSaaS(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none disabled:opacity-50 min-w-0"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Step 3 Actions */}
              <motion.div
                variants={itemVariants}
                className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/10 gap-2"
              >
                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-semibold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ y: -1, transition: { duration: 0.15 } }}
                  whileTap={{ y: 0 }}
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all duration-200"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: CASH-FLOW RISKS & REVIEW */}
          {/* ============================================================ */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              variants={stepContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 md:p-7 shadow-xs space-y-5 sm:space-y-6"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                  Review cash-flow pressure
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <strong>Important distinction:</strong> These represent working capital temporarily trapped in operations, NOT lost profit.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5 transition-all duration-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      Unpaid Client Invoices (A/R)
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleDontKnow("unpaidInvoices")}
                        className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded transition-colors ${
                          dontKnowFields["unpaidInvoices"]
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                        }`}
                      >
                        {dontKnowFields["unpaidInvoices"] ? "✓ Unsure" : "I don't know"}
                      </button>
                      <span className="text-[10px] text-slate-400">Optional</span>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    Total uncollected invoices currently past payment terms.
                  </p>
                  <div className="flex items-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                    <span className="px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                      {currentCurrency.symbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder={dontKnowFields["unpaidInvoices"] ? "Skipped" : "e.g. 12000"}
                      value={dontKnowFields["unpaidInvoices"] ? "" : unpaidInvoices}
                      disabled={dontKnowFields["unpaidInvoices"]}
                      onChange={(e) => setUnpaidInvoices(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none disabled:opacity-50 min-w-0"
                    />
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-1.5 transition-all duration-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      Excess / Sitting Stock Value
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleDontKnow("inventoryTiedUp")}
                        className={`text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded transition-colors ${
                          dontKnowFields["inventoryTiedUp"]
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                        }`}
                      >
                        {dontKnowFields["inventoryTiedUp"] ? "✓ Unsure" : "I don't know"}
                      </button>
                      <span className="text-[10px] text-slate-400">Optional</span>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    Valuation of slow-moving inventory sitting in storage.
                  </p>
                  <div className="flex items-center bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                    <span className="px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 border-r border-slate-200 dark:border-white/10 shrink-0">
                      {currentCurrency.symbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder={dontKnowFields["inventoryTiedUp"] ? "Skipped" : "e.g. 20000"}
                      value={dontKnowFields["inventoryTiedUp"] ? "" : inventoryTiedUp}
                      disabled={dontKnowFields["inventoryTiedUp"]}
                      onChange={(e) => setInventoryTiedUp(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none disabled:opacity-50 min-w-0"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Optional Branding for PDF Report */}
              <motion.div
                variants={itemVariants}
                className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl space-y-2"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Report Branding (Optional for PDF Export)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <input
                    type="text"
                    placeholder="Company Name (e.g. Acme Corp)"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-lg text-xs outline-none focus:border-violet-500 transition-colors w-full min-w-0"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 dark:file:bg-white/10 dark:file:text-white border border-slate-300 dark:border-white/10 rounded-lg p-0.5 bg-white dark:bg-black/30 w-full min-w-0"
                  />
                </div>
              </motion.div>

              {/* Quick Summary Review Card Before Calculation */}
              <motion.div
                variants={itemVariants}
                className="p-3.5 sm:p-4 bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/30 rounded-xl space-y-2"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-violet-900 dark:text-violet-300 block">
                  Diagnostic Summary Review
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-2 text-xs">
                  <div>
                    <span className="text-[10px] sm:text-[10.5px] text-slate-500 block truncate">Location</span>
                    <span className="font-semibold text-slate-900 dark:text-white block truncate">
                      {country === "US" ? "United States" : country === "IN" ? "India" : "International"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[10.5px] text-slate-500 block truncate">Monthly Revenue</span>
                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                      {currentCurrency.symbol}{fmt(parseFloat(revenue) || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[10.5px] text-slate-500 block truncate">Core Costs</span>
                    <span className="font-semibold text-slate-900 dark:text-white block truncate">
                      {currentCurrency.symbol}{fmt(diagnosticResult.coreCosts)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[10.5px] text-slate-500 block truncate">Additional Drains</span>
                    <span className="font-semibold text-slate-900 dark:text-white block truncate">
                      {currentCurrency.symbol}{fmt(diagnosticResult.additionalCosts)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Step 4 Actions with Clean Circle Loader */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col-reverse xs:flex-row justify-between items-center pt-3 border-t border-slate-100 dark:border-white/10 gap-2.5"
              >
                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  onClick={handleBack}
                  disabled={isCalculating}
                  className="w-full xs:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </motion.button>

                <motion.button
                  type="button"
                  id="find-leaks-btn"
                  whileHover={!isCalculating ? { y: -1, transition: { duration: 0.15 } } : undefined}
                  whileTap={!isCalculating ? { y: 0 } : undefined}
                  onClick={handleNext}
                  disabled={isCalculating}
                  className="w-full xs:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isCalculating ? (
                    <>
                      <CircleLoader className="w-4 h-4" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Find My Profit Leaks →
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STEP 5: RESULTS & DIAGNOSTIC REPORT */}
          {/* ============================================================ */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              variants={stepContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4 sm:space-y-6"
            >
              {isCalculating ? (
                <ResultSkeleton />
              ) : (
                <>
                  {/* TOP HEADER CONTROLS */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-1"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
                        Your Profit Leak Diagnostic Report
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Actionable breakdown of where profit is leaking and what to investigate first.
                      </p>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 0 }}
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Adjust Numbers
                    </motion.button>
                  </motion.div>

                  {/* 1. PRIMARY RESULT SUMMARY CARD */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 sm:p-7 md:p-8 shadow-md relative overflow-hidden"
                  >
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-6">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-widest text-violet-400 block mb-1">
                          Your Estimated Profit Leakage
                        </span>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight break-words">
                          {currentCurrency.symbol}
                          <AnimatedCounter
                            value={diagnosticResult.totalMonthlyLeakage}
                            currency={currentCurrency}
                            duration={800}
                          />
                          <span className="text-xs sm:text-sm font-normal text-slate-300 ml-1.5 sm:ml-2">/ month</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span>
                            Annualized Drain:{" "}
                            <strong className="text-white">
                              {currentCurrency.symbol}
                              <AnimatedCounter
                                value={diagnosticResult.totalAnnualLeakage}
                                currency={currentCurrency}
                                duration={850}
                              />
                              /year
                            </strong>
                          </span>
                          <span>•</span>
                          <span className="bg-violet-500/30 text-violet-200 px-2 py-0.5 rounded text-[10px] sm:text-[10.5px] font-bold">
                            <AnimatedPercentage
                              value={diagnosticResult.leakagePercentageOfRevenue}
                              duration={800}
                            />{" "}
                            of Revenue
                          </span>
                        </p>
                      </div>

                      {/* PDF Action Buttons with Clean Circle Loader */}
                      <div className="flex flex-col xs:flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                        <motion.button
                          type="button"
                          whileHover={{ y: -1 }}
                          whileTap={{ y: 0 }}
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
                              <Eye className="w-4 h-4" /> Preview PDF
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ y: -1 }}
                          whileTap={{ y: 0 }}
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
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* 2. SPOTLIGHT: YOUR BIGGEST PROFIT LEAK */}
                  {diagnosticResult.biggestLeak && (
                    <motion.div
                      variants={itemVariants}
                      className="bg-white dark:bg-card border-2 border-violet-500/40 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3.5 sm:space-y-4"
                    >
                      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider bg-violet-600 text-white shadow-xs">
                          <Zap className="w-3.5 h-3.5" /> Your Biggest Profit Leak
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-violet-900 dark:text-violet-300">
                          {currentCurrency.symbol}
                          {fmt(diagnosticResult.biggestLeak.monthlyImpact)}/mo
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {diagnosticResult.biggestLeak.category}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {diagnosticResult.biggestLeak.whatToInvestigate}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                          What To Check First:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                          {diagnosticResult.biggestLeak.actionChecklist.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                              <span className="leading-snug">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {/* 3 THINGS TO INVESTIGATE FIRST */}
                  {diagnosticResult.topLeaks.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3"
                    >
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        3 Things to Investigate First
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                        {diagnosticResult.topLeaks.slice(0, 3).map((leak, idx) => (
                          <motion.div
                            key={leak.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + idx * 0.08, duration: 0.3 }}
                            className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/25 rounded-xl border border-slate-200 dark:border-white/10 space-y-1"
                          >
                            <span className="text-[10px] sm:text-[10.5px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                              Priority 0{idx + 1}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {leak.category}
                            </h4>
                            <p className="text-[10.5px] sm:text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                              {leak.investigationSteps[0] || leak.whyItMatters}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* 3. RANKED TOP PROFIT LEAKS LIST WITH ANIMATED BREAKDOWN BARS */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-violet-600 shrink-0" />
                        Ranked Top Profit Leaks
                      </h3>
                      <span className="text-[11px] sm:text-xs text-slate-500">
                        {diagnosticResult.topLeaks.length} analyzed
                      </span>
                    </div>

                    <div className="space-y-2.5 sm:space-y-3">
                      {diagnosticResult.topLeaks.map((leak, idx) => {
                        const maxLeakVal =
                          diagnosticResult.topLeaks.length > 0
                            ? diagnosticResult.topLeaks[0].monthlyImpact
                            : 1
                        const barPercent = Math.max(
                          6,
                          Math.min(100, (leak.monthlyImpact / maxLeakVal) * 100)
                        )

                        return (
                          <motion.div
                            key={leak.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * idx, duration: 0.25 }}
                            className="p-3 sm:p-3.5 bg-slate-50 dark:bg-black/25 border border-slate-200 dark:border-white/10 rounded-xl space-y-2"
                          >
                            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5">
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    {idx + 1}. {leak.category}
                                  </span>
                                  <span
                                    className={`text-[9px] sm:text-[9.5px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded ${
                                      leak.impactLevel === "HIGH IMPACT"
                                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                                        : leak.impactLevel === "MEDIUM IMPACT"
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                        : "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300"
                                    }`}
                                  >
                                    {leak.impactLevel}
                                  </span>
                                </div>
                                <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                                  {leak.percentageOfRevenue.toFixed(1)}% of revenue • {currentCurrency.symbol}
                                  {fmt(leak.annualImpact)}/year
                                </p>
                              </div>

                              <div className="text-left xs:text-right font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white shrink-0">
                                {currentCurrency.symbol}
                                {fmt(leak.monthlyImpact)}/mo
                              </div>
                            </div>

                            {/* Smooth breakdown bar */}
                            <div className="w-full bg-slate-200/80 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${barPercent}%` }}
                                transition={{
                                  duration: 0.65,
                                  delay: 0.1 + idx * 0.05,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                className={`h-full rounded-full ${
                                  leak.impactLevel === "HIGH IMPACT"
                                    ? "bg-rose-500 dark:bg-rose-400"
                                    : leak.impactLevel === "MEDIUM IMPACT"
                                    ? "bg-amber-500 dark:bg-amber-400"
                                    : "bg-violet-600 dark:bg-violet-400"
                                }`}
                              />
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>

                  {/* 4. CASH-FLOW PRESSURE */}
                  {diagnosticResult.cashFlowPressures.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-blue-600 shrink-0" />
                          Cash-Flow Pressure (Working Capital Trapped)
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-950 dark:text-blue-200">
                          Total: {currentCurrency.symbol}
                          {fmt(diagnosticResult.totalCashFlowPressureAmount)}
                        </span>
                      </div>
                      <p className="text-xs text-blue-900/80 dark:text-blue-300/80 leading-relaxed">
                        <strong>Important distinction:</strong> Outstanding receivables and sitting stock represent liquid cash temporarily locked in operations — not permanently lost profit.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {diagnosticResult.cashFlowPressures.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-white dark:bg-black/30 border border-blue-200/80 dark:border-blue-900/40 rounded-xl"
                          >
                            <div className="flex justify-between items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {item.category}
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white shrink-0">
                                {currentCurrency.symbol}
                                {fmt(item.monthlyImpact)}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug">
                              {item.whyItMatters}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* 5. WHAT IF YOU REDUCE THE BIGGEST LEAK? */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                        What If You Reduce The Biggest Leak?
                      </span>
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                        {selectedReductionPct}% Reduction Scenario
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {[5, 10, 15, 20].map((pct) => (
                        <motion.button
                          key={pct}
                          type="button"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedReductionPct(pct)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                            selectedReductionPct === pct
                              ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                              : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                          }`}
                        >
                          -{pct}%
                        </motion.button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 pt-2 border-t border-slate-100 dark:border-white/10 text-center">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/40 transition-colors">
                        <span className="text-[10px] sm:text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                          Potential Modeled Improvement
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-emerald-900 dark:text-emerald-200">
                          +{currentCurrency.symbol}
                          <AnimatedCounter
                            value={scenarioMonthlySavings}
                            currency={currentCurrency}
                            duration={400}
                          />
                          /mo
                        </span>
                      </div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/40 transition-colors">
                        <span className="text-[10px] sm:text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                          Potential Annual Gain
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-emerald-900 dark:text-emerald-200">
                          +{currentCurrency.symbol}
                          <AnimatedCounter
                            value={scenarioAnnualSavings}
                            currency={currentCurrency}
                            duration={400}
                          />
                          /year
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center">
                      Scenario estimate based on a {selectedReductionPct}% reduction in {diagnosticResult.biggestLeak?.category || "top leak"}. Not guaranteed savings.
                    </p>
                  </motion.div>

                  {/* 6. HOW WE CALCULATED THIS (Safe Scroll Inside Code Block) */}
                  <motion.div
                    variants={itemVariants}
                    className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-card"
                  >
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
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-3.5 sm:p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/10 overflow-x-auto">
                            {diagnosticResult.formulasApplied.map((f, i) => (
                              <div key={i} className="pb-2 border-b border-slate-100 dark:border-white/5 last:border-b-0">
                                <strong className="text-slate-900 dark:text-white">
                                  {f.category}:
                                </strong>{" "}
                                <code className="bg-slate-100 dark:bg-black/40 px-1.5 py-0.5 rounded font-mono text-[10px] sm:text-[10.5px] break-all">
                                  {f.formula}
                                </code>
                                <div className="text-slate-500 mt-0.5 text-[11px]">
                                  Result: {f.result}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* BOTTOM PDF ACTIONS & DISCLAIMER */}
                  <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
                    <motion.button
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 0 }}
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
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 0 }}
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
                    </motion.button>
                  </motion.div>

                  <motion.p
                    variants={itemVariants}
                    className="text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 text-center leading-relaxed pt-2"
                  >
                    These figures are estimates based on the information entered and are intended to identify areas worth investigating. They are not a substitute for accounting records, tax advice, or professional financial advice.
                  </motion.p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
