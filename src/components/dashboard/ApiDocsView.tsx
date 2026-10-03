"use client"

import React, { useState } from "react"
import {
  FileCode2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Terminal,
  Server,
  KeyRound,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export function ApiDocsView({ onOpenSimulator }: { onOpenSimulator: () => void }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const webhookSignatureSnippet = `const crypto = require('crypto');

function verifyRazorpayWebhook(rawBody, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
}`

  const curlTestWebhook = `curl -X POST http://localhost:3000/api/webhooks/payment-failure \\
  -H "Content-Type: application/json" \\
  -H "X-Razorpay-Signature: 75d3c8c72cfda9a7b..." \\
  -d '{
    "entity": "event",
    "event": "payment.failed",
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
  }'`

  return (
    <div className="space-y-8 py-4 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="razorpay">Developer & Integration Docs</Badge>
            <span className="text-xs text-slate-500 dark:text-zinc-500 font-mono">v2.4 API Reference</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0c2340] dark:text-white mt-1">
            Razorpay Webhook & Voice Telephony APIs
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Connect your live Razorpay Dashboard webhooks and Vapi carrier bridges in minutes.
          </p>
        </div>

        <Button variant="razorpay" onClick={onOpenSimulator}>
          <Zap className="h-3.5 w-3.5 mr-1" />
          Test Live Webhook Simulator
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Webhook Events & Signatures */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Webhook Endpoints */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#0c2340] dark:text-zinc-200">
                  1. Razorpay Webhook Endpoint
                </CardTitle>
                <Badge variant="outline">POST</Badge>
              </div>
              <CardDescription>
                Configure this URL in your Razorpay Dashboard under Settings → Webhooks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-zinc-950 p-3 border border-slate-200 dark:border-zinc-800 font-mono text-xs">
                <span className="text-[#0066f5] dark:text-emerald-400 font-bold">/api/webhooks/payment-failure</span>
                <button
                  onClick={() => copyToClipboard("/api/webhooks/payment-failure", "endpoint")}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                >
                  {copiedKey === "endpoint" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-500 dark:text-zinc-400">
                <div className="font-semibold text-slate-700 dark:text-zinc-300">Subscribed Events:</div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    payment.failed
                  </span>
                  <span className="rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    subscription.charged
                  </span>
                  <span className="rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    invoice.paid
                  </span>
                  <span className="rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    mandate.revoked
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Signature Verification Code */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#0c2340] dark:text-zinc-200">
                  2. Webhook Signature Verification (HMAC SHA-256)
                </CardTitle>
                <Badge variant="razorpay">Security</Badge>
              </div>
              <CardDescription>
                Every incoming webhook request contains the header <code className="text-[#0066f5] dark:text-[#3395ff] font-semibold">X-Razorpay-Signature</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-xl bg-[#0c2340] dark:bg-zinc-950 p-4 border border-slate-700 dark:border-zinc-800 font-mono text-xs text-slate-200 dark:text-zinc-300 overflow-x-auto shadow-md">
                <button
                  onClick={() => copyToClipboard(webhookSignatureSnippet, "sig")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {copiedKey === "sig" ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <pre>{webhookSignatureSnippet}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: cURL Command */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-[#0c2340] dark:text-zinc-200">
                3. Send Test Event via cURL
              </CardTitle>
              <CardDescription>
                Execute this in your terminal to dispatch a simulated payment failure into the pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-xl bg-[#0c2340] dark:bg-zinc-950 p-4 border border-slate-700 dark:border-zinc-800 font-mono text-xs text-slate-200 dark:text-zinc-300 overflow-x-auto shadow-md">
                <button
                  onClick={() => copyToClipboard(curlTestWebhook, "curl")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {copiedKey === "curl" ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <pre>{curlTestWebhook}</pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Voice Infrastructure & Safety Guards */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-[#0c2340] dark:text-zinc-200">
                Vapi Voice Provider Credentials
              </CardTitle>
              <CardDescription>
                Outbound telephony is bridged via Vapi's carrier network.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-zinc-400 font-semibold block">Vapi API Base URL</label>
                <div className="rounded-lg bg-slate-50 dark:bg-zinc-950 p-2 border border-slate-200 dark:border-zinc-800 font-mono text-slate-800 dark:text-zinc-300">
                  https://api.vapi.ai/call/phone
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-zinc-400 font-semibold block">Assistant Model</label>
                <div className="rounded-lg bg-slate-50 dark:bg-zinc-950 p-2 border border-slate-200 dark:border-zinc-800 font-mono text-[#0066f5] dark:text-emerald-400 font-semibold">
                  openai/gpt-4o-mini (Low-latency streaming)
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-zinc-400 font-semibold block">Voice Synthesis Engine</label>
                <div className="rounded-lg bg-slate-50 dark:bg-zinc-950 p-2 border border-slate-200 dark:border-zinc-800 font-mono text-slate-800 dark:text-zinc-300">
                  11labs / rachel / azure-neural
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                <strong>Telephony Rule:</strong> "Use only a number you control or have explicit permission to call."
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-[#0c2340] dark:text-zinc-200">
                RBI & Anti-Phishing Guardrails
              </CardTitle>
              <CardDescription>
                Hardened prompt specifications for automated voice recovery compliance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Never collect CVV / PIN / OTP:</strong> Voice agent explicitly informs customer that sensitive credentials are never requested over calls.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Encrypted WhatsApp/SMS links only:</strong> Payment update links are pre-authenticated tokens issued directly from Razorpay's secure payment gateway.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>E-Mandate Compliance:</strong> Respects RBI's 24-hour pre-debit notification requirement and user cancellation preferences.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
