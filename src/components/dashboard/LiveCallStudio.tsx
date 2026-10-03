"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { CustomerRecord, CallTurn } from "@/types/recovery"
import { SiriWave, SiriWaveVariant } from "@/components/ui/siri-wave"
import VapiWeb from "@vapi-ai/web"
import { VapiProvider } from "@/lib/providers/vapi"
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Calendar,
  Send,
  UserCheck,
  ShieldAlert,
  CheckCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Radio,
  SlidersHorizontal,
  Zap,
  Key,
  Settings,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Building2,
  Globe2,
} from "lucide-react"

interface LiveCallStudioProps {
  customer: CustomerRecord
  allCustomers: CustomerRecord[]
  onSelectCustomer: (id: string) => void
  onExecuteTool: (toolName: string, params?: Record<string, unknown>) => void
  onUpdateCustomer: (id: string, patch: Partial<CustomerRecord>) => void
  lastToolResult: { name: string; message: string; timestamp: string } | null
}

export function LiveCallStudio({
  customer,
  allCustomers,
  onSelectCustomer,
  onExecuteTool,
  onUpdateCustomer,
  lastToolResult,
}: LiveCallStudioProps) {
  const [variant, setVariant] = useState<SiriWaveVariant>("wave")
  const [isCalling, setIsCalling] = useState(false)
  const [callStatus, setCallStatus] = useState<"idle" | "ringing" | "agent_speaking" | "user_turn" | "ai_thinking" | "call_ended">("idle")
  const [transcript, setTranscript] = useState<CallTurn[]>([])
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [userInputText, setUserInputText] = useState("")
  const [isListeningMic, setIsListeningMic] = useState(false)

  // Engine Selection: "dograh" (Self-Hosted Pipecat) | "vapi" (Cloud)
  const [engineMode, setEngineMode] = useState<"dograh" | "vapi">("dograh")
  // Language Selection: "hi" (हिन्दी) | "en" (English)
  const [language, setLanguage] = useState<"hi" | "en">(customer.region === "US" ? "en" : "hi")
  // Voice Gender Selection: "female" (Riya / Sarah) | "male" (Rohan / Alex)
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female")
  // Dograh Behavioral & Emotional Tone Selection
  const [emotionMode, setEmotionMode] = useState<"empathetic" | "reassuring" | "professional" | "de_escalating">("empathetic")
  const [dograhSessionId, setDograhSessionId] = useState<string>("")
  const [dograhServiceHealthy, setDograhServiceHealthy] = useState<boolean>(true)

  // Automatically switch language to English when US customer is selected
  // and adapt default emotion based on failure reason
  useEffect(() => {
    if (customer.region === "US") {
      setLanguage("en")
    }
    if (customer.failureCode === "insufficient_funds" || customer.failureCode === "stolen_or_lost_card_freeze") {
      setEmotionMode("empathetic")
    } else if (customer.failureCode === "mandate_revoked_by_customer") {
      setEmotionMode("de_escalating")
    } else if (customer.failureCode === "expired_card" || customer.failureCode === "bank_technical_decline") {
      setEmotionMode("reassuring")
    }
  }, [customer.id, customer.region, customer.failureCode])

  const getActivePersonaName = () => {
    if (customer.region === "US") {
      return voiceGender === "female" ? "Sarah" : "Alex"
    } else {
      return voiceGender === "female" ? "रिया (Riya)" : "रोहन (Rohan)"
    }
  }

  const getActiveVoiceModel = () => {
    if (language === "hi") {
      return voiceGender === "female" ? "hi-IN-SwaraNeural" : "hi-IN-MadhurNeural"
    } else if (customer.region === "US") {
      if (emotionMode === "empathetic" && voiceGender === "female") {
        return "en-US-AriaNeural"
      }
      return voiceGender === "female" ? "en-US-JennyNeural" : "en-US-GuyNeural"
    } else {
      return voiceGender === "female" ? "en-IN-NeerjaNeural" : "en-IN-PrabhatNeural"
    }
  }

  const getEmotionProsody = () => {
    switch (emotionMode) {
      case "empathetic":
        return { rate: "-4%", pitch: "+2Hz", label: "Empathetic & Caring", icon: "💖" }
      case "reassuring":
        return { rate: "+0%", pitch: "-1Hz", label: "Reassuring & Grounded", icon: "🤝" }
      case "de_escalating":
        return { rate: "-6%", pitch: "-2Hz", label: "De-escalating & Patient", icon: "🛡️" }
      default:
        return { rate: "+2%", pitch: "+0Hz", label: "Professional & Concise", icon: "👔" }
    }
  }

  const getPreviewScript = () => {
    const isMale = voiceGender === "male"
    const bank = customer.bankName || (customer.region === "US" ? "JPMorgan Chase" : "HDFC Bank")
    if (language === "hi") {
      const verb = isMale ? "बात कर रहा हूँ" : "बात कर रही हूँ"
      const agentName = isMale ? "रोहन" : "रिया"
      if (emotionMode === "empathetic") {
        return `नमस्ते ${customer.name} जी, चिंता की कोई बात नहीं है... मैं रेज़रपे रिकवरएआई से ${agentName} ${verb}। आपके ${customer.company} के ${customer.subscriptionPlan} का ₹${Math.round(customer.inrAmount || customer.amount).toLocaleString("en-IN")} का ${bank} ऑटोपे पेमेंट '${customer.failureReasonHuman}' के कारण पूरा नहीं हो पाया। आपकी सेवा बिना किसी रुकावट के चालू रहे, इसके लिए क्या हम सैलरी आने के बाद पेमेंट रिट्राई शेड्यूल करें, या आपको व्हाट्सएप पर तुरंत 1-क्लिक यूपीआई लिंक भेजें?`
      } else if (emotionMode === "reassuring") {
        return `नमस्ते ${customer.name} जी! मैं रेज़रपे रिकवरएआई से ${agentName} ${verb}। आपके ${customer.company} का ₹${Math.round(customer.inrAmount || customer.amount).toLocaleString("en-IN")} का ऑटोपे पेमेंट अभी पेन्डिंग है। आप निश्चिंत रहें, आपका खाता पूरी तरह सुरक्षित है। क्या हम सैलरी क्रेडिट के बाद ऑटोपे शेड्यूल करें, या आप 1-क्लिक यूपीआई लिंक से अभी भुगतान करना चाहेंगे?`
      } else if (emotionMode === "de_escalating") {
        const verbUnderstand = isMale ? "समझता हूँ" : "समझती हूँ"
        return `नमस्ते ${customer.name} जी, मैं रेज़रपे रिकवरएआई से ${agentName} ${verb}... मैं ${verbUnderstand} कि आपके ${bank} ऑटोपे पर अप्रत्याशित समस्या आई है। हम आपकी सेवा को तुरंत सुचारू करने के लिए यहाँ हैं। क्या आप इस पर बात करने के लिए 1 मिनट का समय दे सकते हैं?`
      } else {
        return `नमस्ते ${customer.name} जी. मैं रेज़रपे रिकवरएआई से ${agentName} ${verb}. आपके ${customer.company} के ${customer.subscriptionPlan} का ₹${Math.round(customer.inrAmount || customer.amount).toLocaleString("en-IN")} का ऑटोपे पेमेंट पेन्डिंग है. क्या हम सैलरी डेट पर रिट्राई शेड्यूल करें, या व्हाट्सएप पर पेमेंट लिंक भेजें?`
      }
    } else if (customer.region === "US") {
      const agentName = isMale ? "Alex" : "Sarah"
      if (emotionMode === "empathetic") {
        return `Hi ${customer.name}, please don't worry... This is ${agentName} from Razorpay RecoverAI. I'm calling regarding your ${customer.company} ${customer.subscriptionPlan} renewal of $${customer.amount.toFixed(2)} on your ${bank} account, which ran into a temporary issue due to '${customer.failureReasonHuman}'. To make sure your team has zero service interruption, would you like to schedule an automated retry on this Friday's payroll date, or may I text you a secure 1-click update link?`
      } else if (emotionMode === "reassuring") {
        return `Hi ${customer.name}! This is ${agentName} from Razorpay RecoverAI. Rest assured, your ${customer.company} account and access are completely safe. Your $${customer.amount.toFixed(2)} renewal on ${bank} had a brief autopay decline. Shall we schedule a retry for your upcoming payroll date, or text a 1-click payment link?`
      } else if (emotionMode === "de_escalating") {
        return `Hello ${customer.name}, this is ${agentName} from Razorpay RecoverAI... I understand billing notices can be frustrating, especially with enterprise renewals. I'm here to ensure everything is resolved smoothly for ${customer.company}. Do you have a quick moment?`
      } else {
        return `Hello ${customer.name}, this is ${agentName} from Razorpay RecoverAI. Reaching out regarding your ${customer.company} renewal of $${customer.amount.toFixed(2)} via ${bank}, which was declined due to '${customer.failureReasonHuman}'. Would you prefer scheduling an automated retry for Friday payroll, or a secure 1-click SMS link?`
      }
    } else {
      const agentName = isMale ? "Rohan" : "Riya"
      if (emotionMode === "empathetic") {
        return `Hello ${customer.name}, please don't worry... This is ${agentName} from Razorpay RecoverAI regarding your ₹${Math.round(customer.inrAmount || customer.amount).toLocaleString("en-IN")} renewal via ${bank}, paused due to '${customer.failureReasonHuman}'. To keep your account active without interruption, would you like to schedule an automatic retry on your salary date, or dispatch a secure 1-click WhatsApp link?`
      } else if (emotionMode === "reassuring") {
        return `Hello ${customer.name}! This is ${agentName} from Razorpay RecoverAI. Rest assured, your ₹${Math.round(customer.inrAmount || customer.amount).toLocaleString("en-IN")} payment via ${bank} is safe. Shall we schedule a retry after your salary credit, or send a quick 1-click UPI link on WhatsApp?`
      } else if (emotionMode === "de_escalating") {
        return `Hello ${customer.name}, this is ${agentName} from Razorpay RecoverAI... I understand an unexpected payment decline on your ${bank} autopay can be disruptive. I'm here to ensure everything is resolved quickly and smoothly. Do you have a quick moment?`
      } else {
        return `Hello ${customer.name}, this is ${agentName} from Razorpay RecoverAI regarding your ${customer.subscriptionPlan} payment of ₹${Math.round(customer.inrAmount || customer.amount).toLocaleString("en-IN")} via ${bank}. Would you prefer scheduling a retry on your salary date, or receiving a 1-click payment link?`
      }
    }
  }

  // Vapi Configuration
  const [vapiPublicKey, setVapiPublicKey] = useState("")
  const [showVapiConfigModal, setShowVapiConfigModal] = useState(false)
  const [vapiVolume, setVapiVolume] = useState(0)
  const vapiClientRef = useRef<any>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  // Vapi Phone Call Configuration Modal (PSTN Call)
  const [showVapiModal, setShowVapiModal] = useState(false)
  const [vapiApiKey, setVapiApiKey] = useState("")
  const [vapiPhoneNumberId, setVapiPhoneNumberId] = useState("")
  const [targetRealPhone, setTargetRealPhone] = useState("")
  const [vapiCallStatus, setVapiCallStatus] = useState<string | null>(null)
  const [isDispatchingVapi, setIsDispatchingVapi] = useState(false)

  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Load saved Vapi credentials from localStorage and check Dograh service
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPubKey = localStorage.getItem("vapi_public_key") || process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ""
      if (savedPubKey) setVapiPublicKey(savedPubKey)

      const savedPrivKey = localStorage.getItem("vapi_private_key") || ""
      if (savedPrivKey) setVapiApiKey(savedPrivKey)

      const savedPhoneId = localStorage.getItem("vapi_phone_number_id") || ""
      if (savedPhoneId) setVapiPhoneNumberId(savedPhoneId)
    }

    // Check self-hosted Dograh Pipecat Docker service
    fetch("/api/dograh/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "healthy") setDograhServiceHealthy(true)
      })
      .catch(() => setDograhServiceHealthy(false))
  }, [])

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [transcript, callStatus])

  // Play Neural Audio from Self-Hosted Dograh Pipecat Service
  const playNeuralAudio = useCallback(
    (ttsUrl: string, onEnd?: () => void) => {
      if (!audioEnabled || typeof window === "undefined") {
        setTimeout(() => onEnd?.(), 2000)
        return
      }

      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause()
        audioPlayerRef.current.currentTime = 0
      }

      const audio = new Audio(ttsUrl)
      audioPlayerRef.current = audio

      audio.onplay = () => {
        setCallStatus("agent_speaking")
      }

      audio.onended = () => {
        setCallStatus("user_turn")
        onEnd?.()
      }

      audio.onerror = () => {
        setCallStatus("user_turn")
        onEnd?.()
      }

      audio.play().catch(() => {
        setCallStatus("user_turn")
        onEnd?.()
      })
    },
    [audioEnabled]
  )

  // Start Call (Dograh Pipecat Self-Hosted or Vapi Cloud)
  const startCall = async () => {
    if (engineMode === "dograh") {
      await startDograhCall()
    } else {
      const activeKey =
        vapiPublicKey ||
        (typeof window !== "undefined" ? localStorage.getItem("vapi_public_key") : "") ||
        process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ||
        ""

      if (!activeKey) {
        setShowVapiConfigModal(true)
        return
      }
      await startVapiCall(activeKey)
    }
  }

  // Dograh + Pipecat Self-Hosted Call (Multilingual Hindi & English)
  const startDograhCall = async () => {
    try {
      setIsCalling(true)
      setCallStatus("ringing")
      onUpdateCustomer(customer.id, { status: "calling" })

      const res = await fetch("/api/dograh/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customer.id,
          customer_name: customer.name,
          company: customer.company,
          subscription_plan: customer.subscriptionPlan,
          amount: customer.amount,
          currency: customer.currency || (customer.region === "IN" ? "INR" : "USD"),
          failure_reason: customer.failureReasonHuman,
          card_brand: customer.cardBrand,
          card_last4: customer.cardLast4,
          bank_name: customer.bankName,
          language: language,
          voice_gender: voiceGender,
          region: customer.region || "IN",
          customer_gender: customer.customerGender,
          emotion: emotionMode,
        }),
      })

      if (!res.ok) {
        throw new Error(`Dograh Pipecat service returned HTTP ${res.status}`)
      }

      const data = await res.json()
      setDograhSessionId(data.session_id)
      setCallStatus("agent_speaking")

      const introTurn: CallTurn = {
        id: `turn_${Date.now()}`,
        speaker: "agent",
        text: data.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      }
      setTranscript([introTurn])

      const audioUrl = `/api/dograh/voice/tts?text=${encodeURIComponent(data.greeting)}&lang=${language}&gender=${voiceGender}&region=${customer.region || "IN"}&emotion=${emotionMode}`
      playNeuralAudio(audioUrl, () => {
        setCallStatus("user_turn")
      })
    } catch (err: any) {
      console.error("Failed to start Dograh Pipecat call:", err)
      alert(
        `Could not connect to self-hosted Dograh Pipecat Docker container: ${err.message || String(err)}. Ensure container is running on port 8080.`
      )
      setIsCalling(false)
      setCallStatus("idle")
    }
  }

  // Vapi Live WebRTC Call (Deepgram nova-2 STT & ElevenLabs Rachel TTS)
  const startVapiCall = async (publicKeyToUse: string) => {
    try {
      setIsCalling(true)
      setCallStatus("ringing")
      onUpdateCustomer(customer.id, { status: "calling" })

      if (vapiClientRef.current) {
        try {
          vapiClientRef.current.stop()
        } catch {}
      }

      const VapiClass = (VapiWeb as any).default || VapiWeb
      const vapi = new VapiClass(publicKeyToUse)
      vapiClientRef.current = vapi

      vapi.on("call-start", () => {
        setCallStatus("agent_speaking")
        setTranscript((prev) => [
          ...prev,
          {
            id: `vapi_start_${Date.now()}`,
            speaker: "system",
            text: "— Vapi WebRTC Connected (Deepgram nova-2 STT & ElevenLabs Rachel TTS Active) —",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          },
        ])
      })

      vapi.on("speech-start", () => {
        setCallStatus("agent_speaking")
      })

      vapi.on("speech-end", () => {
        setCallStatus("user_turn")
      })

      vapi.on("volume-level", (volume: number) => {
        setVapiVolume(volume)
      })

      vapi.on("call-end", () => {
        setIsCalling(false)
        setCallStatus("idle")
        setTranscript((prev) => [
          ...prev,
          {
            id: `vapi_end_${Date.now()}`,
            speaker: "system",
            text: "— Vapi Call Session Completed —",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          },
        ])
      })

      vapi.on("message", (message: any) => {
        // Deepgram STT (Customer) & ElevenLabs TTS (Agent) Transcript streaming
        if (message.type === "transcript") {
          const text = message.transcript
          if (text && (message.transcriptType === "final" || !message.transcriptType)) {
            const speaker = message.role === "assistant" ? "agent" : "customer"
            setTranscript((prev) => {
              const last = prev[prev.length - 1]
              if (last && last.speaker === speaker && last.text === text) {
                return prev
              }
              return [
                ...prev,
                {
                  id: `vapi_turn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  speaker,
                  text,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                },
              ]
            })
          }
        }

        // Autonomous Function Calling execution from Vapi LLM
        if (message.type === "function-call") {
          const fnName = message.functionCall?.name
          const fnParams = message.functionCall?.parameters || {}
          if (fnName) {
            onExecuteTool(fnName, fnParams)
          }
        }
      })

      vapi.on("error", (err: any) => {
        console.error("Vapi WebRTC Error:", err)
        alert(`Vapi Error: ${err.message || String(err)}`)
        endCall(false)
      })

      const assistantConfig = VapiProvider.buildAssistantConfig(customer)
      await vapi.start(assistantConfig)
    } catch (err: any) {
      console.error("Failed to start Vapi call:", err)
      alert(`Could not start Vapi call: ${err.message || String(err)}. Please verify your Vapi Public Key.`)
      setIsCalling(false)
      setCallStatus("idle")
    }
  }

  // Submit Customer Utterance (Voice or Text)
  const handleSendCustomerSpeech = async (spokenText?: string) => {
    const textToSend = spokenText || userInputText.trim()
    if (!textToSend || callStatus === "ai_thinking") return

    setUserInputText("")

    // 1. Add customer turn to conversation stream
    const userTurn: CallTurn = {
      id: `turn_u_${Date.now()}`,
      speaker: "customer",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    }
    setTranscript((prev) => [...prev, userTurn])
    setCallStatus("ai_thinking")

    // Dograh + Pipecat Turn Processing (Self-Hosted Multilingual)
    if (engineMode === "dograh") {
      try {
        const response = await fetch("/api/dograh/voice/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: dograhSessionId || `session_${customer.id}`,
            message: textToSend,
            customer_name: customer.name,
            amount: customer.amount,
            language: language,
            voice_gender: voiceGender,
            region: customer.region || "IN",
            emotion: emotionMode,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to process voice turn via Dograh Pipecat")
        }

        const data = await response.json()

        // Autonomous recovery action tool execution
        if (data.tool_call) {
          setTimeout(() => {
            onExecuteTool(data.tool_call.name, data.tool_call.params)
          }, 350)
        }

        setCallStatus("agent_speaking")
        const agentTurn: CallTurn = {
          id: `turn_a_${Date.now()}`,
          speaker: "agent",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        }
        setTranscript((prev) => [...prev, agentTurn])

        const audioUrl = `/api/dograh/voice/tts?text=${encodeURIComponent(data.reply)}&lang=${data.language || language}&gender=${voiceGender}&region=${customer.region || "IN"}&emotion=${data.emotion || emotionMode}`
        playNeuralAudio(audioUrl, () => {
          setCallStatus("user_turn")
        })
      } catch (err: any) {
        console.error("Dograh Pipecat error:", err)
        setCallStatus("user_turn")
      }
      return
    }

    // Vapi WebRTC Forwarding
    if (engineMode === "vapi" && vapiClientRef.current && isCalling) {
      try {
        vapiClientRef.current.send({
          type: "add-message",
          message: {
            role: "user",
            content: textToSend,
          },
        })
      } catch (err) {
        console.error("Vapi message send error:", err)
      }
    }
  }

  // End Call
  const endCall = (manual: boolean = true) => {
    if (vapiClientRef.current) {
      try {
        vapiClientRef.current.stop()
      } catch {}
      vapiClientRef.current = null
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
    }
    setIsCalling(false)
    setCallStatus("idle")
    if (manual) {
      setTranscript((prev) => [
        ...prev,
        {
          id: `end_${Date.now()}`,
          speaker: "system",
          text:
            language === "hi"
              ? "— ऑपरेटर द्वारा कॉल समाप्त की गई —"
              : "— Call ended by operator —",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        },
      ])
    }
  }

  // Dispatch Real Vapi Phone Call to Mobile
  const handleDispatchVapiPhoneCall = async () => {
    if (!vapiApiKey || !vapiPhoneNumberId || !targetRealPhone) {
      alert("Please fill in Vapi API Key, Phone Number ID, and your Target Phone Number.")
      return
    }

    setIsDispatchingVapi(true)
    setVapiCallStatus("Initiating call via Vapi REST API...")

    try {
      const res = await fetch("/api/vapi/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          targetPhone: targetRealPhone,
          apiKey: vapiApiKey,
          phoneNumberId: vapiPhoneNumberId,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setVapiCallStatus(`Call successfully queued! Vapi Call ID: ${data.vapiCallId}. Your phone will ring shortly.`)
      } else {
        setVapiCallStatus(`Failed: ${data.error || data.details}`)
      }
    } catch (err) {
      setVapiCallStatus(`Error: ${String(err)}`)
    } finally {
      setIsDispatchingVapi(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 transition-colors">
      {/* LEFT COLUMN: SiriWave Visualizer & Voice Orb Studio (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Main Voice Visualizer Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-gradient-to-b dark:from-zinc-900/90 dark:via-zinc-950/90 dark:to-black p-6 shadow-sm dark:shadow-2xl backdrop-blur-xl transition-colors">
          {/* Top Bar inside card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isCalling
                    ? callStatus === "ringing"
                      ? "bg-amber-500 animate-ping"
                      : callStatus === "ai_thinking"
                      ? "bg-[#0066f5] dark:bg-indigo-400 animate-spin"
                      : "bg-emerald-500 animate-pulse"
                    : "bg-slate-400 dark:bg-zinc-600"
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                {isCalling
                  ? callStatus === "ringing"
                    ? "Connecting Telecom Carrier..."
                    : callStatus === "ai_thinking"
                    ? "AI Reasoning Intent & Recovery Action..."
                    : callStatus === "agent_speaking"
                    ? "Agent Speaking (Riley)"
                    : callStatus === "user_turn"
                    ? "Customer Turn (Listening to Mic/Input)"
                    : "Call Active"
                  : "Voice Agent Idle"}
              </span>
            </div>

            {/* Controls Bar: Engine Selector + Language Switcher + Vapi Real Phone Call + Shader Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Engine Selector: Dograh + Pipecat (Self-Hosted Docker) vs Vapi AI (Cloud) */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-900/90 p-1 border border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => setEngineMode("dograh")}
                  disabled={isCalling}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    engineMode === "dograh"
                      ? "bg-[#0066f5] text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                  title="Self-Hosted Dograh + Pipecat Docker Engine (English & Hindi support)"
                >
                  <Cpu className="h-3 w-3" />
                  <span>Dograh + Pipecat</span>
                  <span className="text-[9px] opacity-80 font-mono hidden md:inline">(Self-Hosted Docker)</span>
                </button>
                <button
                  onClick={() => setEngineMode("vapi")}
                  disabled={isCalling}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    engineMode === "vapi"
                      ? "bg-[#0066f5] text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                  title="Cloud Telephony: Deepgram nova-2 STT + ElevenLabs Rachel TTS"
                >
                  <Zap className="h-3 w-3" />
                  <span>Vapi AI</span>
                  <span className="text-[9px] opacity-80 font-mono hidden md:inline">(Cloud)</span>
                </button>
              </div>

              {/* Language Selector: English and Hindi */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-900/90 p-1 border border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => setLanguage("hi")}
                  disabled={isCalling}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    language === "hi"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                  title="Hindi (हिन्दी) Autopay Recovery Voice"
                >
                  <span>🇮🇳 हिन्दी</span>
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  disabled={isCalling}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    language === "en"
                      ? "bg-slate-800 dark:bg-zinc-700 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                  title="English Autopay Recovery Voice"
                >
                  <span>🇺🇸 English</span>
                </button>
              </div>

              {/* Voice Gender Selection: Female vs Male with tailored model & grammatical concord */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-900/90 p-1 border border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => setVoiceGender("female")}
                  disabled={isCalling}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    voiceGender === "female"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                  title="Female Agent Voice & Script Phrasing (Swara / Neerja / Jenny)"
                >
                  <span>👩 Female</span>
                </button>
                <button
                  onClick={() => setVoiceGender("male")}
                  disabled={isCalling}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    voiceGender === "male"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                  title="Male Agent Voice & Script Phrasing (Madhur / Prabhat / Guy)"
                >
                  <span>👨 Male</span>
                </button>
              </div>

              {/* Dograh Emotion & Behavioral Tone Selector */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-900/90 p-1 border border-slate-200 dark:border-zinc-800" title="Dograh AI Emotion & Screenplay Behavioral Prosody">
                <button
                  onClick={() => setEmotionMode("empathetic")}
                  disabled={isCalling}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition cursor-pointer ${
                    emotionMode === "empathetic"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                  title="Empathetic (-4% rate, +2Hz pitch): Gentle warmth, soft pacing, caring pauses"
                >
                  <span>💖 Empathetic</span>
                </button>
                <button
                  onClick={() => setEmotionMode("reassuring")}
                  disabled={isCalling}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition cursor-pointer ${
                    emotionMode === "reassuring"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                  title="Reassuring (normal rate, -1Hz pitch): Grounded confidence, secure tone"
                >
                  <span>🤝 Reassuring</span>
                </button>
                <button
                  onClick={() => setEmotionMode("de_escalating")}
                  disabled={isCalling}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition cursor-pointer ${
                    emotionMode === "de_escalating"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                  title="De-escalating (-6% rate, -2Hz pitch): Low pitch, deliberate calm, non-confrontational pauses"
                >
                  <span>🛡️ De-escalating</span>
                </button>
                <button
                  onClick={() => setEmotionMode("professional")}
                  disabled={isCalling}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition cursor-pointer ${
                    emotionMode === "professional"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                  title="Professional (+2% rate, neutral pitch): Concise, brisk business cadence"
                >
                  <span>👔 Professional</span>
                </button>
              </div>

              {/* Active Neural Model & Persona Badge */}
              <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-2.5 py-1 text-xs text-slate-700 dark:text-zinc-300 font-mono">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Voice:</span>
                <span className="font-bold text-[#0066f5] dark:text-[#3395ff]">{getActivePersonaName()}</span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span className="text-[10px] text-slate-500">{getActiveVoiceModel()}</span>
              </div>

              {/* Dograh Container Status or Vapi Key Status */}
              {engineMode === "dograh" ? (
                <div className="flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Docker :8080 Active</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowVapiConfigModal(true)}
                  disabled={isCalling}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-[#0066f5] hover:text-[#0066f5] transition cursor-pointer"
                  title="Configure Vapi Public Key for Deepgram & ElevenLabs"
                >
                  <Key className="h-3 w-3 text-[#0066f5]" />
                  {vapiPublicKey ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Key Connected
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Set Vapi Key</span>
                  )}
                </button>
              )}

              {/* Vapi Real Mobile Phone Call Modal */}
              <button
                onClick={() => setShowVapiModal(true)}
                disabled={isCalling}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-1 text-xs font-bold text-[#0066f5] dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                title="Dial an outbound phone call via Vapi PSTN"
              >
                <Radio className="h-3.5 w-3.5 text-[#0066f5] dark:text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">PSTN Phone</span>
              </button>

              {/* Wave / Dots Visualizer switcher */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-900/90 p-1 border border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => setVariant("wave")}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition cursor-pointer ${
                    variant === "wave"
                      ? "bg-white dark:bg-emerald-500/20 text-[#0066f5] dark:text-emerald-300 shadow-sm border border-slate-200 dark:border-emerald-500/30"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  Wave
                </button>
                <button
                  onClick={() => setVariant("fluid-dots")}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition cursor-pointer ${
                    variant === "fluid-dots"
                      ? "bg-white dark:bg-cyan-500/20 text-[#0066f5] dark:text-cyan-300 shadow-sm border border-slate-200 dark:border-cyan-500/30"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  Dots
                </button>
              </div>
            </div>
          </div>

          {/* WebGL SiriWave Canvas Container */}
          <div className="relative my-4 flex flex-col items-center justify-center min-h-[300px] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800/80">
            {/* Ambient Background Wave Image Glow */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-screen scale-125 filter blur-[2px] pointer-events-none"
              style={{ backgroundImage: `url('/siri-wave-bg.png')` }}
            />
            <div
              className={`absolute h-48 w-48 rounded-full blur-3xl transition-opacity duration-1000 ${
                isCalling
                  ? callStatus === "agent_speaking"
                    ? "bg-[#0066f5]/25 dark:bg-emerald-500/25 opacity-100"
                    : callStatus === "ai_thinking"
                    ? "bg-indigo-500/25 opacity-100"
                    : "bg-cyan-500/25 opacity-100"
                  : "bg-zinc-800/15 opacity-40"
              }`}
            />

            {/* The Integrated SiriWave Component */}
            <div className="relative z-10 transition-transform duration-500 hover:scale-105">
              <SiriWave
                variant={variant}
                size={280}
                renderScale={0.85}
                className="shadow-[0_0_50px_rgba(0,102,245,0.2)] transition-all duration-700"
              />
            </div>

            {/* Status Overlay Pill */}
            <div className="absolute bottom-4 z-20 flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-1.5 text-xs backdrop-blur-md shadow-lg text-white">
              <span className="text-slate-400">Target:</span>
              <span className="font-bold text-white">{customer.name}</span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-cyan-400">{customer.phone}</span>
            </div>
          </div>

          {/* Primary Call Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {!isCalling ? (
                <button
                  onClick={startCall}
                  className="flex items-center gap-2 rounded-xl bg-[#0066f5] hover:bg-[#0052cc] px-5 py-2.5 text-sm font-bold text-white transition shadow-lg shadow-[#0066f5]/25 active:scale-95 cursor-pointer"
                >
                  <Phone className="h-4 w-4" />
                  <span>
                    Initiate AI Recovery Call {engineMode === "dograh" ? `(${voiceGender === "female" ? "👩 Female" : "👨 Male"} • ${language === "hi" ? "हिन्दी" : customer.region === "US" ? "US English" : "Indian English"})` : "(Vapi AI)"}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => endCall(true)}
                  className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-500 transition shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer"
                >
                  <PhoneOff className="h-4 w-4" />
                  Terminate Call
                </button>
              )}

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                  audioEnabled
                    ? "border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-200"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500"
                }`}
                title={audioEnabled ? "Voice Audio Output Enabled" : "Voice Output Muted"}
              >
                <Volume2 className="h-3.5 w-3.5" />
                {audioEnabled ? "Speech ON" : "Muted"}
              </button>
            </div>

            {/* Quick Customer Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Customer Dossier:</span>
              <select
                value={customer.id}
                onChange={(e) => onSelectCustomer(e.target.value)}
                disabled={isCalling}
                className="rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 focus:border-[#0066f5] focus:outline-none cursor-pointer max-w-[260px] truncate"
              >
                {allCustomers.map((c) => {
                  const formatted = c.currency === "INR" || c.region === "IN"
                    ? `₹${Math.round(c.inrAmount || c.amount).toLocaleString("en-IN")}`
                    : `$${c.amount}`
                  return (
                    <option key={c.id} value={c.id}>
                      {c.region === "IN" ? "🇮🇳" : "🇺🇸"} {c.name} — {formatted} ({c.failureCode.replace(/_/g, " ")})
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
        </div>

        {/* In-Call Recovery Tools Quick Bar */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-zinc-900/50 p-4 backdrop-blur-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#0066f5] dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                In-Call Recovery Tools (Automated Execution)
              </span>
            </div>
            {lastToolResult && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                Executed: {lastToolResult.name} at {lastToolResult.timestamp}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              onClick={() => onExecuteTool("schedule_payment_retry")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-2.5 text-left text-xs hover:border-[#0066f5] dark:hover:border-emerald-500/50 hover:bg-blue-50/40 dark:hover:bg-emerald-950/20 transition shadow-sm dark:shadow-none group cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-[#0066f5] dark:text-emerald-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold text-slate-800 dark:text-zinc-200">Schedule Retry</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-500">Salary date retry</div>
              </div>
            </button>

            <button
              onClick={() => onExecuteTool("send_payment_link", { channel: "sms" })}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-2.5 text-left text-xs hover:border-cyan-500/50 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 transition shadow-sm dark:shadow-none group cursor-pointer"
            >
              <Send className="h-4 w-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold text-slate-800 dark:text-zinc-200">Payment Link</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-500">1-click WhatsApp</div>
              </div>
            </button>

            <button
              onClick={() => onExecuteTool("apply_grace_period", { days: 7 })}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-2.5 text-left text-xs hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition shadow-sm dark:shadow-none group cursor-pointer"
            >
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold text-slate-800 dark:text-zinc-200">Grace Period</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-500">Extend 7 days access</div>
              </div>
            </button>

            <button
              onClick={() => onExecuteTool("escalate_to_human", { reason: "Customer requested live supervisor" })}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-2.5 text-left text-xs hover:border-rose-500/50 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition shadow-sm dark:shadow-none group cursor-pointer"
            >
              <UserCheck className="h-4 w-4 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition" />
              <div>
                <div className="font-bold text-slate-800 dark:text-zinc-200">Human Transfer</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-500">Warm retention bridge</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Customer Dossier, Live Mic/Input & Conversation Feed (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Customer Intelligence Dossier */}
        <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-sm dark:shadow-none backdrop-blur-xl transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={customer.avatarUrl}
                  alt={customer.name}
                  className="h-12 w-12 rounded-2xl object-cover border border-slate-200 dark:border-zinc-700 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 text-sm">
                  {customer.region === "IN" ? "🇮🇳" : "🇺🇸"}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#0c2340] dark:text-white text-base leading-snug">{customer.name}</h3>
                  <span className="rounded-md bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                    {customer.customerGender === "female" ? "Customer: Female" : "Customer: Male"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{customer.company}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-zinc-300">
                    {customer.subscriptionPlan}
                  </span>
                  <span className="rounded-md bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-mono">
                    {customer.currency === "INR" || customer.region === "IN"
                      ? `₹${Math.round(customer.inrAmount || customer.amount).toLocaleString("en-IN")}`
                      : `$${customer.amount.toFixed(2)}`}/mo
                  </span>
                  {customer.bankName && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                      <Building2 className="h-2.5 w-2.5" />
                      {customer.bankName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-bold">
                Recovery Odds
              </div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {customer.recoveryProbability}%
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-zinc-800/80 pt-3 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[10px] font-medium">Payment Rail & Card</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200 uppercase font-mono">
                {customer.paymentRail === "upi_autopay" ? "UPI Autopay" : `${customer.cardBrand} •••• ${customer.cardLast4} (Exp ${customer.cardExpiry})`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[10px] font-medium">Failure Reason</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 capitalize">
                {customer.failureCode.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-slate-50 dark:bg-zinc-950/70 p-2.5 text-[11px] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800/80">
            <span className="font-bold text-slate-800 dark:text-zinc-300">Autopay Recovery Strategy:</span>{" "}
            {customer.failureReasonHuman}
          </div>
        </div>

        {/* Dograh AI Behavioral Screenplay & Neural Prosody Studio Card */}
        <div className="rounded-3xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4.5 backdrop-blur-xl transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#0066f5] dark:text-[#3395ff]" />
              <h4 className="text-xs font-bold text-[#0c2340] dark:text-blue-100 uppercase tracking-wider">
                Dograh AI Behavioral Screenplay & Prosody Engine
              </h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                {getEmotionProsody().icon} {getEmotionProsody().label}
              </span>
              <span className="rounded-md bg-white dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-bold text-[#0066f5] dark:text-[#3395ff] border border-blue-200 dark:border-blue-800/40">
                {getActiveVoiceModel()}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 bg-white/90 dark:bg-zinc-900/90 p-3.5 rounded-2xl border border-blue-100 dark:border-zinc-800 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">Persona:</span>
                <strong className="text-slate-800 dark:text-white">{getActivePersonaName()}</strong>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  {voiceGender === "female" ? "👩 Female" : "👨 Male"}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Rate: {getEmotionProsody().rate} | Pitch: {getEmotionProsody().pitch}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Target Rails:</span>
                <strong className="text-[#0066f5] dark:text-[#3395ff]">
                  {customer.region === "IN" ? "🇮🇳 India Domestic (UPI Autopay / e-NACH)" : "🇺🇸 US Enterprise (ACH Direct / Stripe)"}
                </strong>
              </div>
            </div>

            {/* Dograh Screenplay Punctuation Behavioral Guide */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800/70 text-[10px]">
              <div className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                <span className="font-mono font-black text-rose-500 bg-rose-100 dark:bg-rose-950/80 px-1 rounded">,</span>
                <span>Micro-pause (200ms)</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                <span className="font-mono font-black text-blue-500 bg-blue-100 dark:bg-blue-950/80 px-1 rounded">.</span>
                <span>Cadence Drop (400ms)</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                <span className="font-mono font-black text-amber-500 bg-amber-100 dark:bg-amber-950/80 px-1 rounded">...</span>
                <span>Empathetic Pause</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                <span className="font-mono font-black text-emerald-500 bg-emerald-100 dark:bg-emerald-950/80 px-1 rounded">?</span>
                <span>Turn-taking Rise</span>
              </div>
            </div>

            <div className="pt-0.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">
                  Generated Screenplay Script (Engine-formatted with Punctuation Prosody):
                </span>
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Tuned for {getActiveVoiceModel()}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed font-sans bg-slate-50 dark:bg-zinc-950/70 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                "{getPreviewScript()}"
              </p>
            </div>
          </div>
        </div>

        {/* Live Conversation Transcript Feed */}
        <div className="flex flex-1 flex-col rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-sm dark:shadow-none backdrop-blur-xl min-h-[420px] transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                Live Conversation Stream
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500">{transcript.length} turns recorded</span>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 py-4 max-h-[300px] pr-1">
            {transcript.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-zinc-500 text-xs">
                <Mic className="h-8 w-8 text-slate-300 dark:text-zinc-700 mb-2" />
                <p className="font-medium text-slate-600 dark:text-zinc-400">
                  Click "Initiate AI Recovery Call" to start the conversation.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-600 mt-1">
                  You can speak naturally using your microphone or type anything below.
                </p>
              </div>
            ) : (
              transcript.map((turn) => (
                <div
                  key={turn.id}
                  className={`flex flex-col ${
                    turn.speaker === "agent"
                      ? "items-start"
                      : turn.speaker === "customer"
                      ? "items-end"
                      : "items-center"
                  }`}
                >
                  {turn.speaker !== "system" ? (
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                        turn.speaker === "agent"
                          ? "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-tl-sm border border-slate-200 dark:border-zinc-700/60"
                          : "bg-[#0066f5] dark:bg-emerald-600 text-white rounded-tr-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-80">
                        <span className="font-bold">
                          {turn.speaker === "agent" ? "Riley (Razorpay Recovery AI)" : customer.name}
                        </span>
                        <span>{turn.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{turn.text}</p>
                    </div>
                  ) : (
                    <div className="w-full rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 p-2 text-center text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                      {turn.text}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Customer Voice / Text Input Box (Real AI Natural Interaction) */}
          <div className="mt-2 border-t border-slate-200 dark:border-zinc-800 pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-[#0066f5] dark:text-[#3395ff] shadow-sm font-bold text-xs"
                title={`Active Language: ${language === "hi" ? "Hindi (हिन्दी)" : "English"}`}
              >
                {language === "hi" ? "🇮🇳" : "🇺🇸"}
              </div>

              <input
                type="text"
                placeholder={
                  isCalling
                    ? language === "hi"
                      ? "अपनी प्रतिक्रिया टाइप करें (उदा. 'सैलरी 7 तारीख को आएगी, तब रिट्राई करना')..."
                      : "Type your natural reply (e.g. 'Can you retry on Friday?')..."
                    : language === "hi"
                    ? "कॉल शुरू करने के लिए ऊपर 'Initiate AI Recovery Call' पर क्लिक करें"
                    : "Initiate call above to start conversation"
                }
                value={userInputText}
                onChange={(e) => setUserInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendCustomerSpeech()
                }}
                disabled={!isCalling || callStatus === "ai_thinking"}
                className="flex-1 rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#0066f5] focus:outline-none disabled:opacity-40"
              />

              <button
                onClick={() => handleSendCustomerSpeech()}
                disabled={!isCalling || !userInputText.trim() || callStatus === "ai_thinking"}
                className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#0066f5] hover:bg-[#0052cc] text-white font-bold transition disabled:opacity-40 cursor-pointer shadow-sm shadow-[#0066f5]/20"
                title={language === "hi" ? "जवाब भेजें" : "Send reply"}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Natural Speech Shortcuts: Bilingual (Hindi & English) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">
                {language === "hi" ? "त्वरित विकल्प (Intents):" : "Test Natural Intent:"}
              </span>

              {language === "hi" ? (
                <>
                  <button
                    onClick={() => handleSendCustomerSpeech("सैलरी 7 तारीख को आएगी, तब रिट्राई कर देना")}
                    disabled={!isCalling}
                    className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition disabled:opacity-30 cursor-pointer"
                  >
                    "सैलरी 7 तारीख को आएगी"
                  </button>
                  <button
                    onClick={() => handleSendCustomerSpeech("व्हाट्सएप पर 1-क्लिक पेमेंट लिंक भेज दो, मैं यूपीआई से भर दूँगा")}
                    disabled={!isCalling}
                    className="rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0066f5] dark:text-[#3395ff] px-2 py-0.5 text-[10px] font-semibold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition disabled:opacity-30 cursor-pointer"
                  >
                    "व्हाट्सएप पर UPI लिंक भेजो"
                  </button>
                  <button
                    onClick={() => handleSendCustomerSpeech("मेरा कार्ड खो गया है, कृपया 7 दिन का समय दें")}
                    disabled={!isCalling}
                    className="rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition disabled:opacity-30 cursor-pointer"
                  >
                    "कार्ड ब्लॉक है / 7 दिन ग्रेस"
                  </button>
                  <button
                    onClick={() => handleSendCustomerSpeech("यह प्लान बहुत महंगा है, किसी सीनियर मैनेजर से बात कराओ")}
                    disabled={!isCalling}
                    className="rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 px-2 py-0.5 text-[10px] font-semibold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition disabled:opacity-30 cursor-pointer"
                  >
                    "महंगा है / मैनेजर से बात"
                  </button>
                </>
              ) : customer.region === "US" ? (
                <>
                  <button
                    onClick={() => handleSendCustomerSpeech("Can you reschedule the autopay retry for this Friday when our next payroll deposits?")}
                    disabled={!isCalling}
                    className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition disabled:opacity-30 cursor-pointer"
                  >
                    "Retry on Friday payroll"
                  </button>
                  <button
                    onClick={() => handleSendCustomerSpeech("Please text me a secure 1-click update link so I can update my card via Apple Pay.")}
                    disabled={!isCalling}
                    className="rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0066f5] dark:text-[#3395ff] px-2 py-0.5 text-[10px] font-semibold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition disabled:opacity-30 cursor-pointer"
                  >
                    "Text secure payment link"
                  </button>
                  <button
                    onClick={() => handleSendCustomerSpeech("Our corporate card was frozen by CFO, please grant a 7-day grace extension.")}
                    disabled={!isCalling}
                    className="rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition disabled:opacity-30 cursor-pointer"
                  >
                    "Corporate card frozen / 7-day grace"
                  </button>
                  <button
                    onClick={() => handleSendCustomerSpeech("We are reviewing our SaaS vendor spend, please connect me with a billing supervisor.")}
                    disabled={!isCalling}
                    className="rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 px-2 py-0.5 text-[10px] font-semibold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition disabled:opacity-30 cursor-pointer"
                  >
                    "Transfer to supervisor"
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleSendCustomerSpeech("Can you retry charging my account on the 7th after salary?")}
                    disabled={!isCalling}
                    className="rounded-lg bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 text-[10px] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition border border-slate-200 dark:border-zinc-700/50 disabled:opacity-30 cursor-pointer font-medium"
                  >
                    "Retry on salary date"
                  </button>
                  <button
                    onClick={() => handleSendCustomerSpeech("Can you dispatch a 1-click WhatsApp payment link for UPI payment?")}
                    disabled={!isCalling}
                    className="rounded-lg bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 text-[10px] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition border border-slate-200 dark:border-zinc-700/50 disabled:opacity-30 cursor-pointer font-medium"
                  >
                    "Send WhatsApp UPI link"
                  </button>
                  <button
                    onClick={() => handleSendCustomerSpeech("My card was temporarily blocked, please apply a 7-day grace period.")}
                    disabled={!isCalling}
                    className="rounded-lg bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 text-[10px] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition border border-slate-200 dark:border-zinc-700/50 disabled:opacity-30 cursor-pointer font-medium"
                  >
                    "Card re-issue / Grace period"
                  </button>
                  <button
                    onClick={() => handleSendCustomerSpeech("This plan is over budget for us, please connect me to our account manager.")}
                    disabled={!isCalling}
                    className="rounded-lg bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 text-[10px] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition border border-slate-200 dark:border-zinc-700/50 disabled:opacity-30 cursor-pointer font-medium"
                  >
                    "Pricing dispute / Escalate"
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VAPI REAL MOBILE PHONE CALL CONFIGURATION MODAL */}
      {showVapiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#eef6ff] dark:bg-emerald-500/10 p-2 text-[#0066f5] dark:text-emerald-400">
                  <Radio className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0c2340] dark:text-white text-base">Vapi Live Outbound Call Bridge</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Call your personal phone number using Vapi</p>
                </div>
              </div>
              <button
                onClick={() => setShowVapiModal(false)}
                className="rounded-xl bg-slate-100 dark:bg-zinc-900 p-2 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Your Mobile Number (E.164 format)</label>
                <input
                  type="text"
                  placeholder="+9198XXXXXXXX or +1XXXXXXXXXX"
                  value={targetRealPhone}
                  onChange={(e) => setTargetRealPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-2.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#0066f5] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 block">
                  Per the prompt: "Use only a number you control or have explicit permission to call."
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Vapi Private API Key</label>
                <input
                  type="password"
                  placeholder="vapi_private_..."
                  value={vapiApiKey}
                  onChange={(e) => setVapiApiKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-2.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#0066f5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Vapi Phone Number ID</label>
                <input
                  type="text"
                  placeholder="Vapi registered Phone Number UUID"
                  value={vapiPhoneNumberId}
                  onChange={(e) => setVapiPhoneNumberId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-2.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#0066f5] focus:outline-none"
                />
              </div>

              {vapiCallStatus && (
                <div className="rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 text-[11px] font-mono text-[#0066f5] dark:text-emerald-400 font-semibold">
                  {vapiCallStatus}
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-zinc-800 pt-3">
              <button
                onClick={() => setShowVapiModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleDispatchVapiPhoneCall}
                disabled={isDispatchingVapi}
                className="flex items-center gap-1.5 rounded-xl bg-[#0066f5] hover:bg-[#0052cc] px-4 py-2 text-xs font-bold text-white transition shadow-md shadow-[#0066f5]/25 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5" />
                {isDispatchingVapi ? "Connecting to Carrier..." : "Dial My Phone Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VAPI WEBRTC LIVE STT/TTS ENGINE CONFIGURATION MODAL */}
      {showVapiConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-[#eef6ff] dark:bg-[#3395ff]/15 p-2 text-[#0066f5] dark:text-[#3395ff]">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0c2340] dark:text-white text-base">
                    Vapi Voice Engine Setup
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Powers Deepgram nova-2 (STT) & ElevenLabs Rachel (TTS)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVapiConfigModal(false)}
                className="rounded-xl bg-slate-100 dark:bg-zinc-900 p-2 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-[#3395ff]/30 bg-blue-50/60 dark:bg-[#0066f5]/10 p-3.5 space-y-1.5">
                <div className="font-bold text-[#0066f5] dark:text-[#3395ff] flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Dual Telephony & WebRTC Pipeline
                </div>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                  Connecting your Vapi Public Key enables real-time <strong>Deepgram nova-2</strong> for low-latency speech recognition and <strong>ElevenLabs Rachel</strong> for ultra-realistic neural speech synthesis directly in your browser.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Vapi Public Key (Client SDK)
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="pk_live_... or pk_test_..."
                    value={vapiPublicKey}
                    onChange={(e) => setVapiPublicKey(e.target.value.trim())}
                    className="w-full rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 pl-9 pr-3 py-2.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#0066f5] focus:outline-none font-mono text-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                  Available in your <a href="https://dashboard.vapi.ai" target="_blank" rel="noreferrer" className="text-[#0066f5] underline">Vapi Dashboard</a> under Account → API Keys.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 p-2.5 bg-slate-50 dark:bg-zinc-900/60">
                  <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">STT Model</span>
                  <span className="font-bold text-[#0c2340] dark:text-white">Deepgram nova-2</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">&lt;300ms live stream</span>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 p-2.5 bg-slate-50 dark:bg-zinc-900/60">
                  <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">TTS Voice</span>
                  <span className="font-bold text-[#0c2340] dark:text-white">ElevenLabs Rachel</span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 block">Empathetic retention tone</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-3">
              <button
                onClick={() => {
                  setEngineMode("dograh")
                  setShowVapiConfigModal(false)
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white underline cursor-pointer"
              >
                Use Dograh + Pipecat (Self-Hosted) instead
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVapiConfigModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.setItem("vapi_public_key", vapiPublicKey)
                    }
                    setShowVapiConfigModal(false)
                    if (vapiPublicKey) {
                      startCall()
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0066f5] hover:bg-[#0052cc] px-4 py-2 text-xs font-bold text-white transition shadow-md shadow-[#0066f5]/25 active:scale-95 cursor-pointer"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
