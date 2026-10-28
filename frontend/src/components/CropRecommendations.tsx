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

  // Dynamic deterministic local crop evaluation engine based on farmer's active profile
  const computeLocalRecommendations = () => {
    const area = profile.land_area_acres || 1;
    const water = profile.water_availability || 'limited';
    const season = profile.season || 'kharif';
    const ph = profile.soil_ph || 6.5;
    const soil = profile.soil_type || 'red_sandy_loam';

    // Comprehensive agronomic catalogue & economics
    const candidates = [
      {
        crop_name: 'Onion',
        seasons: ['kharif', 'rabi', 'all_season'],
        min_water: 'limited',
        water_rank: 2,
        soils: ['red_sandy_loam', 'black_cotton', 'alluvial'],
        ph_min: 5.8,
        ph_max: 7.5,
        yield_per_acre: 75,
        price_per_qtl: 2100,
        cost_per_acre: 34600,
        duration: 105,
        water_level: 'ಮಧ್ಯಮ (Limited)',
        strengths: ['ಉತ್ತಮ ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ ಮತ್ತು ಶೇಖರಣಾ ಸಾಮರ್ಥ್ಯ', 'ಕೆಂಪು ಮರಳು ಮಣ್ಣಿನಲ್ಲಿ ಗಡ್ಡೆಗಳ ಉತ್ತಮ ಬೆಳವಣಿಗೆ'],
        risks: ['ಮಳೆಯ ಕೊರತೆ ಅಥವಾ ಅತಿಯಾದ ಮಳೆಯಿಂದ ಕೊಳೆ ರೋಗದ ಎಚ್ಚರಿಕೆ'],
      },
      {
        crop_name: 'French Beans',
        seasons: ['kharif', 'rabi', 'summer', 'all_season'],
        min_water: 'limited',
        water_rank: 2,
        soils: ['red_sandy_loam', 'clay_loam', 'alluvial'],
        ph_min: 5.5,
        ph_max: 6.8,
        yield_per_acre: 48,
        price_per_qtl: 3400,
        cost_per_acre: 28500,
        duration: 75,
        water_level: 'ಮಧ್ಯಮ (Limited)',
        strengths: ['70-80 ದಿನಗಳ ಕಡಿಮೆ ಅವಧಿ, ತ್ವರಿತ ನಗದು ಆದಾಯ', 'pH 5.9 ಆಮ್ಲೀಯ ಮಣ್ಣಿಗೆ ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ'],
        risks: ['ಕಟಾವಿನ ಸಮಯದಲ್ಲಿ ದಿನಬಳಕೆಯ ಮಾರುಕಟ್ಟೆ ಏರಿಳಿತ'],
      },
      {
        crop_name: 'Ragi',
        seasons: ['kharif', 'rabi', 'all_season'],
        min_water: 'rainfed',
        water_rank: 1,
        soils: ['red_sandy_loam', 'laterite', 'alluvial', 'clay_loam'],
        ph_min: 5.0,
        ph_max: 8.0,
        yield_per_acre: 11,
        price_per_qtl: 3950,
        cost_per_acre: 13400,
        duration: 115,
        water_level: 'ಕಡಿಮೆ / ಮಳೆಯಾಶ್ರಿತ (Rainfed/Low)',
        strengths: ['ಶೂನ್ಯ ನೀರಾವರಿ ಅಪಾಯ, ಕನಿಷ್ಠ ಬಂಡವಾಳ ಸಾಕು', 'ಸರ್ಕಾರಿ ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP) ಗ್ಯಾರಂಟಿ'],
        risks: ['ಬೆಂಕಿ ರೋಗದ (Blast) ನಿಯಂತ್ರಣಕ್ಕೆ ಬೀಜೋಪಚಾರ ಅಗತ್ಯ'],
      },
      {
        crop_name: 'Maize',
        seasons: ['kharif', 'rabi'],
        min_water: 'limited',
        water_rank: 2,
        soils: ['red_sandy_loam', 'black_cotton', 'alluvial', 'clay_loam'],
        ph_min: 5.8,
        ph_max: 7.5,
        yield_per_acre: 28,
        price_per_qtl: 2225,
        cost_per_acre: 30300,
        duration: 100,
        water_level: 'ಮಧ್ಯಮ (Limited)',
        strengths: ['ದೃಢ ಇಳುವರಿ ಮತ್ತು ಕೋಳಿ ಆಹಾರ/ಸ್ಟಾರ್ಚ್ ಉದ್ಯಮಗಳಿಂದ ಸತತ ಖರೀದಿ', 'ಬರ ಸಹಿಷ್ಣುತೆ ಮತ್ತು ಯಾಂತ್ರಿಕೃತ ಕಟಾವು ಸುಲಭ'],
        risks: ['ಸೈನಿಕ ಹುಳು (Fall Armyworm) ಬಾಧೆಯ ಮೇಲೆ ನಿಗಾವಹಿಸಬೇಕು'],
      },
      {
        crop_name: 'Groundnut',
        seasons: ['kharif', 'summer'],
        min_water: 'rainfed',
        water_rank: 1,
        soils: ['red_sandy_loam', 'sandy', 'alluvial'],
        ph_min: 5.5,
        ph_max: 7.2,
        yield_per_acre: 9,
        price_per_qtl: 6450,
        cost_per_acre: 24200,
        duration: 110,
        water_level: 'ಕಡಿಮೆ (Rainfed/Low)',
        strengths: ['ಕೆಂಪು ಮರಳು ಮಣ್ಣಿನಲ್ಲಿ ಕಾಯಿ ಕಟ್ಟುವುದು ಸುಲಭ', 'ಮಣ್ಣಿಗೆ ನೈಸರ್ಗಿಕ ಸಾರಜನಕ ಸ್ಥಿರೀಕರಣ'],
        risks: ['ಟಿಕ್ಕಾ ಎಲೆಚುಕ್ಕೆ ರೋಗ ಮತ್ತು ಕಾಯಿಕೊರೆಯುವ ಕೀಟ'],
      },
      {
        crop_name: 'Tomato',
        seasons: ['kharif', 'rabi', 'summer', 'all_season'],
        min_water: 'reliable',
        water_rank: 3,
        soils: ['red_sandy_loam', 'alluvial', 'clay_loam'],
        ph_min: 6.0,
        ph_max: 7.2,
        yield_per_acre: 98,
        price_per_qtl: 2450,
        cost_per_acre: 56700,
        duration: 110,
        water_level: 'ಸಾಕಷ್ಟು ನೀರು ಅಗತ್ಯ (Reliable Irrigation)',
        strengths: ['ಕೋಲಾರ ಮಂಡಿಯಲ್ಲಿ ದೈನಂದಿನ ಗರಿಷ್ಠ ನಗದು ಚಲಾವಣೆ', 'ಹನಿ ನೀರಾವರಿ ಜೊತೆಗೆ ಬಂಪರ್ ಇಳುವರಿ'],
        risks: ['ಹೆಚ್ಚು ಬಂಡವಾಳ ಮತ್ತು ನೀರಿನ ಕೊರತೆಯಲ್ಲಿ ಬೆಳೆ ನಷ್ಟ'],
      },
      {
        crop_name: 'Potato',
        seasons: ['kharif', 'rabi'],
        min_water: 'limited',
        water_rank: 2,
        soils: ['red_sandy_loam', 'alluvial', 'sandy'],
        ph_min: 5.2,
        ph_max: 6.8,
        yield_per_acre: 105,
        price_per_qtl: 1750,
        cost_per_acre: 52000,
        duration: 90,
        water_level: 'ಮಧ್ಯಮ (Limited)',
        strengths: ['pH 5.9 ಆಮ್ಲೀಯ ಮಣ್ಣಿಗೆ ಪರಿಪೂರ್ಣ ಹೊಂದಾಣಿಕೆ', '90 ದಿನಗಳ ತ್ವರಿತ ಕಟಾವು'],
        risks: ['ಅಂಗಮಾರಿ ರೋಗದ ಮುಂಜಾಗ್ರತೆ ಅಗತ್ಯ'],
      },
      {
        crop_name: 'Cotton',
        seasons: ['kharif'],
        min_water: 'limited',
        water_rank: 2,
        soils: ['black_cotton', 'clay_loam'],
        ph_min: 6.5,
        ph_max: 8.5,
        yield_per_acre: 12,
        price_per_qtl: 7100,
        cost_per_acre: 38200,
        duration: 160,
        water_level: 'ಮಧ್ಯಮ (Limited)',
        strengths: ['ವಾಣಿಜ್ಯ ನಾರಿನ ಬೆಳೆ', 'ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆಯ ಖರೀದಿ'],
        risks: ['ಕೆಂಪು ಮಣ್ಣಿಗೆ ಸೂಕ್ತವಲ್ಲ, ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು ಅಗತ್ಯ'],
      },
    ];

    const farmerWaterRank = water === 'reliable' ? 3 : water === 'limited' ? 2 : 1;

    const feasibleList: RankedCropItem[] = [];
    const disqualifiedList: DisqualifiedCropItem[] = [];

    candidates.forEach((c) => {
      // Hard check 1: Season
      const seasonMatch = c.seasons.includes(season.toLowerCase()) || c.seasons.includes('all_season');
      if (!seasonMatch) {
        disqualifiedList.push({
          crop_name: c.crop_name,
          reason: `ಹಂಗಾಮು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ: ${c.crop_name} ಬೆಳೆಗೆ ${c.seasons.join(', ')} ಅಗತ್ಯವಿದೆ. ನಿಮ್ಮ ಹಂಗಾಮು '${season}'.`,
          failed_criteria: 'Season Incompatibility',
        });
        return;
      }

      // Hard check 2: Water
      if (farmerWaterRank < c.water_rank) {
        disqualifiedList.push({
          crop_name: c.crop_name,
          reason: `ನೀರಿನ ಕೊರತೆ: ${c.crop_name} ಬೆಳೆಗೆ '${c.min_water}' ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ. ನಿಮ್ಮ ಬಳಿ '${water}' ಸೌಲಭ್ಯವಿದೆ.`,
          failed_criteria: 'Insufficient Water Requirement',
        });
        return;
      }

      // Check 3: Soil suitability
      const soilMatch = c.soils.includes(soil);
      if (!soilMatch && soil === 'black_cotton' && c.crop_name === 'Potato') {
        disqualifiedList.push({
          crop_name: c.crop_name,
          reason: `ಮಣ್ಣಿನ ಮಿತಿ: ${c.crop_name} ಗೆ ಕೆಂಪು ಮರಳು ಮಣ್ಣು ಸೂಕ್ತ. ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಗಡ್ಡೆ ಕೊಳೆಯುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು.`,
          failed_criteria: 'Suboptimal Soil Drainage',
        });
        return;
      }

      if (c.crop_name === 'Cotton' && soil !== 'black_cotton' && soil !== 'clay_loam') {
        disqualifiedList.push({
          crop_name: c.crop_name,
          reason: `ಮಣ್ಣಿನ ಅಸಮರ್ಪಕತೆ: ಹತ್ತಿ ಬೆಳೆಗೆ ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು (Black Cotton Soil) ಬೇಕು. ಕೆಂಪು ಮಣ್ಣಿನಲ್ಲಿ ಇಳುವರಿ ಕುಸಿಯುತ್ತದೆ.`,
          failed_criteria: 'Incompatible Soil Type',
        });
        return;
      }

      // Financials
      const grossRevPerAcre = c.yield_per_acre * c.price_per_qtl;
      const netProfitPerAcre = grossRevPerAcre - c.cost_per_acre;
      const roi = Math.round((netProfitPerAcre / c.cost_per_acre) * 100);

      // Score
      let score = 80;
      if (soilMatch) score += 10;
      if (ph >= c.ph_min && ph <= c.ph_max) score += 8;
      if (roi > 150) score += 5;

      feasibleList.push({
        crop_name: c.crop_name,
        rank: 0,
        utility_score: Math.min(0.98, score / 100),
        criteria_breakdown: {
          agronomy_suitability: soilMatch ? 0.95 : 0.75,
          economic_returns: Math.min(1.0, roi / 250),
          water_resilience: c.water_rank === 1 ? 0.95 : 0.85,
          downside_risk_protection: c.crop_name === 'Ragi' ? 0.98 : 0.88,
          crop_duration_fit: c.duration <= 85 ? 0.95 : 0.82,
        },
        financial_metrics: {
          expected_yield_qtl_per_acre: c.yield_per_acre,
          expected_price_per_qtl: c.price_per_qtl,
          total_cost_per_acre: c.cost_per_acre,
          gross_revenue_per_acre: grossRevPerAcre,
          expected_net_profit_per_acre: netProfitPerAcre,
          return_on_investment_pct: roi,
        },
        duration_days: c.duration,
        water_requirement_level: c.water_level,
        operational_weather_fit: `${profile.district || 'Kolar'} ಜಿಲ್ಲೆಯ ${area} ಎಕರೆ ಕೃಷಿ ಜಮೀನಿನ ಹವಾಗುಣಕ್ಕೆ ಸೂಕ್ತ ಬೆಳೆ.`,
        strengths: c.strengths,
        key_risks: c.risks,
      });
    });

    // Sort by profit & utility
    feasibleList.sort((a, b) => b.utility_score - a.utility_score);
    feasibleList.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    setRankedCrops(feasibleList);
    setDisqualifiedCrops(disqualifiedList);
  };

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
      if (res.data && res.data.ranked_recommendations && res.data.ranked_recommendations.length > 0) {
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

        if (res.data.disqualified_crops && res.data.disqualified_crops.length > 0) {
          const mappedDisqualified: DisqualifiedCropItem[] = res.data.disqualified_crops.map((d: any) => ({
            crop_name: d.crop_name,
            reason: d.reasons?.filter((r: string) => r.toLowerCase().includes('water') || r.toLowerCase().includes('deficit') || r.toLowerCase().includes('soil') || r.toLowerCase().includes('season'))[0] || d.reasons?.[0] || 'Did not meet hard constraint thresholds.',
            failed_criteria: d.constraint_checks?.find((ch: any) => !ch.passed)?.message || 'Agronomic constraint failure',
          }));
          setDisqualifiedCrops(mappedDisqualified);
        }
      } else {
        computeLocalRecommendations();
      }
    } catch {
      // Seamlessly execute local deterministic engine if server is offline or loading
      computeLocalRecommendations();
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

      {/* Active Farmer Details & Soil Card Context Strip */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(20, 184, 166, 0.05) 100%)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.4rem',
        margin: '0.8rem 0 1.2rem 0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              🌾 ರೈತರ ಸಕ್ರಿಯ ಪ್ರೊಫೈಲ್: {profile.farmer_name}
            </span>
            <span style={{ fontSize: '0.8rem', background: 'var(--primary)', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              {profile.land_area_acres} ಎಕರೆ (Acres)
            </span>
            <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              ಜಿಲ್ಲೆ: {profile.district}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            <span><strong>ಮಣ್ಣು:</strong> {profile.soil_type === 'red_sandy_loam' ? 'ಕೆಂಪು ಮರಳು ಮಿಶ್ರಿತ ಮಣ್ಣು (Red Sandy Loam)' : profile.soil_type}</span>
            <span>•</span>
            <span><strong>ಮಣ್ಣಿನ pH:</strong> {profile.soil_ph} {profile.soil_ph < 6.0 ? '(ಸ್ವಲ್ಪ ಆಮ್ಲೀಯ - ಸುಣ್ಣ ಶಿಫಾರಸು)' : '(ತಟಸ್ಥ)'}</span>
            <span>•</span>
            <span><strong>ನೀರು:</strong> {profile.water_availability === 'limited' ? 'ಕಡಿಮೆ / ಮಧ್ಯಮ (Seasonal Borewell)' : profile.water_availability === 'reliable' ? 'ಸಾಕಷ್ಟು (Perennial)' : 'ಮಳೆಯಾಶ್ರಿತ (Rainfed)'}</span>
            <span>•</span>
            <span><strong>ಹಂಗಾಮು:</strong> {profile.season === 'kharif' ? 'ಮುಂಗಾರು (Kharif)' : profile.season === 'rabi' ? 'ಹಿಂಗಾರು (Rabi)' : 'ಬೇಸಿಗೆ (Summer)'}</span>
          </div>
        </div>

        <Link
          to="/account"
          style={{
            fontSize: '0.82rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: 600,
            border: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          ✏️ ವಿವರಗಳನ್ನು ಬದಲಾಯಿಸಿ (Edit Farm Details)
        </Link>
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
                        <strong className="fin-val text-primary">₹{(crop.financial_metrics.expected_net_profit_per_acre * (profile?.land_area_acres || 1)).toLocaleString('en-IN')}</strong>
                        <span className="fin-sub">ನಿಮ್ಮ {profile?.land_area_acres || 1} ಎಕರೆಗೆ (₹{crop.financial_metrics.expected_net_profit_per_acre.toLocaleString('en-IN')}/ಎಕರೆ • ROI: {crop.financial_metrics.return_on_investment_pct}%)</span>
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
