# Saathi (साथी) – AI Companion for Seniors

> **"नमस्ते 👋 मैं Saathi हूँ — आपका Digital Companion"**  
> A compassionate, secure, and accessible GenAI-powered digital companion built specifically for senior citizens.

---

## 🌟 Problem Statement Alignment

Senior citizens often face significant digital anxiety and barriers when navigating modern technology:
- **Complicated Digital Services:** Overwhelming interfaces, tiny fonts, dense jargon, and difficult navigation.
- **Scams & Fraud Exploitation:** Phishing SMS, fake electricity bill disconnection threats, digital arrest frauds, and lottery scams targeting the elderly.
- **Critical Medicine & Health Routine Tracking:** Remembering pill timings, before/after meal rules, and tracking whether doses were taken or skipped.
- **Stressful Doctor Visits:** Forgetting medical history, test reports, or questions to ask the doctor during brief consultations.
- **Bureaucratic & Medical Documents:** Complex pension life certificates (*Jeevan Pramaan*), hospital discharge invoices, and utility notices written in difficult legalese.

**Saathi** solves this by providing a patient, bilingual (Hindi & English), high-contrast, voice-enabled AI companion that simplifies information, provides guided workflows, and actively assists seniors in their daily lives.

---

## 🚀 Key Features & Connected Workflows

### 1. 📅 "Today's Help" Proactive Dashboard
- Connects all modules into a unified daily care view.
- Displays today's scheduled medicine reminders with immediate one-tap **"Mark Taken"** or **"Skip"** actions.
- Shows upcoming doctor visits with **"View Details"** and **"Set Reminder"** buttons.
- Proactively suggests next steps (e.g., preparing doctor visit checklists or warning about common scams).

### 2. 🩺 Doctor & Appointments Assistant
- **Schedule Management:** Full CRUD operations to add, view, edit, and delete doctor appointments.
- **One-Tap Reminders:** Synchronizes appointment reminders directly to the user's notification schedule.
- **AI Visit Preparation:** Generates personalized preparation checklists, relevant past reports to carry, and key questions to ask the physician.
- **Safety Disclaimer:** Explicit reminder that Saathi assists with organization and preparation, never replacing certified medical consultations.

### 3. 💊 Medicine Reminders & Tracker
- **Daily Pill Schedule:** Track morning, afternoon, and night medicines.
- **One-Tap Status:** Instantly mark medicines as **Taken** (with timestamp) or **Skipped**.
- **Dosage Safety Guarantee:** Gemini and Saathi **never** prescribe medications or alter dosages; the tracker safely stores and manages schedules set by the senior, doctor, or caregiver.

### 4. 🚨 Scam & Fraud Checker
- **Real-Time Risk Analysis:** Paste suspicious SMS, WhatsApp forwards, or phone call transcripts for instant scam assessment (High, Medium, Low risk).
- **Clear Explanations:** Explains the psychological trickery behind threats (e.g., urgency, fake official impersonation, digital arrest).
- **Safe Next Steps:** Provides actionable instructions (e.g., "Do not click links", "Call official bank number").
- **Helpline Integration:** Displays India's official National Cyber Crime Reporting Portal helpline: **1930**.

### 5. 📄 Explain Information (Document Explainer)
- **3-Line Plain Explanations:** Transforms convoluted pension notices (e.g., *Jeevan Pramaan*), hospital bills, and government circulars into simple, everyday language.
- **Difficult Words Dictionary:** Translates legal and medical jargon into plain Hindi or English.
- **Action Checklist:** Clear, bulleted action items for the senior to take next.

### 6. 🎤 "Talk to Saathi" & Voice Assistance
- **Speech Recognition:** Voice input allowing seniors to speak naturally in Hindi, Hinglish, or English.
- **Text-to-Speech (TTS):** Every message, scam analysis, and document summary can be read aloud with gentle voice speed controls (`slow` / `normal`).
- **Intent-Driven Routing:** Natural language prompts (e.g., *"Mujhe kal doctor ke paas jana hai"*) automatically trigger guidance and offer direct one-tap shortcuts to the relevant feature modal.

---

## ♿ Accessibility & Senior-Centric UX

- **Typography Scaling:** Three responsive font sizes (**Normal**, **Large**, **Extra Large**) supporting older eyes.
- **High-Contrast Palette:** High-contrast neutral canvases with warm amber and emerald accents (WCAG AA compliant).
- **Generous Touch Targets:** Touch elements and buttons are sized at 48px–56px minimum height to accommodate reduced motor dexterity.
- **Bilingual Support:** One-tap toggle between **Hindi (हिन्दी)** and **English** across all interfaces.
- **Cognitive Simplicity:** Flat layouts, generous whitespace, zero visual clutter, and no confusing multi-level menus.

---

## 🛡️ Security, Privacy & Safety Architecture

```
[Senior User Client]
       │
       ▼ (Private Local Storage: Medicines, Appointments, Accessibility Settings)
       │
       ▼ (Safe JSON Payloads with Input Sanitization)
[Node.js Express Server: server.ts]
       │
       ├─► Rate Limiter & Request Sanitizer
       ├─► Fallback Engine (graceful responses during network/quota interruptions)
       │
       ▼ (Server-Side HTTPS Proxy)
[Google GenAI SDK (@google/genai)]
       │
       ▼
[Gemini 2.5 Flash Model]
```

1. **Zero Secret Exposure:** The `GEMINI_API_KEY` is strictly confined to the backend server (`server.ts`). No API keys or secrets are ever exposed to the client browser.
2. **Local-First Privacy:** Personal medication names, appointment dates, and user preferences remain stored securely in the senior's local browser storage.
3. **Safety Guardrails:**
   - **No Financial Data:** Saathi never collects or stores bank account numbers, passwords, OTPs, or credit card details.
   - **No Medical Prescription:** Explicit guardrails prevent the AI from prescribing medications or altering clinical dosages.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Lucide React icons, Web Speech API.
- **Backend:** Node.js, Express, tsx, esbuild.
- **AI Engine:** Google GenAI SDK (`@google/genai`) using `gemini-2.5-flash`.
- **Testing:** Vitest for automated unit tests.
- **Tooling:** Vite, TypeScript compiler (`tsc --noEmit`).

---

## 🧪 Testing & Verification

The repository includes automated unit tests covering storage, speech synthesis, and safety guardrails:

```bash
# Run unit tests
npm test

# Type-check codebase
npm run lint

# Compile for production
npm run build
```

---

## 📋 Hackathon Evaluation Rubric Mapping

| Criteria | Implementation in Saathi |
| :--- | :--- |
| **1. Code Quality** | Modular React components, strict TypeScript typing, centralized `aiService`, clean folder structure. |
| **2. Security** | Server-side Gemini API key isolation, input sanitization, rate limiting, no sensitive data stored. |
| **3. Efficiency** | Fast response times, timeout protections (15s), exponential backoff retries, local storage caching. |
| **4. Testing** | Comprehensive Vitest suite validating speech synthesis, storage integrity, and AI safety disclaimers. |
| **5. Accessibility** | Large readable typography, high-contrast mode, speech synthesis, 48px+ touch targets, bilingual interface. |
| **6. Problem Alignment** | Specifically tackles senior isolation, digital fraud, medicine schedules, doctor visit anxiety, and complex bureaucracy. |

---

*Saathi – empowering senior citizens with independence, safety, and dignity in the digital age.*
