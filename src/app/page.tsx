"use client"

import React, { useState, useEffect } from "react"
import { useRecoveryStore } from "@/lib/store/recovery-store"
import { Header, TabType } from "@/components/layout/Header"
import { KPICards } from "@/components/dashboard/KPICards"
import { LiveCallStudio } from "@/components/dashboard/LiveCallStudio"
import { CustomerQueueTable } from "@/components/dashboard/CustomerQueueTable"
import { AnalyticsView } from "@/components/dashboard/AnalyticsView"
import { WebhookInspector } from "@/components/dashboard/WebhookInspector"
import { WebhookSimulatorModal } from "@/components/dashboard/WebhookSimulatorModal"
import { LandingPageView } from "@/components/landing/LandingPageView"
import { RoiCalculatorView } from "@/components/dashboard/RoiCalculatorView"
import { ApiDocsView } from "@/components/dashboard/ApiDocsView"
import { ShieldCheck, PhoneCall, ArrowRight, Zap, CheckCircle2 } from "lucide-react"

export default function RecoverAIPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("landing")
  const [currencyMode, setCurrencyMode] = useState<"INR" | "USD">("INR")
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light")
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync theme with HTML root class
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (themeMode === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [themeMode])

  const {
    customers,
    selectedCustomer,
    setSelectedCustomerId,
    webhooks,
    metrics,
    updateCustomer,
    triggerPaymentFailureWebhook,
    triggerPaymentSucceededWebhook,
    lastExecutedTool,
    executeToolCall,
    resetDemoData,
  } = useRecoveryStore()

  const handleStartCall = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setActiveTab("studio")
  }

  const toggleCurrency = () => {
    setCurrencyMode((prev) => (prev === "INR" ? "USD" : "INR"))
  }

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"))
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060913] flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-[#0066f5] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div
      className={`relative min-h-screen antialiased overflow-x-hidden transition-colors duration-200 ${
        themeMode === "dark"
          ? "dark bg-[#060913] text-zinc-100 selection:bg-[#3395ff]/30 selection:text-blue-200"
          : "bg-[#f8fafc] text-slate-800 selection:bg-[#0066f5]/20 selection:text-blue-900"
      }`}
    >
      {/* Dynamic Background */}
      {themeMode === "dark" ? (
        /* Dark Theme: Enlarged Siri Wave Background */
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen scale-150 sm:scale-[1.85] transition-all duration-1000"
            style={{
              backgroundImage: `url('/siri-wave-bg.png')`,
              backgroundPosition: "center 38%",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060913]/90 via-[#060913]/40 to-[#060913]/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#060913]/50 to-[#060913]" />
        </div>
      ) : (
        /* Light Theme: Razorpay Official Clean Aesthetic with delicate blue ambient gradients */
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Soft top-right and center blue radial glows */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-full max-w-7xl rounded-full bg-gradient-to-b from-[#0066f5]/8 via-[#3395ff]/5 to-transparent blur-3xl" />
          <div className="absolute top-[40%] right-[-10%] h-[400px] w-[500px] rounded-full bg-blue-100/50 blur-3xl" />
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        </div>
      )}

      {/* Content Container (Layered on top of background) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
          onResetData={resetDemoData}
          queueCount={metrics.activeQueueCount}
          currencyMode={currencyMode}
          onToggleCurrency={toggleCurrency}
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
        />

        {/* Main Content Body */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-8">
          {/* Executive KPI Cards Bar - visible across Dashboard tabs */}
          {activeTab !== "landing" && (
            <KPICards metrics={metrics} currencyMode={currencyMode} />
          )}

          {/* Tab 0: Public High-Conversion Landing Page */}
          {activeTab === "landing" && (
            <LandingPageView
              onLaunchStudio={() => setActiveTab("studio")}
              onOpenCustomers={() => setActiveTab("customers")}
              onOpenAnalytics={() => setActiveTab("analytics")}
              onOpenWebhooks={() => setActiveTab("webhooks")}
              onOpenSimulator={() => setIsWebhookModalOpen(true)}
              currencyMode={currencyMode}
              onToggleCurrency={toggleCurrency}
            />
          )}

          {/* Tab 1: Live Voice Recovery Studio (Featuring WebGL SiriWave & Dynamic AI Reasoning) */}
          {activeTab === "studio" && (
            <div className="space-y-6">
              <LiveCallStudio
                customer={selectedCustomer}
                allCustomers={customers}
                onSelectCustomer={(id) => setSelectedCustomerId(id)}
                onExecuteTool={executeToolCall}
                onUpdateCustomer={updateCustomer}
                lastToolResult={lastExecutedTool}
              />

              {/* Quick Customer Switcher Queue below Studio */}
              <CustomerQueueTable
                customers={customers}
                selectedCustomerId={selectedCustomer.id}
                onSelectCustomer={(id) => setSelectedCustomerId(id)}
                onCallCustomer={handleStartCall}
                onTriggerFailure={triggerPaymentFailureWebhook}
                onTriggerSuccess={triggerPaymentSucceededWebhook}
                currencyMode={currencyMode}
              />
            </div>
          )}

          {/* Tab 2: 10 Fictional Customer Autopay Queue */}
          {activeTab === "customers" && (
            <CustomerQueueTable
              customers={customers}
              selectedCustomerId={selectedCustomer.id}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
              onCallCustomer={handleStartCall}
              onTriggerFailure={triggerPaymentFailureWebhook}
              onTriggerSuccess={triggerPaymentSucceededWebhook}
              currencyMode={currencyMode}
            />
          )}

          {/* Tab 3: Analytics & Retention Conversion */}
          {activeTab === "analytics" && (
            <AnalyticsView customers={customers} metrics={metrics} />
          )}

          {/* Tab 4: Interactive ROI Calculator */}
          {activeTab === "roi" && (
            <RoiCalculatorView
              onLaunchStudio={() => setActiveTab("studio")}
              currencyMode={currencyMode}
            />
          )}

          {/* Tab 5: Raw Webhook Event Inspector */}
          {activeTab === "webhooks" && (
            <WebhookInspector
              webhooks={webhooks}
              onOpenTriggerModal={() => setIsWebhookModalOpen(true)}
            />
          )}

          {/* Tab 6: Integration & API Docs */}
          {activeTab === "docs" && (
            <ApiDocsView onOpenSimulator={() => setIsWebhookModalOpen(true)} />
          )}
        </main>

        {/* Global Razorpay Enterprise Footer */}
        <footer className="mt-16 border-t border-slate-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#060913]/90 backdrop-blur-md py-8 text-xs text-slate-500 dark:text-zinc-400 transition-colors">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Razorpay Bolt */}
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#eef6ff] dark:bg-[#3395ff]/15">
                <Zap className="h-3.5 w-3.5 text-[#0066f5] dark:text-[#3395ff]" />
              </div>
              <span className="font-bold text-[#0c2340] dark:text-white">Razorpay RecoverAI</span>
              <span className="text-slate-300 dark:text-zinc-600">|</span>
              <span>Autonomous Failed Autopay Recovery Engine</span>
            </div>

            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                RBI & NPCI Compliant
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0066f5] dark:text-[#3395ff]" />
                Zero Sensitive Credentials Asked
              </span>
              <button
                onClick={() => setActiveTab("docs")}
                className="text-[#0066f5] dark:text-[#3395ff] hover:underline cursor-pointer"
              >
                API Docs
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Webhook Simulation Trigger Modal */}
      <WebhookSimulatorModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        customers={customers}
        onTriggerWebhook={(custId, evt) => {
          if (evt === "invoice.payment_succeeded") {
            triggerPaymentSucceededWebhook(custId)
          } else {
            triggerPaymentFailureWebhook(custId)
          }
          setIsWebhookModalOpen(false)
        }}
      />
    </div>
  )
}
