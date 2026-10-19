# AgriPulse AI — Data Sources & Feasibility Specification

This document details the external data dependencies, access requirements, update cadence, latency, resilience fallbacks, and multi-dataset integration strategies for AgriPulse AI.

---

## 1. Source Feasibility Table

| Data Domain | Provider / Source | Access Protocol / Format | Auth / Key Requirements | Ingestion Cadence | Expected Latency | Fallback Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mandi Market Prices** | **Data.gov.in / Agmarknet / Karnataka OGD** | REST JSON / CSV export | API Key (`DATA_GOV_IN_API_KEY`) or direct manual CSV import | Daily (evening post-mandi closure) | 1,200ms – 3,500ms | Cached historical averages + state modal price interpolation |
| **Area, Production & Yield (APY)** | **DESAgri (Ministry of Agriculture)** | REST Query Portal / CSV Export | None (Public portal download) | Annual post-harvest revision | Batch / Local Cache (< 100ms) | 5-year district rolling median yield |
| **Cost of Cultivation** | **DESAgri & State Agricultural Universities** | Official PDF / Tabular Reports | None (Public government reports) | Annual / Biennial revision | Batch / Local Cache (< 100ms) | Baseline estimates editable by farmer |
| **Weather & Climate** | **IMD API / Open-Meteo** | REST JSON (Geo-coordinates) | Open-Meteo: No key (free tier)<br>IMD: API token | Hourly / 6-hour forecast updates | 250ms – 600ms | Open-Meteo fallback if IMD endpoint encounters downtime |
| **Agronomic Practices & RAG** | **ICAR / UAS Bengaluru & UAS Dharwad** | Curated Package-of-Practices | None (Verified static publications) | Seasonal | < 150ms (Local pgvector retrieval) | Hardcoded ICAR rule table for vital safety limits (e.g. fertilizer dose) |
| **LLM Reasoning** | **Google Gemini (2.5 Flash / Pro)** | Google GenAI SDK (REST / gRPC) | `GEMINI_API_KEY` | Real-time advisory synthesis | 800ms – 2,200ms | Rule-based deterministic advisory generator |
| **Vernacular Speech (STT/TTS)** | **Whisper / Cloud TTS** | Audio stream / WAV upload | API Key / Local Model | On-demand voice interaction | 400ms – 1,800ms | Fallback to text interface |

---

## 2. Ingestion Resilience & Circuit Breaking

1. **Stale Data Handling**:
   - If Agmarknet fails to deliver the current day's APMC modal price for a specific commodity, the system flags the quote with `is_stale: true` and falls back to a 7-day weighted moving average.
   - The UI displays an explicit warning indicator (`Stale Data (3 days ago)`) so farmers are not misled.

2. **Network Timeouts & Retries**:
   - External HTTP calls are governed by exponential backoff with a maximum timeout of 5,000ms and 3 retry attempts via `httpx` or `tenacity`.
   - Critical paths degrade gracefully to local cached aggregates when external APIs exceed latency budgets.

---

## 3. Official Mandi Price Ingestion Audit (Day 2 Verified)

### 3.1 Source Provenance & Access Metadata
- **Source Portal**: Karnataka Open Government Data (OGD) / Agmarknet Mandi Platform
- **Official URL**: `https://karnataka.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi`
- **Raw Input File**: `data/raw/karnataka_mandi_prices_2026.csv` (Preserved immutable)
- **Canonical Output**: `data/processed/canonical_mandi_prices.csv`
- **Quality Audit Report**: `data/processed/data_quality_report.json`
- **Licensing & Terms of Use**: National Data Sharing and Accessibility Policy (NDSAP) / Government Open Data License - India (GODL). Free to consume, analyze, and republish with source attribution.

### 3.2 Source Column Mapping
| Source Column | Canonical Field | Type | Description |
| :--- | :--- | :--- | :--- |
| `State` | `state` | String | Standardized state name (`Karnataka`) |
| `District` | `district` | String | District administrative boundary |
| `Market` | `market` | String | APMC market yard name |
| `Commodity` | `commodity` | String | Agricultural crop name (Tomato, Onion, Potato, Maize, Cotton) |
| `Variety` | `variety` | String | Commercial variety (e.g. Hybrid, Local, Red) |
| `Arrival_Date` | `observation_date` | Date | Standardized ISO-8601 date (`YYYY-MM-DD`) |
| `Min_Price` | `min_price` | Float | Minimum reported spot transaction price |
| `Max_Price` | `max_price` | Float | Maximum reported spot transaction price |
| `Modal_Price` | `modal_price` | Float | Most frequent transacted spot price |
| `Arrivals_Tonnes` | `arrival_volume_tonnes` | Float | Arrival volume delivered to mandi yard |
| `Unit` | `unit` | String | Standard unit of price (`Rs/Quintal`) |
| *Derived* | `raw_row_hash` | String | SHA-256 cryptographic hash of raw row for provenance |
| *Derived* | `quality_flags` | List | Non-destructive audit flags (e.g. `OUTLIER`, `INVERTED_RANGE`) |

### 3.3 Data Quality Audit & Cleaning Policy
- **Immutability**: `data/raw/` is never modified or overwritten by ingestion pipelines.
- **Deduplication**: Exact verbatim row duplicates are flagged and logged while capturing raw row hashes.
- **Non-Destructive Outlier Flagging**: Outliers detected via $1.5 \times IQR$ are **never** silently deleted; they are preserved with `is_outlier=True` and appended with descriptive audit flags (`STATISTICAL_OUTLIER_IQR_<COMMODITY>`).
- **Logical Invariant Enforcement**: Records where `min_price > max_price` or `modal_price` falls outside `[min_price, max_price]` are flagged (`INVERTED_PRICE_RANGE`, `MODAL_OUT_OF_BOUNDS`) for human auditor review.

---

## 4. Multi-Dataset Agricultural Integration Strategy

A single dataset cannot properly support crop suitability, yield prediction, soil suitability, and net-return forecasting. AgriPulse AI integrates **5 complementary official pillars**:

```
+----------------------------------------------------------------------------------------------------+
|                                    INTEGRATED AGRICULTURAL CORE                                    |
+----------------------------------------------------------------------------------------------------+
       |                                |                               |                      |
       v                                v                               v                      v
+-------------------+          +-------------------+          +-------------------+          +-------+
|  1. Daily Mandi   |          |    2. DESAgri     |          |  3. Cost Reports  |          |4. ICAR|
|  Prices (Agmark)  |          |    APY History    |          |   & Cultivation   |          |& UASB |
+-------------------+          +-------------------+          +-------------------+          +-------+
       |                                |                               |                      |
       +--------------------------------+-------------------------------+----------------------+
                                        | Aligned safely by:
                                        v (Crop, District, Season)
                        +-----------------------------------------------+
                        |     integrated_agricultural_profile.json      |
                        | - Market price distributions (min/modal/max)  |
                        | - 5-year district yield baselines (Kg/Ha)     |
                        | - Cost of cultivation baselines (₹/Acre)      |
                        | - ICAR pH, water & duration constraints       |
                        +-----------------------------------------------+
```

### 4.1 Integration Pillars Breakdown
1. **Primary: Daily Mandi Prices (AGMARKNET)**: Real-time wholesale arrival volumes and spot prices. Used for price trend tracking, volatility indices, and market explorer. *Never treated as a guaranteed selling price.*
2. **Supporting 2: Area, Production & Yield (DESAgri)**: District-level historical agricultural statistics (2021-2025). Used to provide regional context for crop suitability and realistic yield baselines. *Aggregated data, not farm-level.*
3. **Supporting 3: Weather & Rainfall (IMD & Open-Meteo)**: Real-time precipitation, temperature, and humidity. Used for weather-aware crop suitability and short-term operational risk warnings.
4. **Supporting 4: Cost of Cultivation (DESAgri & State Universities)**: Operational cost breakdowns (seed, fertilizer, labor, irrigation, machinery, transport). Serves as an editable baseline for farmer net-return calculators.
5. **Supporting 5 & RAG Knowledge: Soil Health Cards & ICAR Guidelines**:
   - Soil parameters (pH, EC, NPK, Organic Carbon) are input directly by the farmer; never guessed or inferred from GPS.
   - ICAR and UAS Bengaluru Package of Practices provide ground-truth agronomic constraints and citation provenance.

### 4.2 Cross-Dataset Alignment Rules
- **Safe Semantic Keys**: Datasets are joined on common categorical keys: `(crop, district, season)`.
- **No Naive Joins**: Daily prices are **never** joined directly to annual yield figures without justified aggregation (e.g. season-level modal price averages).
- **Transparent Assumptions**: The system never provides profit guarantees; it outputs expected ranges based on verified historical baselines and user inputs.
