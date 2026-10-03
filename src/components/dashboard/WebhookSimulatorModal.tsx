"use client"

import React, { useState, useEffect } from "react"
import { CustomerRecord } from "@/types/recovery"
import { X, Zap, Send, CheckCircle2 } from "lucide-react"

interface WebhookSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  customers: CustomerRecord[]
  onTriggerWebhook: (customerId: string, eventType: string) => void
}

export function WebhookSimulatorModal({
  isOpen,
  onClose,
  customers,
  onTriggerWebhook,
}: WebhookSimulatorModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || "cust_001")
  const [eventType, setEventType] = useState<string>("invoice.payment_failed")
  const [lastResponse, setLastResponse] = useState<Record<string, unknown> | null>(null)
  const [isSending, setIsSending] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0]

  const simulatedPayload = {
    id: `evt_sim_${Date.now()}`,
    object: "event",
    api_version: "2026-04-15",
    created: Math.floor(Date.now() / 1000),
    type: eventType,
    data: {
      object: {
        id: customer.invoiceId,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        amount_due: customer.amount * 100, // cents
        currency: customer.currency.toLowerCase(),
        attempt_count: customer.attemptCount + 1,
        last_payment_error: {
          code: customer.failureCode,
          decline_code: customer.failureCode,
          message: customer.failureReasonHuman,
          payment_method: {
            brand: customer.cardBrand,
            last4: customer.cardLast4,
            exp_month: parseInt(customer.cardExpiry.split("/")[0]),
            exp_year: parseInt(customer.cardExpiry.split("/")[1]),
          },
        },
      },
    },
  }

  const handleSend = async () => {
    setIsSending(true)
    try {
      const res = await fetch("/api/webhooks/payment-failure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: eventType,
          customer_id: customer.id,
          invoice_id: customer.invoiceId,
          amount: customer.amount,
          failure_code: customer.failureCode,
        }),
      })
      const data = await res.json()
      setLastResponse(data)
      onTriggerWebhook(customer.id, eventType)
    } catch (e) {
      setLastResponse({ error: String(e) })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden my-auto transition-colors"
      >
        {/* Pinned Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 px-6 py-4 shrink-0 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0c2340] dark:text-white text-base">Payment Gateway Webhook Simulator</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Trigger real Stripe / Razorpay event payload into the Recovery Decision Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 dark:bg-zinc-900 p-2 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Form Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-zinc-400 font-semibold mb-1">Target Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value)
                  setLastResponse(null)
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-2.5 text-slate-800 dark:text-zinc-200 focus:border-[#0066f5] focus:outline-none cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (${c.amount} — {c.failureCode.replace(/_/g, " ")})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-400 font-semibold mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => {
                  setEventType(e.target.value)
                  setLastResponse(null)
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-2.5 text-slate-800 dark:text-zinc-200 focus:border-[#0066f5] focus:outline-none cursor-pointer"
              >
                <option value="invoice.payment_failed">invoice.payment_failed (Autopay failure)</option>
                <option value="charge.failed">charge.failed (Card decline)</option>
                <option value="customer.subscription.past_due">subscription.past_due (Grace period)</option>
                <option value="invoice.payment_succeeded">invoice.payment_succeeded (Recovery)</option>
              </select>
            </div>
          </div>

          {/* Outgoing Webhook Preview */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mb-1.5 font-mono">
              <span>POST /api/webhooks/payment-failure</span>
              <span className="text-[#0066f5] dark:text-emerald-400 font-semibold">Header: X-Razorpay-Signature</span>
            </div>
            <div className="max-h-36 overflow-y-auto rounded-2xl bg-[#0c2340] dark:bg-zinc-900/80 p-3.5 font-mono text-[11px] text-slate-200 dark:text-zinc-300 border border-slate-700 dark:border-zinc-800/80 shadow-inner">
              <pre>{JSON.stringify(simulatedPayload, null, 2)}</pre>
            </div>
          </div>

          {/* Engine Response Preview */}
          {lastResponse && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 p-3.5 text-xs animate-in fade-in duration-300">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 mb-1.5">
                <CheckCircle2 className="h-4 w-4" /> Decision Engine Processed Successfully
              </div>
              <div className="max-h-40 overflow-y-auto font-mono text-[10px] text-zinc-200 bg-slate-900 dark:bg-black/50 p-2.5 rounded-xl border border-emerald-500/20">
                <pre>{JSON.stringify(lastResponse, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-zinc-800 px-6 py-4 shrink-0 bg-slate-50 dark:bg-zinc-950">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-2 rounded-xl bg-[#0066f5] hover:bg-[#0052cc] px-5 py-2 text-xs font-bold text-white transition shadow-md shadow-[#0066f5]/25 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            {isSending ? "Dispatching..." : "Dispatch Simulated Webhook"}
          </button>
        </div>
      </div>
    </div>
  )
}
