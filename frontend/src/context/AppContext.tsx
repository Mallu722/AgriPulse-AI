import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Language, translations, Translations } from '../i18n/translations';

export interface FarmDocument {
  id: string;
  name: string;
  type: string;       // 'RTC' | 'SHC' | 'WATER' | 'OTHER'
  docNumber: string;
  dateAdded: string;
  verified: boolean;
  fileSize?: string;
}

export interface FarmerProfileData {
  farmer_id: string;
  farmer_name: string;
  mobile: string;
  district: string;
  taluk: string;
  village: string;
  state: string;
  land_area_acres: number;
  soil_type: string;
  soil_ph: number;
  irrigation_source: string;
  water_availability: 'rainfed' | 'limited' | 'reliable';
  season: 'kharif' | 'rabi' | 'summer' | 'all_season';
  capital_budget_inr: number;
  risk_preference: 'low' | 'moderate' | 'high';
  survey_number: string;
  rtc_number: string;
  agro_climatic_zone: string;
  documents: FarmDocument[];
}

export interface WeatherData {
  provider: string;
  provider_status?: string;
  is_live: boolean;
  is_stale: boolean;
  district: string;
  latitude?: number;
  longitude?: number;
  retrieval_timestamp?: string;
  cache_valid_until?: string;
  current: {
    observation_time?: string;
    temperature_c: number;
    relative_humidity_pct: number;
    precipitation_mm: number;
    weather_code: number;
    weather_description: string;
    wind_speed_kmh: number;
  };
  daily_forecast: Array<{
    forecast_date: string;
    temp_max_c: number;
    temp_min_c: number;
    precipitation_sum_mm: number;
    precipitation_probability_pct: number;
    advisory_tag: string;
  }>;
  operational_advisories?: Array<{
    category: string;
    level: string;
    headline: string;
    headline_kannada?: string;
    recommendation: string;
    scientific_basis: string;
  }>;
  raw_source_attribution?: string;
  scope_disclaimer?: string;
}

export interface MandiSummary {
  dataset_name: string;
  total_records: number;
  date_range: {
    start: string;
    end: string;
    calendar_days: number;
  };
  commodities: string[];
  markets: string[];
  quality_health: {
    exact_duplicates: number;
    inverted_price_ranges: number;
    outliers_flagged: number;
  };
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  components: {
    database: string;
    llm_service: string;
    weather_service: string;
    market_data: string;
    speech_service: string;
  };
}

export const KARNATAKA_DISTRICT_COORDINATES: Record<string, { lat: number; lng: number; zone: string }> = {
  'Kolar': { lat: 13.1358, lng: 78.1329, zone: 'Eastern Dry Zone (Zone 5)' },
  'Bengaluru Rural': { lat: 13.2846, lng: 77.5684, zone: 'Eastern Dry Zone (Zone 5)' },
  'Bengaluru Urban': { lat: 12.9716, lng: 77.5946, zone: 'Eastern Dry Zone (Zone 5)' },
  'Chikkaballapur': { lat: 13.4355, lng: 77.7275, zone: 'Eastern Dry Zone (Zone 5)' },
  'Tumakuru': { lat: 13.3392, lng: 77.1015, zone: 'Central Dry Zone (Zone 4)' },
  'Mandya': { lat: 12.5226, lng: 76.8976, zone: 'Southern Dry Zone (Zone 6)' },
  'Mysuru': { lat: 12.2958, lng: 76.6394, zone: 'Southern Transition Zone (Zone 7)' },
  'Chitradurga': { lat: 14.2251, lng: 76.3980, zone: 'Central Dry Zone (Zone 4)' },
  'Davanagere': { lat: 14.4644, lng: 75.9218, zone: 'Central Dry Zone (Zone 4)' },
  'Shivamogga': { lat: 13.9299, lng: 75.5681, zone: 'Southern Transition Zone (Zone 7)' },
  'Hassan': { lat: 13.0033, lng: 76.1004, zone: 'Southern Transition Zone (Zone 7)' },
  'Haveri': { lat: 14.7952, lng: 75.3991, zone: 'Northern Transition Zone (Zone 8)' },
  'Dharwad': { lat: 15.4589, lng: 75.0078, zone: 'Northern Transition Zone (Zone 8)' },
  'Belagavi': { lat: 15.8497, lng: 74.4977, zone: 'Northern Transition Zone (Zone 8)' },
  'Bagalkot': { lat: 16.1817, lng: 75.6958, zone: 'Northern Dry Zone (Zone 3)' },
  'Gadag': { lat: 15.4319, lng: 75.6355, zone: 'Northern Dry Zone (Zone 3)' },
  'Ballari': { lat: 15.1394, lng: 76.9214, zone: 'North Eastern Dry Zone (Zone 2)' },
  'Raichur': { lat: 16.2076, lng: 77.3463, zone: 'North Eastern Dry Zone (Zone 2)' },
  'Koppal': { lat: 15.3456, lng: 76.1553, zone: 'Northern Dry Zone (Zone 3)' },
  'Udupi': { lat: 13.3409, lng: 74.7421, zone: 'Coastal Zone (Zone 10)' },
};

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  profile: FarmerProfileData;
  updateProfile: (updates: Partial<FarmerProfileData>) => void;
  addDocument: (doc: Omit<FarmDocument, 'id' | 'dateAdded'>) => void;
  removeDocument: (id: string) => void;
  detectLocationViaGps: () => Promise<{ success: boolean; district?: string; message: string }>;
  apiBase: string;
  weather: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  fetchWeather: (district?: string, forceRefresh?: boolean) => Promise<void>;
  mandiSummary: MandiSummary | null;
  health: HealthResponse | null;
  backendOnline: boolean;
  latency: number | null;
  refetchHealth: () => Promise<void>;
}

const defaultProfile: FarmerProfileData = {
  farmer_id: 'FID-KAR-2026-8941',
  farmer_name: 'ಮಲ್ಲಿಕಾರ್ಜುನ (Mallikarjun Gowda)',
  mobile: '9845012345',
  district: 'Kolar',
  taluk: 'Srinivaspur',
  village: 'Rayalpadu',
  state: 'Karnataka',
  land_area_acres: 2.5,
  soil_type: 'red_sandy_loam',
  soil_ph: 6.8,
  irrigation_source: 'borewell',
  water_availability: 'limited',
  season: 'kharif',
  capital_budget_inr: 85000,
  risk_preference: 'moderate',
  survey_number: '142/2B',
  rtc_number: 'RTC-KLR-2025-0988',
  agro_climatic_zone: 'Eastern Dry Zone (Zone 5)',
  documents: [
    {
      id: 'doc-1',
      name: 'ಪಹಣಿ / ಆರ್.ಟಿ.ಸಿ (RTC Land Record - Survey 142/2B)',
      type: 'RTC',
      docNumber: 'RTC-KLR-2025-0988',
      dateAdded: '2026-10-15',
      verified: true,
      fileSize: '1.2 MB PDF',
    },
    {
      id: 'doc-2',
      name: 'ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ (Soil Health Card - KVK Kolar)',
      type: 'SHC',
      docNumber: 'SHC-2025-8831',
      dateAdded: '2026-10-18',
      verified: true,
      fileSize: '840 KB PDF',
    },
  ],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('agripulse_lang');
    return saved === 'en' ? 'en' : 'kn';
  });

  const [profile, setProfileState] = useState<FarmerProfileData>(() => {
    const saved = localStorage.getItem('agripulse_farmer_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultProfile, ...parsed };
      } catch {
        return defaultProfile;
      }
    }
    return defaultProfile;
  });

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [mandiSummary, setMandiSummary] = useState<MandiSummary | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [latency, setLatency] = useState<number | null>(null);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agripulse_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'kn' ? 'en' : 'kn');
  };

  const updateProfile = (updates: Partial<FarmerProfileData>) => {
    setProfileState((prev) => {
      const updated = { ...prev, ...updates };
      // Update zone if district changed
      if (updates.district && KARNATAKA_DISTRICT_COORDINATES[updates.district]) {
        updated.agro_climatic_zone = KARNATAKA_DISTRICT_COORDINATES[updates.district].zone;
      }
      localStorage.setItem('agripulse_farmer_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const addDocument = (doc: Omit<FarmDocument, 'id' | 'dateAdded'>) => {
    const newDoc: FarmDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
      verified: true,
      fileSize: doc.fileSize || '950 KB PDF',
    };
    updateProfile({ documents: [...profile.documents, newDoc] });
  };

  const removeDocument = (id: string) => {
    updateProfile({ documents: profile.documents.filter((d) => d.id !== id) });
  };

  const detectLocationViaGps = (): Promise<{ success: boolean; district?: string; message: string }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ success: false, message: 'Geolocation is not supported by your browser.' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Find nearest Karnataka district by minimum distance
          let nearestDistrict = 'Kolar';
          let minDistance = Number.MAX_VALUE;

          for (const [distName, coords] of Object.entries(KARNATAKA_DISTRICT_COORDINATES)) {
            const d = Math.hypot(coords.lat - userLat, coords.lng - userLng);
            if (d < minDistance) {
              minDistance = d;
              nearestDistrict = distName;
            }
          }

          const zone = KARNATAKA_DISTRICT_COORDINATES[nearestDistrict]?.zone || 'Karnataka Agro Zone';
          updateProfile({
            district: nearestDistrict,
            agro_climatic_zone: zone,
          });
          fetchWeather(nearestDistrict, true);

          resolve({
            success: true,
            district: nearestDistrict,
            message: `Detected coordinates (${userLat.toFixed(2)}, ${userLng.toFixed(2)}) matched to ${nearestDistrict} (${zone})`,
          });
        },
        (error) => {
          resolve({ success: false, message: `GPS error: ${error.message}. Please select district manually.` });
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  };

  const fetchWeather = useCallback(
    async (districtName?: string, forceRefresh: boolean = false) => {
      const districtToFetch = districtName || profile.district;
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const url = `${apiBase}/weather/district/${encodeURIComponent(districtToFetch)}${
          forceRefresh ? '?force_refresh=true' : ''
        }`;
        const res = await axios.get<WeatherData>(url, { timeout: 7000 });
        setWeather(res.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setWeatherError(err.response?.data?.detail || err.message);
        } else {
          setWeatherError('Failed to fetch weather forecast');
        }
      } finally {
        setWeatherLoading(false);
      }
    },
    [apiBase, profile.district]
  );

  const refetchHealth = useCallback(async () => {
    const start = performance.now();
    try {
      const [hRes, mRes] = await Promise.all([
        axios.get<HealthResponse>(`${apiBase}/health`, { timeout: 3500 }),
        axios.get<MandiSummary>(`${apiBase}/ingestion/mandi/summary`, { timeout: 3500 }).catch(() => null),
      ]);
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealth(hRes.data);
      setBackendOnline(hRes.data.status === 'healthy');
      if (mRes) {
        setMandiSummary(mRes.data);
      }
    } catch {
      setBackendOnline(false);
      setLatency(null);
    }
  }, [apiBase]);

  useEffect(() => {
    refetchHealth();
    fetchWeather(profile.district);
    const interval = setInterval(refetchHealth, 20000);
    return () => clearInterval(interval);
  }, [refetchHealth, fetchWeather, profile.district]);

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        profile,
        updateProfile,
        addDocument,
        removeDocument,
        detectLocationViaGps,
        apiBase,
        weather,
        weatherLoading,
        weatherError,
        fetchWeather,
        mandiSummary,
        health,
        backendOnline,
        latency,
        refetchHealth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
