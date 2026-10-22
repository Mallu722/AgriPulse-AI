import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  TrendingUp,
  Store,
  Calculator,
  Languages,
  Menu,
  X,
  CloudSun,
  FileText,
  Bot,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { language, toggleLanguage, t, backendOnline, latency, weather } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="navbar-top-banner">
        <div className="nav-container banner-content">
          <div className="banner-left">
            <span className="badge-govt">ಕರ್ನಾಟಕ ಕೃಷಿ ನಿರ್ಧಾರ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ • Karnataka Precision Agriculture</span>
          </div>
          <div className="banner-right">
            {weather?.current && (
              <span className="weather-quick-pill">
                <CloudSun size={14} />
                <span>{weather.district}: {Math.round(weather.current.temperature_c ?? (weather.current as any).temperature_2m ?? 24)}°C • {weather.current.weather_description ?? (weather.current as any).weather_condition ?? 'Partly Cloudy'}</span>
              </span>
            )}
            <div className={`status-pill-small ${backendOnline ? 'online' : 'offline'}`}>
              <span className="status-dot"></span>
              <span>{backendOnline ? `API ${latency ? `(${latency}ms)` : 'Online'}` : 'Offline'}</span>
            </div>
            <button
              onClick={toggleLanguage}
              className="lang-toggle-btn"
              title="ಕನ್ನಡ / English ಬದಲಾಯಿಸಿ"
              aria-label="Toggle Language"
            >
              <Languages size={15} />
              <span className="lang-text-active">{language === 'kn' ? 'ಕನ್ನಡ' : 'English'}</span>
              <span className="lang-text-inactive">({language === 'kn' ? 'EN' : 'ಕನ್ನ'})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="navbar-main">
        <div className="nav-container main-nav-content">
          <NavLink to="/dashboard" className="brand-logo" onClick={closeMenu}>
            <div className="brand-icon-box">
              <img src="/agri-logo.svg" alt="AgriPulse AI Logo" className="brand-logo-img" />
            </div>
            <div className="brand-titles">
              <span className="brand-name">{t.appName}</span>
              <span className="brand-tagline">{t.tagline}</span>
            </div>
          </NavLink>

          <button
            className="mobile-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <LayoutDashboard size={18} />
              <span>{t.nav.dashboard}</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <UserCheck size={18} />
              <span>{t.nav.profile}</span>
            </NavLink>

            <NavLink
              to="/account"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <FileText size={18} />
              <span>{t.nav.account}</span>
            </NavLink>

            <NavLink
              to="/recommendations"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <TrendingUp size={18} />
              <span>{t.nav.recommendations}</span>
            </NavLink>

            <NavLink
              to="/market"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <Store size={18} />
              <span>{t.nav.market}</span>
            </NavLink>

            <NavLink
              to="/profit"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <Calculator size={18} />
              <span>{t.nav.profit}</span>
            </NavLink>

            <NavLink
              to="/assistant"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <Bot size={18} />
              <span>{t.nav.assistant}</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
