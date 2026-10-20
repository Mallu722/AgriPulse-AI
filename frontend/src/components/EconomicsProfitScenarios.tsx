import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sliders
} from 'lucide-react';

interface CostBreakdown {
  seeds: number;
  fertilizer: number;
  labour: number;
  plant_protection: number;
  irrigation_power: number;
  machinery_fuel: number;
  harvesting: number;
  transport_per_quintal: number;
  market_charges: number;
  miscellaneous: number;
}

interface ScenarioDetail {
  scenario_name: string;
  probability_or_quantile: string;
  expected_yield_quintals_per_acre: number;
  cultivated_area_acres: number;
  total_output_quintals: number;
  market_price_inr_per_quintal: number;
  gross_revenue_inr: number;
  total_cultivation_cost_inr: number;
  total_transport_cost_inr: number;
  total_cost_inr: number;
  net_return_inr: number;
  net_return_per_acre_inr: number;
  benefit_cost_ratio: number;
  break_even_price_inr_per_quintal: number;
  break_even_yield_quintals_per_acre: number;
  assumptions_narrative: string;
}

interface ForecastEvaluation {
  baseline_model_name: string;
  evaluated_model_name: string;
  validation_strategy: string;
  sample_size_observations: number;
  test_horizon_days: number;
  train_date_range: string;
  test_date_range: string;
  baseline_mae_inr: number;
  baseline_rmse_inr: number;
  model_mae_inr: number;
  model_rmse_inr: number;
  is_model_better_than_baseline: boolean;
  status_advisory: string;
}

interface EconomicsResponse {
  crop_code: string;
  crop_name: string;
  district: string;
  land_area_acres: number;
  official_cost_source_year: number;
  official_cost_source_citation: string;
  active_cost_breakdown: CostBreakdown;
  has_farmer_cost_overrides: boolean;
  conservative_scenario: ScenarioDetail;
  base_scenario: ScenarioDetail;
  optimistic_scenario: ScenarioDetail;
  forecast_evaluation: ForecastEvaluation;
  unit_consistency_audit: string;
}

interface Props {
  apiBase: string;
}

export const EconomicsProfitScenarios: React.FC<Props> = ({ apiBase }) => {
  const [cropCode, setCropCode] = useState('TOMATO');
  const [district, setDistrict] = useState('Kolar');
  const [landArea, setLandArea] = useState('2.5');

  // Overrides Accordion
  const [showOverrides, setShowOverrides] = useState(false);
  const [seedOverride, setSeedOverride] = useState('');
  const [fertOverride, setFertOverride] = useState('');
  const [labourOverride, setLabourOverride] = useState('');
  const [districtBenchmarks, setDistrictBenchmarks] = useState<Record<string, any>>({});

  // Results State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EconomicsResponse | null>(null);

  useEffect(() => {
    axios
      .get(`${apiBase}/economics/district-benchmarks`)
      .then((res) => {
        if (res.data?.districts) {
          setDistrictBenchmarks(res.data.districts);
        }
      })
      .catch(() => {});
  }, [apiBase]);

  const fetchScenarios = async () => {
    setLoading(true);
    setError(null);

    const payload: any = {
      crop_code: cropCode,
      district,
      land_area_acres: parseFloat(landArea) || 1.0,
    };

    const overrides: any = {};
    if (seedOverride) overrides.seeds = parseFloat(seedOverride);
    if (fertOverride) overrides.fertilizer = parseFloat(fertOverride);
    if (labourOverride) overrides.labour = parseFloat(labourOverride);

    if (Object.keys(overrides).length > 0) {
      payload.cost_overrides = overrides;
    }

    try {
      const res = await axios.post<EconomicsResponse>(`${apiBase}/economics/scenarios`, payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to calculate economics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [cropCode, district]);

  const renderScenarioCard = (scen: ScenarioDetail, badgeColor: string, borderColor: string) => {
    const isProfit = scen.net_return_inr >= 0;
    return (
      <div
        className="component-card"
        style={{
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '0.8rem',
          border: `1px solid ${borderColor}`,
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{scen.scenario_name}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Statistical Basis: <strong>{scen.probability_or_quantile}</strong>
            </span>
          </div>
          <span
            className="component-badge"
            style={{
              borderColor,
              color: badgeColor,
              background: 'rgba(0,0,0,0.3)',
              fontSize: '0.75rem',
            }}
          >
            BCR: {scen.benefit_cost_ratio}x
          </span>
        </div>

        {/* Big Profit Number */}
        <div
          style={{
            padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: isProfit ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${isProfit ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
            Estimated Net Return ({scen.cultivated_area_acres} Acres):
          </span>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: isProfit ? '#10b981' : '#f87171',
            }}
          >
            ₹{scen.net_return_inr.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ₹{scen.net_return_per_acre_inr.toLocaleString('en-IN')} / acre
          </span>
        </div>

        {/* Quantile Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Expected Yield</span>
            <strong style={{ color: '#fff' }}>{scen.expected_yield_quintals_per_acre} Qtl/Acre</strong>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total: {scen.total_output_quintals} Qtl</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Realization Price</span>
            <strong style={{ color: '#fff' }}>₹{scen.market_price_inr_per_quintal.toLocaleString('en-IN')} / Qtl</strong>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>APMC Spot/Quantile</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Gross Revenue</span>
            <strong style={{ color: 'var(--primary)' }}>₹{scen.gross_revenue_inr.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Total Cost (Prod+Freight)</span>
            <strong style={{ color: '#fca5a5' }}>₹{scen.total_cost_inr.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Break-Even Safety Margins */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span>Break-Even Price: <strong style={{ color: '#fff' }}>₹{scen.break_even_price_inr_per_quintal}/Qtl</strong></span>
          <span>Break-Even Yield: <strong style={{ color: '#fff' }}>{scen.break_even_yield_quintals_per_acre} Qtl/Acre</strong></span>
        </div>

        <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          "{scen.assumptions_narrative}"
        </p>
      </div>
    );
  };

  return (
    <div>
      {/* Parameter Controls Header */}
      <div
        className="component-card"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Crop</label>
            <select
              value={cropCode}
              onChange={(e) => setCropCode(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input, #1e293b)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            >
              <option value="TOMATO">Tomato (Kolar / Bengaluru)</option>
              <option value="MAIZE">Maize (Davanagere / Haveri)</option>
              <option value="ONION">Onion (Belagavi / Chitradurga)</option>
              <option value="RAGI">Finger Millet / Ragi (Dryland Mandya/Kolar)</option>
              <option value="TUR">Pigeon Pea / Tur (Kalaburagi)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input, #1e293b)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            >
              {[
                "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
                "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
                "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
                "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal",
                "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
                "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura", "Yadgir"
              ].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Land Area (Acres)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={landArea}
              onChange={(e) => setLandArea(e.target.value)}
              style={{
                width: '100px',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input, rgba(0,0,0,0.2))',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => setShowOverrides(!showOverrides)}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Sliders size={14} /> Cost Overrides {showOverrides ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            type="button"
            onClick={fetchScenarios}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          >
            {loading ? 'Calculating...' : 'Recalculate Scenarios'}
          </button>
        </div>
      </div>

      {/* Cost Overrides Drawer */}
      {showOverrides && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            marginBottom: '1.2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <Sliders size={16} color="var(--primary)" />
            <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Farmer Operational Cost Overrides (₹/Acre)</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Official government baseline records remain permanently immutable)
            </span>
          </div>

          {/* District Benchmark Intelligence Badge from Verified CSV */}
          <div
            style={{
              padding: '0.7rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              marginBottom: '0.8rem',
              fontSize: '0.78rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.6rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <strong style={{ color: '#60a5fa' }}>📍 Official Wage Survey Benchmark ({district}):</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Source: State Labour Commissioner CSV</span>
              </div>
              <div style={{ color: '#fff', fontSize: '0.75rem', lineHeight: '1.4' }}>
                <span>General Fieldwork: <strong>₹{districtBenchmarks[district]?.labour_general_male || 521.65}</strong> (Male) / <strong>₹{districtBenchmarks[district]?.labour_general_female || 400.88}</strong> (Female)</span> •{' '}
                <span>Plough/Tilling: <strong>₹{districtBenchmarks[district]?.labour_plough_tilling || 624.21}</strong>/day</span> •{' '}
                <span>Harvesting: <strong>₹{districtBenchmarks[district]?.labour_harvesting_male || 552.98}</strong>/day</span> •{' '}
                <span>Govt CHC Tractor: <strong>₹{districtBenchmarks[district]?.tractor_chc || 650}</strong>/hr</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const bench = districtBenchmarks[district];
                if (bench) {
                  // Official labour reference per acre from verified CSV
                  const labourRef = bench.tomato_labour_ref_per_acre || (bench.labour_general * 22);
                  setLabourOverride(labourRef.toString());
                }
              }}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              Auto-Apply Verified District Labour
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Seeds / Seedlings (₹/Acre)</label>
              <input
                type="number"
                placeholder={result?.active_cost_breakdown.seeds.toString() || 'Seeds'}
                value={seedOverride}
                onChange={(e) => setSeedOverride(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.8rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fertilizer & Manure (₹/Acre)</label>
              <input
                type="number"
                placeholder={result?.active_cost_breakdown.fertilizer.toString() || 'Fertilizer'}
                value={fertOverride}
                onChange={(e) => setFertOverride(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.8rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Operational Labour (₹/Acre)</label>
              <input
                type="number"
                placeholder={result?.active_cost_breakdown.labour.toString() || 'Labour'}
                value={labourOverride}
                onChange={(e) => setLabourOverride(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#0f172a',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Official Source Banner */}
          <div
            style={{
              padding: '0.7rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(59, 130, 246, 0.06)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.8rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>
                Official Government Baseline ({result.official_cost_source_year})
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {result.official_cost_source_citation}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Production Cost Basis:</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                ₹{(result.active_cost_breakdown.seeds + result.active_cost_breakdown.fertilizer + result.active_cost_breakdown.labour + result.active_cost_breakdown.plant_protection + result.active_cost_breakdown.irrigation_power + result.active_cost_breakdown.machinery_fuel + result.active_cost_breakdown.harvesting).toLocaleString('en-IN')} / Acre
              </div>
            </div>
          </div>

          {/* 3 Scenarios Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {renderScenarioCard(result.conservative_scenario, '#fca5a5', 'rgba(239, 68, 68, 0.3)')}
            {renderScenarioCard(result.base_scenario, '#60a5fa', 'rgba(59, 130, 246, 0.4)')}
            {renderScenarioCard(result.optimistic_scenario, '#86efac', 'rgba(16, 185, 129, 0.4)')}
          </div>

          {/* Chronological Forecast Backtesting Banner */}
          <div
            className="component-card"
            style={{
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '0.6rem',
              background: 'rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="var(--primary)" /> Chronological Model Evaluation vs. Naive Baseline
              </h4>
              <span
                className="component-badge"
                style={{
                  fontSize: '0.72rem',
                  borderColor: result.forecast_evaluation.is_model_better_than_baseline
                    ? 'rgba(16, 185, 129, 0.4)'
                    : 'rgba(234, 179, 8, 0.4)',
                  color: result.forecast_evaluation.is_model_better_than_baseline ? '#86efac' : '#fde047',
                }}
              >
                {result.forecast_evaluation.is_model_better_than_baseline ? 'Model Wins Baseline' : 'Naive Baseline Trusted'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Validation Strategy</span>
                <span style={{ color: '#fff' }}>{result.forecast_evaluation.validation_strategy}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Historical Sample Size</span>
                <span style={{ color: '#fff' }}>{result.forecast_evaluation.sample_size_observations} quotes ({result.forecast_evaluation.test_horizon_days}-day out-of-time test)</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Baseline Error (MAE)</span>
                <span style={{ color: '#fff' }}>₹{result.forecast_evaluation.baseline_mae_inr} / Qtl</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Evaluated Model Error (MAE)</span>
                <span style={{ color: '#fff' }}>₹{result.forecast_evaluation.model_mae_inr} / Qtl</span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem' }}>
              <strong>Audit Advisory:</strong> {result.forecast_evaluation.status_advisory}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
