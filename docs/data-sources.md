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
| **Soil Maps & LRI Layers** | **BHOOMI Geoportal (ICAR-NBSS&LUP)** | WMS/WFS Map Service & Portal Exploration | Web Interface / Spatial Geoportal | Static baseline / 1:50K & 1:10K surveys | On-demand / Spatial query | Farmer Soil Health Card manual input if district LRI unavailable |
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
5. **Supporting 5 & RAG Knowledge: Soil Health Cards & ICAR-NBSS&LUP BHOOMI Geoportal**:
   - **BHOOMI Geoportal (`https://bhoomigeoportal-nbsslup.in/BHOOMI_StateWise/`)**: Developed by ICAR - National Bureau of Soil Survey and Land Use Planning (NBSS&LUP).
   - **Key Available Layers**:
     - *Soil Taxonomy & Classification*: 1:50,000 scale Soil Resources and 1:10,000 Land Resource Inventory (LRI) block maps for Karnataka.
     - *Physical Soil Properties*: Soil texture (sand, silt, clay fractions), soil depth (cm).
     - *Chemical & Fertility*: Soil pH/reaction, Electrical Conductivity (salinity), Soil Organic Carbon (SOC %).
     - *Hydraulic Properties*: Available Water Capacity (AWC in mm/m) and drainage class.
   - **Architectural Policy on Geoportal vs. Direct Farm Input**:
     - Viewing map layers on a WebGIS geoportal is fundamentally different from automated bulk API extraction.
     - While BHOOMI provides 1:50K/1:10K survey layers across participating Karnataka taluks, coverage is block-specific and not uniformly available as an automated open REST API for all 31 districts.
     - Therefore, AgriPulse AI accepts verified **BHOOMI Geoportal LRI Block attributes** or physical Soil Health Card lab inputs without hallucinating or imputing properties from raw GPS.
   - **ICAR / UAS Bengaluru Package of Practices**: Provides ground-truth agronomic constraints and citation provenance.

### 4.2 Cross-Dataset Alignment Rules
- **Safe Semantic Keys**: Datasets are joined on common categorical keys: `(crop, district, season)`.
- **No Naive Joins**: Daily prices are **never** joined directly to annual yield figures without justified aggregation (e.g. season-level modal price averages).
- **Transparent Assumptions**: The system never provides profit guarantees; it outputs expected ranges based on verified historical baselines and user inputs.

---

## 5. Weather API & Meteorological Provider Architecture (Day 5)

AgriPulse AI treats weather data strictly as short-term (5–7 day) operational guidance. It maintains a dual-provider architecture with fallback resilience:

### 5.1 Provider Specifications & Licensing

| Provider | Role | Status | License & Cost | API Key Required | Rate Limits |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Open-Meteo** | Primary | **LIVE (Tested)** | Creative Commons Attribution 4.0 (CC BY 4.0). Free for non-commercial open use. | No (Server-side anonymous) | Up to 10,000 calls/day |
| **IMD (India Met Dept)** | Secondary / Official | **Configured (Pending Credentials)** | Govt. of India Ministry of Earth Sciences Open Data Policy. Institutional registration required. | Yes (`IMD_API_KEY`) | Subject to MoES portal terms |
| **Offline CRIDA Baseline**| Fallback | **Ready** | ICAR-CRIDA district agro-meteorological averages. | None | Local In-Memory |

### 5.2 Freshness, Caching & Failover Policies
1. **Cache Duration**: Meteorological responses are cached in memory for 1 hour (`WEATHER_CACHE_TTL_SECONDS=3600`).
2. **Timeout Control**: External calls enforce a 6.0s timeout with a max of 2 retries and exponential backoff.
3. **No Silent Substitution**: If live API requests fail and a stale cache is available, the response is explicitly tagged `STALE_CACHE` with the original retrieval timestamp. If no cache exists, the response is returned as `MOCKED_FALLBACK`.
4. **Agro-Meteorological Advisories**: Short-term weather triggers specific operational rules (spraying postponement if 48h rain > 5mm or wind > 18 km/h; irrigation suspension if rain >= 10mm).
5. **Operational Scope Caveat**: 7-day weather forecasts are never extrapolated into seasonal monsoon totals or harvest-time commodity prices.

---

## 6. Transparent Multi-Attribute Crop Ranking (Day 5)

### 6.1 Two-Tier Architecture
1. **Tier 1: Hard Agronomic Feasibility Gatekeeper (Deterministic)**:
   - Sowing season match (Kharif, Rabi, Summer).
   - Water availability threshold (e.g., Rainfed farmers are disqualified from water-intensive crops like Tomato).
   - Agro-climatic district feasibility.
   - Disqualified crops are strictly isolated and never shown as viable recommendations.
2. **Tier 2: Multi-Attribute Utility Scoring (0 to 100)**:
   - **Agronomic Fit Score (25%)**: Soil type match, pH suitability, agro-climatic zone.
   - **Water Resilience Score (20%)**: Water intensity alignment with farmer's irrigation infrastructure.
   - **Economic Return Score (25%)**: Expected base-case net profit & Benefit-Cost Ratio (BCR).
   - **Downside Risk Protection Score (15%)**: Net capital preservation under conservative (P25) market glut scenarios.
   - **Duration & Rotation Score (15%)**: Turnaround speed and operational land calendar fit.

### 6.2 Farmer Cost Overrides
Official government cost baselines (DESAgri/UAS Bengaluru) remain immutable. Farmers may override specific cost components (labour, seeds, tractor rental, plant protection, harvesting, transport) directly; the system recalculates net returns on the fly while noting `has_custom_cost_overrides=True`.

### 6.3 Mandatory Disclaimers
All ranking responses include explicit statements clarifying that yields, market realizations, and profits are forward-looking estimates subject to climate and market volatility and are **never guaranteed**.
