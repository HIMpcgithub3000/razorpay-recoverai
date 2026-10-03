import { NextRequest, NextResponse } from "next/server"
import { RecoveryAgentLLM } from "@/lib/ai/recovery-agent-llm"
import { INITIAL_CUSTOMERS } from "@/lib/data/customers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, message, conversationHistory } = body

    const customer = INITIAL_CUSTOMERS.find((c) => c.id === customerId) || INITIAL_CUSTOMERS[0]

    // Process customer speech through conversational reasoning
    const response = await RecoveryAgentLLM.processCustomerTurn(
      customer,
      message || "",
      conversationHistory || []
    )

    return NextResponse.json({
      status: "success",
      customer: {
        id: customer.id,
        name: customer.name,
        plan: customer.subscriptionPlan,
        amount: customer.amount,
      },
      agentReply: response.reply,
      toolCall: response.toolCall || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Error during AI conversational turn", details: String(error) },
      { status: 500 }
    )
  }
}
