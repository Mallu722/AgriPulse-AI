# 🌱 AgriPulse AI — Precision Agriculture Advisory Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8+-646CFF.svg?logo=vite)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.14+-3776AB.svg?logo=python)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

AgriPulse AI is an enterprise-grade precision agriculture advisory and market intelligence platform tailored for Indian farming ecosystems. It synthesizes real-time APMC mandi spot prices, meteorological forecasts, and ICAR-verified agronomy into auditable, safety-guaranteed farmer recommendations delivered via web and vernacular voice interfaces.

---

## 🏛️ System Architecture Overview

```
+---------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                    |
|   Web UI (React 19 + TypeScript + Vite)     Vernacular Voice (STT & TTS)        |
+----------------------------------------+----------------------------------------+
                                         | HTTP/REST & WebSocket
                                         v
+---------------------------------------------------------------------------------+
|                        FASTAPI APPLICATION GATEWAY (/api/v1)                   |
|   - CORS Security   - Pydantic v2 Type Safety   - Health Diagnostic Suite       |
+----------------------------------------+----------------------------------------+
                                         |
     +-----------------+-----------------+-----------------+-----------------+
     |                 |                                   |                 |
     v                 v                                   v                 v
+----------+   +-------------------+                  +----------+     +----------+
| Health   |   | Ingestion Engine  |                  | Agronomy |     | Speech   |
| Service  |   | - IMD Weather     |                  | & RAG    |     | Engine   |
|          |   | - Agmarknet Mandi |                  | - ICAR   |     | (Whisper)|
+----------+   +-------------------+                  +----------+     +----------+
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24.18)
- **Python**: 3.11+ (tested on 3.14)
- **Git**

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional if using system python)
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # On Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI development server
uvicorn app.main:app --reload --port 8000
```
- Swagger OpenAPI documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Service Health endpoint: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

### 4. Running Backend Smoke Tests
```bash
# From the project root
python -m pytest backend/tests -v
```

---

## 🛠️ Technology Stack Breakdown

| Layer | Technology | Rationale & Selection Criteria |
| :--- | :--- | :--- |
| **Backend Framework** | **FastAPI** | Asynchronous ASGI support, automatic OpenAPI/Swagger documentation, high throughput, and strict input validation via Pydantic v2. |
| **Frontend Framework** | **React 19 + TypeScript** | Strongly typed component architecture, modern hooks, concurrency features, and zero runtime type bugs. |
| **Build Tool** | **Vite** | Instant Hot Module Replacement (HMR), optimized Rollup tree-shaking, and lightweight configuration. |
| **Styling** | **Custom Vanilla CSS** | Zero-dependency styling utilizing modern CSS custom properties, glassmorphism, responsive grid layouts, and smooth animations without framework lock-in. |
| **Database** | **PostgreSQL + pgvector** | Robust relational model for time-series mandi prices coupled with pgvector for high-performance agronomy RAG embeddings. |
| **AI / Advisory Core** | **Google Gemini 2.5** | High reasoning capability, low latency, and multimodal capabilities for crop image and advisory analysis. |
| **Speech Processing** | **Whisper / Cloud TTS** | Vernacular accessibility for rural farmers supporting Hindi, Telugu, Tamil, Marathi, and English. |

---

## 📅 Day 1 Accomplishments

- [x] **Repository & Workspace Setup**: Initialized clean modular folder hierarchy (`frontend`, `backend`, `data`, `docs`).
- [x] **Frontend Scaffold**: Configured React 19 + TypeScript + Vite with custom dark glassmorphic styling, live latency counter, and connection indicators.
- [x] **Backend Core**: Configured FastAPI ASGI service with `pydantic-settings`, CORS middleware, and graceful error handling.
- [x] **Live Health Monitoring**: Implemented `/api/v1/health` providing diagnostic reporting across database, LLM, weather, mandi, and speech components.
- [x] **Security Guardrails**: Established `.env.example`, `.gitignore`, and server-side secret isolation ensuring no keys ever reach the frontend bundle.
- [x] **Automated Test Suite**: Added 5 pytest smoke tests covering root endpoints, health payload conformance, component reporting, and CORS headers.
- [x] **Architecture & PRD Documentation**: Authored `docs/architecture.md`, `docs/data-sources.md`, and `docs/PRD.md`.

---

## 💡 Day 1 Technical Interview Questions & Answers

### Q1: Why did we separate the configuration into `app/core/config.py` using `pydantic-settings` instead of using `os.environ.get()` directly in our endpoints?
> **Answer**: `pydantic-settings` provides **type-safety, runtime validation, and fail-fast startup behavior**. If a critical variable (such as `DATABASE_URL` or an API key) is missing or formatted incorrectly, the application refuses to start up with a clear schema error rather than failing unpredictably in production mid-request. It also centralizes configuration defaults and secrets in one auditable location.

### Q2: Why is the health check endpoint structured to return individual component states (database, llm_service, etc.) rather than just a simple `{"status": "ok"}`?
> **Answer**: In microservice and enterprise architectures, shallow health checks (`{"status": "ok"}`) mask subsystem degradation. A deep or structured health endpoint allows load balancers, Kubernetes probes, and frontend monitors to distinguish between:
> 1. Complete service failure (HTTP 500 / unreachable),
> 2. Degraded state (e.g. database online, but weather third-party API rate-limited), and
> 3. Fully healthy state. This allows graceful degradation in the UI (e.g., serving cached recommendations if third-party LLMs are unavailable).

### Q3: What security risks exist when communicating between a React SPA and a FastAPI backend, and how did we mitigate them on Day 1?
> **Answer**:
> 1. **Secret Leakage**: In Single Page Applications (SPAs), any variable prefixed with `VITE_` is compiled directly into client-side JavaScript bundles. We mitigated this by ensuring only the public API base URL is in `.env.local`, while all private provider credentials remain strictly inside `backend/.env`.
> 2. **Cross-Origin Resource Sharing (CORS)**: Without strict CORS controls, malicious third-party websites visited by users could execute authenticated requests against the backend. We configured FastAPI's `CORSMiddleware` with explicit origin whitelisting (`CORS_ORIGINS`).