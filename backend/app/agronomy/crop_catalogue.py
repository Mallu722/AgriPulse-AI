"""
AgriPulse AI — Crop Knowledge Catalogue & Agronomic Rules.

Every soil, water, sowing-season, pH range and duration rule is backed
by official agronomic publications from ICAR (Indian Council of Agricultural Research),
UAS Bengaluru (Package of Practices for High Yields), and Department of Agriculture, Govt. of Karnataka.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from app.schemas.farmer_profile import SowingSeason, WaterAvailability, SoilType


class CropKnowledgeEntry(BaseModel):
    crop_code: str
    crop_name: str
    kannada_name: str
    category: str  # Millet, Pulse, Commercial Cash Crop, Horticulture, Food Grain
    duration_days_min: int
    duration_days_max: int
    
    # Agronomic suitability constraints
    suitable_seasons: List[SowingSeason]
    min_water_requirement: WaterAvailability  # minimum required: rainfed, limited, reliable
    suitable_soils: List[SoilType]
    optimal_ph_min: float
    optimal_ph_max: float
    suitable_districts: List[str]  # Agro-climatic zones in Karnataka
    
    # Official Citations & Evidence
    source_citation: str
    package_of_practices_ref: str
    water_intensity_mm: str
    economic_risk_profile: str  # Low, Moderate, High


# Official Karnataka Crop Knowledge Repository (5 Core Benchmark Crops)
# Sources:
# 1. UAS Bengaluru Package of Practices for Field Crops (Dry & Irrigated Zones)
# 2. ICAR - Indian Institute of Millets Research (IIMR), Hyderabad
# 3. Directorate of Pulses Development, GoI / UAS Dharwad
# 4. Indian Institute of Horticultural Research (IIHR), Hesaraghatta, Bengaluru
CROP_CATALOGUE: Dict[str, CropKnowledgeEntry] = {
    "RAGI": CropKnowledgeEntry(
        crop_code="RAGI",
        crop_name="Finger Millet (Ragi)",
        kannada_name="ರಾಗಿ (Ragi)",
        category="Millet / Staple",
        duration_days_min=105,
        duration_days_max=125,
        suitable_seasons=[SowingSeason.KHARIF, SowingSeason.RABI, SowingSeason.ALL_SEASON],
        min_water_requirement=WaterAvailability.RAINFED,
        suitable_soils=[SoilType.RED_SANDY_LOAM, SoilType.LATERITE, SoilType.CLAY_LOAM, SoilType.ALLUVIAL],
        optimal_ph_min=5.5,
        optimal_ph_max=7.8,
        suitable_districts=[
            "Kolar", "Chikkaballapur", "Mandya", "Ramanagara", "Bengaluru Rural", 
            "Bengaluru Urban", "Tumakuru", "Hassan", "Mysuru", "Chamarajanagar"
        ],
        source_citation="UAS Bengaluru Package of Practices for Dryland Agriculture (Zone 5 & 6); ICAR-IIMR Monograph",
        package_of_practices_ref="UAS(B) PoP 2022-23, Section 3: Minor Millets & Finger Millet (GPU-28, ML-365)",
        water_intensity_mm="350 - 500 mm",
        economic_risk_profile="Low"
    ),
    "MAIZE": CropKnowledgeEntry(
        crop_code="MAIZE",
        crop_name="Maize (Corn)",
        kannada_name="ಮೆಕ್ಕೆಜೋಳ (Mekke Jola)",
        category="Coarse Cereal / Commercial",
        duration_days_min=100,
        duration_days_max=120,
        suitable_seasons=[SowingSeason.KHARIF, SowingSeason.RABI],
        min_water_requirement=WaterAvailability.LIMITED,
        suitable_soils=[SoilType.RED_SANDY_LOAM, SoilType.BLACK_COTTON, SoilType.ALLUVIAL, SoilType.CLAY_LOAM],
        optimal_ph_min=6.0,
        optimal_ph_max=7.5,
        suitable_districts=[
            "Davanagere", "Belagavi", "Haveri", "Shivamogga", "Bellary", 
            "Chitradurga", "Kolar", "Mandya", "Mysuru", "Bagalkot"
        ],
        source_citation="ICAR - Indian Institute of Maize Research (IIMR) Technical Bulletin & UAS Dharwad PoP",
        package_of_practices_ref="UAS Dharwad PoP Kharif/Rabi Maize Management; Hybrid CP-818, Dekalb",
        water_intensity_mm="500 - 650 mm",
        economic_risk_profile="Moderate"
    ),
    "TUR": CropKnowledgeEntry(
        crop_code="TUR",
        crop_name="Pigeon Pea (Red Gram / Tur)",
        kannada_name="ತೊಗರಿ (Togari)",
        category="Pulse / Legume",
        duration_days_min=140,
        duration_days_max=180,
        suitable_seasons=[SowingSeason.KHARIF],
        min_water_requirement=WaterAvailability.RAINFED,
        suitable_soils=[SoilType.BLACK_COTTON, SoilType.RED_SANDY_LOAM, SoilType.ALLUVIAL, SoilType.CLAY_LOAM],
        optimal_ph_min=6.5,
        optimal_ph_max=8.2,
        suitable_districts=[
            "Kalaburagi", "Bidar", "Raichur", "Yadgir", "Vijayapura", 
            "Kolar", "Tumakuru", "Chitradurga", "Belagavi"
        ],
        source_citation="ICAR-IIPR Kanpur Pulse Production Guide; UAS Raichur Pulses Mission (GRG-811, TS-3R)",
        package_of_practices_ref="UAS Raichur PoP - Redgram Protection & Intercropping with Bajra/Sesamum",
        water_intensity_mm="400 - 600 mm",
        economic_risk_profile="Moderate"
    ),
    "TOMATO": CropKnowledgeEntry(
        crop_code="TOMATO",
        crop_name="Tomato",
        kannada_name="ಟೊಮೇಟೊ (Tomato)",
        category="Horticulture / Cash Crop",
        duration_days_min=90,
        duration_days_max=120,
        suitable_seasons=[SowingSeason.KHARIF, SowingSeason.RABI, SowingSeason.SUMMER, SowingSeason.ALL_SEASON],
        min_water_requirement=WaterAvailability.RELIABLE,
        suitable_soils=[SoilType.RED_SANDY_LOAM, SoilType.ALLUVIAL, SoilType.CLAY_LOAM],
        optimal_ph_min=6.0,
        optimal_ph_max=7.2,
        suitable_districts=[
            "Kolar", "Chikkaballapur", "Bengaluru Rural", "Belagavi", 
            "Davanagere", "Mandya", "Hassan"
        ],
        source_citation="ICAR - Indian Institute of Horticultural Research (IIHR), Bengaluru (Arka Rakshak, Arka Abhed)",
        package_of_practices_ref="IIHR Technical Leaflet #42: Precision Irrigation & Fertigation in Solanaceous Vegetables",
        water_intensity_mm="600 - 800 mm (Drip irrigation recommended)",
        economic_risk_profile="High"
    ),
    "ONION": CropKnowledgeEntry(
        crop_code="ONION",
        crop_name="Onion",
        kannada_name="ಈರುಳ್ಳಿ (Erulli)",
        category="Horticulture / Cash Crop",
        duration_days_min=110,
        duration_days_max=135,
        suitable_seasons=[SowingSeason.KHARIF, SowingSeason.RABI],
        min_water_requirement=WaterAvailability.LIMITED,
        suitable_soils=[SoilType.RED_SANDY_LOAM, SoilType.BLACK_COTTON, SoilType.ALLUVIAL],
        optimal_ph_min=6.2,
        optimal_ph_max=7.5,
        suitable_districts=[
            "Chitradurga", "Gadag", "Dharwad", "Bagalkot", "Vijayapura", 
            "Belagavi", "Kolar", "Davangere", "Bellary"
        ],
        source_citation="ICAR - Directorate of Onion and Garlic Research (DOGR), Pune & UHS Bagalkot PoP",
        package_of_practices_ref="UHS Bagalkot Horticulture Crop Standards: Bhima Super & Arka Kalyan",
        water_intensity_mm="450 - 650 mm",
        economic_risk_profile="High"
    ),
}
