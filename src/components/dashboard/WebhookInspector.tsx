"use client"

import React, { useState } from "react"
import { WebhookEventLog } from "@/types/recovery"
import { ShieldCheck, Copy, Check, Clock, Radio } from "lucide-react"

interface WebhookInspectorProps {
  webhooks: WebhookEventLog[]
  onOpenTriggerModal: () => void
}

export function WebhookInspector({ webhooks, onOpenTriggerModal }: WebhookInspectorProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<WebhookEventLog | null>(webhooks[0] || null)

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-200 dark:border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0066f5] dark:text-emerald-400" />
            <h2 className="text-base font-bold text-[#0c2340] dark:text-white">Event-Driven Webhook Inspector</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Audit trail of real-time Stripe/Razorpay payment events, AI decision payloads, and voice tool executions
          </p>
        </div>

        <button
          onClick={onOpenTriggerModal}
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition border border-slate-300 dark:border-zinc-700/60 shadow-sm cursor-pointer"
        >
          <Radio className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          Dispatch New Test Webhook
        </button>
      </div>

      {webhooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-zinc-500 text-xs">
          <Clock className="h-8 w-8 text-slate-300 dark:text-zinc-700 mb-2" />
          <p className="font-semibold text-slate-600 dark:text-zinc-400">No webhooks recorded yet.</p>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 max-w-sm">
            Click "Dispatch New Test Webhook" or simulate a failure event in the Customer Queue to inspect incoming payloads.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
          {/* Left: List of Webhooks (5 cols) */}
          <div className="lg:col-span-5 max-h-[500px] overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
            {webhooks.map((log) => {
              const isSelected = selectedLog?.id === log.id
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-4 cursor-pointer transition ${
                    isSelected
                      ? "bg-[#eef6ff] dark:bg-emerald-950/20 border-l-2 border-[#0066f5] dark:border-emerald-500"
                      : "hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-slate-400 dark:text-zinc-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                        log.source === "stripe"
                          ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-transparent"
                          : log.source === "razorpay"
                          ? "bg-[#eef6ff] dark:bg-blue-500/20 text-[#0066f5] dark:text-blue-300 border border-[#cbe4ff] dark:border-transparent"
                          : "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-transparent"
                      }`}
                    >
                      {log.source}
                    </span>
                  </div>

                  <div className="font-mono font-bold text-slate-800 dark:text-zinc-200 text-xs">
                    {log.eventType}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Target: <span className="text-[#0c2340] dark:text-white font-semibold">{log.customerName}</span> ({log.customerId})
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Selected Webhook JSON Details (7 cols) */}
          <div className="lg:col-span-7 p-5 bg-slate-50/50 dark:bg-zinc-950/70">
            {selectedLog ? (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 text-xs mb-3">
                  <div>
                    <span className="font-bold text-[#0c2340] dark:text-white block">{selectedLog.eventType}</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                      Event ID: {selectedLog.id}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedLog.id, JSON.stringify(selectedLog.payload, null, 2))}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs text-slate-700 dark:text-zinc-300 hover:text-[#0066f5] dark:hover:text-white transition cursor-pointer"
                  >
                    {copiedId === selectedLog.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy JSON
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-700 dark:border-zinc-800 bg-[#0c2340] dark:bg-black/80 p-4 font-mono text-xs text-slate-200 dark:text-zinc-300 overflow-x-auto max-h-[380px] shadow-sm">
                  <pre>{JSON.stringify(selectedLog.payload, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400 dark:text-zinc-500">
                Select a webhook event on the left to inspect payload
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
