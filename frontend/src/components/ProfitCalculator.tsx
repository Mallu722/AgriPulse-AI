import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calculator,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CostBreakdown {
  labour: number;
  seeds: number;
  fertilisers: number;
  irrigation: number;
  machinery_hire: number;
  harvesting: number;
  transport_packaging: number;
}

const DEFAULT_COSTS_PER_ACRE: Record<string, CostBreakdown> = {
  Tomato: {
    labour: 38000,
    seeds: 18000,
    fertilisers: 22000,
    irrigation: 6000,
    machinery_hire: 8000,
    harvesting: 16000,
    transport_packaging: 12000,
  },
  Onion: {
    labour: 22000,
    seeds: 9000,
    fertilisers: 14000,
    irrigation: 4500,
    machinery_hire: 6500,
    harvesting: 9000,
    transport_packaging: 7000,
  },
  Potato: {
    labour: 25000,
    seeds: 28000,
    fertilisers: 18000,
    irrigation: 5000,
    machinery_hire: 7500,
    harvesting: 11000,
    transport_packaging: 8500,
  },
  Maize: {
    labour: 11000,
    seeds: 4200,
    fertilisers: 8500,
    irrigation: 2500,
    machinery_hire: 5200,
    harvesting: 4800,
    transport_packaging: 3800,
  },
  Cotton: {
    labour: 24000,
    seeds: 5500,
    fertilisers: 12000,
    irrigation: 3500,
    machinery_hire: 6000,
    harvesting: 13000,
    transport_packaging: 5000,
  },
};

const DEFAULT_YIELDS: Record<string, { qtl_per_acre: number; p25_price: number; median_price: number; p75_price: number }> = {
  Tomato: { qtl_per_acre: 140, p25_price: 1800, median_price: 2450, p75_price: 2900 },
  Onion: { qtl_per_acre: 75, p25_price: 1600, median_price: 2100, p75_price: 2400 },
  Potato: { qtl_per_acre: 110, p25_price: 1400, median_price: 1750, p75_price: 2050 },
  Maize: { qtl_per_acre: 28, p25_price: 2050, median_price: 2225, p75_price: 2350 },
  Cotton: { qtl_per_acre: 14, p25_price: 6400, median_price: 7100, p75_price: 7600 },
};

export const ProfitCalculator: React.FC = () => {
  const { t, profile } = useApp();
  const [searchParams] = useSearchParams();

  const queryCrop = searchParams.get('crop');
  const [selectedCrop, setSelectedCrop] = useState<string>(
    queryCrop && DEFAULT_COSTS_PER_ACRE[queryCrop] ? queryCrop : 'Tomato'
  );

  const [costs, setCosts] = useState<CostBreakdown>(
    DEFAULT_COSTS_PER_ACRE[selectedCrop] || DEFAULT_COSTS_PER_ACRE.Tomato
  );

  const [selectedScenario, setSelectedScenario] = useState<'p25' | 'median' | 'p75'>('median');

  // Handle crop change
  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop);
    setCosts(DEFAULT_COSTS_PER_ACRE[crop] || DEFAULT_COSTS_PER_ACRE.Tomato);
  };

  const handleReset = () => {
    setCosts(DEFAULT_COSTS_PER_ACRE[selectedCrop] || DEFAULT_COSTS_PER_ACRE.Tomato);
  };

  const handleCostChange = (field: keyof CostBreakdown, value: number) => {
    setCosts((prev) => ({
      ...prev,
      [field]: Math.max(0, value),
    }));
  };

  // Unit Economics calculations
  const totalCostPerAcre =
    costs.labour +
    costs.seeds +
    costs.fertilisers +
    costs.irrigation +
    costs.machinery_hire +
    costs.harvesting +
    costs.transport_packaging;

  const totalFarmCost = totalCostPerAcre * profile.land_area_acres;

  const yieldData = DEFAULT_YIELDS[selectedCrop] || DEFAULT_YIELDS.Tomato;
  const activePrice =
    selectedScenario === 'p25'
      ? yieldData.p25_price
      : selectedScenario === 'median'
      ? yieldData.median_price
      : yieldData.p75_price;

  const totalProductionQtl = yieldData.qtl_per_acre * profile.land_area_acres;
  const grossRevenue = totalProductionQtl * activePrice;
  const netProfit = grossRevenue - totalFarmCost;
  const netProfitPerAcre = netProfit / profile.land_area_acres;
  const roiPct = Math.round((netProfit / totalFarmCost) * 100);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-farmer">
        <div className="header-icon-badge">
          <Calculator size={28} />
        </div>
        <div>
          <h1 className="page-heading">{t.profit.title}</h1>
          <p className="page-subheading">{t.profit.subtitle}</p>
        </div>
      </div>

      {/* Formula Card */}
      <div className="formula-banner">
        <Sparkles size={20} className="text-primary" />
        <div className="formula-text">
          <strong>{t.profit.formulaTitle}:</strong>
          <p>{t.profit.formulaText}</p>
        </div>
      </div>

      {/* Crop Selector Strip */}
      <div className="profit-crop-selector">
        <span className="selector-title">{t.profit.selectCrop}:</span>
        <div className="crop-button-group">
          {Object.keys(DEFAULT_COSTS_PER_ACRE).map((c) => (
            <button
              key={c}
              onClick={() => handleCropChange(c)}
              className={`crop-select-pill ${selectedCrop === c ? 'active' : ''}`}
            >
              {t.crops[c] || c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Price Scenarios & Real-Time Calculation Results */}
      <div className="profit-dashboard-grid">
        {/* Left Card: 3 Quantile Scenarios & Net Returns */}
        <div className="card-farmer results-card-hero">
          <h2 className="card-title-lg">
            {t.profit.scenariosTitle} ({profile.land_area_acres} {t.profile.acres})
          </h2>
          <p className="card-subtitle-sm">ಮಂಡಿ ಬೆಲೆ ಏರಿಳಿತದ ಆಧಾರದ ಮೇಲೆ 3 ವಾಸ್ತವಿಕ ಸನ್ನಿವೇಶಗಳು</p>

          <div className="scenario-switcher">
            <button
              onClick={() => setSelectedScenario('p25')}
              className={`scenario-btn ${selectedScenario === 'p25' ? 'active' : ''}`}
            >
              <span className="scen-badge">P25</span>
              <span className="scen-title">{t.profit.conservative}</span>
              <strong className="scen-price">₹{yieldData.p25_price}/qtl</strong>
            </button>

            <button
              onClick={() => setSelectedScenario('median')}
              className={`scenario-btn ${selectedScenario === 'median' ? 'active' : ''}`}
            >
              <span className="scen-badge median">P50</span>
              <span className="scen-title">{t.profit.expected}</span>
              <strong className="scen-price">₹{yieldData.median_price}/qtl</strong>
            </button>

            <button
              onClick={() => setSelectedScenario('p75')}
              className={`scenario-btn ${selectedScenario === 'p75' ? 'active' : ''}`}
            >
              <span className="scen-badge optimistic">P75</span>
              <span className="scen-title">{t.profit.optimistic}</span>
              <strong className="scen-price">₹{yieldData.p75_price}/qtl</strong>
            </button>
          </div>

          {/* Primary Result Box */}
          <div className={`profit-result-box ${netProfit >= 0 ? 'positive' : 'negative'}`}>
            <span className="result-caption">{t.profit.netProfit} ({profile.land_area_acres} ಎಕರೆಗೆ)</span>
            <div className="result-main-number">
              ₹{Math.round(netProfit).toLocaleString('en-IN')}
            </div>
            <div className="result-sub-metrics">
              <div className="sub-metric-item">
                <span>{t.profit.netProfitPerAcre}:</span>
                <strong>₹{Math.round(netProfitPerAcre).toLocaleString('en-IN')}</strong>
              </div>
              <div className="sub-metric-item">
                <span>{t.profit.roi}:</span>
                <strong className={roiPct >= 0 ? 'text-primary' : 'text-danger'}>
                  {roiPct}%
                </strong>
              </div>
            </div>
          </div>

          <div className="profit-breakdown-table">
            <div className="table-row">
              <span>ಒಟ್ಟು ಉತ್ಪಾದನೆ (Total Production):</span>
              <strong>{totalProductionQtl} ಕ್ವಿಂಟಾಲ್ ({yieldData.qtl_per_acre} qtl/ಎಕರೆ)</strong>
            </div>
            <div className="table-row">
              <span>{t.profit.expectedRevenue}:</span>
              <strong>₹{Math.round(grossRevenue).toLocaleString('en-IN')}</strong>
            </div>
            <div className="table-row">
              <span>{t.profit.totalCost}:</span>
              <strong className="text-danger">- ₹{Math.round(totalFarmCost).toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Right Card: Farmer-Editable Cost Breakdown */}
        <div className="card-farmer cost-editor-card">
          <div className="card-farmer-header">
            <div>
              <h2 className="card-title-lg">{t.profit.costBreakdownTitle}</h2>
              <p className="card-subtitle-sm">{t.profit.costBreakdownSubtitle}</p>
            </div>
            <button
              onClick={handleReset}
              className="btn-farmer-outline"
              title="Reset to official DESAgri benchmarks"
            >
              <RotateCcw size={15} />
              <span>{t.profit.resetDefaults}</span>
            </button>
          </div>

          <div className="cost-inputs-list">
            <div className="cost-input-item">
              <label className="cost-label">{t.profit.labour}</label>
              <div className="input-with-currency">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  step="500"
                  value={costs.labour}
                  onChange={(e) => handleCostChange('labour', parseInt(e.target.value) || 0)}
                  className="cost-field"
                />
              </div>
            </div>

            <div className="cost-input-item">
              <label className="cost-label">{t.profit.seeds}</label>
              <div className="input-with-currency">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  step="500"
                  value={costs.seeds}
                  onChange={(e) => handleCostChange('seeds', parseInt(e.target.value) || 0)}
                  className="cost-field"
                />
              </div>
            </div>

            <div className="cost-input-item">
              <label className="cost-label">{t.profit.fertilisers}</label>
              <div className="input-with-currency">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  step="500"
                  value={costs.fertilisers}
                  onChange={(e) => handleCostChange('fertilisers', parseInt(e.target.value) || 0)}
                  className="cost-field"
                />
              </div>
            </div>

            <div className="cost-input-item">
              <label className="cost-label">{t.profit.tractor}</label>
              <div className="input-with-currency">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  step="500"
                  value={costs.machinery_hire}
                  onChange={(e) => handleCostChange('machinery_hire', parseInt(e.target.value) || 0)}
                  className="cost-field"
                />
              </div>
            </div>

            <div className="cost-input-item">
              <label className="cost-label">{t.profit.irrigation}</label>
              <div className="input-with-currency">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  step="500"
                  value={costs.irrigation}
                  onChange={(e) => handleCostChange('irrigation', parseInt(e.target.value) || 0)}
                  className="cost-field"
                />
              </div>
            </div>

            <div className="cost-input-item">
              <label className="cost-label">{t.profit.harvesting}</label>
              <div className="input-with-currency">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  step="500"
                  value={costs.harvesting}
                  onChange={(e) => handleCostChange('harvesting', parseInt(e.target.value) || 0)}
                  className="cost-field"
                />
              </div>
            </div>

            <div className="cost-input-item">
              <label className="cost-label">{t.profit.transport}</label>
              <div className="input-with-currency">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  step="500"
                  value={costs.transport_packaging}
                  onChange={(e) => handleCostChange('transport_packaging', parseInt(e.target.value) || 0)}
                  className="cost-field"
                />
              </div>
            </div>
          </div>

          <div className="total-cost-summary-box">
            <span>ಎಕರೆಗೆ ಒಟ್ಟು ಕೃಷಿ ವೆಚ್ಚ (Total Cost / Acre):</span>
            <strong className="total-cost-num">₹{totalCostPerAcre.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;
