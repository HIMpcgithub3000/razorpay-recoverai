"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { CustomerRecord, WebhookEventLog, CallTurn, RecoveryMetrics } from "@/types/recovery"
import { INITIAL_CUSTOMERS } from "@/lib/data/customers"
import { RecoveryTools } from "@/lib/engine/tools"
import { RecoveryDecisionEngine } from "@/lib/engine/decision-engine"

const STORAGE_KEY = "recoverai_customers_v2"
const WEBHOOKS_STORAGE_KEY = "recoverai_webhooks_v2"

export function useRecoveryStore() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS)
  const [webhooks, setWebhooks] = useState<WebhookEventLog[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("cust_in_001")
  const [isCalling, setIsCalling] = useState(false)
  const [callPhase, setCallPhase] = useState<"idle" | "ringing" | "connected" | "agent_speaking" | "user_listening" | "ended">("idle")
  const [activeCallTurns, setActiveCallTurns] = useState<CallTurn[]>([])
  const [lastExecutedTool, setLastExecutedTool] = useState<{ name: string; message: string; timestamp: string } | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setCustomers(JSON.parse(saved))
      }
      const savedWebhooks = localStorage.getItem(WEBHOOKS_STORAGE_KEY)
      if (savedWebhooks) {
        setWebhooks(JSON.parse(savedWebhooks))
      }
    } catch {
      // Fallback to initial
    }
    setIsInitialized(true)
  }, [])

  // Save to LocalStorage on update
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
      localStorage.setItem(WEBHOOKS_STORAGE_KEY, JSON.stringify(webhooks))
    } catch {
      // Ignore storage errors
    }
  }, [customers, webhooks, isInitialized])

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0]
  }, [customers, selectedCustomerId])

  // Computed metrics
  const metrics: RecoveryMetrics = useMemo(() => {
    const totalFailed = customers.reduce((sum, c) => sum + c.amount, 0)
    const recoveredCusts = customers.filter((c) => c.status === "recovered")
    const totalRecovered = recoveredCusts.reduce((sum, c) => sum + c.amount, 0)
    const scheduledCusts = customers.filter((c) => c.status === "retry_scheduled")
    const escalatedCusts = customers.filter((c) => c.status === "escalated")
    const queuedCusts = customers.filter((c) => c.status === "queued_for_call")

    return {
      totalFailedAmount: totalFailed,
      totalRecoveredAmount: totalRecovered,
      totalCustomersFailed: customers.length,
      totalCustomersRecovered: recoveredCusts.length,
      recoveryRatePercent: totalFailed > 0 ? Math.round((totalRecovered / totalFailed) * 100) : 0,
      activeQueueCount: queuedCusts.length,
      scheduledRetriesCount: scheduledCusts.length,
      escalationsCount: escalatedCusts.length,
    }
  }, [customers])

  // Update a single customer record
  const updateCustomer = useCallback((id: string, patch: Partial<CustomerRecord>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    )
  }, [])

  // Trigger Payment Failure Webhook (Simulates Stripe/Razorpay event)
  const triggerPaymentFailureWebhook = useCallback(
    (customerId: string) => {
      const cust = customers.find((c) => c.id === customerId)
      if (!cust) return

      const evalResult = RecoveryDecisionEngine.evaluate(cust)

      const newLog: WebhookEventLog = {
        id: `evt_fail_${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: cust.phone.startsWith("+91") ? "razorpay" : "stripe",
        eventType: "invoice.payment_failed",
        customerId: cust.id,
        customerName: cust.name,
        status: "processed",
        payload: {
          invoice_id: cust.invoiceId,
          amount_due: cust.amount,
          currency: cust.currency,
          failure_code: cust.failureCode,
          failure_reason: cust.failureReasonHuman,
          attempt_count: cust.attemptCount + 1,
          recovery_decision: {
            strategy: evalResult.recommendedStrategy,
            recommended_action: evalResult.recommendedAction,
            probability: evalResult.recoveryProbability,
          },
        },
      }

      setWebhooks((prev) => [newLog, ...prev])
      updateCustomer(customerId, {
        attemptCount: cust.attemptCount + 1,
        status: "queued_for_call",
        suggestedStrategy: evalResult.recommendedStrategy,
        recoveryProbability: evalResult.recoveryProbability,
        churnRiskScore: evalResult.churnRiskScore,
      })
    },
    [customers, updateCustomer]
  )

  // Trigger Payment Succeeded Webhook
  const triggerPaymentSucceededWebhook = useCallback(
    (customerId: string) => {
      const cust = customers.find((c) => c.id === customerId)
      if (!cust) return

      const newLog: WebhookEventLog = {
        id: `evt_succ_${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: cust.phone.startsWith("+91") ? "razorpay" : "stripe",
        eventType: "invoice.payment_succeeded",
        customerId: cust.id,
        customerName: cust.name,
        status: "processed",
        payload: {
          invoice_id: cust.invoiceId,
          amount_paid: cust.amount,
          currency: cust.currency,
          settled_at: new Date().toISOString(),
          payment_method: `${cust.cardBrand.toUpperCase()} ending in ${cust.cardLast4}`,
        },
      }

      setWebhooks((prev) => [newLog, ...prev])
      updateCustomer(customerId, {
        status: "recovered",
      })
    },
    [customers, updateCustomer]
  )

  // In-call tool execution
  const executeToolCall = useCallback(
    (toolName: string, params: Record<string, unknown> = {}) => {
      if (!selectedCustomer) return null
      let result = null

      switch (toolName) {
        case "schedule_payment_retry":
          result = RecoveryTools.scheduleRetry(selectedCustomer, (params.targetDate as string) || "")
          break
        case "send_payment_link":
          result = RecoveryTools.sendPaymentLink(selectedCustomer, (params.channel as "sms" | "whatsapp") || "sms")
          break
        case "escalate_to_human":
          result = RecoveryTools.escalateToHuman(selectedCustomer, (params.reason as string) || "Customer requested live supervisor")
          break
        case "apply_grace_period":
          result = RecoveryTools.applyGracePeriod(selectedCustomer, (params.days as number) || 7)
          break
        case "verify_payment_status":
          result = RecoveryTools.verifyPaymentStatus(selectedCustomer)
          break
      }

      if (result) {
        updateCustomer(selectedCustomer.id, result.updatedCustomerPatch)
        setLastExecutedTool({
          name: result.tool,
          message: result.message,
          timestamp: new Date().toLocaleTimeString(),
        })

        // Also add system turn to active transcript
        const toolTurn: CallTurn = {
          id: `turn_${Date.now()}`,
          speaker: "system",
          text: `[TOOL EXECUTED]: ${result.tool.toUpperCase()} — ${result.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          toolCalled: {
            name: result.tool,
            params,
            result: result.message,
          },
        }
        setActiveCallTurns((prev) => [...prev, toolTurn])
      }

      return result
    },
    [selectedCustomer, updateCustomer]
  )

  // Reset demo dataset
  const resetDemoData = useCallback(() => {
    setCustomers(INITIAL_CUSTOMERS)
    setWebhooks([])
    setActiveCallTurns([])
    setLastExecutedTool(null)
    setIsCalling(false)
    setCallPhase("idle")
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(WEBHOOKS_STORAGE_KEY)
  }, [])

  return {
    customers,
    selectedCustomer,
    setSelectedCustomerId,
    webhooks,
    metrics,
    updateCustomer,
    triggerPaymentFailureWebhook,
    triggerPaymentSucceededWebhook,
    isCalling,
    setIsCalling,
    callPhase,
    setCallPhase,
    activeCallTurns,
    setActiveCallTurns,
    lastExecutedTool,
    setLastExecutedTool,
    executeToolCall,
    resetDemoData,
  }
}
