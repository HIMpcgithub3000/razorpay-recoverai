import { NextRequest, NextResponse } from "next/server"
import { VapiProvider } from "@/lib/providers/vapi"
import { INITIAL_CUSTOMERS } from "@/lib/data/customers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, targetPhone, apiKey, phoneNumberId } = body

    if (!apiKey || !phoneNumberId || !targetPhone) {
      return NextResponse.json(
        { error: "Vapi API Key, Phone Number ID, and Target Phone are required." },
        { status: 400 }
      )
    }

    const customer = INITIAL_CUSTOMERS.find((c) => c.id === customerId) || INITIAL_CUSTOMERS[0]

    const result = await VapiProvider.dispatchCall({
      apiKey,
      phoneNumberId,
      customerPhone: targetPhone,
      customer,
    })

    return NextResponse.json({
      status: "call_initiated",
      vapiCallId: result.id,
      customer: customer.name,
      targetPhone,
      result,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to dispatch Vapi phone call", details: String(error) },
      { status: 500 }
    )
  }
}
