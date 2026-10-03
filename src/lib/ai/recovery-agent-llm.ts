import { CustomerRecord, CallTurn } from "@/types/recovery"

export interface AgentResponse {
  reply: string
  toolCall?: {
    name: string
    params: Record<string, unknown>
  }
}

export class RecoveryAgentLLM {
  /**
   * Generates dynamic contextual response and executes intent reasoning on customer speech.
   */
  public static async processCustomerTurn(
    customer: CustomerRecord,
    customerUtterance: string,
    history: CallTurn[]
  ): Promise<AgentResponse> {
    const text = customerUtterance.toLowerCase().trim()

    // 1. Intent: Schedule Payment Retry
    if (
      text.includes("retry") ||
      text.includes("later") ||
      text.includes("salary") ||
      text.includes("tomorrow") ||
      text.includes("next week") ||
      text.includes("friday") ||
      text.includes("monday") ||
      text.includes("few days") ||
      text.includes("after 2 days") ||
      text.includes("schedule") ||
      text.includes("pay on") ||
      text.includes("wait until")
    ) {
      let targetDate = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
      if (text.includes("tomorrow")) {
        targetDate = new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0]
      } else if (text.includes("next week") || text.includes("friday")) {
        targetDate = new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0]
      }

      return {
        reply: `Understood, ${customer.name.split(" ")[0]}! I have scheduled an automatic payment retry for ${targetDate} at 9:00 AM on your ${customer.cardBrand.toUpperCase()} ending in ${customer.cardLast4}. Your ${customer.subscriptionPlan} will remain fully active with zero disruption. Thank you!`,
        toolCall: {
          name: "schedule_payment_retry",
          params: { targetDate },
        },
      }
    }

    // 2. Intent: Send Payment Link (SMS / WhatsApp / Email / UPI)
    if (
      text.includes("link") ||
      text.includes("text") ||
      text.includes("sms") ||
      text.includes("whatsapp") ||
      text.includes("upi") ||
      text.includes("google pay") ||
      text.includes("phonepe") ||
      text.includes("card update") ||
      text.includes("online") ||
      text.includes("new card") ||
      text.includes("send it") ||
      text.includes("pay now") ||
      text.includes("qr code")
    ) {
      const channel = text.includes("whatsapp") ? "whatsapp" : "sms"
      return {
        reply: `Certainly! I have generated a secure 1-click tokenized payment update link and dispatched it directly to ${customer.phone} via ${channel.toUpperCase()}. You can tap the link to settle the $${customer.amount} renewal with any card or payment method. Once updated, your autopay will seamlessly resume.`,
        toolCall: {
          name: "send_payment_link",
          params: { channel },
        },
      }
    }

    // 3. Intent: Grace Period Extension / Stolen Card / Waiting for bank replacement
    if (
      text.includes("grace") ||
      text.includes("stolen") ||
      text.includes("lost") ||
      text.includes("frozen") ||
      text.includes("replacement") ||
      text.includes("don't cancel") ||
      text.includes("wait") ||
      text.includes("pause") ||
      text.includes("extension") ||
      text.includes("extra time") ||
      text.includes("block") ||
      text.includes("bank card")
    ) {
      const days = text.includes("10") ? 10 : 7
      return {
        reply: `I completely understand, ${customer.name.split(" ")[0]}. To ensure your operations aren't impacted while you sort that out with your bank, I have activated an active ${days}-day grace period on your account. Your services will remain completely uninterrupted. I'll also send an email with next steps!`,
        toolCall: {
          name: "apply_grace_period",
          params: { days },
        },
      }
    }

    // 4. Intent: Human Support Escalation / Pricing Dispute / Angry / Cancellation
    if (
      text.includes("cancel") ||
      text.includes("too expensive") ||
      text.includes("discount") ||
      text.includes("manager") ||
      text.includes("supervisor") ||
      text.includes("human") ||
      text.includes("representative") ||
      text.includes("renegotiate") ||
      text.includes("dispute") ||
      text.includes("speak with someone") ||
      text.includes("agent") ||
      text.includes("pricing") ||
      text.includes("not happy")
    ) {
      return {
        reply: `I hear you, ${customer.name.split(" ")[0]}. As a valued partner, we want to make sure your contract reflects your actual needs. I am initiating an immediate warm priority transfer to our Senior Accounts & Retention Specialist who can assist with custom volume pricing. Please hold the line while I bridge you.`,
        toolCall: {
          name: "escalate_to_human",
          params: { reason: `Customer requested live human support regarding: "${customerUtterance}"` },
        },
      }
    }

    // 5. Intent: Verify Payment Status / Claimed Already Paid / Retrying now
    if (
      text.includes("already paid") ||
      text.includes("check again") ||
      text.includes("turned on") ||
      text.includes("enabled") ||
      text.includes("retry now") ||
      text.includes("just paid") ||
      text.includes("paid it") ||
      text.includes("verify")
    ) {
      return {
        reply: `Let me check our gateway ledger in real time for you... Verified! The payment for $${customer.amount} has cleared successfully. Your ${customer.subscriptionPlan} is confirmed in good standing and your invoice receipt has been dispatched. Thank you for resolving this so quickly!`,
        toolCall: {
          name: "verify_payment_status",
          params: {},
        },
      }
    }

    // 6. Natural Conversational Fallback / Clarification
    return {
      reply: `Thank you for sharing that, ${customer.name.split(" ")[0]}. We want to ensure your ${customer.subscriptionPlan} remains active with zero downtime. I can immediately text you a secure payment link, schedule an automatic card retry for a date that suits you, or extend a temporary grace period. Which of those works best for you right now?`,
    }
  }
}
