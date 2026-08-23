"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface StarsBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  pointerEvents?: boolean;
}

export function StarsBackground({
  children,
  className,
  pointerEvents = true,
  ...props
}: StarsBackgroundProps) {
  return (
    <div
      data-slot="stars-background"
      className={cn(
        "relative w-full min-h-screen bg-[#F8FAFC] dark:bg-[#030014] text-foreground transition-colors duration-200",
        className
      )}
      {...props}
    >
      {/* Dark mode subtle ambient starfield gradient (Zero-compositing overhead, hardware accelerated) */}
      <div 
        className="pointer-events-none absolute inset-0 hidden dark:block opacity-40 bg-[radial-gradient(#8B5CF6_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" 
        aria-hidden="true"
      />
      
      {/* Foreground content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
