# AgriPulse AI — Machine Learning & Economic Model Evaluation Specification

**Document Version**: `v1.0.0-Day4-Economics`  
**Scope**: Unit Consistency, Chronological Backtesting, Naive Baselines, Cost Attribution, and Uncertainty Scenarios.

---

## 1. Mathematical Unit Consistency

In Indian agriculture, calculation errors frequently arise from conflating **hectares with acres**, **kilograms with quintals**, and **tonnes with quintals**.  
AgriPulse AI enforces the following unit hierarchy across all models:

| Metric | System Unit | Mathematical Definition |
| :--- | :--- | :--- |
| **Land Area ($A$)** | Standard Acres | Normalized from Hectares ($1 \text{ Ha} = 2.47105 \text{ Acres}$) or Guntas ($40 \text{ Guntas} = 1 \text{ Acre}$). |
| **Crop Yield ($Y$)** | Quintals / Acre | Derived from 5-year DESAgri district APY statistics ($1 \text{ Quintal} = 100 \text{ kg} = 0.1 \text{ Tonne}$). |
| **Total Produce ($Q$)** | Total Quintals | $$Q = Y \times A$$ |
| **Wholesale Modal Price ($P$)** | INR / Quintal (₹/Qtl) | Audited APMC spot quotes or chronological quantile projections. |
| **Gross Revenue ($R_{\text{gross}}$)** | INR (₹) | $$R_{\text{gross}} = Q \times P = (Y \times A) \times P$$ |
| **Cultivation Costs ($C_{\text{prod}}$)** | INR (₹) | $$C_{\text{prod}} = \text{Total Production Cost per Acre} \times A$$ |
| **Transport / Freight ($C_{\text{trans}}$)** | INR (₹) | $$C_{\text{trans}} = Q \times \text{Transport Cost per Quintal}$$ |
| **Total Expenditure ($C_{\text{total}}$)** | INR (₹) | $$C_{\text{total}} = C_{\text{prod}} + C_{\text{trans}}$$ |
| **Estimated Net Return ($\Pi$)** | INR (₹) | $$\Pi = R_{\text{gross}} - C_{\text{total}}$$ |
| **Benefit-Cost Ratio (BCR)** | Dimensionless Ratio | $$\text{BCR} = \frac{R_{\text{gross}}}{C_{\text{total}}}$$ |
| **Break-Even Price ($P_{\text{be}}$)** | INR / Quintal (₹/Qtl) | $$P_{\text{be}} = \frac{C_{\text{total}}}{Q}$$ |
| **Break-Even Yield ($Y_{\text{be}}$)** | Quintals / Acre | $$Y_{\text{be}} = \frac{C_{\text{total}}}{P \times A}$$ |

---

## 2. Cost Category Attribution & Official Baselines

Official cost baselines are compiled from **DESAgri Comprehensive Scheme for Cost of Cultivation (CSCPC)** and **UAS Bengaluru / UAS Dharwad Package of Practices**:

1. **Seeds / Saplings**: Hybrid seeds / certified nursery trays.
2. **Fertilizers & Nutrients**: Farmyard Manure (FYM), Urea, DAP, MOP, secondary and micronutrients (Zinc, Boron).
3. **Labour**: Human & animal labour (sowing, thinning, weeding, training/staking, irrigation tending).
4. **Plant Protection**: Integrated Pest Management (IPM), pheromone traps, biopesticides, chemical sprays.
5. **Irrigation & Energy**: Diesel pump fuel, electric borewell charges, drip maintenance.
6. **Machinery & Tillage**: Custom hire charges for tractors, rotavator, bed-makers, and implements.
7. **Harvesting & Post-Harvest**: Plucking, de-husking, curing, sorting, plastic crate rental.
8. **Transport to APMC**: Freight per quintal to nearest district market yard.
9. **Market Charges**: Loading/unloading charges, weighing cess, APMC documentation fees.

> **Data Integrity Principle**: Official cost baseline tables remain **immutable**. When a farmer adjusts seed or labour costs via the UI, these are applied strictly as user overrides in the active calculation payload, without altering the underlying government reference database.

---

## 3. Chronological Time-Series Validation Framework

Standard machine learning practitioners frequently commit **data leakage** by randomly shuffling time-series data using `train_test_split(shuffle=True)`.  
In commodity price forecasting, predicting the past from future prices produces artificially high $R^2$ scores that fail in production.

### 3.1 Validation Policy
1. **Zero Shuffling**: Splits are strictly chronological ($T_{\text{train}} < T_{\text{test}}$).
2. **Out-of-Time Test Horizon**: The most recent 5 to 10 trading sessions are reserved exclusively for evaluation.
3. **Primary Benchmark**: **Seasonal / Last-Observed Naive Baseline (LOCF)**:
   $$\hat{y}_{t} = y_{t-1} \quad \text{or} \quad \hat{y}_{t} = y_{T_{\text{last\_train}}}$$
4. **Performance Metrics (Expressed in Native ₹/Quintal)**:
   - **Mean Absolute Error (MAE)**:
     $$\text{MAE} = \frac{1}{n} \sum_{i=1}^n |y_i - \hat{y}_i|$$
   - **Root Mean Squared Error (RMSE)**:
     $$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^n (y_i - \hat{y}_i)^2}$$
5. **Enforcement Rule**:
   - If the trained model (e.g. 3-day Rolling Window Trend Ensemble) **does not achieve a lower MAE and RMSE than the naive baseline**, or if total observations are $< 10$, **the predictive claim is explicitly disabled**.
   - The user is shown transparent historical quantiles rather than an unverified ML forecast.

---

## 4. Quantile-Based Economic Scenarios (No Invented Percentages)

Rather than assuming arbitrary flat multipliers (e.g., "$\pm 20\%$ for everything"), scenarios are grounded in empirical distributions:

- **Conservative Scenario (P25)**:
  - Yield: 25th percentile of 5-year district APY history.
  - Price: 25th percentile of APMC modal prices.
  - Purpose: Stress-test downside resilience during climatic or market gluts.
- **Base Scenario (Median / P50)**:
  - Yield: 5-year median district yield.
  - Price: Median modal price observed in target mandi.
  - Purpose: Expected operational case under recommended agronomic management.
- **Optimistic Scenario (P75)**:
  - Yield: 75th percentile of district yield under precision irrigation.
  - Price: 75th percentile of mandi prices during peak seasonal demand.
  - Purpose: Maximum upside potential under optimal market timing.
