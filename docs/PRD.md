# AgriPulse AI — Product Requirements Document (PRD)

## 1. Product Overview
AgriPulse AI is an AI-powered agricultural advisory and decision intelligence system tailored for Indian agriculture. It delivers hyper-localized, actionable, and grounded guidance covering crop selection, irrigation scheduling, pest prevention, and mandi market selling timings.

## 2. Core Pillars & Guardrails
1. **Zero Hallucination Tolerance**: Agronomic advice (such as fertilizer dosage and pesticide active ingredients) must strictly validate against ICAR (Indian Council of Agricultural Research) certified practices.
2. **Deterministic Constraint Layer**: Safety guardrails execute deterministically *after* LLM synthesis to override potentially hazardous recommendations.
3. **Multi-Modal Vernacular Access**: Complete support for voice input and vernacular audio playback in regional languages (Hindi, Telugu, Tamil, Marathi).
4. **Economic Grounding**: Recommendations integrate real-time APMC mandi modal price forecasts, transport costs, and storage perishability.

## 3. 10-Day Engineering Roadmap
- **Day 1**: Foundation, Architecture, FastAPI + React Vite Scaffold, Health Monitoring & CI smoke tests.
- **Day 2**: Data Ingestion Pipeline (Mandi spot prices from Data.gov.in & IMD weather integration).
- **Day 3**: Database Architecture (PostgreSQL schema, migrations, pgvector extension).
- **Day 4**: Core Agronomic Engine & Rule-Based Deterministic Validator.
- **Day 5**: Market Price Forecasting & Harvest Optimization Models.
- **Day 6**: RAG Pipeline with ICAR Knowledge Grounding.
- **Day 7**: LLM Advisory Synthesis with Safety Guardrails & Provenance.
- **Day 8**: Multilingual Voice Interface (STT/TTS in regional dialects).
- **Day 9**: Frontend Farmer Dashboard & Interactive Advisory Visualizer.
- **Day 10**: End-to-End Integration, Smoke Testing, Stress Testing & Deployment Readiness.
