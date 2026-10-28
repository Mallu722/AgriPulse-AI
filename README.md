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

red FastAPI's `CORSMiddleware` with explicit origin whitelisting (`CORS_ORIGINS`).
