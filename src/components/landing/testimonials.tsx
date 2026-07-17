import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Freelance Designer, Mumbai",
    avatar: "PS",
    rating: 5,
    content: "I was using Zoho Invoice before and it was so complicated. QuoteFlow is insanely simple. I created my first GST invoice in literally 90 seconds. The WhatsApp sharing feature is a game changer.",
    color: "bg-violet-600",
  },
  {
    name: "Rajesh Kumar",
    role: "Software Consultant, Bangalore",
    avatar: "RK",
    rating: 5,
    content: "The UPI QR code auto-generation is brilliant. My clients can scan and pay directly from the invoice. Payment collection time has dropped from 2 weeks to 2 days on average.",
    color: "bg-blue-600",
  },
  {
    name: "Anita Patel",
    role: "Boutique Owner, Ahmedabad",
    avatar: "AP",
    rating: 5,
    content: "As a small business owner, I was doing invoices in Excel. QuoteFlow made everything professional overnight. The auto GST calculation alone saves me hours every month.",
    color: "bg-emerald-600",
  },
  {
    name: "Suresh Nair",
    role: "Architect, Chennai",
    avatar: "SN",
    rating: 5,
    content: "The quotation-to-invoice conversion is brilliant. When a client accepts my quote, I click one button and an invoice is ready. Saves so much time on every project.",
    color: "bg-orange-600",
  },
  {
    name: "Deepika Joshi",
    role: "Marketing Agency, Delhi",
    avatar: "DJ",
    rating: 5,
    content: "We manage 50+ clients and QuoteFlow's client management keeps everything organized. The revenue tracking gives us a clear picture of our finances every month.",
    color: "bg-pink-600",
  },
  {
    name: "Mohammed Aslam",
    role: "IT Services, Hyderabad",
    avatar: "MA",
    rating: 5,
    content: "Better than Vyapar and a fraction of the price (free!). The digital signature feature makes our invoices look incredibly professional to enterprise clients.",
    color: "bg-teal-600",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">
            Loved by thousands
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Indian businesses love QuoteFlow
          </h2>
          <div className="flex items-center justify-center gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-sm font-semibold">4.9/5 from 1,200+ reviews</span>
          </div>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="break-inside-avoid glass-card-liquid"
            >
              <div className="glass-filter" />
              <div className="glass-overlay" />
              <div className="glass-specular" />
              <div className="glass-content p-6 space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full ${t.color} flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{t.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
