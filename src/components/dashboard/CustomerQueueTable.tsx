"use client"

import React, { useState } from "react"
import { CustomerRecord, CustomerRecoveryStatus } from "@/types/recovery"
import {
  PhoneCall,
  Send,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  UserX,
  Search,
  CreditCard,
  QrCode,
  Building2,
  Globe2,
} from "lucide-react"

interface CustomerQueueTableProps {
  customers: CustomerRecord[]
  selectedCustomerId: string
  onSelectCustomer: (id: string) => void
  onCallCustomer: (id: string) => void
  onTriggerFailure: (id: string) => void
  onTriggerSuccess: (id: string) => void
  currencyMode?: "INR" | "USD"
}

export function CustomerQueueTable({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onCallCustomer,
  onTriggerFailure,
  onTriggerSuccess,
  currencyMode = "INR",
}: CustomerQueueTableProps) {
  const [regionFilter, setRegionFilter] = useState<"all" | "IN" | "US">("all")
  const [filter, setFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const inCount = customers.filter((c) => c.region === "IN").length
  const usCount = customers.filter((c) => c.region === "US").length

  const formatPrice = (c: CustomerRecord) => {
    if (c.currency === "INR" || c.region === "IN") {
      const val = c.inrAmount || c.amount
      return `₹${Math.round(val).toLocaleString("en-IN")}`
    } else {
      return `$${c.amount.toFixed(2)}`
    }
  }

  const formatLtv = (c: CustomerRecord) => {
    if (c.currency === "INR" || c.region === "IN") {
      const val = c.lifetimeValue
      return `₹${Math.round(val).toLocaleString("en-IN")}`
    } else {
      return `$${c.lifetimeValue.toFixed(2)}`
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const matchesRegion =
      regionFilter === "all" ? true : c.region === regionFilter

    const matchesFilter =
      filter === "all"
        ? true
        : filter === "queued"
        ? c.status === "queued_for_call" || c.status === "failed_pending"
        : filter === "recovered"
        ? c.status === "recovered"
        : filter === "scheduled"
        ? c.status === "retry_scheduled"
        : filter === "escalated"
        ? c.status === "escalated"
        : true

    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.failureCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.bankName && c.bankName.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesRegion && matchesFilter && matchesSearch
  })

  const getStatusBadge = (status: CustomerRecoveryStatus) => {
    switch (status) {
      case "recovered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Recovered
          </span>
        )
      case "queued_for_call":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#eef6ff] dark:bg-[#3395ff]/15 px-2.5 py-0.5 text-xs font-semibold text-[#0066f5] dark:text-[#3395ff] border border-[#cbe4ff] dark:border-[#3395ff]/30">
            <PhoneCall className="h-3 w-3" /> Queued for AI
          </span>
        )
      case "retry_scheduled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <Clock className="h-3 w-3" /> Retry Scheduled
          </span>
        )
      case "escalated":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            <AlertTriangle className="h-3 w-3" /> Escalated
          </span>
        )
      case "calling":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 animate-pulse">
            <PhoneCall className="h-3 w-3" /> Calling Live...
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            Pending Action
          </span>
        )
    }
  }

  const getRailBadge = (c: CustomerRecord) => {
    switch (c.paymentRail) {
      case "upi_autopay":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
            <QrCode className="h-3 w-3" /> UPI Autopay
          </span>
        )
      case "nach":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
            e-NACH Mandate
          </span>
        )
      case "card_emandate":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
            Card e-Mandate
          </span>
        )
      case "ach_debit":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
            ACH Direct Debit
          </span>
        )
      case "stripe_billing":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20">
            Stripe Recurring
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
            <CreditCard className="h-3 w-3" /> {c.cardBrand.toUpperCase()} •••• {c.cardLast4}
          </span>
        )
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
      {/* Top Regional Market Segmentation Tabs */}
      <div className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-[#0066f5] dark:text-[#3395ff]" />
          <span className="text-xs font-bold text-[#0c2340] dark:text-white uppercase tracking-wider">
            Autopay Market Segment:
          </span>
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-200/80 dark:bg-zinc-900 p-1 border border-slate-300 dark:border-zinc-800">
            <button
              onClick={() => setRegionFilter("all")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                regionFilter === "all"
                  ? "bg-white dark:bg-[#3395ff]/20 text-[#0066f5] dark:text-[#3395ff] shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🌐 All Customers ({customers.length})
            </button>
            <button
              onClick={() => setRegionFilter("IN")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                regionFilter === "IN"
                  ? "bg-white dark:bg-[#3395ff]/20 text-[#0066f5] dark:text-[#3395ff] shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🇮🇳 India Domestic ({inCount} • INR / UPI)
            </button>
            <button
              onClick={() => setRegionFilter("US")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                regionFilter === "US"
                  ? "bg-white dark:bg-[#3395ff]/20 text-[#0066f5] dark:text-[#3395ff] shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🇺🇸 United States ({usCount} • USD / ACH)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <span>Active Queue: <strong className="text-[#0066f5] dark:text-[#3395ff]">{filteredCustomers.length}</strong> accounts</span>
        </div>
      </div>

      {/* Table Header Controls */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#0c2340] dark:text-white">
              {regionFilter === "IN"
                ? "🇮🇳 Indian Autopay Recovery Dossiers"
                : regionFilter === "US"
                ? "🇺🇸 US Enterprise Subscription Accounts"
                : "Consolidated Global Autopay Recovery Queue"}
            </h2>
            <span className="rounded-md bg-[#eef6ff] dark:bg-[#3395ff]/10 px-2 py-0.5 text-[10px] font-bold text-[#0066f5] dark:text-[#3395ff] border border-[#cbe4ff] dark:border-[#3395ff]/20">
              {regionFilter === "IN" ? "UPI • e-NACH • RuPay" : regionFilter === "US" ? "Stripe • ACH • Visa" : "Multi-Rail Autopay"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {regionFilter === "IN"
              ? "Configured with Indian banking mandates, HDFC/ICICI/SBI CBS codes, and Hindi/English recovery scripts."
              : regionFilter === "US"
              ? "Configured with US clearing house ACH debit, SVB/Chase corporate risk limits, and USD recovery workflows."
              : "Realistic enterprise accounts across India and US markets with gender & regional voice script adaptation."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search subscribers, bank, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 pl-8 pr-3 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#0066f5] dark:focus:border-[#3395ff] focus:outline-none w-48 sm:w-60"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-950 p-1 border border-slate-200 dark:border-zinc-800">
            {["all", "queued", "recovered", "scheduled", "escalated"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-2.5 py-1 text-xs capitalize transition cursor-pointer ${
                  filter === tab
                    ? "bg-white dark:bg-[#3395ff]/20 text-[#0066f5] dark:text-[#3395ff] font-semibold shadow-sm border border-slate-200 dark:border-[#3395ff]/30"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
          <thead className="border-b border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-950/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold">
            <tr>
              <th className="py-3.5 pl-6 pr-3">Subscriber & Bank</th>
              <th className="px-3 py-3.5">Plan & Amount</th>
              <th className="px-3 py-3.5">Decline Category</th>
              <th className="px-3 py-3.5">Payment Rail</th>
              <th className="px-3 py-3.5 text-center">Recovery Odds</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {filteredCustomers.map((c) => {
              const isSelected = c.id === selectedCustomerId
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelectCustomer(c.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#eef6ff] dark:bg-[#3395ff]/10 hover:bg-[#e4f0ff] dark:hover:bg-[#3395ff]/15"
                      : "hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  {/* Customer Info */}
                  <td className="py-4 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-zinc-700 shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 text-xs">
                          {c.region === "IN" ? "🇮🇳" : "🇺🇸"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#0c2340] dark:text-white text-sm">{c.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                            ({c.customerGender === "female" ? "Female" : "Male"})
                          </span>
                        </div>
                        <div className="text-slate-500 dark:text-zinc-400 text-[11px] font-medium">{c.company}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {c.bankName && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-zinc-700">
                              <Building2 className="h-2.5 w-2.5 text-blue-500" /> {c.bankName}
                            </span>
                          )}
                          <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-mono">{c.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Plan & Amount */}
                  <td className="px-3 py-4">
                    <div className="font-black text-[#0c2340] dark:text-white text-sm font-mono">
                      {formatPrice(c)}
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">/mo</span>
                    </div>
                    <div className="text-slate-500 dark:text-zinc-400 text-[11px]">{c.subscriptionPlan}</div>
                    <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-mono">
                      LTV: {formatLtv(c)}
                    </div>
                  </td>

                  {/* Failure Reason */}
                  <td className="px-3 py-4 max-w-xs">
                    <span className="rounded-md bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 capitalize">
                      {c.failureCode.replace(/_/g, " ")}
                    </span>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1" title={c.failureReasonHuman}>
                      {c.failureReasonHuman}
                    </p>
                  </td>

                  {/* Payment Rail */}
                  <td className="px-3 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      {getRailBadge(c)}
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                        {c.cardBrand.toUpperCase()} • Exp: {c.cardExpiry}
                      </div>
                    </div>
                  </td>

                  {/* Recovery Odds */}
                  <td className="px-3 py-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                        {c.recoveryProbability}%
                      </span>
                      <div className="h-1.5 w-16 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden mt-1">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${c.recoveryProbability}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-4">{getStatusBadge(c.status)}</td>

                  {/* Actions */}
                  <td className="py-4 pl-3 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onCallCustomer(c.id)}
                        className="flex items-center gap-1 rounded-lg bg-[#eef6ff] dark:bg-[#3395ff]/15 px-2.5 py-1.5 text-[11px] font-bold text-[#0066f5] dark:text-[#3395ff] hover:bg-[#0066f5] hover:text-white transition shadow-sm border border-[#cbe4ff] dark:border-[#3395ff]/30 cursor-pointer"
                        title="Start live interactive AI voice call"
                      >
                        <PhoneCall className="h-3 w-3" />
                        Call
                      </button>

                      <button
                        onClick={() => onTriggerFailure(c.id)}
                        className="rounded-lg bg-slate-100 dark:bg-zinc-800 p-1.5 text-slate-500 dark:text-zinc-400 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                        title="Simulate payment failure webhook"
                      >
                        <Zap className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => onTriggerSuccess(c.id)}
                        className="rounded-lg bg-slate-100 dark:bg-zinc-800 p-1.5 text-slate-500 dark:text-zinc-400 hover:text-emerald-500 hover:bg-slate-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                        title="Simulate payment success webhook"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
