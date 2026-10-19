# AgriPulse AI — Data Sources & Feasibility Specification

This document details the external data dependencies, access requirements, update cadence, latency, and resilience fallbacks for AgriPulse AI.

---

## 1. Source Feasibility Table

| Data Domain | Provider / Source | Access Protocol / Format | Auth / Key Requirements | Ingestion Cadence | Expected Latency | Fallback Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mandi Market Prices** | **Data.gov.in / Agmarknet** | REST JSON / CSV export | API Key required (`DATA_GOV_IN_API_KEY`) | Daily (evening post-mandi closure) | 1,200ms – 3,500ms | Cached historical averages + state modal price interpolation |
| **Weather & Climate** | **IMD API / Open-Meteo** | REST JSON (Geo-coordinates) | Open-Meteo: No key (free tier)<br>IMD: API token | Hourly / 6-hour forecast updates | 250ms – 600ms | Open-Meteo fallback if IMD endpoint encounters downtime |
| **Agronomic Practices** | **ICAR / State Agricultural Universities** | PDF / Text corpus via Vector Store | Static documents ingested into pgvector | Bi-monthly / Seasonal | < 150ms (Local pgvector retrieval) | Hardcoded ICAR rule table for vital safety limits (e.g. fertilizer dose) |
| **LLM Reasoning** | **Google Gemini (2.5 Flash / Pro)** | Google GenAI SDK (REST / gRPC) | `GEMINI_API_KEY` | Real-time advisory synthesis | 800ms – 2,200ms | Rule-based deterministic advisory generator |
| **Vernacular Speech (STT)** | **OpenAI Whisper / HuggingFace** | REST Audio Stream / WAV upload | Optional HF Token or local ONNX runtime | On-demand voice query | 600ms – 1,800ms | Fallback to text query prompt on UI |
| **Vernacular Speech (TTS)** | **Google Cloud TTS / Edge TTS** | Binary MP3 / OGG stream | Google Service Account JSON or Edge free tier | On-demand advisory playback | 400ms – 900ms | Visual text card display with audio retry |

---

## 2. Ingestion Resilience & Circuit Breaking

1. **Stale Data Handling**:
   - If Agmarknet fails to deliver the current day's APMC modal price for a specific commodity, the system flags the quote with `is_stale: true` and falls back to a 7-day weighted moving average.
   - The UI displays an explicit warning indicator (`Stale Data (3 days ago)`) so farmers are not misled.

2. **Network Timeouts & Retries**:
   - External HTTP calls are governed by exponential backoff with a maximum timeout of 5,000ms and 3 retry attempts via `httpx` or `tenacity`.
   - Critical paths degrade gracefully to local cached aggregates when external APIs exceed latency budgets.
