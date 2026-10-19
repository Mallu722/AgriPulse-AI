"""
AgriPulse AI — Cost of Cultivation & Economic Baseline Schemas.

Defines schemas for government cultivation cost baselines and net-return calculations
sourced from Directorate of Economics and Statistics (DESAgri).
"""

from typing import Optional
from pydantic import BaseModel, Field


class CostOfCultivationBaseline(BaseModel):
    """
    Official baseline cost of cultivation estimates per hectare/acre.
    Source: DESAgri Cost of Cultivation Reports
    (https://desagri.gov.in/document-report/cost-of-cultivation-production-related-data/)
    """
    crop: str = Field(..., description="Crop name")
    state: str = Field(default="Karnataka", description="State")
    report_year: int = Field(..., description="Reference report year")
    
    # Cost Breakdown (₹ / Acre)
    seed_cost_per_acre: float = Field(..., ge=0, description="Seed/sapling expense")
    fertilizer_nutrient_cost_per_acre: float = Field(..., ge=0, description="Fertilizers & manure")
    labor_cost_per_acre: float = Field(..., ge=0, description="Human & animal labor expenses")
    irrigation_power_cost_per_acre: float = Field(..., ge=0, description="Irrigation & electricity")
    machinery_fuel_cost_per_acre: float = Field(..., ge=0, description="Tractor, equipment hire & fuel")
    plant_protection_cost_per_acre: float = Field(..., ge=0, description="Biopesticides/pesticides")
    harvesting_postharvest_per_acre: float = Field(..., ge=0, description="Harvesting, grading & bagging")
    transport_to_mandi_per_quintal: float = Field(..., ge=0, description="Transport cost per quintal to local APMC")
    
    total_cost_per_acre: float = Field(..., ge=0, description="Total operational cultivation cost per acre")
    typical_yield_quintals_per_acre: float = Field(..., ge=0, description="Typical yield expected per acre")
    source_citation: str = Field(..., description="DESAgri or UAS Bengaluru citation reference")
