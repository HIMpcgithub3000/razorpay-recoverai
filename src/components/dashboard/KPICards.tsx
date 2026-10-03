"use client"

import React from "react"
import { RecoveryMetrics } from "@/types/recovery"
import { DollarSign, CheckCircle2, PhoneCall, CalendarClock, UserCheck } from "lucide-react"

interface KPICardsProps {
  metrics: RecoveryMetrics
  currencyMode?: "INR" | "USD"
}

export function KPICards({ metrics, currencyMode = "INR" }: KPICardsProps) {
  const formatMoney = (amountUSD: number) => {
    if (currencyMode === "INR") {
      const inrAmount = amountUSD * 85
      if (inrAmount >= 10000000) {
        return `₹${(inrAmount / 10000000).toFixed(2)} Cr`
      }
      if (inrAmount >= 100000) {
        return `₹${(inrAmount / 100000).toFixed(2)} Lakh`
      }
      return `₹${Math.round(inrAmount).toLocaleString("en-IN")}`
    } else {
      return `$${amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {/* Total Failed At Risk */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-4 shadow-sm dark:shadow-md transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Failed Autopay MRR</span>
          <div className="rounded-lg bg-rose-50 dark:bg-rose-500/10 p-1.5 text-rose-600 dark:text-rose-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black tracking-tight text-[#0c2340] dark:text-white font-mono">
            {formatMoney(metrics.totalFailedAmount)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
            <span className="font-semibold text-rose-600 dark:text-rose-400">{metrics.totalCustomersFailed}</span> accounts at risk
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-rose-500/0 via-rose-500/40 to-rose-500/0" />
      </div>

      {/* Recovered Revenue */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-sm dark:shadow-lg dark:shadow-emerald-500/5 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Recovered Revenue</span>
          <div className="rounded-lg bg-emerald-100 dark:bg-emerald-500/20 p-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black tracking-tight text-emerald-700 dark:text-emerald-400 font-mono">
            {formatMoney(metrics.totalRecoveredAmount)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">{metrics.totalCustomersRecovered}</span> autopay saved
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
      </div>

      {/* Recovery Conversion Rate */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-4 shadow-sm dark:shadow-md transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Recovery Win Rate</span>
          <div className="rounded-lg bg-[#eef6ff] dark:bg-[#3395ff]/15 p-1.5 text-[#0066f5] dark:text-[#3395ff]">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black tracking-tight text-[#0066f5] dark:text-[#3395ff] font-mono">
            {metrics.recoveryRatePercent}%
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
            Industry email benchmark: <span className="text-slate-700 dark:text-zinc-400 font-semibold">12%</span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#0066f5]/0 via-[#0066f5]/40 to-[#0066f5]/0" />
      </div>

      {/* Active Calling Queue */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-4 shadow-sm dark:shadow-md transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">AI Calling Queue</span>
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 p-1.5 text-indigo-600 dark:text-indigo-400">
            <PhoneCall className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black tracking-tight text-indigo-700 dark:text-indigo-300 font-mono">
            {metrics.activeQueueCount}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
            Decision engine prioritized
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" />
      </div>

      {/* Retries & Escalations */}
      <div className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-4 shadow-sm dark:shadow-md transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Scheduled / Escalated</span>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
            <CalendarClock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-amber-600 dark:text-amber-300 font-mono">
              {metrics.scheduledRetriesCount}
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500">retry</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-300 font-mono">
              {metrics.escalationsCount}
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500">esc</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
            Zero dropped accounts
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-amber-500/0" />
      </div>
    </div>
  )
}
