"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export interface RelatedTool {
  title: string
  description: string
  href: string
}

export function RelatedTools({
  tools,
  isUltra = false,
}: {
  tools: RelatedTool[]
  isUltra?: boolean
}) {
  if (!tools || tools.length === 0) return null

  return (
    <section className="w-full max-w-5xl mx-auto mt-12 pt-8 border-t border-black/[0.06] dark:border-white/[0.06]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">
          Related Tools
        </h2>
      </div>

      <div className="grid grid-cols-1 min-[560px]:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="
              group relative flex flex-col justify-between rounded-[18px] p-4 sm:p-[18px]
              border border-black/[0.07] bg-white/70
              dark:border-white/[0.07] dark:bg-white/[0.03]
              backdrop-blur-xl
              shadow-[0_1px_2px_0_rgba(23,22,43,0.04)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]
              transition-all duration-200 ease-out
              hover:-translate-y-[3px] hover:bg-white dark:hover:bg-white/[0.06]
              hover:border-violet-300/60 dark:hover:border-white/[0.14]
              hover:shadow-[0_12px_28px_-12px_rgba(124,58,237,0.3)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60
              active:scale-[0.98]
              min-h-[105px]
            "
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[14.5px] font-semibold leading-tight text-zinc-900 dark:text-white/90 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                  {tool.title}
                </h3>
                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0 text-zinc-400 dark:text-white/30 transition-all duration-200 group-hover:translate-x-1 group-hover:text-violet-500 dark:group-hover:text-violet-300"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-[13px] leading-snug text-zinc-500 dark:text-white/45 line-clamp-2">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
