import {
  CustomerRecord,
  RecoveryStrategy,
} from "@/types/recovery"

export interface DecisionEvaluation {
  customerId: string
  recoveryProbability: number
  churnRiskScore: number
  recommendedAction: "immediate_voice_call" | "scheduled_voice_call" | "instant_retry" | "human_escalation" | "sms_only"
  recommendedStrategy: RecoveryStrategy
  confidenceScore: number
  reasoning: string[]
  suggestedGraceDays: number
  optimalCallWindow: string
}

export class RecoveryDecisionEngine {
  /**
   * Evaluates a failed payment record and derives the optimal retention strategy.
   */
  public static evaluate(customer: CustomerRecord): DecisionEvaluation {
    const reasoning: string[] = []
    let baseProbability = 70
    let riskScore = 30
    let strategy: RecoveryStrategy = "voice_call_payment_link"
    let action: DecisionEvaluation["recommendedAction"] = "immediate_voice_call"
    let graceDays = 3

    // 1. Evaluate by Failure Code
    switch (customer.failureCode) {
      case "insufficient_funds":
        baseProbability = 92
        riskScore = 20
        strategy = "voice_call_salary_retry"
        action = "immediate_voice_call"
        graceDays = 5
        reasoning.push(
          "Customer has sufficient tenure; failure is likely salary/cashflow timing related.",
          "Voice outreach to confirm salary date and schedule automatic retry yields 92% recovery."
        )
        break

      case "expired_card":
        baseProbability = 88
        riskScore = 35
        strategy = "voice_call_payment_link"
        action = "immediate_voice_call"
        graceDays = 7
        reasoning.push(
          "Card expired naturally; customer is actively using service.",
          "Voice agent will offer an SMS payment link for secure 1-click tokenization."
        )
        break

      case "bank_technical_decline":
        baseProbability = 95
        riskScore = 12
        strategy = "voice_call_instant_retry"
        action = "instant_retry"
        graceDays = 3
        reasoning.push(
          "Transient issuing bank 3DS handshake failure.",
          "Instant retry has high success probability. Voice call secondary."
        )
        break

      case "card_velocity_exceeded":
        baseProbability = 75
        riskScore = 40
        strategy = "voice_call_instant_retry"
        action = "scheduled_voice_call"
        graceDays = 2
        reasoning.push(
          "Multiple attempts triggered bank anti-fraud velocity threshold.",
          "24-hour cooldown required before re-attempting charge."
        )
        break

      case "mandate_revoked_by_customer":
        baseProbability = 45
        riskScore = 85
        strategy = "voice_call_human_escalate"
        action = "human_escalation"
        graceDays = 7
        reasoning.push(
          "Customer proactively revoked bank autopay mandate; high churn intent.",
          "Requires immediate empathetic conversation; offer retention pause or human supervisor."
        )
        break

      case "stolen_or_lost_card_freeze":
        baseProbability = 82
        riskScore = 28
        strategy = "voice_call_grace_period"
        action = "immediate_voice_call"
        graceDays = 10
        reasoning.push(
          "Card frozen due to third-party incident. Account is in good standing.",
          "Extend subscription grace period by 10 days while customer receives replacement card."
        )
        break

      case "international_tx_disabled":
        baseProbability = 90
        riskScore = 22
        strategy = "voice_call_bank_setting_guide"
        action = "immediate_voice_call"
        graceDays = 4
        reasoning.push(
          "RBI mandate compliance: new card has international e-commerce disabled by default.",
          "Voice agent will guide customer to toggle switch in netbanking app or send domestic link."
        )
        break

      case "do_not_honor":
        baseProbability = 68
        riskScore = 48
        strategy = "voice_call_payment_link"
        action = "immediate_voice_call"
        graceDays = 4
        reasoning.push(
          "Generic bank decline. High likelihood of card freeze or authorization block.",
          "Agent should probe gently and provide alternative payment methods (UPI/Netbanking)."
        )
        break

      case "account_closed":
        baseProbability = 35
        riskScore = 78
        strategy = "voice_call_payment_link"
        action = "human_escalation"
        graceDays = 5
        reasoning.push(
          "Underlying checking account terminated.",
          "New payment instrument registration required immediately."
        )
        break

      case "daily_transaction_limit_hit":
        baseProbability = 94
        riskScore = 15
        strategy = "voice_call_salary_retry"
        action = "scheduled_voice_call"
        graceDays = 2
        reasoning.push(
          "Customer exhausted daily expenditure quota on card.",
          "Rescheduling transaction for 04:00 AM next day has 94% recovery rate."
        )
        break
    }

    // 2. Adjust for LTV and Tenure
    if (customer.monthsSubscribed > 12) {
      baseProbability = Math.min(99, baseProbability + 5)
      riskScore = Math.max(5, riskScore - 10)
      reasoning.push("Long tenure (> 12 months) indicates high brand loyalty.")
    } else if (customer.monthsSubscribed < 3) {
      baseProbability = Math.max(20, baseProbability - 8)
      riskScore = Math.min(95, riskScore + 12)
      reasoning.push("Early tenure (< 3 months); elevated risk of voluntary abandonment.")
    }

    // 3. Adjust for Prior Failed Attempts
    if (customer.attemptCount >= 3) {
      baseProbability = Math.max(15, baseProbability - 15)
      riskScore = Math.min(95, riskScore + 15)
      reasoning.push("Multiple failed retries already occurred. Urgency elevated.")
    }

    // 4. Optimal Call Window calculation (IST / Business hours)
    const optimalCallWindow = "10:30 AM – 1:00 PM or 4:30 PM – 7:30 PM Local Time"

    return {
      customerId: customer.id,
      recoveryProbability: Math.round(baseProbability),
      churnRiskScore: Math.round(riskScore),
      recommendedAction: action,
      recommendedStrategy: strategy,
      confidenceScore: 92,
      reasoning,
      suggestedGraceDays: graceDays,
      optimalCallWindow,
    }
  }
}
