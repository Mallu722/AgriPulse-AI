# AgriPulse AI — System Architecture Specification

## 1. System Vision & Objective
AgriPulse AI is an enterprise-grade precision agriculture advisory and market intelligence engine. It synthesizes agronomic domain data, live meteorological observations, real-time APMC mandi spot prices, and localized speech models into verifiable, grounded farmer advisories.

---

## 2. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                    |
|                                                                                 |
|   +--------------------------+                 +----------------------------+   |
|   |   Web UI (React + TS)    |                 |   Voice Interface (Audio)  |   |
|   |  - Health & Metrics Dash |                 |  - Vernacular Speech Input |   |
|   |  - Recommendation Audits |                 |  - Hindi / Telugu / English|   |
|   +-------------+------------+                 +-------------+--------------+   |
+-----------------|--------------------------------------------|------------------+
                  | HTTP/REST                                  | WebSocket / REST
                  v                                            v
+---------------------------------------------------------------------------------+
|                           FASTAPI APPLICATION GATEWAY                           |
|                                                                                 |
|   +-------------------------------------------------------------------------+   |
|   |                         Routing & Middleware                            |   |
|   |  - CORS Security   - Request Validation (Pydantic v2)  - Rate Limiting  |   |
|   +------------------------------------+------------------------------------+   |
|                                        |                                        |
|   +------------------+-----------------+------------------+-----------------+   |
|   |                  |                                    |                 |   |
|   v                  v                                    v                 v   |
| +-------------+   +-------------------+              +----------+     +-------+ |
| | Health &    |   | Ingestion Engine  |              | Agronomy |     | Speech| |
| | Monitoring  |   | - IMD Weather     |              | & RAG    |     | Engine| |
| | /health     |   | - Agmarknet Mandi |              | - ICAR   |     | (STT/ | |
| +-------------+   +---------+---------+              | - Rules  |     |  TTS) | |
|                             |                        +----+-----+     +---+---+ |
+-----------------------------|-----------------------------|---------------|-----+
                              v                             v               v
+---------------------------------------------------------------------------------+
|                                DATA & STORAGE LAYER                             |
|                                                                                 |
|   +-----------------------------+             +-----------------------------+   |
|   |    PostgreSQL + pgvector    |             |    External AI Services     |   |
|   | - Structured Market Data    |             | - Gemini 2.5 Flash / Pro    |   |
|   | - Farmer Crop Logs          |             | - HuggingFace Whisper STT   |   |
|   | - Agronomy Vector Store     |             | - Open-Meteo & IMD APIs     |   |
|   +-----------------------------+             +-----------------------------+   |
+---------------------------------------------------------------------------------+
```

---

## 3. Core Modules & Responsibilities

### 3.1 API & Application Core (`backend/app/api`, `backend/app/core`)
- **`core/config.py`**: Type-safe settings utilizing `pydantic-settings`. Loads environment variables from `.env` with strict zero-secret exposure.
- **`api/health.py`**: Diagnostic endpoint (`/api/v1/health`) delivering real-time status of database, LLM provider, weather feeds, mandi services, and speech modules.
- **`main.py`**: ASGI application initialization, CORS policy enforcement, lifespan startup checks, and route dispatching.

### 3.2 Ingestion Engine (`backend/app/ingestion`)
- **Mandi Pricing Pipeline**: Ingests APMC arrival volumes, min/max/modal spot prices from Data.gov.in / Agmarknet with fallback caching.
- **Weather Pipeline**: Fetches precipitation, temperature, wind, humidity, and solar radiation from IMD / Open-Meteo.
- **Validation**: Strict schema conformance via Pydantic models before persisting to PostgreSQL.

### 3.3 Agronomy & RAG Engine (`backend/app/agronomy`, `backend/app/rag`)
- **Rule-based Constraints**: First-order guardrails (e.g., urea application thresholds, soil pH constraints) that override LLM hallucinations.
- **Retrieval Augmented Generation (RAG)**: Embedding and semantic retrieval of ICAR (Indian Council of Agricultural Research) package-of-practices.
- **Grounding & Provenance**: Every generated recommendation includes cited sources, parameter tolerances, and confidence metrics.

### 3.4 Forecasting Engine (`backend/app/forecasting`)
- **Price Forecasting**: 7-day to 30-day crop price trend analysis using seasonal regression, ARIMA, and historical modal price momentum.
- **Harvest Window Optimizer**: Evaluates current field moisture, storage availability, and predicted mandi prices to suggest optimal harvest dates.

### 3.5 Speech & Multilingual Processing (`backend/app/speech`)
- **Speech-to-Text (STT)**: Transcribes Hindi, Telugu, Tamil, Marathi, and English voice notes using Whisper.
- **Text-to-Speech (TTS)**: Synthesizes actionable, vernacular audio playback for low-literacy farmers.

---

## 4. Security & Configuration Boundaries
1. **Zero Secret Leakage**: No API keys, database credentials, or secret tokens are bundled into frontend assets or pushed to Git. All secrets live strictly server-side in `backend/.env`.
2. **CORS Governance**: Configurable origin whitelisting (`CORS_ORIGINS`) prevents unauthorized cross-origin requests in production.
3. **Pydantic Validation**: Strict input boundary validation eliminates injection attacks and malformed payloads at the API threshold.
