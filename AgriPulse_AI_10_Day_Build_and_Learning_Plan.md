# AgriPulse AI — 10-Day Build, Study and Improvement Plan

**Product:** Karnataka crop suitability + market intelligence + profit scenarios + RAG + Kannada audio  
**Plan:** Days 1–8 implementation; Days 9–10 improvement, validation and release  
**Intended use:** Paste the Master Prompt once into a code-editing assistant, then submit only the relevant daily prompt. Review and test each day's changes before continuing.

> Reality check: A focused student MVP may be achievable in 10 days with regular work and AI-assisted coding, but a production-grade, scientifically validated farm-advisory system is not. Dataset access, model quality, external credentials and Kannada review are gating dependencies. If a dependency is missing, build a transparent fallback rather than fake a result.

## Part 1 — Product in brief

AgriPulse AI helps farmers in Karnataka compare feasible crop choices, understand market price history, estimate revenue/cost/net-return scenarios, and ask agricultural questions in Kannada or English. It combines official sources and explicit agronomic rules with evaluated ML forecasts only where data supports them. A RAG assistant retrieves official agricultural documents and shows citations. Kannada TTS reads the final answer aloud after the user presses Play.

### MVP user journey

1. Choose Kannada or English.
2. Enter district/taluk/village or supported location, land area, season, water access, budget, risk preference and any known soil/Soil Health Card values.
3. See crop candidates filtered through official-source-backed rules; unknown soil values stay unknown.
4. Compare candidate crops using yield and price assumptions, total cost, gross revenue, net-return scenarios and uncertainty.
5. Browse observed mandi prices and compare selected markets by date, unit, and source.
6. Ask the assistant a question; the backend uses database/model tools for numerical facts and RAG for agricultural explanations.
7. View citations and, for Kannada answers, press Play to hear the same final answer aloud.

## Part 2 — Stack and why

### React + TypeScript + Vite
- **Purpose:** Responsive web interface and typed API integration.
- **Study:** Components, props/state, routes, types, forms, loading/error states.

### Tailwind CSS + Lucide + Recharts
- **Purpose:** Styling, icons, price/forecast charts.
- **Study:** Responsive utilities, accessible labels, chart series and data shaping.

### Python + FastAPI + Pydantic
- **Purpose:** REST APIs and validated requests/responses.
- **Study:** HTTP, request validation, error status, dependency/config patterns.

### PostgreSQL + SQLAlchemy + Alembic
- **Purpose:** Structured market/profile/source storage and schema migrations.
- **Study:** Tables/keys, joins, indexes, ORM, migrations and transactions.

### Pandas + NumPy
- **Purpose:** CSV ingestion, validation, EDA and features.
- **Study:** Data types, missingness, groupby, date parsing, outliers and aggregation.

### Scikit-learn / suitable statistical baseline
- **Purpose:** Forecast comparison and evaluation.
- **Study:** Data leakage, time-based splits, MAE/RMSE and baseline comparison.

### Document parsing + TF-IDF/keyword retrieval
- **Purpose:** First RAG prototype.
- **Study:** Text extraction, chunks, metadata and retrieval relevance.

### LLM API (optional/configurable)
- **Purpose:** Grounded explanation using retrieved evidence and tools.
- **Study:** Prompt boundaries, structured tool results, abstention, cost and latency.

### Google Cloud TTS or approved BHASHINI provider
- **Purpose:** Kannada text-to-speech.
- **Study:** Server-side credentials, audio MIME types, playback, errors, billing and access.

### Pytest + HTTPX + frontend build checks
- **Purpose:** Automated testing.
- **Study:** Unit vs integration tests, regression coverage and test fixtures.

### Docker + GitHub Actions
- **Purpose:** Reproducible run and CI where time permits.
- **Study:** Containers, environment configuration, database persistence and pipeline status.

### Provider and data-source constraints

- Market: Karnataka OGD/AGMARKNET daily price catalogue; e-NAM historical data where accessible and schema-compatible.
- Yield/production: OGD district/season/crop/year area and production records; derived regional yield is not an individual farm yield.
- Weather: IMD APIs where documented access and valid credentials permit; separate observed weather from forecast valid time.
- Soil: Farmer-entered values from an actual Soil Health Card or soil test; do not assume open access to individual farm records.
- Agronomy: Relevant official ICAR/UAS documents and IMD crop advisories; store issuer, URL, document version/date and sections.
- Cost: Official cost-of-cultivation reports with report year; allow users to override local expenses.
- TTS: Google Cloud Text-to-Speech Kannada (`kn-IN`) is the first choice; BHASHINI is an alternative if access is available. Keep keys server-side.

Official links:
- https://karnataka.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi
- https://www.enam.gov.in/web/dashboard/Historical
- https://www.enam.gov.in/web/trading-details
- https://karnataka.data.gov.in/catalog/district-wise-season-wise-crop-production-statistics-0
- https://api.imd.gov.in/public/api_reference.html
- https://soilhealth.dac.gov.in/
- https://www.uasbangalore.edu.in/
- https://icar.gov.in/
- https://desagri.gov.in/document-report/cost-of-cultivation-production-related-data/
- https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types
- https://bhashini.gov.in/

---

## Part 3 — Master Engineering Prompt

Paste this prompt once before requesting Day 1.

```text
Act as a senior full-stack engineer, data scientist, ML engineer, AI/RAG engineer, QA engineer, and patient technical mentor. Help me build AgriPulse AI: a Karnataka-focused crop suitability, agricultural market intelligence, profit-scenario, and Kannada voice-assistant web application.

PROJECT OUTCOME
Build a mobile-first application that collects a farmer profile (district/taluk/village or supported location, land area, sowing season, available water, known soil type, optional Soil Health Card measurements, budget and risk preference), filters candidate crops through verified agronomic rules, compares official mandi prices, calculates transparent estimated profit scenarios, uses price/yield forecasts only where historical data supports credible evaluation, and answers agricultural questions through a source-grounded RAG assistant. The final Kannada answer must be readable aloud through a configured text-to-speech provider after an explicit user action.

STACK
Frontend: React + TypeScript + Vite, Tailwind CSS, React Router, Axios or a typed fetch client, Recharts, Lucide icons.
Backend: Python + FastAPI + Pydantic, SQLAlchemy, Alembic, PostgreSQL.
Data/ML: Pandas, NumPy, scikit-learn, suitable baselines and optionally XGBoost only when justified.
RAG: PDF/HTML extraction, metadata-rich chunks, keyword/TF-IDF retrieval first; embeddings can be added only if time/quality justify them.
Speech: Google Cloud Text-to-Speech `kn-IN` or BHASHINI if access is confirmed. Never expose keys in frontend code.
Testing/ops: Pytest, HTTPX, frontend build/type checks, Docker/Compose and GitHub Actions where practical.

OFFICIAL DATA SOURCES
- Karnataka Open Government Data/AGMARKNET daily mandi prices.
- e-NAM historical prices and arrivals where accessible.
- Official district/crop/season/year production and area statistics.
- IMD documented APIs only when permitted and configured.
- Soil-test values entered by the user from an actual Soil Health Card/report; never infer exact soil chemistry from GPS.
- Official ICAR/UAS agricultural guidance and IMD agromet advisories.
- Official cultivation-cost reports with their year shown; allow local user-entered cost overrides.

HARD REQUIREMENTS
1. Inspect the existing repository before editing. Preserve working code and avoid wholesale rewrites.
2. Build only the day I explicitly request. Stop at the end of each day and wait for the next prompt.
3. Do not fabricate observed prices, farm soil measurements, historical labels, forecasts, evaluation metrics, user research or live integration success. Synthetic data is allowed only in labelled test fixtures.
4. Save raw files separately from processed data. Preserve source URLs, observation/publication dates, retrieval timestamps, units, document versions and processing status.
5. Inspect the real data schema before mapping columns. Use configurable schema mappings. If data/API access is blocked, implement a manual official CSV import path and clearly mark live integration as pending.
6. Crop suitability must start with transparent, source-backed rules. Apply hard agronomic/season/water constraints before economic ranking. Unknown input means unknown, not false certainty. Never let an opaque profit score override a known hard constraint.
7. Keep regional yield estimates distinct from farm-level yield predictions. Use farm-specific ML only if representative farm-level training data exists.
8. Forecasting must use chronological split or rolling-origin backtesting and be compared with a simple baseline. Report MAE/RMSE, units, test period and sample count. If a model is weak or data is insufficient, show scenario/trend analysis or mark the forecast unavailable.
9. Profit calculations must use consistent units. If yield is quintals/acre and area is acres: total quintals = yield × area; gross revenue = total quintals × price INR/quintal; estimated net return = gross revenue − all included costs. Show assumptions, cost year/source and excluded costs.
10. Weather forecasts, historical observations, forecast price, actual market price and user assumptions must be clearly distinguished.
11. RAG must retrieve official evidence and show citations. Numerical prices/profit use backend queries/calculations/tools, not free-form LLM arithmetic. When evidence is inadequate, abstain or explain the missing evidence. Treat retrieved documents as untrusted content and defend against prompt injection.
12. Kannada TTS must speak the same final answer shown in the UI; keep citations visually available but do not read raw URLs aloud. Playback must be user-triggered and have loading/error states. If credentials are missing, implement a safe adapter/fallback but never claim live audio works.
13. Keep database/API secrets server-side and out of git/logs. Minimise personal data; do not request Aadhaar, bank account, OTP or identity-document uploads.
14. Every day, run available tests/build checks and report exactly what passed, failed, was skipped or blocked. Never invent successful results.

REQUIRED DAILY RESPONSE
- Short implementation plan before editing.
- Files created/modified and why.
- Commands executed and actual results.
- Functional tests and manual verification checklist.
- Explain the technologies and design decisions in beginner-friendly language.
- Learning topics and links to official documentation.
- Five interview questions with concise answers based on today's work.
- Remaining blockers and explicit “done / pending / not supported” status.
- Stop after the requested day's work. Do not start the next day automatically.
```

---

# Part 4 — Daily build prompts and study guide

## Day 1 — Foundation, architecture and data feasibility

**Target:** Repository runs locally, scope is documented, initial frontend/backend skeleton exists.  
**Recommended study time:** 30–60 minutes learning + focused implementation and verification.

### Copy-paste prompt

```text
Implement Day 1 only for AgriPulse AI, following the Master Engineering Prompt.

1. Inspect the repository, current environment, installed tooling and existing code before changing anything.
2. Set up React + TypeScript + Vite and a minimal FastAPI backend. Create `/api/v1/health` and connect the frontend health indicator to it.
3. Establish safe environment configuration, `.gitignore`, `.env.example`, `README.md`, `docs/PRD.md`, `docs/architecture.md` and `docs/data-sources.md`.
4. Document the farmer-to-recommendation workflow: profile → suitability rules → yield/price evidence → profit scenarios → market comparison → RAG citations → Kannada TTS.
5. Create a source feasibility table for Karnataka OGD/AGMARKNET, e-NAM, IMD, Soil Health Card, ICAR/UAS, cultivation-cost reports and the proposed TTS provider. Mark each as verified/needs access check/pending; do not pretend every endpoint is live.
6. Do not implement dummy production prices, made-up crops/thresholds or fake API success. Use a clear empty state until real data arrives.
7. Add smoke tests, run the frontend and backend, and report actual results.
8. Explain client-server architecture, routes, environment configuration, source-provenance plan and each file changed. Include five interview Q&As and the manual verification checklist.

Stop after Day 1.
```

### What to study
- Client/server model, HTTP requests/responses, REST endpoints.
- React components and TypeScript props/types.
- FastAPI routes, status codes and environment settings.
- Git, commits, `.gitignore` and secret handling.

### Official study links
- React: https://react.dev/learn
- Vite: https://vite.dev/guide/
- FastAPI: https://fastapi.tiangolo.com/tutorial/first-steps/
- Git: https://git-scm.com/docs/gittutorial

### Completion checklist
- [ ] Frontend starts in browser.
- [ ] FastAPI health endpoint returns a real response.
- [ ] `.env.example` has placeholders only; no secrets committed.
- [ ] PRD, architecture and source inventory exist.
- [ ] Data integrations are marked accurately as available, pending or blocked.

### Explain in an interview
“I separated the UI from the data and recommendation services so that external data providers, ML models and speech services can be tested and replaced independently.”

---

## Day 2 — Official data ingestion and quality audit

**Target:** Real-source CSV/API data is imported, validated and traceable.  
**Main learning:** Python, Pandas, schema mapping and data quality.

### Copy-paste prompt

```text
Implement Day 2 only for AgriPulse AI. Inspect the actual official CSV/API response before writing field mappings.

1. Build reusable ingestion adapters for Karnataka OGD/AGMARKNET mandi prices and e-NAM history if a permitted, usable resource is available. Add an IMD adapter interface, but only call documented endpoints with valid access. Create a manual official CSV import path so core development is not blocked by credentials.
2. Keep `data/raw` immutable. Write cleaned data into a separate processed location and/or PostgreSQL staging table.
3. Create a canonical price record: source ID, source URL, retrieval timestamp, observation date, state, district/market, commodity/variety where provided, min/max/modal price, unit and raw-row hash.
4. Use configurable mapping for actual source column names; validate dates and numeric ranges; preserve unknown source fields; report duplicates, missingness, invalid rows, units and date coverage.
5. Do not silently delete outliers or replace missing values. Flag suspicious rows for review.
6. Store a machine-readable data-quality report and update `docs/data-sources.md` with exact download/API route, date downloaded, columns, usage terms checked and limitations.
7. If an official source cannot be accessed, do not invent data. Create a tested loader interface using clearly labelled synthetic test fixtures and explicitly state production ingestion is pending.
8. Run tests and make a small EDA summary of the real imported data: row count, date range, commodity count, market count, missing-value rates and price distribution.
9. Explain every cleaning decision, what Pandas does, and five interview Q&As.

Stop after Day 2.
```

### What to study
- `read_csv`, dtypes, date parsing, `isna`, `duplicated`, `groupby`, merging and simple plots.
- Data quality vs data cleaning; source and unit provenance.
- HTTP timeout/retry basics and schema change handling.

### Official study links
- Pandas getting started: https://pandas.pydata.org/docs/getting_started/index.html
- Pandas user guide: https://pandas.pydata.org/docs/user_guide/index.html
- Karnataka market-price source: https://karnataka.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi
- IMD API list: https://api.imd.gov.in/public/api_reference.html

### Completion checklist
- [ ] Actual source columns are inspected and documented.
- [ ] Raw input is preserved; processed data is separate.
- [ ] Cleaning and quality report run reproducibly.
- [ ] Data source URL, dates and units are traceable.
- [ ] Unavailable API access is explicitly documented; no fake production values exist.

### Explain in an interview
“Before modelling, I established a reproducible ingestion layer and measured completeness, duplicates, units and date coverage. This prevents invalid data from silently becoming a forecast.”

---

## Day 3 — Farmer profile, soil/water fields and suitability engine

**Target:** A transparent rule engine returns crop candidates with explanations.  
**Main learning:** Pydantic schemas, business rules, constraints and evidence-based recommendations.

### Copy-paste prompt

```text
Implement Day 3 only for AgriPulse AI.

1. Create validated farmer-profile schemas and the profile UI fields: district, taluk/village if covered, land area and units, season/sowing window, water availability (rainfed/limited/reliable), budget/risk preference, known soil type and optional Soil Health Card metrics with units and test date.
2. Create a small crop knowledge catalogue for 3–5 crops and a limited district/season scope. Every soil, water, sowing-season and duration rule must have a verified official source citation; do not invent numeric thresholds to fill gaps.
3. Build a deterministic suitability engine. First test hard feasibility constraints, then return candidate status (suitable / conditionally suitable / insufficient information / unsuitable), reasons, evidence sources and missing inputs.
4. Keep economic ranking separate from agronomic suitability. A high revenue estimate cannot override known hard constraints. Unknown pH/NPK/water data is not the same as a failed constraint.
5. Never infer exact soil properties from GPS or district. Allow profile editing and represent unknown values explicitly.
6. Return a machine-readable recommendation explanation to the frontend. Test complete, incomplete, boundary and impossible profiles.
7. Document rule sources, rule versions and limitations in `docs/crop-rules.md`.
8. Explain the difference between a rule-based engine and a trained ML model, and include five interview Q&As.

Stop after Day 3.
```

### What to study
- Pydantic models, field validation and clear enums.
- Rule engines, hard vs soft constraints and explainability.
- Soil Health Card fields; why a test date/source matters.

### Official study links
- Pydantic validators: https://docs.pydantic.dev/latest/concepts/validators/
- Soil Health Card: https://soilhealth.dac.gov.in/
- ICAR: https://icar.gov.in/
- UAS Bengaluru: https://www.uasbangalore.edu.in/

### Completion checklist
- [x] Profile validation handles units and missing values.
- [x] Every configured crop rule has a source.
- [x] System can return “insufficient information”.
- [x] Crop explanations name the factors considered.
- [x] Test cases cover suitable, unsuitable and unknown conditions.

### Explain in an interview
“I chose an explainable rule engine for the initial crop suitability filter because reliable labelled farm-level training data may not exist. ML is used only where it can be validated.”

---

## Day 4 — Yield/price evidence, economics and profit scenarios

**Target:** A tested economics engine returns transparent low/base/high scenarios, with forecasting only if supportable.  
**Main learning:** Units, baseline forecasting, chronological validation and uncertainty.

### Copy-paste prompt

```text
Implement Day 4 only for AgriPulse AI.

1. Audit available district/crop/season/year production and area data, plus market-price history for chosen crop-market pairs. Calculate regional yield only with compatible units and label its geographic/temporal granularity.
2. Define consistent economics units. If yield is quintals/acre, area is acres and price is INR/quintal: total output quintals = yield × area; gross revenue = total output × price; estimated net return = gross revenue − included cultivation/marketing/transport costs.
3. Include cost categories for seeds, fertilizer, labour, plant protection, irrigation, machinery, harvesting, transport, market charges and other user-provided costs. Store official cost estimates with report year and source; permit user overrides without changing official source data.
4. Create conservative/base/optimistic scenarios from defensible historical quantiles, evaluated forecast uncertainty, or clearly labeled user-selected assumptions. Do not invent a standard percentage for every crop.
5. Establish a last-observed or suitable seasonal naive price baseline. Only train a second model for series with adequate data. Use chronological validation/backtesting and report MAE/RMSE, horizon, dates and sample size.
6. If the model is not better than the baseline or data is insufficient, disable the predictive claim and provide historical trend/scenario analysis.
7. Build `POST /api/v1/economics/scenarios` and tests for units, negative/zero quantity, costs, missing values, unit conversions and boundary cases.
8. Create `docs/ML_EVALUATION.md`, state all model/cost assumptions and include five interview Q&As.

Stop after Day 4.
```

### What to study
- Production, yield, price, gross revenue, net return and total cost differences.
- Lag features, moving averages, time-ordered split and baseline selection.
- MAE/RMSE in INR per quintal; model vs baseline; forecast intervals versus arbitrary ranges.

### Official study links
- Crop production data: https://karnataka.data.gov.in/catalog/district-wise-season-wise-crop-production-statistics-0
- Cost-of-cultivation reports: https://desagri.gov.in/document-report/cost-of-cultivation-production-related-data/
- Scikit-learn forecasting: https://scikit-learn.org/stable/auto_examples/applications/plot_time_series_lagged_features.html
- Model evaluation: https://scikit-learn.org/stable/modules/model_evaluation.html

### Completion checklist
- [x] Profit formula and units are tested.
- [x] Cost source year is displayed, with user override.
- [x] Forecast uses chronological evaluation and a simple baseline.
- [x] No measured model improvement is claimed without results.
- [x] Low/base/high scenarios explain assumptions and uncertainty.

### Explain in an interview
“The expected return is not an LLM-generated number. The backend calculates it from explicit yield, price, area and cost assumptions, while forecasts are shown only after time-based evaluation.”

---

## Day 5 — Weather API, market freshness and transparent ranking

**Target:** Available weather/market sources feed recommendations without implying unjustified long-term certainty.  
**Main learning:** External APIs, caching, valid-time metadata, ranking and graceful fallback.

### Copy-paste prompt

```text
Implement Day 5 only for AgriPulse AI.

1. Implement the documented IMD provider adapter if credentials/access are confirmed. Keep external requests server-side with timeouts, validated response schemas, retries, cache rules and last-successful-update metadata.
2. Distinguish observed weather, forecast issuance time and forecast valid time. Do not extrapolate a 5–7-day weather forecast to claim seasonal rainfall or harvest-time prices.
3. Connect current/near-term weather advisories to crop-season context only where official agronomy evidence explains relevance. Do not change crop suitability based on an arbitrary score.
4. Implement market data freshness indicators and source status. If an API is stale/unavailable, retain last verified records only with a stale label or show unavailable.
5. Rank crops only after hard agronomic filters. Explain components such as season fit, water fit, budget fit, crop duration, expected net-return scenarios and downside risk; preserve unknown fields.
6. Add tests for provider timeout, missing field, stale data, invalid location and empty response. If access is blocked, keep a tested adapter and manual-data fallback; label live integration as pending.
7. Explain API integration, cache decisions and ranking trade-offs; update source docs and include interview Q&As.

Stop after Day 5.
```

### What to study
- HTTP status codes, API keys, timeouts/retries and caching.
- Issued-at versus valid-time timestamps.
- Hard constraints vs weighted ranking and score transparency.

### Official study links
- IMD API reference: https://api.imd.gov.in/public/api_reference.html
- FastAPI dependencies: https://fastapi.tiangolo.com/tutorial/dependencies/
- Python datetime: https://docs.python.org/3/library/datetime.html

### Completion checklist
- [ ] External data is validated and has a source timestamp.
- [ ] Weather freshness is visible.
- [ ] Failed provider requests do not break unrelated features.
- [ ] Suitability rules are not silently overridden by economic rank.

### Explain in an interview
“The app uses weather for context, not as a guarantee of yield. It separates hard agronomic feasibility from softer economic preference ranking.”

---

## Day 6 — Farmer-friendly responsive frontend

**Target:** A complete profile-to-recommendation flow on mobile and desktop.  
**Main learning:** React state, typed API clients, form UX, chart/data separation and accessibility.

### Copy-paste prompt

```text
Implement Day 6 only for AgriPulse AI.

1. Build the responsive UI in React + TypeScript with a clean agriculture-inspired system: high contrast, readable labels, restrained greens/earth neutrals, accessible icons and mobile-first layout.
2. Implement routes/pages: Home/Dashboard, Farmer Profile, Crop Recommendations, Crop Comparison, Market Explorer, Market Comparison, Profit Calculator, AI Assistant and a minimal internal Data Status page.
3. Build reusable components: navigation, language selector, form fields, crop cards, source chips, price tables/charts, scenario cards, confidence/coverage notices, source-date labels, loading/error/empty states and retry actions.
4. Integrate the typed API client with the real backend. Use no hardcoded live prices/profits. Label observed data, farmer assumptions, historical estimates and model forecasts distinctly.
5. Make the profile step-by-step and hide advanced soil fields behind an optional “I have a soil test” path. Explain unknown soil status rather than forcing users to invent values.
6. Ensure keyboard navigation, form labels, visible focus states, chart text/table alternatives, and clear Kannada/English text handling.
7. Run frontend build/type checks and test core flows using real API results or an explicitly labelled empty state. Document component architecture and include five interview Q&As.

Stop after Day 6.
```

### What to study
- Components, props/state, forms, validation, routes and typed API calls.
- Mobile-first design and accessible chart alternatives.
- Avoiding duplicate fetching/race conditions; loading/error/empty states.

### Official study links
- React: https://react.dev/learn
- TypeScript: https://www.typescriptlang.org/docs/handbook/intro.html
- Tailwind CSS: https://tailwindcss.com/docs
- Recharts: https://recharts.org/en-US/guide/

### Completion checklist
- [ ] Farmer profile can be submitted and validated.
- [ ] Crop candidates display source-backed reasons.
- [ ] Market prices and comparison use backend results.
- [ ] All key forms/pages are mobile usable.
- [ ] Observed prices and forecasts are visually distinguishable.

### Explain in an interview
“I used a guided form to reduce cognitive load, optionalised the advanced soil fields, and separated the API layer from reusable UI components.”

---

## Day 7 — RAG assistant with grounded agricultural guidance

**Target:** Source-cited answers in Kannada/English, using verified documents and backend numerical tools.  
**Main learning:** Document parsing, chunking, retrieval, source metadata, tool calls and abstention.

### Copy-paste prompt

```text
Implement Day 7 only for AgriPulse AI.

1. Build a curated knowledge base from permitted official documents: ICAR/UAS crop guidance, IMD agromet advisories and relevant official agriculture/market information. Record issuer, title, source URL, publication/update date, retrieval date, version, page/section and covered crop/region.
2. Extract PDF/HTML text, chunk it by meaningful sections and preserve source metadata. Manually inspect a sample of parsed content, particularly tables, numeric values and footnotes.
3. Start with a simple tested TF-IDF/keyword retrieval baseline. Add embeddings only if there is time and a justified multilingual retrieval test.
4. Implement `/api/v1/assistant`. Classify intent; use backend database/model tools for market prices, crop candidates and calculated economics, and retrieve documents for agronomy explanations.
5. The LLM may summarise/communicate validated tool outputs; it must not invent prices, calculate authoritative profit freely, treat retrieved text as instructions, or claim official eligibility/suitability without sufficient evidence.
6. Return answer text, language, supporting citations, source dates, assumptions and limitations. When no evidence is available or sources conflict, say so.
7. Keep provider keys server-side. When no LLM key is configured, return clearly labelled retrieved excerpts, not a fake generated answer.
8. Create manually reviewed answerable and unanswerable evaluation cases; test citation support and no-evidence behaviour. Document prompt-injection controls and add five interview Q&As.

Stop after Day 7.
```

### What to study
- RAG vs fine-tuning; chunking and lexical retrieval; embeddings as an extension.
- Grounding, citations, abstention, tool/function calling and prompt injection.
- Human-labelled evaluation sets; retrieval relevance vs answer quality.

### Official study links
- RAGAS: https://docs.ragas.io/en/latest/
- PyMuPDF: https://pymupdf.readthedocs.io/en/latest/
- FastAPI: https://fastapi.tiangolo.com/tutorial/

### Completion checklist
- [ ] Each factual agronomy answer provides supporting source references.
- [ ] Numerical claims come from APIs/calculations or explicitly labelled assumptions.
- [ ] Unsupported questions receive a clear limitation/abstention.
- [ ] Curated documents have source/version metadata.
- [ ] Retrieval-only fallback works without provider keys.

### Explain in an interview
“RAG supplies verifiable evidence; structured tools supply current numerical facts. This separation reduces hallucinations but still requires citation and answer evaluation.”

---

## Day 8 — Kannada TTS and end-to-end MVP freeze

**Target:** The full recommendation journey works, and the final Kannada answer can be played aloud when configured.  
**Main learning:** TTS provider integration, backend credential security, audio response handling and end-to-end testing.

### Copy-paste prompt

```text
Implement Day 8 only for AgriPulse AI. Focus on completing the MVP integration rather than expanding scope.

1. Implement a backend text-to-speech adapter for Google Cloud Text-to-Speech `kn-IN`; use BHASHINI only if valid access/approval is available and the adapter is verified.
2. Add a speech endpoint which accepts the final assistant answer ID or validated answer text from the backend session; do not allow arbitrary unbounded text or expose provider credentials. Prefer synthesising the server-stored final response.
3. Return audio with an appropriate content type or a short-lived audio reference. Add frontend Play/Pause/Replay, loading, cancel/retry and provider-error states. Playback must start only after a user click.
4. Speak the same final Kannada answer shown on screen. Do not read markdown citations or raw URLs aloud; citations must remain visibly accessible. Handle numerals, INR, quintals/acres, crop names and dates sensibly, and request Kannada-speaker review if possible.
5. Add rate/length limits and avoid unnecessary transcript/audio retention. Document provider configuration and possible billing.
6. Perform an end-to-end test: profile → suitability rules → yield/price/cost scenarios → market comparison → RAG answer with citations → Kannada audio playback. Test missing credentials/provider outage too.
7. Run backend tests, frontend build and smoke checks. Mark each integration `working`, `pending credentials`, `fallback`, or `unavailable` accurately. Freeze scope and report remaining blockers.

Stop after Day 8.
```

### What to study
- TTS vs speech-to-text; locale/voice selection.
- Secure credential management, audio MIME types and browser playback.
- HTTP streaming/file responses, latency, retry and API cost.
- Consistency between cited displayed answer and spoken answer.

### Official study links
- Google Cloud TTS voices: https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types
- BHASHINI: https://bhashini.gov.in/
- FastAPI testing: https://fastapi.tiangolo.com/tutorial/testing/

### Completion checklist
- [ ] Kannada answer text is displayed with citations.
- [ ] Play explicitly requests/supplies audio and playback works when credentials are configured.
- [ ] No provider credentials appear in client code or logs.
- [ ] Missing provider credentials yield honest fallback/status.
- [ ] Full user journey is reproducible.

### Explain in an interview
“The model generates a grounded text answer first, then TTS converts that final answer to Kannada audio. Keeping these stages separate makes quality, citations, and voice provider easier to test.”

---

## Day 9 — Improvement day: evaluation, farmer usability and risk audit

**Target:** Fix the highest-impact issues; no large new feature.  
**Main learning:** QA, model review, human usability, regression testing and failure analysis.

### Copy-paste prompt

```text
Implement Day 9 only for AgriPulse AI. This day is reserved for improvements and evaluation, not new major features.

1. Audit data completeness, source freshness, duplicate handling, missingness, unit conversion and raw-to-clean reproducibility.
2. Test crop recommendations with suitable, unsuitable, unknown and contradictory soil/water/season combinations. Ensure unknown is not treated as a fact and hard constraints cannot be overridden by profit ranking.
3. Recalculate sample economics by hand and compare with the application. Test unit conversions, zero/negative area, missing costs, unusually large numbers and alternative cost scenarios.
4. Recheck chronological ML split, baseline comparison, forecast horizon and per-series performance. Disable unsupported forecasts and remove unsubstantiated accuracy claims.
5. Evaluate RAG retrieval and citations against manually reviewed questions. Try unsupported questions and prompt-injection content in retrieved documents. Confirm the system abstains when evidence is insufficient.
6. Test Kannada content and audio for important crop names, amounts and units; verify TTS timeout, malformed response and missing-key paths.
7. Improve the top three user-friction points with small fixes, especially mobile form complexity, unclear labels, loading/error states and explanations.
8. Run tests/build, create `docs/QUALITY_REPORT.md`, prioritise known issues by severity and report only measured results. If real farmer testing was not performed, say so.

Stop after Day 9.
```

### What to study
- Unit, integration and end-to-end tests.
- Error budgets and prioritisation.
- Forecast error and model limitations.
- Human feedback and usability-task observation.
- Security of secrets, file ingestion, APIs and logs.

### Official study links
- Pytest: https://docs.pytest.org/en/stable/
- FastAPI testing: https://fastapi.tiangolo.com/tutorial/testing/
- GitHub Actions: https://docs.github.com/en/actions
- RAGAS metrics: https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/

### Completion checklist
- [ ] High-risk formula/rule/citation bugs are fixed or explicitly documented.
- [ ] Evaluation reports include test window/sample count and measured metrics.
- [ ] Mobile flows and Kannada playback are checked.
- [ ] All unsupported/stale external source paths have proper fallback states.
- [ ] Quality report distinguishes fixed, pending and blocked items.

### Explain in an interview
“I prioritised correctness and trust over feature count, using regression tests to ensure improvements did not break verified workflows.”

---

## Day 10 — Improvement day: release quality, deployment and presentation

**Target:** Reproducible application, clear documentation, demo and roadmap.  
**Main learning:** Deployment, Docker, CI, reproducibility and technical storytelling.

### Copy-paste prompt

```text
Implement Day 10 only for AgriPulse AI. Reserve this day for release quality and future planning; do not expand MVP scope.

1. Make local setup reproducible. Verify dependency files, `.env.example`, database migrations, startup commands, health checks and raw-data folder conventions. Add/verify Docker Compose if practical.
2. Run backend tests, frontend production build, type/lint checks that exist, and an end-to-end smoke test. Save actual command/result output or summarise each accurately. Do not fabricate passes or deployment URLs.
3. Review `.gitignore`, secret exposure, CORS, file upload/content limits, rate limits on LLM/TTS routes, DB query safety and log redaction. Confirm no API key or private file is committed.
4. Finalise README with the problem statement, architecture diagram, features, supported geographic/crop scope, setup guide, API endpoints, source data links/terms, environment variables, TTS provider steps, measured ML results, known limitations and screenshot/demo instructions.
5. Add a concise demo script showing the main user workflow in 3–5 minutes.
6. Create a resume-ready project summary, but include accuracy/latency/data-volume numbers only if measured and reproducible.
7. Create a ranked future roadmap (for example, Kannada voice input, soil-report OCR, weather notifications, FPO features, wider crop/district coverage). Label each as future work and explain dependencies/risk; do not implement now.
8. Report exactly what is deployed vs local-only, integrations working vs pending credentials, tests passed/failed/skipped, and the top three next actions.

Stop after Day 10.
```

### What to study
- Docker containers and persistence.
- Deployment settings/secrets and migrations.
- CI/CD workflows and health checks.
- Documentation quality and honest metrics.
- Explaining trade-offs in a demo or interview.

### Official study links
- Docker: https://docs.docker.com/get-started/
- FastAPI deployment: https://fastapi.tiangolo.com/deployment/docker/
- GitHub Actions: https://docs.github.com/en/actions

### Completion checklist
- [ ] A clean setup path is documented and tested.
- [ ] Test/build outcomes reflect actual execution.
- [ ] README describes data, architecture, limits and providers.
- [ ] Demo walkthrough and screenshots are ready.
- [ ] Resume claims match measured work and known limitations.

### Explain in an interview
“I focused on reproducibility, source traceability, model evaluation and truthful uncertainty, not only the visual demo. External integrations clearly disclose when access credentials are unavailable.”

---

## Part 5 — Windows 11 setup commands

### Prerequisites

Install from the official sources if missing:
- Node.js LTS: https://nodejs.org/en
- Python 3.12: https://www.python.org/downloads/
- Git: https://git-scm.com/downloads
- PostgreSQL: https://www.postgresql.org/download/windows/
- VS Code: https://code.visualstudio.com/
- Docker Desktop (optional initially): https://www.docker.com/products/docker-desktop/

Check in PowerShell:

```powershell
node --version
npm --version
py -3.12 --version
git --version
psql --version
```

### Create repository and frontend

```powershell
mkdir agripulse-ai
cd agripulse-ai
git init
mkdir docs
mkdir data
mkdir data\raw
mkdir data\processed
mkdir data\evaluation
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios recharts lucide-react react-router-dom
cd ..
```

### Create backend environment

```powershell
mkdir backend
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install fastapi "uvicorn[standard]" pandas numpy scikit-learn sqlalchemy "psycopg[binary]" pydantic-settings python-dotenv python-multipart pypdf pytest httpx alembic
python -m pip freeze > requirements.txt
mkdir app
mkdir app\api
mkdir app\core
mkdir app\db
mkdir app\ingestion
mkdir app\agronomy
mkdir app\economics
mkdir app\forecasting
mkdir app\rag
mkdir app\speech
mkdir tests
cd ..
```

If PowerShell blocks activation, use this only for the current terminal session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Create PostgreSQL database in psql/pgAdmin:

```sql
CREATE DATABASE agripulse;
```

Create `backend/.env` with placeholders replaced locally:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_URL_ENCODED_PASSWORD@localhost:5432/agripulse
CORS_ORIGINS=http://localhost:5173
LLM_API_KEY=
LLM_MODEL=
LLM_PROVIDER=
IMD_API_KEY=
TTS_PROVIDER=google
GOOGLE_APPLICATION_CREDENTIALS=
```

Create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Keep `.env` and `.env.local` out of Git. Never put provider credentials into `VITE_` variables because these are exposed to the browser bundle.

### Run locally after Day 1 skeleton exists

Backend terminal:

```powershell
cd agripulse-ai\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Docs: http://localhost:8000/docs

Frontend terminal:

```powershell
cd agripulse-ai\frontend
npm run dev
```

Frontend: http://localhost:5173

---

## Part 6 — Suggested repository structure

```text
agripulse-ai/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── services/
│       ├── hooks/
│       └── types/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── schemas/
│   │   ├── ingestion/
│   │   ├── agronomy/
│   │   ├── economics/
│   │   ├── forecasting/
│   │   ├── rag/
│   │   ├── speech/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env
├── data/
│   ├── raw/
│   ├── processed/
│   └── evaluation/
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── data-sources.md
│   ├── crop-rules.md
│   ├── ML_EVALUATION.md
│   ├── QUALITY_REPORT.md
│   └── API.md
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Part 7 — Ten-day progress tracker

- [ ] Day 1: Foundation and data/source plan
- [ ] Day 2: Data ingestion and EDA
- [ ] Day 3: Farmer profile and crop suitability rules
- [ ] Day 4: Economics scenarios and forecast baseline evaluation
- [ ] Day 5: Weather/market freshness and recommendation ranking
- [ ] Day 6: Responsive frontend integration
- [ ] Day 7: RAG assistant and citations
- [ ] Day 8: Kannada TTS and end-to-end MVP freeze
- [ ] Day 9: QA, usability and risk audit
- [ ] Day 10: Deployment, documentation, demo and roadmap

## Part 8 — Five system-level interview questions

1. **Why use rule-based filtering before ML ranking?**  
   Agronomic feasibility is safety-critical and may not have labelled farm-level training data; source-backed rules are transparent and testable. ML is added where suitable data and evaluation exist.

2. **How do you avoid false crop-profit recommendations?**  
   Check hard suitability constraints first; expose cost/year assumptions; use consistent units; show low/base/high scenarios and uncertainty; never promise profit.

3. **How can the system forecast prices without claiming certainty?**  
   Use historical market time series, a chronological split, a baseline comparison, MAE/RMSE and an explicit forecast horizon. Disable unsupported forecasts.

4. **Why combine RAG with backend tools?**  
   RAG supplies cited agricultural guidance; backend tools supply current database results and deterministic calculations. The LLM explains evidence rather than inventing numeric facts.

5. **How does Kannada voice work?**  
   Generate a grounded Kannada text response first, then synthesize that exact response through a server-side `kn-IN` TTS provider. Keep citations visible, trigger playback by user action and expose no credentials to the browser.

## Final rule

Do not move on just because the coding assistant says “done.” Move on when you can run the feature, inspect the code, verify tests, describe the key decisions and identify its limitations. A small, evidence-backed application is a stronger portfolio project than a large demo filled with unsupported predictions.
