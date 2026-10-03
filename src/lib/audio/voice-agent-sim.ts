import { CustomerRecord, CallTurn } from "@/types/recovery"

export interface ScriptedScenario {
  customerId: string
  introAgent: string
  userResponses: {
    label: string
    userText: string
    agentReply: string
    autoToolCall?: {
      name: string
      params: Record<string, unknown>
    }
  }[]
}

export const SCRIPTED_SCENARIOS: Record<string, ScriptedScenario> = {
  cust_001: {
    customerId: "cust_001",
    introAgent:
      "Hello Aarav! This is Riley from FinTech Pro's billing desk. I'm reaching out because your monthly autopay of $199 on your Visa ending in 4021 didn't go through due to insufficient funds. No worries at all—we want to make sure your API keys stay active without interruption. Would you like me to schedule a retry for your upcoming salary date?",
    userResponses: [
      {
        label: "Schedule Retry for 2 Days Later",
        userText: "Yes please, my salary credits in two days. Can you retry then?",
        agentReply:
          "Perfect! I have scheduled an automatic payment retry for two days from now. Your services will remain completely uninterrupted. Thank you for your partnership, Aarav!",
        autoToolCall: {
          name: "schedule_payment_retry",
          params: { targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0] },
        },
      },
      {
        label: "Send Instant Payment Link",
        userText: "Actually, I have funds in my other account. Can you send me a quick payment link?",
        agentReply:
          "Right away! I've sent a secure 1-click payment link directly to your mobile number via SMS. You can complete it with any card or UPI. Thank you!",
        autoToolCall: {
          name: "send_payment_link",
          params: { channel: "sms" },
        },
      },
    ],
  },
  cust_002: {
    customerId: "cust_002",
    introAgent:
      "Hi Priya, this is Riley from CloudScale Enterprise. I'm calling regarding your $850 infrastructure invoice. It appears your Mastercard ending in 8829 expired last month. We can quickly update your billing card so your production servers face no disruption. Would you like me to send a secure update link?",
    userResponses: [
      {
        label: "Send Secure Card Update Link",
        userText: "Yes please, text me the link and I'll enter our new corporate card right now.",
        agentReply:
          "Done! The secure link has been sent to your phone. Once you enter the new card, our system will automatically tokenize it and clear the invoice. Have a great day!",
        autoToolCall: {
          name: "send_payment_link",
          params: { channel: "sms" },
        },
      },
      {
        label: "Grant 7-Day Grace Period",
        userText: "Our finance team is issuing a new card by Friday. Can you hold off on suspending our account?",
        agentReply:
          "Absolutely, Priya. Given your 22-month tenure with CloudScale, I've extended an active 7-day grace period for your team. Your services remain 100% online.",
        autoToolCall: {
          name: "apply_grace_period",
          params: { days: 7 },
        },
      },
    ],
  },
  cust_004: {
    customerId: "cust_004",
    introAgent:
      "Guten Tag Elena, this is Riley from AI Workflow Studio. Our payment gateway encountered a temporary bank 3DS timeout while processing your $299 Studio Pro renewal on your card ending in 9312. May I trigger an instant re-authorization for you right now?",
    userResponses: [
      {
        label: "Trigger Instant Gateway Retry",
        userText: "Yes please, my bank app is open now, go ahead and retry.",
        agentReply:
          "Triggering the re-authorization now... Verified! The transaction has been confirmed by your bank and your receipt has been emailed. Thank you!",
        autoToolCall: {
          name: "verify_payment_status",
          params: {},
        },
      },
    ],
  },
  cust_005: {
    customerId: "cust_005",
    introAgent:
      "Hello Vikram, calling from OmniRetail Global. We noticed that your recurring mandate for your $1,200 Dedicated Cloud plan was paused. We want to check in to see if you have any questions or if you'd like to review your current enterprise volume terms?",
    userResponses: [
      {
        label: "Complain About Pricing & Escalate",
        userText: "Our transaction volumes dipped this quarter, so the $1,200 tier is feeling steep. I want to renegotiate.",
        agentReply:
          "I completely understand, Vikram. Because you are a valued enterprise partner, I am immediately routing your line to our Commercial Director, who can apply custom tier restructuring. Please hold while I bridge you.",
        autoToolCall: {
          name: "escalate_to_human",
          params: { reason: "Volume pricing renegotiation requested by customer" },
        },
      },
    ],
  },
  cust_006: {
    customerId: "cust_006",
    introAgent:
      "Hello Sarah, this is Riley from GrowthLeap. We saw that your $79 Agency Master subscription failed because your Visa ending in 5512 was frozen. I hope everything is alright with your card security?",
    userResponses: [
      {
        label: "Report Card Replacement & Ask for Grace Period",
        userText: "Someone tried to charge an Uber in another country, so the bank cancelled my card. A new one will arrive next week.",
        agentReply:
          "I'm so sorry you had to deal with that! To take the stress off, I have applied a 10-day grace period to your account so you won't lose access to your client campaigns. I'll also text you a link for when the new card arrives.",
        autoToolCall: {
          name: "apply_grace_period",
          params: { days: 10 },
        },
      },
    ],
  },
  cust_007: {
    customerId: "cust_007",
    introAgent:
      "Namaste Rohan! Riley here from CyberShield. Your monthly renewal of $450 on your RuPay card ending in 6601 failed because the international e-commerce transaction switch is toggled off on your new card per RBI guidelines. You can enable it in 30 seconds via your netbanking app!",
    userResponses: [
      {
        label: "I Enabled It, Please Retry",
        userText: "Ah, good catch! I just opened my HDFC app and turned on international transactions. Can you retry now?",
        agentReply:
          "Retrying payment through our payment gateway now... Success! The transaction cleared and your threat protection suite is refreshed. Thank you!",
        autoToolCall: {
          name: "verify_payment_status",
          params: {},
        },
      },
      {
        label: "Send Domestic UPI Payment Link",
        userText: "Can you just send me a domestic UPI link so I can pay via Google Pay or PhonePe instead?",
        agentReply:
          "Of course! I have dispatched a domestic UPI payment link to +91 97111 65432. You can tap and pay instantly.",
        autoToolCall: {
          name: "send_payment_link",
          params: { channel: "sms" },
        },
      },
    ],
  },
}

/**
 * Fallback dynamic scenario generator for any customer record
 */
export function getScenarioForCustomer(customer: CustomerRecord): ScriptedScenario {
  if (SCRIPTED_SCENARIOS[customer.id]) {
    return SCRIPTED_SCENARIOS[customer.id]
  }

  return {
    customerId: customer.id,
    introAgent: `Hello ${customer.name}, this is Riley from the billing and accounts team at ${customer.company}. I'm reaching out regarding your ${customer.subscriptionPlan} renewal of $${customer.amount} on your card ending in ${customer.cardLast4}, which experienced an autopay issue (${customer.failureReasonHuman}). We want to ensure your services remain continuous. Would you like me to send a payment link or schedule a convenient retry date?`,
    userResponses: [
      {
        label: "Send Secure Payment Link",
        userText: "Please send me a payment link so I can settle it right away.",
        agentReply: `I've sent an instant payment link to your registered phone number ${customer.phone}. Thank you for taking care of this promptly!`,
        autoToolCall: {
          name: "send_payment_link",
          params: { channel: "sms" },
        },
      },
      {
        label: "Schedule Retry in 3 Days",
        userText: "Can you try charging the card again in 3 days?",
        agentReply: `Certainly! I've scheduled an automatic retry in 3 days. Your account will remain in good standing in the meantime.`,
        autoToolCall: {
          name: "schedule_payment_retry",
          params: { targetDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0] },
        },
      },
      {
        label: "Transfer to Support Agent",
        userText: "I'd like to discuss my account with a human agent please.",
        agentReply: "Understood. I am connecting you with a senior accounts specialist right now. Please hold.",
        autoToolCall: {
          name: "escalate_to_human",
          params: { reason: "Customer requested human representative" },
        },
      },
    ],
  }
}
