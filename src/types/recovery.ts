export type FailureReasonCode =
  | "insufficient_funds"
  | "expired_card"
  | "bank_technical_decline"
  | "card_velocity_exceeded"
  | "mandate_revoked_by_customer"
  | "stolen_or_lost_card_freeze"
  | "international_tx_disabled"
  | "do_not_honor"
  | "account_closed"
  | "daily_transaction_limit_hit"

export type CustomerRecoveryStatus =
  | "failed_pending"
  | "queued_for_call"
  | "calling"
  | "recovered"
  | "retry_scheduled"
  | "escalated"
  | "unreachable"
  | "churned"

export type RecoveryStrategy =
  | "voice_call_salary_retry"
  | "voice_call_payment_link"
  | "voice_call_instant_retry"
  | "voice_call_human_escalate"
  | "voice_call_grace_period"
  | "voice_call_bank_setting_guide"
  | "sms_payment_link_only"

export interface CustomerRecord {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string
  company: string
  region: "IN" | "US"
  customerGender?: "male" | "female"
  bankName?: string
  subscriptionPlan: string
  invoiceId: string
  amount: number
  currency: string
  inrAmount?: number
  paymentRail?: "upi_autopay" | "card_emandate" | "nach" | "credit_card" | "ach_debit" | "stripe_billing"
  billingCycle: "monthly" | "annual"
  cardBrand: "visa" | "mastercard" | "rupay" | "amex"
  cardLast4: string
  cardExpiry: string
  failureCode: FailureReasonCode
  failureReasonHuman: string
  failedAt: string
  attemptCount: number
  lifetimeValue: number
  monthsSubscribed: number
  churnRiskScore: number // 0 to 100
  recoveryProbability: number // 0 to 100%
  suggestedStrategy: RecoveryStrategy
  status: CustomerRecoveryStatus
  scheduledRetryDate?: string
  paymentLinkSent?: string
  gracePeriodUntil?: string
  escalationReason?: string
  lastCallTranscript?: CallTurn[]
}

export interface CallTurn {
  id: string
  speaker: "agent" | "customer" | "system"
  text: string
  timestamp: string
  toolCalled?: {
    name: string
    params: Record<string, unknown>
    result: string
  }
}

export interface WebhookEventLog {
  id: string
  timestamp: string
  source: "stripe" | "razorpay" | "vapi" | "voice_agent"
  eventType: string
  customerId: string
  customerName: string
  payload: Record<string, unknown>
  status: "processed" | "delivered" | "failed"
}

export interface RecoveryMetrics {
  totalFailedAmount: number
  totalRecoveredAmount: number
  totalCustomersFailed: number
  totalCustomersRecovered: number
  recoveryRatePercent: number
  activeQueueCount: number
  scheduledRetriesCount: number
  escalationsCount: number
}
