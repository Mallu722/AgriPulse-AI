import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  TrendingUp,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Citation {
  issuer: string;
  document_title: string;
  section: string;
  source_url: string;
  publication_date: string;
  retrieval_date: string;
  excerpt: string;
  relevance_score?: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  spokenAnswer?: string;
  timestamp: string;
  mode?: string;
  citations?: Citation[];
  toolOutputs?: Record<string, any>;
  assumptions?: string;
  abstention?: boolean;
  promptInjection?: boolean;
}

const KANNADA_NUM_WORDS: Record<number, string> = {
  0: 'ಸೊನ್ನೆ', 1: 'ಒಂದು', 2: 'ಎರಡು', 3: 'ಮೂರು', 4: 'ನಾಲ್ಕು', 5: 'ಐದು',
  6: 'ಆರು', 7: 'ಏಳು', 8: 'ಎಂಟು', 9: 'ಒಂಬತ್ತು', 10: 'ಹತ್ತು',
  11: 'ಹನ್ನೊಂದು', 12: 'ಹನ್ನೆರಡು', 13: 'ಹದಿಮೂರು', 14: 'ಹದಿನಾಲ್ಕು', 15: 'ಹದಿನೈದು',
  16: 'ಹದಿನಾರು', 17: 'ಹದಿನೇಳು', 18: 'ಹದಿನೆಂಟು', 19: 'ಹತ್ತೊಂಬತ್ತು', 20: 'ಇಪ್ಪತ್ತು',
  21: 'ಇಪ್ಪತ್ತೊಂದು', 22: 'ಇಪ್ಪತ್ತೆರಡು', 23: 'ಇಪ್ಪತ್ತಮೂರು', 24: 'ಇಪ್ಪತ್ತನಾಲ್ಕು', 25: 'ಇಪ್ಪತ್ತೈದು',
  26: 'ಇಪ್ಪತ್ತಾರು', 27: 'ಇಪ್ಪತ್ತೇಳು', 28: 'ಇಪ್ಪತ್ತೆಂಟು', 29: 'ಇಪ್ಪತ್ತೊಂಬತ್ತು', 30: 'ಮೂವತ್ತು',
  31: 'ಮೂವತ್ತೊಂದು', 32: 'ಮೂವತ್ತೆರಡು', 33: 'ಮೂವತ್ತಮೂರು', 34: 'ಮೂವತ್ತನಾಲ್ಕು', 35: 'ಮೂವತ್ತೈದು',
  36: 'ಮೂವತ್ತಾರು', 37: 'ಮೂವತ್ತೇಳು', 38: 'ಮೂವತ್ತೆಂಟು', 39: 'ಮೂವತ್ತೊಂಬತ್ತು', 40: 'ನಲವತ್ತು',
  41: 'ನಲವತ್ತೊಂದು', 42: 'ನಲವತ್ತೆರಡು', 43: 'ನಲವತ್ತಮೂರು', 44: 'ನಲವತ್ತನಾಲ್ಕು', 45: 'ನಲವತ್ತೈದು',
  46: 'ನಲವತ್ತಾರು', 47: 'ನಲವತ್ತೇಳು', 48: 'ನಲವತ್ತೆಂಟು', 49: 'ನಲವತ್ತೊಂಬತ್ತು', 50: 'ಐವತ್ತು',
  51: 'ಐವತ್ತೊಂದು', 52: 'ಐವತ್ತೆರಡು', 53: 'ಐವತ್ತಮೂರು', 54: 'ಐವತ್ತನಾಲ್ಕು', 55: 'ಐವತ್ತೈದು',
  56: 'ಐವತ್ತಾರು', 57: 'ಐವತ್ತೇಳು', 58: 'ಐವತ್ತೆಂಟು', 59: 'ಐವತ್ತೊಂಬತ್ತು', 60: 'ಅರವತ್ತು',
  61: 'ಅರವತ್ತೊಂದು', 62: 'ಅರವತ್ತೆರಡು', 63: 'ಅರವತ್ತಮೂರು', 64: 'ಅರವತ್ತನಾಲ್ಕು', 65: 'ಅರವತ್ತೈದು',
  66: 'ಅರವತ್ತಾರು', 67: 'ಅರವತ್ತೇಳು', 68: 'ಅರವತ್ತೆಂಟು', 69: 'ಅರವತ್ತೊಂಬತ್ತು', 70: 'ಎಪ್ಪತ್ತು',
  71: 'ಎಪ್ಪತ್ತೊಂದು', 72: 'ಎಪ್ಪತ್ತೆರಡು', 73: 'ಎಪ್ಪತ್ತಮೂರು', 74: 'ಎಪ್ಪತ್ತನಾಲ್ಕು', 75: 'ಎಪ್ಪತ್ತೈದು',
  76: 'ಎಪ್ಪತ್ತಾರು', 77: 'ಎಪ್ಪತ್ತೇಳು', 78: 'ಎಪ್ಪತ್ತೆಂಟು', 79: 'ಎಪ್ಪತ್ತೊಂಬತ್ತು', 80: 'ಎಂಬತ್ತು',
  81: 'ಎಂಬತ್ತೊಂದು', 82: 'ಎಂಬತ್ತೆರಡು', 83: 'ಎಂಬತ್ತಮೂರು', 84: 'ಎಂಬತ್ತನಾಲ್ಕು', 85: 'ಎಂಬತ್ತೈದು',
  86: 'ಎಂಬತ್ತಾರು', 87: 'ಎಂಬತ್ತೇಳು', 88: 'ಎಂಬತ್ತೆಂಟು', 89: 'ಎಂಬತ್ತೊಂಬತ್ತು', 90: 'ತೊಂಬತ್ತು',
  91: 'ತೊಂಬತ್ತೊಂದು', 92: 'ತೊಂಬತ್ತೆರಡು', 93: 'ತೊಂಬತ್ತಮೂರು', 94: 'ತೊಂಬತ್ತನಾಲ್ಕು', 95: 'ತೊಂಬತ್ತೈದು',
  96: 'ತೊಂಬತ್ತಾರು', 97: 'ತೊಂಬತ್ತೇಳು', 98: 'ತೊಂಬತ್ತೆಂಟು', 99: 'ತೊಂಬತ್ತೊಂಬತ್ತು',
};

const KANNADA_HUNDREDS_WORDS: Record<number, string> = {
  1: 'ನೂರು', 2: 'ಇನ್ನೂರು', 3: 'ಮುನ್ನೂರು', 4: 'ನಾನೂರು',
  5: 'ಐನೂರು', 6: 'ಆರೂರು', 7: 'ಏಳನೂರು', 8: 'ಎಂಟುನೂರು', 9: 'ಒಂಬೈನೂರು',
};

const anyKannadaChar = (str: string): boolean => /[\u0C80-\u0CFF]/.test(str);

const numberToKannadaWords = (num: number): string => {
  if (num in KANNADA_NUM_WORDS) return KANNADA_NUM_WORDS[num];
  if (num < 0) return `ಮೈನಸ್ ${numberToKannadaWords(Math.abs(num))}`;

  const parts: string[] = [];
  const crores = Math.floor(num / 10000000);
  let rem = num % 10000000;
  if (crores > 0) parts.push(`${numberToKannadaWords(crores)} ಕೋಟಿ`);

  const lakhs = Math.floor(rem / 100000);
  rem = rem % 100000;
  if (lakhs > 0) parts.push(`${numberToKannadaWords(lakhs)} ಲಕ್ಷ`);

  const thousands = Math.floor(rem / 1000);
  rem = rem % 1000;
  if (thousands > 0) parts.push(`${numberToKannadaWords(thousands)} ಸಾವಿರ`);

  const hundreds = Math.floor(rem / 100);
  rem = rem % 100;
  if (hundreds > 0) {
    parts.push(KANNADA_HUNDREDS_WORDS[hundreds] || `${numberToKannadaWords(hundreds)} ನೂರು`);
  }

  if (rem > 0) {
    parts.push(KANNADA_NUM_WORDS[rem] || String(rem));
  }

  return parts.join(' ');
};

const convertAllNumbersToKannada = (text: string): string => {
  if (!text) return '';
  const out = text
    .replace(/\b1\s*ಕ್ವಿಂಟಾಲ್/g, 'ಒಂದು ಕ್ವಿಂಟಾಲ್')
    .replace(/\b1\s*Quintal\b/gi, 'ಒಂದು ಕ್ವಿಂಟಾಲ್');

  return out.replace(/\b\d+(?:,\d+)*\b/g, (match) => {
    const raw = match.replace(/,/g, '');
    const val = parseInt(raw, 10);
    if (!isNaN(val)) {
      return numberToKannadaWords(val);
    }
    return match;
  });
};

// Helper to strip markdown, citations, and translate English words so speech is purely Kannada
const cleanTextForSpeech = (text: string): string => {
  if (!text) return '';
  let cleaned = text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/^#+\s+/gm, '') // Headers
    .replace(/^>\s+/gm, '') // Quotes
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/•/g, '') // Bullets
    .replace(/[#*_~`]/g, '') // Remaining symbols
    // Pronounce ₹ or Rs as ರೂಪಾಯಿ
    .replace(/₹\s*([0-9,]+)/g, '$1 ರೂಪಾಯಿ')
    .replace(/Rs\.?\s*([0-9,]+)/gi, '$1 ರೂಪಾಯಿ')
    .replace(/\bAgmarknet\b/gi, 'ಮಾರುಕಟ್ಟೆ')
    .replace(/\bAPMC\b/gi, 'ಎಪಿಎಂಸಿ')
    .replace(/\/ಕ್ವಿಂಟಾಲ್/g, ' ಕ್ವಿಂಟಾಲ್‌ಗೆ ')
    .replace(/\/Quintal/gi, ' ಕ್ವಿಂಟಾಲ್‌ಗೆ ')
    // Translate any English crop or district words into authentic Kannada
    .replace(/\bOnion\b/gi, 'ಈರುಳ್ಳಿ')
    .replace(/\bTomato\b/gi, 'ಟೊಮೆಟೊ')
    .replace(/\bPotato\b/gi, 'ಆಲೂಗಡ್ಡೆ')
    .replace(/\bMaize\b/gi, 'ಮೆಕ್ಕೆಜೋಳ')
    .replace(/\bRagi\b/gi, 'ರಾಗಿ')
    .replace(/\bCotton\b/gi, 'ಹತ್ತಿ')
    .replace(/\bTur\b/gi, 'ತೊಗರಿ')
    .replace(/\bChilli\b/gi, 'ಮೆಣಸಿನಕಾಯಿ')
    .replace(/\bGroundnut\b/gi, 'ಶೇಂಗಾ')
    .replace(/\bPaddy\b/gi, 'ಭತ್ತ')
    .replace(/\bArecanut\b/gi, 'ಅಡಿಕೆ')
    .replace(/\bGinger\b/gi, 'ಶುಂಠಿ')
    .replace(/\bGarlic\b/gi, 'ಬೆಳ್ಳುಳ್ಳಿ')
    .replace(/\bBanana\b/gi, 'ಬಾಳೆ')
    .replace(/\bKolar\b/gi, 'ಕೋಲಾರ')
    .replace(/\bBangalore\b/gi, 'ಬೆಂಗಳೂರು')
    .replace(/\bBengaluru\b/gi, 'ಬೆಂಗಳೂರು')
    .replace(/\bChitradurga\b/gi, 'ಚಿತ್ರದುರ್ಗ')
    .replace(/\bBelagavi\b/gi, 'ಬೆಳಗಾವಿ')
    .replace(/\bBelgaum\b/gi, 'ಬೆಳಗಾವಿ')
    .replace(/\bDavanagere\b/gi, 'ದಾವಣಗೆರೆ')
    .replace(/\bHaveri\b/gi, 'ಹಾವೇರಿ')
    .replace(/\bHubballi\b/gi, 'ಹುಬ್ಬಳ್ಳಿ')
    .replace(/\bHubli\b/gi, 'ಹುಬ್ಬಳ್ಳಿ')
    .replace(/\bDharwad\b/gi, 'ಧಾರವಾಡ')
    .replace(/\bMysuru\b/gi, 'ಮೈಸೂರು')
    .replace(/\bMysore\b/gi, 'ಮೈಸೂರು')
    .replace(/\bMandya\b/gi, 'ಮಂಡ್ಯ')
    .replace(/\bTumakuru\b/gi, 'ತುಮಕೂರು')
    .replace(/\bTumkur\b/gi, 'ತುಮಕೂರು')
    .replace(/\bHassan\b/gi, 'ಹಾಸನ')
    .replace(/\bModal Price\b/gi, 'ಮಾದರಿ ಬೆಲೆ')
    .replace(/\bModal\b/gi, 'ಮಾದರಿ')
    .replace(/\bPrice\b/gi, 'ಬೆಲೆ')
    .replace(/\bRate\b/gi, 'ದರ')
    .replace(/\bMandi\b/gi, 'ಮಂಡಿ')
    .replace(/\bYard\b/gi, 'ಮಂಡಿ')
    .replace(/\bMarket\b/gi, 'ಮಾರುಕಟ್ಟೆ')
    .replace(/\bQuintal\b/gi, 'ಕ್ವಿಂಟಾಲ್')
    .replace(/\bQtl\b/gi, 'ಕ್ವಿಂಟಾಲ್')
    .replace(/\bMin\b/gi, 'ಕನಿಷ್ಠ')
    .replace(/\bMax\b/gi, 'ಗರಿಷ್ಠ')
    .replace(/\s+/g, ' ')
    .trim();

  // Convert all numbers into authentic Kannada words
  if (anyKannadaChar(cleaned)) {
    cleaned = convertAllNumbersToKannada(cleaned);
  }
  return cleaned;
};

export const AiAssistant: React.FC = () => {
  const { t, language, profile, apiBase, detectLocationViaGps } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'kn'
          ? 'ನಮಸ್ಕಾರ! ನಾನು ಅಗ್ರಿಪಲ್ಸ್ ಕೃಷಿ AI ಸಹಾಯಕ. ಐಸಿಎಆರ್ (ICAR), ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳ ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ ಮತ್ತು ಎಪಿಎಂಸಿ ಮಂಡಿ ದತ್ತಾಂಶಗಳ ಆಧಾರದ ಮೇಲೆ ಮಾತ್ರ ನಾನು ನಿಖರವಾದ ಕೃಷಿ ಮಾಹಿತಿ ಮತ್ತು ಬೆಲೆಗಳನ್ನು ಒದಗಿಸುತ್ತೇನೆ. ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ಕನ್ನಡದಲ್ಲೇ ಮಾತನಾಡಬಹುದು!'
          : 'Welcome! I am the AgriPulse Agricultural AI Assistant. I provide factual farming guidance strictly grounded in official ICAR, Agricultural University Package of Practices, and APMC mandi records. You can also click the mic to speak in Kannada or English!',
      spokenAnswer:
        language === 'kn'
          ? 'ನಮಸ್ಕಾರ! ನಾನು ಅಗ್ರಿಪಲ್ಸ್ ಕೃಷಿ AI ಸಹಾಯಕ. ಕೃಷಿ ಮಾಹಿತಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳಿಗಾಗಿ ಪ್ರಶ್ನೆ ಕೇಳಿ.'
          : 'Welcome! I am the AgriPulse AI assistant. Ask any agricultural question or market price.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'retrieval_excerpt_fallback',
      assumptions: t.assistant.unsupportedDisclaimer,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});

  // GPS Location Tracking State
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);

  // Voice Input (STT) State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceLang, setVoiceLang] = useState<'kn' | 'en'>('kn'); // Default to Kannada!
  const recognitionRef = useRef<any>(null);

  // Available Synthesis Voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const updateVoices = () => {
      const vList = window.speechSynthesis.getVoices();
      setVoices(vList);
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  const handleDetectGps = async () => {
    setDetectingGps(true);
    setGpsStatus(null);
    try {
      const res = await detectLocationViaGps();
      if (res.success && res.district) {
        setGpsStatus(language === 'kn' ? `ಸ್ಥಳ: ${res.district}` : `Detected: ${res.district}`);
      } else {
        setGpsStatus(res.message);
      }
    } catch {
      setGpsStatus('GPS error');
    } finally {
      setDetectingGps(false);
      setTimeout(() => setGpsStatus(null), 4000);
    }
  };

  // Normalizes misheard English phonetics to authentic Kannada agricultural queries
  const normalizeVoiceTranscript = (raw: string, vLang: 'kn' | 'en'): string => {
    if (!raw) return '';
    if (vLang === 'kn') {
      const lower = raw.toLowerCase().trim();
      if (
        lower.includes('onion') ||
        lower.includes('eerulli') ||
        lower.includes('erulli') ||
        lower.includes('irulli')
      ) {
        return 'ಈರುಳ್ಳಿ 1 ಕ್ವಿಂಟಾಲ್ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಎಷ್ಟು ಮತ್ತು ಕರ್ನಾಟಕದಲ್ಲೇ ಅತ್ಯಂತ ಹೆಚ್ಚು ದರ ಎಲ್ಲಿದೆ?';
      }
      if (lower.includes('yes tomato rated') || lower.includes('tomato rate') || lower.includes('tomato rated')) {
        return 'ಕೋಲಾರದಲ್ಲಿ ಟೊಮೆಟೊ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಎಷ್ಟು?';
      }
      if (lower.includes('ragi rate') || lower.includes('ragi price') || lower.includes('ragi bele')) {
        return 'ರಾಗಿ ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP) ಎಷ್ಟು?';
      }
      if (lower.includes('weather') || lower.includes('rain') || lower.includes('havamana')) {
        return 'ಇಂದಿನ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಏನು?';
      }
      if (lower.includes('fertilizer') || lower.includes('gobara') || lower.includes('gobbara')) {
        return 'ಬೆಳೆಗೆ ಎಷ್ಟು ಗೊಬ್ಬರ ಹಾಕಬೇಕು?';
      }
    }
    return raw;
  };

  // Voice Output (TTS) State
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Web Speech API for Voice Input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = voiceLang === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        const normalized = normalizeVoiceTranscript(transcript, voiceLang);
        setInputQuery(normalized);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
        audioPlayerRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [voiceLang]);

  // Handle Speech-to-Text Toggle
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Strictly enforce selected voice language
      recognitionRef.current.lang = voiceLang === 'kn' ? 'kn-IN' : 'en-IN';
      try {
        recognitionRef.current.start();
      } catch {
        // Recognition already running or restarting
      }
    }
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = '';
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
  };

  const fallbackSpeechSynthesis = (msgId: string, cleanText: string, isKn: boolean) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isKn ? 'kn-IN' : 'en-IN';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    if (isKn) {
      const knVoice = availableVoices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('kn') ||
          v.name.toLowerCase().includes('kannada') ||
          v.name.toLowerCase().includes('kn-in')
      );
      if (knVoice) {
        utterance.voice = knVoice;
      }
    } else {
      const enVoice = availableVoices.find(
        (v) =>
          v.lang.toLowerCase().includes('en-in') ||
          v.name.toLowerCase().includes('india') ||
          v.lang.toLowerCase().startsWith('en')
      );
      if (enVoice) {
        utterance.voice = enVoice;
      }
    }

    utterance.onstart = () => {
      setCurrentlySpeakingId(msgId);
    };
    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };
    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Text-to-Speech Handler
  const speakMessage = (msgId: string, text: string, spokenText?: string) => {
    // If already speaking this message, toggle off
    if (currentlySpeakingId === msgId) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    // Prioritize clean spoken text provided by backend to avoid citations & English noise
    const rawToSpeak = spokenText && spokenText.trim().length > 0 ? spokenText : text;
    const cleanText = cleanTextForSpeech(rawToSpeak);
    if (!cleanText) return;

    const isKn = anyKannadaChar(cleanText) || language === 'kn' || voiceLang === 'kn';

    // 1. PRIMARY: High-Fidelity Indic/Kannada Audio Stream from Backend
    // Provides studio-quality native Kannada pronunciation and Kannada numbers
    if (isKn) {
      try {
        const ttsUrl = `${apiBase}/assistant/tts?text=${encodeURIComponent(cleanText)}&lang=kn`;
        const audio = new Audio(ttsUrl);
        audioPlayerRef.current = audio;
        setCurrentlySpeakingId(msgId);

        audio.onended = () => {
          setCurrentlySpeakingId(null);
          audioPlayerRef.current = null;
        };

        audio.onerror = () => {
          // Fall back to browser Web Speech API
          audioPlayerRef.current = null;
          fallbackSpeechSynthesis(msgId, cleanText, true);
        };

        audio.play().catch(() => {
          fallbackSpeechSynthesis(msgId, cleanText, true);
        });
        return;
      } catch {
        // Fall back
      }
    }

    // 2. English speech synthesis
    fallbackSpeechSynthesis(msgId, cleanText, isKn);
  };


  const toggleCitations = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleSendQuery = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    stopSpeaking();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const isKn = anyKannadaChar(q) || voiceLang === 'kn' || language === 'kn';

      // Send recent conversation history so the assistant builds on previous turns
      const conversationHistory = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const payload = {
        query: q,
        language_preference: isKn ? 'kn' : 'en',
        district: profile.district,
        farmer_profile: {
          district: profile.district,
          land_area_acres: profile.land_area_acres,
          soil_type: profile.soil_type,
          soil_ph: profile.soil_ph,
          water_availability: profile.water_availability,
          season: profile.season,
        },
        conversation_history: conversationHistory,
      };

      const res = await axios.post(`${apiBase}/assistant`, payload, { timeout: 8000 });
      const data = res.data;

      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: data.answer,
        spokenAnswer: data.spoken_answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: data.mode,
        citations: data.citations || [],
        toolOutputs: data.tool_outputs,
        assumptions: data.assumptions_and_limitations,
        abstention: data.abstention,
        promptInjection: data.prompt_injection_flagged,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If Auto-read is enabled, speak the answer aloud automatically using clean spokenAnswer!
      if (autoSpeak) {
        setTimeout(() => {
          speakMessage(assistantMsgId, assistantMsg.text, assistantMsg.spokenAnswer);
        }, 300);
      }
    } catch {
      const errorMsgId = `assistant-err-${Date.now()}`;
      const errorMsgText =
        language === 'kn'
          ? 'ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Unable to communicate with assistant backend. Please verify your connection or try again.';

      const errorMsg: ChatMessage = {
        id: errorMsgId,
        sender: 'assistant',
        text: errorMsgText,
        spokenAnswer: errorMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        abstention: true,
      };
      setMessages((prev) => [...prev, errorMsg]);

      if (autoSpeak) {
        setTimeout(() => speakMessage(errorMsgId, errorMsgText, errorMsgText), 300);
      }
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    {
      text: 'ಈರುಳ್ಳಿ 1 ಕ್ವಿಂಟಾಲ್ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಎಷ್ಟು ಮತ್ತು ಕರ್ನಾಟಕದಲ್ಲೇ ಅತ್ಯಂತ ಹೆಚ್ಚು ದರ ಎಲ್ಲಿದೆ?',
      label: language === 'kn' ? '🧅 ಈರುಳ್ಳಿ 1 ಕ್ವಿಂಟಾಲ್ & ಗರಿಷ್ಠ ದರ' : '🧅 Onion 1 Qtl & Top APMC',
    },
    { text: t.assistant.prompt2, label: language === 'kn' ? '🍅 ಕೋಲಾರ ಟೊಮೆಟೊ ಬೆಲೆ' : 'Tomato APMC Price' },
    { text: t.assistant.prompt1, label: language === 'kn' ? '🌾 ರಾಗಿ ರಸಗೊಬ್ಬರ (NPK)' : 'Ragi NPK Dosage' },
    { text: t.assistant.prompt3, label: language === 'kn' ? '🛡️ ರಾಗಿ ಬೆಂಕಿ ರೋಗ' : 'Ragi Blast Control' },
    { text: t.assistant.prompt4, label: language === 'kn' ? '💰 ಈರುಳ್ಳಿ 2 ಎಕರೆ ಲಾಭ' : 'Onion 2-Acre Profit' },
  ];

  return (
    <div className="page-container assistant-page">
      {/* Page Header */}
      <div className="page-header-farmer">
        <div className="header-icon-badge amber">
          <Bot size={28} />
        </div>
        <div>
          <h1 className="page-heading">{t.assistant.title}</h1>
          <p className="page-subheading">{t.assistant.subtitle}</p>
        </div>

        {/* Live GPS location detector & Voice Controls */}
        <div className="voice-controls-top" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={handleDetectGps}
            disabled={detectingGps}
            className="btn-gps-detect"
            title="ಲೈವ್ ಜಿಪಿಎಸ್ ಮೂಲಕ ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಪತ್ತೆಹಚ್ಚಿ (Auto-detect live GPS district)"
          >
            <MapPin size={15} />
            <span>{detectingGps ? 'ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...' : `📍 ${profile.district || 'ಸ್ಥಳ'}`}</span>
          </button>
          {gpsStatus && <span className="gps-status-pill">{gpsStatus}</span>}

          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`btn-voice-toggle ${autoSpeak ? 'active' : ''}`}
            title="ಉತ್ತರವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಧ್ವನಿಯಲ್ಲಿ ಓದಿ"
          >
            {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>
              {autoSpeak
                ? language === 'kn' ? 'ಧ್ವನಿ: ಆನ್' : 'Audio: ON'
                : language === 'kn' ? 'ಧ್ವನಿ: ಆಫ್' : 'Audio: OFF'}
            </span>
          </button>

          {currentlySpeakingId && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="btn-stop-audio"
              title="ಧ್ವನಿಯನ್ನು ನಿಲ್ಲಿಸಿ"
            >
              <VolumeX size={16} />
              <span>ನಿಲ್ಲಿಸಿ (Stop)</span>
            </button>
          )}
        </div>
      </div>

      {/* Grounding & Provenance Banner */}
      <div className="assistant-grounding-strip">
        <div className="grounding-pill">
          <ShieldCheck size={18} className="text-primary" />
          <span>{t.assistant.verifiedSourcesBadge} (UASB, IIHR, IMD, Agmarknet)</span>
        </div>
        <div className="grounding-pill">
          <CheckCircle2 size={18} className="text-accent" />
          <span>ಶೂನ್ಯ ಕಲ್ಪಿತ ಬೆಲೆಗಳು (Zero Hallucinated Numbers)</span>
        </div>
        <div className="grounding-pill">
          <Sparkles size={18} className="text-warning" />
          <span>ಕನ್ನಡ ಧ್ವನಿ ಇನ್ಪುಟ್ (Mic) & ಕನ್ನಡ ಆಡಿಯೋ ಸಹಾಯಕ</span>
        </div>
      </div>

      {/* Quick Questions Chips */}
      <div className="quick-prompts-bar">
        <div className="quick-prompts-label">
          <HelpCircle size={16} />
          <span>{t.assistant.quickPromptsTitle}:</span>
        </div>
        <div className="quick-chips-group">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendQuery(p.text)}
              disabled={loading}
              className="quick-chip-btn"
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="chat-feed-container">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const hasCitations = msg.citations && msg.citations.length > 0;
          const isExpanded = !!expandedCitations[msg.id];
          const isSpeakingThis = currentlySpeakingId === msg.id;

          return (
            <div key={msg.id} className={`chat-message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
              <div className={`message-avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
                {isUser ? <TrendingUp size={18} /> : <Bot size={20} />}
              </div>

              <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
                <div className="bubble-header">
                  <span className="sender-name">
                    {isUser ? (profile.farmer_name || 'ನೀವು / You') : 'ಅಗ್ರಿಪಲ್ಸ್ ಕೃಷಿ AI (AgriPulse)'}
                  </span>
                  <div className="bubble-header-actions">
                    <span className="timestamp">{msg.timestamp}</span>

                    {/* Audio Speaker Play/Pause Button on each assistant bubble */}
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => speakMessage(msg.id, msg.text, msg.spokenAnswer)}
                        className={`btn-bubble-audio ${isSpeakingThis ? 'speaking' : ''}`}
                        title={isSpeakingThis ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'ಕನ್ನಡ ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ'}
                      >
                        {isSpeakingThis ? (
                          <>
                            <div className="audio-wave-anim">
                              <span></span><span></span><span></span>
                            </div>
                            <span>ಧ್ವನಿ ನಿಲ್ಲಿಸಿ</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={15} />
                            <span>ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Mode & Abstention Indicators */}
                {!isUser && msg.mode && (
                  <div className="msg-badges-strip">
                    <span className="mode-badge">
                      <BookOpen size={13} />
                      {msg.mode === 'llm_synthesized'
                        ? 'ದೃಢೀಕೃತ AI ಸಂಶ್ಲೇಷಣೆ (Ollama / LLM Grounded)'
                        : t.assistant.fallbackBadge}
                    </span>
                    {msg.abstention && (
                      <span className="abstention-badge">
                        <AlertCircle size={13} />
                        ತಿರಸ್ಕೃತ / ಅಧಿಕೃತ ದಾಖಲೆ ಕೊರತೆ (Abstention)
                      </span>
                    )}
                    {msg.promptInjection && (
                      <span className="injection-badge">
                        ⚠️ ಭದ್ರತಾ ಉಲ್ಲಂಘನೆ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ (Security Protected)
                      </span>
                    )}
                  </div>
                )}

                {/* Main Message Text */}
                <div className="bubble-text">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} style={{ marginBottom: '0.65rem', whiteSpace: 'pre-line' }}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Citations Drawer */}
                {!isUser && hasCitations && (
                  <div className="citations-box">
                    <button
                      type="button"
                      onClick={() => toggleCitations(msg.id)}
                      className="citations-toggle-btn"
                    >
                      <BookOpen size={15} />
                      <span>
                        {t.assistant.citationsTitle} ({msg.citations!.length} ದಾಖಲೆಗಳು)
                      </span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isExpanded && (
                      <div className="citations-list">
                        {msg.citations!.map((cit, cIdx) => (
                          <div key={cIdx} className="citation-item">
                            <div className="cit-header">
                              <span className="cit-num">#{cIdx + 1}</span>
                              <strong className="cit-title">{cit.document_title}</strong>
                            </div>
                            <div className="cit-meta">
                              <span>ಮೂಲ: <strong>{cit.issuer}</strong></span>
                              <span>•</span>
                              <span>ದಿನಾಂಕ: {cit.publication_date}</span>
                              <span>•</span>
                              <span>ವಿಭಾಗ: {cit.section}</span>
                            </div>
                            <blockquote className="cit-quote">
                              "{cit.excerpt}"
                            </blockquote>
                            {cit.source_url && (
                              <a
                                href={cit.source_url}
                                target="_blank"
                                rel="noreferrer"
                                className="cit-link"
                              >
                                <span>ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ (Open Official Source)</span>
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Assumptions and Scope Disclaimer */}
                {!isUser && msg.assumptions && (
                  <div className="bubble-assumptions">
                    <ShieldCheck size={14} className="text-muted" />
                    <span>{msg.assumptions}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="chat-message-row assistant-row">
            <div className="message-avatar assistant-avatar">
              <Bot size={20} />
            </div>
            <div className="message-bubble assistant-bubble loading-bubble">
              <div className="loading-dots">
                <span className="dot dot1"></span>
                <span className="dot dot2"></span>
                <span className="dot dot3"></span>
              </div>
              <span className="loading-text">{t.assistant.asking}</span>
            </div>
          </div>
        )}
      </div>

      {/* Voice Input Active Banner */}
      {isListening && (
        <div className="mic-listening-banner">
          <div className="listening-pulse-dot"></div>
          <span className="listening-text">
            {voiceLang === 'kn'
              ? '🎤 ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ... ನಾವು ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ...'
              : '🎤 Listening to English speech... speak now'}
          </span>
          <button
            type="button"
            onClick={toggleListening}
            className="btn-cancel-listening"
          >
            {voiceLang === 'kn' ? 'ಮುಗಿಸಿ' : 'Done'}
          </button>
        </div>
      )}

      {/* Input Box Row with Voice Group & Send */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="assistant-input-box"
      >
        {/* Kannada Voice Mic Group */}
        {speechSupported && (
          <div className="voice-input-group">
            <button
              type="button"
              onClick={toggleListening}
              className={`btn-mic-record ${isListening ? 'listening' : ''}`}
              title={voiceLang === 'kn' ? 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ' : 'Click to speak'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button
              type="button"
              onClick={() => {
                const nextLang = voiceLang === 'kn' ? 'en' : 'kn';
                setVoiceLang(nextLang);
                if (recognitionRef.current) {
                  recognitionRef.current.lang = nextLang === 'kn' ? 'kn-IN' : 'en-IN';
                }
              }}
              className={`btn-voice-lang-chip ${voiceLang === 'en' ? 'en' : ''}`}
              title={voiceLang === 'kn' ? 'ಧ್ವನಿ ಭಾಷೆ ಬದಲಿಸಿ' : 'Toggle Voice Language'}
            >
              {voiceLang === 'kn' ? 'ಕನ್ನಡ (kn)' : 'English (en)'}
            </button>
          </div>
        )}

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            isListening
              ? voiceLang === 'kn'
                ? 'ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ... ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ...'
                : 'Listening... speak now'
              : voiceLang === 'kn'
              ? 'ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ ಮೈಕ್ ಬಳಸಿ ಮಾತನಾಡಿ...'
              : t.assistant.inputPlaceholder
          }
          disabled={loading}
          className="assistant-text-input"
        />

        {inputQuery.trim() && (
          <button
            type="button"
            onClick={() => setInputQuery('')}
            className="btn-clear-input"
            title="ತೆರವುಗೊಳಿಸಿ"
          >
            <RotateCcw size={15} />
          </button>
        )}

        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="btn-assistant-send"
        >
          <Send size={18} />
          <span>{loading ? t.assistant.asking.split('...')[0] : t.assistant.askBtn}</span>
        </button>
      </form>
    </div>
  );
};

export default AiAssistant;
