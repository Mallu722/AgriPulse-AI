export type Language = 'en' | 'kn';

export interface Translations {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    profile: string;
    account: string;
    recommendations: string;
    market: string;
    profit: string;
    assistant: string;
  };
  dashboard: {
    greeting: string;
    weatherTitle: string;
    weatherSubtitle: string;
    temp: string;
    humidity: string;
    wind: string;
    rainfall: string;
    source: string;
    cacheStatus: string;
    topCropsTitle: string;
    topCropsSubtitle: string;
    marketAlertsTitle: string;
    marketAlertsSubtitle: string;
    viewAllCrops: string;
    viewAllMarkets: string;
    score: string;
    expectedReturn: string;
    quickStats: string;
    activeDistrict: string;
    activeLand: string;
    activeSeason: string;
    systemOnline: string;
    systemOffline: string;
  };
  account: {
    title: string;
    subtitle: string;
    farmerName: string;
    mobile: string;
    farmerId: string;
    taluk: string;
    village: string;
    detectGps: string;
    detectingGps: string;
    gpsSuccess: string;
    gpsFailed: string;
    documentsTitle: string;
    documentsSubtitle: string;
    addDocBtn: string;
    docName: string;
    docType: string;
    docNumber: string;
    uploadDoc: string;
    fileSelected: string;
    statusVerified: string;
    surveyNo: string;
    rtcDoc: string;
    shcDoc: string;
    waterDoc: string;
    saveAccountBtn: string;
    accountSavedSuccess: string;
    totalDocs: string;
    zoneDetected: string;
  };
  profile: {
    title: string;
    subtitle: string;
    district: string;
    landArea: string;
    acres: string;
    soilType: string;
    soilPh: string;
    irrigationSource: string;
    waterAvailability: string;
    season: string;
    capitalBudget: string;
    saveBtn: string;
    savedSuccess: string;
    soils: {
      red_sandy_loam: string;
      black_cotton: string;
      alluvial: string;
      laterite: string;
      clay_loam: string;
      sandy: string;
      unknown: string;
    };
    irrigations: {
      borewell: string;
      canal: string;
      drip: string;
      rainfed: string;
    };
    waterLevels: {
      rainfed: string;
      limited: string;
      reliable: string;
    };
    seasons: {
      kharif: string;
      rabi: string;
      summer: string;
      all_season: string;
    };
  };
  recommendations: {
    title: string;
    subtitle: string;
    eligibleTab: string;
    disqualifiedTab: string;
    rank: string;
    crop: string;
    utilityScore: string;
    agronomyScore: string;
    economicsScore: string;
    waterScore: string;
    riskScore: string;
    duration: string;
    netReturn: string;
    calculateProfitBtn: string;
    disqualificationReason: string;
    weatherImpact: string;
    filterAll: string;
    refreshRecommendations: string;
    loading: string;
    noCropsFound: string;
    formulaDisclaimer: string;
  };
  market: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    commodity: string;
    marketYard: string;
    modalPrice: string;
    minMaxRange: string;
    freshness: string;
    lastUpdated: string;
    verifiedProvenance: string;
    totalArrivals: string;
    auditBadge: string;
    perQuintal: string;
  };
  profit: {
    title: string;
    subtitle: string;
    selectCrop: string;
    formulaTitle: string;
    formulaText: string;
    scenariosTitle: string;
    conservative: string;
    expected: string;
    optimistic: string;
    costBreakdownTitle: string;
    costBreakdownSubtitle: string;
    labour: string;
    seeds: string;
    fertilisers: string;
    irrigation: string;
    tractor: string;
    harvesting: string;
    transport: string;
    totalCost: string;
    expectedRevenue: string;
    netProfit: string;
    netProfitPerAcre: string;
    roi: string;
    recalculate: string;
    resetDefaults: string;
    customCostsNote: string;
  };
  crops: {
    [key: string]: string;
  };
  assistant: {
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    askBtn: string;
    asking: string;
    quickPromptsTitle: string;
    verifiedSourcesBadge: string;
    fallbackBadge: string;
    citationsTitle: string;
    assumptionsTitle: string;
    emptyChatPrompt: string;
    prompt1: string;
    prompt2: string;
    prompt3: string;
    prompt4: string;
    unsupportedDisclaimer: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "AgriPulse AI",
    tagline: "Smart farming decisions, explained simply",
    nav: {
      dashboard: "Dashboard",
      profile: "Farm Profile",
      account: "Farmer Account & Documents",
      recommendations: "Crop Recommendations",
      market: "Market Explorer",
      profit: "Profit Calculator",
      assistant: "AI Farm Assistant",
    },
    dashboard: {
      greeting: "Welcome, Farmer",
      weatherTitle: "Live Agro-Weather Outlook",
      weatherSubtitle: "Open-Meteo live observations with 7-day forecast",
      temp: "Temperature",
      humidity: "Humidity",
      wind: "Wind Speed",
      rainfall: "Precipitation",
      source: "Weather Source",
      cacheStatus: "Cache Status",
      topCropsTitle: "Top Ranked Crops for Your Farm",
      topCropsSubtitle: "Ranked by agronomic suitability, economics, and risk",
      marketAlertsTitle: "Karnataka APMC Mandi Spot Prices",
      marketAlertsSubtitle: "Verified official Agmarknet arrivals & price trends",
      viewAllCrops: "View All Crop Rankings",
      viewAllMarkets: "Open Market Explorer",
      score: "Utility Score",
      expectedReturn: "Expected Net Profit",
      quickStats: "Quick Farm Status",
      activeDistrict: "District",
      activeLand: "Land Area",
      activeSeason: "Active Season",
      systemOnline: "API Connected",
      systemOffline: "Backend Offline",
    },
    account: {
      title: "Farmer Account & Land Document Vault",
      subtitle: "Register your farm profile, auto-detect location, and link verified land/soil records",
      farmerName: "Farmer Full Name",
      mobile: "Mobile Number",
      farmerId: "Farmer Registration ID / FRUITS ID",
      taluk: "Taluk / Sub-District",
      village: "Village Name",
      detectGps: "📍 Auto-Detect My Location (GPS)",
      detectingGps: "Detecting Karnataka district via GPS...",
      gpsSuccess: "Location detected successfully!",
      gpsFailed: "Unable to detect GPS. Please select district manually.",
      documentsTitle: "Farm & Land Document Vault",
      documentsSubtitle: "Keep RTC / Pahani, Soil Health Cards, and water certificates attached to your farm profile",
      addDocBtn: "Add New Farm Document",
      docName: "Document Title / Description",
      docType: "Document Category",
      docNumber: "Document / Certificate Number",
      uploadDoc: "Upload Document (PDF / Image)",
      fileSelected: "File attached",
      statusVerified: "Verified Record",
      surveyNo: "Survey / Hissa Number",
      rtcDoc: "RTC / Pahani (Land Ownership)",
      shcDoc: "Soil Health Card (Govt Lab Test)",
      waterDoc: "Borewell / Irrigation Certificate",
      saveAccountBtn: "Save & Verify Account",
      accountSavedSuccess: "Farmer account and documents updated successfully!",
      totalDocs: "Attached Documents",
      zoneDetected: "Agro-Climatic Zone",
    },
    profile: {
      title: "Farmer Farm Profile",
      subtitle: "Customize your soil, water, and budget parameters to get tailored recommendations",
      district: "District (Karnataka)",
      landArea: "Land Area",
      acres: "Acres",
      soilType: "Soil Type",
      soilPh: "Soil pH (Acidity/Alkalinity)",
      irrigationSource: "Primary Irrigation Source",
      waterAvailability: "Water Availability Level",
      season: "Current Planting Season",
      capitalBudget: "Available Capital Budget (₹)",
      saveBtn: "Save Farm Profile",
      savedSuccess: "Profile saved successfully! Recommendations updated.",
      soils: {
        red_sandy_loam: "Red Sandy Loam (ಕೆಂಪು ಮಣ್ಣು)",
        black_cotton: "Black Cotton Soil (ಕಪ್ಪು ಮಣ್ಣು)",
        alluvial: "Alluvial Soil (ಮೆಕ್ಕಲು ಮಣ್ಣು)",
        laterite: "Laterite Soil (ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು)",
        clay_loam: "Clay Loam (ಜೇಡಿ ಮಣ್ಣು)",
        sandy: "Sandy Soil (ಮರಳು ಮಣ್ಣು)",
        unknown: "Unknown / Not Tested (ತಿಳಿದಿಲ್ಲ)",
      },
      irrigations: {
        borewell: "Borewell Irrigation",
        canal: "Canal / River Irrigation",
        drip: "Drip / Micro Irrigation",
        rainfed: "Rainfed Only (ಮಳೆಯಾಶ್ರಿತ)",
      },
      waterLevels: {
        rainfed: "Rainfed Only (ಮಳೆಯಾಶ್ರಿತ - No irrigation)",
        limited: "Limited (ಕಡಿಮೆ/ಮಧ್ಯಮ - Seasonal borewell)",
        reliable: "Reliable (ಸಾಕಷ್ಟು - Perennial borewell/drip)",
      },
      seasons: {
        kharif: "Kharif (Monsoon / ಮುಂಗಾರು)",
        rabi: "Rabi (Winter / ಹಿಂಗಾರು)",
        summer: "Summer (ಬೇಸಿಗೆ)",
        all_season: "All Season (ವರ್ಷಪೂರ್ತಿ)",
      },
    },
    recommendations: {
      title: "Crop Suitability & Transparent Utility Ranking",
      subtitle: "Multi-attribute optimization without black-box AI hallucination",
      eligibleTab: "Feasible Crops (ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು)",
      disqualifiedTab: "Disqualified / High Risk (ಸೂಕ್ತವಲ್ಲದ ಬೆಳೆಗಳು)",
      rank: "Rank",
      crop: "Crop Name",
      utilityScore: "Utility Score",
      agronomyScore: "Agronomy Fit (25%)",
      economicsScore: "Economics (25%)",
      waterScore: "Water Fit (20%)",
      riskScore: "Risk Protection (15%)",
      duration: "Duration (15%)",
      netReturn: "Est. Net Profit",
      calculateProfitBtn: "Calculate Exact Profit",
      disqualificationReason: "Reason Disqualified",
      weatherImpact: "Weather Fit Context",
      filterAll: "All Categories",
      refreshRecommendations: "Recalculate Ranking",
      loading: "Evaluating multi-attribute rankings from backend...",
      noCropsFound: "No crops match current constraints. Try adjusting water or budget.",
      formulaDisclaimer: "Transparent Utility = 0.25·Agronomy + 0.25·Economics + 0.20·Water + 0.15·Risk + 0.15·Duration. Non-guaranteed projections.",
    },
    market: {
      title: "APMC Mandi Market Explorer",
      subtitle: "Live and canonical spot prices across Karnataka market yards",
      searchPlaceholder: "Search commodity (e.g., Tomato, Onion) or mandi yard...",
      commodity: "Commodity",
      marketYard: "Market Yard",
      modalPrice: "Modal (Average) Price",
      minMaxRange: "Min – Max Price Spread",
      freshness: "Data Freshness",
      lastUpdated: "Reported Date",
      verifiedProvenance: "SHA-256 Verified",
      totalArrivals: "Arrivals (Tonnes)",
      auditBadge: "Zero Silent Drops",
      perQuintal: "₹ / Quintal",
    },
    profit: {
      title: "Farm Unit Economics & Profit Scenarios",
      subtitle: "Mathematical farm economics: Yield × Area × Price − Cultivation Costs",
      selectCrop: "Select Crop for Profit Calculation",
      formulaTitle: "Deterministic Farm Formula",
      formulaText: "Net Profit = (Yield in qtl/acre × Area in acres × Price ₹/qtl) − Total Cultivation Costs",
      scenariosTitle: "Price Quantile Scenarios",
      conservative: "Conservative (P25)",
      expected: "Expected (Median)",
      optimistic: "Optimistic (P75)",
      costBreakdownTitle: "Farmer-Editable Cost Items (₹ / Acre)",
      costBreakdownSubtitle: "Adjust expenses to match your actual local operational costs",
      labour: "Labour & Weeding",
      seeds: "Seed & Nursery",
      fertilisers: "Fertilisers & Nutrients",
      irrigation: "Irrigation & Power",
      tractor: "Tractor & Machinery Rental",
      harvesting: "Harvesting & Threshing",
      transport: "Mandi Transport & Packaging",
      totalCost: "Total Cultivation Cost",
      expectedRevenue: "Gross Revenue",
      netProfit: "Net Profit",
      netProfitPerAcre: "Net Profit / Acre",
      roi: "Return on Investment (ROI)",
      recalculate: "Recalculate",
      resetDefaults: "Reset to Official DESAgri Defaults",
      customCostsNote: "Custom farmer overrides are dynamically computed server-side without data loss.",
    },
    crops: {
      Tomato: "Tomato (ಟೊಮೆಟೊ)",
      Onion: "Onion (ಈರುಳ್ಳಿ)",
      Potato: "Potato (ಆಲೂಗಡ್ಡೆ)",
      Maize: "Maize (ಮೆಕ್ಕೆಜೋಳ)",
      Cotton: "Cotton (ಹತ್ತಿ)",
      Ragi: "Finger Millet / Ragi (ರಾಗಿ)",
      Groundnut: "Groundnut (ಕಡಲೆಕಾಯಿ)",
      Chilli: "Green Chilli (ಹಸಿಮೆಣಸಿನಕಾಯಿ)",
    },
    assistant: {
      title: "Grounded Agricultural AI Assistant",
      subtitle: "Ask factual farming questions with official ICAR/UAS citations and verified APMC mandi prices",
      inputPlaceholder: "Ask about crop guidelines, fertilizer dosage (NPK), blast disease, APMC prices...",
      askBtn: "Ask Assistant",
      asking: "Consulting official documents & numerical tools...",
      quickPromptsTitle: "Quick Agricultural Questions",
      verifiedSourcesBadge: "ICAR & UAS Verified Guidelines",
      fallbackBadge: "Verified Excerpt Fallback Mode",
      citationsTitle: "Supporting Citations & Official Sources",
      assumptionsTitle: "Grounded Scope & Transparency Disclosures",
      emptyChatPrompt: "Ask any farming, fertilizer dosage, pest control, or APMC mandi price question.",
      prompt1: "What is the recommended fertilizer NPK dosage for finger millet ragi in Kolar?",
      prompt2: "What is the official APMC mandi price of tomato in Kolar today?",
      prompt3: "How to manage blast disease in ragi? What fungicide to use?",
      prompt4: "If I grow onion on 2 acres in Karnataka, what is my expected cultivation cost and net profit?",
      unsupportedDisclaimer: "Answers are grounded strictly in official ICAR, Agricultural University, and APMC documents. Numerical figures are computed deterministically without hallucinations.",
    },
  },
  kn: {
    appName: "ಅಗ್ರಿಪಲ್ಸ್ ಎಐ (AgriPulse AI)",
    tagline: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ನಿರ್ಧಾರಗಳು, ಸರಳವಾಗಿ ವಿವರಿಸಲಾಗಿದೆ",
    nav: {
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      profile: "ಜಮೀನಿನ ವಿವರ",
      account: "ರೈತರ ಖಾತೆ & ದಾಖಲೆಗಳು",
      recommendations: "ಬೆಳೆ ಶಿಫಾರಸುಗಳು",
      market: "ಮಾರುಕಟ್ಟೆ ಎಕ್ಸ್‌ಪ್ಲೋರರ್",
      profit: "ಲಾಭ ಲೆಕ್ಕಾಚಾರ",
      assistant: "ಕೃಷಿ AI ಸಹಾಯಕ",
    },
    dashboard: {
      greeting: "ನಮಸ್ಕಾರ, ರೈತ ಮಿತ್ರರೇ",
      weatherTitle: "ಲೈವ್ ಕೃಷಿ ಹವಾಮಾನ ಮುನ್ನೋಟ",
      weatherSubtitle: "ಓಪನ್-ಮೆಟಿಯೊ ನೇರ ಹವಾಮಾನ ಹಾಗೂ 7 ದಿನಗಳ ಮುನ್ಸೂಚನೆ",
      temp: "ಉಷ್ಣಾಂಶ",
      humidity: "ಆರ್ದ್ರತೆ",
      wind: "ಗಾಳಿಯ ವೇಗ",
      rainfall: "ಮಳೆಯ ಸಾಧ್ಯತೆ",
      source: "ಹವಾಮಾನ ಮೂಲ",
      cacheStatus: "ಕ್ಯಾಶ್ ಸ್ಥಿತಿ",
      topCropsTitle: "ನಿಮ್ಮ ಜಮೀನಿಗೆ ಅಗ್ರ ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು",
      topCropsSubtitle: "ಮಣ್ಣು, ನೀರು ಹಾಗೂ ಮಾರುಕಟ್ಟೆ ಲಾಭದ ಆಧಾರದ ಮೇಲೆ ವಿಂಗಡಿಸಲಾಗಿದೆ",
      marketAlertsTitle: "ಕರ್ನಾಟಕ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ಪ್ರಸ್ತುತ ದರಗಳು",
      marketAlertsSubtitle: "ಅಧಿಕೃತ ಆಗ್ಮಾರ್ಕ್‌ನೆಟ್ ದರಗಳು ಮತ್ತು ಒಳಹರಿವು ವಿವರ",
      viewAllCrops: "ಎಲ್ಲಾ ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ನೋಡಿ",
      viewAllMarkets: "ಮಾರುಕಟ್ಟೆ ವೀಕ್ಷಿಸಿ",
      score: "ಸೂಕ್ತತೆ ಅಂಕ",
      expectedReturn: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ",
      quickStats: "ಜಮೀನಿನ ವಿವರ",
      activeDistrict: "ಜಿಲ್ಲೆ",
      activeLand: "ಭೂಮಿ ವಿಸ್ತೀರ್ಣ",
      activeSeason: "ಪ್ರಸ್ತುತ ಹಂಗಾಮು",
      systemOnline: "ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿದೆ",
      systemOffline: "ಸರ್ವರ್ ಆಫ್‌ಲೈನ್ ಆಗಿದೆ",
    },
    account: {
      title: "ರೈತರ ಖಾತೆ ಮತ್ತು ಕೃಷಿ ದಾಖಲೆಗಳ ಕಣಜ",
      subtitle: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ, ಜಿಪಿಎಸ್ ಮೂಲಕ ಸ್ಥಳ ಗುರುತಿಸಿ ಮತ್ತು ಪಹಣಿ/ಮಣ್ಣಿನ ದಾಖಲೆಗಳನ್ನು ಲಿಂಕ್ ಮಾಡಿ",
      farmerName: "ರೈತರ ಪೂರ್ಣ ಹೆಸರು",
      mobile: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      farmerId: "ರೈತ ಗುರುತಿನ ಚೀಟಿ (FRUITS ID / FID)",
      taluk: "ತಾಲೂಕು",
      village: "ಗ್ರಾಮದ ಹೆಸರು",
      detectGps: "📍 ನನ್ನ ಸ್ಥಳ ಗುರುತಿಸಿ (ಜಿಪಿಎಸ್ ಆಟೋ-ಲೊಕೇಶನ್)",
      detectingGps: "ಕರ್ನಾಟಕ ಜಿಲ್ಲೆಯನ್ನು ಜಿಪಿಎಸ್ ಮೂಲಕ ಗುರುತಿಸಲಾಗುತ್ತಿದೆ...",
      gpsSuccess: "ಸ್ಥಳ ಯಶಸ್ವಿಯಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ!",
      gpsFailed: "ಜಿಪಿಎಸ್ ಗುರುತಿಸಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಜಿಲ್ಲೆಯನ್ನು ನೇರವಾಗಿ ಆಯ್ಕೆಮಾಡಿ.",
      documentsTitle: "ಕೃಷಿ ಮತ್ತು ಭೂ ದಾಖಲೆಗಳ ಕಣಜ",
      documentsSubtitle: "ಪಹಣಿ (ಆರ್.ಟಿ.ಸಿ), ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಹಾಗೂ ಕೊಳವೆಬಾವಿ ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸೇರಿಸಿ",
      addDocBtn: "ಹೊಸ ದಾಖಲೆ ಸೇರಿಸಿ",
      docName: "ದಾಖಲೆಯ ವಿವರ / ಹೆಸರು",
      docType: "ದಾಖಲೆಯ ಪ್ರಕಾರ",
      docNumber: "ದಾಖಲೆ / ಪ್ರಮಾಣಪತ್ರ ಸಂಖ್ಯೆ",
      uploadDoc: "ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (PDF / ಫೋಟೋ)",
      fileSelected: "ದಾಖಲೆ ಲಗತ್ತಿಸಲಾಗಿದೆ",
      statusVerified: "ದೃಢೀಕೃತ ದಾಖಲೆ",
      surveyNo: "ಸರ್ವೆ / ಹಿಸ್ಸಾ ಸಂಖ್ಯೆ",
      rtcDoc: "ಆರ್.ಟಿ.ಸಿ / ಪಹಣಿ (ಭೂ ಮಾಲೀಕತ್ವ)",
      shcDoc: "ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ (ಸರ್ಕಾರಿ ಲ್ಯಾಬ್)",
      waterDoc: "ಕೊಳವೆಬಾವಿ / ನೀರಾವರಿ ಪ್ರಮಾಣಪತ್ರ",
      saveAccountBtn: "ಖಾತೆ ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಉಳಿಸಿ",
      accountSavedSuccess: "ರೈತರ ಖಾತೆ ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!",
      totalDocs: "ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳು",
      zoneDetected: "ಕೃಷಿ-ಹವಾಮಾನ ವಲಯ",
    },
    profile: {
      title: "ರೈತರ ಜಮೀನಿನ ವಿವರ",
      subtitle: "ನಿಮ್ಮ ಮಣ್ಣು, ನೀರು ಮತ್ತು ಬಜೆಟ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಸೂಕ್ತ ಸಲಹೆ ಪಡೆಯಿರಿ",
      district: "ಜಿಲ್ಲೆ (ಕರ್ನಾಟಕ)",
      landArea: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ",
      acres: "ಎಕರೆಗಳು",
      soilType: "ಮಣ್ಣಿನ ವಿಧ",
      soilPh: "ಮಣ್ಣಿನ ಪಿ.ಹೆಚ್ (pH)",
      irrigationSource: "ಮುಖ್ಯ ನೀರಾವರಿ ಮೂಲ",
      waterAvailability: "ನೀರಿನ ಲಭ್ಯತೆ",
      season: "ನಾಟಿ ಮಾಡುವ ಹಂಗಾಮು",
      capitalBudget: "ಲಭ್ಯವಿರುವ ಬಂಡವಾಳ (₹)",
      saveBtn: "ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ",
      savedSuccess: "ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ! ಶಿಫಾರಸುಗಳು ನವೀಕರಣಗೊಂಡಿವೆ.",
      soils: {
        red_sandy_loam: "ಕೆಂಪು ಮರಳು ಮಿಶ್ರಿತ ಮಣ್ಣು (Red Sandy Loam)",
        black_cotton: "ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು (Black Cotton)",
        alluvial: "ಮೆಕ್ಕಲು ಮಣ್ಣು (Alluvial)",
        laterite: "ಲ್ಯಾಟರೈಟ್ / ಜಂಬಿಟ್ಟಿಗೆ ಮಣ್ಣು (Laterite)",
        clay_loam: "ಜೇಡಿ ಮಣ್ಣು (Clay Loam)",
        sandy: "ಮರಳು ಮಣ್ಣು (Sandy)",
        unknown: "ತಿಳಿದಿಲ್ಲ / ಪರೀಕ್ಷಿಸಿಲ್ಲ (Unknown)",
      },
      irrigations: {
        borewell: "ಕೊಳವೆಬಾವಿ (Borewell)",
        canal: "ಕಾಲುವೆ / ನದಿ ನೀರಾವರಿ",
        drip: "ಹನಿ ನೀರಾವರಿ (Drip)",
        rainfed: "ಮಳೆಯಾಶ್ರಿತ ಮಾತ್ರ (Rainfed)",
      },
      waterLevels: {
        rainfed: "ಮಳೆಯಾಶ್ರಿತ ಮಾತ್ರ (Rainfed - No irrigation)",
        limited: "ಕಡಿಮೆ/ಮಧ್ಯಮ (Limited - Seasonal borewell)",
        reliable: "ಸಾಕಷ್ಟು (Reliable - Perennial borewell/drip)",
      },
      seasons: {
        kharif: "ಮುಂಗಾರು (Kharif - Monsoon)",
        rabi: "ಹಿಂಗಾರು (Rabi - Winter)",
        summer: "ಬೇಸಿಗೆ (Summer)",
        all_season: "ವರ್ಷಪೂರ್ತಿ (All Season)",
      },
    },
    recommendations: {
      title: "ಬೆಳೆ ಸೂಕ್ತತೆ ಮತ್ತು ಪಾರದರ್ಶಕ ಶ್ರೇಯಾಂಕ",
      subtitle: "ವೈಜ್ಞಾನಿಕ ಕೃಷಿ ಸೂತ್ರಗಳೊಂದಿಗೆ ನಿಖರ ಹಾಗೂ ವಿಶ್ವಾಸಾರ್ಹ ಶಿಫಾರಸುಗಳು",
      eligibleTab: "ಸೂಕ್ತವಾದ ಬೆಳೆಗಳು",
      disqualifiedTab: "ಹೆಚ್ಚು ಅಪಾಯ / ಸೂಕ್ತವಲ್ಲದ ಬೆಳೆಗಳು",
      rank: "ಶ್ರೇಯಾಂಕ",
      crop: "ಬೆಳೆಯ ಹೆಸರು",
      utilityScore: "ಒಟ್ಟು ಸ್ಕೋರ್",
      agronomyScore: "ಕೃಷಿ ಸೂಕ್ತತೆ (25%)",
      economicsScore: "ಆರ್ಥಿಕ ಲಾಭ (25%)",
      waterScore: "ನೀರಿನ ಸ್ಥಿತಿಸ್ಥಾಪಕತ್ವ (20%)",
      riskScore: "ಅಪಾಯ ರಕ್ಷಣೆ (15%)",
      duration: "ಅವಧಿ ಹೊಂದಾಣಿಕೆ (15%)",
      netReturn: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ",
      calculateProfitBtn: "ಖಚಿತ ಲಾಭ ಲೆಕ್ಕಹಾಕಿ",
      disqualificationReason: "ತಿರಸ್ಕರಿಸಲು ಕಾರಣ",
      weatherImpact: "ಹವಾಮಾನ ಪ್ರಭಾವ",
      filterAll: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
      refreshRecommendations: "ಶ್ರೇಯಾಂಕ ಮರು-ಲೆಕ್ಕಹಾಕಿ",
      loading: "ಬೆಳೆ ಶ್ರೇಯಾಂಕ ಲೆಕ್ಕಾಚಾರವಾಗುತ್ತಿದೆ...",
      noCropsFound: "ಪ್ರಸ್ತುತ ಷರತ್ತುಗಳಿಗೆ ಯಾವುದೇ ಬೆಳೆ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ನೀರು ಅಥವಾ ಬಜೆಟ್ ಬದಲಾಯಿಸಿ ನೋಡಿ.",
      formulaDisclaimer: "ಪಾರದರ್ಶಕ ಸೂತ್ರ = 0.25·ಕೃಷಿ + 0.25·ಆರ್ಥಿಕತೆ + 0.20·ನೀರು + 0.15·ಅಪಾಯ + 0.15·ಅವಧಿ. ಸರ್ಕಾರದ ಅಧಿಕೃತ ಅಂಕಿಅಂಶಗಳ ಆಧಾರದ ಮೇಲೆ.",
    },
    market: {
      title: "ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ಎಕ್ಸ್‌ಪ್ಲೋರರ್",
      subtitle: "ಕರ್ನಾಟಕದ ವಿವಿಧ ಮಂಡಿಗಳಲ್ಲಿ ಇಂದಿನ ಅಧಿಕೃತ ದರಗಳು",
      searchPlaceholder: "ಬೆಳೆ (ಉದಾ: ಟೊಮೆಟೊ, ಈರುಳ್ಳಿ) ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಹುಡುಕಿ...",
      commodity: "ಕೃಷಿ ಉತ್ಪನ್ನ",
      marketYard: "ಮಾರುಕಟ್ಟೆ ಪ್ರಾಂಗಣ",
      modalPrice: "ಮಾದರಿ (ಸರಾಸರಿ) ದರ",
      minMaxRange: "ಕನಿಷ್ಠ – ಗರಿಷ್ಠ ದರ",
      freshness: "ದಿನಾಂಕ ತಾಜಾತನ",
      lastUpdated: "ವರದಿ ದಿನಾಂಕ",
      verifiedProvenance: "SHA-256 ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
      totalArrivals: "ಒಳಹರಿವು (ಟನ್‌ಗಳಲ್ಲಿ)",
      auditBadge: "ಶೂನ್ಯ ಮಾಹಿತಿ ನಷ್ಟ",
      perQuintal: "₹ / ಕ್ವಿಂಟಾಲ್",
    },
    profit: {
      title: "ಕೃಷಿ ಯುನಿಟ್ ಆರ್ಥಿಕತೆ ಮತ್ತು ಲಾಭ ಲೆಕ್ಕಾಚಾರ",
      subtitle: "ನಿಖರ ಸೂತ್ರ: ನಿವ್ವಳ ಲಾಭ = (ಇಳುವರಿ × ವಿಸ್ತೀರ್ಣ × ಮಾರುಕಟ್ಟೆ ದರ) − ಕೃಷಿ ವೆಚ್ಚಗಳು",
      selectCrop: "ಲಾಭ ಲೆಕ್ಕಹಾಕಲು ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ",
      formulaTitle: "ಲಾಭದ ಗಣಿತ ಸೂತ್ರ",
      formulaText: "ನಿವ್ವಳ ಲಾಭ = (ಕ್ವಿಂಟಾಲ್ ಇಳುವರಿ/ಎಕರೆ × ಎಕರೆ ವಿಸ್ತೀರ್ಣ × ₹/ಕ್ವಿಂಟಾಲ್ ದರ) − ಒಟ್ಟು ಕೃಷಿ ವೆಚ್ಚ",
      scenariosTitle: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಸನ್ನಿವೇಶಗಳು",
      conservative: "ಕನಿಷ್ಠ ಅಂದಾಜು (P25)",
      expected: "ಮಧ್ಯಮ ಅಂದಾಜು (Median)",
      optimistic: "ಉತ್ತಮ ಅಂದಾಜು (P75)",
      costBreakdownTitle: "ರೈತರು ಬದಲಿಸಬಹುದಾದ ಕೃಷಿ ವೆಚ್ಚಗಳು (₹ / ಎಕರೆ)",
      costBreakdownSubtitle: "ನಿಮ್ಮ ಸ್ಥಳೀಯ ವೆಚ್ಚಕ್ಕೆ ತಕ್ಕಂತೆ ಮೊತ್ತವನ್ನು ನೀವೇ ನಮೂದಿಸಬಹುದು",
      labour: "ಆಳುಗಳ ಕೂಲಿ ಮತ್ತು ಕಳೆ ಕೀಳುವುದು",
      seeds: "ಬೀಜ ಮತ್ತು ನರ್ಸರಿ ವೆಚ್ಚ",
      fertilisers: "ರಸಗೊಬ್ಬರ ಮತ್ತು ಪೋಷಕಾಂಶ",
      irrigation: "ನೀರಾವರಿ ಮತ್ತು ವಿದ್ಯುತ್ ವೆಚ್ಚ",
      tractor: "ಟ್ರ್ಯಾಕ್ಟರ್ ಮತ್ತು ಯಂತ್ರಗಳ ಬಾಡಿಗೆ",
      harvesting: "ಕೊಯ್ಲು ಮತ್ತು ಒಕ್ಕಣೆ ವೆಚ್ಚ",
      transport: "ಮಂಡಿ ಸಾಗಾಣಿಕೆ ಮತ್ತು ಪ್ಯಾಕಿಂಗ್",
      totalCost: "ಒಟ್ಟು ಕೃಷಿ ವೆಚ್ಚ",
      expectedRevenue: "ಒಟ್ಟು ಆದಾಯ",
      netProfit: "ನಿವ್ವಳ ಲಾಭ",
      netProfitPerAcre: "ಎಕರೆಗೆ ನಿವ್ವಳ ಲಾಭ",
      roi: "ಹೂಡಿಕೆ ಮೇಲಿನ ಲಾಭ (ROI)",
      recalculate: "ಮರು ಲೆಕ್ಕಹಾಕಿ",
      resetDefaults: "ಸರ್ಕಾರಿ ಮಾನದಂಡಕ್ಕೆ ಮರುಹೊಂದಿಸಿ",
      customCostsNote: "ರೈತರು ನಮೂದಿಸುವ ಖರ್ಚುಗಳನ್ನು ನೇರವಾಗಿ ಸರ್ವರ್‌ನಲ್ಲಿ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.",
    },
    crops: {
      Tomato: "ಟೊಮೆಟೊ (Tomato)",
      Onion: "ಈರುಳ್ಳಿ (Onion)",
      Potato: "ಆಲೂಗಡ್ಡೆ (Potato)",
      Maize: "ಮೆಕ್ಕೆಜೋಳ (Maize)",
      Cotton: "ಹತ್ತಿ (Cotton)",
      Ragi: "ರಾಗಿ (Ragi)",
      Groundnut: "ಕಡಲೆಕಾಯಿ (Groundnut)",
      Chilli: "ಹಸಿಮೆಣಸಿನಕಾಯಿ (Chilli)",
    },
    assistant: {
      title: "ಅಧಿಕೃತ ಕೃಷಿ AI ಸಹಾಯಕ (Grounded Assistant)",
      subtitle: "ಐಸಿಎಆರ್ ಮತ್ತು ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯದ ದೃಢೀಕೃತ ದಾಖಲೆಗಳು ಹಾಗೂ ಅಧಿಕೃತ ಎಪಿಎಂಸಿ ಮಂಡಿ ದರಗಳೊಂದಿಗೆ ನಿಖರ ಸಲಹೆಗಳು",
      inputPlaceholder: "ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ (NPK), ರೋಗ ನಿರ್ವಹಣೆ, ಮಂಡಿ ಬೆಲೆ, ಲಾಭದ ಲೆಕ್ಕಾಚಾರ ಕೇಳಿ...",
      askBtn: "ಪ್ರಶ್ನೆ ಕೇಳಿ",
      asking: "ಅಧಿಕೃತ ದಾಖಲೆಗಳು ಮತ್ತು ಸೂತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      quickPromptsTitle: "ರೈತರ ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು (Quick Prompts)",
      verifiedSourcesBadge: "ICAR / UASB ಅಧಿಕೃತ ದಾಖಲೆಗಳು",
      fallbackBadge: "ದೃಢೀಕೃತ ದಾಖಲೆಗಳ ನೇರ ಉಲ್ಲೇಖ",
      citationsTitle: "ಅಧಿಕೃತ ಮೂಲಗಳು ಮತ್ತು ಉಲ್ಲೇಖಗಳು (Citations)",
      assumptionsTitle: "ಪಾರದರ್ಶಕತೆ ಮತ್ತು ಅಧಿಕೃತ ಮಿತಿಗಳ ವಿವರಣೆ",
      emptyChatPrompt: "ಕೃಷಿ, ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ, ರೋಗ ನಿಯಂತ್ರಣ ಅಥವಾ ಇಂದಿನ ಮಂಡಿ ದರಗಳ ಬಗ್ಗೆ ಕೇಳಿ.",
      prompt1: "ಕೋಲಾರದಲ್ಲಿ ರಾಗಿ ಬೆಳೆಗೆ ಶಿಫಾರಸು ಮಾಡಿದ ರಸಗೊಬ್ಬರ (NPK) ಪ್ರಮಾಣ ಎಷ್ಟು?",
      prompt2: "ಕೋಲಾರ ಮಂಡಿಯಲ್ಲಿ ಇಂದಿನ ಅಧಿಕೃತ ಟೊಮೆಟೊ ದರ ಎಷ್ಟು?",
      prompt3: "ರಾಗಿ ಬೆಳೆಗೆ ಬೆಂಕಿ ರೋಗ (Blast) ಬಂದರೆ ಯಾವ ಔಷಧ ಸಿಂಪಡಿಸಬೇಕು?",
      prompt4: "ನನ್ನ 2 ಎಕರೆ ಜಮೀನಿನಲ್ಲಿ ಈರುಳ್ಳಿ ಬೆಳೆದರೆ ಎಷ್ಟು ಖರ್ಚು ಮತ್ತು ಲಾಭ?",
      unsupportedDisclaimer: "ಎಲ್ಲಾ ಉತ್ತರಗಳು ಐಸಿಎಆರ್, ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯ ಮತ್ತು ಎಪಿಎಂಸಿ ದತ್ತಾಂಶಗಳ ಆಧಾರದ ಮೇಲೆ ಮಾತ್ರ ನೀಡಲಾಗಿದೆ. ಯಾವುದೇ ಕಲ್ಪಿತ ಅಂಕಿಅಂಶಗಳನ್ನು ನೀಡಲಾಗುವುದಿಲ್ಲ.",
    },
  },
};
