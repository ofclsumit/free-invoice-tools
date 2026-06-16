import {
  Zap,
  FileText,
  Download,
  MessageCircle,
  QrCode,
  ArrowRightLeft,
  PenLine,
  Users,
  BarChart3,
  Globe,
  Shield,
  Smartphone,
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "GST-Ready Invoices",
    description: "Auto-calculate CGST, SGST, IGST based on customer location. Full GST compliance built in.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: FileText,
    title: "Professional Quotations",
    description: "Create beautiful quotations with custom terms. Convert to invoice in one click when accepted.",
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: Download,
    title: "Instant PDF Download",
    description: "Download pixel-perfect PDFs instantly. No server processing, no waiting. Works offline too.",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Sharing",
    description: "Share invoices on WhatsApp with pre-filled messages. Your clients get it in seconds.",
    color: "from-green-500 to-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  {
    icon: QrCode,
    title: "Auto UPI QR Code",
    description: "Enter your UPI ID and a payment QR code is automatically embedded in every invoice.",
    color: "from-orange-500 to-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    icon: ArrowRightLeft,
    title: "Quote → Invoice in 1 Click",
    description: "Convert accepted quotations to invoices instantly. All details carry over automatically.",
    color: "from-teal-500 to-teal-600",
    bg: "bg-teal-50 dark:bg-teal-950/30",
  },
  {
    icon: PenLine,
    title: "Digital Signature",
    description: "Draw or upload your signature. Automatically added to every document you create.",
    color: "from-pink-500 to-pink-600",
    bg: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Save client details for reuse. See complete invoice and payment history per client.",
    color: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    icon: BarChart3,
    title: "Revenue Analytics",
    description: "Track paid, pending, and overdue invoices. Get clear revenue summaries at a glance.",
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
  },
  {
    icon: Globe,
    title: "Public Shareable Link",
    description: "Share a beautiful online version of your invoice. Clients can view and download from any device.",
    color: "from-amber-500 to-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Your data is encrypted and stored securely. We never share your financial data with third parties.",
    color: "from-slate-500 to-slate-600",
    bg: "bg-slate-50 dark:bg-slate-950/30",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Create invoices on the go from your phone. Responsive design that works beautifully on all screens.",
    color: "from-rose-500 to-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-widest uppercase">
            Everything you need
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight">
            Built for Indian businesses
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, send, and track invoices — with full GST compliance. 
            No accounting degree required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-border p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg} mb-4`}>
                  <div className={`bg-gradient-to-br ${feature.color} rounded-lg p-1.5`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="font-display font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
