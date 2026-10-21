import React, { useState } from 'react';
import {
  UserCheck,
  MapPin,
  Layers,
  Droplet,
  Calendar,
  CheckCircle2,
  CloudSun,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const KARNATAKA_DISTRICTS = [
  'Kolar',
  'Bengaluru Rural',
  'Bengaluru Urban',
  'Belagavi',
  'Davanagere',
  'Mandya',
  'Shivamogga',
  'Tumakuru',
  'Haveri',
  'Dharwad',
  'Chitradurga',
  'Chikkaballapur',
  'Ballari',
  'Mysuru',
  'Hassan',
  'Bagalkot',
  'Raichur',
  'Koppal',
  'Gadag',
  'Udupi',
];

export const FarmerProfile: React.FC = () => {
  const { t, profile, updateProfile, weather, fetchWeather, detectLocationViaGps } = useApp();
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsNote, setGpsNote] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    district: profile.district,
    land_area_acres: profile.land_area_acres,
    soil_type: profile.soil_type,
    soil_ph: profile.soil_ph,
    irrigation_source: profile.irrigation_source,
    water_availability: profile.water_availability,
    season: profile.season,
    capital_budget_inr: profile.capital_budget_inr,
    risk_preference: profile.risk_preference,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGpsDetect = async () => {
    setDetectingGps(true);
    setGpsNote(null);
    const res = await detectLocationViaGps();
    setDetectingGps(false);
    if (res.success && res.district) {
      setFormData((prev) => ({ ...prev, district: res.district! }));
      setGpsNote(`ಸ್ಥಳ ಪತ್ತೆಯಾಗಿದೆ: ${res.district}`);
    } else {
      setGpsNote(res.message);
    }
  };

  const handleDistrictChange = (dist: string) => {
    setFormData((prev) => ({ ...prev, district: dist }));
    fetchWeather(dist);
  };

  const handleLandStep = (delta: number) => {
    setFormData((prev) => ({
      ...prev,
      land_area_acres: Math.max(0.5, Math.min(100, Math.round((prev.land_area_acres + delta) * 10) / 10)),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4500);
  };

  const getPhCategory = (ph: number) => {
    if (ph < 6.0) return { label: 'ಆಮ್ಲೀಯ (Acidic)', color: '#ef4444' };
    if (ph <= 7.5) return { label: 'ತಟಸ್ಥ / ಅತ್ಯುತ್ತಮ (Optimal Neutral)', color: '#10b981' };
    return { label: 'ಕ್ಷಾರೀಯ (Alkaline)', color: '#f59e0b' };
  };

  const phCategory = getPhCategory(formData.soil_ph);

  return (
    <div className="page-container">
      <div className="page-header-farmer">
        <div className="header-icon-badge">
          <UserCheck size={28} />
        </div>
        <div>
          <h1 className="page-heading">{t.profile.title}</h1>
          <p className="page-subheading">{t.profile.subtitle}</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="alert-box success">
          <CheckCircle2 size={20} />
          <div>
            <strong>{t.profile.savedSuccess}</strong>
            <p>ಬೆಳೆ ಶಿಫಾರಸುಗಳು ಮತ್ತು ಲಾಭದ ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ಹೊಸ ಮಾಹಿತಿಯೊಂದಿಗೆ ತಕ್ಷಣವೇ ಅಪ್‌ಡೇಟ್ ಮಾಡಲಾಗಿದೆ.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="profile-form-grid">
        {/* Left Column: Geographic & Soil Parameters */}
        <div className="form-card-column">
          <div className="card-farmer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 className="card-title-md" style={{ margin: 0 }}>
                <MapPin className="text-primary inline-icon" size={20} />
                ಸ್ಥಳ ಮತ್ತು ಜಮೀನಿನ ಮಾಹಿತಿ (Location & Land Area)
              </h2>
              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={detectingGps}
                className="btn-farmer-outline"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
              >
                <Compass size={15} className={detectingGps ? 'animate-spin' : ''} />
                <span>{detectingGps ? 'ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...' : '📍 GPS ಸ್ಥಳ ಗುರುತಿಸಿ'}</span>
              </button>
            </div>

            {gpsNote && (
              <div className="alert-box success" style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem', marginBottom: '0.8rem' }}>
                <CheckCircle2 size={16} />
                <span>{gpsNote}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t.profile.district}</label>
              <select
                value={formData.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="form-select-lg"
              >
                {KARNATAKA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <span className="field-hint">ಕರ್ನಾಟಕದ ಎಪಿಎಂಸಿ ಮಂಡಿ ಮತ್ತು ಹವಾಮಾನ ಮಾಹಿತಿಗೆ ಅನ್ವಯಿಸುತ್ತದೆ.</span>
            </div>

            <div className="form-group">
              <label className="form-label">{t.profile.landArea}</label>
              <div className="land-input-stepper">
                <button type="button" onClick={() => handleLandStep(-0.5)} className="btn-step">
                  -0.5
                </button>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="100"
                  value={formData.land_area_acres}
                  onChange={(e) =>
                    setFormData({ ...formData, land_area_acres: parseFloat(e.target.value) || 1.0 })
                  }
                  className="form-input-lg center-text"
                />
                <span className="unit-tag">{t.profile.acres}</span>
                <button type="button" onClick={() => handleLandStep(0.5)} className="btn-step">
                  +0.5
                </button>
                <button type="button" onClick={() => handleLandStep(1.0)} className="btn-step primary">
                  +1.0
                </button>
              </div>
            </div>

            <div className="district-weather-preview">
              <div className="preview-header">
                <CloudSun size={18} className="text-primary" />
                <span>ಪ್ರಸ್ತುತ {formData.district} ಹವಾಮಾನ ಸ್ಥಿತಿ (Live Weather)</span>
              </div>
              {weather?.current ? (
                <div className="preview-metrics">
                  <span>ತಾಪಮಾನ: <strong>{Math.round(weather.current.temperature_c ?? (weather.current as any).temperature_2m ?? 24)}°C</strong></span>
                  <span>ಆರ್ದ್ರತೆ: <strong>{weather.current.relative_humidity_pct ?? (weather.current as any).relative_humidity_2m ?? 80}%</strong></span>
                  <span>ಮುನ್ಸೂಚನೆ: <strong>{weather.current.weather_description ?? (weather.current as any).weather_condition ?? 'Clear'}</strong></span>
                </div>
              ) : (
                <span className="text-muted text-sm">ಹವಾಮಾನ ವಿವರ ಲೋಡ್ ಆಗುತ್ತಿದೆ...</span>
              )}
            </div>
          </div>

          {/* Soil Health Card */}
          <div className="card-farmer">
            <h2 className="card-title-md">
              <Layers className="text-amber inline-icon" size={20} />
              ಮಣ್ಣಿನ ಪ್ರಕಾರ ಮತ್ತು ಪಿ.ಹೆಚ್ (Soil Health)
            </h2>

            <div className="form-group">
              <label className="form-label">{t.profile.soilType}</label>
              <select
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="form-select-lg"
              >
                {Object.entries(t.profile.soils).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div className="label-with-value">
                <label className="form-label">{t.profile.soilPh}</label>
                <span className="ph-badge" style={{ backgroundColor: `${phCategory.color}20`, color: phCategory.color }}>
                  {formData.soil_ph} pH • {phCategory.label}
                </span>
              </div>
              <input
                type="range"
                min="4.5"
                max="8.5"
                step="0.1"
                value={formData.soil_ph}
                onChange={(e) => setFormData({ ...formData, soil_ph: parseFloat(e.target.value) })}
                className="form-slider"
              />
              <div className="slider-ticks">
                <span>4.5 (ಆಮ್ಲೀಯ)</span>
                <span>6.5 - 7.5 (ಉತ್ತಮ)</span>
                <span>8.5 (ಕ್ಷಾರೀಯ)</span>
              </div>
              <span className="field-hint">
                ಮಣ್ಣಿನ ಪಿ.ಹೆಚ್ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತವಲ್ಲದ ಬೆಳೆಗಳನ್ನು ಶಿಫಾರಸು ಪಟ್ಟಿಯಿಂದ ಪಾರದರ್ಶಕವಾಗಿ ತಿರಸ್ಕರಿಸಲಾಗುತ್ತದೆ.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Water, Budget & Planting Season */}
        <div className="form-card-column">
          <div className="card-farmer">
            <h2 className="card-title-md">
              <Droplet className="text-accent inline-icon" size={20} />
              ನೀರಾವರಿ ಮತ್ತು ನೀರಿನ ಲಭ್ಯತೆ (Water & Irrigation)
            </h2>

            <div className="form-group">
              <label className="form-label">{t.profile.irrigationSource}</label>
              <div className="chip-selector-grid">
                {Object.entries(t.profile.irrigations).map(([val, label]) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setFormData({ ...formData, irrigation_source: val })}
                    className={`selector-chip ${formData.irrigation_source === val ? 'selected' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.profile.waterAvailability}</label>
              <div className="chip-selector-grid">
                {Object.entries(t.profile.waterLevels).map(([val, label]) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setFormData({ ...formData, water_availability: val as 'rainfed' | 'limited' | 'reliable' })}
                    className={`selector-chip ${formData.water_availability === val ? 'selected' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="field-hint">
                ನೀರು ಕಡಿಮೆಯಿದ್ದಾಗ ಹತ್ತಿ, ರಾಗಿ ಮುಂತಾದ ಕಡಿಮೆ ನೀರು ಬೇಡುವ ಬೆಳೆಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಲಾಗುತ್ತದೆ.
              </span>
            </div>
          </div>

          <div className="card-farmer">
            <h2 className="card-title-md">
              <Calendar className="text-primary inline-icon" size={20} />
              ಹಂಗಾಮು ಮತ್ತು ಬಂಡವಾಳ (Season & Budget)
            </h2>

            <div className="form-group">
              <label className="form-label">{t.profile.season}</label>
              <div className="chip-selector-grid">
                {Object.entries(t.profile.seasons).map(([val, label]) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setFormData({ ...formData, season: val as 'kharif' | 'rabi' | 'summer' | 'all_season' })}
                    className={`selector-chip ${formData.season === val ? 'selected' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.profile.capitalBudget}</label>
              <div className="budget-presets">
                {[50000, 85000, 150000, 250000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setFormData({ ...formData, capital_budget_inr: amt })}
                    className={`preset-btn ${formData.capital_budget_inr === amt ? 'active' : ''}`}
                  >
                    ₹{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="5000"
                min="10000"
                value={formData.capital_budget_inr}
                onChange={(e) =>
                  setFormData({ ...formData, capital_budget_inr: parseInt(e.target.value) || 50000 })
                }
                className="form-input-lg"
              />
            </div>

            <div className="form-group">
              <label className="form-label">ಅಪಾಯದ ಆದ್ಯತೆ (Risk Preference)</label>
              <select
                value={formData.risk_preference}
                onChange={(e) => setFormData({ ...formData, risk_preference: e.target.value as 'low' | 'moderate' | 'high' })}
                className="form-select-lg"
              >
                <option value="low">ಸುರಕ್ಷಿತ ಕೃಷಿ / ಕಡಿಮೆ ಅಪಾಯ (Low Risk - Downside Protected)</option>
                <option value="moderate">ಸಮತೋಲಿತ (Moderate - High ROI & Stability)</option>
                <option value="high">ಹೆಚ್ಚು ಲಾಭದಾಯಕ / ಮಾರುಕಟ್ಟೆ ಅಪಾಯ (High Risk - High Upside)</option>
              </select>
            </div>
          </div>

          <div className="form-submit-row">
            <button type="submit" className="btn-save-profile">
              <CheckCircle2 size={20} />
              <span>{t.profile.saveBtn}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FarmerProfile;
