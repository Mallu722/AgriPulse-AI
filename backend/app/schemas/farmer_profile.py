"""
AgriPulse AI — Farmer Profile & Soil/Water Schemas.

Covers:
- District & Taluk/Village validation
- Land area with unit conversion (acres, hectares, guntas)
- Sowing season and sowing month
- Water availability & irrigation infrastructure
- Budget & risk preferences
- Soil Type and official Soil Health Card (SHC) parameter thresholds
"""

from datetime import date
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator


class LandUnit(str, Enum):
    ACRES = "acres"
    HECTARES = "hectares"
    GUNTAS = "guntas"  # Common Karnataka land unit: 1 acre = 40 guntas


class SowingSeason(str, Enum):
    KHARIF = "kharif"      # June to October (Monsoon)
    RABI = "rabi"          # October to March (Winter)
    SUMMER = "summer"      # March to June (Zaid)
    ALL_SEASON = "all_season"


class WaterAvailability(str, Enum):
    RAINFED = "rainfed"      # Purely dependent on seasonal rainfall
    LIMITED = "limited"      # Canal / borewell with seasonal constraints
    RELIABLE = "reliable"    # Perennial borewell / open well / canal + micro-irrigation


class RiskPreference(str, Enum):
    LOW = "low"            # Prioritizes staple crops, minimal downside risk
    MODERATE = "moderate"  # Balanced food grains + commercial pulses
    HIGH = "high"          # High-value cash crops / horticulture with price volatility


class SoilType(str, Enum):
    RED_SANDY_LOAM = "red_sandy_loam"  # Typical Southern dry zone (Kolar, Mandya, Bengaluru Rural)
    BLACK_COTTON = "black_cotton"      # Northern Karnataka (Belagavi, Dharwad, Gulbarga)
    LATERITE = "laterite"              # Coastal / Malnad zone (Shimoga, Udupi)
    ALLUVIAL = "alluvial"              # River basins
    CLAY_LOAM = "clay_loam"
    SANDY = "sandy"
    UNKNOWN = "unknown"                # Explicitly preserved, never guessed by GPS


class SoilHealthCard(BaseModel):
    """
    Optional laboratory-tested Soil Health Card parameters.
    Reference: Soil Health Card Scheme, Ministry of Agriculture & Farmers Welfare, GoI.
    """
    test_date: Optional[date] = Field(None, description="Date when soil sample was tested in lab")
    lab_name: Optional[str] = Field(None, description="Accredited soil testing laboratory or KVK")
    
    # pH: 1.0 to 14.0
    ph: Optional[float] = Field(None, ge=3.5, le=10.5, description="Soil pH level (acidic < 6.0, neutral 6.5-7.5, alkaline > 8.0)")
    
    # Electrical Conductivity in dS/m
    ec: Optional[float] = Field(None, ge=0.0, le=16.0, description="Electrical Conductivity in dS/m (salinity indicator)")
    
    # Organic Carbon in %
    organic_carbon_pct: Optional[float] = Field(None, ge=0.01, le=5.0, description="Organic Carbon percentage (Low < 0.5%, High > 0.75%)")
    
    # Available Macronutrients
    nitrogen_kg_ha: Optional[float] = Field(None, ge=0.0, le=1000.0, description="Available Nitrogen (N) in kg/ha (Low < 280, Medium 280-560, High > 560)")
    phosphorus_kg_ha: Optional[float] = Field(None, ge=0.0, le=250.0, description="Available Phosphorus (P2O5) in kg/ha (Low < 23, Medium 23-56, High > 56)")
    potassium_kg_ha: Optional[float] = Field(None, ge=0.0, le=1200.0, description="Available Potassium (K2O) in kg/ha (Low < 144, Medium 144-336, High > 336)")

    # Physical & Hydraulic Properties (Aligned with ICAR-NBSS&LUP BHOOMI Geoportal LRI standards)
    soil_texture: Optional[str] = Field(None, description="Textural class: Sandy, Sandy Loam, Clay Loam, Clay, Silty Clay (ICAR-NBSS&LUP)")
    sand_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Sand fraction percentage")
    silt_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Silt fraction percentage")
    clay_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Clay fraction percentage")
    soil_depth_cm: Optional[float] = Field(None, ge=0.0, le=300.0, description="Effective soil depth in cm (shallow < 25cm, deep > 100cm)")
    available_water_capacity_mm_m: Optional[float] = Field(None, ge=0.0, le=300.0, description="Available Water Capacity (AWC) in mm/m (BHOOMI Geoportal metric)")
    bhoomi_lri_reference: Optional[str] = Field(None, description="BHOOMI Geoportal / ICAR-NBSS&LUP Block LRI Survey identifier or soil series")


class FarmerProfile(BaseModel):
    """
    Comprehensive farmer profile capturing land, irrigation, soil, and operational preferences.
    """
    farmer_id: Optional[str] = Field(None, description="Optional unique identifier")
    farmer_name: Optional[str] = Field(None, description="Farmer name")
    state: str = Field(default="Karnataka", description="State (default: Karnataka)")
    district: str = Field(..., description="District in Karnataka (e.g., Kolar, Mandya, Belagavi, Shimoga)")
    taluk: Optional[str] = Field(None, description="Taluk or Sub-district")
    village: Optional[str] = Field(None, description="Village name")

    # Land details
    land_area: float = Field(..., gt=0.0, le=500.0, description="Total land area for cultivation")
    land_unit: LandUnit = Field(default=LandUnit.ACRES, description="Unit of measurement: acres, hectares, or guntas")
    
    # Sowing window
    sowing_season: SowingSeason = Field(..., description="Target sowing season: kharif, rabi, summer, all_season")
    sowing_month: Optional[int] = Field(None, ge=1, le=12, description="Target calendar month of sowing (1-12)")

    # Water & Infrastructure
    water_availability: WaterAvailability = Field(..., description="Irrigation status: rainfed, limited, reliable")
    irrigation_source: Optional[str] = Field(None, description="e.g., Borewell, Canal, Drip, Rainfed")

    # Risk & Economics
    budget_preference_inr: Optional[float] = Field(None, ge=0.0, description="Operating capital available for inputs (INR)")
    risk_preference: RiskPreference = Field(default=RiskPreference.MODERATE, description="Risk tolerance: low, moderate, high")

    # Soil specifics
    soil_type: SoilType = Field(default=SoilType.UNKNOWN, description="Known soil type or UNKNOWN")
    soil_health_card: Optional[SoilHealthCard] = Field(default=None, description="Optional Soil Health Card lab metrics")

    @field_validator("district")
    @classmethod
    def clean_district(cls, v: str) -> str:
        cleaned = v.strip().title()
        if not cleaned:
            raise ValueError("District cannot be empty.")
        return cleaned

    @property
    def land_area_acres(self) -> float:
        """Normalized land area in standard acres."""
        if self.land_unit == LandUnit.ACRES:
            return self.land_area
        elif self.land_unit == LandUnit.HECTARES:
            return round(self.land_area * 2.47105, 3)
        elif self.land_unit == LandUnit.GUNTAS:
            return round(self.land_area / 40.0, 3)
        return self.land_area
