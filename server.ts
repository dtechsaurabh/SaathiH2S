import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
  classifyMessageSafety,
  normalizeScamResult,
  validateScamInput,
} from "./src/utils/aiSafety";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with request size limit for security
app.use(express.json({ limit: "1mb" }));

// In-memory rate limiting map (IP -> count, resetTime)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || "client";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: "Too many requests. Please wait a moment and try again.",
      retryAfterMs: entry.resetTime - now,
    });
  }

  entry.count++;
  return next();
}

app.use("/api/saathi", rateLimiter);

// Clean up stale rate-limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Lazy-initialized Gemini client with required User-Agent header
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Utility to run an async operation with timeout
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 18000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("Request timed out. Please try again."));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// Helper: Sanitize string input
function sanitizeText(input: unknown, maxLen = 4000): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, maxLen);
}

// ==========================================
// 1. CHAT COMPANION SYSTEM PROMPT & FALLBACK
// ==========================================
const SENIOR_COMPANION_SYSTEM_PROMPT = `
You are "Saathi" (साथी), a compassionate, respectful, patient, and clear AI companion specifically designed for senior citizens.

Strict Persona & Behavior Rules:
1. Respect & Tone: Always address the elder with high respect ("आप", "आदरणीय" in Hindi; warm, polite, attentive in English).
2. Simplicity & Clarity: Use plain, everyday language. Avoid jargon (never use words like "authentication token", "hyperlink", "URL redirect", "cryptographic"). Use simple terms like "नीला लिंक" (blue link), "गोपनीय कोड" (secret code).
3. Small, Bite-Sized Steps: Break any task into 2 to 4 gentle, numbered steps. Never present dense blocks of text.
4. Clarification Questions: When the user makes a brief or open statement (e.g., "Mujhe kal doctor ke paas jana hai"), acknowledge warmly, offer to prepare them, and ask an essential clarification question (e.g., "Bilkul. Aapki doctor appointment ke liye main aapko prepare kar sakta hoon. Appointment ka time kya hai ya kis doctor ko dikhana hai?").
5. Honesty & Boundaries:
   - NEVER pretend to perform real-world actions you cannot actually perform (e.g., DO NOT claim "I have booked your doctor appointment" or "I have paid your electricity bill").
   - Clearly distinguish between information/guidance and completed real-world actions. Remind them gently that you are preparing notes or checklists for them to use.
6. Safety & Care:
   - Never ask for OTP, passwords, bank numbers, or ATM PINs.
   - For medical questions: remind them to consult their certified physician for actual diagnoses or dosage changes.
`;

function getEmpatheticFallback(message: string, language: string = "hi") {
  const lower = message.toLowerCase();

  if (lower.includes("doctor") || lower.includes("डॉक्टर") || lower.includes("hospital") || lower.includes("appointment") || lower.includes("bimar")) {
    if (language === "en") {
      return {
        reply: "Certainly. I can help you thoroughly prepare for your doctor's appointment so you feel relaxed and ready.",
        clarificationQuestion: "What time is your appointment, and which doctor or clinic are you visiting?",
        steps: [
          "Gather your previous prescriptions, current medicine strips, and recent lab test files.",
          "Write down any symptoms, pain areas, or questions on a note paper.",
          "Arrange your travel in advance and arrive 15 minutes early.",
        ],
        precautions: [
          "Take morning medicines as usual unless the doctor advised fasting.",
          "Saathi helps you prepare checklists, but does not book hospital slots directly.",
        ],
      };
    } else {
      return {
        reply: "बिल्कुल। आपकी डॉक्टर अपॉइंटमेंट के लिए मैं आपको पूरी तरह तैयार करवा सकता हूँ।",
        clarificationQuestion: "आपकी अपॉइंटमेंट का समय क्या है और आप किस डॉक्टर से मिलने जा रहे हैं?",
        steps: [
          "पुरानी डॉक्टर की पर्ची और हालिया ब्लड टेस्ट रिपोर्ट एक फ़ाइल में रख लें।",
          "वर्तमान में चल रही दवाइयों का पत्ता साथ रखें ताकि डॉक्टर सही पावर देख सकें।",
          "अपनी तकलीफें या जो सवाल पूछने हैं, उन्हें एक कागज़ पर लिख लें।",
        ],
        precautions: [
          "अगर खाली पेट जाने की सलाह नहीं दी गई है, तो हल्का नाश्ता ज़रूर करके जाएं।",
          "साथी आपकी तैयारी में मदद करता है, लेकिन सीधे अस्पताल में बुकिंग नहीं करता।",
        ],
      };
    }
  }

  if (lower.includes("scam") || lower.includes("fraud") || lower.includes("bill") || lower.includes("bijli") || lower.includes("otp") || lower.includes("bank") || lower.includes("कट") || lower.includes("lottery")) {
    if (language === "en") {
      return {
        reply: "⚠️ Warning: This message shows signs commonly associated with scams. Please stay calm and do not panic.",
        steps: [
          "Do NOT click any suspicious links in this message.",
          "NEVER share your OTP, ATM PIN, or banking passwords with anyone.",
          "Electricity departments and banks NEVER disconnect services immediately via private phone numbers.",
          "Verify the bill status directly using your official electricity consumer portal or visit the local office.",
        ],
        precautions: [
          "National Cyber Crime Helpline is 1930. You can call them anytime if you suspect fraud.",
        ],
      };
    } else {
      return {
        reply: "⚠️ चेतावनी: यह संदेश धोखाधड़ी (Scam) से जुड़े लक्षणों को दर्शाता है। घबराएं बिल्कुल नहीं!",
        steps: [
          "संदेश में दिए गए किसी भी अनजान नीले लिंक पर क्लिक न करें।",
          "फोन पर किसी को भी अपना OTP, एटीएम पिन या बैंक पासवर्ड न दें।",
          "बिजली विभाग या बैंक कभी भी किसी निजी मोबाइल नंबर से अचानक सेवा बंद करने की धमकी नहीं देते।",
          "बिजली बिल की स्थिति जानने के लिए आधिकारिक रसीद देखें या नजदीकी दफ्तर संपर्क करें।",
        ],
        precautions: [
          "राष्ट्रीय साइबर अपराध हेल्पलाइन 1930 है। किसी भी संशय पर तुरंत 1930 पर संपर्क करें।",
        ],
      };
    }
  }

  // Default senior response
  if (language === "en") {
    return {
      reply: "Namaste! I am Saathi, your personal digital companion. I am right here to help you in simple, comfortable steps.",
      clarificationQuestion: "How can I help you today? Would you like help with a doctor visit, medicines, or checking a message?",
      steps: [
        "Doctor Appointment: I will prepare your reports checklist and questions to ask.",
        "Scam Checker: Paste any suspicious SMS or WhatsApp to check safety.",
        "Document Explainer: Understand official pension or medical papers simply.",
      ],
      precautions: [
        "Saathi will never ask for your passwords or OTPs.",
      ],
    };
  } else {
    return {
      reply: "नमस्ते! मैं साथी (Saathi) हूँ — आपका अपना डिजिटल मित्र। मैं आपकी सहायता के लिए उपस्थित हूँ।",
      clarificationQuestion: "आज मैं आपकी किस प्रकार मदद करूँ? क्या आप डॉक्टर से मिलने की तैयारी, दवाइयाँ या कोई मैसेज चेक करना चाहते हैं?",
      steps: [
        "डॉक्टर अपॉइंटमेंट: कागज़ात की चेकलिस्ट और पूछने वाले सवाल तैयार करें।",
        "स्कैम चेकर: किसी भी अनजान SMS या WhatsApp मैसेज की सच्चाई जानें।",
        "कागज़ात समझें: पेंशन, जीवन प्रमाण पत्र या अस्पताल बिल को सरल शब्दों में समझें।",
      ],
      precautions: [
        "साथी कभी भी आपसे आपका बैंक पासवर्ड या OTP नहीं मांगता।",
      ],
    };
  }
}

// ==========================================
// 2. SCAM CHECKER LOGIC & PROMPTS
// ==========================================
function getScamFallback(message: string, language: string = "hi") {
  const lower = message.toLowerCase();
  const isHighRisk =
    lower.includes("disconnect") ||
    lower.includes("suspended") ||
    lower.includes("block") ||
    lower.includes("lottery") ||
    lower.includes("urgent") ||
    lower.includes("कट") ||
    lower.includes("पॉवर") ||
    lower.includes("kyc") ||
    lower.includes("otp") ||
    lower.includes("call immediately");

  if (isHighRisk) {
    return {
      riskLevel: "High" as const,
      riskLabelHi: "🚨 उच्च जोखिम (धोखाधड़ी के लक्षण)",
      warningSigns:
        language === "en"
          ? [
              "Creates artificial urgency threatening immediate disconnection or account block.",
              "Contains an unofficial mobile number or unofficial short link.",
              "Official government electricity utilities never disconnect power late at night via private SMS.",
            ]
          : [
              "अचानक बिजली काटने या बैंक खाता बंद करने का झूठा डर पैदा कर रहा है।",
              "निजी 10-अंकों का मोबाइल नंबर या संदिग्ध लिंक दिया गया है।",
              "सरकारी विभाग कभी भी निजी मोबाइल नंबर से रात में बिजली काटने की धमकी नहीं देते।",
            ],
      explanation:
        language === "en"
          ? "This message shows signs commonly associated with scams. Cyber criminals commonly circulate fake electricity disconnection alerts to panic elders into calling their number or installing malicious screen-sharing apps."
          : "यह संदेश धोखाधड़ी (Scam) से जुड़े स्पष्ट लक्षणों को दर्शाता है। ठग अक्सर बुजुर्गों को डराने के लिए ऐसे संदेश भेजते हैं ताकि वे जल्दबाजी में फोन करें या पैसे ट्रांसफर कर दें।",
      recommendedActions:
        language === "en"
          ? [
              "Do not click any suspicious links in the message.",
              "Do not call the phone number provided in the SMS.",
              "Never share your OTP, UPI PIN, or bank details.",
              "Verify your bill balance using the official electricity board consumer portal or helpline.",
              "If you accidentally shared any details, immediately dial the National Cyber Crime Helpline at 1930.",
            ]
          : [
              "संदेश में दिए गए किसी भी लिंक पर बिल्कुल क्लिक न करें।",
              "इस मैसेज में लिखे फोन नंबर पर कभी कॉल न करें।",
              "अपना OTP, एटीएम पिन या यूपीआई पिन किसी को न बताएं।",
              "बिजली बिल की सही जानकारी के लिए अपनी पुरानी रसीद या आधिकारिक बिजली कार्यालय से पुष्टि करें।",
              "यदि गलती से कोई जानकारी साझा हो गई हो, तो तुरंत राष्ट्रीय साइबर हेल्पलाइन 1930 पर फोन करें।",
            ],
      disclaimer:
        "This message shows signs commonly associated with scams. Saathi does not guarantee absolute scam verification; always verify directly with the official organization.",
      helpline: "National Cyber Crime Helpline: 1930",
    };
  }

  return {
    riskLevel: "Low" as const,
    riskLabelHi: "✅ कम जोखिम (सामान्य संदेश)",
    warningSigns:
      language === "en"
        ? ["No urgent threat of disconnection, lottery claim, or request for sensitive credentials detected."]
        : ["इसमें बिजली काटने की धमकी, लॉटरी का दावा या बैंक पासवर्ड मांगने जैसी बातें नहीं पाई गईं।"],
    explanation:
      language === "en"
        ? "This message does not appear to exhibit the typical red flags of urgency-driven scams. However, always exercise normal caution."
        : "यह संदेश सामान्य प्रतीत होता है और इसमें तत्काल डर पैदा करने वाले संकेत नहीं दिखे। फिर भी हमेशा सतर्क रहें।",
    recommendedActions:
      language === "en"
        ? [
              "Never share financial passwords or OTPs even if a caller claims to be an official.",
              "Verify any important requests with a family member or trusted service center.",
            ]
        : [
              "फिर भी किसी अनजान व्यक्ति को अपना पासवर्ड या OTP कभी न बताएं।",
              "किसी भी महत्वपूर्ण काम से पहले घर के बच्चों या बैंक से पुष्टि करें।",
            ],
    disclaimer:
      "This message shows signs commonly associated with low risk. Saathi does not guarantee absolute scam verification; always verify directly with the official organization.",
    helpline: "National Cyber Crime Helpline: 1930",
  };
}

// ==========================================
// 3. DOCUMENT EXPLAINER FALLBACK
// ==========================================
function getDocumentExplainerFallback(text: string, language: string = "hi") {
  const lower = text.toLowerCase();

  if (lower.includes("jeevan") || lower.includes("pension") || lower.includes("pramaan") || lower.includes("life certificate")) {
    return {
      simpleExplanation:
        language === "en"
          ? "This document is related to your annual Pension Digital Life Certificate (Jeevan Pramaan). Every pensioner submits this once a year to keep their monthly pension active."
          : "यह पत्र आपकी वार्षिक पेंशन के जीवन प्रमाण पत्र (Jeevan Pramaan) के बारे में है। पेंशन चालू रखने के लिए हर साल यह प्रमाण पत्र जमा करना अनिवार्य होता है।",
      importantThings:
        language === "en"
          ? [
              "Annual Deadline: Usually between October 1 and November 30.",
              "Required items: Aadhaar Card, PPO (Pension Payment Order) Number, and Bank Passbook.",
              "Doorstep Service: Postman can come to your home with a biometric device to complete it for ₹50–₹70.",
            ]
          : [
              "जमा करने का समय: आमतौर पर 1 अक्टूबर से 30 नवंबर के बीच।",
              "ज़रूरी कागज़ात: आधार कार्ड, PPO नंबर और बैंक पासबुक।",
              "घर बैठे सुविधा: डाकिया घर आकर बायोमेट्रिक मशीन से डिजिटल प्रमाण पत्र बना देता है (मात्र ₹50-₹70 शुल्क)।",
            ],
      difficultWords: [
        {
          term: "PPO Number",
          explanation: language === "en" ? "Pension Payment Order - your unique 12-digit pension identity number." : "पेंशन पेमेंट ऑर्डर — आपका 12 अंकों का विशिष्ट पेंशन नंबर।",
        },
        {
          term: "Biometric Authentication",
          explanation: language === "en" ? "Fingerprint or face scan on the postman's machine to confirm your identity." : "डाकिए की मशीन पर अंगूठा या चेहरा स्कैन करके पहचान की पुष्टि करना।",
        },
      ],
      actionSteps:
        language === "en"
          ? [
              "Check your PPO number in your pension passbook.",
              "Call your local postman or visit your nearby India Post branch.",
              "Keep the SMS confirmation safe once generated.",
            ]
          : [
              "अपनी पेंशन पासबुक में PPO नंबर देख कर तैयार रखें।",
              "अपने क्षेत्र के पोस्टमैन से संपर्क करें या डाकघर जाएं।",
              "प्रमाण पत्र बनने के बाद मोबाइल पर आए पुष्टिकरण SMS को सुरक्षित रखें।",
            ],
      safetyDisclaimer:
        "Saathi provides this AI summary for informational guidance. It does not replace official pension board or bank rules. For formal changes, please consult your pension disbursing authority.",
    };
  }

  return {
    simpleExplanation:
      language === "en"
        ? "This notice summarizes your essential instructions, payment terms, or health summary in plain words."
        : "यह दस्तावेज़ आपके लिए ज़रूरी निर्देशों, भुगतान की शर्तों या स्वास्थ्य सारांश को आसान शब्दों में समझाता है।",
    importantThings:
      language === "en"
        ? [
            "Check for any due date or follow-up doctor date.",
            "Verify the exact payable amount or test name.",
            "Keep the original copy in your home file.",
          ]
        : [
            "अंतिम तारीख (Due Date) या डॉक्टर से दोबारा मिलने की तारीख ध्यान से देखें।",
            "कुल देय राशि (Net Payable) या टेस्ट का नाम जांचें।",
            "कागज़ की मूल प्रति (Original Copy) को अपनी सुरक्षित फ़ाइल में रखें।",
          ],
    difficultWords: [
      {
        term: "Net Payable / देय राशि",
        explanation: language === "en" ? "The final exact amount to pay before the due date." : "नियत तारीख से पहले भरी जाने वाली वास्तविक राशि।",
      },
      {
        term: "Follow-up / पुनः परामर्श",
        explanation: language === "en" ? "The next visit scheduled with your doctor." : "डॉक्टर से अगली बार मिलने की तारीख।",
      },
    ],
    actionSteps:
      language === "en"
        ? [
            "Keep this document in your safe folder.",
            "If any payment is required, use authorized bank counters or official apps.",
          ]
        : [
            "इस कागज़ को अपनी संभाल कर रखी जाने वाली फ़ाइल में रखें।",
            "भुगतान के लिए केवल आधिकारिक बैंक काउंटर या वैध माध्यम का ही उपयोग करें।",
          ],
    safetyDisclaimer:
      "Saathi provides this AI summary for informational guidance. It does not replace professional medical, legal, or financial advice.",
  };
}

// ==========================================
// 4. APPOINTMENT PREPARATION LOGIC
// ==========================================
function getAppointmentPrepFallback(doctorOrService: string, language: string = "hi") {
  return {
    checklist:
      language === "en"
        ? [
            "Previous prescription files and recent lab reports (blood, sugar, thyroid, ECG).",
            "Current medicine strips showing exact milligrams and brand names.",
            "Reading glasses, small water bottle, and a healthy light snack.",
            "Small diary or note paper with your symptom questions.",
          ]
        : [
            "पुरानी डॉक्टर की पर्चियां और हालिया टेस्ट रिपोर्ट (ब्लड, शुगर, थायराइड, ईसीजी)।",
            "वर्तमान में चल रही सभी दवाओं के पत्ते ताकि डॉक्टर सही पावर देख सकें।",
            "पढ़ने का चश्मा, पानी की बोतल और ज़रूरत पड़ने पर हल्का नाश्ता।",
            "एक छोटी डायरी या पर्ची जिस पर अपनी तकलीफें लिखी हों।",
          ],
    questionsToAsk:
      language === "en"
        ? [
            "Doctor, are my current blood pressure and sugar levels in the safe range?",
            "Do I need to take these medicines before meals or after meals?",
            "Are there any specific food items or fruits I should avoid?",
            "When should I come back for my next review visit?",
          ]
        : [
            "डॉक्टर साहब, क्या मेरा बीपी और शुगर इस समय सुरक्षित सीमा में हैं?",
            "यह दवाइयाँ खाना खाने से पहले लेनी हैं या बाद में?",
            "खान-पान में मुझे किन चीज़ों या फलों से परहेज़ रखना चाहिए?",
            "अगली बार मुझे दोबारा कब दिखाने आना है?",
          ],
    comfortTips:
      language === "en"
        ? [
            "Wear comfortable loose clothing and slip-on walking shoes.",
            "Take your morning medications unless specifically asked to fast for tests.",
            "Have a trusted family member or companion accompany you.",
          ]
        : [
            "आरामदायक ढीले कपड़े और सहज चलने वाले जूते पहनें।",
            "अपनी सुबह की दवाइयाँ नियमित समय पर लें जब तक खाली पेट आने को न कहा गया हो।",
            "परिवार के किसी सदस्य या साथी को साथ लेकर जाएं ताकि कोई हड़बड़ाहट न हो।",
          ],
    bookingNotice:
      language === "en"
        ? "Note: Saathi provides this visit preparation guide. Saathi does not book or reschedule clinic appointments directly; please confirm with your doctor's clinic."
        : "नोट: साथी ने यह तैयारी सूची आपके मार्गदर्शन के लिए बनाई है। साथी सीधे क्लीनिक या अस्पताल में स्लॉट बुक नहीं करता; कृपया क्लीनिक से समय की पुष्टि स्वयं करें।",
  };
}

// ==========================================
// ROUTES
// ==========================================

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Saathi – AI Companion for Seniors",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 1. Natural Language Companion Chat
app.post("/api/saathi/chat", async (req, res) => {
  try {
    const rawMessage = req.body?.message;
    const language = req.body?.language === "en" ? "en" : "hi";
    const mode = req.body?.mode || "general";

    if (!rawMessage || !String(rawMessage).trim()) {
      return res.status(400).json({
        error: language === "en" ? "Please enter your message." : "कृपया अपनी बात लिखकर या बोलकर साझा करें।",
      });
    }

    // Safety guardrail for abusive, toxic, or harmful inputs
    const safety = classifyMessageSafety(String(rawMessage), language);
    if (!safety.isAllowed && safety.safeResponse) {
      // Respond calmly and respectfully; do not log or store sensitive/abusive user messages
      return res.json({
        reply: safety.safeResponse,
        source: "safety-guardrail",
      });
    }

    const message = sanitizeText(rawMessage, 2000);

    const ai = getGenAI();
    if (!ai) {
      const fallback = getEmpatheticFallback(message, language);
      return res.json({
        ...fallback,
        source: "local-companion",
      });
    }

    const prompt = `
A senior citizen asked: "${message}"
Preferred language: ${language === "en" ? "English" : "Hindi / Hinglish"}
Mode: ${mode}

Instructions:
1. Respond with warm empathy, patience, and high respect.
2. If the user is expressing anger or frustration (e.g. at a bank, technology, or hospital), remain completely calm, validate their feelings respectfully, and offer simple, clear step-by-step guidance.
3. If the prompt is brief or an announcement like "Mujhe kal doctor ke paas jana hai", warmheartedly acknowledge it, offer to prepare them, and ask an essential clarification question (e.g. asking for the appointment time or doctor's specialty).
4. Provide 2-4 easy, structured step-by-step points.
5. If this is a medical or appointment query, add a gentle reminder that you are preparing notes for them and that real hospital booking must be confirmed directly with the clinic.
6. Format your output clearly so an elderly person can read or listen comfortably.
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: SENIOR_COMPANION_SYSTEM_PROMPT,
          temperature: 0.5,
        },
      }),
      15000
    );

    const replyText = response.text || "";
    return res.json({
      reply: replyText,
      source: "gemini",
    });
  } catch (error: any) {
    console.error("Chat error:", error?.message || "Internal error");
    const fallback = getEmpatheticFallback(req.body?.message || "", req.body?.language || "hi");
    return res.json({
      ...fallback,
      source: "fallback",
    });
  }
});

// 2. Scam & Fraud Checker Endpoint
app.post("/api/saathi/scam-check", async (req, res) => {
  try {
    const rawMessage = req.body?.message;
    const language = req.body?.language === "en" ? "en" : "hi";

    // Validate empty or whitespace-only input
    const validation = validateScamInput(rawMessage, language);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const text = validation.sanitizedText;

    const ai = getGenAI();
    if (!ai) {
      const fallback = getScamFallback(text, language);
      const normalized = normalizeScamResult(fallback, language);
      return res.json({
        ...normalized,
        source: "local-rule-engine",
      });
    }

    const prompt = `
Analyze the following message received by an elderly senior citizen to assess if it shows signs of a scam or fraud:
"${text}"

Language of output: ${language === "en" ? "English" : "Hindi (in Devanagari script)"}

CRITICAL RULES:
- Never claim that AI can guarantee whether something is a scam.
- Use wording such as: "This message contains signs commonly associated with scams" or "This message shows low risk characteristics".
- Allowed values for riskLevel: "HIGH RISK", "MEDIUM RISK", "LOW RISK", "UNKNOWN / NEEDS REVIEW".
- Return pure valid JSON only, without any markdown code fence backticks or extra commentary.

The JSON must have this exact structure:
{
  "riskLevel": "HIGH RISK" or "MEDIUM RISK" or "LOW RISK" or "UNKNOWN / NEEDS REVIEW",
  "warningSigns": ["Urgent or threatening language", "Suspicious shortened link", "Request for OTP/PIN/password", "Impersonation of a bank or government service"],
  "simpleExplanation": "Simple, compassionate 2-3 sentence explanation written for an elder",
  "safeAction": ["Do not click the link", "Do not share OTP, PIN, password or banking credentials", "Contact the organization using an official number", "If money has already been lost, contact the bank immediately and use the official cybercrime reporting channel (1930)"]
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
      15000
    );

    const jsonStr = (response.text || "").trim();
    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Clean possible stray backticks if any
      const cleaned = jsonStr.replace(/^```json/i, "").replace(/```$/, "").trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = getScamFallback(text, language);
      }
    }

    const normalized = normalizeScamResult(parsed, language);
    return res.json({
      ...normalized,
      source: "gemini",
    });
  } catch (error: any) {
    console.error("Scam check error:", error?.message || "Internal error");
    const fallback = getScamFallback(req.body?.message || "", req.body?.language || "hi");
    const normalized = normalizeScamResult(fallback, req.body?.language || "hi");
    return res.json({
      ...normalized,
      source: "fallback",
    });
  }
});

// 3. Document Explainer Endpoint
app.post("/api/saathi/explain-document", async (req, res) => {
  try {
    const rawText = req.body?.text;
    const language = req.body?.language === "en" ? "en" : "hi";
    const text = sanitizeText(rawText, 3500);

    if (!text) {
      return res.status(400).json({ error: "Document text is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      const fallback = getDocumentExplainerFallback(text, language);
      return res.json({
        ...fallback,
        source: "local-rule-engine",
      });
    }

    const prompt = `
A senior citizen needs help understanding this official notice, hospital discharge bill, or government document:
"${text}"

Language of output: ${language === "en" ? "English" : "Hindi (Devanagari script)"}

CRITICAL RULES:
1. Explain it simply without complex legal, tax, or medical jargon.
2. For high-risk topics (hospital bills, taxes, legal notices), clearly advise consulting the appropriate certified professional.
3. Return pure valid JSON only, without any markdown formatting or code fences.
Format:
{
  "simpleExplanation": "2-3 clear, compassionate sentences explaining what this document is about in everyday words",
  "importantThings": ["Key date, deadline, or amount 1", "Key thing 2", "Key thing 3"],
  "difficultWords": [
    { "term": "Jargon Term", "explanation": "Simple plain language meaning" }
  ],
  "actionSteps": ["What the senior should do step 1", "Step 2", "Step 3"],
  "safetyDisclaimer": "Saathi provides this AI-powered summary for easier understanding only. It does not replace professional medical, legal, or financial advice. Please verify with a certified authority."
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
      15000
    );

    const jsonStr = (response.text || "").trim();
    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const cleaned = jsonStr.replace(/^```json/i, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({
      simpleExplanation: parsed.simpleExplanation || "This document outlines your notice requirements.",
      importantThings: Array.isArray(parsed.importantThings) ? parsed.importantThings : [],
      difficultWords: Array.isArray(parsed.difficultWords) ? parsed.difficultWords : [],
      actionSteps: Array.isArray(parsed.actionSteps) ? parsed.actionSteps : [],
      safetyDisclaimer: parsed.safetyDisclaimer || "Saathi provides this AI-powered summary for easier understanding only. It does not replace professional medical, legal, or financial advice.",
      source: "gemini",
    });
  } catch (error: any) {
    console.error("Document explainer error:", error?.message || "Internal error");
    const fallback = getDocumentExplainerFallback(req.body?.text || "", req.body?.language || "hi");
    return res.json({
      ...fallback,
      source: "fallback",
    });
  }
});

// 4. Appointment Preparation Assistant Endpoint
app.post("/api/saathi/prepare-appointment", async (req, res) => {
  try {
    const rawDoctor = req.body?.doctorOrService;
    const language = req.body?.language === "en" ? "en" : "hi";
    const doctorOrService = sanitizeText(rawDoctor, 200);

    if (!doctorOrService) {
      return res.status(400).json({ error: "Doctor or service name is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      const fallback = getAppointmentPrepFallback(doctorOrService, language);
      return res.json({
        ...fallback,
        source: "local-rule-engine",
      });
    }

    const prompt = `
A senior citizen has an appointment with "${doctorOrService}".
Appointment date/time notes: "${sanitizeText(req.body?.date, 100)} ${sanitizeText(req.body?.time, 100)} ${sanitizeText(req.body?.notes, 200)}"
Language of output: ${language === "en" ? "English" : "Hindi (Devanagari script)"}

Create a personalized visit preparation guide for an elderly person.
Return pure valid JSON only:
{
  "checklist": ["Item to carry 1 (e.g. past reports, medicine strip)", "Item 2", "Item 3", "Item 4"],
  "questionsToAsk": ["Clear question for the doctor 1", "Question 2", "Question 3", "Question 4"],
  "comfortTips": ["Comfort tip 1 (clothing, transport, fasting check)", "Comfort tip 2", "Comfort tip 3"],
  "bookingNotice": "Note: Saathi has generated this preparation guide for you. Please note that Saathi does not book or reschedule clinic appointments directly; please confirm your booking directly with your clinic or hospital."
}
`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
      15000
    );

    const jsonStr = (response.text || "").trim();
    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const cleaned = jsonStr.replace(/^```json/i, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
      questionsToAsk: Array.isArray(parsed.questionsToAsk) ? parsed.questionsToAsk : [],
      comfortTips: Array.isArray(parsed.comfortTips) ? parsed.comfortTips : [],
      bookingNotice: parsed.bookingNotice || "Note: Saathi has generated this preparation guide for you. Please note that Saathi does not book or reschedule clinic appointments directly.",
      source: "gemini",
    });
  } catch (error: any) {
    console.error("Appointment prep error:", error?.message || "Internal error");
    const fallback = getAppointmentPrepFallback(req.body?.doctorOrService || "Doctor", req.body?.language || "hi");
    return res.json({
      ...fallback,
      source: "fallback",
    });
  }
});

// ==========================================
// STATIC / VITE SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Saathi Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
