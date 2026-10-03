import { NextRequest, NextResponse } from "next/server"
import { RecoveryTools } from "@/lib/engine/tools"
import { INITIAL_CUSTOMERS } from "@/lib/data/customers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { call_id, event_type, customer_id, tool_call } = body

    const customer = INITIAL_CUSTOMERS.find((c) => c.id === customer_id) || INITIAL_CUSTOMERS[0]

    if (tool_call) {
      const { name, params } = tool_call
      let toolResult = null

      switch (name) {
        case "schedule_payment_retry":
          toolResult = RecoveryTools.scheduleRetry(customer, params?.targetDate)
          break
        case "send_payment_link":
          toolResult = RecoveryTools.sendPaymentLink(customer, params?.channel)
          break
        case "escalate_to_human":
          toolResult = RecoveryTools.escalateToHuman(customer, params?.reason)
          break
        case "apply_grace_period":
          toolResult = RecoveryTools.applyGracePeriod(customer, params?.days)
          break
        case "verify_payment_status":
          toolResult = RecoveryTools.verifyPaymentStatus(customer)
          break
      }

      return NextResponse.json({
        status: "tool_executed",
        call_id,
        toolResult,
      })
    }

    return NextResponse.json({
      status: "call_event_acknowledged",
      event_type: event_type || "call.completed",
      recorded_at: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Error processing voice webhook", details: String(error) },
      { status: 400 }
    )
  }
}
