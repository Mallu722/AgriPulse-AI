import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Database,
  CloudSun,
  TrendingUp,
  Cpu,
  Mic,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sprout
} from 'lucide-react';

interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  components: {
    database: string;
    llm_service: string;
    weather_service: string;
    market_data: string;
    speech_service: string;
  };
}

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  const checkHealth = useCallback(async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const response = await axios.get<HealthResponse>(`${apiBase}/health`, {
        timeout: 4000,
      });
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealth(response.data);
      setError(null);
      setLastChecked(new Date());
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.message || 'Unable to connect to backend server');
      } else {
        setError('Unknown error connecting to API');
      }
      setHealth(null);
      setLatency(null);
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <header className="app-header">
        <div className="brand-section">
          <div className="logo-badge">
            <Sprout size={26} strokeWidth={2.4} />
          </div>
          <div className="brand-text">
            <h1>
              AgriPulse AI
              <span className="badge-tag">Day 1: Scaffold</span>
            </h1>
            <p className="brand-subtitle">
              Precision Agriculture Advisory & Market Intelligence Engine
            </p>
          </div>
        </div>

        <div className="header-status">
          <div
            className={`status-pill ${
              loading ? 'loading' : health?.status === 'healthy' ? 'online' : 'offline'
            }`}
          >
            <span className="status-dot"></span>
            <span>
              {loading
                ? 'Pinging API...'
                : health?.status === 'healthy'
                ? `FastAPI Connected (${latency}ms)`
                : 'Backend Disconnected'}
            </span>
          </div>

          <button
            onClick={checkHealth}
            disabled={loading}
            className="btn-secondary"
            title="Refresh Health Status"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </header>

      {/* Hero / System Overview Banner */}
      <section className="hero-card">
        <div className="hero-tag">
          <Layers size={15} /> Day 1 Phase: Foundation & System Skeleton
        </div>
        <h2 className="hero-title">
          Decision-Intelligence Core for Indian Agriculture
        </h2>
        <p className="hero-description">
          AgriPulse AI bridges regional agronomic intelligence, real-time APMC mandi
          spot prices, and meteorological forecasts into grounded, verifiable, and
          auditable farmer advisories.
        </p>

        <div className="hero-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Architecture</span>
            <span className="meta-val">
              <Server size={16} /> FastAPI + React TS
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">API Gateway</span>
            <span className="meta-val">
              <code>{apiBase}</code>
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Target Database</span>
            <span className="meta-val">
              <Database size={16} /> PostgreSQL + pgvector
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Last Health Sync</span>
            <span className="meta-val">
              {lastChecked ? lastChecked.toLocaleTimeString() : 'Pending'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid: Architecture Readiness & Health Payload */}
      <div className="grid-2">
        {/* Component Integration Readiness */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity className="card-icon" size={20} />
              Backend Component Matrix
            </h3>
            <span className="meta-label">Configuration Status</span>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Status of underlying modules as reported by <code>/api/v1/health</code>.
          </p>

          <div className="component-grid">
            <div className="component-card">
              <div className="component-info">
                <span className="component-name">PostgreSQL & DB Schema</span>
                <span className="component-desc">Storage for crop, mandi, & farm logs</span>
              </div>
              <span
                className={`component-badge ${
                  health?.components.database === 'ready' ? 'ready' : 'pending'
                }`}
              >
                {health?.components.database || 'pending setup'}
              </span>
            </div>

            <div className="component-card">
              <div className="component-info">
                <span className="component-name">Gemini LLM Provider</span>
                <span className="component-desc">Agronomy grounding & advisory synthesis</span>
              </div>
              <span
                className={`component-badge ${
                  health?.components.llm_service === 'configured' ? 'ready' : 'pending'
                }`}
              >
                {health?.components.llm_service || 'unconfigured'}
              </span>
            </div>

            <div className="component-card">
              <div className="component-info">
                <span className="component-name">IMD Weather Ingestion</span>
                <span className="component-desc">Meteorological forecasts & rainfall index</span>
              </div>
              <span
                className={`component-badge ${
                  health?.components.weather_service === 'ready' ? 'ready' : 'pending'
                }`}
              >
                {health?.components.weather_service || 'pending key'}
              </span>
            </div>

            <div className="component-card">
              <div className="component-info">
                <span className="component-name">Agmarknet Mandi Pricing</span>
                <span className="component-desc">Data.gov.in daily APMC market price feeds</span>
              </div>
              <span
                className={`component-badge ${
                  health?.components.market_data === 'ready' ? 'ready' : 'pending'
                }`}
              >
                {health?.components.market_data || 'pending Day 2'}
              </span>
            </div>

            <div className="component-card">
              <div className="component-info">
                <span className="component-name">Multilingual Voice (STT/TTS)</span>
                <span className="component-desc">Hindi/Telugu/English dialect synthesis</span>
              </div>
              <span
                className={`component-badge ${
                  health?.components.speech_service === 'ready' ? 'ready' : 'pending'
                }`}
              >
                {health?.components.speech_service || 'pending Day 8'}
              </span>
            </div>
          </div>
        </div>

        {/* Live API Health Payload */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title">
              <ShieldCheck className="card-icon" size={20} />
              Live Health Check Response
            </h3>
            <span className="meta-label">GET /api/v1/health</span>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Live payload inspected directly from the running FastAPI server.
          </p>

          {error ? (
            <div
              style={{
                padding: '1.2rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-light)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
              }}
            >
              <AlertCircle size={22} color="#ef4444" />
              <div>
                <strong>Backend Service Unreachable</strong>
                <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{error}</p>
              </div>
            </div>
          ) : (
            <pre className="code-box">
              {health
                ? JSON.stringify(health, null, 2)
                : '// Waiting for response from backend...'}
            </pre>
          )}

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto' }}>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ flex: 1, textDecoration: 'none' }}
            >
              <ExternalLink size={16} /> Open Swagger Docs
            </a>
            <button onClick={checkHealth} className="btn-secondary">
              <RefreshCw size={15} /> Ping
            </button>
          </div>
        </div>
      </div>

      {/* Advisory Workflow Pipeline */}
      <section className="section-card">
        <div className="card-header">
          <h3 className="card-title">
            <TrendingUp className="card-icon" size={20} />
            End-to-End Farmer-to-Recommendation Workflow
          </h3>
          <span className="badge-tag">Day 1 to 10 Pipeline</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginTop: '0.5rem',
          }}
        >
          <div className="component-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
              <Mic size={18} />
              <strong style={{ fontSize: '0.9rem' }}>1. Farmer Query</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Voice input in regional language (Hindi, Telugu, Tamil, Marathi) or web UI.
            </p>
          </div>

          <div className="component-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <CloudSun size={18} />
              <strong style={{ fontSize: '0.9rem' }}>2. Data Ingestion</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Live IMD weather forecasts, soil parameters & mandi market spot price history.
            </p>
          </div>

          <div className="component-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7' }}>
              <Cpu size={18} />
              <strong style={{ fontSize: '0.9rem' }}>3. Agronomy & RAG</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ICAR research packages, soil pH rules, and price forecast algorithms.
            </p>
          </div>

          <div className="component-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
              <CheckCircle2 size={18} />
              <strong style={{ fontSize: '0.9rem' }}>4. Audited Advisory</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Actionable recommendation with confidence scores, references & voice playback.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <div>
          AgriPulse AI © 2026 • High-Reliability Agricultural Intelligence
        </div>
        <div className="footer-links">
          <a href="http://localhost:8000/redoc" target="_blank" rel="noreferrer" className="footer-link">
            ReDoc Specs
          </a>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="footer-link">
            OpenAPI UI
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
