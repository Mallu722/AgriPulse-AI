# AgriPulse AI
## Product Requirements Document (PRD)

**Product:** AgriPulse AI — Karnataka Crop Suitability, Market Intelligence and Profit Scenario Assistant  
**Document version:** 1.0  
**Prepared:** 20 October 2026  
**Status:** Proposed MVP specification  
**Delivery target:** 8 implementation days + 2 improvement and release days  
**Primary region:** Karnataka, India  
**Primary languages:** Kannada and English; Kannada text-to-speech is an MVP requirement if provider credentials/access are available.

---

## 1. Executive Summary

AgriPulse AI is a farmer-oriented decision-support web application focused on Karnataka. It combines verified crop suitability rules, farm-profile inputs, official agricultural guidance, market-price history, weather information where accessible, estimated cultivation costs, and tested forecasting methods to help a farmer compare crop options and understand possible financial outcomes.

The user enters the farm location, season, area, water availability, available soil information, budget and risk preference. The system filters out crop options that fail known agronomic constraints, estimates yield and market-price scenarios only when the data supports them, calculates low/base/high financial scenarios, and explains its reasoning with source references. An AI assistant retrieves relevant official agricultural documents (RAG) and can read the final Kannada-language answer aloud through text-to-speech (TTS).

The product is **decision support, not a guarantee of crop suitability, market price, yield, or profit**. Exact farm soil properties cannot be inferred from location alone; future prices cannot be known with certainty; and no forecast will be presented as reliable unless evaluated against time-ordered historical data. Missing data must lead to a transparent fallback, lower confidence, or a disabled recommendation—not fabricated certainty.

### One-sentence value proposition

**AgriPulse AI helps Karnataka farmers compare feasible crop options and market scenarios using sourced agricultural evidence, transparent cost calculations, tested forecasts where possible, and Kannada voice explanations.**

## 2. Problem Statement

Farmers often need to combine information from different sources before deciding what to grow or where to sell: crop and seasonal requirements, soil-test results, available irrigation, local weather, historical yield, market prices, and cultivation expenses. These sources can use different formats, update schedules, units and levels of geographic detail. A single high market price does not necessarily mean the best net return, and a crop with a high estimated return may not be suitable for the farm's water, soil, season or budget constraints.

AgriPulse AI addresses this fragmented decision process by presenting a small, explainable workflow: (1) describe farm conditions, (2) identify feasible crop candidates using verified rules, (3) compare expected revenue and cost scenarios, (4) explore current/historical market data, and (5) ask source-grounded questions in Kannada or English.

## 3. Product Vision and Differentiation

### 3.1 Vision

Make crop-planning and market information easier to understand for Karnataka farmers, particularly users who benefit from mobile-first design and Kannada audio guidance.

### 3.2 Proposed differentiation

AgriPulse AI will not claim that market prices, crop recommendations, or AI chat are entirely new. Existing agricultural websites and applications already provide pieces of these services. The product's proposed differentiation is the integrated decision workflow:

1. **Farm-profile-aware suitability:** Location, season, known soil parameters, water availability, area, budget and crop duration are evaluated together.
2. **Suitability before profitability:** Hard agronomic constraints are checked before a crop is ranked by economics.
3. **Transparent economics:** User-editable costs and consistent units make the difference between gross revenue and estimated net return visible.
4. **Sourced market intelligence:** Observed price records carry the reporting date, unit and original source.
5. **Forecasts with accountability:** Any ML forecast is compared against a simple baseline using chronological evaluation. Poor or unsupported forecasts are not surfaced as facts.
6. **Grounded AI explanations:** RAG answers use retrieved official documents and show citations; numerical outputs come from validated APIs/calculations, not free-form LLM guesses.
7. **Kannada-first accessibility option:** The final answer can be read aloud in Kannada, while source citations remain visible in the interface.
8. **Clear uncertainty:** The UI separates observed values, user assumptions, model forecasts and illustrative scenarios.

This is a product hypothesis to test, not a claim that no existing product offers any of these features.

## 4. Goals, Non-Goals and Scope

### 4.1 MVP goals

- Support a deliberately limited set of Karnataka districts/markets and approximately 3–5 crops, subject to verified data coverage.
- Ingest and validate real official market price records, with a manual CSV import path if a live API is unavailable.
- Capture a structured farm profile including location, area, season, budget, water availability and optional soil-test values.
- Return crop candidates using traceable, rule-based suitability checks sourced from official agronomic guidance.
- Estimate production, revenue, cost and net-return scenarios with correct units and visible assumptions.
- Offer a market explorer and market comparison page for reported prices and historical trends.
- Include a simple forecast baseline and a second model only if the data supports credible chronological evaluation.
- Build a RAG assistant that retrieves verified agriculture documents and provides source citations.
- Provide Kannada text-to-speech for the final assistant answer if the TTS provider is configured.
- Deliver a runnable, tested codebase with documentation, setup instructions, known limitations and a demo workflow.

### 4.2 Non-goals for the 10-day MVP

- Guaranteed predictions of future market prices, crop yield, rainfall or profit.
- Replacing agronomists, extension officers, market authorities or official government services.
- Automatically determining exact farm soil properties from GPS or village alone.
- Providing a definitive, farm-specific agronomic recommendation where required soil/water data is missing.
- Supporting every crop, district, soil type, market and language in Karnataka.
- Collecting Aadhaar, bank details, OTPs or other unnecessary sensitive identity information.
- Submitting market trades, selling orders, loan applications, insurance claims or government forms on behalf of users.
- Building an advanced autonomous agent, satellite analytics stack, mobile native app, or production-grade MLOps system in the first 10 days.
- Claiming real-time data integration if access, credentials, refresh scheduling or end-to-end verification are incomplete.

### 4.3 Scope priority

- **P0 — MVP must-have:** Farmer profile; supported crop/season rules; verified data ingestion or a working official CSV import; market explorer; market comparison; net-return calculator; documented source freshness; basic forecast baseline/evaluation or an explicit not-available state; RAG retrieval with citations; Kannada TTS integration interface and actual voice playback if credentials are available; tests; README.
- **P1 — Implement if the core is stable:** Live IMD data where documented access/credentials permit; multilingual embedding retrieval; scenario visualization; saved farm profile; admin ingestion status; user feedback.
- **P2 — Future roadmap:** Kannada speech-to-text, audio-only onboarding, soil-report OCR, SMS/WhatsApp notifications, satellite/remote-sensing data, advanced forecast ensembles, user accounts, FPO/cooperative workflows, offline mode.

## 5. Target Users and Needs

### Persona A — Small or medium-scale farmer
- Needs practical information without technical language.
- May know the village, crop and available irrigation but not have a digital soil report.
- Needs visible assumptions, not an unexplained “AI score”.
- Benefits from a mobile layout and Kannada audio.

### Persona B — Farmer who has a soil test report
- Can provide pH, EC, organic carbon, N/P/K and other available measurements.
- Wants crop candidates filtered by relevant constraints.
- Needs the app to state when a value is missing or stale.

### Persona C — FPO/cooperative or agriculture student
- Wants cross-market comparisons, crop trends, data exports and a concise evidence report.
- Can interpret more detailed charts and model evaluation.

### Jobs to be done
1. “Given my available water, season and known soil information, show crops worth investigating.”
2. “Explain why a crop is considered suitable or unsuitable.”
3. “Show what the available data suggests about yield, selling price and net return, with uncertainty.”
4. “Compare selected markets using actual dated records, not made-up current prices.”
5. “Explain agricultural guidance in Kannada and read it aloud.”

## 6. Key User Journey

1. User opens the mobile-first website and chooses Kannada or English.
2. User selects district/taluk/village or enters a supported location; precise GPS is optional.
3. User enters farm area, intended season/sowing window, water availability, budget and risk preference.
4. User optionally enters soil type or manually records Soil Health Card values. Missing values are kept as unknown, not guessed.
5. Suitability rules filter candidates using verified agronomic constraints and return reasons, missing data and source references.
6. The user views suitable crop candidates and compares base/conservative/optimistic economics. Where yield/price forecasts are not validated, the app labels results as scenario analysis or unavailable.
7. User explores market records, filters crop/market/date, and compares modal/min/max price, arrivals where available, and price history.
8. User adjusts transport/harvest/other costs and sees recalculated net proceeds.
9. User asks the RAG assistant a question. The backend retrieves source passages and relevant structured calculation/model results.
10. The assistant returns a grounded answer with clickable citations; a user-selected play control reads the final Kannada answer aloud.
11. Source dates, assumptions, limitations and an option to report a problem remain visible.

## 7. Functional Requirements

### FR-01 — Language and accessibility
- Initial UI languages: Kannada and English.
- All farmer-facing essential labels, validation messages and risk disclaimers must be localizable.
- Provide readable typography, keyboard-accessible controls, adequate contrast, meaningful labels and responsive mobile layout.
- Audio must be user-triggered, have loading/error states, and support play/pause/replay. Never auto-play unexpectedly.

**Acceptance criteria:** Core onboarding, crop recommendations, market comparison, scenario display and assistant actions can be completed on a mobile viewport; language switching does not break labels or values.

### FR-02 — Farmer profile
Capture:
- Location: district and, if supported, taluk/village; GPS is optional.
- Land area and unit (standardise internally; display local-friendly units only if converted accurately).
- Intended crop season/sowing window and expected harvest horizon.
- Water access: rainfed, limited irrigation or reliable irrigation, with optional quantity/frequency details if meaningful.
- Soil type if known and optional soil-test fields: pH, electrical conductivity, organic carbon, N/P/K and other available values.
- Budget or user-entered cost constraints.
- Risk preference: conservative, balanced or higher-risk tolerance.

**Rules:** Minimise personal data; allow editing; mark unknown fields as unknown; do not infer precise soil chemistry from location.

**Acceptance criteria:** Server validates units, numeric ranges and required fields. Missing soil values cause a limitation note, not fabricated soil attributes.

### FR-03 — Source and data ingestion
- Support official Karnataka OGD/AGMARKNET mandi-price dataset; use e-NAM only where relevant records are accessible and compatible.
- Support official crop-production/yield statistics and dated cultivation-cost reports as supplemental sources.
- Support IMD documented weather endpoints only if access/credentials and terms allow.
- Support permitted official agricultural documents from ICAR/UAS or relevant government sources.
- Preserve raw files and source metadata: source name/URL, publication/observation date, retrieval timestamp, unit, file/version/hash where available, and processing status.
- Validate types, ranges, duplicate records, missing dates and schema changes.
- Cache external data responsibly; implement timeouts/retries and show the last successful refresh.
- Provide manual CSV import if a live endpoint is unavailable. A manual import is a legitimate MVP fallback, not a live integration claim.

**Acceptance criteria:** The system can reproduce the cleaned dataset from a raw input and generates a data-quality report. Production responses never use synthetic fixtures as actual prices.

### FR-04 — Agronomic knowledge base
- Curate a small set of official, permitted crop guidance documents.
- Store title, issuer/publisher, official URL, publication date/version, retrieval date, relevant crop/district/season tags, page/section metadata and usage notes.
- Extract text carefully; verify critical tables/numbers against the document.
- Treat all retrieved document text as untrusted input, not system instructions.

**Acceptance criteria:** Each factual agricultural explanation is traceable to a source; outdated or conflicting guidance is flagged.

### FR-05 — Crop suitability engine
- Begin with explicit, rule-based crop suitability; do not train a classifier without a reliable labelled dataset.
- Apply hard constraints before economic ranking: crop/location/season evidence, soil constraints where measured, water requirements, growing duration and budget constraints.
- Use documented thresholds or qualitative guidance only as supported by official sources. Do not invent agronomic thresholds to fill missing data.
- Output each candidate's suitability rationale, constraints checked, unknown inputs, source references and confidence/coverage note.
- Separate “not enough information” from “unsuitable”.
- Economic potential must never override an explicit agronomic incompatibility.

**Acceptance criteria:** Unit tests cover compatible, incompatible and incomplete profiles. Every reason can be linked to a rule/source.

### FR-06 — Yield estimates
- Use historical district/crop/season yield as an initial regional prior where data exists.
- Use field-specific yield modelling only if training/validation data contains relevant farm-level features and representative samples.
- Present regional estimates as regional—not guaranteed individual-farm predictions.
- Record source years and data coverage.

**Acceptance criteria:** App labels the geographic granularity and explains when field-level prediction is not supported.

### FR-07 — Market explorer and comparison
- Search/filter by commodity, variety where available, market/APMC, district and date range.
- Show min/max/modal wholesale price, unit, observation/reporting date and source.
- Show arrivals/traded quantity only when the source defines it and data is available.
- Compare selected markets and chart actual historical observations.
- Identify stale or missing data, and do not interpolate missing values silently.

**Acceptance criteria:** Displayed prices tie to stored source rows and dated metadata. Empty/missing data produces clear messages.

### FR-08 — Price forecasting
- First establish a baseline (e.g., last observed price or suitable seasonal naïve baseline).
- Evaluate a second model only where a given crop-market series has sufficient history and consistent observations.
- Use time-ordered train/validation/test or rolling-origin backtesting; no random shuffle that leaks future records.
- Report MAE and RMSE in currency-per-unit terms and compare against baseline by commodity/market/horizon.
- If calibrated intervals are possible, show prediction intervals; otherwise do not call arbitrary ranges “confidence intervals”.
- If a model does not outperform a baseline or data is sparse, show trend/scenario analysis instead of a confident prediction.

**Acceptance criteria:** Forecast endpoint returns model/version, horizon, test-evaluation summary and status. Poor/unsupported forecasting can be disabled by policy.

### FR-09 — Profit and cost scenarios
- Normalise units. Example: yield in quintals per acre × area in acres = total quintals; total quintals × price in INR/quintal = gross revenue.
- Calculate estimated net return = gross revenue − all modeled costs.
- Cost categories: seed, fertilizer, labour, pesticide, irrigation, machinery, harvesting, transport, market charges/fees and other user-entered costs where applicable.
- Show the year/source of official cost estimates; allow user overrides for local costs.
- Produce conservative/base/optimistic scenarios from defensible historical quantiles, validated forecast intervals or clearly labeled user assumptions. Do not fabricate scenario percentages.
- Explain that net return is an estimate and may exclude unobserved costs, finance, losses, taxes or household labour unless explicitly included.

**Acceptance criteria:** Deterministic formula tests pass for multiple areas, prices, costs, units, zero/missing values and invalid inputs. Every assumption is visible and editable.

### FR-10 — Crop recommendation ranking
- First filter by agronomic feasibility; only then rank eligible/conditionally eligible candidates.
- Ranking may combine agronomic evidence, water fit, estimated net-return scenario, downside risk, budget fit, crop duration and available market access.
- Explain each component and avoid an opaque “AI score”.
- Allow users to change preferences and recalculate.

**Acceptance criteria:** A crop with a known hard constraint violation cannot rank first solely because its estimated revenue is high. Unknown inputs must affect recommendation confidence.

### FR-11 — RAG assistant
- Accept Kannada and English questions; answer in the chosen language where supported.
- Retrieve curated official agricultural guidance with a clear, tested retrieval baseline (TF-IDF/keyword search initially; embeddings only if time and quality justify them).
- When answering numerical/personal questions, call backend tools for market data, profile-compatible crop candidates and tested economic calculations. LLM must not calculate authoritative prices from memory.
- Show clickable source citations and publication/retrieval dates; page/section anchors where extraction supports them.
- State when no adequate evidence is found, sources conflict, or information may be outdated.
- Defend against retrieved prompt injection; document content cannot override system policies.
- If LLM provider credentials are unavailable, use a clearly labelled retrieval-only fallback.

**Acceptance criteria:** Test answerable and unanswerable questions. Citations must support the relevant claims; no-source cases must abstain rather than guess.

### FR-12 — Kannada text-to-speech
- Convert the final Kannada answer text into audio using a server-side provider adapter.
- Initial provider recommendation: Google Cloud Text-to-Speech `kn-IN` voice; BHASHINI is a viable alternative if API access/approval is available.
- Audio text must be the same answer displayed in the UI. Do not read raw URLs/citation markup; keep visual citations available.
- User initiates playback; include loading, retry, failure and play/pause/replay controls.
- Never expose credentials in frontend or logs. Record provider/model configuration without logging unnecessary user prompts.
- Validate pronunciation of numeric values, units, crop names and locality names with a Kannada speaker if possible.

**Acceptance criteria:** With valid credentials, the final Kannada answer plays. Without them, the app explains setup is required and does not pretend audio was generated.

### FR-13 — Weather integration
- Use IMD documented API(s) where permitted access is available; keep API calls behind the backend.
- Persist observation/forecast valid time, issue time, location granularity and retrieval time.
- Use short-range weather only for short-term advisory context; it is not a proxy for entire-season rainfall or harvest-time price.
- Show stale/unavailable status and source.

**Acceptance criteria:** Weather does not silently affect crop ranks when stale/missing; recommendation explains which weather inputs were used.

### FR-14 — Admin and operational visibility
- Expose a protected/internal view or report for ingestion status, source updates, failed imports, data-quality counts, forecast evaluation results and RAG document versions.
- Authentication may be deferred if this is a local/private demo, but production admin mutation routes must be protected.

**Acceptance criteria:** Operator can determine when each dataset was updated and why a job failed.

## 8. Non-Functional Requirements

### Reliability and performance
- Paginate/filter large market queries server-side.
- Add request timeouts and controlled retries to external providers.
- Cache data that changes slowly, with freshness metadata.
- Return meaningful API errors; do not expose stack traces/secrets to users.
- Keep an initial target of p95 below 2 seconds for normal database-backed searches on a modest dataset; measure rather than claim this target without tests. AI/TTS requests may take longer and should show progress.

### Security and privacy
- No Aadhaar, OTP, bank account details or identity documents are required for the MVP.
- Store only profile details necessary for recommendations; support clearing local/saved profiles if storage is enabled.
- Keep secrets in environment configuration/managed secret store, never in frontend bundles or Git.
- Restrict CORS to known origins in deployment, validate uploaded files, parameterise queries/use ORM safely, rate-limit costly AI/TTS routes and redact secrets from logs.
- Treat external API responses and retrieved documents as untrusted input.
- Record source metadata and admin changes. Do not scrape sites without checking terms/access constraints.

### Usability and accessibility
- Mobile-first responsive layout; plain language; clear Kannada/English selection.
- Forms use labels, validation explanations and keyboard navigation.
- Do not rely on colour alone. Charts need titles/labels and tabular fallbacks.
- Distinguish observed data, user-provided assumptions, model output and illustrative examples.

### Maintainability
- Typed API schemas and consistent error formats.
- Document database migrations, setup, data source mapping and model evaluation.
- Automated tests for high-risk logic: crop rule engine, unit conversions, profit calculations, forecast time split and RAG citations.

## 9. Data Sources and Availability Assumptions

All links below are official starting points. Actual field availability, licenses/usage terms, access credentials, historical depth, refresh frequency and Karnataka-specific coverage must be verified during Day 1–2; a catalogue page is not a guarantee that a needed API or complete training dataset is accessible.

### Daily market prices
- **Source:** Karnataka OGD/AGMARKNET — https://karnataka.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi
- **Use:** Market explorer, comparisons and price time series.
- **Caveat:** Verify the actual schema/history, units, duplicates and access path.

### Historical market information
- **Source:** e-NAM — https://www.enam.gov.in/web/dashboard/Historical and https://www.enam.gov.in/web/trading-details
- **Use:** Market arrivals/traded quantities and prices where available.
- **Caveat:** Download access and field compatibility may vary.

### Historical crop area/production
- **Source:** OGD — https://karnataka.data.gov.in/catalog/district-wise-season-wise-crop-production-statistics-0
- **Use:** Regional yield trend (production tonnes / area hectares).
- **Caveat:** Annual/seasonal aggregation is not farm-level observation.

### Weather
- **Source:** IMD API reference — https://api.imd.gov.in/public/api_reference.html
- **Use:** Short-range weather and rainfall context.
- **Caveat:** Credentials/access/terms and time granularity must be checked; a short forecast is not a season outcome.

### Soil-test guidance/profile
- **Source:** Soil Health Card — https://soilhealth.dac.gov.in/
- **Use:** Farmer-entered soil readings and soil-health context.
- **Caveat:** Do not assume a public API provides an individual farm's results.

### Agronomy
- **Sources:** UAS Bengaluru — https://www.uasbangalore.edu.in/ ; ICAR — https://icar.gov.in/
- **Use:** Crop calendars, water/soil constraints and crop-practice evidence.
- **Caveat:** Use applicable official publications, dates and permitted copies.

### Cultivation cost
- **Source:** DES/ES&E — https://desagri.gov.in/document-report/cost-of-cultivation-production-related-data/
- **Use:** Historical cost assumptions.
- **Caveat:** Report the year and allow local user overrides; past cost may not equal current cost.

### Kannada TTS
- **Sources:** Google Cloud TTS voice list — https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types ; BHASHINI — https://bhashini.gov.in/
- **Use:** Read the final Kannada answer aloud.
- **Caveat:** Provider setup, approval or billing may be required.

## 10. Proposed Technical Architecture

### Frontend
- React + TypeScript + Vite.
- Tailwind CSS for layout and responsive components.
- React Router for page navigation.
- Recharts for plots; accessible tables accompany important comparisons.
- Shared API client configured via `VITE_API_BASE_URL`.

### Backend
- Python + FastAPI.
- SQLAlchemy and Alembic for PostgreSQL schema and migrations.
- Pydantic for request/response validation.
- Separate services: source ingestion, agronomy/rules, economics, forecasting, retrieval/RAG and speech.
- External provider adapters with timeouts, validation, cache and explicit status.

### Data and model pipeline
1. Fetch/import source data.
2. Preserve raw copy and source metadata.
3. Validate schema, units, dates, duplicates and missingness.
4. Transform into a canonical schema.
5. Store cleaned data in PostgreSQL; curated documents are chunked and indexed.
6. Run scheduled/manual analysis and training only on eligible series.
7. Evaluate models chronologically and store metrics/version.
8. Serve results through APIs with source metadata and status.

### RAG and speech pipeline
1. User asks in Kannada or English.
2. Backend classifies the intent: agronomy explanation, market query, calculation or forecast explanation.
3. The appropriate structured-data tool calculates/fetches numerical values.
4. Retriever finds applicable source passages.
5. LLM generates a concise answer constrained to evidence and tool outputs.
6. Response includes citations, assumptions, freshness and limitations.
7. If user presses Play and language is Kannada, the backend sends final answer text to TTS and returns playable audio.

## 11. Proposed Database Entities

- `farmer_profiles`: Location granularity, farm area/unit, season, water availability, budget, risk preference; optional consented soil-test values.
- `soil_measurements`: Profile or session reference, parameter/value/unit, observed date, source (user/soil report), quality status.
- `commodities`: Canonical commodity names and aliases/varieties.
- `markets`: Market/APMC name, district, location where known.
- `market_prices`: Observation date, commodity, market, min/max/modal price, unit, source reference, retrieval timestamp and raw-row hash.
- `market_arrivals`: Date/commodity/market/quantity/unit/source where available.
- `crop_profiles`: Crop/season/region, verified water/soil/duration constraints and agronomy source references.
- `crop_production_stats`: District/crop/season/year, area, production, derived yield and source.
- `cost_assumptions`: Crop/region/year/cost category/value/unit/source; user override belongs to a session not the global official source.
- `forecasts`: Crop/market, forecast date/horizon, prediction, interval if calibrated, model/version, generated-at timestamp, evaluation status.
- `documents`: Title, publisher, source URL, published/retrieved dates, version, hash, current/archived status, processing state.
- `document_chunks`: Text, embedding/index fields if used, page/section, document ID and metadata.
- `assistant_sessions` and `assistant_messages`: Optional, only if history is enabled and retention is documented.
- `answer_citations`: Assistant answer ID to source chunk/document and supporting section.
- `feedback`: Optional quality feedback without unnecessary sensitive profile data.
- `ingestion_jobs`: Provider/source, started/finished times, status, records count and error summary.
- `model_evaluation_runs`: Dataset window, model version, baseline and model metrics, coverage and notes.

## 12. API Contract (initial proposal)

- **GET `/api/v1/health`** — Service health.
- **GET `/api/v1/commodities`** — Supported commodities and varieties.
- **GET `/api/v1/markets`** — Market and district filter values.
- **GET `/api/v1/prices`** — Dated, source-linked market records.
- **GET `/api/v1/markets/compare`** — Compare selected markets.
- **POST `/api/v1/farmer-profile/validate`** — Validate farm profile inputs.
- **POST `/api/v1/crop-recommendations`** — Suitable/conditional candidates with reason and source.
- **POST `/api/v1/economics/scenarios`** — Yield, price, cost and net-return scenarios.
- **GET `/api/v1/forecasts`** — Evaluated forecast or explicit not-available status.
- **GET `/api/v1/weather`** — Weather with validity and freshness metadata.
- **POST `/api/v1/assistant`** — RAG answer with citations and structured tool use.
- **POST `/api/v1/speech/synthesize`** — Kannada TTS for final answer text.
- **GET `/api/v1/admin/data-quality`** — Protected internal data-quality status.
- **GET `/api/v1/admin/model-evaluations`** — Protected internal evaluation report.

Endpoints and fields are proposals; align them to the actual source schema during implementation.

## 13. Evaluation Plan

### Data quality
- Source coverage by market, commodity and date.
- Missingness, duplicate rate, invalid numeric/unit counts.
- Freshness lag and successful ingestion runs.
- Document parsing accuracy for key numbers/tables.

### Crop suitability
- Expert/official-source review of each rule and threshold.
- Test cases for pass, fail, unknown and conflicting inputs.
- Verify that hard agronomic constraints are not overridden by profit ranking.

### Yield/price forecasting
- Chronological holdout and/or rolling-origin evaluation.
- Baseline comparison for every crop/market series.
- MAE/RMSE; report units, dates, horizon and sample count.
- Interval coverage only if interval calibration is implemented and evaluated.
- Disable/label unavailable forecasts if coverage or performance is inadequate.

### Economics
- Unit tests for area/yield/price conversions and expense categories.
- Independent hand-calculated test examples.
- Negative/invalid input validation and missing-cost disclosures.

### RAG and Kannada output
- A manually reviewed evaluation set with expected source passage(s).
- Retrieval relevance/Recall@k if labels are available.
- Citation support accuracy and unsupported-question abstention.
- Kannada text review and audio pronunciation checks with a competent speaker where possible.
- TTS failure/timeout fallback tests.

### Usability
- Test with a small set of representative users if feasible.
- Record task completion issues and wording confusion; do not claim user validation without actually doing it.

## 14. Success Metrics and Definition of Done

The project is complete when:
1. A fresh local setup is documented and reproducible.
2. At least one real official market dataset is processed, or the precise access limitation and working CSV fallback are documented.
3. Market prices shown in the app are traceable to a source row and date.
4. Profile inputs drive transparent suitability rules; missing soil data is not guessed.
5. Net-return formulas pass tests and show explicit cost assumptions.
6. Forecast is tested against a baseline or explicitly disabled/documented as unsupported.
7. RAG answers show relevant source citations and abstain when evidence is insufficient.
8. Kannada audio works when credentials are configured, or provider setup requirement is explicitly documented.
9. Frontend, backend and high-risk unit/integration tests have real recorded results.
10. README includes setup, architecture, sources, evaluation and limitations.
11. No secrets, fabricated metrics or unsupported claims are present.

## 15. Key Risks and Mitigations

- **Historical data is incomplete for a target crop/market:** Start with 3–5 crops and selected markets; provide market analytics/scenarios rather than unreliable forecasts.
- **Live API access requires credentials/approval:** Use adapters and a permitted CSV import fallback; clearly label live integration as pending.
- **Soil inputs are missing or self-reported:** Accept optional Soil Health Card values; mark unknowns and lower specificity.
- **Official cultivation costs are stale:** Show report year and let users override categories with local cost estimates.
- **Weather forecast is confused with seasonal outcome:** Show valid time/source; use short-range weather only for short-term context.
- **LLM invents prices or agricultural facts:** Use tool-based calculations, retrieved evidence, citations, no-evidence abstention and evaluation.
- **Kannada TTS mispronounces names/units:** Review sample audio with a Kannada speaker; allow replay and show text.
- **Model overfits or performs worse than baseline:** Use time-based evaluation, simple baselines, per-series reporting and disable weak forecasts.
- **Ten-day scope becomes too large:** Maintain strict P0 scope, limit to 3–5 crops, avoid a native mobile app/advanced MLOps, and reserve two days for improvements/release.
- **External source changes schema or fails:** Validate response schema, preserve raw files, log ingestion failures and display last-update status.

## 16. Ten-Day Delivery Strategy

- **Day 1:** Project foundation, PRD/architecture, environment setup, source feasibility.
- **Day 2:** Official data import/connectors, data cleaning, source provenance and data audit.
- **Day 3:** Farmer profile, soil/water inputs, rule-based crop suitability engine.
- **Day 4:** Yield/price baseline evaluation and low/base/high profit scenarios.
- **Day 5:** Weather integration where accessible, crop-ranking transparency and external-data freshness.
- **Day 6:** Mobile-first React frontend and end-to-end profile-to-recommendation workflow.
- **Day 7:** RAG document ingestion, source-cited assistant and structured numerical tool calls.
- **Day 8:** Kannada TTS, end-to-end integration, critical tests and MVP freeze.
- **Day 9:** Quality improvement, scenario testing, usability review, source/citation audit.
- **Day 10:** Deployment/reproducible setup, README, demo, quality report and future roadmap.

Ten days is a focused MVP target, not a guarantee of production readiness. If a provider or dataset cannot be accessed, the project should deliver a reliable fallback and document the limitation rather than misrepresent the integration.

## 17. Official Source References

1. Karnataka OGD / AGMARKNET daily mandi prices: https://karnataka.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi
2. e-NAM historical dashboard: https://www.enam.gov.in/web/dashboard/Historical
3. e-NAM trading details: https://www.enam.gov.in/web/trading-details
4. Karnataka district-wise crop production statistics: https://karnataka.data.gov.in/catalog/district-wise-season-wise-crop-production-statistics-0
5. IMD API reference: https://api.imd.gov.in/public/api_reference.html
6. Soil Health Card portal: https://soilhealth.dac.gov.in/
7. University of Agricultural Sciences, Bengaluru: https://www.uasbangalore.edu.in/
8. ICAR: https://icar.gov.in/
9. Cost of Cultivation/Production reports: https://desagri.gov.in/document-report/cost-of-cultivation-production-related-data/
10. Google Cloud Text-to-Speech supported voices: https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types
11. BHASHINI: https://bhashini.gov.in/

