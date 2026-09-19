import { FeatureCardInfo, ReminderItem } from '../types';

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'Medicine – BP & Sugar Tablet',
    titleHi: 'दवाई – रात की बीपी और शुगर की गोली',
    time: '8:00 PM',
    timeLabel: 'Tonight 8:00 PM',
    timeLabelHi: 'आज रात 8:00 बजे',
    category: 'medicine',
    completed: false,
    notes: 'Take after dinner with lukewarm water',
    notesHi: 'रात के खाने के 15 मिनट बाद गुनगुने पानी से लें',
    important: true,
  },
  {
    id: 'rem-2',
    title: 'Doctor Appointment – Dr. Sharma',
    titleHi: 'डॉक्टर अपॉइंटमेंट – डॉ. शर्मा (कार्डियोलॉजिस्ट)',
    time: 'Tomorrow 11:30 AM',
    timeLabel: 'Tomorrow 11:30 AM',
    timeLabelHi: 'कल सुबह 11:30 बजे',
    category: 'doctor',
    completed: false,
    notes: 'Max Hospital, Room 204. Carry previous blood test report file.',
    notesHi: 'मैक्स अस्पताल, कमरा नं. 204. पुरानी ब्लड टेस्ट रिपोर्ट फ़ाइल साथ ले जाएं।',
    important: true,
  },
  {
    id: 'rem-3',
    title: 'Family Call – Rahul & Grandkids',
    titleHi: 'परिवार से बात – राहुल और बच्चों से वीडियो कॉल',
    time: '7:00 PM',
    timeLabel: 'Today 7:00 PM',
    timeLabelHi: 'आज शाम 7:00 बजे',
    category: 'family',
    completed: true,
    notes: 'WhatsApp video call with granddaughter Meera',
    notesHi: 'पोती मीरा और राहुल से व्हाट्सएप वीडियो कॉल पर बात हुई',
  },
];

export const FEATURE_CARDS: FeatureCardInfo[] = [
  {
    id: 'doctor',
    title: 'Doctor Appointment',
    titleHi: 'डॉक्टर अपॉइंटमेंट',
    subtitle: 'Step-by-step guidance for doctor visits, hospital prep & notes',
    subtitleHi: 'डॉक्टर से मिलने का समय, आवश्यक पर्चियां और पूछने वाले सवालों की तैयारी',
    iconName: 'Stethoscope',
    colorTheme: {
      bg: 'bg-emerald-50 hover:bg-emerald-100/80',
      border: 'border-emerald-200 hover:border-emerald-400',
      badgeBg: 'bg-emerald-600',
      badgeText: 'text-white',
      iconColor: 'text-emerald-700',
    },
    samplePrompts: [
      {
        hi: 'Mujhe kal doctor ke paas jana hai.',
        en: 'I need to go to the doctor tomorrow.',
      },
      {
        hi: 'डॉक्टर से क्या सवाल पूछने चाहिए?',
        en: 'What questions should I ask my doctor?',
      },
    ],
  },
  {
    id: 'medicine',
    title: 'Medicines & Reminders',
    titleHi: 'दवाइयाँ और रिमाइंडर्स',
    subtitle: 'Timely reminders for pills, simple dosage guidance & precautions',
    subtitleHi: 'समय पर दवाइयों की याद, खाने से पहले या बाद के नियम और सावधानियां',
    iconName: 'Pill',
    colorTheme: {
      bg: 'bg-sky-50 hover:bg-sky-100/80',
      border: 'border-sky-200 hover:border-sky-400',
      badgeBg: 'bg-sky-600',
      badgeText: 'text-white',
      iconColor: 'text-sky-700',
    },
    samplePrompts: [
      {
        hi: 'Yeh dawai khane se pehle leni hai ya baad mein?',
        en: 'Should I take this medicine before or after food?',
      },
      {
        hi: 'रात 8:00 बजे की दवाई का रिमाइंडर सेट कर दो।',
        en: 'Set a reminder for my 8:00 PM night medicine.',
      },
    ],
  },
  {
    id: 'scam',
    title: 'Scam Checker',
    titleHi: 'धोखाधड़ी / स्कैम जाँच',
    subtitle: 'Check suspicious SMS, WhatsApp messages, or calls safely',
    subtitleHi: 'संदिग्ध बिजली बिल, बैंक KYC या लॉटरी वाले मैसेज की तुरंत जाँच करें',
    iconName: 'ShieldAlert',
    colorTheme: {
      bg: 'bg-amber-50 hover:bg-amber-100/80',
      border: 'border-amber-200 hover:border-amber-400',
      badgeBg: 'bg-amber-600',
      badgeText: 'text-white',
      iconColor: 'text-amber-800',
    },
    samplePrompts: [
      {
        hi: 'WhatsApp pe message aaya hai ki bijli ka bill nahi bhara to light kat jayegi.',
        en: 'I received a message saying electricity will be cut if bill is not paid.',
      },
      {
        hi: 'Phone par koi OTP maang raha hai, kya main de doon?',
        en: 'Someone is asking for OTP on phone call, should I share?',
      },
    ],
  },
  {
    id: 'document',
    title: 'Explain Documents',
    titleHi: 'कागज़ात समझें',
    subtitle: 'Understand pension slips, medical bills & government notices simply',
    subtitleHi: 'पेंशन की पर्ची, अस्पताल का बिल या सरकारी फॉर्म 3 आसान लाइनों में समझें',
    iconName: 'FileText',
    colorTheme: {
      bg: 'bg-purple-50 hover:bg-purple-100/80',
      border: 'border-purple-200 hover:border-purple-400',
      badgeBg: 'bg-purple-600',
      badgeText: 'text-white',
      iconColor: 'text-purple-700',
    },
    samplePrompts: [
      {
        hi: 'Pension life certificate (Jeevan Pramaan) kaise banega?',
        en: 'How to submit digital life certificate for pension?',
      },
      {
        hi: 'अस्पताल के बिल में यह चार्ज किस बात का है?',
        en: 'Explain the charges on this hospital bill in simple words.',
      },
    ],
  },
];
