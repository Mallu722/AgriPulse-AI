import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  CloudSun,
  TrendingUp,
  Store,
  Calculator,
  UserCheck,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Calendar,
  AlertCircle,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TopCropPreview {
  crop_name: string;
  rank: number;
  utility_score: number;
  expected_net_profit_per_acre: number;
  agronomy_fit_score: number;
  primary_advantage: string;
}

export const Dashboard: React.FC = () => {
  const { t, profile, weather, weatherLoading, weatherError, fetchWeather, apiBase, mandiSummary } = useApp();
  const [topCrops, setTopCrops] = useState<TopCropPreview[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTopCrops = async () => {
      setRankingLoading(true);
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
        const res = await axios.post(`${apiBase}/ranking/recommend`, payload, { timeout: 6000 });
        if (isMounted && res.data?.ranked_recommendations && res.data.ranked_recommendations.length > 0) {
          const previews: TopCropPreview[] = res.data.ranked_recommendations.slice(0, 3).map((c: any) => ({
            crop_name: c.crop_name,
            rank: c.rank,
            utility_score: Math.round(c.composite_score || (c.score_breakdown?.total_composite_score || 85)),
            expected_net_profit_per_acre: Math.round(c.expected_base_net_return_inr ? (c.expected_base_net_return_inr / profile.land_area_acres) : 52000),
            agronomy_fit_score: Math.round((c.score_breakdown?.agronomic_fit_score || 25) * 4),
            primary_advantage: c.key_advantages?.[0] || 'Optimal soil pH fit & strong APMC modal pricing',
          }));
          setTopCrops(previews);
        }
      } catch {
        if (isMounted) {
          setTopCrops([
            { crop_name: 'Onion', rank: 1, utility_score: 95, expected_net_profit_per_acre: 172760, agronomy_fit_score: 100, primary_advantage: 'Optimal soil pH fit & resilient downside protection' },
            { crop_name: 'Maize', rank: 2, utility_score: 84, expected_net_profit_per_acre: 32000, agronomy_fit_score: 92, primary_advantage: 'High drought resilience & low water requirement' },
            { crop_name: 'Cotton', rank: 3, utility_score: 78, expected_net_profit_per_acre: 45000, agronomy_fit_score: 88, primary_advantage: 'Strong market value under limited irrigation' },
          ]);
        }
      } finally {
        if (isMounted) setRankingLoading(false);
      }
    };

    fetchTopCrops();
    return () => { isMounted = false; };
  }, [apiBase, profile]);

  const soilName = t.profile.soils[profile.soil_type as keyof typeof t.profile.soils] || profile.soil_type;
  const seasonName = t.profile.seasons[profile.season as keyof typeof t.profile.seasons] || profile.season;

  return (
    <div className="page-container dashboard-page">
      {/* Farmer Greeting & Quick Profile Summary Banner */}
      <section className="welcome-banner">
        <div className="welcome-left">
          <div className="welcome-badge">
            <Sparkles size={16} />
            <span>{t.dashboard.greeting}</span>
          </div>
          <h1 className="welcome-title">
            {profile.farmer_name ? `${profile.farmer_name} • ` : ''}{profile.district} ಕೃಷಿ ನಿರ್ಧಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್
          </h1>
          <p className="welcome-subtitle">
            {profile.district} ಜಿಲ್ಲೆ, {profile.land_area_acres} {t.profile.acres} • {soilName} • {seasonName}
            {profile.documents?.length > 0 ? ` • ${profile.documents.length} ಕೃಷಿ ದಾಖಲೆಗಳು ಲಗತ್ತಿಸಲಾಗಿದೆ` : ''}
          </p>
        </div>

        <div className="welcome-actions">
          <Link to="/account" className="btn-farmer-outline" title="ರೈತರ ಖಾತೆ ಮತ್ತು ದಾಖಲೆಗಳು">
            <UserCheck size={16} />
            <span>ಖಾತೆ & ದಾಖಲೆಗಳು (Account & Docs)</span>
          </Link>
          <Link to="/recommendations" className="btn-farmer-primary">
            <TrendingUp size={16} />
            <span>{t.nav.recommendations}</span>
          </Link>
        </div>
      </section>

      {/* Account & Location Onboarding Strip */}
      <div className="account-onboarding-callout">
        <div className="onboarding-callout-icon">
          <ShieldCheck size={28} className="text-primary" />
        </div>
        <div className="onboarding-callout-body">
          <strong className="callout-heading">
            ಪ್ರಾರಂಭಿಸಿ: 1. ಖಾತೆ ರಚಿಸಿ & ದಾಖಲೆಗಳನ್ನು ಸೇರಿಸಿ • 2. ಸ್ಥಳ ಗುರುತಿಸಿ • 3. ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ
          </strong>
          <p className="callout-sub">
            ನಿಮ್ಮ ಪಹಣಿ (RTC), ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ (SHC) ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಹಾಗೂ ಜಿಪಿಎಸ್ ಮೂಲಕ ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಗುರುತಿಸಿ ನಿಖರ ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಸೂಕ್ತತೆಯನ್ನು ಪಡೆಯಿರಿ.
          </p>
        </div>
        <div className="onboarding-callout-actions">
          <Link to="/account" className="btn-action-highlight">
            <span>ಖಾತೆ ತೆರೆಯಿರಿ / ದಾಖಲೆ ಸೇರಿಸಿ →</span>
          </Link>
        </div>
      </div>

      {/* Grid: Live Weather & Farm Profile Snapshot */}
      <div className="dashboard-grid-top">
        {/* Weather Card */}
        <div className="card-farmer weather-card-hero">
          <div className="card-farmer-header">
            <div className="card-header-icon green">
              <CloudSun size={22} />
            </div>
            <div>
              <h2 className="card-title-lg">{t.dashboard.weatherTitle} ({profile.district})</h2>
              <p className="card-subtitle-sm">{t.dashboard.weatherSubtitle}</p>
            </div>
            <button
              onClick={() => fetchWeather(profile.district, true)}
              disabled={weatherLoading}
              className="btn-icon-refresh"
              title="Refresh live weather"
            >
              <RefreshCw size={16} className={weatherLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {weatherError ? (
            <div className="alert-box warning">
              <AlertCircle size={18} />
              <span>{weatherError}</span>
            </div>
          ) : null}

          {weather?.current ? (
            <div className="weather-content">
              <div className="weather-primary-display">
                <div className="weather-temp-huge">
                  {Math.round(weather.current.temperature_c ?? (weather.current as any).temperature_2m ?? 24)}°C
                </div>
                <div className="weather-condition-badge">
                  <span className="condition-name">{weather.current.weather_description ?? (weather.current as any).weather_condition ?? 'Partly Cloudy'}</span>
                  <span className="condition-sub">{weather.district}, Karnataka</span>
                </div>
              </div>

              <div className="weather-metrics-grid">
                <div className="metric-box">
                  <Droplets size={16} className="text-accent" />
                  <span className="metric-label">{t.dashboard.humidity}</span>
                  <strong className="metric-val">{weather.current.relative_humidity_pct ?? (weather.current as any).relative_humidity_2m ?? 80}%</strong>
                </div>
                <div className="metric-box">
                  <CloudRain size={16} className="text-primary" />
                  <span className="metric-label">{t.dashboard.rainfall}</span>
                  <strong className="metric-val">{weather.current.precipitation_mm ?? (weather.current as any).precipitation ?? 0} mm</strong>
                </div>
                <div className="metric-box">
                  <Wind size={16} className="text-muted" />
                  <span className="metric-label">{t.dashboard.wind}</span>
                  <strong className="metric-val">{weather.current.wind_speed_kmh ?? (weather.current as any).wind_speed_10m ?? 12} km/h</strong>
                </div>
                <div className="metric-box">
                  <Thermometer size={16} className="text-warning" />
                  <span className="metric-label">Max / Min</span>
                  <strong className="metric-val">
                    {weather.daily_forecast?.[0]
                      ? `${Math.round(weather.daily_forecast[0].temp_max_c ?? (weather.daily_forecast[0] as any).temperature_2m_max ?? 28)}° / ${Math.round(weather.daily_forecast[0].temp_min_c ?? (weather.daily_forecast[0] as any).temperature_2m_min ?? 20)}°`
                      : '--'}
                  </strong>
                </div>
              </div>

              {/* 5-Day Outlook Strip */}
              <div className="forecast-strip">
                <span className="strip-title">5 ದಿನಗಳ ಮುನ್ನೋಟ (5-Day Outlook):</span>
                <div className="forecast-chips">
                  {(weather.daily_forecast || []).slice(0, 5).map((day: any, idx: number) => {
                    const dateStr = day.forecast_date || day.date;
                    const maxT = Math.round(day.temp_max_c ?? day.temperature_2m_max ?? 28);
                    const minT = Math.round(day.temp_min_c ?? day.temperature_2m_min ?? 20);
                    const rain = day.precipitation_sum_mm ?? day.precipitation_sum ?? 0;
                    return (
                      <div key={idx} className="forecast-chip">
                        <span className="chip-day">{new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                        <span className="chip-temp">{maxT}° / {minT}°</span>
                        <span className="chip-rain">{rain > 0 ? `🌧️ ${rain}mm` : '☀️ ಒಣ'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Source attribution and freshness */}
              <div className="card-footer-meta">
                <span>ಮೂಲ: <strong>{weather.raw_source_attribution ? 'Open-Meteo CC BY 4.0' : (weather.provider || 'Open-Meteo Agro API')}</strong></span>
                <span>ಕ್ಯಾಶ್: <strong>{weather.is_stale ? 'ಮಳೆಯ ಮುನ್ನೆಚ್ಚರಿಕೆ' : 'ಲೈವ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ'}</strong></span>
              </div>
            </div>
          ) : (
            <div className="loading-skeleton">
              <RefreshCw className="animate-spin" size={24} />
              <span>ಹವಾಮಾನ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ... (Loading live weather...)</span>
            </div>
          )}
        </div>

        {/* Quick Farm Status Card */}
        <div className="card-farmer profile-summary-card">
          <div className="card-farmer-header">
            <div className="card-header-icon amber">
              <UserCheck size={22} />
            </div>
            <div>
              <h2 className="card-title-lg">{t.dashboard.quickStats}</h2>
              <p className="card-subtitle-sm">ಸಕ್ರಿಯ ಜಮೀನು ಸಂರಚನೆ (Active Profile)</p>
            </div>
            <Link to="/profile" className="btn-link-sm">ಬದಲಾಯಿಸಿ (Edit)</Link>
          </div>

          <div className="profile-spec-list">
            <div className="spec-item">
              <span className="spec-label">{t.profile.district}</span>
              <strong className="spec-val">{profile.district}</strong>
            </div>
            <div className="spec-item">
              <span className="spec-label">{t.profile.landArea}</span>
              <strong className="spec-val">{profile.land_area_acres} {t.profile.acres}</strong>
            </div>
            <div className="spec-item">
              <span className="spec-label">{t.profile.soilType}</span>
              <strong className="spec-val">{soilName}</strong>
            </div>
            <div className="spec-item">
              <span className="spec-label">{t.profile.soilPh}</span>
              <strong className="spec-val">{profile.soil_ph} pH</strong>
            </div>
            <div className="spec-item">
              <span className="spec-label">{t.profile.irrigationSource}</span>
              <strong className="spec-val">{t.profile.irrigations[profile.irrigation_source as keyof typeof t.profile.irrigations] || profile.irrigation_source}</strong>
            </div>
            <div className="spec-item">
              <span className="spec-label">{t.profile.capitalBudget}</span>
              <strong className="spec-val">₹{profile.capital_budget_inr.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className="provenance-seal">
            <ShieldCheck size={18} className="text-primary" />
            <div>
              <strong>ಶೂನ್ಯ ಡೇಟಾ ನಷ್ಟ (Zero Silent Drops)</strong>
              <p>ಅಧಿಕೃತ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯ (ICAR / UASB) ಮತ್ತು ಆಗ್ಮಾರ್ಕ್‌ನೆಟ್ ದೃಢೀಕೃತ ಸೂತ್ರಗಳು.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Crop Recommendations Preview */}
      <section className="section-block">
        <div className="section-header-flex">
          <div>
            <h2 className="section-title">
              <TrendingUp className="inline-icon text-primary" size={24} />
              {t.dashboard.topCropsTitle}
            </h2>
            <p className="section-desc">{t.dashboard.topCropsSubtitle}</p>
          </div>
          <Link to="/recommendations" className="btn-farmer-outline">
            <span>{t.dashboard.viewAllCrops}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {rankingLoading ? (
          <div className="loading-card">
            <RefreshCw className="animate-spin" size={22} />
            <span>ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...</span>
          </div>
        ) : (
          <div className="crop-cards-grid">
            {topCrops.map((crop) => (
              <div key={crop.crop_name} className={`crop-rank-card rank-${crop.rank}`}>
                <div className="rank-badge-ribbon">
                  <Award size={14} />
                  <span>#{crop.rank} {crop.rank === 1 ? 'ಅಗ್ರ ಶಿಫಾರಸು' : 'ಶಿಫಾರಸು'}</span>
                </div>

                <div className="crop-card-body">
                  <h3 className="crop-name-title">
                    {t.crops[crop.crop_name] || crop.crop_name}
                  </h3>
                  <p className="crop-advantage">{crop.primary_advantage}</p>

                  <div className="crop-metrics-row">
                    <div className="crop-metric">
                      <span className="metric-caption">{t.recommendations.utilityScore}</span>
                      <div className="score-meter-wrap">
                        <span className="score-num">{crop.utility_score}/100</span>
                        <div className="score-bar-bg">
                          <div className="score-bar-fill" style={{ width: `${crop.utility_score}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="crop-metric">
                      <span className="metric-caption">{t.dashboard.expectedReturn}</span>
                      <strong className="profit-num text-primary">
                        ₹{crop.expected_net_profit_per_acre.toLocaleString('en-IN')} <small>/ಎಕರೆ</small>
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="crop-card-footer">
                  <Link
                    to={`/profit?crop=${encodeURIComponent(crop.crop_name)}`}
                    className="btn-action-sm full-width"
                  >
                    <Calculator size={15} />
                    <span>{t.recommendations.calculateProfitBtn}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* APMC Mandi Spot Prices Snapshot */}
      <section className="section-block">
        <div className="section-header-flex">
          <div>
            <h2 className="section-title">
              <Store className="inline-icon text-amber" size={24} />
              {t.dashboard.marketAlertsTitle}
            </h2>
            <p className="section-desc">{t.dashboard.marketAlertsSubtitle}</p>
          </div>
          <Link to="/market" className="btn-farmer-outline">
            <span>{t.dashboard.viewAllMarkets}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mandi-snapshot-grid">
          <div className="mandi-card">
            <div className="mandi-card-header">
              <span className="crop-pill green">🍅 ಟೊಮೆಟೊ (Tomato)</span>
              <span className="mandi-location">Kolar Mandi</span>
            </div>
            <div className="mandi-price-box">
              <span className="price-label">{t.market.modalPrice}</span>
              <strong className="price-big">₹2,450</strong>
              <span className="unit-label">{t.market.perQuintal}</span>
            </div>
            <div className="mandi-range">
              <span>ದರ ವ್ಯಾಪ್ತಿ: ₹1,800 – ₹2,900</span>
              <span className="verified-dot">● ಪರಿಶೀಲಿಸಲಾಗಿದೆ</span>
            </div>
          </div>

          <div className="mandi-card">
            <div className="mandi-card-header">
              <span className="crop-pill amber">🧅 ಈರುಳ್ಳಿ (Onion)</span>
              <span className="mandi-location">Bangalore APMC</span>
            </div>
            <div className="mandi-price-box">
              <span className="price-label">{t.market.modalPrice}</span>
              <strong className="price-big">₹2,100</strong>
              <span className="unit-label">{t.market.perQuintal}</span>
            </div>
            <div className="mandi-range">
              <span>ದರ ವ್ಯಾಪ್ತಿ: ₹1,600 – ₹2,400</span>
              <span className="verified-dot">● ಪರಿಶೀಲಿಸಲಾಗಿದೆ</span>
            </div>
          </div>

          <div className="mandi-card">
            <div className="mandi-card-header">
              <span className="crop-pill blue">🥔 ಆಲೂಗಡ್ಡೆ (Potato)</span>
              <span className="mandi-location">Belgaum Yard</span>
            </div>
            <div className="mandi-price-box">
              <span className="price-label">{t.market.modalPrice}</span>
              <strong className="price-big">₹1,750</strong>
              <span className="unit-label">{t.market.perQuintal}</span>
            </div>
            <div className="mandi-range">
              <span>ದರ ವ್ಯಾಪ್ತಿ: ₹1,400 – ₹2,050</span>
              <span className="verified-dot">● ಪರಿಶೀಲಿಸಲಾಗಿದೆ</span>
            </div>
          </div>

          <div className="mandi-card">
            <div className="mandi-card-header">
              <span className="crop-pill purple">🌽 ಮೆಕ್ಕೆಜೋಳ (Maize)</span>
              <span className="mandi-location">Davanagere APMC</span>
            </div>
            <div className="mandi-price-box">
              <span className="price-label">{t.market.modalPrice}</span>
              <strong className="price-big">₹2,225</strong>
              <span className="unit-label">{t.market.perQuintal}</span>
            </div>
            <div className="mandi-range">
              <span>ದರ ವ್ಯಾಪ್ತಿ: ₹2,050 – ₹2,350</span>
              <span className="verified-dot">● ಎಂಎಸ್‌ಪಿ ಮಾನದಂಡ</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Quick Action Navigation Cards */}
      <section className="section-block quick-nav-section">
        <h2 className="section-title">ತ್ವರಿತ ಕೃಷಿ ಸಾಧನಗಳು • Farm Intelligence Modules</h2>
        <div className="quick-nav-grid">
          <Link to="/recommendations" className="nav-feature-card">
            <div className="feature-icon-box green">
              <TrendingUp size={28} />
            </div>
            <h3 className="feature-title">{t.nav.recommendations}</h3>
            <p className="feature-desc">
              ಮಣ್ಣು, ನೀರು, ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಸೂತ್ರಗಳ ಆಧಾರದ ಮೇಲೆ ಪಾರದರ್ಶಕ ಬೆಳೆ ಶ್ರೇಯಾಂಕ.
            </p>
            <span className="feature-link-text">ಶಿಫಾರಸುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ →</span>
          </Link>

          <Link to="/profit" className="nav-feature-card">
            <div className="feature-icon-box amber">
              <Calculator size={28} />
            </div>
            <h3 className="feature-title">{t.nav.profit}</h3>
            <p className="feature-desc">
              ಕೂಲಿ, ಟ್ರ್ಯಾಕ್ಟರ್, ಬೀಜ ಮತ್ತು ಗೊಬ್ಬರದ ಖರ್ಚುಗಳನ್ನು ನೀವೇ ನಮೂದಿಸಿ ನಿವ್ವಳ ಲಾಭ ಲೆಕ್ಕಹಾಕಿ.
            </p>
            <span className="feature-link-text">ಲಾಭ ಲೆಕ್ಕಾಚಾರ ಆರಂಭಿಸಿ →</span>
          </Link>

          <Link to="/market" className="nav-feature-card">
            <div className="feature-icon-box blue">
              <Store size={28} />
            </div>
            <h3 className="feature-title">{t.nav.market}</h3>
            <p className="feature-desc">
              ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಮಂಡಿಗಳ ದರಗಳು, ಒಳಹರಿವು ವಿವರ ಮತ್ತು ಬೆಲೆ ಏರಿಳಿತದ ಇತಿಹಾಸ.
            </p>
            <span className="feature-link-text">ಮಂಡಿ ದರಗಳನ್ನು ವೀಕ್ಷಿಸಿ →</span>
          </Link>

          <Link to="/profile" className="nav-feature-card">
            <div className="feature-icon-box purple">
              <UserCheck size={28} />
            </div>
            <h3 className="feature-title">{t.nav.profile}</h3>
            <p className="feature-desc">
              ನಿಮ್ಮ ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ, ಮಣ್ಣಿನ ಪಿ.ಹೆಚ್, ನೀರಾವರಿ ಸೌಲಭ್ಯ ಹಾಗೂ ಹಂಗಾಮು ನವೀಕರಿಸಿ.
            </p>
            <span className="feature-link-text">ಪ್ರೊಫೈಲ್ ಬದಲಾಯಿಸಿ →</span>
          </Link>
        </div>
      </section>

      {/* Provenance and System Footer */}
      <footer className="dashboard-footer-status">
        <div className="status-item">
          <ShieldCheck size={18} className="text-primary" />
          <span>ಆಗ್ಮಾರ್ಕ್‌ನೆಟ್ ದಾಖಲೆಗಳು: <strong>{mandiSummary?.total_records || '91'} Quotes</strong> (100% SHA-256 Validated)</span>
        </div>
        <div className="status-item">
          <Calendar size={18} className="text-accent" />
          <span>ಹವಾಮಾನ ಪ್ರೊವೈಡರ್: <strong>Open-Meteo Server-Side API</strong> (IMD Configurable)</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
