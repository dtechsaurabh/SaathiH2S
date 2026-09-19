import { Language, ScamAnalysisResult, ScamRiskLevel } from '../types';
import { HELPLINES, INPUT_LIMITS } from './constants';

/**
 * 1. SCAM CHECKER INPUT VALIDATION
 * Validates user input before sending to any service or Gemini.
 */
export function validateScamInput(
  input: string | undefined | null,
  language: Language = 'hi'
): { isValid: boolean; error?: string; sanitizedText: string } {
  if (!input || input.trim().length === 0) {
    const error =
      language === 'hi'
        ? 'कृपया पहले वह SMS या संदेश यहाँ लिखें जिसे आप जाँच करवाना चाहते हैं।'
        : 'Please write or paste the SMS or message you want to check first.';
    return { isValid: false, error, sanitizedText: '' };
  }

  const trimmed = input.trim();
  const MAX_LENGTH = INPUT_LIMITS.SCAM_TEXT_MAX_CHARS;

  if (trimmed.length > MAX_LENGTH) {
    const error =
      language === 'hi'
        ? `संदेश बहुत लंबा है (अधिकतम ${MAX_LENGTH} अक्षर)। कृपया संदेश का मुख्य संदिग्ध हिस्सा ही दर्ज करें।`
        : `Message is too long (maximum ${MAX_LENGTH} characters). Please enter only the relevant part.`;
    return { isValid: false, error, sanitizedText: trimmed.slice(0, MAX_LENGTH) };
  }

  return { isValid: true, sanitizedText: trimmed };
}

/**
 * Strips ASCII control characters, trims whitespace, and limits length.
 */
export function sanitizeSafeText(input: unknown, maxLen = 2000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * 2. CHAT / AI INPUT SAFETY GUARDRAIL
 * Detects abusive, threatening, harmful, or frustrated messages.
 */
export type SafetyClassification =
  | 'safe'
  | 'frustrated'
  | 'abusive'
  | 'harmful'
  | 'prompt_injection'
  | 'medical_unsafe'
  | 'credential_risk';

export interface SafetyCheckResult {
  status: SafetyClassification;
  safeResponse?: string;
  isAllowed: boolean;
}

export function classifyMessageSafety(
  message: string,
  language: Language = 'hi'
): SafetyCheckResult {
  const text = (message || '').trim().toLowerCase();
  const isHi = language === 'hi';

  if (!text) {
    return { status: 'safe', isAllowed: true };
  }

  // 1. Harmful / Severe Threat Detection (Self-harm, suicide, violence, weapons, killing)
  const harmfulPatterns = [
    /\b(suicide|kill myself|end my life|end it all|want to die|hang myself|poison myself)\b/i,
    /(आत्महत्या|जान दे दूंगा|फांसी|मरना चाहता|खुदकुशी|ज़हर खा लूंगा)/iu,
    /\b(bomb\s+(making|blast|attack)|kill\s+(someone|them|people)|terrorist|assassinate)\b/i,
    /(बम\s+विस्फोट|हत्या\s+कर|मार\s+डालूंगा|आतंकवादी)/iu,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(text)) {
      return {
        status: 'harmful',
        isAllowed: false,
        safeResponse: isHi
          ? 'आपकी सुरक्षा, स्वास्थ्य और जीवन अत्यंत महत्वपूर्ण है। यदि आप किसी मानसिक तनाव, संकट या आपातकाल में हैं, तो कृपया तुरंत राष्ट्रीय आपातकालीन सेवा 112 या वरिष्ठ नागरिक हेल्पलाइन 14567 पर संपर्क करें। यहाँ बात करने के लिए सहायता उपलब्ध है।'
          : 'Your safety, health, and well-being are paramount. If you are experiencing acute distress or an emergency, please reach out immediately to Emergency Services at 112 or the National Senior Citizen Helpline at 14567 for free, confidential support.',
      };
    }
  }

  // 2. Prompt Injection, Jailbreak, System Prompt & Secret Extraction Attempts
  const promptInjectionPatterns = [
    /\b(ignore|disregard|forget)\s+(all\s+)?(previous\s+|prior\s+|above\s+)?(instructions|prompts|rules)\b/i,
    /\b(system\s+prompt|developer\s+mode|jailbreak|dan\s+mode|bypass\s+safety)\b/i,
    /\b(reveal|show|tell|display|what\s+is)\b.*?\b((gemini[_\s-]*)?api[_\s-]*key|system\s*prompt|secret|credential|token|hidden\s*instruction|env)\b/i,
    /\b((gemini[_\s-]*)?api[_\s-]*key)\b/i,
    /(सिस्टम\s*प्रॉम्प्ट|पिछली\s*हिदायतें\s*(भूल|मानो)|गुप्त\s*कोड|एपीआई\s*की)/iu,
  ];

  for (const pattern of promptInjectionPatterns) {
    if (pattern.test(text)) {
      return {
        status: 'prompt_injection',
        isAllowed: false,
        safeResponse: isHi
          ? 'मैं आपका सहायक साथी (Saathi) हूँ। मैं केवल वरिष्ठ नागरिकों की दैनिक दिनचर्या, दवाइयों की याद और सुरक्षित मार्गदर्शन में सहायता करता हूँ। सिस्टम निर्देशों या आंतरिक कुंजियों को साझा करना संभव नहीं है। मैं आपकी किस प्रकार सहायता करूँ?'
          : 'I am your companion Saathi. I am designed specifically to assist seniors with daily routines, medicine reminders, and gentle guidance. I do not share internal prompts, system configurations, or keys. How may I assist you with your day?',
      };
    }
  }

  // 3. Unsafe Medical Advice / Dosage Manipulation / Unlicensed Treatment Queries
  const medicalUnsafePatterns = [
    /\b(give\s+me\s+a\s+dosage|prescribe\s+(me\s+)?a\s+(medicine|drug)|change\s+my\s+dosage|stop\s+taking\s+(my\s+)?(medicine|pills)|what\s+dose\s+should\s+i\s+take|pretend\s+you\s+are\s+a\s+doctor|diagnose\s+(my\s+condition|me))\b/i,
    /\b(can\s+i\s+(increase|decrease)\s+my\s+dose|should\s+i\s+stop\s+taking\s+(amlodipine|metformin|atorvastatin))\b/i,
    /(खुराक\s*(बदल|बता|लिख|बढ़ा|घटा)|दवा\s*बंद\s*कर|मुझे\s*दवा\s*लिख|डॉक्टर\s*बनकर\s*बता|मेरी\s*बीमारी\s*का\s*इलाज|(दवा|गोली)\s*की\s*खुराक)/iu,
  ];

  for (const pattern of medicalUnsafePatterns) {
    if (pattern.test(text)) {
      return {
        status: 'medical_unsafe',
        isAllowed: false,
        safeResponse: isHi
          ? 'आपकी सुरक्षा सबसे पहले है। साथी आपकी दिनचर्या और याददाश्त में सहायता के लिए है। किसी भी बीमारी का निदान, दवा की खुराक बदलने या नया इलाज शुरू करने के लिए कृपया केवल अपने योग्य डॉक्टर (Physician) से प्रत्यक्ष परामर्श लें। बिना डॉक्टर की सलाह के दवा कभी न बदलें।'
          : 'Your safety is our top priority. Saathi is designed to assist with daily routines and reminders. For any medical diagnosis, changing medication dosages, or starting new treatments, please always consult your qualified doctor or physician directly. Never change prescribed doses without medical advice.',
      };
    }
  }

  // 4. Credential / Sensitive Personal Data Phishing Detection
  const credentialRiskPatterns = [
    /\b(send|share|give|enter|tell)\b.*?\b(otp|pin|password|cvv|netbanking|bank\s*account)\b/i,
    /\b(my\s+(atm\s+)?(pin|password|otp)\s+is)\b/i,
    /\b(netbanking\s+password|share\s+your\s+netbanking)\b/i,
    /(मेरा\s*(ओटीपी|पिन|पासवर्ड)|(ओटीपी|पिन|पासवर्ड)\s*है|खाता\s*संख्या\s*मांग|ओटीपी\s*मांग)/iu,
  ];

  for (const pattern of credentialRiskPatterns) {
    if (pattern.test(text)) {
      return {
        status: 'credential_risk',
        isAllowed: false,
        safeResponse: isHi
          ? 'सुरक्षा चेतावनी: कृपया अपना OTP, बैंक पिन, पासवर्ड या गोपनीय वित्तीय जानकारी कभी किसी के साथ साझा न करें। साथी आपसे कभी भी कोई गोपनीय पासवर्ड या बैंक विवरण नहीं मांगता।'
          : 'Security Alert: Please never share your OTP, banking PIN, passwords, or confidential financial details. Saathi will never ask for your private passwords or banking credentials.',
      };
    }
  }

  // 5. Abusive / Toxic / Sexually Explicit Input Detection
  // Strictly targeting abusive vitriol, slurs, profanity, and explicit sexual abuse.
  // Note: Normal Hindi words like "pareshan", "gussa", "kutta" (dog), etc. in innocent context are NOT blocked.
  const abusivePatterns = [
    /\b(bhenchod|madarchod|chutiya|gandu|harami|bhosdike|bhadwe|randi|kamine|suar ke bacche)\b/i,
    /(मादरचोद|बहनचोद|चूतिया|गांडू|हरामी|भोसड़ी|कमीने|रंडी)/iu,
    /\b(fuck\s+(you|off)|asshole|bastard|motherfucker|bitch|cunt|dickhead|piece of shit)\b/i,
    /\b(porn|nude|sex\s+with|rape|sexual)\b/i,
  ];

  for (const pattern of abusivePatterns) {
    if (pattern.test(text)) {
      return {
        status: 'abusive',
        isAllowed: false,
        safeResponse: isHi
          ? 'मैं सम्मानजनक और सुरक्षित बातचीत में आपकी मदद करने के लिए यहाँ हूँ। कृपया अपनी बात सरल और सम्मानजनक शब्दों में बताइए।'
          : 'I am here to assist you in a respectful and safe conversation. Please share your question or request in simple, respectful words.',
      };
    }
  }

  // 6. Frustrated but Non-Threatening Input Detection
  // When an elder is venting frustration (e.g., bank troubles, confusing tech, annoyance),
  // we do NOT block them; we classify as 'frustrated' and remain calm and helpful.
  const frustrationKeywords = [
    'gussa',
    'गुस्सा',
    'pareshan',
    'परेशान',
    'frustrated',
    'angry',
    'annoyed',
    'irritated',
    'bakwas',
    'बकवास',
    'chidh',
    'चिढ़',
    'nothing works',
    'kuch nahi ho raha',
    'कुछ नहीं हो रहा',
    'bank wale sunte nahi',
    'बैंक वाले सुनते नहीं',
  ];

  const hasFrustration = frustrationKeywords.some((kw) => text.includes(kw));
  if (hasFrustration) {
    return {
      status: 'frustrated',
      isAllowed: true,
      safeResponse: isHi
        ? 'मैं समझ सकता हूँ कि इस स्थिति से आपको परेशानी या झुंझलाहट हो रही है। कृपया बिल्कुल चिंता न करें, हम इसे शांत मन से एक-एक कदम करके सुलझाएंगे।'
        : 'I understand this situation is causing you frustration. Please take a deep breath; I am right here to help you resolve this step by step with patience.',
    };
  }

  return { status: 'safe', isAllowed: true };
}

/**
 * 3. ROBUST SCAM CHECKER RESULT PARSER & NORMALIZER
 * Guarantees a safe, structured result following all Hackathon criteria:
 * - Risk Level (LOW RISK, MEDIUM RISK, HIGH RISK, UNKNOWN / NEEDS REVIEW)
 * - Warning Signs (bulleted list)
 * - Safe Action (clear steps)
 * - Simple Explanation
 * - Safety wording: "This message contains signs commonly associated with scams"
 * - 1930 Cyber helpline presented as official help/reporting resource
 */
export function normalizeScamResult(raw: unknown, language: Language = 'hi'): ScamAnalysisResult {
  const isHi = language === 'hi';
  const rawObj = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : null;

  // Normalize risk level
  let rawLevel = String(rawObj?.riskLevel || rawObj?.risk || '').trim().toUpperCase();
  let riskLevel: ScamRiskLevel = 'UNKNOWN / NEEDS REVIEW';

  if (rawLevel.includes('HIGH') || rawLevel === 'HIGH RISK' || rawLevel === 'उच्च') {
    riskLevel = 'HIGH RISK';
  } else if (rawLevel.includes('MEDIUM') || rawLevel === 'MEDIUM RISK' || rawLevel === 'मध्यम') {
    riskLevel = 'MEDIUM RISK';
  } else if (rawLevel.includes('LOW') || rawLevel === 'LOW RISK' || rawLevel === 'कम') {
    riskLevel = 'LOW RISK';
  } else {
    riskLevel = 'UNKNOWN / NEEDS REVIEW';
  }

  // Risk Label for UI
  const riskLabels = {
    'HIGH RISK': {
      hi: 'उच्च जोखिम (HIGH RISK)',
      en: 'HIGH RISK',
    },
    'MEDIUM RISK': {
      hi: 'मध्यम जोखिम (MEDIUM RISK)',
      en: 'MEDIUM RISK',
    },
    'LOW RISK': {
      hi: 'कम जोखिम (LOW RISK)',
      en: 'LOW RISK',
    },
    'UNKNOWN / NEEDS REVIEW': {
      hi: 'समीक्षा की आवश्यकता (UNKNOWN / NEEDS REVIEW)',
      en: 'UNKNOWN / NEEDS REVIEW',
    },
  };

  // Warning Signs
  let warningSigns: string[] = [];
  if (Array.isArray(rawObj?.warningSigns) && rawObj.warningSigns.length > 0) {
    warningSigns = rawObj.warningSigns.map((s: unknown) => String(s).trim()).filter(Boolean);
  } else if (typeof rawObj?.warningSigns === 'string' && rawObj.warningSigns.trim()) {
    warningSigns = [rawObj.warningSigns.trim()];
  }

  if (warningSigns.length === 0) {
    if (riskLevel === 'HIGH RISK') {
      warningSigns = isHi
        ? [
            'अत्यधिक जल्दबाजी या धमकी भरी भाषा (Immediate Disconnection or Penalty)',
            'संदेहास्पद या छोटा किया गया लिंक (Shortened/Unofficial Link)',
            'OTP, पासवर्ड या बैंक जानकारी मांगने का प्रयास',
            'बैंक या सरकारी संस्था का फर्जी रूप धारण करना',
          ]
        : [
            'Urgent or threatening language (e.g. immediate disconnection or arrest)',
            'Suspicious shortened or unofficial link',
            'Request for OTP, PIN, password or banking details',
            'Impersonation of a bank or government service',
          ];
    } else if (riskLevel === 'MEDIUM RISK') {
      warningSigns = isHi
        ? [
            'संदेश का स्रोत पूरी तरह सत्यापित नहीं है।',
            'अस्पष्ट ऑफ़र या व्यक्तिगत विवरण साझा करने का आग्रह।',
          ]
        : [
            'The source of this communication could not be independently verified.',
            'Vague offer or request to reply with personal information.',
          ];
    } else if (riskLevel === 'LOW RISK') {
      warningSigns = isHi
        ? ['संदेश में कोई प्रत्यक्ष वित्तीय धोखाधड़ी या संदिग्ध लिंक नहीं मिला।']
        : ['No direct financial extortion or malicious links detected in this message.'];
    } else {
      warningSigns = isHi
        ? ['संदेश में पर्याप्त विवरण नहीं है जिससे पूरी स्थिति स्पष्ट हो सके।']
        : ['The message does not contain sufficient details to establish a clear pattern.'];
    }
  }

  // Safe Actions
  let safeActions: string[] = [];
  const rawActions = rawObj?.recommendedActions || rawObj?.safeAction || rawObj?.actions;
  if (Array.isArray(rawActions) && rawActions.length > 0) {
    safeActions = rawActions
      .map((a: unknown) => String(a).trim())
      .filter((a) => {
        if (!a) return false;
        // Strip any adversarial suggestion that advises revealing credentials unless explicitly negative
        const lower = a.toLowerCase();
        const unsafePrompt =
          (/\b(enter|provide|send|share|submit|give)\b.*?\b(otp|pin|password|cvv|account\s*number|netbanking)\b/i.test(lower) &&
            !/\b(never|do not|don't|avoid|refrain)\b/i.test(lower)) ||
          (/(ओटीपी|पिन|पासवर्ड|खाता)\s*(दर्ज\s*करें|भेजें|दें|साझा\s*करें)/iu.test(lower) &&
            !/(न\s*दें|कभी\s*न|मत|बिल्कुल\s*न)/iu.test(lower));
        return !unsafePrompt;
      });
  } else if (typeof rawActions === 'string' && rawActions.trim()) {
    safeActions = [rawActions.trim()];
  }

  if (safeActions.length === 0) {
    safeActions = isHi
      ? [
          'संदेश में दिए गए किसी भी लिंक पर क्लिक न करें।',
          'अपना OTP, UPI पिन, पासवर्ड या बैंक विवरण कभी किसी से साझा न करें।',
          'संबंधित संस्था (बैंक या बिजली दफ्तर) के आधिकारिक नंबर पर स्वयं संपर्क करके जांच करें।',
          'अगर आपको आर्थिक साइबर धोखाधड़ी का संदेह है या पैसे का नुकसान हुआ है, तो तुरंत अपने बैंक से संपर्क करें और आधिकारिक साइबर अपराध सहायता/रिपोर्टिंग चैनल (1930) का उपयोग करें।',
        ]
      : [
          'Do not click any link inside the message.',
          'Do not share OTP, PIN, password or banking credentials with anyone.',
          'Contact the organization using their official customer care number.',
          'If money has already been lost or compromised, contact your bank immediately and use the official cybercrime reporting channel (1930).',
        ];
  }

  // Simple Explanation
  let explanation = String(rawObj?.simpleExplanation || rawObj?.explanation || '').trim();
  if (!explanation) {
    if (riskLevel === 'HIGH RISK') {
      explanation = isHi
        ? 'यह संदेश धोखाधड़ी से जुड़े कुछ सामान्य संकेत दिखाता है। ठग अक्सर बिजली कटने या बैंक खाता बंद होने का झूठा डर पैदा करके बुजुर्गों को जल्दबाजी में कदम उठाने पर मजबूर करते हैं।'
        : 'This message contains signs commonly associated with scams. Fraudsters frequently use artificial urgency such as service disconnection threats to panic recipients into taking hasty actions.';
    } else if (riskLevel === 'MEDIUM RISK') {
      explanation = isHi
        ? 'यह संदेश धोखाधड़ी से जुड़े कुछ सामान्य संकेत दिखाता है। इसमें दी गई जानकारी पूरी तरह प्रमाणित नहीं है, इसलिए अतिरिक्त सावधानी बरतें।'
        : 'This message contains signs commonly associated with scams or unverified requests. Exercise caution and verify independently before responding.';
    } else if (riskLevel === 'LOW RISK') {
      explanation = isHi
        ? 'इस संदेश में सामान्यतः धोखाधड़ी से जुड़े स्पष्ट संकेत नहीं दिखते हैं। फिर भी किसी अनजान व्यक्ति को अपनी निजी जानकारी कभी न दें।'
        : 'This message exhibits low-risk characteristics. However, always exercise standard prudence and never share banking credentials.';
    } else {
      explanation = isHi
        ? 'इस संदेश की सत्यता की पुष्टि नहीं की जा सकी। कृपया इसे किसी भी व्यक्ति को आगे न भेजें और न ही किसी लिंक पर क्लिक करें।'
        : 'This message could not be verified with confidence. Please treat it cautiously and refrain from clicking embedded links.';
    }
  }

  // Safety Disclaimer (Strict Hackathon Mandate: Never claim AI can guarantee a scam)
  const disclaimer = isHi
    ? 'यह संदेश धोखाधड़ी से जुड़े कुछ सामान्य संकेत दिखाता है। साथी एआई किसी संदेश के सौ प्रतिशत स्कैम होने की गारंटी नहीं देता; हमेशा आधिकारिक संस्थान से सीधे पुष्टि करें।'
    : 'This message contains signs commonly associated with scams. Saathi AI provides guidance and does not guarantee absolute scam verification; always verify directly with the official organization.';

  const helpline = isHi
    ? 'अगर आपको आर्थिक साइबर धोखाधड़ी का संदेह है या पैसे का नुकसान हुआ है, तो तुरंत अपने बैंक से संपर्क करें और आधिकारिक साइबर अपराध सहायता/रिपोर्टिंग चैनल (हेल्पलाइन 1930) का उपयोग करें।'
    : 'If you suspect financial cyber fraud or have lost money, contact your bank immediately and use the official cybercrime reporting channel (Helpline 1930).';

  return {
    riskLevel,
    riskLabelHi: riskLabels[riskLevel][isHi ? 'hi' : 'en'],
    warningSigns,
    explanation,
    recommendedActions: safeActions,
    safeAction: safeActions,
    disclaimer,
    helpline,
    cyberHelpline: HELPLINES.CYBER_CRIME,
  };
}

/**
 * 4. MEDICINE TIME FORMATTING FOR SENIOR UX
 * Formats reminder time into clear, natural senior-friendly labels in Hindi and English.
 * Examples:
 * - English: "Today at 08:00 AM" (or "Starts 2026-09-20 at 08:00 AM")
 * - Hindi: "आज सुबह 8:00 बजे", "आज दोपहर 1:30 बजे", "आज शाम 4:00 बजे", "आज रात 8:00 बजे"
 */
export function formatSeniorMedicineTime(
  rawTime: string | undefined | null,
  language: Language = 'hi',
  startDate?: string
): string {
  if (!rawTime || !rawTime.trim()) {
    return language === 'hi' ? 'समय निर्धारित नहीं' : 'Time not set';
  }

  const timeStr = rawTime.trim();
  let hours = 8;
  let minutes = 0;
  let period: 'AM' | 'PM' = 'AM';

  // Format 1: "HH:MM" 24-hour format from <input type="time"> (e.g. "08:30" or "20:15")
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  // Format 2: "HH:MM AM/PM" format (e.g. "08:00 AM")
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);

  if (match24) {
    hours = parseInt(match24[1], 10);
    minutes = parseInt(match24[2], 10);
    period = hours >= 12 ? 'PM' : 'AM';
  } else if (match12) {
    hours = parseInt(match12[1], 10);
    minutes = parseInt(match12[2], 10);
    period = (match12[3] ? match12[3].toUpperCase() : hours >= 12 ? 'PM' : 'AM') as 'AM' | 'PM';
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }

  // Display 12-hour values
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMin = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const display12 = `${displayHour < 10 ? '0' : ''}${displayHour}:${displayMin} ${period}`;

  // Check start date context
  const todayIso = new Date().toISOString().slice(0, 10);
  const isFutureDate = startDate && startDate > todayIso;

  if (language === 'en') {
    if (isFutureDate) {
      return `Starts ${startDate} at ${display12}`;
    }
    return `Today at ${display12}`;
  }

  // Hindi friendly time segment: सुबह (morning), दोपहर (afternoon), शाम (evening), रात (night)
  let timeOfDayHindi = 'सुबह';
  if (hours >= 4 && hours < 12) {
    timeOfDayHindi = 'सुबह';
  } else if (hours >= 12 && hours < 16) {
    timeOfDayHindi = 'दोपहर';
  } else if (hours >= 16 && hours < 20) {
    timeOfDayHindi = 'शाम';
  } else {
    timeOfDayHindi = 'रात';
  }

  const minSuffix = minutes > 0 ? `:${displayMin}` : '';
  const timeHindi = `${displayHour}${minSuffix} बजे`;

  if (isFutureDate) {
    return `${startDate} से, ${timeOfDayHindi} ${timeHindi}`;
  }
  return `आज ${timeOfDayHindi} ${timeHindi}`;
}
