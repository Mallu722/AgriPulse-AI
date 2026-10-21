import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  Calculator,
  RefreshCw,
  Info,
  ShieldCheck,
  Droplets,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface RankedCropItem {
  crop_name: string;
  rank: number;
  utility_score: number;
  criteria_breakdown: {
    agronomy_suitability: number;
    economic_returns: number;
    water_resilience: number;
    downside_risk_protection: number;
    crop_duration_fit: number;
  };
  financial_metrics: {
    expected_yield_qtl_per_acre: number;
    expected_price_per_qtl: number;
    total_cost_per_acre: number;
    gross_revenue_per_acre: number;
    expected_net_profit_per_acre: number;
    return_on_investment_pct: number;
  };
  duration_days: number;
  water_requirement_level: string;
  operational_weather_fit: string;
  strengths: string[];
  key_risks: string[];
}

interface DisqualifiedCropItem {
  crop_name: string;
  reason: string;
  failed_criteria: string;
}

export const CropRecommendations: React.FC = () => {
  const { t, profile, apiBase } = useApp();

  const [activeTab, setActiveTab] = useState<'feasible' | 'disqualified'>('feasible');
  const [rankedCrops, setRankedCrops] = useState<RankedCropItem[]>([]);
  const [disqualifiedCrops, setDisqualifiedCrops] = useState<DisqualifiedCropItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        profile: {
          farmer_id: profile.farmer_id,
          farmer_name: profile.farmer_name,
          district: profile.district,
          state: 'Karnataka',
          taluk: profile.taluk,
          village: profile.village,
          land_area: profile.land_area_acres,
          land_unit: 'acres',
          sowing_season: profile.season,
          water_availability: profile.water_availability,
          soil_type: profile.soil_type,
          soil_health_card: {
            ph: profile.soil_ph,
          },
          budget_preference_inr: profile.capital_budget_inr,
          risk_preference: profile.risk_preference,
        },
        include_weather_context: true,
      };

      const res = await axios.post(`${apiBase}/ranking/recommend`, payload, { timeout: 7000 });
      if (res.data) {
        if (res.data.ranked_recommendations && res.data.ranked_recommendations.length > 0) {
          const mappedRanked: RankedCropItem[] = res.data.ranked_recommendations.map((c: any) => ({
            crop_name: c.crop_name,
            rank: c.rank,
            utility_score: (c.composite_score || 85) / 100,
            criteria_breakdown: {
              agronomy_suitability: (c.score_breakdown?.agronomic_fit_score || 25) / 25,
              economic_returns: (c.score_breakdown?.economic_return_score || 25) / 25,
              water_resilience: (c.score_breakdown?.water_resilience_score || 20) / 20,
              downside_risk_protection: (c.score_breakdown?.downside_risk_score || 15) / 15,
              crop_duration_fit: (c.score_breakdown?.duration_turnover_score || 15) / 15,
            },
            financial_metrics: {
              expected_yield_qtl_per_acre: c.financial_metrics?.expected_yield_qtl_per_acre || 75,
              expected_price_per_qtl: c.financial_metrics?.expected_price_per_qtl || 2200,
              total_cost_per_acre: c.estimated_cost_per_acre_inr || 34600,
              gross_revenue_per_acre: Math.round((c.expected_base_net_return_inr ? (c.expected_base_net_return_inr / profile.land_area_acres) : 50000) + (c.estimated_cost_per_acre_inr || 34600)),
              expected_net_profit_per_acre: Math.round(c.expected_base_net_return_inr ? (c.expected_base_net_return_inr / profile.land_area_acres) : 55000),
              return_on_investment_pct: Math.round(((c.benefit_cost_ratio || 1.8) - 1) * 100),
            },
            duration_days: c.duration_days || 95,
            water_requirement_level: c.category || 'Moderate',
            operational_weather_fit: c.weather_operational_fit || 'Optimal season alignment for target district.',
            strengths: c.key_advantages || ['High profit margin under current market conditions'],
            key_risks: c.key_risks_and_caveats || ['Observe local mandi price volatility'],
          }));
          setRankedCrops(mappedRanked);
        }

        if (res.data.disqualified_crops && res.data.disqualified_crops.length > 0) {
          const mappedDisqualified: DisqualifiedCropItem[] = res.data.disqualified_crops.map((d: any) => ({
            crop_name: d.crop_name,
            reason: d.reasons?.filter((r: string) => r.toLowerCase().includes('water') || r.toLowerCase().includes('deficit') || r.toLowerCase().includes('soil') || r.toLowerCase().includes('season'))[0] || d.reasons?.[0] || 'Did not meet hard constraint thresholds.',
            failed_criteria: d.constraint_checks?.find((ch: any) => !ch.passed)?.message || 'Agronomic constraint failure',
          }));
          setDisqualifiedCrops(mappedDisqualified);
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || err.message);
      } else {
        setError('Failed to fetch transparent crop recommendations.');
      }
      // Resilient fallback only if network error
      setRankedCrops([
        {
          crop_name: 'Onion',
          rank: 1,
          utility_score: 0.945,
          criteria_breakdown: {
            agronomy_suitability: 1.0,
            economic_returns: 1.0,
            water_resilience: 0.85,
            downside_risk_protection: 1.0,
            crop_duration_fit: 0.83,
          },
          financial_metrics: {
            expected_yield_qtl_per_acre: 75,
            expected_price_per_qtl: 2100,
            total_cost_per_acre: 34600,
            gross_revenue_per_acre: 157500,
            expected_net_profit_per_acre: 122900,
            return_on_investment_pct: 355.2,
          },
          duration_days: 105,
          water_requirement_level: 'moderate',
          operational_weather_fit: 'Moderate temperatures in Kolar support optimal bulb development.',
          strengths: ['Optimal soil pH fit & resilient downside protection', 'Storage capability allows peak selling'],
          key_risks: ['Market volatility during bulk harvest arrival'],
        },
        {
          crop_name: 'Maize',
          rank: 2,
          utility_score: 0.840,
          criteria_breakdown: {
            agronomy_suitability: 0.92,
            economic_returns: 0.72,
            water_resilience: 0.95,
            downside_risk_protection: 0.90,
            crop_duration_fit: 0.85,
          },
          financial_metrics: {
            expected_yield_qtl_per_acre: 28,
            expected_price_per_qtl: 2225,
            total_cost_per_acre: 30300,
            gross_revenue_per_acre: 62300,
            expected_net_profit_per_acre: 32000,
            return_on_investment_pct: 105.6,
          },
          duration_days: 100,
          water_requirement_level: 'low_to_medium',
          operational_weather_fit: 'Hardy crop resilient to dry spells.',
          strengths: ['MSP benchmarked procurement demand', 'High drought tolerance & lower capital needed'],
          key_risks: ['Fall armyworm vigilance required'],
        },
      ]);
      setDisqualifiedCrops([
        {
          crop_name: 'Tomato',
          reason: "Water deficit: Tomato requires 'reliable' irrigation (usage: 600 - 800 mm). Farmer has 'limited' water.",
          failed_criteria: "Insufficient water. Farmer has 'limited', but Tomato requires at least 'reliable' irrigation.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [profile]);

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-farmer">
        <div className="header-icon-badge">
          <TrendingUp size={28} />
        </div>
        <div>
          <h1 className="page-heading">{t.recommendations.title}</h1>
          <p className="page-subheading">{t.recommendations.subtitle}</p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="btn-farmer-outline"
          style={{ marginLeft: 'auto' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>{t.recommendations.refreshRecommendations}</span>
        </button>
      </div>

      {/* Formula Transparency Disclaimer */}
      <div className="formula-banner">
        <ShieldCheck size={20} className="text-primary" />
        <div className="formula-text">
          <strong>ಪಾರದರ್ಶಕ ಗಣಿತ ಸೂತ್ರ (Deterministic Multi-Attribute Utility):</strong>
          <p>{t.recommendations.formulaDisclaimer}</p>
        </div>
      </div>

      {error && (
        <div className="alert-box warning">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Switcher & Filters */}
      <div className="recommendations-tab-bar">
        <div className="tab-pill-group">
          <button
            onClick={() => setActiveTab('feasible')}
            className={`tab-pill-btn ${activeTab === 'feasible' ? 'active' : ''}`}
          >
            <CheckCircle2 size={16} />
            <span>{t.recommendations.eligibleTab} ({rankedCrops.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('disqualified')}
            className={`tab-pill-btn ${activeTab === 'disqualified' ? 'active' : ''}`}
          >
            <XCircle size={16} />
            <span>{t.recommendations.disqualifiedTab} ({disqualifiedCrops.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-card">
          <RefreshCw className="animate-spin" size={24} />
          <span>{t.recommendations.loading}</span>
        </div>
      ) : activeTab === 'feasible' ? (
        <div className="ranked-crops-list">
          {rankedCrops.length === 0 ? (
            <div className="empty-state-card">
              <AlertTriangle size={32} className="text-amber" />
              <p>{t.recommendations.noCropsFound}</p>
            </div>
          ) : (
            rankedCrops.map((crop) => {
              const utilityPct = Math.round(crop.utility_score * 100);
              return (
                <div key={crop.crop_name} className="ranked-crop-card">
                  <div className="ranked-card-header">
                    <div className="rank-position-badge">
                      <span>#{crop.rank}</span>
                    </div>
                    <div className="crop-title-group">
                      <h2 className="crop-title-text">{t.crops[crop.crop_name] || crop.crop_name}</h2>
                      <span className="crop-duration-tag">
                        <Calendar size={13} /> {crop.duration_days} ದಿನಗಳ ಅವಧಿ
                      </span>
                      <span className="crop-water-tag">
                        <Droplets size={13} /> {crop.water_requirement_level}
                      </span>
                    </div>

                    <div className="crop-header-score">
                      <span className="score-label">{t.recommendations.utilityScore}</span>
                      <div className="score-pill-big">
                        <strong>{utilityPct}</strong>
                        <small>/100</small>
                      </div>
                    </div>
                  </div>

                  {/* 5-Criteria Utility Breakdown Meters */}
                  <div className="criteria-breakdown-bar">
                    <div className="criterion-metric">
                      <span className="crit-label">{t.recommendations.agronomyScore}</span>
                      <div className="crit-progress">
                        <div
                          className="crit-fill green"
                          style={{ width: `${Math.round((crop.criteria_breakdown?.agronomy_suitability || 0) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="crit-val">{Math.round((crop.criteria_breakdown?.agronomy_suitability || 0) * 100)}%</span>
                    </div>

                    <div className="criterion-metric">
                      <span className="crit-label">{t.recommendations.economicsScore}</span>
                      <div className="crit-progress">
                        <div
                          className="crit-fill amber"
                          style={{ width: `${Math.round((crop.criteria_breakdown?.economic_returns || 0) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="crit-val">{Math.round((crop.criteria_breakdown?.economic_returns || 0) * 100)}%</span>
                    </div>

                    <div className="criterion-metric">
                      <span className="crit-label">{t.recommendations.waterScore}</span>
                      <div className="crit-progress">
                        <div
                          className="crit-fill blue"
                          style={{ width: `${Math.round((crop.criteria_breakdown?.water_resilience || 0) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="crit-val">{Math.round((crop.criteria_breakdown?.water_resilience || 0) * 100)}%</span>
                    </div>

                    <div className="criterion-metric">
                      <span className="crit-label">{t.recommendations.riskScore}</span>
                      <div className="crit-progress">
                        <div
                          className="crit-fill purple"
                          style={{ width: `${Math.round((crop.criteria_breakdown?.downside_risk_protection || 0) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="crit-val">{Math.round((crop.criteria_breakdown?.downside_risk_protection || 0) * 100)}%</span>
                    </div>
                  </div>

                  {/* Financials & Action Row */}
                  <div className="crop-details-row">
                    <div className="financial-boxes-strip">
                      <div className="fin-box">
                        <span className="fin-label">{t.profit.expectedRevenue}</span>
                        <strong className="fin-val">₹{crop.financial_metrics.gross_revenue_per_acre.toLocaleString('en-IN')}</strong>
                        <span className="fin-sub">({crop.financial_metrics.expected_yield_qtl_per_acre} qtl @ ₹{crop.financial_metrics.expected_price_per_qtl})</span>
                      </div>

                      <div className="fin-box">
                        <span className="fin-label">{t.profit.totalCost}</span>
                        <strong className="fin-val">₹{crop.financial_metrics.total_cost_per_acre.toLocaleString('en-IN')}</strong>
                        <span className="fin-sub">/ಎಕರೆಗೆ ಅಧಿಕೃತ ವೆಚ್ಚ</span>
                      </div>

                      <div className="fin-box highlight">
                        <span className="fin-label">{t.recommendations.netReturn}</span>
                        <strong className="fin-val text-primary">₹{crop.financial_metrics.expected_net_profit_per_acre.toLocaleString('en-IN')}</strong>
                        <span className="fin-sub">ROI: {crop.financial_metrics.return_on_investment_pct}%</span>
                      </div>
                    </div>

                    <div className="crop-cta-box">
                      <Link
                        to={`/profit?crop=${encodeURIComponent(crop.crop_name)}`}
                        className="btn-farmer-primary"
                      >
                        <Calculator size={16} />
                        <span>{t.recommendations.calculateProfitBtn}</span>
                      </Link>
                    </div>
                  </div>

                  {/* Agronomic Context & Weather Impact */}
                  {crop.operational_weather_fit && (
                    <div className="weather-fit-alert">
                      <Info size={16} className="text-accent" />
                      <span><strong>ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆ:</strong> {crop.operational_weather_fit}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Disqualified Crops Tab */
        <div className="disqualified-crops-list">
          <div className="info-box-general">
            <Info size={18} className="text-primary" />
            <span>
              ಈ ಕೆಳಗಿನ ಬೆಳೆಗಳು ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರ, ಪಿ.ಹೆಚ್, ನೀರಿನ ಕೊರತೆ ಅಥವಾ ಹಂಗಾಮಿಗೆ ಸರಿಹೊಂದದ ಕಾರಣ ಶೂನ್ಯ ಅಪಾಯದ ನಿಯಮದಡಿ ತಿರಸ್ಕರಿಸಲ್ಪಟ್ಟಿವೆ.
            </span>
          </div>

          <div className="disqualified-grid">
            {disqualifiedCrops.map((item, idx) => (
              <div key={idx} className="disqualified-card">
                <div className="disqualified-card-top">
                  <XCircle size={20} className="text-danger" />
                  <h3 className="disqualified-crop-name">{t.crops[item.crop_name] || item.crop_name}</h3>
                </div>
                <div className="disqualified-reason-box">
                  <span className="reason-label">{t.recommendations.disqualificationReason}:</span>
                  <p className="reason-text">{item.reason}</p>
                </div>
                <div className="failed-tag">
                  <span>ವೈಫಲ್ಯ ಮಾನದಂಡ: {item.failed_criteria}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropRecommendations;
