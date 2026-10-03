import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "razorpay" | "glow"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer"

    const variants = {
      default:
        "bg-slate-900 text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-900/30",
      outline:
        "border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white shadow-sm",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 shadow-sm",
      ghost:
        "hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white",
      link: "text-[#0066f5] dark:text-[#3395ff] underline-offset-4 hover:underline",
      razorpay:
        "bg-[#0066f5] hover:bg-[#0052cc] text-white shadow-md shadow-[#0066f5]/25 border border-[#3395ff]/30 font-semibold",
      glow: "bg-gradient-to-r from-[#0066f5] via-[#3395ff] to-[#0c2340] text-white shadow-[0_4px_20px_rgba(0,102,245,0.25)] hover:shadow-[0_6px_28px_rgba(0,102,245,0.4)] border border-[#3395ff]/40 font-semibold",
    }

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-[11px]",
      lg: "h-11 rounded-xl px-6 text-sm",
      icon: "h-9 w-9",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
