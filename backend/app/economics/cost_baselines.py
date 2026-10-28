"""
AgriPulse AI — Official Cost of Cultivation Baselines.

Sources:
1. Directorate of Economics and Statistics, Ministry of Agriculture & Farmers Welfare (DESAgri)
   Cost of Cultivation Reports 2023-24 (Karnataka state benchmarks)
2. UAS Bengaluru & UHS Bagalkot Package of Practices (Farm Economics Section 2023-24)
"""

from typing import Dict
from app.schemas.economics import CostCategoryBreakdown


class OfficialCropEconomicsReference:
    def __init__(
        self,
        crop_code: str,
        crop_name: str,
        report_year: int,
        source_citation: str,
        costs: CostCategoryBreakdown,
        yield_p25_quintals_per_acre: float,
        yield_median_quintals_per_acre: float,
        yield_p75_quintals_per_acre: float,
    ):
        self.crop_code = crop_code
        self.crop_name = crop_name
        self.report_year = report_year
        self.source_citation = source_citation
        self.costs = costs
        # Quantile yields derived from DESAgri 5-year district APY records
        self.yield_p25 = yield_p25_quintals_per_acre
        self.yield_median = yield_median_quintals_per_acre
        self.yield_p75 = yield_p75_quintals_per_acre


# Official Karnataka Cost-of-Cultivation Database (per acre)
# Values reflect official UAS Bengaluru / DESAgri 2023-24 survey data
OFFICIAL_CROP_ECONOMICS: Dict[str, OfficialCropEconomicsReference] = {
    "TOMATO": OfficialCropEconomicsReference(
        crop_code="TOMATO",
        crop_name="Tomato",
        report_year=2024,
        source_citation="UAS Bengaluru Farm Economics Bulletin 2023-24 & DESAgri Horticulture Cost Survey (Kolar/Bangalore Rural)",
        costs=CostCategoryBreakdown(
            seeds=4500.0,            # F1 Hybrid seedlings (e.g. Arka Rakshak, US-440)
            fertilizer=7500.0,       # FYM, DAP, MOP, micronutrients & fertigation
            labour=12000.0,          # Staking, weeding, training, human labour (30-40 person-days)
            plant_protection=6000.0, # Bio-agents, blight & fruit borer protection
            irrigation_power=3000.0, # Drip system depreciation & power
            machinery_fuel=4500.0,   # Tractor tillage, bed preparation
            harvesting=6000.0,       # Multi-pass picking & plastic crate handling
            transport_per_quintal=75.0, # Transport to Kolar / Bangalore APMC
            market_charges=1200.0,   # Mandi cess, loading charges
            miscellaneous=1500.0     # Twine, mulching sheet maintenance
        ),
        # 1 Hectare = 24-26 tonnes (240-260 quintals) => ~97-105 quintals / acre
        yield_p25_quintals_per_acre=75.0,     # Adverse weather / mild blight
        yield_median_quintals_per_acre=98.0,  # Benchmark hybrid average
        yield_p75_quintals_per_acre=120.0     # Precision drip fertigation
    ),
    "MAIZE": OfficialCropEconomicsReference(
        crop_code="MAIZE",
        crop_name="Maize (Corn)",
        report_year=2023,
        source_citation="DESAgri Comprehensive Scheme for Cost of Cultivation (CSCPC) 2023 Karnataka Report; UAS Dharwad PoP",
        costs=CostCategoryBreakdown(
            seeds=1800.0,            # Hybrid seeds (8 kg/acre)
            fertilizer=4200.0,       # Urea, SSP/DAP, Potash, Zinc sulphate
            labour=5000.0,           # Sowing, inter-cultivation, manual weeding
            plant_protection=1500.0, # Fall armyworm pheromone traps & spray
            irrigation_power=1500.0, # Protective canal/borewell irrigation
            machinery_fuel=3200.0,   # Tractor ploughing, rotavator, ridger
            harvesting=3500.0,       # Cob picking, dehusking & mechanical threshing
            transport_per_quintal=50.0, # Freight to Davanagere/Ranebennur APMC
            market_charges=600.0,    # Weighment & unloading charges
            miscellaneous=800.0      # Gunny bags, storage
        ),
        # 1 Hectare = 45-50 quintals => ~18-20 quintals / acre
        yield_p25_quintals_per_acre=15.0,
        yield_median_quintals_per_acre=19.5,
        yield_p75_quintals_per_acre=24.0
    ),
    "ONION": OfficialCropEconomicsReference(
        crop_code="ONION",
        crop_name="Onion",
        report_year=2023,
        source_citation="UHS Bagalkot Horticultural Cost Accounts 2023-24 & DESAgri Belgaum/Gadag Market Survey",
        costs=CostCategoryBreakdown(
            seeds=3500.0,            # Nursery seedlings / seed bulb sets
            fertilizer=5500.0,       # Basal fertilizer, sulphur, top dressing
            labour=9500.0,           # Transplanting, weeding, manual harvesting (25 person-days)
            plant_protection=3800.0, # Thrips & purple blotch management
            irrigation_power=2500.0, # Sprinkler / furrow irrigation
            machinery_fuel=3500.0,   # Land prep, bed making
            harvesting=4500.0,       # De-topping, field curing, grading
            transport_per_quintal=60.0, # Transport to Hubballi / Yeshwantpur APMC
            market_charges=800.0,
            miscellaneous=1000.0
        ),
        # 1 Hectare = 15-16.5 tonnes (150-165 quintals) => ~60-67 quintals / acre
        yield_p25_quintals_per_acre=48.0,
        yield_median_quintals_per_acre=64.0,
        yield_p75_quintals_per_acre=78.0
    ),
    "RAGI": OfficialCropEconomicsReference(
        crop_code="RAGI",
        crop_name="Finger Millet (Ragi)",
        report_year=2023,
        source_citation="UAS Bengaluru Package of Practices for Dryland Agriculture (Zone 5 & 6) Cost Standards; Kolar KVK Survey",
        costs=CostCategoryBreakdown(
            seeds=600.0,             # Certified seed (GPU-28 / ML-365)
            fertilizer=2200.0,       # Farmyard manure + basic NPK
            labour=4000.0,           # Thinning, inter-cultivation, manual weeding
            plant_protection=500.0,  # Low pest incidence, minimal spray
            irrigation_power=600.0,  # Primarily rainfed (protective irrigation if dry)
            machinery_fuel=2000.0,   # Bullock / small tractor tillage
            harvesting=2800.0,       # Earhead cutting, sun drying, mechanical thresher
            transport_per_quintal=40.0, # Local mandi transport
            market_charges=300.0,
            miscellaneous=400.0
        ),
        # 1 Hectare = 22-26 quintals => ~9-11 quintals / acre
        yield_p25_quintals_per_acre=7.5,
        yield_median_quintals_per_acre=10.5,
        yield_p75_quintals_per_acre=13.5
    ),
    "TUR": OfficialCropEconomicsReference(
        crop_code="TUR",
        crop_name="Pigeon Pea (Tur)",
        report_year=2023,
        source_citation="UAS Raichur Pulse Economics 2023-24 & Kalaburagi Red Gram Board Baseline",
        costs=CostCategoryBreakdown(
            seeds=1200.0,            # Certified wilt-resistant seed (GRG-811 / TS-3R)
            fertilizer=2800.0,       # Rhizobium bio-fertilizer + DAP + gypsum
            labour=4200.0,           # Sowing, nipping, inter-cultivation
            plant_protection=3000.0, # Pod borer (Helicoverpa) IPM sprays
            irrigation_power=800.0,  # Protective irrigation at flowering/pod fill
            machinery_fuel=2200.0,   # Deep summer ploughing & harrowing
            harvesting=3200.0,       # Pod picking, drying, threshing
            transport_per_quintal=45.0, # Transport to Kalaburagi APMC
            market_charges=500.0,
            miscellaneous=600.0
        ),
        # 1 Hectare = 14-18 quintals => ~6-7.5 quintals / acre
        yield_p25_quintals_per_acre=4.8,
        yield_median_quintals_per_acre=6.8,
        yield_p75_quintals_per_acre=9.0
    ),
    "POTATO": OfficialCropEconomicsReference(
        crop_code="POTATO",
        crop_name="Potato",
        report_year=2024,
        source_citation="CPRI Shimla & UAS Bengaluru Horticultural Economics Bulletin 2023-24 (Hassan / Belagavi)",
        costs=CostCategoryBreakdown(
            seeds=14000.0,           # Seed tubers (8-10 qtl/acre @ 1400-1600/qtl)
            fertilizer=6500.0,       # FYM, Complex 17:17:17, MOP
            labour=8500.0,           # Furrow planting, earthing up, dehaulming
            plant_protection=4200.0, # Late blight systemic fungicide (Metalaxyl + Mancozeb)
            irrigation_power=2200.0, # Furrow/sprinkler irrigation
            machinery_fuel=3800.0,   # Tractor tillage, ridge maker
            harvesting=5500.0,       # Mechanical digger & manual picking/bagging
            transport_per_quintal=65.0, # Transport to APMC Belgaum / Hassan
            market_charges=800.0,
            miscellaneous=1200.0
        ),
        yield_p25_quintals_per_acre=80.0,
        yield_median_quintals_per_acre=105.0,
        yield_p75_quintals_per_acre=130.0
    ),
    "CHILLI": OfficialCropEconomicsReference(
        crop_code="CHILLI",
        crop_name="Chilli",
        report_year=2023,
        source_citation="UAS Dharwad Commercial Horticulture Accounts & Byadgi APMC Economics Bulletin",
        costs=CostCategoryBreakdown(
            seeds=3800.0,            # F1 Hybrid seedlings (Byadgi / Arka Meghana)
            fertilizer=6200.0,       # FYM, Urea, DAP, Potash, Micronutrients
            labour=14000.0,          # Multiple picking passes, drying & bagging (35 person-days)
            plant_protection=6500.0, # Mites, thrips, and anthracnose fruit rot protection
            irrigation_power=2800.0, # Drip/furrow supplemental irrigation
            machinery_fuel=3200.0,   # Land preparation, ridging
            harvesting=7500.0,       # Selective ripe red fruit harvesting & sun yard drying
            transport_per_quintal=80.0, # Freight to Byadgi / Kolar APMC
            market_charges=1200.0,
            miscellaneous=1500.0
        ),
        yield_p25_quintals_per_acre=12.0,    # Dry pod yield (equivalent)
        yield_median_quintals_per_acre=16.5,
        yield_p75_quintals_per_acre=22.0
    ),
    "GROUNDNUT": OfficialCropEconomicsReference(
        crop_code="GROUNDNUT",
        crop_name="Groundnut",
        report_year=2023,
        source_citation="DESAgri Oilseed Cost Survey (Tumakuru/Chitradurga) & UAS Bengaluru PoP",
        costs=CostCategoryBreakdown(
            seeds=4200.0,            # Pod kernel seeds (40 kg/acre TMV-2)
            fertilizer=3200.0,       # Gypsum (200 kg), SSP, Potash, Rhizobium
            labour=4800.0,           # Sowing, inter-cultivation, weeding
            plant_protection=1200.0, # Tikka leaf spot spray
            irrigation_power=1000.0, # 1-2 protective irrigations
            machinery_fuel=2400.0,   # Summer ploughing & harrowing
            harvesting=3600.0,       # Plant pulling, pod stripping, sun drying
            transport_per_quintal=50.0, # Transport to Challakere / Tumakuru APMC
            market_charges=500.0,
            miscellaneous=600.0
        ),
        yield_p25_quintals_per_acre=6.5,
        yield_median_quintals_per_acre=9.0,
        yield_p75_quintals_per_acre=12.0
    ),
    "FRENCH_BEANS": OfficialCropEconomicsReference(
        crop_code="FRENCH_BEANS",
        crop_name="French Beans",
        report_year=2024,
        source_citation="IIHR Bengaluru Short Duration Vegetable Economics & Kolar Mandi Survey",
        costs=CostCategoryBreakdown(
            seeds=3200.0,            # Certified seed (Arka Komal / Anupama)
            fertilizer=4500.0,       # FYM, 19:19:19 fertigation, neem cake
            labour=7500.0,           # Staking, manual picking (3-4 flushes)
            plant_protection=2800.0, # Rust and pod borer IPM
            irrigation_power=1800.0, # Drip irrigation
            machinery_fuel=2500.0,   # Raised bed preparation
            harvesting=4200.0,       # Grading into 10kg gunny bags
            transport_per_quintal=60.0, # Kolar / Bangalore Binny Mill transport
            market_charges=700.0,
            miscellaneous=800.0
        ),
        yield_p25_quintals_per_acre=35.0,
        yield_median_quintals_per_acre=48.0,
        yield_p75_quintals_per_acre=60.0
    ),
    "COTTON": OfficialCropEconomicsReference(
        crop_code="COTTON",
        crop_name="Cotton",
        report_year=2023,
        source_citation="DESAgri Commercial Fiber Cost of Cultivation (Haveri/Belagavi) 2023",
        costs=CostCategoryBreakdown(
            seeds=2400.0,            # Certified BG-II hybrid seed packets
            fertilizer=5200.0,       # Split nitrogen top-dressing, magnesium sulphate, DAP
            labour=9500.0,           # Inter-cultivation, 3-pass manual cotton boll picking
            plant_protection=5500.0, # Sucking pest & bollworm IPM
            irrigation_power=2000.0, # Furrow irrigation
            machinery_fuel=3200.0,   # Deep tractor tillage
            harvesting=6500.0,       # Clean lint harvesting & packaging
            transport_per_quintal=70.0, # Transport to Haveri / Bailhongal APMC
            market_charges=900.0,
            miscellaneous=1000.0
        ),
        yield_p25_quintals_per_acre=8.0,
        yield_median_quintals_per_acre=12.0,
        yield_p75_quintals_per_acre=16.0
    ),
}

