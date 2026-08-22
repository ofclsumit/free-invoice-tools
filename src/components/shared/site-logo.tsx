import Link from "next/link"
import { cn } from "@/lib/utils"

interface SiteLogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  size?: "sm" | "md" | "lg"
  href?: string
  showIcon?: boolean
}

export function SiteLogo({
  className = "",
  iconClassName = "",
  textClassName = "",
  size = "md",
  href = "/",
  showIcon = true,
}: SiteLogoProps) {
  const sizeConfig = {
    sm: {
      icon: "w-7 h-7",
      img: "w-7 h-7",
      text: "text-[1.05rem]",
      gap: "gap-2",
    },
    md: {
      icon: "w-8 h-8",
      img: "w-8 h-8",
      text: "text-[1.2rem]",
      gap: "gap-2.5",
    },
    lg: {
      icon: "w-9 h-9",
      img: "w-9 h-9",
      text: "text-[1.35rem]",
      gap: "gap-3",
    },
  }[size]

  const content = (
    <>
      {showIcon && (
        <div
          className={cn(
            "flex items-center justify-center rounded-lg overflow-hidden shrink-0 transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(192,132,252,0.45)] group-hover:scale-[1.02]",
            sizeConfig.icon,
            iconClassName
          )}
        >
          <img
            src="/logo.png"
            alt="TURNIVO"
            width={32}
            height={32}
            className={cn("object-cover", sizeConfig.img)}
          />
        </div>
      )}
      <span
        className={cn(
          "brand-wordmark brand-wordmark-theme select-none transition-all duration-300",
          sizeConfig.text,
          textClassName
        )}
      >
        TURNIVO
      </span>
    </>
  )

  if (!href) {
    return (
      <div
        className={cn(
          "inline-flex items-center group leading-none",
          sizeConfig.gap,
          className
        )}
      >
        {content}
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center group leading-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:opacity-95",
        sizeConfig.gap,
        className
      )}
      aria-label="TURNIVO Home"
    >
      {content}
    </Link>
  )
}
