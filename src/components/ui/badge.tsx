import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "razorpay" | "success" | "warning"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default:
      "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700",
    secondary:
      "bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-800",
    destructive:
      "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
    outline:
      "border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 bg-white dark:bg-transparent",
    razorpay:
      "bg-[#eef6ff] dark:bg-[#3395ff]/15 text-[#0066f5] dark:text-[#3395ff] border-[#cbe4ff] dark:border-[#3395ff]/35 shadow-none dark:shadow-[0_0_12px_rgba(51,149,255,0.2)] font-semibold",
    success:
      "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 font-semibold",
    warning:
      "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 font-semibold",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
