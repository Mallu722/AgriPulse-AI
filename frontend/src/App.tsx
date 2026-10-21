import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FarmerProfile from './components/FarmerProfile';
import FarmerAccount from './components/FarmerAccount';
import CropRecommendations from './components/CropRecommendations';
import MarketExplorer from './components/MarketExplorer';
import ProfitCalculator from './components/ProfitCalculator';
import AiAssistant from './components/AiAssistant';

const AppContent: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content-area">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<FarmerProfile />} />
          <Route path="/account" element={<FarmerAccount />} />
          <Route path="/recommendations" element={<CropRecommendations />} />
          <Route path="/market" element={<MarketExplorer />} />
          <Route path="/profit" element={<ProfitCalculator />} />
          <Route path="/assistant" element={<AiAssistant />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <footer className="farmer-app-footer">
        <div className="footer-container">
          <div className="footer-left">
            <span className="footer-brand">AgriPulse AI • {t.tagline}</span>
            <p className="footer-copy">
              ಕರ್ನಾಟಕ ಕೃಷಿ ನಿರ್ಧಾರ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ • Open-Meteo, Agmarknet OGD Karnataka, ICAR Grounded.
            </p>
          </div>

          <div className="footer-links-group">
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="footer-nav-link"
            >
              ಫಾಸ್ಟ್‌ಎಪಿಐ ಸ್ವ್ಯಾಗರ್ (API Docs)
            </a>
            <a
              href="http://127.0.0.1:8000/api/v1/ingestion/quality-report"
              target="_blank"
              rel="noreferrer"
              className="footer-nav-link"
            >
              ಡೇಟಾ ಗುಣಮಟ್ಟ ವರದಿ (Quality Audit)
            </a>
            <a
              href="http://127.0.0.1:8000/api/v1/weather/providers"
              target="_blank"
              rel="noreferrer"
              className="footer-nav-link"
            >
              ಹವಾಮಾನ ಪರಿಶೀಲನೆ (Weather Status)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
