"use client"

import React, { useState } from "react"
import {
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  Percent,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface RoiCalculatorViewProps {
  onLaunchStudio: () => void
  currencyMode: "INR" | "USD"
}

export function RoiCalculatorView({ onLaunchStudio, currencyMode }: RoiCalculatorViewProps) {
  const [subscribersCount, setSubscribersCount] = useState(12500)
  const [arpuMonthly, setArpuMonthly] = useState(currencyMode === "INR" ? 1499 : 49)
  const [monthlyDeclineRate, setMonthlyDeclineRate] = useState(8.5)
  const [voiceRecoveryRate, setVoiceRecoveryRate] = useState(74.0)

  // Calculations
  const monthlyRecurringRevenue = subscribersCount * arpuMonthly
  const monthlyFailedRevenue = (monthlyRecurringRevenue * monthlyDeclineRate) / 100
  const standardDunningRecovery = (monthlyFailedRevenue * 12.0) / 100 // standard 12% email dunning
  const recoverAiRecovery = (monthlyFailedRevenue * voiceRecoveryRate) / 100
  const netLiftMonthly = recoverAiRecovery - standardDunningRecovery
  const annualSavedArr = netLiftMonthly * 12

  const formatMoney = (val: number) => {
    if (currencyMode === "INR") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`
      return `₹${Math.round(val).toLocaleString("en-IN")}`
    } else {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
      if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
      return `$${Math.round(val).toLocaleString("en-US")}`
    }
  }

  return (
    <div className="space-y-8 py-4 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="razorpay">Autopay Financial Modeling</Badge>
            <span className="text-xs text-slate-500 dark:text-zinc-500 font-mono">Dynamic ROI Estimator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0c2340] dark:text-white mt-1">
            Involuntary Churn & Recovery Calculator
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Simulate the impact of autonomous AI voice recovery versus passive email dunning.
          </p>
        </div>

        <Button variant="razorpay" onClick={onLaunchStudio} className="self-start sm:self-auto">
          <span>Test in Voice Studio</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Inputs & Sliders (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-[#0c2340] dark:text-zinc-200">
                1. Active Subscriptions & Pricing
              </CardTitle>
              <CardDescription>
                Configure your current customer subscriber base and monthly average revenue per user (ARPU).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700 dark:text-zinc-300">Active Paid Subscribers</span>
                  <span className="font-mono font-bold text-[#0066f5] dark:text-[#3395ff]">
                    {subscribersCount.toLocaleString()} subscribers
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={subscribersCount}
                  onChange={(e) => setSubscribersCount(Number(e.target.value))}
                  className="w-full accent-[#0066f5] dark:accent-[#3395ff] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-1">
                  <span>500</span>
                  <span>50,000</span>
                  <span>100,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700 dark:text-zinc-300">Monthly Plan Price / ARPU</span>
                  <span className="font-mono font-bold text-[#0066f5] dark:text-[#3395ff]">{formatMoney(arpuMonthly)}/mo</span>
                </div>
                <input
                  type="range"
                  min={currencyMode === "INR" ? 199 : 5}
                  max={currencyMode === "INR" ? 25000 : 500}
                  step={currencyMode === "INR" ? 100 : 5}
                  value={arpuMonthly}
                  onChange={(e) => setArpuMonthly(Number(e.target.value))}
                  className="w-full accent-[#0066f5] dark:accent-[#3395ff] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-1">
                  <span>{currencyMode === "INR" ? "₹199" : "$5"}</span>
                  <span>{currencyMode === "INR" ? "₹12,500" : "$250"}</span>
                  <span>{currencyMode === "INR" ? "₹25,000" : "$500"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-[#0c2340] dark:text-zinc-200">
                2. Autopay Performance & Recovery Benchmarks
              </CardTitle>
              <CardDescription>
                Compare standard baseline dunning against Razorpay RecoverAI voice agent performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700 dark:text-zinc-300">Monthly Autopay Decline Rate</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{monthlyDeclineRate}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="0.5"
                  value={monthlyDeclineRate}
                  onChange={(e) => setMonthlyDeclineRate(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-1">
                  <span>2% (Low churn)</span>
                  <span>8.5% (Indian average)</span>
                  <span>20% (High risk)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-700 dark:text-zinc-300">RecoverAI Voice Recovery Target</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{voiceRecoveryRate}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="1"
                  value={voiceRecoveryRate}
                  onChange={(e) => setVoiceRecoveryRate(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-1">
                  <span>50%</span>
                  <span>74% (Median)</span>
                  <span>90% (Optimized)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Detailed Financial Output (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-[#0066f5]/40 bg-gradient-to-tr from-[#0c2340] via-slate-900 to-[#02042b] p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3395ff]">
                Financial Impact Summary
              </span>
              <Badge variant="success">Net Revenue Lift</Badge>
            </div>

            <div className="mt-6 space-y-6">
              {/* Highlight Saved ARR */}
              <div>
                <span className="text-xs text-slate-300 block">Total Annualized ARR Recovered</span>
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight mt-1 font-mono">
                  {formatMoney(annualSavedArr)}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Additional revenue secured that otherwise cancels silently.
                </span>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-4 border-y border-slate-700/80 py-4">
                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10">
                  <span className="text-[11px] text-slate-300 block">Passive Email Dunning (12%)</span>
                  <span className="text-lg font-bold text-slate-200 font-mono mt-0.5 block">
                    {formatMoney(standardDunningRecovery)}/mo
                  </span>
                  <span className="text-[10px] text-slate-400">Industry standard conversion</span>
                </div>

                <div className="rounded-2xl bg-[#0066f5]/20 p-3.5 border border-[#3395ff]/40">
                  <span className="text-[11px] text-[#3395ff] font-bold block">
                    Razorpay RecoverAI ({voiceRecoveryRate}%)
                  </span>
                  <span className="text-lg font-bold text-white font-mono mt-0.5 block">
                    {formatMoney(recoverAiRecovery)}/mo
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    +{formatMoney(netLiftMonthly)}/mo incremental lift
                  </span>
                </div>
              </div>

              {/* Key Autopay Metrics list */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 text-slate-300 border-b border-slate-700/50">
                  <span>Gross Monthly Autopay Volume:</span>
                  <span className="font-mono font-semibold">{formatMoney(monthlyRecurringRevenue)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300 border-b border-slate-700/50">
                  <span>Total Recurring Revenue At Risk:</span>
                  <span className="font-mono font-semibold text-rose-400">
                    {formatMoney(monthlyFailedRevenue)}/mo
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Subscribers Retained Monthly:</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    ~{Math.round((subscribersCount * monthlyDeclineRate * voiceRecoveryRate) / 10000)} customers
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="glow" size="lg" onClick={onLaunchStudio} className="w-full">
                  Activate Voice Recovery on Razorpay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
