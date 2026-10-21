import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserCheck,
  FileText,
  MapPin,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Compass,
  FileCheck,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp, KARNATAKA_DISTRICT_COORDINATES } from '../context/AppContext';

export const FarmerAccount: React.FC = () => {
  const { t, profile, updateProfile, addDocument, removeDocument, detectLocationViaGps, fetchWeather } = useApp();
  const navigate = useNavigate();

  const [accountForm, setAccountForm] = useState({
    farmer_name: profile.farmer_name,
    mobile: profile.mobile,
    farmer_id: profile.farmer_id,
    district: profile.district,
    taluk: profile.taluk,
    village: profile.village,
    survey_number: profile.survey_number,
    rtc_number: profile.rtc_number,
    land_area_acres: profile.land_area_acres,
    soil_type: profile.soil_type,
    soil_ph: profile.soil_ph,
    water_availability: profile.water_availability,
    irrigation_source: profile.irrigation_source,
    season: profile.season,
  });

  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Document modal/form state
  const [showDocForm, setShowDocForm] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: '',
    type: 'RTC',
    docNumber: '',
    fileSize: '1.4 MB PDF',
  });

  const handleGpsDetect = async () => {
    setDetectingGps(true);
    setGpsMessage(null);
    const result = await detectLocationViaGps();
    setDetectingGps(false);
    if (result.success && result.district) {
      setAccountForm((prev) => ({
        ...prev,
        district: result.district!,
      }));
      const zone = KARNATAKA_DISTRICT_COORDINATES[result.district]?.zone || 'Karnataka Agro Zone';
      setGpsMessage({
        type: 'success',
        text: `ಸ್ಥಳ ಪತ್ತೆಯಾಗಿದೆ: ${result.district} (${zone})`,
      });
    } else {
      setGpsMessage({ type: 'error', text: result.message });
    }
  };

  const handleDistrictChange = (selectedDistrict: string) => {
    const zone = KARNATAKA_DISTRICT_COORDINATES[selectedDistrict]?.zone || profile.agro_climatic_zone;
    setAccountForm((prev) => ({
      ...prev,
      district: selectedDistrict,
    }));
    updateProfile({
      district: selectedDistrict,
      agro_climatic_zone: zone,
    });
    fetchWeather(selectedDistrict, true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const zone = KARNATAKA_DISTRICT_COORDINATES[accountForm.district]?.zone || profile.agro_climatic_zone;
    updateProfile({
      ...accountForm,
      agro_climatic_zone: zone,
    });
    localStorage.setItem('agripulse_registered', 'true');
    fetchWeather(accountForm.district, true);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleSaveAndStartRecommendations = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveAccount(e);
    // Navigate straight to recommendations driven by their location & documents
    setTimeout(() => {
      navigate('/recommendations');
    }, 400);
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.docNumber) return;
    addDocument({
      name: newDoc.name,
      type: newDoc.type,
      docNumber: newDoc.docNumber,
      verified: true,
      fileSize: newDoc.fileSize,
    });
    setNewDoc({ name: '', type: 'RTC', docNumber: '', fileSize: '1.4 MB PDF' });
    setShowDocForm(false);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-farmer">
        <div className="header-icon-badge amber">
          <UserCheck size={28} />
        </div>
        <div>
          <h1 className="page-heading">{t.account.title}</h1>
          <p className="page-subheading">{t.account.subtitle}</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="alert-box success">
          <CheckCircle2 size={20} />
          <div>
            <strong>{t.account.accountSavedSuccess}</strong>
            <p>ಖಾತೆಯ ವಿವರಗಳು, ಸ್ಥಳ ಮತ್ತು ಕೃಷಿ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸೇವ್ ಮಾಡಲಾಗಿದೆ.</p>
          </div>
        </div>
      )}

      {/* GPS Location Auto-Detection Hero Banner */}
      <div className="gps-detection-banner">
        <div className="gps-banner-content">
          <div className="gps-icon-circle">
            <Compass size={32} className="text-primary animate-pulse" />
          </div>
          <div className="gps-text">
            <h2 className="gps-title">{t.account.detectGps}</h2>
            <p className="gps-desc">
              ನಿಮ್ಮ ಮೊಬೈಲ್ ಅಥವಾ ಕಂಪ್ಯೂಟರ್ ಜಿಪಿಎಸ್ ಮೂಲಕ ಕರ್ನಾಟಕದ ಹತ್ತಿರದ ಜಿಲ್ಲೆಯನ್ನು ಪತ್ತೆಹಚ್ಚಿ, ಲೈವ್ ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ವಲಯದ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.
            </p>
            {gpsMessage && (
              <div className={`gps-alert ${gpsMessage.type}`}>
                {gpsMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{gpsMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        <div className="gps-action-box">
          <button
            type="button"
            onClick={handleGpsDetect}
            disabled={detectingGps}
            className="btn-gps-action"
          >
            <MapPin size={18} />
            <span>{detectingGps ? t.account.detectingGps : 'ಸ್ಥಳ ಪತ್ತೆಹಚ್ಚಿ (Auto Detect GPS)'}</span>
          </button>
          <div className="detected-badge">
            <span className="dot online"></span>
            <span>ಪ್ರಸ್ತುತ ಜಿಲ್ಲೆ: <strong>{accountForm.district}</strong></span>
          </div>
        </div>
      </div>

      <div className="account-grid-layout">
        {/* Left Column: Farmer Registration Form */}
        <div className="account-form-col">
          <div className="card-farmer">
            <div className="card-farmer-header">
              <div className="card-header-icon green">
                <UserCheck size={22} />
              </div>
              <div>
                <h2 className="card-title-lg">ರೈತರ ನೋಂದಣಿ ಮತ್ತು ವೈಯಕ್ತಿಕ ವಿವರ</h2>
                <p className="card-subtitle-sm">ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಕೃಷಿ ಯೋಜನೆಗಳು ಮತ್ತು ಮಂಡಿ ವಹಿವಾಟಿಗೆ</p>
              </div>
            </div>

            <form onSubmit={handleSaveAccount}>
              <div className="form-group">
                <label className="form-label">{t.account.farmerName}</label>
                <input
                  type="text"
                  required
                  value={accountForm.farmer_name}
                  onChange={(e) => setAccountForm({ ...accountForm, farmer_name: e.target.value })}
                  className="form-input-lg"
                  placeholder="ಉದಾ: ಮಲ್ಲಿಕಾರ್ಜುನ ಗೌಡ"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">{t.account.mobile}</label>
                  <div className="input-with-prefix">
                    <span className="prefix">+91</span>
                    <input
                      type="tel"
                      required
                      value={accountForm.mobile}
                      onChange={(e) => setAccountForm({ ...accountForm, mobile: e.target.value })}
                      className="form-input-lg with-prefix"
                      placeholder="9845012345"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.account.farmerId}</label>
                  <input
                    type="text"
                    value={accountForm.farmer_id}
                    onChange={(e) => setAccountForm({ ...accountForm, farmer_id: e.target.value })}
                    className="form-input-lg"
                    placeholder="FID-KAR-2026-XXXX"
                  />
                </div>
              </div>

              {/* District & Location Selector */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">ಜಿಲ್ಲೆ (Karnataka District)</label>
                  <select
                    value={accountForm.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="form-select-lg"
                  >
                    {Object.keys(KARNATAKA_DISTRICT_COORDINATES).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist} ({KARNATAKA_DISTRICT_COORDINATES[dist].zone.split('(')[0].trim()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.account.taluk}</label>
                  <input
                    type="text"
                    value={accountForm.taluk}
                    onChange={(e) => setAccountForm({ ...accountForm, taluk: e.target.value })}
                    className="form-input-lg"
                    placeholder="ಉದಾ: ಶ್ರೀನಿವಾಸಪುರ"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">{t.account.village}</label>
                  <input
                    type="text"
                    value={accountForm.village}
                    onChange={(e) => setAccountForm({ ...accountForm, village: e.target.value })}
                    className="form-input-lg"
                    placeholder="ಉದಾ: ರಾಯಲ್ಪಾಡು"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.account.surveyNo}</label>
                  <input
                    type="text"
                    value={accountForm.survey_number}
                    onChange={(e) => setAccountForm({ ...accountForm, survey_number: e.target.value })}
                    className="form-input-lg"
                    placeholder="ಉದಾ: 142/2B"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">ಪಹಣಿ (RTC) ಸಂಖ್ಯೆ</label>
                  <input
                    type="text"
                    value={accountForm.rtc_number}
                    onChange={(e) => setAccountForm({ ...accountForm, rtc_number: e.target.value })}
                    className="form-input-lg"
                    placeholder="RTC-KLR-2025-XXXX"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.profile.landArea} ({t.profile.acres})</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={accountForm.land_area_acres}
                    onChange={(e) => setAccountForm({ ...accountForm, land_area_acres: parseFloat(e.target.value) || 1 })}
                    className="form-input-lg"
                    placeholder="2.5"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">{t.profile.soilType}</label>
                  <select
                    value={accountForm.soil_type}
                    onChange={(e) => setAccountForm({ ...accountForm, soil_type: e.target.value })}
                    className="form-select-lg"
                  >
                    <option value="red_sandy_loam">ಕೆಂಪು ಮರಳು ಮಿಶ್ರಿತ ಮಣ್ಣು (Red Sandy Loam)</option>
                    <option value="black_cotton">ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು (Black Cotton)</option>
                    <option value="alluvial">ಮೆಕ್ಕಲು ಮಣ್ಣು (Alluvial)</option>
                    <option value="laterite">ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು (Laterite)</option>
                    <option value="clay_loam">ಜೇಡಿ ಮಣ್ಣು (Clay Loam)</option>
                    <option value="sandy">ಮರಳು ಮಣ್ಣು (Sandy)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.profile.soilPh}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="4.0"
                    max="9.5"
                    value={accountForm.soil_ph}
                    onChange={(e) => setAccountForm({ ...accountForm, soil_ph: parseFloat(e.target.value) || 6.5 })}
                    className="form-input-lg"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">{t.profile.waterAvailability}</label>
                  <select
                    value={accountForm.water_availability}
                    onChange={(e) => setAccountForm({ ...accountForm, water_availability: e.target.value as any })}
                    className="form-select-lg"
                  >
                    <option value="limited">ಕಡಿಮೆ / ಮಧ್ಯಮ (Seasonal Borewell / Tank)</option>
                    <option value="reliable">ಸಾಕಷ್ಟು (Perennial Borewell / Canal)</option>
                    <option value="rainfed">ಮಳೆಯಾಶ್ರಿತ ಮಾತ್ರ (Rainfed Only)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.profile.season}</label>
                  <select
                    value={accountForm.season}
                    onChange={(e) => setAccountForm({ ...accountForm, season: e.target.value as any })}
                    className="form-select-lg"
                  >
                    <option value="kharif">ಮುಂಗಾರು (Kharif - Monsoon)</option>
                    <option value="rabi">ಹಿಂಗಾರು (Rabi - Winter)</option>
                    <option value="summer">ಬೇಸಿಗೆ (Summer)</option>
                  </select>
                </div>
              </div>

              <div className="form-submit-row-stacked">
                <button
                  type="button"
                  onClick={handleSaveAndStartRecommendations}
                  className="btn-farmer-primary-cta"
                >
                  <TrendingUp size={20} />
                  <span>ಸೇವ್ ಮಾಡಿ & ಸ್ಥಳ ಆಧಾರಿತ ಶಿಫಾರಸು ಪಡೆಯಿರಿ (Save & Start Recommendations)</span>
                  <ArrowRight size={18} />
                </button>

                <button type="submit" className="btn-save-profile">
                  <CheckCircle2 size={18} />
                  <span>{t.account.saveAccountBtn}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Context Card */}
          <div className="card-farmer zone-info-card">
            <div className="zone-info-header">
              <Layers size={20} className="text-primary" />
              <div>
                <strong>ಕೃಷಿ-ಹವಾಮಾನ ವಲಯ: {KARNATAKA_DISTRICT_COORDINATES[accountForm.district]?.zone || profile.agro_climatic_zone}</strong>
                <p>ಜಿಲ್ಲೆ: {accountForm.district} • ವಿಸ್ತೀರ್ಣ: {accountForm.land_area_acres} ಎಕರೆ • ಮಣ್ಣು: {t.profile.soils[accountForm.soil_type as keyof typeof t.profile.soils] || accountForm.soil_type}</p>
              </div>
            </div>
            <div className="zone-action-btn">
              <Link to="/recommendations" className="btn-farmer-primary full-width">
                <TrendingUp size={16} />
                <span>ಈ ಸ್ಥಳದ ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ನೋಡಿ (View Crop Recommendations) →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Farm Document Vault */}
        <div className="account-docs-col">
          <div className="card-farmer">
            <div className="card-farmer-header">
              <div className="card-header-icon blue">
                <FileText size={22} />
              </div>
              <div>
                <h2 className="card-title-lg">{t.account.documentsTitle}</h2>
                <p className="card-subtitle-sm">{t.account.documentsSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDocForm(!showDocForm)}
                className="btn-farmer-outline"
                style={{ marginLeft: 'auto' }}
              >
                <Plus size={16} />
                <span>{t.account.addDocBtn}</span>
              </button>
            </div>

            {/* Add Document Form (Collapsible) */}
            {showDocForm && (
              <form onSubmit={handleAddDoc} className="add-doc-card">
                <h3 className="add-doc-title">ಹೊಸ ಕೃಷಿ ದಾಖಲೆ ಸೇರಿಸಿ (Attach Project Document)</h3>

                <div className="form-group">
                  <label className="form-label">{t.account.docName}</label>
                  <input
                    type="text"
                    required
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                    className="form-input-lg"
                    placeholder="ಉದಾ: ಪಹಣಿ ದಾಖಲೆ - ಸರ್ವೆ ನಂ 142/2B"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">{t.account.docType}</label>
                    <select
                      value={newDoc.type}
                      onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                      className="form-select-lg"
                    >
                      <option value="RTC">ಆರ್.ಟಿ.ಸಿ / ಪಹಣಿ (Land RTC)</option>
                      <option value="SHC">ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ (Soil Health Card)</option>
                      <option value="WATER">ಕೊಳವೆಬಾವಿ / ನೀರಿನ ಸೌಲಭ್ಯ ಪತ್ರ</option>
                      <option value="KCC">ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ / ಬ್ಯಾಂಕ್ ದಾಖಲೆ</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.account.docNumber}</label>
                    <input
                      type="text"
                      required
                      value={newDoc.docNumber}
                      onChange={(e) => setNewDoc({ ...newDoc, docNumber: e.target.value })}
                      className="form-input-lg"
                      placeholder="ದಾಖಲೆ ಸಂಖ್ಯೆ (RTC/SHC No)"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.account.uploadDoc}</label>
                  <div className="file-drop-area">
                    <Upload size={22} className="text-muted" />
                    <span>ದಾಖಲೆ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ (PDF ಅಥವಾ ಚಿತ್ರ)</span>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewDoc({
                            ...newDoc,
                            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB ${file.name.split('.').pop()?.toUpperCase() || 'FILE'}`,
                          });
                        }
                      }}
                      className="file-hidden-input"
                    />
                  </div>
                </div>

                <div className="form-submit-row">
                  <button type="submit" className="btn-farmer-primary">
                    <FileCheck size={16} />
                    <span>ದಾಖಲೆಯನ್ನು ಸೇವ್ ಮಾಡಿ (Save Document)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDocForm(false)}
                    className="btn-farmer-outline"
                  >
                    ರದ್ದುಮಾಡಿ
                  </button>
                </div>
              </form>
            )}

            {/* Attached Documents List */}
            <div className="doc-vault-list">
              {profile.documents.length === 0 ? (
                <div className="empty-docs-box">
                  <FileText size={32} className="text-muted" />
                  <p>ಯಾವುದೇ ದಾಖಲೆಗಳು ಇನ್ನೂ ಲಗತ್ತಿಸಿಲ್ಲ. ಪಹಣಿ ಅಥವಾ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಕಾರ್ಡ್ ಸೇರಿಸಿ.</p>
                </div>
              ) : (
                profile.documents.map((doc) => (
                  <div key={doc.id} className="doc-item-card">
                    <div className="doc-item-left">
                      <div className="doc-icon-badge">
                        <FileCheck size={20} className="text-primary" />
                      </div>
                      <div className="doc-item-info">
                        <div className="doc-name-row">
                          <strong className="doc-title">{doc.name}</strong>
                          <span className="verified-badge">● ದೃಢೀಕರಿಸಲಾಗಿದೆ</span>
                        </div>
                        <div className="doc-meta-row">
                          <span>ಸಂಖ್ಯೆ: <strong>{doc.docNumber}</strong></span>
                          <span>•</span>
                          <span>ದಿನಾಂಕ: {doc.dateAdded}</span>
                          <span>•</span>
                          <span>ಗಾತ್ರ: {doc.fileSize || '1 MB'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="doc-item-actions">
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="btn-trash"
                        title="ದಾಖಲೆ ತೆಗೆದುಹಾಕಿ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="doc-vault-footer">
              <ShieldCheck size={16} className="text-primary" />
              <span>ದಾಖಲೆಗಳಲ್ಲಿರುವ ಮಣ್ಣಿನ ಪಿ.ಹೆಚ್ ಮತ್ತು ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣವನ್ನು ಕೃಷಿ ಶಿಫಾರಸುಗಳಲ್ಲಿ ನೇರವಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerAccount;
