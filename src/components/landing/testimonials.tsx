import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Freelance Designer, Mumbai",
    avatar: "PS",
    rating: 5,
    content:
      "I was using Zoho Invoice before and it was so complicated. Turnivo is insanely simple. I created my first GST invoice in literally 90 seconds. The WhatsApp sharing feature is a game changer.",
    avatarBg: "bg-violet-600/90 text-white",
  },
  {
    name: "Rajesh Kumar",
    role: "Software Consultant, Bangalore",
    avatar: "RK",
    rating: 5,
    content:
      "The UPI QR code auto-generation is brilliant. My clients can scan and pay directly from the invoice. Payment collection time has dropped from 2 weeks to 2 days on average.",
    avatarBg: "bg-blue-600/90 text-white",
  },
  {
    name: "Anita Patel",
    role: "Boutique Owner, Ahmedabad",
    avatar: "AP",
    rating: 5,
    content:
      "As a small business owner, I was doing invoices in Excel. Turnivo made everything professional overnight. The auto GST calculation alone saves me hours every month.",
    avatarBg: "bg-emerald-600/90 text-white",
  },
  {
    name: "Suresh Nair",
    role: "Architect, Chennai",
    avatar: "SN",
    rating: 5,
    content:
      "The quotation-to-invoice conversion is brilliant. When a client accepts my quote, I click one button and an invoice is ready. Saves so much time on every project.",
    avatarBg: "bg-amber-600/90 text-white",
  },
  {
    name: "Deepika Joshi",
    role: "Marketing Agency, Delhi",
    avatar: "DJ",
    rating: 5,
    content:
      "We manage 50+ clients and Turnivo's client management keeps everything organized. The revenue tracking gives us a clear picture of our finances every month.",
    avatarBg: "bg-fuchsia-600/90 text-white",
  },
  {
    name: "Mohammed Aslam",
    role: "IT Services, Hyderabad",
    avatar: "MA",
    rating: 5,
    content:
      "Better than Vyapar and a fraction of the price (free!). The digital signature feature makes our invoices look incredibly professional to enterprise clients.",
    avatarBg: "bg-teal-600/90 text-white",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-14 sm:py-20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12 sm:mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20">
            Loved By Thousands
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Indian businesses love Turnivo
          </h2>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-white/80 ml-1">
              4.9/5 from 1,200+ reviews
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="
                group relative flex flex-col justify-between rounded-[22px] p-6 sm:p-7
                border border-black/[0.07] bg-white/70
                dark:border-white/[0.08] dark:bg-white/[0.03]
                backdrop-blur-xl
                shadow-[0_1px_2px_0_rgba(23,22,43,0.04)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]
                transition-all duration-200 ease-out
                hover:-translate-y-[3px] hover:bg-white dark:hover:bg-white/[0.06]
                hover:border-violet-300/60 dark:hover:border-white/[0.14]
                hover:shadow-[0_12px_28px_-12px_rgba(124,58,237,0.28)]
                h-full
              "
            >
              <div className="flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-[12px] ${t.avatarBg} flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm`}
                      >
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-[14.5px] leading-tight text-zinc-900 dark:text-white">
                          {t.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-white/45 mt-0.5">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[13.5px] leading-relaxed text-zinc-600 dark:text-white/65 flex-1 pt-1">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
