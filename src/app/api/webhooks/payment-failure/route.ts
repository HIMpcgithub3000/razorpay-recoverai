import { NextRequest, NextResponse } from "next/server"
import { RecoveryDecisionEngine } from "@/lib/engine/decision-engine"
import { INITIAL_CUSTOMERS } from "@/lib/data/customers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, customer_id, invoice_id, amount, failure_code } = body

    // Match customer from dataset
    const customer = INITIAL_CUSTOMERS.find(
      (c) => c.id === customer_id || c.invoiceId === invoice_id
    ) || INITIAL_CUSTOMERS[0]

    // Run the Recovery Decision Engine
    const decision = RecoveryDecisionEngine.evaluate(customer)

    const responsePayload = {
      status: "received",
      event_type: event || "invoice.payment_failed",
      processed_at: new Date().toISOString(),
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        plan: customer.subscriptionPlan,
        amount: customer.amount,
      },
      recovery_decision: {
        recovery_probability: decision.recoveryProbability,
        churn_risk_score: decision.churnRiskScore,
        recommended_action: decision.recommendedAction,
        strategy: decision.recommendedStrategy,
        reasoning: decision.reasoning,
        suggested_grace_days: decision.suggestedGraceDays,
        optimal_call_window: decision.optimalCallWindow,
      },
      ai_queue: {
        enqueued: true,
        priority: decision.churnRiskScore > 70 ? "HIGH_RETENTION" : "STANDARD",
        queued_at: new Date().toISOString(),
      },
    }

    return NextResponse.json(responsePayload, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid payment failure webhook payload", details: String(error) },
      { status: 400 }
    )
  }
}
