import { CustomerRecord } from "@/types/recovery"

export interface VapiCallRequest {
  apiKey: string
  phoneNumberId: string
  customerPhone: string
  customer: CustomerRecord
  webhookBaseUrl?: string
}

export class VapiProvider {
  /**
   * Generates a complete Vapi assistant configuration tailored for autopay recovery.
   */
  public static buildAssistantConfig(customer: CustomerRecord, webhookUrl?: string) {
    return {
      name: `RecoverAI - ${customer.name}`,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `You are Riley, an empathetic and professional Payment Recovery Specialist at ${customer.company}.

CUSTOMER CONTEXT:
- Customer Name: ${customer.name}
- Subscription: ${customer.subscriptionPlan}
- Amount Due: $${customer.amount}
- Payment Method: ${customer.cardBrand.toUpperCase()} ending in ${customer.cardLast4} (Exp: ${customer.cardExpiry})
- Failure Reason: ${customer.failureReasonHuman} (Code: ${customer.failureCode})
- Customer LTV: $${customer.lifetimeValue} (${customer.monthsSubscribed} months subscribed)

YOUR OBJECTIVES:
1. Greet ${customer.name} warmly. State who you are and that you are calling regarding an autopay issue on their ${customer.subscriptionPlan} renewal.
2. Clearly explain the issue: their ${customer.cardBrand.toUpperCase()} ending in ${customer.cardLast4} had a payment decline due to "${customer.failureReasonHuman}".
3. Reassure the customer that their services remain currently active and you are calling to help avoid any account interruption.
4. Offer them suitable options:
   - If they need time or want to wait for salary, schedule a retry (tool: schedule_payment_retry).
   - If they want to pay online or use a new card/UPI, send a secure 1-click link (tool: send_payment_link).
   - If their card was lost or stolen, grant a 7 to 10 day grace period (tool: apply_grace_period).
   - If they are unhappy with pricing or want to cancel, escalate to a commercial director (tool: escalate_to_human).
   - If they say they already paid, verify it (tool: verify_payment_status).

CRITICAL COMPLIANCE RULES:
- NEVER ask for OTP, PIN, CVV, passwords, or full credit card numbers.
- Keep turns concise and conversational.
- Be polite, patient, and solutions-oriented.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "schedule_payment_retry",
              description: "Schedules an automatic retry of the failed autopay charge on a future date.",
              parameters: {
                type: "object",
                properties: {
                  targetDate: { type: "string", description: "The YYYY-MM-DD date when the retry should occur." },
                },
                required: ["targetDate"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "send_payment_link",
              description: "Dispatches a secure 1-click payment link to the customer via SMS or WhatsApp.",
              parameters: {
                type: "object",
                properties: {
                  channel: { type: "string", enum: ["sms", "whatsapp", "email"] },
                },
                required: ["channel"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "apply_grace_period",
              description: "Extends active service grace period by 3 to 10 days to prevent immediate account suspension.",
              parameters: {
                type: "object",
                properties: {
                  days: { type: "number", description: "Number of grace days to grant." },
                },
                required: ["days"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "escalate_to_human",
              description: "Transfers the live call to a senior retention manager for pricing disputes or cancellations.",
              parameters: {
                type: "object",
                properties: {
                  reason: { type: "string", description: "Reason for live human transfer." },
                },
                required: ["reason"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "verify_payment_status",
              description: "Checks real-time gateway ledger to verify if payment was completed.",
              parameters: { type: "object", properties: {} },
            },
          },
        ],
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel
      },
      firstMessage: `Hello ${customer.name}, this is Riley from Razorpay RecoverAI regarding an autopay renewal on your ${customer.subscriptionPlan} subscription. Do you have a quick moment?`,
      ...(webhookUrl ? { serverUrl: `${webhookUrl}/api/webhooks/voice-call` } : {}),
    }
  }

  /**
   * Places a real outbound phone call via Vapi API.
   */
  public static async dispatchCall(req: VapiCallRequest) {
    const webhookUrl = req.webhookBaseUrl || "https://vox.blostem.info"
    const assistant = this.buildAssistantConfig(req.customer, webhookUrl)

    const payload = {
      assistant,
      phoneNumberId: req.phoneNumberId,
      customer: {
        number: req.customerPhone,
        name: req.customer.name,
      },
    }

    const response = await fetch("https://api.vapi.ai/call/phone", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${req.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Vapi API Error (${response.status}): ${err}`)
    }

    return await response.json()
  }
}
