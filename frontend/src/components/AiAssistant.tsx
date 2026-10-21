import React, { useState } from 'react';
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

export const AiAssistant: React.FC = () => {
  const { t, language, profile, apiBase } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'kn'
          ? 'ನಮಸ್ಕಾರ! ನಾನು ಅಗ್ರಿಪಲ್ಸ್ ಕೃಷಿ AI ಸಹಾಯಕ. ಐಸಿಎಆರ್ (ICAR), ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳ ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ ಮತ್ತು ಎಪಿಎಂಸಿ ಮಂಡಿ ದತ್ತಾಂಶಗಳ ಆಧಾರದ ಮೇಲೆ ಮಾತ್ರ ನಾನು ನಿಖರವಾದ ಕೃಷಿ ಮಾಹಿತಿ ಮತ್ತು ಬೆಲೆಗಳನ್ನು ಒದಗಿಸುತ್ತೇನೆ. ಕೆಳಗಿನ ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಬಹುದು ಅಥವಾ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನೇರವಾಗಿ ಬರೆಯಬಹುದು.'
          : 'Welcome! I am the AgriPulse Agricultural AI Assistant. I provide factual farming guidance strictly grounded in official ICAR, Agricultural University Package of Practices, and APMC mandi records. Select a quick prompt below or type your question.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'retrieval_excerpt_fallback',
      assumptions: t.assistant.unsupportedDisclaimer,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});

  const toggleCitations = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleSendQuery = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

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
      const payload = {
        query: q,
        language_preference: language,
        district: profile.district,
        farmer_profile: {
          district: profile.district,
          land_area_acres: profile.land_area_acres,
          soil_type: profile.soil_type,
          soil_ph: profile.soil_ph,
          water_availability: profile.water_availability,
          season: profile.season,
        },
      };

      const res = await axios.post(`${apiBase}/assistant`, payload, { timeout: 8000 });
      const data = res.data;

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
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
    } catch {
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'kn'
            ? 'ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.'
            : 'Unable to communicate with assistant backend. Please verify your connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        abstention: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
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
          <span>ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ದ್ವಿಭಾಷಾ ಬೆಂಬಲ</span>
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
                  <span className="timestamp">{msg.timestamp}</span>
                </div>

                {/* Mode & Abstention Indicators */}
                {!isUser && msg.mode && (
                  <div className="msg-badges-strip">
                    <span className="mode-badge">
                      <BookOpen size={13} />
                      {msg.mode === 'retrieval_excerpt_fallback'
                        ? t.assistant.fallbackBadge
                        : 'ದೃಢೀಕೃತ AI ಸಂಶ್ಲೇಷಣೆ'}
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

      {/* Input Box Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="assistant-input-box"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={t.assistant.inputPlaceholder}
          disabled={loading}
          className="assistant-text-input"
        />

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
