"use client"

import React, { useState } from "react"
import {
  PhoneCall,
  Zap,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Sparkles,
  BarChart3,
  Lock,
  Headphones,
  Sliders,
  DollarSign,
  Radio,
  FileCode2,
  ChevronRight,
  Send,
  Building2,
  RefreshCw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface LandingPageViewProps {
  onLaunchStudio: () => void
  onOpenCustomers: () => void
  onOpenAnalytics: () => void
  onOpenWebhooks: () => void
  onOpenSimulator: () => void
  currencyMode: "INR" | "USD"
  onToggleCurrency: () => void
}

export function LandingPageView({
  onLaunchStudio,
  onOpenCustomers,
  onOpenAnalytics,
  onOpenWebhooks,
  onOpenSimulator,
  currencyMode,
  onToggleCurrency,
}: LandingPageViewProps) {
  // ROI Calculator interactive state
  const [monthlyVolumeINR, setMonthlyVolumeINR] = useState(5000000) // 50 Lakhs INR default
  const failureRatePercent = 8.5 // avg autopay failure rate in India
  const recoveryRatePercent = 74.2 // RecoverAI avg recovery

  const failedRevenueINR = (monthlyVolumeINR * failureRatePercent) / 100
  const recoveredMonthlyINR = (failedRevenueINR * recoveryRatePercent) / 100
  const recoveredAnnualINR = recoveredMonthlyINR * 12
  const estimatedRoiMultiple = (recoveredMonthlyINR / 12000).toFixed(1)

  const formatCurrency = (amount: number) => {
    if (currencyMode === "INR") {
      if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`
      }
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)} Lakh`
      }
      return `₹${Math.round(amount).toLocaleString("en-IN")}`
    } else {
      const usdAmount = amount / 85
      if (usdAmount >= 1000000) {
        return `$${(usdAmount / 1000000).toFixed(2)}M`
      }
      if (usdAmount >= 1000) {
        return `$${(usdAmount / 1000).toFixed(1)}K`
      }
      return `$${Math.round(usdAmount).toLocaleString("en-US")}`
    }
  }

  return (
    <div className="space-y-24 py-4 text-slate-800 dark:text-zinc-100 transition-colors duration-200">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-12 text-center lg:text-left">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 h-[500px] w-full max-w-6xl rounded-full bg-gradient-to-tr from-[#0066f5]/15 via-[#3395ff]/10 to-transparent blur-3xl" />

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Hero Left Content (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2">
              <Badge variant="razorpay" className="py-1 px-3 text-xs tracking-wide">
                <span className="flex h-2 w-2 rounded-full bg-[#0066f5] dark:bg-[#3395ff] animate-ping" />
                Razorpay Autopay AI Suite 2026
              </Badge>
              <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-zinc-400 font-mono">
                100% RBI & NPCI Compliant
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-black tracking-tight text-[#0c2340] dark:text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Never lose a subscriber to a{" "}
              <span className="bg-gradient-to-r from-[#0066f5] via-[#2563eb] to-[#0284c7] dark:from-[#3395ff] dark:via-[#60a5fa] dark:to-cyan-400 bg-clip-text text-transparent">
                failed autopay
              </span>{" "}
              again.
            </h1>

            {/* Subheading */}
            <p className="max-w-2xl text-base text-slate-600 dark:text-zinc-300 sm:text-lg leading-relaxed">
              RecoverAI autonomously calls your customers within seconds of a failed recurring payment on{" "}
              <strong className="text-[#0c2340] dark:text-white font-semibold">Razorpay Subscriptions & UPI Autopay</strong>.
              Powered by real-time conversational voice AI, intelligent salary-cycle retries, and instant 1-click WhatsApp payment links.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 justify-center lg:justify-start">
              <Button
                variant="razorpay"
                size="lg"
                onClick={onLaunchStudio}
                className="group flex items-center gap-2 shadow-xl shadow-[#0066f5]/25"
              >
                <PhoneCall className="h-4 w-4 group-hover:scale-110 transition" />
                <span>Launch Live Voice Studio</span>
                <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onOpenSimulator}
                className="border-slate-300 dark:border-zinc-700 hover:border-[#0066f5] dark:hover:border-[#3395ff]/50 hover:bg-[#0066f5]/5 dark:hover:bg-[#3395ff]/10"
              >
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Simulate Webhook</span>
              </Button>

              <button
                onClick={onToggleCurrency}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3 py-2 text-xs font-mono text-slate-700 dark:text-zinc-400 hover:text-[#0066f5] dark:hover:text-zinc-200 transition cursor-pointer"
                title="Toggle currency display"
              >
                <span>Currency:</span>
                <span className="font-bold text-[#0066f5] dark:text-[#3395ff]">{currencyMode}</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800/80 grid grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <div className="text-2xl font-black text-[#0c2340] dark:text-white tracking-tight">74.2%</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400">Autopay Recovery Rate</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#0066f5] dark:text-[#3395ff] tracking-tight">&lt; 90 sec</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400">First Contact Speed</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">Zero</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400">OTP / CVV Asked (Safe)</div>
              </div>
            </div>
          </div>

          {/* Hero Right Widget (5 cols): Interactive Voice Agent Mockup */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-3xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-gradient-to-b dark:from-[#0c2340]/40 dark:via-zinc-950/80 dark:to-black p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-2xl backdrop-blur-2xl">
              {/* Top Bar of widget */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                    Live Call Simulation
                  </span>
                </div>
                <span className="rounded-md bg-[#eef6ff] dark:bg-[#3395ff]/10 px-2 py-0.5 text-[10px] font-bold text-[#0066f5] dark:text-[#3395ff] border border-[#cbe4ff] dark:border-[#3395ff]/20">
                  Razorpay Subscriptions
                </span>
              </div>

              {/* Customer Avatar & Decline Info */}
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 p-3 border border-slate-200 dark:border-zinc-800">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Aarav Mehta"
                  className="h-10 w-10 rounded-xl object-cover border border-slate-300 dark:border-zinc-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0c2340] dark:text-white truncate">Aarav Mehta</span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {currencyMode === "INR" ? "₹16,900" : "$199"}/mo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">HDFC UPI Autopay • Insufficient Funds</p>
                </div>
              </div>

              {/* Simulated Live Audio Soundwave */}
              <div className="my-5 flex items-center justify-center gap-1.5 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-950/90 border border-slate-200 dark:border-zinc-800/80 p-2">
                {[40, 65, 85, 45, 95, 75, 30, 90, 60, 100, 70, 50, 80, 60, 40].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-gradient-to-t from-[#0066f5] to-cyan-500 animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 120}ms`,
                      animationDuration: "1.2s",
                    }}
                  />
                ))}
              </div>

              {/* Chat snippet */}
              <div className="space-y-2.5 text-xs">
                <div className="rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-zinc-900 p-3 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                  <span className="text-[10px] font-bold text-[#0066f5] dark:text-[#3395ff] block mb-0.5">
                    Riley (Razorpay Recovery AI)
                  </span>
                  "Hello Aarav, your FinTech Pro subscription renewal had an autopay decline. Would you like us to schedule a retry after your salary credit on the 7th?"
                </div>

                <div className="rounded-2xl rounded-tr-sm bg-[#0066f5] dark:bg-[#3395ff] p-3 text-white ml-auto max-w-[90%] shadow-sm">
                  <span className="text-[10px] font-bold text-blue-100 block mb-0.5">Aarav Mehta</span>
                  "Yes please, retry on the 7th at 10 AM, that would be perfect!"
                </div>

                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 p-2 text-center text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                  ⚡ Autonomous Action Executed: Payment Retry Scheduled for Oct 7th
                </div>
              </div>

              {/* Action Button inside mockup */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Zero human agent needed</span>
                <Button size="sm" variant="razorpay" onClick={onLaunchStudio}>
                  Test Studio Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY LEADING BUSINESSES LOGO BAR */}
      <section className="border-y border-slate-200 dark:border-zinc-800/80 py-8 bg-slate-50/70 dark:bg-zinc-950/40">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Engineered for High-Growth Indian & Global Subscriptions on Razorpay
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-80 hover:opacity-100 transition-all duration-300">
            <span className="text-sm font-bold tracking-tight text-slate-700 dark:text-white flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#0066f5] dark:text-[#3395ff]" /> Swiggy Super
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-700 dark:text-white flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#0066f5] dark:text-[#3395ff]" /> Zomato Gold
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-700 dark:text-white flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#0066f5] dark:text-[#3395ff]" /> Urban Company Plus
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-700 dark:text-white flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#0066f5] dark:text-[#3395ff]" /> Nykaa Pro
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-700 dark:text-white flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#0066f5] dark:text-[#3395ff]" /> Zerodha Varsity
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-700 dark:text-white flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#0066f5] dark:text-[#3395ff]" /> Cult.fit Pass
            </span>
          </div>
        </div>
      </section>

      {/* INTERACTIVE ROI & REVENUE CALCULATOR */}
      <section className="relative rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-gradient-to-b dark:from-[#0c2340]/25 dark:via-zinc-900/60 dark:to-zinc-950 p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:shadow-2xl backdrop-blur-xl">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <Badge variant="razorpay" className="mb-3">
            Interactive Revenue Calculator
          </Badge>
          <h2 className="text-2xl font-black tracking-tight text-[#0c2340] dark:text-white sm:text-3xl">
            Calculate your lost recurring revenue recovered
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            See how much ARR you rescue by replacing passive dunning emails with Razorpay RecoverAI autonomous voice agents.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Slider Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-700 dark:text-zinc-300 font-semibold">
                  Monthly Recurring Autopay Volume
                </span>
                <span className="font-mono font-bold text-xl text-[#0066f5] dark:text-[#3395ff]">
                  {formatCurrency(monthlyVolumeINR)}
                </span>
              </div>
              <input
                type="range"
                min="500000"
                max="50000000"
                step="500000"
                value={monthlyVolumeINR}
                onChange={(e) => setMonthlyVolumeINR(Number(e.target.value))}
                className="w-full accent-[#0066f5] dark:accent-[#3395ff] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-500 font-mono mt-1">
                <span>{currencyMode === "INR" ? "₹5 Lakhs" : "$6K"}</span>
                <span>{currencyMode === "INR" ? "₹2.5 Crore" : "$300K"}</span>
                <span>{currencyMode === "INR" ? "₹5 Crore" : "$600K"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 p-4">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">
                  Average Autopay Decline Rate
                </span>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">{failureRatePercent}%</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-1">Indian UPI & Card industry avg</span>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 p-4">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">
                  RecoverAI Voice Success
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{recoveryRatePercent}%</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-1">Voice call & retry conversion</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Dunning emails typically convert at 8-12%. Razorpay RecoverAI voice calls achieve over 70% recovery by reaching the customer directly on their mobile phone within minutes of a decline.
            </p>
          </div>

          {/* Output Display Card (6 cols) */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-[#0066f5]/40 bg-gradient-to-tr from-[#0c2340] to-[#02042b] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
              <div className="absolute right-0 top-0 h-40 w-40 bg-[#0066f5]/20 rounded-full blur-2xl pointer-events-none" />

              <span className="text-xs font-bold uppercase tracking-wider text-[#3395ff] block mb-2">
                Estimated Recovery Yield
              </span>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-300">Monthly Recovered Autopay</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
                    {formatCurrency(recoveredMonthlyINR)}
                    <span className="text-xs font-normal text-slate-400 ml-1">/ month</span>
                  </div>
                </div>

                <div className="border-t border-slate-700/80 pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-300">Annualized ARR Saved</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono">
                      {formatCurrency(recoveredAnnualINR)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-300">Estimated ROI</div>
                    <div className="text-xl font-bold text-[#3395ff] font-mono">
                      {estimatedRoiMultiple}x Return
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="glow"
                    size="lg"
                    onClick={onLaunchStudio}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <span>Deploy Razorpay RecoverAI</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID: SHADCN STYLE FEATURE MATRIX */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="razorpay" className="mb-2">
            Enterprise Architecture
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-[#0c2340] dark:text-white sm:text-4xl">
            Everything needed to eliminate involuntary churn
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            A comprehensive, automated recovery ecosystem built directly on top of the Razorpay Payments & Subscriptions infrastructure.
          </p>
        </div>

        {/* 6-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {/* Card 1 */}
          <Card className="hover:border-[#0066f5] dark:hover:border-[#3395ff]/40 transition group">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-[#eef6ff] dark:bg-[#3395ff]/15 flex items-center justify-center text-[#0066f5] dark:text-[#3395ff] mb-2 group-hover:scale-110 transition">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <CardTitle>Autonomous Telephony Engine</CardTitle>
              <CardDescription>
                Zero latency outbound phone dialing powered by Vapi carrier bridges. Riley, your AI billing specialist, calls with full dossier context.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 2 */}
          <Card className="hover:border-emerald-500 dark:hover:border-emerald-500/40 transition group">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition">
                <Zap className="h-5 w-5" />
              </div>
              <CardTitle>UPI Autopay & e-Mandate Intelligence</CardTitle>
              <CardDescription>
                Understands bank decline reasons across Indian banks (HDFC, ICICI, SBI) including mandate limit exceeded and technical server timeouts.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 3 */}
          <Card className="hover:border-cyan-500 dark:hover:border-cyan-500/40 transition group">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-2 group-hover:scale-110 transition">
                <Send className="h-5 w-5" />
              </div>
              <CardTitle>Instant WhatsApp & SMS Payment Links</CardTitle>
              <CardDescription>
                When a card is expired or replaced, Riley generates a pre-filled 1-click Razorpay payment link sent to WhatsApp while on the call.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 4 */}
          <Card className="hover:border-amber-500 dark:hover:border-amber-500/40 transition group">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-110 transition">
                <Calendar className="h-5 w-5" />
              </div>
              <CardTitle>Salary-Cycle Smart Retry Engine</CardTitle>
              <CardDescription>
                Aligns payment retries with corporate Indian salary credit cycles (1st, 5th, or 7th) or custom dates specified by the customer.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 5 */}
          <Card className="hover:border-purple-500 dark:hover:border-purple-500/40 transition group">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle>100% RBI Compliant & Anti-Phishing</CardTitle>
              <CardDescription>
                Hardened prompt safety guards ensure the voice agent never requests sensitive details such as PINs, OTPs, CVVs, or banking passwords.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 6 */}
          <Card className="hover:border-rose-500 dark:hover:border-rose-500/40 transition group">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2 group-hover:scale-110 transition">
                <Headphones className="h-5 w-5" />
              </div>
              <CardTitle>Warm Human Retention Escalation</CardTitle>
              <CardDescription>
                Detects dissatisfied enterprise customers, price objections, or complex disputes and bridges them to your retention desk with live call transcript.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS: 5-STEP RECOVERY JOURNEY */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="razorpay" className="mb-2">
            The 5-Step Autonomous Pipeline
          </Badge>
          <h2 className="text-3xl font-black tracking-tight text-[#0c2340] dark:text-white sm:text-4xl">
            How RecoverAI saves your revenue in seconds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: "01",
              title: "Payment Decline",
              desc: "Razorpay emits 'payment.failed' or 'subscription.charged' failed event.",
              icon: Zap,
              color: "text-rose-500 dark:text-rose-400",
            },
            {
              step: "02",
              title: "Decision Engine",
              desc: "LTV, tenure, and failure reason are analyzed to calculate recovery odds.",
              icon: BarChart3,
              color: "text-amber-500 dark:text-amber-400",
            },
            {
              step: "03",
              title: "Autonomous Call",
              desc: "AI voice agent dials customer, addresses them warmly by name and plan.",
              icon: PhoneCall,
              color: "text-[#0066f5] dark:text-[#3395ff]",
            },
            {
              step: "04",
              title: "Action Execution",
              desc: "Schedules salary retry, sends WhatsApp link, or extends grace period.",
              icon: CheckCircle2,
              color: "text-cyan-600 dark:text-cyan-400",
            },
            {
              step: "05",
              title: "Settlement Confirmed",
              desc: "Autopay succeeds, customer account remains active with 0 downtime.",
              icon: TrendingUp,
              color: "text-emerald-600 dark:text-emerald-400",
            },
          ].map((item, idx) => {
            const IconComp = item.icon
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-sm dark:shadow-none backdrop-blur-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-zinc-500">
                    STEP {item.step}
                  </span>
                  <IconComp className={`h-4 w-4 ${item.color}`} />
                </div>
                <h4 className="text-sm font-bold text-[#0c2340] dark:text-white">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* DEVELOPER / RAZORPAY WEBHOOK INTEGRATION */}
      <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <Badge variant="razorpay">Plug & Play Integration</Badge>
            <h3 className="text-2xl font-black text-[#0c2340] dark:text-white">
              5-minute setup with Razorpay Webhooks
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Point your Razorpay Dashboard webhook endpoint to{" "}
              <code className="text-[#0066f5] dark:text-[#3395ff] font-bold">/api/webhooks/payment-failure</code>.
              RecoverAI instantly ingests all payment failure webhooks and orchestrates autonomous calls.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={onOpenWebhooks}>
                <FileCode2 className="h-3.5 w-3.5 text-[#0066f5] dark:text-[#3395ff]" />
                Inspect Webhook Payloads
              </Button>
              <Button variant="razorpay" size="sm" onClick={onOpenSimulator}>
                Test Trigger
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-700 bg-[#0c2340] p-4 font-mono text-xs text-zinc-300 overflow-x-auto shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700 text-[11px] text-zinc-400">
                <span>Webhook Payload: payment.failed</span>
                <span className="text-[#3395ff] font-bold">X-Razorpay-Signature: Valid</span>
              </div>
              <pre className="pt-3 text-[11px] leading-relaxed text-zinc-200">
{`{
  "entity": "event",
  "event": "payment.failed",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_O7d4x912bQz",
        "amount": 1690000,
        "currency": "INR",
        "method": "upi",
        "vpa": "aarav.mehta@okhdfcbank",
        "error_code": "BAD_REQUEST_ERROR",
        "error_description": "Payment failed: Insufficient funds in customer bank account"
      }
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="relative overflow-hidden rounded-3xl border border-[#0066f5]/40 bg-gradient-to-r from-[#0c2340] via-slate-900 to-black p-8 sm:p-12 text-center shadow-2xl text-white">
        <div className="max-w-2xl mx-auto space-y-4">
          <Badge variant="razorpay">Ready for Production</Badge>
          <h2 className="text-3xl font-black text-white sm:text-4xl tracking-tight">
            Stop losing 9% of your MRR to involuntary churn
          </h2>
          <p className="text-sm text-slate-300">
            Launch your autonomous voice recovery agent in seconds. Test the live interactive studio with real voice input now.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button variant="glow" size="lg" onClick={onLaunchStudio}>
              <PhoneCall className="h-4 w-4 mr-2" />
              Launch Voice Recovery Studio
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onOpenCustomers}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              View 10 Customer Queue
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
