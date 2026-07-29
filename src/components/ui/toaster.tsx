"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-2.5 items-start">
              {/* Liquid Glass Decorative Indicator Dot */}
              <span className={cn(
                "h-2 w-2 rounded-full shrink-0 mt-1.5 shadow-sm animate-pulse",
                variant === "destructive" 
                  ? "bg-red-500 shadow-red-500/50" 
                  : "bg-[#c084fc] shadow-purple-500/50"
              )} />
              <div className="grid gap-0.5">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
