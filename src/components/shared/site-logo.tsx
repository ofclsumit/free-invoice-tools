import Link from "next/link"

export function SiteLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 font-display font-bold text-xl hover:opacity-90 transition-opacity ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-glow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
      <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
        QuoteFlow
      </span>
    </Link>
  )
}
