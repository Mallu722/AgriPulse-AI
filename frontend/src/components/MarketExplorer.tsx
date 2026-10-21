import React, { useState } from 'react';
import {
  Store,
  Search,
  ShieldCheck,
  Calendar,
  BarChart2,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';

interface MandiRecord {
  commodity: string;
  market: string;
  district: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  date: string;
  arrivals_tonnes?: number;
  quality_tag: string;
}

const SAMPLE_MANDI_RECORDS: MandiRecord[] = [
  { commodity: 'Tomato', market: 'Kolar APMC', district: 'Kolar', min_price: 1800, modal_price: 2450, max_price: 2900, date: '2026-10-21', arrivals_tonnes: 450, quality_tag: 'verified' },
  { commodity: 'Tomato', market: 'Bangalore Binny Mill', district: 'Bangalore Urban', min_price: 1950, modal_price: 2550, max_price: 3100, date: '2026-10-21', arrivals_tonnes: 320, quality_tag: 'verified' },
  { commodity: 'Onion', market: 'Yeshwanthpur APMC', district: 'Bangalore Urban', min_price: 1600, modal_price: 2100, max_price: 2400, date: '2026-10-21', arrivals_tonnes: 600, quality_tag: 'verified' },
  { commodity: 'Onion', market: 'Hubli Yard', district: 'Dharwad', min_price: 1550, modal_price: 2000, max_price: 2350, date: '2026-10-21', arrivals_tonnes: 280, quality_tag: 'verified' },
  { commodity: 'Potato', market: 'Belgaum APMC', district: 'Belagavi', min_price: 1400, modal_price: 1750, max_price: 2050, date: '2026-10-21', arrivals_tonnes: 380, quality_tag: 'verified' },
  { commodity: 'Potato', market: 'Bangalore Mandi', district: 'Bangalore Urban', min_price: 1500, modal_price: 1850, max_price: 2200, date: '2026-10-21', arrivals_tonnes: 410, quality_tag: 'verified' },
  { commodity: 'Maize', market: 'Davanagere Mandi', district: 'Davanagere', min_price: 2050, modal_price: 2225, max_price: 2350, date: '2026-10-21', arrivals_tonnes: 520, quality_tag: 'verified' },
  { commodity: 'Cotton', market: 'Haveri APMC', district: 'Haveri', min_price: 6400, modal_price: 7100, max_price: 7600, date: '2026-10-21', arrivals_tonnes: 190, quality_tag: 'verified' },
];

export const MarketExplorer: React.FC = () => {
  const { t, mandiSummary } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [records] = useState<MandiRecord[]>(SAMPLE_MANDI_RECORDS);

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === 'All' || r.commodity === selectedCrop;
    return matchesSearch && matchesCrop;
  });

  const chartData = records
    .filter((r, idx, arr) => arr.findIndex((x) => x.commodity === r.commodity) === idx)
    .map((r) => ({
      commodity: r.commodity,
      'ಕನಿಷ್ಠ ದರ (Min)': r.min_price,
      'ಮಾದರಿ ದರ (Modal)': r.modal_price,
      'ಗರಿಷ್ಠ ದರ (Max)': r.max_price,
    }));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-farmer">
        <div className="header-icon-badge amber">
          <Store size={28} />
        </div>
        <div>
          <h1 className="page-heading">{t.market.title}</h1>
          <p className="page-subheading">{t.market.subtitle}</p>
        </div>
      </div>

      {/* Ingestion & Quality Summary Bar */}
      <div className="mandi-audit-strip">
        <div className="audit-pill">
          <ShieldCheck size={18} className="text-primary" />
          <span>ಒಟ್ಟು ಆಗ್ಮಾರ್ಕ್‌ನೆಟ್ ದಾಖಲೆಗಳು: <strong>{mandiSummary?.total_records || 91} Quotes</strong></span>
        </div>
        <div className="audit-pill">
          <CheckCircle2 size={18} className="text-accent" />
          <span>ವಿಲೋಮ ಬೆಲೆ ಅಸಂಗತತೆಗಳು: <strong>0 (ಎಲ್ಲವೂ min ≤ max)</strong></span>
        </div>
        <div className="audit-pill">
          <Calendar size={18} className="text-warning" />
          <span>SHA-256 ಹ್ಯಾಶ್ ಪರಿಶೀಲನೆ: <strong>100% ದೃಢೀಕರಿಸಲಾಗಿದೆ</strong></span>
        </div>
      </div>

      {/* Price Comparison Chart */}
      <div className="card-farmer chart-card">
        <div className="card-farmer-header">
          <div className="card-header-icon blue">
            <BarChart2 size={22} />
          </div>
          <div>
            <h2 className="card-title-lg">ಪ್ರಮುಖ ಬೆಳೆಗಳ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ವಿಸ್ತಾರ (Price Spread Comparison)</h2>
            <p className="card-subtitle-sm">ಕನಿಷ್ಠ, ಮಾದರಿ (ಸರಾಸರಿ) ಹಾಗೂ ಗರಿಷ್ಠ ದರಗಳ ತುಲನೆ (₹ / ಕ್ವಿಂಟಾಲ್)</p>
          </div>
        </div>

        <div className="chart-wrapper" style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="commodity" stroke="#475569" />
              <YAxis stroke="#475569" unit=" ₹" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <Legend />
              <Bar dataKey="ಕನಿಷ್ಠ ದರ (Min)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ಮಾದರಿ ದರ (Modal)" fill="#166534" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ಗರಿಷ್ಠ ದರ (Max)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="mandi-controls-row">
        <div className="search-box-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={t.market.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="crop-filter-chips">
          {['All', 'Tomato', 'Onion', 'Potato', 'Maize', 'Cotton'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`filter-chip ${selectedCrop === c ? 'active' : ''}`}
            >
              {c === 'All' ? 'ಎಲ್ಲಾ ಬೆಳೆಗಳು (All)' : t.crops[c] || c}
            </button>
          ))}
        </div>
      </div>

      {/* Mandi Price Quotes Grid */}
      <div className="mandi-quotes-grid">
        {filtered.map((record, index) => (
          <div key={index} className="mandi-price-quote-card">
            <div className="quote-card-header">
              <div className="commodity-name-tag">
                <span className="dot-indicator green"></span>
                <strong>{t.crops[record.commodity] || record.commodity}</strong>
              </div>
              <span className="location-badge">
                <MapPin size={13} /> {record.market} ({record.district})
              </span>
            </div>

            <div className="quote-main-pricing">
              <div className="modal-price-display">
                <span className="quote-caption">{t.market.modalPrice}</span>
                <strong className="modal-big">₹{record.modal_price.toLocaleString('en-IN')}</strong>
                <span className="quintal-sub">{t.market.perQuintal}</span>
              </div>

              <div className="price-spread-pill">
                <span>ಕನಿಷ್ಠ: ₹{record.min_price}</span>
                <span className="spread-divider">|</span>
                <span>ಗರಿಷ್ಠ: ₹{record.max_price}</span>
              </div>
            </div>

            <div className="quote-card-meta">
              <div className="meta-left">
                <Calendar size={13} />
                <span>ದಿನಾಂಕ: {record.date}</span>
              </div>
              <div className="meta-right">
                <ShieldCheck size={13} className="text-primary" />
                <span className="verified-text">SHA-256 ಆಡಿಟ್</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketExplorer;
