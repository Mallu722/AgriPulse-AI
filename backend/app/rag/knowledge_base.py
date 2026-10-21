"""
AgriPulse AI — Curated Official Agricultural Knowledge Base.

Contains verified excerpts from official documents:
- ICAR (Indian Council of Agricultural Research)
- UAS Bengaluru (University of Agricultural Sciences, Bengaluru)
- UAS Dharwad & UHS Bagalkot
- ICAR-IIHR (Indian Institute of Horticultural Research, Hesaraghatta)
- ICAR-IIMR (Indian Institute of Millets Research / Maize Research)
- IMD (India Meteorological Department) Agromet Advisory Bulletins
- Directorate of Marketing & Inspection (Agmarknet Standards)

Each document and section chunk preserves immutable provenance metadata.
"""

from typing import List, Dict, Any

KNOWLEDGE_DOCUMENTS: List[Dict[str, Any]] = [
    {
        "chunk_id": "UASB-RAGI-001",
        "doc_id": "UASB-POP-2023-RAGI",
        "issuer": "UAS Bengaluru (University of Agricultural Sciences)",
        "document_title": "Package of Practices for Dryland Agriculture (Zone 5 & 6) - Finger Millet (Ragi)",
        "source_url": "https://uasbangalore.edu.in/extension/package-of-practices",
        "publication_date": "2023-06-15",
        "retrieval_date": "2026-10-21",
        "version": "PoP 2023-24 v2.1",
        "section": "Chapter 3: Finger Millet (Eleusine coracana) — Soil, Sowing & Nutrient Management",
        "covered_crop": "Ragi",
        "covered_region": "Southern Dry Zone, Eastern Dry Zone (Kolar, Mandya, Tumakuru, Chikkaballapur)",
        "language": "en/kn",
        "keywords": [
            "ragi", "finger millet", "fertilizer", "npk", "sowing", "seed rate", "spacing",
            "ರಾಗಿ", "ಗೊಬ್ಬರ", "ಬಿತ್ತನೆ", "ತಳಿಗಳು", "ಯೂರಿಯಾ", "ಡಿಎಪಿ", "ಎನ್‌ಪಿಕೆ"
        ],
        "content_en": (
            "Recommended varieties for Zone 5 (Kolar, Chikkaballapur): ML-365, GPU-28, MR-6. "
            "Seed rate: 5 kg/ha for line sowing, 10 kg/ha for broadcasting. "
            "Spacing: 22.5 cm to 30 cm between rows, 10 cm within row. "
            "Nutrient Management (NPK): For rainfed ragi, apply 50 kg Nitrogen, 40 kg Phosphorus (P2O5), "
            "and 25 kg Potassium (K2O) per hectare. Apply 50% N and 100% P & K as basal dose at sowing. "
            "Top dress the remaining 50% N at 25-30 days after sowing after weeding. "
            "For irrigated ragi under borewell, apply 100:50:50 kg NPK/ha."
        ),
        "content_kn": (
            "ವಲಯ 5 (ಕೋಲಾರ, ಚಿಕ್ಕಬಳ್ಳಾಪುರ) ಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಿದ ರಾಗಿ ತಳಿಗಳು: ಎಂಎಲ್-365, ಜಿಪಿಯು-28, ಎಂಆರ್-6. "
            "ಬಿತ್ತನೆ ಬೀಜದ ಪ್ರಮಾಣ: ಸಾಲು ಬಿತ್ತನೆಗೆ ಹೆಕ್ಟೇರಿಗೆ 5 ಕೆಜಿ, ಚೆಲ್ಲಲು 10 ಕೆಜಿ. "
            "ಸಾಲುಗಳ ನಡುವಿನ ಅಂತರ: 22.5 ರಿಂದ 30 ಸೆಂ.ಮೀ, ಸಸಿಗಳ ನಡುವೆ 10 ಸೆಂ.ಮೀ. "
            "ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ (ಎನ್‌ಪಿಕೆ): ಮಳೆಯಾಶ್ರಿತ ಬೆಳೆಗೆ ಹೆಕ್ಟೇರಿಗೆ 50 ಕೆಜಿ ಸಾರಜನಕ, 40 ಕೆಜಿ ರಂಜಕ ಮತ್ತು 25 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ (ಎಕರೆಗೆ 20:16:10 ಕೆಜಿ). "
            "ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಅರ್ಧ ಸಾರಜನಕ ಹಾಗೂ ಪೂರ್ಣ ರಂಜಕ-ಪೊಟ್ಯಾಷ್ ಅನ್ನು ತಳಕೊಬ್ಬರವಾಗಿ ನೀಡಬೇಕು. "
            "ಉಳಿದ ಅರ್ಧ ಸಾರಜನಕವನ್ನು ಬಿತ್ತಿದ 25-30 ದಿನಗಳಲ್ಲಿ ಕಳೆ ತೆಗೆದ ನಂತರ ಮೇಲುಗೊಬ್ಬರವಾಗಿ ನೀಡಬೇಕು. ನೀರಾವರಿ ಬೆಳೆಗೆ 100:50:50 ಕೆಜಿ/ಹೆ."
        ),
        "numeric_facts": {
            "rainfed_npk_kg_per_ha": "50:40:25",
            "irrigated_npk_kg_per_ha": "100:50:50",
            "rainfed_npk_kg_per_acre": "20:16:10",
            "seed_rate_line_sowing_kg_ha": 5.0,
            "seed_rate_broadcast_kg_ha": 10.0,
            "spacing_cm": "30 x 10",
        }
    },
    {
        "chunk_id": "UASB-RAGI-002",
        "doc_id": "UASB-POP-2023-RAGI",
        "issuer": "UAS Bengaluru & ICAR-IIMR",
        "document_title": "Finger Millet Plant Protection Guidelines — Blast (Pyricularia grisea) Management",
        "source_url": "https://millets.res.in/publications/ragi_blast_bulletin.pdf",
        "publication_date": "2023-04-10",
        "retrieval_date": "2026-10-21",
        "version": "ICAR-IIMR Tech Bulletin #48",
        "section": "Section 4.2: Ragi Blast (Leaf, Neck, Finger Blast) Diagnostic & Chemical Control",
        "covered_crop": "Ragi",
        "covered_region": "Karnataka Dry Zones",
        "language": "en/kn",
        "keywords": [
            "ragi blast", "pyricularia", "leaf blast", "neck blast", "fungicide", "tricyclazole", "carbendazim",
            "ಬೆಂಕಿ ರೋಗ", "ಬ್ಲಾಸ್ಟ್", "ರಾಗಿ ರೋಗ", "ಶಿಲೀಂಧ್ರನಾಶಕ", "ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್", "ಕಾರ್ಬೆಂಡಾಜಿಮ್"
        ],
        "content_en": (
            "Blast (Pyricularia grisea) is the most destructive disease in finger millet. "
            "Preventive Seed Treatment: Treat seeds with Trichoderma viride @ 4 g/kg or Carbendazim 50% WP @ 2 g/kg seed. "
            "Foliar Management: When spindle-shaped lesions appear on leaves, spray Tricyclazole 75% WP @ 0.6 g/litre of water "
            "or Carbendazim 50% WP @ 1.0 g/litre. "
            "For Neck and Finger Blast, spray at 50% flowering stage with Tricyclazole 75% WP @ 0.6 g/L. "
            "Avoid excessive nitrogen application during cloudy and high relative humidity (>85%) weather."
        ),
        "content_kn": (
            "ರಾಗಿ ಬೆಳೆಯ ಪ್ರಮುಖ ರೋಗ ಬೆಂಕಿ ರೋಗ (ಬ್ಲಾಸ್ಟ್ - Pyricularia grisea). "
            "ಮುನ್ನೆಚ್ಚರಿಕೆ ಬೀಜೋಪಚಾರ: ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಬೀಜಕ್ಕೆ ಟ್ರೈಕೋಡರ್ಮ ವಿರಿಡೆ 4 ಗ್ರಾಂ/ಕೆಜಿ ಅಥವಾ ಕಾರ್ಬೆಂಡಾಜಿಮ್ 50% ಡಬ್ಲ್ಯೂಪಿ 2 ಗ್ರಾಂ/ಕೆಜಿ ಬೆರೆಸಬೇಕು. "
            "ಎಲೆ ಬೆಂಕಿ ರೋಗ ಕಂಡಾಗ ಸಿಂಪಡಣೆ: ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ 75% ಡಬ್ಲ್ಯೂಪಿ ಔಷಧಿಯನ್ನು ಲೀಟರ್ ನೀರಿಗೆ 0.6 ಗ್ರಾಂ ಅಥವಾ ಕಾರ್ಬೆಂಡಾಜಿಮ್ 1.0 ಗ್ರಾಂ/ಲೀಟರ್ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಬೇಕು. "
            "ಕುತ್ತಿಗೆ ಮತ್ತು ತೆನೆ ಬೆಂಕಿ ರೋಗ ತಡೆಗಟ್ಟಲು: ಬೆಳೆಯು 50% ಹೂವಾಡುವ ಹಂತದಲ್ಲಿದ್ದಾಗ ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ 0.6 ಗ್ರಾಂ/ಲೀ ಸಿಂಪಡಿಸಬೇಕು. "
            "ಮೋಡ ಕವಿದ ಮತ್ತು ಅತಿಯಾದ ತೇವಾಂಶವಿದ್ದಾಗ ಅತಿಯಾದ ಸಾರಜನಕ ರಸಗೊಬ್ಬರ ಹಾಕಬಾರದು."
        ),
        "numeric_facts": {
            "seed_treatment_carbendazim_g_kg": 2.0,
            "seed_treatment_trichoderma_g_kg": 4.0,
            "spray_tricyclazole_g_per_litre": 0.6,
            "spray_carbendazim_g_per_litre": 1.0,
        }
    },
    {
        "chunk_id": "IIHR-TOMATO-001",
        "doc_id": "IIHR-TECH-LEAFLET-42",
        "issuer": "ICAR-IIHR (Indian Institute of Horticultural Research)",
        "document_title": "Production Technology and Nutrient Guidelines for Hybrid Tomato (Arka Rakshak / Arka Abhed)",
        "source_url": "https://iihr.res.in/package-of-practices/tomato",
        "publication_date": "2023-01-20",
        "retrieval_date": "2026-10-21",
        "version": "IIHR Technical Leaflet #42 v3",
        "section": "Nutrient & Water Requirements (Fertigation and Field Application)",
        "covered_crop": "Tomato",
        "covered_region": "Kolar, Chikkaballapur, Bengaluru Rural, Belagavi",
        "language": "en/kn",
        "keywords": [
            "tomato", "nutrient", "npk", "fertilizer", "arka rakshak", "bacterial wilt", "calcium", "blossom end rot",
            "ಟೊಮೆಟೊ", "ರಸಗೊಬ್ಬರ", "ಎನ್‌ಪಿಕೆ", "ಅರ್ಕಾ ರಕ್ಷಕ್", "ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೊರಗು ರೋಗ", "ಕ್ಯಾಲ್ಸಿಯಂ", "ಸುಣ್ಣ"
        ],
        "content_en": (
            "Recommended Nutrient Schedule for Hybrid Tomato: 180 kg Nitrogen, 120 kg Phosphorus (P2O5), "
            "and 150 kg Potassium (K2O) per hectare (approx 72:48:60 kg/acre). "
            "Basal Dose: Apply 25 tons FYM/ha, along with 50% P and 25% N and K at land preparation. "
            "Top Dressing / Drip Fertigation: Remaining N and K split across 30, 45, and 60 days after transplanting. "
            "Calcium & Micronutrients: Apply Calcium Nitrate @ 2.5 kg/acre at 40 and 60 DAT to prevent Blossom End Rot (BER). "
            "Soil pH: Optimal 6.0 to 7.2. Tomato requires consistent moisture; water stress during flowering causes flower drop."
        ),
        "content_kn": (
            "ಹೈಬ್ರಿಡ್ ಟೊಮೆಟೊಗೆ ಶಿಫಾರಸು ಮಾಡಿದ ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ: ಹೆಕ್ಟೇರಿಗೆ 180 ಕೆಜಿ ಸಾರಜನಕ, 120 ಕೆಜಿ ರಂಜಕ ಮತ್ತು 150 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ (ಎಕರೆಗೆ 72:48:60 ಕೆಜಿ). "
            "ತಳಕೊಬ್ಬರ: ಎಕರೆಗೆ 10 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ, ಜೊತೆಗೆ 50% ರಂಜಕ ಮತ್ತು 25% ಸಾರಜನಕ ಹಾಗೂ ಪೊಟ್ಯಾಷ್ ಹಾಕಬೇಕು. "
            "ಮೇಲುಗೊಬ್ಬರ / ಹನಿ ನೀರಾವರಿ: ಉಳಿದ ಸಾರಜನಕ ಮತ್ತು ಪೊಟ್ಯಾಷ್ ಅನ್ನು ನಾಟಿ ಮಾಡಿದ 30, 45 ಮತ್ತು 60 ದಿನಗಳಲ್ಲಿ ಹಂಚಿ ಕೊಡಬೇಕು. "
            "ಹೂವು ಹಾಗೂ ಕಾಯಿ ಕೊಳೆ ತಡೆಗಟ್ಟಲು (Blossom End Rot): ನಾಟಿ ಮಾಡಿದ 40 ಮತ್ತು 60 ದಿನಗಳಲ್ಲಿ ಎಕರೆಗೆ 2.5 ಕೆಜಿ ಕ್ಯಾಲ್ಸಿಯಂ ನೈಟ್ರೇಟ್ ನೀಡಬೇಕು. "
            "ಮಣ್ಣಿನ ಪಿ.ಹೆಚ್ 6.0 ರಿಂದ 7.2 ಇರಬೇಕು. ನೀರಿನ ಕೊರತೆಯಾದರೆ ಹೂವು ಉದುರುತ್ತದೆ."
        ),
        "numeric_facts": {
            "npk_kg_per_ha": "180:120:150",
            "npk_kg_per_acre": "72:48:60",
            "calcium_nitrate_kg_acre": 2.5,
            "soil_ph_min": 6.0,
            "soil_ph_max": 7.2,
        }
    },
    {
        "chunk_id": "IIHR-TOMATO-002",
        "doc_id": "IIHR-TECH-LEAFLET-42",
        "issuer": "ICAR-IIHR (Indian Institute of Horticultural Research)",
        "document_title": "Tomato Integrated Pest & Disease Management — Bacterial Wilt and Early Blight",
        "source_url": "https://iihr.res.in/diseases/tomato-bacterial-wilt",
        "publication_date": "2023-01-20",
        "retrieval_date": "2026-10-21",
        "version": "IIHR Technical Leaflet #42 v3",
        "section": "Section 3.5: Solanaceous Bacterial Wilt (Ralstonia solanacearum) Protocol",
        "covered_crop": "Tomato",
        "covered_region": "Karnataka Horticultural Belts",
        "language": "en/kn",
        "keywords": [
            "tomato wilt", "bacterial wilt", "ralstonia", "arka abhed", "drenching", "copper oxychloride",
            "ಟೊಮೆಟೊ ಸೊರಗು ರೋಗ", "ಬ್ಯಾಕ್ಟೀರಿಯಾ ವಿಲ್ಟ್", "ರಾಲ್ಸ್ಟೋನಿಯಾ", "ಅರ್ಕಾ ಅಭೇದ್", "ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್"
        ],
        "content_en": (
            "Bacterial Wilt (Ralstonia solanacearum) is soil-borne. Once infected, chemical cures are ineffective. "
            "Management Protocol: 1. Use resistant F1 hybrids: Arka Rakshak, Arka Samrat, or Arka Abhed (triple disease resistant). "
            "2. Crop rotation with non-solanaceous crops (maize, ragi) for at least 2 seasons. "
            "3. Seedling root dip in Streptocycline @ 0.5 g/L + Copper Oxychloride @ 2.5 g/L for 20 minutes before transplanting. "
            "4. Soil solarization and avoid furrow irrigation from infected fields."
        ),
        "content_kn": (
            "ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೊರಗು ರೋಗ (Ralstonia solanacearum) ಮಣ್ಣಿನ ಮೂಲಕ ಹರಡುವ ರೋಗ. ಒಮ್ಮೆ ಗಿಡ ಒಣಗಿದರೆ ಗುಣಪಡಿಸಲು ಕಷ್ಟ. "
            "ನಿರ್ವಹಣಾ ಕ್ರಮಗಳು: 1. ರೋಗ ನಿರೋಧಕ ತಳಿಗಳ ಬಳಕೆ: ಅರ್ಕಾ ರಕ್ಷಕ್, ಅರ್ಕಾ ಸಾಮ್ರಾಟ್ ಅಥವಾ ಅರ್ಕಾ ಅಭೇದ್ (ತ್ರಿವಳಿ ರೋಗ ನಿರೋಧಕ). "
            "2. ಬೆಳೆ ಪರಿವರ್ತನೆ: ಸೊರಗು ರೋಗವಿರುವ ಜಮೀನಿನಲ್ಲಿ ಕನಿಷ್ಠ 2 ಹಂಗಾಮು ಟೊಮೆಟೊ/ಬದನೆ ಬೆಳೆಯದೆ ರಾಗಿ ಅಥವಾ ಮೆಕ್ಕೆಜೋಳ ಬೆಳೆಯಬೇಕು. "
            "3. ಸಸಿ ಬೇರು ಉಪಚಾರ: ನಾಟಿಗೆ ಮುನ್ನ ಸಸಿಯ ಬೇರುಗಳನ್ನು ಸ್ಟ್ರೆಪ್ಟೋಸೈಕ್ಲಿನ್ 0.5 ಗ್ರಾಂ/ಲೀ ಮತ್ತು ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ 2.5 ಗ್ರಾಂ/ಲೀ ದ್ರಾವಣದಲ್ಲಿ 20 ನಿಮಿಷ ಅದ್ದಿ ನಾಟಿ ಮಾಡಬೇಕು."
        ),
        "numeric_facts": {
            "streptocycline_dip_g_per_l": 0.5,
            "copper_oxychloride_dip_g_per_l": 2.5,
            "root_dip_duration_minutes": 20,
        }
    },
    {
        "chunk_id": "DOGR-ONION-001",
        "doc_id": "ICAR-DOGR-TECH-BULL-19",
        "issuer": "ICAR-DOGR (Directorate of Onion and Garlic Research, Pune)",
        "document_title": "Good Agricultural Practices for Kharif and Late Kharif Onion Production in Karnataka",
        "source_url": "https://dogr.icar.gov.in/publications/kharif_onion_bulletin.pdf",
        "publication_date": "2023-08-12",
        "retrieval_date": "2026-10-21",
        "version": "Technical Bulletin #19",
        "section": "Chapter 2: Seedling Nursery, Soil Adaptability & Fertilizer Application",
        "covered_crop": "Onion",
        "covered_region": "Chitradurga, Gadag, Dharwad, Bagalkot, Kolar",
        "language": "en/kn",
        "keywords": [
            "onion", "dogr", "bhima super", "arka kalyan", "npk", "sulfur", "transplanting", "bulb",
            "ಈರುಳ್ಳಿ", "ಭೀಮಾ ಸೂಪರ್", "ಅರ್ಕಾ ಕಲ್ಯಾಣ್", "ರಸಗೊಬ್ಬರ", "ಗಂಧಕ", "ಸಲ್ಫರ್", "ಗೆಡ್ಡೆ ಗಾತ್ರ"
        ],
        "content_en": (
            "Recommended varieties for Karnataka Kharif: Bhima Super, Bhima Dark Red, Arka Kalyan. "
            "Transplanting age: 40-45 day old sturdy seedlings. "
            "Fertilizer Recommendation: 125 kg Nitrogen, 50 kg Phosphorus (P2O5), and 125 kg Potassium (K2O) per hectare. "
            "Sulfur is critical for pungency and storage quality: Apply Elemental Sulfur @ 30 kg/ha or Gypsum @ 250 kg/ha at land preparation. "
            "Split Nitrogen: 50% basal, 25% at 30 days, 25% at 45 days after transplanting. "
            "Stop all nitrogen application after 60 days to prevent split bulbs and neck thickness."
        ),
        "content_kn": (
            "ಕರ್ನಾಟಕ ಮುಂಗಾರು ಹಂಗಾಮಿಗೆ ಸೂಕ್ತ ಈರುಳ್ಳಿ ತಳಿಗಳು: ಭೀಮಾ ಸೂಪರ್, ಭೀಮಾ ಡಾರ್ಕ್ ರೆಡ್, ಅರ್ಕಾ ಕಲ್ಯಾಣ್. "
            "ಸಸಿಗಳ ವಯಸ್ಸು: 40-45 ದಿನಗಳ ಬಲಿತ ಸಸಿಗಳನ್ನು 15 x 10 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ನಾಟಿ ಮಾಡಬೇಕು. "
            "ರಸಗೊಬ್ಬರ ಶಿಫಾರಸು: ಹೆಕ್ಟೇರಿಗೆ 125 ಕೆಜಿ ಸಾರಜನಕ, 50 ಕೆಜಿ ರಂಜಕ ಮತ್ತು 125 ಕೆಜಿ ಪೊಟ್ಯಾಷ್ (ಎಕರೆಗೆ 50:20:50 ಕೆಜಿ). "
            "ಗಂಧಕ (ಸಲ್ಫರ್): ಗೆಡ್ಡೆ ಗಟ್ಟಿತನ ಮತ್ತು ಶೇಖರಣಾ ಸಾಮರ್ಥ್ಯಕ್ಕೆ ಎಕರೆಗೆ 12 ಕೆಜಿ ಗಂಧಕ ಅಥವಾ 100 ಕೆಜಿ ಜಿಪ್ಸಂ ಹಾಕಬೇಕು. "
            "ಸಾರಜನಕವನ್ನು ನಾಟಿಯಾದ 60 ದಿನಗಳ ನಂತರ ಸಂಪೂರ್ಣವಾಗಿ ನಿಲ್ಲಿಸಬೇಕು. ತಡವಾಗಿ ಯೂರಿಯಾ ಹಾಕಿದರೆ ಕುತ್ತಿಗೆ ದಪ್ಪವಾಗಿ ಗೆಡ್ಡೆ ಕೊಳೆಯುತ್ತದೆ."
        ),
        "numeric_facts": {
            "npk_kg_per_ha": "125:50:125",
            "npk_kg_per_acre": "50:20:50",
            "sulfur_kg_per_ha": 30.0,
            "seedling_age_days": 45,
            "stop_nitrogen_after_days": 60,
        }
    },
    {
        "chunk_id": "UASD-MAIZE-001",
        "doc_id": "UASD-POP-MAIZE-2023",
        "issuer": "UAS Dharwad & ICAR-IIMR",
        "document_title": "Commercial Maize Production & Fall Armyworm (Spodoptera frugiperda) Management Protocol",
        "source_url": "https://uasd.edu/extension/package-of-practices-maize",
        "publication_date": "2023-05-18",
        "retrieval_date": "2026-10-21",
        "version": "UASD Agronomy Leaflet #14",
        "section": "Section 3: Integrated Pest Management for Fall Armyworm",
        "covered_crop": "Maize",
        "covered_region": "Davanagere, Haveri, Belagavi, Shivamogga, Ballari",
        "language": "en/kn",
        "keywords": [
            "maize", "corn", "fall armyworm", "faw", "spodoptera", "emamectin benzoate", "pheromone",
            "ಮೆಕ್ಕೆಜೋಳ", "ಲದ್ದಿ ಹುಳು", "ಸೇನಾ ಹುಳು", "ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೋಯೇಟ್", "ಲಿಂಗಾಕರ್ಷಕ ಬಲೆ", "ಕೀಟ ನಿರ್ವಹಣೆ"
        ],
        "content_en": (
            "Fall Armyworm (Spodoptera frugiperda) management requires stage-specific intervention: "
            "1. Installation of pheromone traps @ 5 traps/acre within 15 days of emergence. "
            "2. Early whorl stage (15-20 days): Spray Azadirachtin 10,000 ppm (1%) @ 2 ml/litre of water or Bacillus thuringiensis (Bt) @ 2 g/L. "
            "3. Severe infestation (>10% damaged whorls): Spray Emamectin Benzoate 5% SG @ 0.4 g/litre or Chlorantraniliprole 18.5% SC @ 0.4 ml/litre. "
            "Ensure the spray nozzle is directed specifically into the crop whorl (ಸುಳಿ). Spraying during early morning or late afternoon yields highest efficacy."
        ),
        "content_kn": (
            "ಮೆಕ್ಕೆಜೋಳದ ಲದ್ದಿ ಹುಳು (Fall Armyworm) ಹತೋಟಿಗೆ ಹಂತವಾರು ಕ್ರಮಗಳು: "
            "1. ಮೊಳಕೆಯೊಡೆದ 15 ದಿನಗಳಲ್ಲಿ ಎಕರೆಗೆ 5 ಲಿಂಗಾಕರ್ಷಕ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಬೇಕು. "
            "2. ಬಿತ್ತಿದ 15-20 ದಿನಗಳಲ್ಲಿ (ಸುಳಿ ಹಂತ): ಬೇವಿನ ಕೀಟನಾಶಕ (Azadirachtin 10,000 ppm) 2 ಮಿ.ಲೀ/ಲೀ ನೀರಿಗೆ ಅಥವಾ ಬಿಟಿ (Bt) 2 ಗ್ರಾಂ/ಲೀ ಸಿಂಪಡಿಸಬೇಕು. "
            "3. ತೀವ್ರ ಬಾಧೆಯಿದ್ದಾಗ (ಶೇ 10 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಸುಳಿ ಹಾನಿ): ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೋಯೇಟ್ 5% ಎಸ್.ಜಿ 0.4 ಗ್ರಾಂ/ಲೀ ಅಥವಾ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 18.5% ಎಸ್.ಸಿ 0.4 ಮಿ.ಲೀ/ಲೀ ಬೆರೆಸಿ ನೇರವಾಗಿ ಸುಳಿಗೆ ಬೀಳುವಂತೆ ಸಿಂಪಡಿಸಬೇಕು."
        ),
        "numeric_facts": {
            "pheromone_traps_per_acre": 5,
            "emamectin_benzoate_g_per_litre": 0.4,
            "chlorantraniliprole_ml_per_litre": 0.4,
            "azadirachtin_ml_per_litre": 2.0,
        }
    },
    {
        "chunk_id": "IMD-AGROMET-001",
        "doc_id": "IMD-AAS-KAR-2023",
        "issuer": "IMD (India Meteorological Department) & AICRP on Agrometeorology",
        "document_title": "District Agro-Meteorological Advisory Interpretation & Weather Stress Mitigation",
        "source_url": "https://imdagrimet.gov.in/bulletins/karnataka",
        "publication_date": "2023-09-01",
        "retrieval_date": "2026-10-21",
        "version": "AAS Bulletin #71",
        "section": "Standard Operational Agromet Rules for Rainfed & Irrigated Crops",
        "covered_crop": "All Crops",
        "covered_region": "Karnataka State (All 31 Districts)",
        "language": "en/kn",
        "keywords": [
            "weather", "rainfall", "humidity", "spray", "dry spell", "irrigation", "imd", "wind",
            "ಹವಾಮಾನ", "ಮಳೆ", "ತೇವಾಂಶ", "ಸಿಂಪಡಣೆ", "ಬರ", "ಬಿಸಿಲು", "ಗಾಳಿಯ ವೇಗ", "ಐಎಂಡಿ"
        ],
        "content_en": (
            "Operational Rules based on Weather Forecasts: "
            "1. Chemical Spraying Rule: Do not spray pesticides/fungicides if precipitation probability > 50% "
            "or wind speed > 15 km/h, as chemical drift and rain wash-off cause economic loss and water pollution. "
            "2. Disease Advisory: If relative humidity exceeds 85% for 3 consecutive days combined with temperatures between 20-28°C, "
            "proactively scout for fungal diseases (Late Blight in tomato, Blast in ragi, Purple Blotch in onion). "
            "3. Dry Spell Advisory: If no rain occurs for 14 days during vegetative/flowering phase, provide life-saving protective irrigation."
        ),
        "content_kn": (
            "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಆಧಾರಿತ ಕೃಷಿ ನಿಯಮಗಳು: "
            "1. ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ನಿಯಮ: ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ 50% ಕ್ಕಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ಅಥವಾ ಗಾಳಿಯ ವೇಗ ಗಂಟೆಗೆ 15 ಕಿ.ಮೀ ಗಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ಔಷಧ ಸಿಂಪಡಿಸಬೇಡಿ. "
            "2. ರೋಗ ಮುನ್ಸೂಚನೆ: ಸತತ 3 ದಿನ ಗಾಳಿಯಲ್ಲಿ ತೇವಾಂಶ 85% ಕ್ಕಿಂತ ಹೆಚ್ಚಿದ್ದು ತಾಪಮಾನ 20-28°C ಇದ್ದರೆ ಶಿಲೀಂಧ್ರ ರೋಗಗಳು (ಟೊಮೆಟೊ ಅಂಗಮಾರಿ, ರಾಗಿ ಬೆಂಕಿ ರೋಗ, ಈರುಳ್ಳಿ ಕಪ್ಪು ಕಲೆ) ಬರುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು. "
            "3. ಮಳೆ ಕೊರತೆ ನಿಯಮ: ಬೆಳೆಯ ಹೂವಾಡುವ ಹಂತದಲ್ಲಿ ಸತತ 14 ದಿನ ಮಳೆಯಾಗದಿದ್ದರೆ ಜೀವ ರಕ್ಷಕ ನೀರಾವರಿ ಒದಗಿಸಬೇಕು."
        ),
        "numeric_facts": {
            "max_wind_speed_spray_kmh": 15.0,
            "min_humidity_disease_risk_pct": 85.0,
            "dry_spell_days_threshold": 14,
        }
    },
    {
        "chunk_id": "AGMARKNET-GRADES-001",
        "doc_id": "DMI-AGMARKNET-GRADES",
        "issuer": "Directorate of Marketing & Inspection (DMI), Ministry of Agriculture",
        "document_title": "Grading, Marking and Quality Standards for Agricultural Produce in APMC Yards",
        "source_url": "https://agmarknet.gov.in/QualityStandards/Tomato_Onion_Standards.pdf",
        "publication_date": "2022-11-05",
        "retrieval_date": "2026-10-21",
        "version": "DMI Standards 2022 v1.3",
        "section": "Commercial Grade Specifications: Tomato (Table Grade) and Onion (Dry Bulb Grade)",
        "covered_crop": "Tomato, Onion",
        "covered_region": "Karnataka APMC Markets (Kolar, Bangalore, Hubli, Belgaum)",
        "language": "en/kn",
        "keywords": [
            "apmc", "grading", "mandi", "modal price", "quality", "sorting", "faq",
            "ಎಪಿಎಂಸಿ", "ಮಂಡಿ", "ದರ್ಜೆ", "ಗ್ರೇಡಿಂಗ್", "ಮಾದರಿ ಬೆಲೆ", "ಗುಣಮಟ್ಟ", "ಮಾರುಕಟ್ಟೆ"
        ],
        "content_en": (
            "APMC Mandi Quality Parameters: "
            "1. Tomato Grades: Grade Extra Class / Super (>65 mm diameter, firm, free from sunscald or cracking), "
            "Grade I (50-65 mm, uniform ripening), Grade II (<50 mm or minor superficial blemishes). "
            "Grade I produce typically commands a 20-30% premium over the market modal price. "
            "2. Onion Grades: Bulbs must be properly cured with dry, tight outer papery skin. "
            "Size Grade Large (>55 mm diameter), Medium (45-55 mm), Small (<45 mm). "
            "Moisture content of outer neck must be <14% to prevent rotting during transit."
        ),
        "content_kn": (
            "ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ಗುಣಮಟ್ಟದ ಮಾನದಂಡಗಳು: "
            "1. ಟೊಮೆಟೊ ಗ್ರೇಡಿಂಗ್: ಸೂಪರ್ ಗ್ರೇಡ್ (65 ಮಿ.ಮೀ ಗಿಂತ ದೊಡ್ಡದು, ಬಿರುಕಿಲ್ಲದ ಗಟ್ಟಿ ಕಾಯಿ), "
            "ಮೊದಲ ದರ್ಜೆ (50-65 ಮಿ.ಮೀ ಗಾತ್ರ), ಎರಡನೇ ದರ್ಜೆ (50 ಮಿ.ಮೀ ಗಿಂತ ಚಿಕ್ಕದು). "
            "ಉತ್ತಮ ಗ್ರೇಡಿಂಗ್ ಮಾಡಿದ ಟೊಮೆಟೊಗೆ ಮಾರುಕಟ್ಟೆಯ ಮಾದರಿ ಬೆಲೆಗಿಂತ 20-30% ಹೆಚ್ಚಿನ ದರ ಸಿಗುತ್ತದೆ. "
            "2. ಈರುಳ್ಳಿ ಗ್ರೇಡಿಂಗ್: ಒಣಗಿದ ತೆಳುವಾದ ಸಿಪ್ಪೆಯುಳ್ಳ ಗೆಡ್ಡೆಗಳು. ದೊಡ್ಡ ಗಾತ್ರ (>55 ಮಿ.ಮೀ), ಮಧ್ಯಮ (45-55 ಮಿ.ಮೀ). "
            "ಸಾಗಾಣಿಕೆಯಲ್ಲಿ ಕೊಳೆಯುವುದನ್ನು ತಪ್ಪಿಸಲು ಈರುಳ್ಳಿಯ ಕುತ್ತಿಗೆ ಭಾಗದಲ್ಲಿ ತೇವಾಂಶ 14% ಕ್ಕಿಂತ ಕಡಿಮೆ ಇರಬೇಕು."
        ),
        "numeric_facts": {
            "tomato_grade_1_size_mm": "50-65",
            "tomato_super_size_mm": ">65",
            "onion_large_size_mm": ">55",
            "onion_max_neck_moisture_pct": 14.0,
            "graded_price_premium_pct": "20-30%",
        }
    }
]


def get_all_sources_metadata() -> List[Dict[str, Any]]:
    """Returns unique document sources with complete metadata."""
    sources_map: Dict[str, Dict[str, Any]] = {}
    for chunk in KNOWLEDGE_DOCUMENTS:
        doc_id = chunk["doc_id"]
        if doc_id not in sources_map:
            sources_map[doc_id] = {
                "doc_id": doc_id,
                "issuer": chunk["issuer"],
                "title": chunk["document_title"],
                "source_url": chunk["source_url"],
                "publication_date": chunk["publication_date"],
                "retrieval_date": chunk["retrieval_date"],
                "version": chunk["version"],
                "covered_crops": [chunk["covered_crop"]],
                "covered_regions": [chunk["covered_region"]],
                "total_chunks": 1,
            }
        else:
            if chunk["covered_crop"] not in sources_map[doc_id]["covered_crops"]:
                sources_map[doc_id]["covered_crops"].append(chunk["covered_crop"])
            sources_map[doc_id]["total_chunks"] += 1

    return list(sources_map.values())
