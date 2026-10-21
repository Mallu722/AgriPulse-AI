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
  timestamp: string;
  mode?: string;
  citations?: Citation[];
  toolOutputs?: Record<string, any>;
  assumptions?: string;
  abstention?: boolean;
  promptInjection?: boolean;
}

// Helper to strip markdown and symbols so speech is natural and fluent
const cleanTextForSpeech = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/^#+\s+/gm, '') // Headers
    .replace(/^>\s+/gm, '') // Quotes
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/•/g, '') // Bullets
    .replace(/[#*_~`]/g, '') // Remaining symbols
    .replace(/\s+/g, ' ')
    .trim();
};

export const AiAssistant: React.FC = () => {
  const { t, language, profile, apiBase } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'kn'
          ? 'ನಮಸ್ಕಾರ! ನಾನು ಅಗ್ರಿಪಲ್ಸ್ ಕೃಷಿ AI ಸಹಾಯಕ. ಐಸಿಎಆರ್ (ICAR), ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳ ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ ಮತ್ತು ಎಪಿಎಂಸಿ ಮಂಡಿ ದತ್ತಾಂಶಗಳ ಆಧಾರದ ಮೇಲೆ ಮಾತ್ರ ನಾನು ನಿಖರವಾದ ಕೃಷಿ ಮಾಹಿತಿ ಮತ್ತು ಬೆಲೆಗಳನ್ನು ಒದಗಿಸುತ್ತೇನೆ. ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ಕನ್ನಡದಲ್ಲೇ ಮಾತನಾಡಬಹುದು!'
          : 'Welcome! I am the AgriPulse Agricultural AI Assistant. I provide factual farming guidance strictly grounded in official ICAR, Agricultural University Package of Practices, and APMC mandi records. You can also click the mic to speak in Kannada or English!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'retrieval_excerpt_fallback',
      assumptions: t.assistant.unsupportedDisclaimer,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});

  // Voice Input (STT) State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceLang, setVoiceLang] = useState<'kn' | 'en'>('kn'); // Default to Kannada!
  const recognitionRef = useRef<any>(null);

  // Normalizes misheard English phonetics to authentic Kannada agricultural queries
  const normalizeVoiceTranscript = (raw: string, vLang: 'kn' | 'en'): string => {
    if (!raw) return '';
    if (vLang === 'kn') {
      const lower = raw.toLowerCase().trim();
      if (lower.includes('yes tomato rated') || lower.includes('tomato rate') || lower.includes('tomato rated')) {
        return 'ಕೋಲಾರದಲ್ಲಿ ಟೊಮೆಟೊ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಎಷ್ಟು?';
      }
      if (lower.includes('ragi rate') || lower.includes('ragi price') || lower.includes('ragi bele')) {
        return 'ರಾಗಿ ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP) ಎಷ್ಟು?';
      }
      if (lower.includes('onion rate') || lower.includes('eerulli')) {
        return 'ಈರುಳ್ಳಿ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಎಷ್ಟು?';
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

  // Text-to-Speech Handler
  const speakMessage = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    // If already speaking this message, stop it
    if (currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const isKn = anyKannadaChar(cleanText) || language === 'kn';
    utterance.lang = isKn ? 'kn-IN' : 'en-IN';
    utterance.rate = 0.95; // Slightly slower, clear pace for farmers

    // Try finding an installed Kannada voice
    const voices = window.speechSynthesis.getVoices();
    const knVoice = voices.find((v) => v.lang.startsWith('kn') || v.name.includes('Kannada'));
    if (knVoice) {
      utterance.voice = knVoice;
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

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
    }
  };

  const anyKannadaChar = (str: string) => /[\u0C80-\u0CFF]/.test(str);

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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: data.mode,
        citations: data.citations || [],
        toolOutputs: data.tool_outputs,
        assumptions: data.assumptions_and_limitations,
        abstention: data.abstention,
        promptInjection: data.prompt_injection_flagged,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If Auto-read is enabled, speak the answer aloud automatically!
      if (autoSpeak) {
        setTimeout(() => {
          speakMessage(assistantMsgId, data.answer);
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        abstention: true,
      };
      setMessages((prev) => [...prev, errorMsg]);

      if (autoSpeak) {
        setTimeout(() => speakMessage(errorMsgId, errorMsgText), 300);
      }
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { text: t.assistant.prompt1, label: language === 'kn' ? 'ರಾಗಿ ರಸಗೊಬ್ಬರ (NPK)' : 'Ragi NPK Dosage' },
    { text: t.assistant.prompt2, label: language === 'kn' ? 'ಕೋಲಾರ ಟೊಮೆಟೊ ಬೆಲೆ' : 'Tomato APMC Price' },
    { text: t.assistant.prompt3, label: language === 'kn' ? 'ರಾಗಿ ಬೆಂಕಿ ರೋಗ' : 'Ragi Blast Control' },
    { text: t.assistant.prompt4, label: language === 'kn' ? 'ಈರುಳ್ಳಿ 2 ಎಕರೆ ಲಾಭ' : 'Onion 2-Acre Profit' },
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

        {/* Voice Controls: Auto-read toggle & Stop speaking */}
        <div className="voice-controls-top" style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`btn-voice-toggle ${autoSpeak ? 'active' : ''}`}
            title="ಉತ್ತರವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಧ್ವನಿಯಲ್ಲಿ ಓದಿ"
          >
            {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>
              {autoSpeak
                ? language === 'kn' ? 'ಧ್ವನಿ: ಆನ್ (Voice ON)' : 'Audio: ON'
                : language === 'kn' ? 'ಧ್ವನಿ: ಆಫ್ (Voice OFF)' : 'Audio: OFF'}
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
                        onClick={() => speakMessage(msg.id, msg.text)}
                        className={`btn-bubble-audio ${isSpeakingThis ? 'speaking' : ''}`}
                        title={isSpeakingThis ? 'ಆಡಿಯೋ ನಿಲ್ಲಿಸಿ (Stop Audio)' : 'ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ (Listen in Kannada)'}
                      >
                        {isSpeakingThis ? (
                          <>
                            <div className="audio-wave-anim">
                              <span></span><span></span><span></span>
                            </div>
                            <span>ನಿಲ್ಲಿಸಿ</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={15} />
                            <span>ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ (Listen)</span>
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
              ? '🎤 ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ... ನಾವು ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ (Listening to Kannada speech... speak now)'
              : '🎤 Listening to English speech... speak now'}
          </span>
          <button
            type="button"
            onClick={toggleListening}
            className="btn-cancel-listening"
          >
            ಮುಗಿಸಿ (Done)
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
              title="ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ (Click to speak in Kannada)"
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
              title="ಧ್ವನಿ ಭಾಷೆ ಬದಲಿಸಿ / Toggle Voice Language"
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
                ? 'ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ... ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ (Listening in Kannada...)'
                : 'Listening... speak now'
              : voiceLang === 'kn'
              ? 'ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ ಮೈಕ್ ಬಳಸಿ (Ask question in Kannada or use mic)...'
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
