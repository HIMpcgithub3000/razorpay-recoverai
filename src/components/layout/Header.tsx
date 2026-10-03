"use client"

import React from "react"
import {
  PhoneCall,
  ShieldCheck,
  Zap,
  RefreshCw,
  Radio,
  Home,
  Users,
  BarChart3,
  Calculator,
  FileCode2,
  DollarSign,
  Sun,
  Moon,
} from "lucide-react"

export type TabType = "landing" | "studio" | "customers" | "analytics" | "webhooks" | "roi" | "docs"

interface HeaderProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  onOpenWebhookModal: () => void
  onResetData: () => void
  queueCount: number
  currencyMode: "INR" | "USD"
  onToggleCurrency: () => void
  themeMode: "light" | "dark"
  onToggleTheme: () => void
}

export function Header({
  activeTab,
  setActiveTab,
  onOpenWebhookModal,
  onResetData,
  queueCount,
  currencyMode,
  onToggleCurrency,
  themeMode,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#060913]/90 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand: Razorpay Official Signature */}
        <div
          onClick={() => setActiveTab("landing")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Razorpay Electric Bolt Badge */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0066f5] via-[#3395ff] to-[#0c2340] p-0.5 shadow-md shadow-[#0066f5]/20 group-hover:scale-105 transition">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white dark:bg-[#060913]">
              {/* Razorpay Bolt Icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-[#0066f5] dark:fill-[#3395ff]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.5 2L3 13.5h7L8.5 22 21 9.5h-7.5L13.5 2z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#0c2340] dark:text-white">
                Razorpay <span className="text-[#0066f5] dark:text-[#3395ff]">RecoverAI</span>
              </span>
              <span className="rounded-full bg-[#eef6ff] dark:bg-[#3395ff]/15 px-2 py-0.5 text-[9px] font-bold text-[#0066f5] dark:text-[#3395ff] border border-[#cbe4ff] dark:border-[#3395ff]/30">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium hidden sm:block">
              Autonomous AI Voice Recovery for Subscriptions & Autopay
            </p>
          </div>
        </div>

        {/* Navigation Tabs (shadcn style pill) */}
        <nav className="hidden lg:flex items-center gap-1 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/90 p-1 border border-slate-200/80 dark:border-zinc-800/80 text-xs">
          <button
            onClick={() => setActiveTab("landing")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all cursor-pointer ${
              activeTab === "landing"
                ? "bg-white dark:bg-[#3395ff]/15 text-[#0066f5] dark:text-[#3395ff] border border-slate-200 dark:border-[#3395ff]/30 shadow-sm font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            Landing
          </button>

          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all cursor-pointer ${
              activeTab === "studio"
                ? "bg-white dark:bg-[#3395ff]/15 text-[#0066f5] dark:text-[#3395ff] border border-slate-200 dark:border-[#3395ff]/30 shadow-sm font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            <PhoneCall className="h-3.5 w-3.5" />
            Voice Studio
          </button>

          <button
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all cursor-pointer ${
              activeTab === "customers"
                ? "bg-white dark:bg-[#3395ff]/15 text-[#0066f5] dark:text-[#3395ff] border border-slate-200 dark:border-[#3395ff]/30 shadow-sm font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Autopay Queue</span>
            {queueCount > 0 && (
              <span className="rounded-full bg-[#0066f5] dark:bg-[#3395ff] px-1.5 py-0.2 text-[9px] font-bold text-white">
                {queueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-white dark:bg-[#3395ff]/15 text-[#0066f5] dark:text-[#3395ff] border border-slate-200 dark:border-[#3395ff]/30 shadow-sm font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </button>

          <button
            onClick={() => setActiveTab("roi")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all cursor-pointer ${
              activeTab === "roi"
                ? "bg-white dark:bg-[#3395ff]/15 text-[#0066f5] dark:text-[#3395ff] border border-slate-200 dark:border-[#3395ff]/30 shadow-sm font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            ROI Calculator
          </button>

          <button
            onClick={() => setActiveTab("webhooks")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all cursor-pointer ${
              activeTab === "webhooks"
                ? "bg-white dark:bg-[#3395ff]/15 text-[#0066f5] dark:text-[#3395ff] border border-slate-200 dark:border-[#3395ff]/30 shadow-sm font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Webhooks
          </button>

          <button
            onClick={() => setActiveTab("docs")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all cursor-pointer ${
              activeTab === "docs"
                ? "bg-white dark:bg-[#3395ff]/15 text-[#0066f5] dark:text-[#3395ff] border border-slate-200 dark:border-[#3395ff]/30 shadow-sm font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5" />
            API & Docs
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-[#0066f5] dark:hover:border-[#3395ff]/40 transition cursor-pointer"
            title={`Switch to ${themeMode === "light" ? "Dark" : "Light"} Theme`}
          >
            {themeMode === "light" ? (
              <Moon className="h-4 w-4 text-[#0c2340]" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {/* Currency Toggle */}
          <button
            onClick={onToggleCurrency}
            className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/90 px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-700 dark:text-zinc-300 hover:border-[#0066f5] dark:hover:border-[#3395ff]/40 transition cursor-pointer"
            title="Toggle Currency (INR / USD)"
          >
            <span className="text-[#0066f5] dark:text-[#3395ff]">
              {currencyMode === "INR" ? "₹ INR" : "$ USD"}
            </span>
          </button>

          {/* Webhook trigger modal */}
          <button
            onClick={onOpenWebhookModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#0066f5] hover:bg-[#0052cc] text-white px-3 py-1.5 text-xs font-bold transition shadow-md shadow-[#0066f5]/20 active:scale-95 cursor-pointer"
            title="Simulate Razorpay payment failure event"
          >
            <Zap className="h-3.5 w-3.5 text-white" />
            <span className="hidden sm:inline">Simulate Webhook</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onResetData}
            className="flex items-center justify-center h-8 w-8 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Reset customer dataset"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-200 dark:border-zinc-800/60 bg-slate-50 dark:bg-zinc-950/70 gap-1 text-xs">
        <button
          onClick={() => setActiveTab("landing")}
          className={`px-3 py-1 rounded-lg shrink-0 cursor-pointer ${
            activeTab === "landing"
              ? "bg-[#0066f5]/15 dark:bg-[#3395ff]/20 text-[#0066f5] dark:text-[#3395ff] font-bold"
              : "text-slate-600 dark:text-zinc-400"
          }`}
        >
          Landing
        </button>
        <button
          onClick={() => setActiveTab("studio")}
          className={`px-3 py-1 rounded-lg shrink-0 cursor-pointer ${
            activeTab === "studio"
              ? "bg-[#0066f5]/15 dark:bg-[#3395ff]/20 text-[#0066f5] dark:text-[#3395ff] font-bold"
              : "text-slate-600 dark:text-zinc-400"
          }`}
        >
          Studio
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-3 py-1 rounded-lg shrink-0 cursor-pointer ${
            activeTab === "customers"
              ? "bg-[#0066f5]/15 dark:bg-[#3395ff]/20 text-[#0066f5] dark:text-[#3395ff] font-bold"
              : "text-slate-600 dark:text-zinc-400"
          }`}
        >
          Queue ({queueCount})
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-3 py-1 rounded-lg shrink-0 cursor-pointer ${
            activeTab === "analytics"
              ? "bg-[#0066f5]/15 dark:bg-[#3395ff]/20 text-[#0066f5] dark:text-[#3395ff] font-bold"
              : "text-slate-600 dark:text-zinc-400"
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("roi")}
          className={`px-3 py-1 rounded-lg shrink-0 cursor-pointer ${
            activeTab === "roi"
              ? "bg-[#0066f5]/15 dark:bg-[#3395ff]/20 text-[#0066f5] dark:text-[#3395ff] font-bold"
              : "text-slate-600 dark:text-zinc-400"
          }`}
        >
          ROI
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`px-3 py-1 rounded-lg shrink-0 cursor-pointer ${
            activeTab === "webhooks"
              ? "bg-[#0066f5]/15 dark:bg-[#3395ff]/20 text-[#0066f5] dark:text-[#3395ff] font-bold"
              : "text-slate-600 dark:text-zinc-400"
          }`}
        >
          Webhooks
        </button>
        <button
          onClick={() => setActiveTab("docs")}
          className={`px-3 py-1 rounded-lg shrink-0 cursor-pointer ${
            activeTab === "docs"
              ? "bg-[#0066f5]/15 dark:bg-[#3395ff]/20 text-[#0066f5] dark:text-[#3395ff] font-bold"
              : "text-slate-600 dark:text-zinc-400"
          }`}
        >
          Docs
        </button>
      </div>
    </header>
  )
}
