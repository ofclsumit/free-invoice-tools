import Link from "next/link"

export function SiteLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 font-display font-bold text-xl hover:opacity-90 transition-opacity ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shrink-0">
        <img src="/logo.png" alt="Turnivo Logo" className="w-8 h-8 object-cover" />
      </div>
      <span className="text-[#c084fc]">
        {"\uD835\uDE1B\uD835\uDE1C\uD835\uDE19\uD835\uDE15\uD835\uDE10\uD835\uDE1D\uD835\uDE16"}
      </span>
    </Link>
  )
}
