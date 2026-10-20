import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sprout,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Send,
  BookOpen,
  MapPin
} from 'lucide-react';

interface ConstraintCheck {
  constraint_name: string;
  passed: boolean | null;
  is_hard_constraint: boolean;
  farmer_value: any;
  required_value: any;
  message: string;
}

interface CropAssessment {
  crop_code: string;
  crop_name: string;
  kannada_name: string;
  category: string;
  status: 'SUITABLE' | 'CONDITIONALLY_SUITABLE' | 'INSUFFICIENT_INFORMATION' | 'UNSUITABLE';
  suitability_score: number;
  hard_constraints_passed: boolean;
  reasons: string[];
  missing_inputs: string[];
  advisory_notes: string[];
  source_citation: string;
  package_of_practices_ref: string;
  constraint_checks: ConstraintCheck[];
}

interface SuitabilityResponse {
  profile_summary: {
    district: string;
    land_area_acres: number;
    original_land: string;
    season: string;
    water_availability: string;
    soil_type: string;
    has_soil_health_card: boolean;
  };
  total_evaluated_crops: number;
  suitable_crops: CropAssessment[];
  conditionally_suitable_crops: CropAssessment[];
  insufficient_info_crops: CropAssessment[];
  unsuitable_crops: CropAssessment[];
  rule_engine_version: string;
  audit_trail: string;
}

interface ProfileOptions {
  land_units: string[];
  sowing_seasons: { value: string; label: string }[];
  water_availability: { value: string; label: string }[];
  risk_preferences: { value: string; label: string }[];
  soil_types: { value: string; label: string }[];
  karnataka_districts: string[];
}

interface Props {
  apiBase: string;
}

export const CropSuitabilityEngine: React.FC<Props> = ({ apiBase }) => {
  const [options, setOptions] = useState<ProfileOptions | null>(null);

  // Form State
  const [farmerName, setFarmerName] = useState('Basavaraj Bommai');
  const [district, setDistrict] = useState('Kolar');
  const [taluk, setTaluk] = useState('Srinivaspur');
  const [landArea, setLandArea] = useState('3.5');
  const [landUnit, setLandUnit] = useState('acres');
  const [season, setSeason] = useState('kharif');
  const [waterAvailability, setWaterAvailability] = useState('reliable');
  const [soilType, setSoilType] = useState('red_sandy_loam');
  const [riskPreference, setRiskPreference] = useState('moderate');

  // Soil Health Card optional fields
  const [includeSHC, setIncludeSHC] = useState(true);
  const [shcLab, setShcLab] = useState('KVK Kolar Soil Testing Lab');
  const [shcDate, setShcDate] = useState('2025-05-10');
  const [shcPh, setShcPh] = useState('6.5');
  const [shcOrganicCarbon, setShcOrganicCarbon] = useState('0.62');
  const [shcN, setShcN] = useState('290');
  const [shcP, setShcP] = useState('32');
  const [shcK, setShcK] = useState('260');

  // Results State
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<SuitabilityResponse | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Fetch form options on load
  useEffect(() => {
    axios
      .get<ProfileOptions>(`${apiBase}/suitability/options`)
      .then((res) => {
        setOptions(res.data);
      })
      .catch((err) => {
        console.error('Failed to load profile options', err);
      });
  }, [apiBase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    setEvalError(null);

    const payload: any = {
      farmer_name: farmerName,
      district,
      taluk: taluk || undefined,
      land_area: parseFloat(landArea) || 1.0,
      land_unit: landUnit,
      sowing_season: season,
      water_availability: waterAvailability,
      soil_type: soilType,
      risk_preference: riskPreference,
    };

    if (includeSHC) {
      payload.soil_health_card = {
        test_date: shcDate || undefined,
        lab_name: shcLab || undefined,
        ph: shcPh ? parseFloat(shcPh) : undefined,
        organic_carbon_pct: shcOrganicCarbon ? parseFloat(shcOrganicCarbon) : undefined,
        nitrogen_kg_ha: shcN ? parseFloat(shcN) : undefined,
        phosphorus_kg_ha: shcP ? parseFloat(shcP) : undefined,
        potassium_kg_ha: shcK ? parseFloat(shcK) : undefined,
      };
    }

    try {
      const res = await axios.post<SuitabilityResponse>(`${apiBase}/suitability/evaluate`, payload);
      setResult(res.data);
    } catch (err: any) {
      setEvalError(err.response?.data?.detail || err.message || 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const handlePresetSelect = (preset: 'kolar_reliable' | 'gulbarga_rainfed' | 'unknown_soil') => {
    if (preset === 'kolar_reliable') {
      setDistrict('Kolar');
      setTaluk('Srinivaspur');
      setLandArea('3.5');
      setLandUnit('acres');
      setSeason('kharif');
      setWaterAvailability('reliable');
      setSoilType('red_sandy_loam');
      setIncludeSHC(true);
      setShcPh('6.5');
    } else if (preset === 'gulbarga_rainfed') {
      setDistrict('Kalaburagi (Gulbarga)');
      setTaluk('Aland');
      setLandArea('5.0');
      setLandUnit('acres');
      setSeason('kharif');
      setWaterAvailability('rainfed');
      setSoilType('black_cotton');
      setIncludeSHC(true);
      setShcPh('7.8');
    } else if (preset === 'unknown_soil') {
      setDistrict('Belagavi (Belgaum)');
      setTaluk('Gokak');
      setLandArea('80');
      setLandUnit('guntas'); // 2 acres
      setSeason('summer');
      setWaterAvailability('limited');
      setSoilType('unknown');
      setIncludeSHC(false);
    }
  };

  const renderBadge = (status: string) => {
    switch (status) {
      case 'SUITABLE':
        return (
          <span className="component-badge ready" style={{ display: 'inline-flex', gap: '0.3rem' }}>
            <CheckCircle size={13} /> Highly Suitable
          </span>
        );
      case 'CONDITIONALLY_SUITABLE':
        return (
          <span
            className="component-badge pending"
            style={{
              display: 'inline-flex',
              gap: '0.3rem',
              borderColor: 'rgba(234, 179, 8, 0.4)',
              color: '#facc15',
              background: 'rgba(234, 179, 8, 0.1)',
            }}
          >
            <AlertTriangle size={13} /> Conditionally Suitable
          </span>
        );
      case 'INSUFFICIENT_INFORMATION':
        return (
          <span
            className="component-badge pending"
            style={{
              display: 'inline-flex',
              gap: '0.3rem',
              borderColor: 'rgba(59, 130, 246, 0.4)',
              color: '#60a5fa',
              background: 'rgba(59, 130, 246, 0.1)',
            }}
          >
            <HelpCircle size={13} /> Needs More Info
          </span>
        );
      case 'UNSUITABLE':
        return (
          <span
            className="component-badge pending"
            style={{
              display: 'inline-flex',
              gap: '0.3rem',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <XCircle size={13} /> Unsuitable
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Preset Profiles Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.6rem',
          alignItems: 'center',
          marginBottom: '1.2rem',
          padding: '0.8rem 1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Quick Load Real Profiles:
        </span>
        <button
          type="button"
          onClick={() => handlePresetSelect('kolar_reliable')}
          className="btn-secondary"
          style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
        >
          Kolar • 3.5 Acres • Reliable Water • Red Loam
        </button>
        <button
          type="button"
          onClick={() => handlePresetSelect('gulbarga_rainfed')}
          className="btn-secondary"
          style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
        >
          Kalaburagi • 5 Acres • Rainfed • Black Cotton
        </button>
        <button
          type="button"
          onClick={() => handlePresetSelect('unknown_soil')}
          className="btn-secondary"
          style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
        >
          Belagavi • 80 Guntas (Summer) • Unknown Soil
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '1.5rem' }}>
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="component-card" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--primary)" /> Farmer Land & Water Parameters
          </h4>

          {/* Farmer & District */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Farmer Name
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input, rgba(0,0,0,0.2))',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Karnataka District *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input, #1e293b)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              >
                {options?.karnataka_districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )) || <option value="Kolar">Kolar</option>}
              </select>
            </div>
          </div>

          {/* Land Area and Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Cultivated Land Area *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input, rgba(0,0,0,0.2))',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Unit of Measurement
              </label>
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input, #1e293b)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="acres">Acres</option>
                <option value="guntas">Guntas (40 Guntas = 1 Acre)</option>
                <option value="hectares">Hectares (1 Ha = 2.47 Acres)</option>
              </select>
            </div>
          </div>

          {/* Sowing Season & Water Availability */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Target Season *
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input, #1e293b)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="kharif">Kharif (Monsoon: Jun-Oct)</option>
                <option value="rabi">Rabi (Winter: Oct-Mar)</option>
                <option value="summer">Summer (Zaid: Mar-Jun)</option>
                <option value="all_season">All Season / Perennial</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Water Availability *
              </label>
              <select
                value={waterAvailability}
                onChange={(e) => setWaterAvailability(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input, #1e293b)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="rainfed">Rainfed (Dependent on rains)</option>
                <option value="limited">Limited (Canal / Seasonal)</option>
                <option value="reliable">Reliable (Perennial Borewell / Drip)</option>
              </select>
            </div>
          </div>

          {/* Soil Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Observed Soil Classification
            </label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input, #1e293b)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            >
              <option value="red_sandy_loam">Red Sandy Loam (Southern Karnataka)</option>
              <option value="black_cotton">Black Cotton Soil (Northern Dry Zone)</option>
              <option value="laterite">Laterite Soil (Coastal / Malnad)</option>
              <option value="alluvial">Alluvial Soil (River Plains)</option>
              <option value="clay_loam">Clay Loam</option>
              <option value="unknown">Unknown / Unverified (Strictly never guessed)</option>
            </select>
          </div>

          {/* Optional Soil Health Card Accordion */}
          <div
            style={{
              padding: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Soil Health Card (SHC) Lab Data
              </span>
              <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={includeSHC}
                  onChange={(e) => setIncludeSHC(e.target.checked)}
                />
                Include Lab Metrics
              </label>
            </div>

            {includeSHC && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Soil Testing Lab
                  </label>
                  <input
                    type="text"
                    value={shcLab}
                    onChange={(e) => setShcLab(e.target.value)}
                    placeholder="KVK Lab"
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input, #0f172a)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Test Date
                  </label>
                  <input
                    type="date"
                    value={shcDate}
                    onChange={(e) => setShcDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input, #0f172a)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Soil pH (3.5 - 10.5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={shcPh}
                    onChange={(e) => setShcPh(e.target.value)}
                    placeholder="6.5"
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input, #0f172a)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Organic Carbon %
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={shcOrganicCarbon}
                    onChange={(e) => setShcOrganicCarbon(e.target.value)}
                    placeholder="0.65"
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input, #0f172a)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Avail. N (kg/ha)
                  </label>
                  <input
                    type="number"
                    value={shcN}
                    onChange={(e) => setShcN(e.target.value)}
                    placeholder="280"
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input, #0f172a)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Avail. P & K (kg/ha)
                  </label>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <input
                      type="number"
                      value={shcP}
                      onChange={(e) => setShcP(e.target.value)}
                      placeholder="P: 32"
                      style={{
                        width: '50%',
                        padding: '0.35rem 0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-input, #0f172a)',
                        border: '1px solid var(--border-color)',
                        color: '#fff',
                        fontSize: '0.75rem',
                      }}
                    />
                    <input
                      type="number"
                      value={shcK}
                      onChange={(e) => setShcK(e.target.value)}
                      placeholder="K: 260"
                      style={{
                        width: '50%',
                        padding: '0.35rem 0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-input, #0f172a)',
                        border: '1px solid var(--border-color)',
                        color: '#fff',
                        fontSize: '0.75rem',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Risk Preference */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Risk Preference
            </label>
            <select
              value={riskPreference}
              onChange={(e) => setRiskPreference(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input, #1e293b)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            >
              <option value="low">Low (Staple grains, food security)</option>
              <option value="moderate">Moderate (Balanced pulse / commercial grains)</option>
              <option value="high">High (High-value horticulture with price volatility)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={evaluating}
            className="btn-primary"
            style={{
              padding: '0.65rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
            }}
          >
            {evaluating ? (
              <span>Evaluating Constraints...</span>
            ) : (
              <>
                <Send size={16} /> Run Deterministic Suitability Engine
              </>
            )}
          </button>
        </form>

        {/* Right Column: Engine Recommendation Results */}
        <div>
          {evalError && (
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
              {evalError}
            </div>
          )}

          {!result && !evaluating && (
            <div
              className="component-card"
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '380px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                gap: '0.8rem',
              }}
            >
              <Sprout size={36} color="var(--primary)" opacity={0.6} />
              <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Suitability Engine Ready</h4>
              <p style={{ maxWidth: '340px', fontSize: '0.85rem' }}>
                Fill in the farmer parameters or select one of the real Karnataka presets above, then click
                <strong> Run Deterministic Suitability Engine</strong>.
              </p>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Audit Banner */}
              <div
                style={{
                  padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--primary)' }}>Rule Engine:</strong>{' '}
                  <span style={{ color: '#fff' }}>{result.rule_engine_version}</span>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {result.audit_trail}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Normalized Area:</span>
                  <div style={{ fontWeight: 600, color: '#fff' }}>
                    {result.profile_summary.land_area_acres} Acres
                  </div>
                </div>
              </div>

              {/* Crop Cards List */}
              {[
                ...result.suitable_crops,
                ...result.conditionally_suitable_crops,
                ...result.insufficient_info_crops,
                ...result.unsuitable_crops,
              ].map((crop) => (
                <div
                  key={crop.crop_code}
                  className="component-card"
                  style={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '0.7rem',
                    borderColor:
                      crop.status === 'SUITABLE'
                        ? 'rgba(16, 185, 129, 0.4)'
                        : crop.status === 'UNSUITABLE'
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{crop.crop_name}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>({crop.kannada_name})</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {crop.category}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {renderBadge(crop.status)}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Fit Score: <strong style={{ color: '#fff' }}>{crop.suitability_score}/100</strong>
                      </div>
                    </div>
                  </div>

                  {/* Reasons & Constraints */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {crop.reasons.map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ color: crop.hard_constraints_passed ? 'var(--primary)' : '#ef4444' }}>•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Missing inputs warning if any */}
                  {crop.missing_inputs.length > 0 && (
                    <div
                      style={{
                        padding: '0.4rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        fontSize: '0.75rem',
                        color: '#93c5fd',
                      }}
                    >
                      <strong>Missing Inputs:</strong> {crop.missing_inputs.join('; ')}
                    </div>
                  )}

                  {/* Advisory Notes if any */}
                  {crop.advisory_notes.length > 0 && (
                    <div
                      style={{
                        padding: '0.4rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(234, 179, 8, 0.1)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        fontSize: '0.75rem',
                        color: '#fde047',
                      }}
                    >
                      <strong>Advisory:</strong> {crop.advisory_notes.join('; ')}
                    </div>
                  )}

                  {/* Official Citation Footer */}
                  <div
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <BookOpen size={12} />
                    <span>
                      <strong>Source:</strong> {crop.source_citation} ({crop.package_of_practices_ref})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
