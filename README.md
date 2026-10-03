# Razorpay RecoverAI — Autonomous Failed Autopay Recovery Engine

<div align="center">

![Razorpay RecoverAI](https://img.shields.io/badge/Razorpay-RecoverAI-0066f5?style=for-the-badge&logo=razorpay&logoColor=white)
![Next.js 16](https://img.shields.io/badge/Next.js%2016-Turbopack-black?style=for-the-badge&logo=next.js&logoColor=white)
![Dograh AI](https://img.shields.io/badge/Dograh%20AI-Screenplay%20Prosody-rose?style=for-the-badge)
![Pipecat Voice](https://img.shields.io/badge/Pipecat-Audio%20Pipeline-emerald?style=for-the-badge)
![Vapi AI](https://img.shields.io/badge/Vapi%20AI-Cloud%20PSTN-indigo?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Self--Hosted%20%3A8080-blue?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**An enterprise-grade, dual-engine autonomous AI voice agent platform designed to recover failed recurring subscriptions and autopayments across India (UPI Autopay / e-NACH) and the United States (ACH Direct Debit / Stripe).**

[Architecture Spec](./ARCHITECTURE.md) • [Live Dashboard](http://localhost:3000) • [API Documentation](#-api--webhook-reference) • [Docker Quickstart](#-docker--quickstart)

</div>

---

## ⚡ The Problem: The $50 Billion Involuntary Churn Crisis

When a recurring subscription autopayment fails, traditional platforms rely on passive dunning emails that get buried in spam folders, or blunt retry sweeps that trigger secondary bank penalty fees. 

- **30%–50% of total SaaS and OTT subscriber churn is involuntary**, caused purely by technical billing failure rather than active customer cancellation.
- In India, **UPI Autopay and e-NACH mandates** frequently fail due to timing mismatches with the customer's monthly salary credit date.
- In the US, **ACH Direct Debit and corporate corporate cards** decline due to quarterly budget cycle changes or temporary payroll delays.

**Razorpay RecoverAI** solves this by instantaneously intercepting payment failure events and deploying an empathetic, conversational AI voice recovery agent that talks to the customer, understands why the payment failed, negotiates an optimal resolution, and executes autonomous recovery actions in real time.

---

## 🚀 Key Features & Capabilities

### 1. 🎙️ Dual-Engine Voice Architecture (Zero Lock-in)
- **🐳 Dograh + Pipecat (Self-Hosted Docker)**: 100% on-premise audio pipeline running on port `8080`. Employs Microsoft Edge Neural synthesis with sub-400ms generation, streaming MP3 audio directly to client buffers without per-minute cloud API bills.
- **⚡ Vapi AI (Cloud Managed)**: Turnkey enterprise telephony with Deepgram Nova-3 speech-to-text, ElevenLabs multilingual voices, and direct outbound PSTN phone dialing to real customer mobile devices.

### 2. 🎭 Dograh AI Screenplay Prosody ("Write for the Ear, Not the Eye")
Pioneers acoustic punctuation rules so voice agents never sound like robotic email readers:
- **Commas (`,`)**: 150ms–250ms breathing micro-pauses with sustained vocal pitch.
- **Full Stops (`.` / `।`)**: 350ms–450ms downward cadence drops signaling sentence completion.
- **Ellipses (`...`)**: 500ms empathetic hesitation before sensitive billing discussions.
- **Question Marks (`?`)**: Syllable pitch lift inviting natural conversational turn-taking.

### 3. 💖 4 Multi-Emotion Behavioral Profiles
Voice rate and pitch dynamically adjust according to the customer's emotional posture:
- **Empathetic (`💖`)**: `-4%` rate, `+2Hz` pitch — Gentle warmth, soft pacing, sympathetic pauses.
- **Reassuring (`🤝`)**: `+0%` rate, `-1Hz` pitch — Grounded confidence, authoritative security.
- **De-escalating (`🛡️`)**: `-6%` rate, `-2Hz` pitch — Slower tempo, low pitch to calm frustrated subscribers.
- **Professional (`👔`)**: `+2%` rate, `+0Hz` pitch — Crisp, brisk enterprise business cadence.

### 4. 👥 Gender-Discriminated Neural Voice Models
- **Female Personas (Riya / Sarah)**: Powered by `hi-IN-SwaraNeural` (Hindi), `en-US-AriaNeural` / `en-US-JennyNeural` (US), and `en-IN-NeerjaNeural` (Indian English). Employs strict Hindi grammatical concord (`बात कर रही हूँ`, `समझती हूँ`).
- **Male Personas (Rohan / Alex)**: Powered by `hi-IN-MadhurNeural` (Hindi), `en-US-GuyNeural` (US), and `en-IN-PrabhatNeural` (Indian English). Adheres to masculine grammatical concord (`बात कर रहा हूँ`, `समझता हूँ`).

### 5. 🌐 Segregated Regional Queues & Banking Rails
- **🇮🇳 India Domestic Queue (8 Profiles)**: Denominated in INR (`₹`), integrating UPI Autopay, e-NACH Mandates, RuPay, and domestic banks (HDFC, ICICI, SBI, Axis, Kotak). Supports salary-date retries and 1-click WhatsApp UPI links.
- **🇺🇸 US Enterprise Queue (8 Profiles)**: Denominated in USD (`$`), integrating ACH Direct Debit, Stripe Recurring, and US financial institutions (JPMorgan Chase, Silicon Valley Bank, Bank of America, Wells Fargo). Supports bi-weekly Friday payroll alignments and 1-click SMS links.

### 6. ⚙️ Autonomous In-Call Recovery Actions
During the call, the voice turn processor extracts intents and triggers automated backend tools:
1. `schedule_payment_retry`: Automatically delays dunning and schedules an automated mandate retry on customer's salary date.
2. `send_payment_link`: Dispatches a tokenized 1-click payment link via WhatsApp (India) or SMS (US).
3. `apply_grace_period`: Extends account access for 7 days when a card is lost or expired.
4. `escalate_to_human`: Instant warm transfer to senior customer success personnel for retention discussions.

---

## 🛠️ Architecture & System Topology

For detailed diagrams and architectural specifications, review the [ARCHITECTURE.md](./ARCHITECTURE.md) document.

```
Incoming Webhook (Razorpay / Stripe)
                 │
                 ▼
   Autonomous Decision Engine  ──► Risk Score & Intent Profiling
                 │
                 ▼
      Regional Queue Split  ──► 🇮🇳 India (INR) vs 🇺🇸 US (USD)
                 │
                 ▼
     Voice Engine Resolution  ──► 🐳 Dograh+Pipecat OR ⚡ Vapi AI
                 │
                 ├─► Punctuation Prosody Formatting (, . ... ?)
                 ├─► Emotion Tuning (Rate: -6%..+2%, Pitch: -2Hz..+2Hz)
                 └─► Gender Model Selection (Swara, Madhur, Aria, Guy)
                 │
                 ▼
     Autonomous Action Trigger  ──► Retry / WhatsApp / Grace / Escalate
```

---

## 📦 Directory Structure

```bash
raazorpay/
├── ARCHITECTURE.md                  # Comprehensive Architecture & Technical Spec
├── README.md                        # Documentation & Quickstart
├── docker-compose.dograh-pipecat.yml # Docker compose for self-hosted Dograh agent
├── dograh-pipecat-service/          # Python 3.11 FastAPI + Pipecat voice service
│   ├── Dockerfile                   # Docker image definition
│   ├── requirements.txt             # edge-tts, fastapi, uvicorn, pipecat-ai
│   └── server.py                    # Voice session, emotion prosody, & TTS streaming
├── src/
│   ├── app/                         # Next.js App Router (Turbopack)
│   │   ├── page.tsx                 # RecoverAI Landing Page & Live Dashboard
│   │   ├── layout.tsx               # Root layout & theme providers
│   │   └── api/
│   │       ├── dograh/[...path]/    # Proxy bridge to Dograh Docker (:8080)
│   │       ├── vapi/call/           # Vapi PSTN outbound call dispatcher
│   │       └── webhooks/            # Payment failure & voice webhooks
│   ├── components/dashboard/        # Production UI Components
│   │   ├── LiveCallStudio.tsx       # Live Studio, Waveform, Audio Player, Dograh Card
│   │   ├── CustomerQueueTable.tsx   # Regional queue table (India vs US filter tabs)
│   │   ├── KPICards.tsx             # Financial recovery metrics & ARR saved
│   │   ├── FailureSimulatorModal.tsx# Razorpay webhook event simulator
│   │   ├── VapiPhoneModal.tsx       # Real outbound PSTN dialer modal
│   │   └── ApiDocsView.tsx          # Interactive API documentation
│   └── lib/
│       ├── data/customers.ts        # 16 segregated customer dossiers (8 IN, 8 US)
│       ├── store/recovery-store.ts  # Zustand reactive recovery state
│       └── engine/decision-engine.ts# AI recovery strategy & risk modeling
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17+ or v20+
- **Docker & Docker Compose**: For running the self-hosted Dograh Pipecat service
- *(Optional)* **Vapi AI Account**: For real outbound PSTN mobile calls

---

### Step 1: Clone & Install Dependencies

```bash
git clone https://github.com/HIMpcgithub3000/razorpay-recoverai.git
cd razorpay-recoverai

npm install
```

---

### Step 2: Launch Dograh + Pipecat Service via Docker

The self-hosted Dograh voice service runs in an isolated container on port `8080`:

```bash
# Start the Dograh Pipecat container
docker compose -f docker-compose.dograh-pipecat.yml up -d

# Verify container health
curl -s http://localhost:8080/health
```

Expected output:
```json
{
  "status": "healthy",
  "service": "dograh-pipecat-voice-agent",
  "pipecat_engine": "active",
  "dograh_integration": "enabled",
  "supported_languages": ["en", "hi"],
  "emotion_profiles": {
    "empathetic": "💖 Empathetic & Caring",
    "reassuring": "🤝 Reassuring & Grounded",
    "de_escalating": "🛡️ De-escalating & Patient",
    "professional": "👔 Professional & Concise"
  },
  "self_hosted": true
}
```

---

### Step 3: Run Next.js Frontend & API Gateway

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API & Webhook Reference

### 1. Ingest Payment Failure Webhook
Simulates or receives an automated autopay failure notification from payment gateways.

- **Endpoint**: `POST /api/webhooks/payment-failure`
- **Payload**:
```json
{
  "event": "payment.autopay_failed",
  "customer_id": "cust_in_01",
  "customer_name": "Vikram Sharma",
  "amount": 4999.00,
  "currency": "INR",
  "region": "IN",
  "bank_name": "HDFC Bank",
  "card_brand": "HDFC UPI Autopay",
  "failure_reason": "Insufficient balance on salary settlement date"
}
```

---

### 2. Initiate Dograh Voice Session
Resolves emotion prosody, neural models, and generates a screenplay greeting.

- **Endpoint**: `POST /api/dograh/voice/session`
- **Payload**:
```json
{
  "customer_name": "Vikram Sharma",
  "customer_id": "cust_in_01",
  "company": "TechFlow Solutions",
  "subscription_plan": "Enterprise Cloud",
  "card_brand": "HDFC UPI Autopay",
  "card_last4": "4821",
  "language": "hi",
  "region": "IN",
  "voice_gender": "female",
  "emotion": "empathetic",
  "amount": 4999.00,
  "currency": "INR",
  "bank_name": "HDFC Bank",
  "failure_reason": "Insufficient balance on salary settlement date"
}
```
- **Response**:
```json
{
  "session_id": "session_cust_in_01_172798...",
  "voice": "hi-IN-SwaraNeural",
  "prosody": { "rate": "-4%", "pitch": "+2Hz" },
  "greeting": "नमस्ते विक्रम शर्मा जी, चिंता की कोई बात नहीं है... मैं रेज़रपे रिकवरएआई से रिया बात कर रही हूँ...",
  "tts_url": "/api/dograh/voice/tts?text=...&lang=hi&gender=female&region=IN&emotion=empathetic"
}
```

---

### 3. Realtime Conversational Voice Turn
Evaluates customer speech, executes recovery actions, and replies with prosody formatting.

- **Endpoint**: `POST /api/dograh/voice/turn`
- **Payload**:
```json
{
  "session_id": "session_cust_in_01_...",
  "message": "मेरी सैलरी 5 तारीख को आती है, तब काट लेना",
  "language": "hi",
  "voice_gender": "female",
  "emotion": "empathetic"
}
```
- **Response**:
```json
{
  "reply": "बहुत बढ़िया, विक्रम शर्मा जी! मैंने आपका पेमेंट रिट्राई 2026-10-07 के लिए शेड्यूल कर दिया है। तब तक आपका सब्सक्रिप्शन पूरी तरह से चालू रहेगा...",
  "tool_call": {
    "name": "schedule_payment_retry",
    "params": { "targetDate": "2026-10-07" }
  },
  "prosody": { "rate": "+0%", "pitch": "-1Hz" }
}
```

---

## 🎨 Razorpay Design System & Themes

RecoverAI is built using modern Razorpay design aesthetics:
- **Color Palette**: Curated Razorpay Blue (`#0066f5` / `#0c2340`), Emerald accents (`#10b981`), and Indigo secondary tones.
- **Light & Dark Theme**: One-click theme switch persisted across sessions.
- **Audio Visualizers**: Live fluid waveform animation and pulsing reactive dots reflecting speech amplitude.
- **Responsive**: Fully optimized for mobile, tablet, and widescreen enterprise monitoring consoles.

---

## 🛡️ License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">
Built with ❤️ for resilient recurring revenue recovery across India and the United States.
</div>
