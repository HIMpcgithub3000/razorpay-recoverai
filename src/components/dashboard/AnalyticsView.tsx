"use client"

import React from "react"
import { CustomerRecord, RecoveryMetrics } from "@/types/recovery"
import { BarChart3, TrendingUp, CheckCircle, ShieldAlert, Sparkles, PieChart } from "lucide-react"

interface AnalyticsViewProps {
  customers: CustomerRecord[]
  metrics: RecoveryMetrics
}

export function AnalyticsView({ customers, metrics }: AnalyticsViewProps) {
  // Aggregate failure reasons
  const failureCounts: Record<string, { count: number; amount: number; recovered: number }> = {}

  customers.forEach((c) => {
    const key = c.failureCode.replace(/_/g, " ")
    if (!failureCounts[key]) {
      failureCounts[key] = { count: 0, amount: 0, recovered: 0 }
    }
    failureCounts[key].count += 1
    failureCounts[key].amount += c.amount
    if (c.status === "recovered") {
      failureCounts[key].recovered += c.amount
    }
  })

  return (
    <div className="space-y-6 transition-colors">
      {/* Top Banner KPI Header */}
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-gradient-to-r dark:from-zinc-900/90 dark:via-emerald-950/20 dark:to-zinc-950 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#0066f5] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="h-4 w-4" /> Revenue Retention Performance
            </div>
            <h2 className="text-2xl font-black text-[#0c2340] dark:text-white tracking-tight">
              ${metrics.totalRecoveredAmount.toFixed(2)} Recovered from Involuntary Churn
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
              Real-time recovery conversion tracking across 10 distinct banking decline categories. Razorpay RecoverAI converts high-friction payment failures into renewed ARR.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 text-center">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-semibold">Conversion Rate</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{metrics.recoveryRatePercent}%</span>
            </div>
            <div className="rounded-2xl border border-blue-200 dark:border-cyan-500/30 bg-blue-50/70 dark:bg-cyan-950/40 p-3.5 text-center">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-semibold">Annualized Saved ARR</span>
              <span className="text-xl font-black text-[#0066f5] dark:text-cyan-400">
                ${(metrics.totalRecoveredAmount * 12).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Failure Reason Analysis + Conversion Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Breakdown by Failure Code (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#0066f5] dark:text-emerald-400" />
              <h3 className="font-bold text-[#0c2340] dark:text-white text-sm">
                Autopay Failure Breakdown & Recovery Potential
              </h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">10 Scenarios</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(failureCounts).map(([reason, data]) => {
              const recoveryRatio = data.amount > 0 ? (data.recovered / data.amount) * 100 : 0
              return (
                <div key={reason} className="rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-950/50 p-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-zinc-200 capitalize mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#0066f5] dark:bg-emerald-400" />
                      {reason}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-zinc-400 font-medium">
                      ${data.recovered.toFixed(0)} / ${data.amount.toFixed(0)} (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{Math.round(recoveryRatio)}%</span>)
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0066f5] to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(recoveryRatio, 8)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recovery Funnel & Tool Impact (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Recovery Funnel */}
          <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl flex-1">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
              <PieChart className="h-4 w-4 text-[#0066f5] dark:text-cyan-400" />
              <h3 className="font-bold text-[#0c2340] dark:text-white text-sm">Automated Recovery Funnel</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-zinc-950/70 p-3 border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">1. Failed Webhooks Ingested</span>
                <span className="font-bold text-[#0c2340] dark:text-white">{customers.length} (100%)</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-zinc-950/70 p-3 border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">2. Recovery Decision Evaluated</span>
                <span className="font-bold text-[#0066f5] dark:text-emerald-400">{customers.length} (100%)</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-zinc-950/70 p-3 border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">3. Autonomous AI Voice Calls Triggered</span>
                <span className="font-bold text-[#0066f5] dark:text-cyan-400">
                  {customers.filter((c) => c.status !== "failed_pending").length} accounts
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-zinc-950/70 p-3 border border-slate-200 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">4. Recovery Tool Invoked</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {customers.filter((c) => c.status === "recovered" || c.status === "retry_scheduled").length} actions
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 border border-emerald-200 dark:border-emerald-500/30">
                <span className="text-emerald-800 dark:text-emerald-300 font-bold">5. Autopay Successfully Saved</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {metrics.totalCustomersRecovered} subscribers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
