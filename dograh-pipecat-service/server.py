import os
import json
import asyncio
import re
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import edge_tts

app = FastAPI(
    title="Dograh + Pipecat Voice Agent Service",
    description="Self-Hosted Multilingual & Emotion-Aware Voice Recovery Engine with Punctuation Prosody (Hindi & English)",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dograh AI Voice Matrix & Emotion Profiles
# Implements "Write for the Ear" Screenplay Punctuation and Behavioral Prosody
EMOTION_PROFILES = {
    "empathetic": {
        "rate": "-4%",
        "pitch": "+2Hz",
        "description": "Warm, gentle cadence with thoughtful pauses for distressed customers",
        "tag": "💖 Empathetic & Caring",
        "voices": {
            "hi": {"female": "hi-IN-SwaraNeural", "male": "hi-IN-MadhurNeural"},
            "en_in": {"female": "en-IN-NeerjaNeural", "male": "en-IN-PrabhatNeural"},
            "en_us": {"female": "en-US-AriaNeural", "male": "en-US-GuyNeural"},
        }
    },
    "reassuring": {
        "rate": "+0%",
        "pitch": "-1Hz",
        "description": "Confident, grounded, solution-oriented delivery with clear resolution periods",
        "tag": "🤝 Reassuring & Grounded",
        "voices": {
            "hi": {"female": "hi-IN-SwaraNeural", "male": "hi-IN-MadhurNeural"},
            "en_in": {"female": "en-IN-NeerjaNeural", "male": "en-IN-PrabhatNeural"},
            "en_us": {"female": "en-US-JennyNeural", "male": "en-US-GuyNeural"},
        }
    },
    "de_escalating": {
        "rate": "-6%",
        "pitch": "-2Hz",
        "description": "Patient, low-pitch, deliberate soothing pauses for objections and disputes",
        "tag": "🛡️ De-escalating & Patient",
        "voices": {
            "hi": {"female": "hi-IN-SwaraNeural", "male": "hi-IN-MadhurNeural"},
            "en_in": {"female": "en-IN-NeerjaNeural", "male": "en-IN-PrabhatNeural"},
            "en_us": {"female": "en-US-AriaNeural", "male": "en-US-GuyNeural"},
        }
    },
    "professional": {
        "rate": "+2%",
        "pitch": "+0Hz",
        "description": "Crisp, polite enterprise tone with structured pauses",
        "tag": "👔 Professional & Concise",
        "voices": {
            "hi": {"female": "hi-IN-SwaraNeural", "male": "hi-IN-MadhurNeural"},
            "en_in": {"female": "en-IN-NeerjaNeural", "male": "en-IN-PrabhatNeural"},
            "en_us": {"female": "en-US-JennyNeural", "male": "en-US-GuyNeural"},
        }
    }
}

def resolve_voice(
    language: str = "hi",
    gender: str = "female",
    region: str = "IN",
    emotion: str = "empathetic"
) -> str:
    """
    Resolves the exact neural voice model matching language, gender, regional accent, and emotional style.
    """
    g = "male" if gender.lower() == "male" else "female"
    lang = language.lower()
    reg = region.upper()
    emo = emotion.lower() if emotion.lower() in EMOTION_PROFILES else "empathetic"

    profile = EMOTION_PROFILES[emo]
    if lang == "hi":
        return profile["voices"]["hi"][g]
    elif reg == "US":
        return profile["voices"]["en_us"][g]
    else:
        return profile["voices"]["en_in"][g]

def get_agent_persona(gender: str = "female", region: str = "IN") -> Dict[str, str]:
    is_male = gender.lower() == "male"
    is_us = region.upper() == "US"

    if is_us:
        name = "Alex" if is_male else "Sarah"
    else:
        name = "रोहन (Rohan)" if is_male else "रिया (Riya)"

    return {
        "name": name,
        "first_name": "Alex" if is_us and is_male else ("Sarah" if is_us else ("Rohan" if is_male else "Riya")),
        "gender": "male" if is_male else "female",
        "region": "US" if is_us else "IN",
    }

# In-memory session store
sessions: Dict[str, Dict[str, Any]] = {}

class SessionInitRequest(BaseModel):
    customer_id: str
    customer_name: str
    company: str
    subscription_plan: str
    amount: float
    currency: str = "INR"
    failure_reason: str
    card_brand: str
    card_last4: str
    bank_name: Optional[str] = None
    language: str = "en"        # "en" or "hi"
    voice_gender: str = "female" # "female" or "male"
    region: str = "IN"          # "IN" or "US"
    customer_gender: Optional[str] = None
    emotion: str = "empathetic" # "empathetic", "reassuring", "professional", "de_escalating"

class TurnRequest(BaseModel):
    session_id: str
    message: str
    customer_name: Optional[str] = None
    language: Optional[str] = None
    voice_gender: Optional[str] = None
    region: Optional[str] = None
    emotion: Optional[str] = None
    amount: Optional[float] = None

class ToolExecutionResult(BaseModel):
    tool_name: str
    params: Dict[str, Any]
    status: str = "executed"

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "dograh-pipecat-voice-agent",
        "pipecat_engine": "active",
        "dograh_integration": "enabled",
        "supported_languages": ["en", "hi"],
        "emotion_profiles": {k: v["tag"] for k, v in EMOTION_PROFILES.items()},
        "self_hosted": True
    }

@app.post("/api/v1/voice/session")
async def create_voice_session(req: SessionInitRequest):
    session_id = f"session_{req.customer_id}_{int(asyncio.get_event_loop().time() * 1000)}"
    lang = req.language.lower() if req.language in ["hi", "en"] else "en"
    gender = "male" if req.voice_gender.lower() == "male" else "female"
    is_male = gender == "male"
    region = "US" if req.region.upper() == "US" else "IN"
    emotion = req.emotion.lower() if req.emotion.lower() in EMOTION_PROFILES else "empathetic"
    persona = get_agent_persona(gender, region)
    bank_display = req.bank_name or ("HDFC Bank" if region == "IN" else "JPMorgan Chase")

    # Resolve specific neural voice model for emotion + gender + region
    selected_voice = resolve_voice(lang, gender, region, emotion)
    profile = EMOTION_PROFILES[emotion]

    # Dograh "Write for the Ear" Screenplay Construction:
    # Deliberate commas for micro-pauses (150-250ms), ellipses for reflective breath, full stops for downward cadence.
    if lang == "hi":
        verb = "बात कर रहा हूँ" if gender == "male" else "बात कर रही हूँ"
        agent_name = "रोहन" if gender == "male" else "रिया"
        
        if emotion == "empathetic":
            greeting = (
                f"नमस्ते {req.customer_name} जी, चिंता की कोई बात नहीं है... "
                f"मैं रेज़रपे रिकवरएआई से {agent_name} {verb}। "
                f"आपके {req.company} के {req.subscription_plan} का ₹{int(req.amount):,} का {bank_display} ऑटोपे पेमेंट "
                f"'{req.failure_reason}' के कारण पूरा नहीं हो पाया। "
                f"आपकी सेवा बिना किसी रुकावट के चालू रहे, इसके लिए क्या हम सैलरी आने के बाद पेमेंट रिट्राई शेड्यूल करें, "
                f"या आपको व्हाट्सएप पर तुरंत 1-क्लिक यूपीआई लिंक भेजें?"
            )
        elif emotion == "reassuring":
            greeting = (
                f"नमस्ते {req.customer_name} जी! मैं रेज़रपे रिकवरएआई से {agent_name} {verb}। "
                f"आपके {req.company} का ₹{int(req.amount):,} का ऑटोपे पेमेंट अभी पेन्डिंग है। "
                f"आप निश्चिंत रहें, आपका खाता पूरी तरह सुरक्षित है। "
                f"क्या हम सैलरी क्रेडिट के बाद ऑटोपे शेड्यूल करें, या आप 1-क्लिक यूपीआई लिंक से अभी भुगतान करना चाहेंगे?"
            )
        elif emotion == "de_escalating":
            verb_understand = "समझता हूँ" if is_male else "समझती हूँ"
            greeting = (
                f"नमस्ते {req.customer_name} जी, मैं रेज़रपे रिकवरएआई से {agent_name} {verb}... "
                f"मैं {verb_understand} कि आपके {bank_display} ऑटोपे पर अप्रत्याशित समस्या आई है। "
                f"हम आपकी सेवा को तुरंत सुचारू करने के लिए यहाँ हैं। क्या आप इस पर बात करने के लिए 1 मिनट का समय दे सकते हैं?"
            )
        else: # professional
            greeting = (
                f"नमस्ते {req.customer_name} जी. मैं रेज़रपे रिकवरएआई से {agent_name} {verb}. "
                f"आपके {req.company} के {req.subscription_plan} का ₹{int(req.amount):,} का ऑटोपे पेमेंट पेन्डिंग है. "
                f"क्या हम सैलरी डेट पर रिट्राई शेड्यूल करें, या व्हाट्सएप पर पेमेंट लिंक भेजें?"
            )
    else:
        first_name = persona["first_name"]
        if region == "US":
            if emotion == "empathetic":
                greeting = (
                    f"Hi {req.customer_name}, please don't worry... "
                    f"This is {first_name} from Razorpay RecoverAI. "
                    f"I'm calling regarding your {req.company} {req.subscription_plan} renewal of ${req.amount:,.2f} on your {bank_display} account, "
                    f"which ran into a temporary issue due to '{req.failure_reason}'. "
                    f"To make sure your team has zero service interruption, would you like to schedule an automated retry on this Friday's payroll date, "
                    f"or may I text you a secure 1-click update link?"
                )
            elif emotion == "reassuring":
                greeting = (
                    f"Hi {req.customer_name}! This is {first_name} from Razorpay RecoverAI. "
                    f"Rest assured, your {req.company} account and access are completely safe. "
                    f"Your ${req.amount:,.2f} renewal on {bank_display} had a brief autopay decline. "
                    f"Shall we schedule a retry for your upcoming payroll date, or text a 1-click payment link?"
                )
            elif emotion == "de_escalating":
                greeting = (
                    f"Hello {req.customer_name}, this is {first_name} from Razorpay RecoverAI... "
                    f"I understand billing notices can be frustrating, especially with enterprise renewals. "
                    f"I'm here to ensure everything is resolved smoothly for {req.company}. Do you have a quick moment?"
                )
            else: # professional
                greeting = (
                    f"Hello {req.customer_name}, this is {first_name} from Razorpay RecoverAI. "
                    f"Reaching out regarding your {req.company} renewal of ${req.amount:,.2f} via {bank_display}, "
                    f"which was declined due to '{req.failure_reason}'. "
                    f"Would you prefer scheduling an automated retry for Friday payroll, or a secure 1-click SMS link?"
                )
        else: # India English
            if emotion == "empathetic":
                greeting = (
                    f"Hello {req.customer_name}, please don't worry... "
                    f"This is {first_name} from Razorpay RecoverAI. "
                    f"I'm reaching out regarding your {req.company} {req.subscription_plan} renewal of ₹{int(req.amount):,} on {bank_display}, "
                    f"which had an autopay issue due to '{req.failure_reason}'. "
                    f"To keep your account active without interruption, would you like to schedule an automatic retry on your salary date, "
                    f"or shall I dispatch a secure 1-click WhatsApp payment link?"
                )
            elif emotion == "reassuring":
                greeting = (
                    f"Hello {req.customer_name}! This is {first_name} from Razorpay RecoverAI. "
                    f"Rest assured, your subscription is completely protected. "
                    f"We noticed a pending autopay charge of ₹{int(req.amount):,} on your {bank_display} account. "
                    f"Would you prefer a retry on your upcoming salary date, or a 1-click WhatsApp link right now?"
                )
            elif emotion == "de_escalating":
                greeting = (
                    f"Hello {req.customer_name}, this is {first_name} from Razorpay RecoverAI... "
                    f"I understand an unexpected payment decline on your {bank_display} autopay can be disruptive. "
                    f"I'm here to ensure everything is resolved quickly and smoothly. Do you have a quick moment?"
                )
            else: # professional
                greeting = (
                    f"Hello {req.customer_name}, this is {first_name} from Razorpay RecoverAI. "
                    f"Calling regarding your {req.company} renewal of ₹{int(req.amount):,} via {bank_display}, "
                    f"which was paused due to '{req.failure_reason}'. "
                    f"Would you prefer scheduling a retry on your salary date, or a 1-click WhatsApp link?"
                )

    sessions[session_id] = {
        "session_id": session_id,
        "customer": req.model_dump(),
        "language": lang,
        "voice_gender": gender,
        "region": region,
        "emotion": emotion,
        "voice": selected_voice,
        "persona": persona,
        "history": [
            {"role": "agent", "text": greeting}
        ]
    }

    return {
        "session_id": session_id,
        "language": lang,
        "voice_gender": gender,
        "region": region,
        "emotion": emotion,
        "greeting": greeting,
        "voice": selected_voice,
        "persona": persona,
        "prosody": {"rate": profile["rate"], "pitch": profile["pitch"]},
        "tts_url": f"/api/v1/voice/tts?text={json.dumps(greeting)}&lang={lang}&gender={gender}&region={region}&emotion={emotion}"
    }

@app.get("/api/v1/voice/tts")
async def stream_tts(
    text: str = Query(...),
    lang: str = Query("en"),
    gender: str = Query("female"),
    region: str = Query("IN"),
    emotion: str = Query("empathetic")
):
    """
    Real-time speech synthesis for Hindi and English with Gender, Regional accent, and Emotional prosody (rate & pitch).
    """
    clean_text = text.strip('"')
    voice_name = resolve_voice(lang, gender, region, emotion)
    profile = EMOTION_PROFILES.get(emotion.lower(), EMOTION_PROFILES["empathetic"])
    rate = profile["rate"]
    pitch = profile["pitch"]
    
    try:
        communicate = edge_tts.Communicate(clean_text, voice_name, rate=rate, pitch=pitch)
        
        async def audio_stream():
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]

        return StreamingResponse(audio_stream(), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS synthesis error: {str(e)}")

@app.post("/api/v1/voice/turn")
async def process_voice_turn(turn: TurnRequest):
    """
    Processes customer voice input in English or Hindi,
    runs emotion-aware, gender-aware, and punctuation-crafted intent recognition.
    """
    session = sessions.get(turn.session_id)
    lang = turn.language or (session.get("language") if session else "en") or "en"
    gender = turn.voice_gender or (session.get("voice_gender") if session else "female") or "female"
    region = turn.region or (session.get("region") if session else "IN") or "IN"
    emotion = turn.emotion or (session.get("emotion") if session else "empathetic") or "empathetic"
    
    is_male = gender.lower() == "male"
    is_us = region.upper() == "US"
    persona = get_agent_persona(gender, region)

    customer = session["customer"] if session else {
        "customer_name": turn.customer_name or "Subscriber",
        "company": "Enterprise SaaS",
        "subscription_plan": "Growth Tier",
        "amount": turn.amount or (4999 if not is_us else 199.0),
        "currency": "INR" if not is_us else "USD",
        "card_brand": "Visa",
        "card_last4": "4242",
        "bank_name": "HDFC Bank" if not is_us else "JPMorgan Chase"
    }

    user_text = turn.message.lower()
    tool_call = None
    reply_text = ""

    # Detect Hindi script
    is_hindi = lang == "hi" or bool(re.search(r'[\u0900-\u097F]', turn.message))
    actual_lang = "hi" if is_hindi else "en"

    # Intent 1: Schedule Retry / Salary Date / Payroll Date (सैलरी / रिट्राई)
    if any(k in user_text for k in ["salary", "payroll", "retry", "friday", "monday", "later", "date", "सैलरी", "तारीख", "वेतन", "बाद में", "रिट्राई", "कल"]):
        target_date = "2026-10-07"
        turn_emotion = "reassuring"
        tool_call = {
            "name": "schedule_payment_retry",
            "params": {"targetDate": target_date}
        }
        if actual_lang == "hi":
            help_verb = "सहायता कर सकती हूँ" if not is_male else "सहायता कर सकता हूँ"
            reply_text = (
                f"बहुत बढ़िया, {customer['customer_name']} जी! मैंने आपका पेमेंट रिट्राई {target_date} के लिए शेड्यूल कर दिया है। "
                f"तब तक आपका सब्सक्रिप्शन पूरी तरह से चालू रहेगा... क्या मैं आपकी और कोई {help_verb}?"
            )
        else:
            if is_us:
                reply_text = (
                    f"Sounds great, {customer['customer_name']}! I've rescheduled the automated payment retry for {target_date}, matching your payroll cycle. "
                    f"Your account and team access will remain fully uninterrupted. Is there anything else I can assist with?"
                )
            else:
                reply_text = (
                    f"Perfect, {customer['customer_name']}! I have scheduled an automatic autopay retry for {target_date} matching your salary cycle. "
                    f"Your subscription will remain completely active in the meantime... Can I help with anything else?"
                )

    # Intent 2: Send Payment Link / WhatsApp / SMS / UPI (व्हाट्सएप / लिंक)
    elif any(k in user_text for k in ["link", "whatsapp", "sms", "text", "pay now", "upi", "qr", "लिंक", "व्हाट्सएप", "पेमेंट", "भेज", "अभी"]):
        channel = "sms" if is_us else "whatsapp"
        turn_emotion = "reassuring"
        tool_call = {
            "name": "send_payment_link",
            "params": {"channel": channel}
        }
        if actual_lang == "hi":
            reply_text = (
                f"जी बिल्कुल, {customer['customer_name']} जी! मैंने आपके रजिस्टर्ड मोबाइल नंबर पर व्हाट्सएप के माध्यम से 1-क्लिक सुरक्षित पेमेंट लिंक भेज दिया है। "
                f"आप उस पर टैप करके Google Pay, PhonePe, Paytm या किसी अन्य कार्ड से ₹{int(customer['amount']):,} का भुगतान कर सकते हैं।"
            )
        else:
            if is_us:
                reply_text = (
                    f"Done! I have instantly dispatched a secure 1-click Razorpay payment link directly to your mobile via SMS. "
                    f"You can settle the ${customer['amount']:,.2f} balance via Apple Pay, credit card, or ACH to keep everything active."
                )
            else:
                reply_text = (
                    f"Certainly, {customer['customer_name']}! I have instantly dispatched a 1-click Razorpay payment link to your WhatsApp. "
                    f"You can pay seamlessly via UPI (Google Pay, PhonePe, Paytm) or an alternate card to resume services immediately."
                )

    # Intent 3: Card Stolen / Grace Period (कार्ड खो गया / ग्रेस पीरियड)
    elif any(k in user_text for k in ["stolen", "lost", "expired", "grace", "time", "block", "freeze", "खो गया", "चोरी", "ग्रेस", "समय", "एक्सपायर", "बंद"]):
        turn_emotion = "empathetic"
        tool_call = {
            "name": "apply_grace_period",
            "params": {"days": 7}
        }
        if actual_lang == "hi":
            reply_text = (
                f"मुझे यह जानकर खेद हुआ, {customer['customer_name']} जी... चिंता मत कीजिए। मैंने आपके अकाउंट पर तुरंत 7 दिनों का ग्रेस पीरियड लागू कर दिया है। "
                f"इस दौरान आपकी कोई भी सेवा बंद नहीं होगी... जब आपका नया कार्ड आ जाए, तो आप उसे आसानी से अपडेट कर सकते हैं।"
            )
        else:
            reply_text = (
                f"I completely understand, {customer['customer_name']}... and I'm sorry to hear about the card issue. "
                f"I have applied an immediate 7-day grace extension to your account, so you won't face any downtime while your replacement card arrives."
            )

    # Intent 4: Price Dispute / Human Escalation (महंगा / कैंसल / बात कराओ)
    elif any(k in user_text for k in ["expensive", "cancel", "manager", "human", "supervisor", "discount", "महंगा", "कैंसल", "बात", "मैनेजर", "छूट"]):
        turn_emotion = "de_escalating"
        tool_call = {
            "name": "escalate_to_human",
            "params": {"reason": "Customer pricing discussion or cancellation request"}
        }
        if actual_lang == "hi":
            understand_verb = "समझती हूँ" if not is_male else "समझता हूँ"
            connect_verb = "कर रही हूँ" if not is_male else "कर रहा हूँ"
            reply_text = (
                f"मैं आपकी बात पूरी तरह {understand_verb}, {customer['customer_name']} जी... हम आपकी सदस्यता को बहुत महत्व देते हैं। "
                f"मैं अभी आपको हमारे वरिष्ठ कस्टमर सक्सेस मैनेजर से कनेक्ट {connect_verb}, जो आपको स्पेशल लॉयल्टी डिस्काउंट या प्लान बदलाव में मदद करेंगे।"
            )
        else:
            reply_text = (
                f"I completely hear you, {customer['customer_name']}, and I understand your concern... Because you are a valued subscriber, "
                f"I am transferring this call right now to our Senior Account Specialist, who can review loyalty discounts and custom plan tiers for you."
            )

    # Default Intent: Polite Reassurance & Clarification
    else:
        turn_emotion = emotion
        if actual_lang == "hi":
            reply_text = (
                f"जी {customer['customer_name']} जी, आपके {customer['subscription_plan']} का ऑटोपे पेमेंट अभी पेन्डिंग है... "
                f"आप चाहें तो मैं इसे सैलरी क्रेडिट के बाद के लिए रीशेड्यूल कर सकती/सकता हूँ, या व्हाट्सएप पर पेमेंट लिंक भेज सकती/सकता हूँ। आप क्या पसंद करेंगे?"
            )
        else:
            if is_us:
                reply_text = (
                    f"Understood, {customer['customer_name']}. Your {customer['subscription_plan']} renewal is currently on hold. "
                    f"I can either reschedule the charge for your next payroll, or text you a 1-click secure link... Which works best for you?"
                )
            else:
                reply_text = (
                    f"Understood, {customer['customer_name']}. Your {customer['subscription_plan']} renewal is currently on hold. "
                    f"I can either reschedule the charge for a future date, or send a 1-click WhatsApp link... Which option works best for you?"
                )

    selected_voice = resolve_voice(actual_lang, gender, region, turn_emotion)
    profile = EMOTION_PROFILES[turn_emotion]

    if session:
        session["history"].append({"role": "customer", "text": turn.message})
        session["history"].append({"role": "agent", "text": reply_text})

    return {
        "reply": reply_text,
        "language": actual_lang,
        "voice_gender": gender,
        "region": region,
        "emotion": turn_emotion,
        "tool_call": tool_call,
        "voice": selected_voice,
        "persona": persona,
        "prosody": {"rate": profile["rate"], "pitch": profile["pitch"]},
        "tts_url": f"/api/v1/voice/tts?text={json.dumps(reply_text)}&lang={actual_lang}&gender={gender}&region={region}&emotion={turn_emotion}"
    }

# Real-time WebSocket Pipecat pipeline
@app.websocket("/ws/pipecat")
async def websocket_pipecat_pipeline(websocket: WebSocket):
    await websocket.accept()
    try:
        session_id = f"ws_pipe_{int(asyncio.get_event_loop().time() * 1000)}"
        await websocket.send_json({
            "type": "connection_ack",
            "session_id": session_id,
            "engine": "pipecat-edge-neural",
            "message": "Connected to Dograh Pipecat Multilingual & Emotion-Aware Voice Recovery Engine"
        })
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            if payload.get("type") == "user_transcript":
                user_msg = payload.get("text", "")
                lang = payload.get("language", "en")
                gender = payload.get("voice_gender", "female")
                region = payload.get("region", "IN")
                emotion = payload.get("emotion", "empathetic")
                res = await process_voice_turn(TurnRequest(
                    session_id=session_id,
                    message=user_msg,
                    language=lang,
                    voice_gender=gender,
                    region=region,
                    emotion=emotion
                ))
                await websocket.send_json({
                    "type": "agent_reply",
                    "reply": res["reply"],
                    "tool_call": res["tool_call"],
                    "voice": res["voice"],
                    "emotion": res["emotion"],
                    "tts_url": res["tts_url"]
                })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
