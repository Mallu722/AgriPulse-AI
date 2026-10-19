"""
AgriPulse AI — DESAgri Area, Production & Yield (APY) Schemas.

Defines schemas for historical crop production statistics sourced from
Directorate of Economics and Statistics (DESAgri), Ministry of Agriculture & Farmers Welfare.
"""

from typing import Optional
from pydantic import BaseModel, Field


class CropProductionRecord(BaseModel):
    """
    District-level historical crop area, production, and yield record.
    Source: DESAgri (https://data.desagri.gov.in/website/apy-query-report-web)
    """
    state: str = Field(default="Karnataka", description="State name")
    district: str = Field(..., description="District name in Karnataka")
    crop: str = Field(..., description="Standardized crop name")
    crop_year: int = Field(..., ge=2000, le=2030, description="Agricultural year (e.g. 2024)")
    season: str = Field(..., description="Season: Kharif, Rabi, Summer, or Whole Year")
    area_hectares: float = Field(..., ge=0, description="Cultivated land area in hectares")
    production_tonnes: float = Field(..., ge=0, description="Total crop production in metric tonnes")
    yield_kg_per_hectare: float = Field(..., ge=0, description="Crop yield in kg per hectare")
    raw_row_hash: str = Field(..., description="SHA-256 hash of original raw record")
    is_interpolated: bool = Field(default=False, description="Whether value was estimated or official")
