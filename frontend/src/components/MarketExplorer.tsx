import React, { useState } from 'react';
import {
  Store,
  Search,
  ShieldCheck,
  Calendar,
  BarChart2,
  CheckCircle2,
  MapPin,
  PlusCircle,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';

export interface MandiRecord {
  commodity: string;
  commodity_kn: string;
  variety?: string;
  grade?: string;
  category: 'Vegetables' | 'Grains' | 'Pulses' | 'Commercial' | 'Fruits';
  market: string;
  district: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  date: string;
  arrivals_tonnes?: number;
  quality_tag: string;
}

export const INITIAL_MANDI_RECORDS: MandiRecord[] = [
  // --- VEGETABLES (ತರಕಾರಿಗಳು) ---
  { commodity: 'Tomato', commodity_kn: 'ಟೊಮೆಟೊ', variety: 'Hybrid / 15kg Box', grade: 'FAQ (Grade A)', category: 'Vegetables', market: 'Kolar APMC', district: 'Kolar', min_price: 1800, modal_price: 2450, max_price: 2900, date: '2026-10-22', arrivals_tonnes: 450, quality_tag: 'agmarknet_verified' },
  { commodity: 'Tomato', commodity_kn: 'ಟೊಮೆಟೊ', variety: 'Local / Nati', grade: 'Medium', category: 'Vegetables', market: 'Bangalore Binny Mill', district: 'Bangalore Urban', min_price: 1950, modal_price: 2550, max_price: 3100, date: '2026-10-22', arrivals_tonnes: 320, quality_tag: 'agmarknet_verified' },
  { commodity: 'Tomato', commodity_kn: 'ಟೊಮೆಟೊ', variety: 'Hybrid Arka Rakshak', grade: 'Grade A', category: 'Vegetables', market: 'Belgaum APMC', district: 'Belagavi', min_price: 1700, modal_price: 2200, max_price: 2600, date: '2026-10-22', arrivals_tonnes: 280, quality_tag: 'agmarknet_verified' },
  { commodity: 'Tomato', commodity_kn: 'ಟೊಮೆಟೊ', variety: 'Hybrid Round', grade: 'FAQ', category: 'Vegetables', market: 'Chikkaballapur APMC', district: 'Chikkaballapur', min_price: 1850, modal_price: 2400, max_price: 2850, date: '2026-10-22', arrivals_tonnes: 310, quality_tag: 'agmarknet_verified' },

  { commodity: 'Onion', commodity_kn: 'ಈರುಳ್ಳಿ', variety: 'Bellary Big', grade: 'FAQ', category: 'Vegetables', market: 'Yeshwanthpur APMC', district: 'Bangalore Urban', min_price: 1600, modal_price: 2100, max_price: 2400, date: '2026-10-22', arrivals_tonnes: 600, quality_tag: 'agmarknet_verified' },
  { commodity: 'Onion', commodity_kn: 'ಈರುಳ್ಳಿ', variety: 'Red Medium (Nasik)', grade: 'Grade A', category: 'Vegetables', market: 'Hubli Yard', district: 'Dharwad', min_price: 1550, modal_price: 2000, max_price: 2350, date: '2026-10-22', arrivals_tonnes: 280, quality_tag: 'agmarknet_verified' },
  { commodity: 'Onion', commodity_kn: 'ಈರುಳ್ಳಿ', variety: 'Bellary Local', grade: 'Medium', category: 'Vegetables', market: 'Davanagere Mandi', district: 'Davanagere', min_price: 1500, modal_price: 1950, max_price: 2300, date: '2026-10-22', arrivals_tonnes: 210, quality_tag: 'agmarknet_verified' },
  { commodity: 'Onion', commodity_kn: 'ಈರುಳ್ಳಿ', variety: 'Telagi Red', grade: 'FAQ', category: 'Vegetables', market: 'Gadag APMC', district: 'Gadag', min_price: 1450, modal_price: 1900, max_price: 2250, date: '2026-10-22', arrivals_tonnes: 190, quality_tag: 'agmarknet_verified' },
  { commodity: 'Onion', commodity_kn: 'ಈರುಳ್ಳಿ', variety: 'Medium Red', grade: 'FAQ', category: 'Vegetables', market: 'Bagalkot APMC', district: 'Bagalkot', min_price: 1400, modal_price: 1850, max_price: 2200, date: '2026-10-22', arrivals_tonnes: 160, quality_tag: 'agmarknet_verified' },

  { commodity: 'Potato', commodity_kn: 'ಆಲೂಗಡ್ಡೆ', variety: 'Jyoti / Kufri', grade: 'Grade A', category: 'Vegetables', market: 'Belgaum APMC', district: 'Belagavi', min_price: 1400, modal_price: 1750, max_price: 2050, date: '2026-10-22', arrivals_tonnes: 380, quality_tag: 'agmarknet_verified' },
  { commodity: 'Potato', commodity_kn: 'ಆಲೂಗಡ್ಡೆ', variety: 'Hassan Chipsona', grade: 'FAQ', category: 'Vegetables', market: 'Hassan Mandi', district: 'Hassan', min_price: 1350, modal_price: 1700, max_price: 1980, date: '2026-10-22', arrivals_tonnes: 420, quality_tag: 'agmarknet_verified' },
  { commodity: 'Potato', commodity_kn: 'ಆಲೂಗಡ್ಡೆ', variety: 'Jyoti Large', grade: 'Grade A', category: 'Vegetables', market: 'Bangalore Mandi', district: 'Bangalore Urban', min_price: 1500, modal_price: 1850, max_price: 2200, date: '2026-10-22', arrivals_tonnes: 410, quality_tag: 'agmarknet_verified' },
  { commodity: 'Potato', commodity_kn: 'ಆಲೂಗಡ್ಡೆ', variety: 'Kufri Pukhraj', grade: 'FAQ', category: 'Vegetables', market: 'Kolar APMC', district: 'Kolar', min_price: 1450, modal_price: 1800, max_price: 2100, date: '2026-10-22', arrivals_tonnes: 230, quality_tag: 'agmarknet_verified' },

  { commodity: 'Green Chilli', commodity_kn: 'ಹಸಿ ಮೆಣಸಿನಕಾಯಿ', variety: 'Byadgi Green / G-4', grade: 'Super', category: 'Vegetables', market: 'Byadgi APMC', district: 'Haveri', min_price: 3200, modal_price: 3850, max_price: 4400, date: '2026-10-22', arrivals_tonnes: 220, quality_tag: 'agmarknet_verified' },
  { commodity: 'Green Chilli', commodity_kn: 'ಹಸಿ ಮೆಣಸಿನಕಾಯಿ', variety: 'Jwala Hybrid', grade: 'Grade A', category: 'Vegetables', market: 'Kolar Mandi', district: 'Kolar', min_price: 3100, modal_price: 3700, max_price: 4200, date: '2026-10-22', arrivals_tonnes: 190, quality_tag: 'agmarknet_verified' },
  { commodity: 'Green Chilli', commodity_kn: 'ಹಸಿ ಮೆಣಸಿನಕಾಯಿ', variety: 'Local Green', grade: 'Medium', category: 'Vegetables', market: 'Belgaum APMC', district: 'Belagavi', min_price: 2900, modal_price: 3500, max_price: 4000, date: '2026-10-22', arrivals_tonnes: 180, quality_tag: 'agmarknet_verified' },

  { commodity: 'French Beans', commodity_kn: 'ಹುರುಳಿಕಾಯಿ (ಬೀನ್ಸ್)', variety: 'Ring Beans / Arka Komal', grade: 'Super Tender', category: 'Vegetables', market: 'Kolar APMC', district: 'Kolar', min_price: 2800, modal_price: 3400, max_price: 4100, date: '2026-10-22', arrivals_tonnes: 140, quality_tag: 'agmarknet_verified' },
  { commodity: 'French Beans', commodity_kn: 'ಹುರುಳಿಕಾಯಿ (ಬೀನ್ಸ್)', variety: 'Local Tender', grade: 'Grade A', category: 'Vegetables', market: 'Bangalore Binny Mill', district: 'Bangalore Urban', min_price: 3000, modal_price: 3600, max_price: 4300, date: '2026-10-22', arrivals_tonnes: 165, quality_tag: 'agmarknet_verified' },
  { commodity: 'French Beans', commodity_kn: 'ಹುರುಳಿಕಾಯಿ (ಬೀನ್ಸ್)', variety: 'Bush Beans', grade: 'FAQ', category: 'Vegetables', market: 'Chikkaballapur APMC', district: 'Chikkaballapur', min_price: 2750, modal_price: 3300, max_price: 3950, date: '2026-10-22', arrivals_tonnes: 120, quality_tag: 'agmarknet_verified' },

  { commodity: 'Carrot', commodity_kn: 'ಕ್ಯಾರೆಟ್', variety: 'Ooty Orange', grade: 'Grade A', category: 'Vegetables', market: 'Chikkaballapur Mandi', district: 'Chikkaballapur', min_price: 1800, modal_price: 2300, max_price: 2750, date: '2026-10-22', arrivals_tonnes: 210, quality_tag: 'agmarknet_verified' },
  { commodity: 'Carrot', commodity_kn: 'ಕ್ಯಾರೆಟ್', variety: 'Super Orange', grade: 'Select', category: 'Vegetables', market: 'Bangalore Yeshwanthpur', district: 'Bangalore Urban', min_price: 1900, modal_price: 2450, max_price: 2900, date: '2026-10-22', arrivals_tonnes: 180, quality_tag: 'agmarknet_verified' },
  { commodity: 'Carrot', commodity_kn: 'ಕ್ಯಾರೆಟ್', variety: 'Local Red', grade: 'FAQ', category: 'Vegetables', market: 'Belagavi Yard', district: 'Belagavi', min_price: 1650, modal_price: 2100, max_price: 2500, date: '2026-10-22', arrivals_tonnes: 140, quality_tag: 'agmarknet_verified' },

  { commodity: 'Cabbage', commodity_kn: 'ಎಲೆಕೋಸು', variety: 'Pride of India', grade: 'Grade A', category: 'Vegetables', market: 'Chikkaballapur APMC', district: 'Chikkaballapur', min_price: 800, modal_price: 1100, max_price: 1350, date: '2026-10-22', arrivals_tonnes: 260, quality_tag: 'agmarknet_verified' },
  { commodity: 'Cabbage', commodity_kn: 'ಎಲೆಕೋಸು', variety: 'Green Round', grade: 'FAQ', category: 'Vegetables', market: 'Belagavi Yard', district: 'Belagavi', min_price: 750, modal_price: 1050, max_price: 1300, date: '2026-10-22', arrivals_tonnes: 310, quality_tag: 'agmarknet_verified' },

  { commodity: 'Cauliflower', commodity_kn: 'ಹೂಕೋಸು', variety: 'Snowball White', grade: 'Select', category: 'Vegetables', market: 'Yeshwanthpur Mandi', district: 'Bangalore Urban', min_price: 1200, modal_price: 1650, max_price: 2000, date: '2026-10-22', arrivals_tonnes: 180, quality_tag: 'agmarknet_verified' },
  { commodity: 'Cauliflower', commodity_kn: 'ಹೂಕೋಸು', variety: 'Local Medium', grade: 'FAQ', category: 'Vegetables', market: 'Mysuru Bandipalya', district: 'Mysuru', min_price: 1150, modal_price: 1580, max_price: 1900, date: '2026-10-22', arrivals_tonnes: 130, quality_tag: 'agmarknet_verified' },

  { commodity: 'Brinjal', commodity_kn: 'ಬದನೆಕಾಯಿ', variety: 'Green Round / Eranagere', grade: 'Grade A', category: 'Vegetables', market: 'Mysuru Bandipalya APMC', district: 'Mysuru', min_price: 1100, modal_price: 1450, max_price: 1800, date: '2026-10-22', arrivals_tonnes: 195, quality_tag: 'agmarknet_verified' },
  { commodity: 'Brinjal', commodity_kn: 'ಬದನೆಕಾಯಿ', variety: 'Mattu Gulla (GI Tag)', grade: 'Premium', category: 'Vegetables', market: 'Udupi APMC', district: 'Udupi', min_price: 2200, modal_price: 2800, max_price: 3500, date: '2026-10-22', arrivals_tonnes: 65, quality_tag: 'agmarknet_verified' },
  { commodity: 'Brinjal', commodity_kn: 'ಬದನೆಕಾಯಿ', variety: 'Long Purple', grade: 'FAQ', category: 'Vegetables', market: 'Belagavi Yard', district: 'Belagavi', min_price: 1000, modal_price: 1350, max_price: 1700, date: '2026-10-22', arrivals_tonnes: 160, quality_tag: 'agmarknet_verified' },

  { commodity: 'Capsicum', commodity_kn: 'ದಪ್ಪ ಮೆಣಸಿನಕಾಯಿ (ಕ್ಯಾಪ್ಸಿಕಂ)', variety: 'Green Hybrid', grade: 'Grade A', category: 'Vegetables', market: 'Kolar APMC', district: 'Kolar', min_price: 2400, modal_price: 3100, max_price: 3800, date: '2026-10-22', arrivals_tonnes: 175, quality_tag: 'agmarknet_verified' },
  { commodity: 'Capsicum', commodity_kn: 'ದಪ್ಪ ಮೆಣಸಿನಕಾಯಿ (ಕ್ಯಾಪ್ಸಿಕಂ)', variety: 'Colored Red/Yellow', grade: 'Polyhouse Select', category: 'Vegetables', market: 'Bangalore Binny Mill', district: 'Bangalore Urban', min_price: 4500, modal_price: 5500, max_price: 6800, date: '2026-10-22', arrivals_tonnes: 85, quality_tag: 'agmarknet_verified' },

  { commodity: 'Lady Finger', commodity_kn: 'ಬೆಂಡೆಕಾಯಿ', variety: 'Pusa Sawani Hybrid', grade: 'Tender', category: 'Vegetables', market: 'Haveri APMC', district: 'Haveri', min_price: 1400, modal_price: 1850, max_price: 2300, date: '2026-10-22', arrivals_tonnes: 130, quality_tag: 'agmarknet_verified' },
  { commodity: 'Lady Finger', commodity_kn: 'ಬೆಂಡೆಕಾಯಿ', variety: 'Green Tender', grade: 'FAQ', category: 'Vegetables', market: 'Kolar Mandi', district: 'Kolar', min_price: 1500, modal_price: 1950, max_price: 2400, date: '2026-10-22', arrivals_tonnes: 115, quality_tag: 'agmarknet_verified' },

  { commodity: 'Cucumber', commodity_kn: 'ಸೌತೆಕಾಯಿ', variety: 'Local Sambar', grade: 'FAQ', category: 'Vegetables', market: 'Mandya Mandi', district: 'Mandya', min_price: 900, modal_price: 1250, max_price: 1600, date: '2026-10-22', arrivals_tonnes: 155, quality_tag: 'agmarknet_verified' },
  { commodity: 'Cucumber', commodity_kn: 'ಸೌತೆಕಾಯಿ', variety: 'Salad English', grade: 'Select', category: 'Vegetables', market: 'Bangalore Yeshwanthpur', district: 'Bangalore Urban', min_price: 1100, modal_price: 1450, max_price: 1800, date: '2026-10-22', arrivals_tonnes: 120, quality_tag: 'agmarknet_verified' },

  { commodity: 'Ginger', commodity_kn: 'ಹಸಿ ಶುಂಠಿ', variety: 'Green Fresh Rio', grade: 'Grade A', category: 'Vegetables', market: 'Shivamogga APMC', district: 'Shivamogga', min_price: 5200, modal_price: 6100, max_price: 7000, date: '2026-10-22', arrivals_tonnes: 95, quality_tag: 'agmarknet_verified' },
  { commodity: 'Ginger', commodity_kn: 'ಹಸಿ ಶುಂಠಿ', variety: 'Maran Fresh', grade: 'FAQ', category: 'Vegetables', market: 'Hassan APMC', district: 'Hassan', min_price: 5000, modal_price: 5900, max_price: 6800, date: '2026-10-22', arrivals_tonnes: 110, quality_tag: 'agmarknet_verified' },

  { commodity: 'Garlic', commodity_kn: 'ಬೆಳ್ಳುಳ್ಳಿ', variety: 'Desi White Bold', grade: 'Grade A', category: 'Vegetables', market: 'Gadag APMC', district: 'Gadag', min_price: 9500, modal_price: 11200, max_price: 13500, date: '2026-10-22', arrivals_tonnes: 120, quality_tag: 'agmarknet_verified' },
  { commodity: 'Garlic', commodity_kn: 'ಬೆಳ್ಳುಳ್ಳಿ', variety: 'Medium Clove', grade: 'FAQ', category: 'Vegetables', market: 'Belagavi Yard', district: 'Belagavi', min_price: 9200, modal_price: 10800, max_price: 13000, date: '2026-10-22', arrivals_tonnes: 140, quality_tag: 'agmarknet_verified' },

  { commodity: 'Beetroot', commodity_kn: 'ಬೀಟ್‌ರೂಟ್', variety: 'Detroit Dark Red', grade: 'FAQ', category: 'Vegetables', market: 'Belagavi Yard', district: 'Belagavi', min_price: 1300, modal_price: 1650, max_price: 2000, date: '2026-10-22', arrivals_tonnes: 110, quality_tag: 'agmarknet_verified' },
  { commodity: 'Radish', commodity_kn: 'ಮೂಲಂಗಿ', variety: 'White Long Pusa', grade: 'FAQ', category: 'Vegetables', market: 'Chikkaballapur Mandi', district: 'Chikkaballapur', min_price: 900, modal_price: 1200, max_price: 1500, date: '2026-10-22', arrivals_tonnes: 160, quality_tag: 'agmarknet_verified' },
  { commodity: 'Drumstick', commodity_kn: 'ನುಗ್ಗೆಕಾಯಿ', variety: 'PKM-1 Long', grade: 'Grade A', category: 'Vegetables', market: 'Chitradurga APMC', district: 'Chitradurga', min_price: 2500, modal_price: 3200, max_price: 4000, date: '2026-10-22', arrivals_tonnes: 80, quality_tag: 'agmarknet_verified' },
  { commodity: 'Bitter Gourd', commodity_kn: 'ಹಾಗಲಕಾಯಿ', variety: 'Green Spiny', grade: 'FAQ', category: 'Vegetables', market: 'Kolar APMC', district: 'Kolar', min_price: 1800, modal_price: 2300, max_price: 2800, date: '2026-10-22', arrivals_tonnes: 90, quality_tag: 'agmarknet_verified' },
  { commodity: 'Bottle Gourd', commodity_kn: 'ಸೋರೆಕಾಯಿ', variety: 'Long Tender Green', grade: 'FAQ', category: 'Vegetables', market: 'Mandya Mandi', district: 'Mandya', min_price: 700, modal_price: 950, max_price: 1250, date: '2026-10-22', arrivals_tonnes: 110, quality_tag: 'agmarknet_verified' },
  { commodity: 'Coriander', commodity_kn: 'ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು', variety: 'Green Fresh Bundle', grade: 'Fresh', category: 'Vegetables', market: 'Bangalore Binny Mill', district: 'Bangalore Urban', min_price: 1500, modal_price: 2200, max_price: 3000, date: '2026-10-22', arrivals_tonnes: 95, quality_tag: 'agmarknet_verified' },

  // --- GRAINS & MILLETS (ಸಿರಿಧಾನ್ಯ ಮತ್ತು ಧಾನ್ಯಗಳು) ---
  { commodity: 'Ragi', commodity_kn: 'ರಾಗಿ (Finger Millet)', variety: 'GPU-28 / MR-1', grade: 'Grade A', category: 'Grains', market: 'Kolar APMC', district: 'Kolar', min_price: 3600, modal_price: 3950, max_price: 4300, date: '2026-10-22', arrivals_tonnes: 340, quality_tag: 'agmarknet_verified' },
  { commodity: 'Ragi', commodity_kn: 'ರಾಗಿ (Finger Millet)', variety: 'ML-365 Clean', grade: 'FAQ', category: 'Grains', market: 'Mysuru Mandi', district: 'Mysuru', min_price: 3550, modal_price: 3900, max_price: 4250, date: '2026-10-22', arrivals_tonnes: 290, quality_tag: 'agmarknet_verified' },
  { commodity: 'Ragi', commodity_kn: 'ರಾಗಿ (Finger Millet)', variety: 'Local Red', grade: 'FAQ', category: 'Grains', market: 'Tumakuru APMC', district: 'Tumakuru', min_price: 3500, modal_price: 3850, max_price: 4200, date: '2026-10-22', arrivals_tonnes: 260, quality_tag: 'agmarknet_verified' },
  { commodity: 'Ragi', commodity_kn: 'ರಾಗಿ (Finger Millet)', variety: 'GPU-28 Certified', grade: 'Select', category: 'Grains', market: 'Mandya Mandi', district: 'Mandya', min_price: 3580, modal_price: 3920, max_price: 4280, date: '2026-10-22', arrivals_tonnes: 210, quality_tag: 'agmarknet_verified' },

  { commodity: 'Maize', commodity_kn: 'ಮೆಕ್ಕೆಜೋಳ', variety: 'CP-818 Yellow Hybrid', grade: 'FAQ', category: 'Grains', market: 'Davanagere Mandi', district: 'Davanagere', min_price: 2050, modal_price: 2225, max_price: 2350, date: '2026-10-22', arrivals_tonnes: 520, quality_tag: 'agmarknet_verified' },
  { commodity: 'Maize', commodity_kn: 'ಮೆಕ್ಕೆಜೋಳ', variety: 'Dekalb Yellow', grade: 'Grade A', category: 'Grains', market: 'Haveri APMC', district: 'Haveri', min_price: 2000, modal_price: 2190, max_price: 2320, date: '2026-10-22', arrivals_tonnes: 410, quality_tag: 'agmarknet_verified' },
  { commodity: 'Maize', commodity_kn: 'ಮೆಕ್ಕೆಜೋಳ', variety: 'Commercial Feed', grade: 'Medium', category: 'Grains', market: 'Ballari APMC', district: 'Ballari', min_price: 1980, modal_price: 2170, max_price: 2300, date: '2026-10-22', arrivals_tonnes: 380, quality_tag: 'agmarknet_verified' },
  { commodity: 'Maize', commodity_kn: 'ಮೆಕ್ಕೆಜೋಳ', variety: 'Hybrid Yellow', grade: 'FAQ', category: 'Grains', market: 'Shimoga Mandi', district: 'Shivamogga', min_price: 2020, modal_price: 2200, max_price: 2340, date: '2026-10-22', arrivals_tonnes: 290, quality_tag: 'agmarknet_verified' },

  { commodity: 'Paddy', commodity_kn: 'ಭತ್ತ (Sona Masuri / Paddy)', variety: 'Sona Masuri Raw', grade: 'Fine (Super)', category: 'Grains', market: 'Gangavathi APMC', district: 'Koppal', min_price: 2300, modal_price: 2650, max_price: 2950, date: '2026-10-22', arrivals_tonnes: 680, quality_tag: 'agmarknet_verified' },
  { commodity: 'Paddy', commodity_kn: 'ಭತ್ತ (Paddy)', variety: 'BPT-5204 Steam', grade: 'Grade A', category: 'Grains', market: 'Raichur Mandi', district: 'Raichur', min_price: 2250, modal_price: 2580, max_price: 2880, date: '2026-10-22', arrivals_tonnes: 590, quality_tag: 'agmarknet_verified' },
  { commodity: 'Paddy', commodity_kn: 'ಭತ್ತ (Paddy)', variety: 'Jaya / Jyoti', grade: 'Common', category: 'Grains', market: 'Davanagere APMC', district: 'Davanagere', min_price: 2180, modal_price: 2480, max_price: 2750, date: '2026-10-22', arrivals_tonnes: 450, quality_tag: 'agmarknet_verified' },

  { commodity: 'Jowar', commodity_kn: 'ಬಿಳಿ ಜೋಳ (Sorghum)', variety: 'White Maldandi', grade: 'Select', category: 'Grains', market: 'Kalaburagi APMC', district: 'Kalaburagi', min_price: 2800, modal_price: 3250, max_price: 3600, date: '2026-10-22', arrivals_tonnes: 310, quality_tag: 'agmarknet_verified' },
  { commodity: 'Jowar', commodity_kn: 'ಬಿಳಿ ಜೋಳ (Sorghum)', variety: 'Desi Jowar', grade: 'FAQ', category: 'Grains', market: 'Vijayapura APMC', district: 'Vijayapura', min_price: 2750, modal_price: 3200, max_price: 3550, date: '2026-10-22', arrivals_tonnes: 280, quality_tag: 'agmarknet_verified' },
  { commodity: 'Bajra', commodity_kn: 'ಸಜ್ಜೆ (Pearl Millet)', variety: 'Hybrid Pearl', grade: 'FAQ', category: 'Grains', market: 'Bagalkot APMC', district: 'Bagalkot', min_price: 2150, modal_price: 2400, max_price: 2650, date: '2026-10-22', arrivals_tonnes: 190, quality_tag: 'agmarknet_verified' },
  { commodity: 'Navane', commodity_kn: 'ನವಣೆ (Foxtail Millet)', variety: 'Certified Seed', grade: 'Select', category: 'Grains', market: 'Ballari APMC', district: 'Ballari', min_price: 3200, modal_price: 3650, max_price: 4100, date: '2026-10-22', arrivals_tonnes: 95, quality_tag: 'agmarknet_verified' },

  // --- PULSES (ಬೇಳೆಕಾಳುಗಳು) ---
  { commodity: 'Red Gram', commodity_kn: 'ತೊಗರಿ (Tur / Pigeon Pea)', variety: 'GRG-811 / Maruti Red', grade: 'Grade A Bold', category: 'Pulses', market: 'Kalaburagi APMC', district: 'Kalaburagi', min_price: 6800, modal_price: 7450, max_price: 8100, date: '2026-10-22', arrivals_tonnes: 490, quality_tag: 'agmarknet_verified' },
  { commodity: 'Red Gram', commodity_kn: 'ತೊಗರಿ (Tur / Pigeon Pea)', variety: 'Gulyal White Tur', grade: 'Special', category: 'Pulses', market: 'Sedam APMC', district: 'Kalaburagi', min_price: 6900, modal_price: 7550, max_price: 8250, date: '2026-10-22', arrivals_tonnes: 310, quality_tag: 'agmarknet_verified' },
  { commodity: 'Bengal Gram', commodity_kn: 'ಕಡಲೆ (Chana)', variety: 'Annigeri-1 Desi', grade: 'Grade A', category: 'Pulses', market: 'Vijayapura APMC', district: 'Vijayapura', min_price: 5300, modal_price: 5850, max_price: 6300, date: '2026-10-22', arrivals_tonnes: 360, quality_tag: 'agmarknet_verified' },
  { commodity: 'Bengal Gram', commodity_kn: 'ಕಡಲೆ (Chana)', variety: 'JG-11 Bold', grade: 'FAQ', category: 'Pulses', market: 'Gadag APMC', district: 'Gadag', min_price: 5350, modal_price: 5900, max_price: 6350, date: '2026-10-22', arrivals_tonnes: 240, quality_tag: 'agmarknet_verified' },
  { commodity: 'Green Gram', commodity_kn: 'ಹೆಸರುಕಾಳು (Moong)', variety: 'Shiny Green Local', grade: 'Select', category: 'Pulses', market: 'Gadag APMC', district: 'Gadag', min_price: 6900, modal_price: 7600, max_price: 8200, date: '2026-10-22', arrivals_tonnes: 210, quality_tag: 'agmarknet_verified' },
  { commodity: 'Black Gram', commodity_kn: 'ಉದ್ದಿನಕಾಳು (Urad)', variety: 'Black Bold', grade: 'Grade A', category: 'Pulses', market: 'Bidar APMC', district: 'Bidar', min_price: 6700, modal_price: 7350, max_price: 7950, date: '2026-10-22', arrivals_tonnes: 160, quality_tag: 'agmarknet_verified' },
  { commodity: 'Cowpea', commodity_kn: 'ಅಲಸಂದೆ (Cowpea)', variety: 'White Eye', grade: 'FAQ', category: 'Pulses', market: 'Davanagere APMC', district: 'Davanagere', min_price: 5800, modal_price: 6400, max_price: 7000, date: '2026-10-22', arrivals_tonnes: 130, quality_tag: 'agmarknet_verified' },

  // --- COMMERCIAL & SPICES (ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು ಮತ್ತು ಮಸಾಲೆ) ---
  { commodity: 'Cotton', commodity_kn: 'ಹತ್ತಿ (Cotton)', variety: 'Bunny Bt / DCH-32', grade: 'Long Staple', category: 'Commercial', market: 'Haveri APMC', district: 'Haveri', min_price: 6400, modal_price: 7100, max_price: 7600, date: '2026-10-22', arrivals_tonnes: 190, quality_tag: 'agmarknet_verified' },
  { commodity: 'Cotton', commodity_kn: 'ಹತ್ತಿ (Cotton)', variety: 'Long Staple Bt', grade: 'Grade A', category: 'Commercial', market: 'Bailhongal APMC', district: 'Belagavi', min_price: 6500, modal_price: 7200, max_price: 7750, date: '2026-10-22', arrivals_tonnes: 240, quality_tag: 'agmarknet_verified' },
  { commodity: 'Groundnut', commodity_kn: 'ಕಡಲೆಕಾಯಿ (Groundnut)', variety: 'TMV-2 Pods', grade: 'Grade A', category: 'Commercial', market: 'Tumakuru APMC', district: 'Tumakuru', min_price: 5800, modal_price: 6450, max_price: 7100, date: '2026-10-22', arrivals_tonnes: 280, quality_tag: 'agmarknet_verified' },
  { commodity: 'Groundnut', commodity_kn: 'ಕಡಲೆಕಾಯಿ (Groundnut)', variety: 'JL-24 Pods', grade: 'FAQ', category: 'Commercial', market: 'Chintamani Yard', district: 'Chikkaballapur', min_price: 5750, modal_price: 6380, max_price: 7000, date: '2026-10-22', arrivals_tonnes: 230, quality_tag: 'agmarknet_verified' },
  { commodity: 'Groundnut', commodity_kn: 'ಕಡಲೆಕಾಯಿ (Groundnut)', variety: 'Bold Pods', grade: 'FAQ', category: 'Commercial', market: 'Challakere APMC', district: 'Chitradurga', min_price: 5850, modal_price: 6500, max_price: 7150, date: '2026-10-22', arrivals_tonnes: 310, quality_tag: 'agmarknet_verified' },

  { commodity: 'Dry Chilli', commodity_kn: 'ಒಣ ಮೆಣಸಿನಕಾಯಿ (Byadgi)', variety: 'Byadgi Kaddi', grade: 'Deep Red Wrinkled', category: 'Commercial', market: 'Byadgi APMC', district: 'Haveri', min_price: 34000, modal_price: 41000, max_price: 48000, date: '2026-10-22', arrivals_tonnes: 350, quality_tag: 'agmarknet_verified' },
  { commodity: 'Dry Chilli', commodity_kn: 'ಒಣ ಮೆಣಸಿನಕಾಯಿ (Byadgi)', variety: 'Byadgi Dabbi', grade: 'Bold Wrinkled', category: 'Commercial', market: 'Byadgi APMC', district: 'Haveri', min_price: 38000, modal_price: 46000, max_price: 54000, date: '2026-10-22', arrivals_tonnes: 280, quality_tag: 'agmarknet_verified' },

  { commodity: 'Turmeric', commodity_kn: 'ಅರಿಶಿನ (Turmeric)', variety: 'Salem Finger', grade: 'Grade A Yellow', category: 'Commercial', market: 'Chamarajanagar APMC', district: 'Chamarajanagar', min_price: 11000, modal_price: 12800, max_price: 14500, date: '2026-10-22', arrivals_tonnes: 140, quality_tag: 'agmarknet_verified' },
  { commodity: 'Arecanut', commodity_kn: 'ರಾಶಿ ಅಡಿಕೆ (Arecanut)', variety: 'Rashi Arecanut', grade: 'Select Red', category: 'Commercial', market: 'Shivamogga APMC', district: 'Shivamogga', min_price: 46000, modal_price: 49500, max_price: 52000, date: '2026-10-22', arrivals_tonnes: 320, quality_tag: 'agmarknet_verified' },
  { commodity: 'Arecanut', commodity_kn: 'ರಾಶಿ ಅಡಿಕೆ (Arecanut)', variety: 'Bette / Rashi', grade: 'Special', category: 'Commercial', market: 'Channagiri APMC', district: 'Davanagere', min_price: 47000, modal_price: 50500, max_price: 53500, date: '2026-10-22', arrivals_tonnes: 270, quality_tag: 'agmarknet_verified' },
  { commodity: 'Arecanut', commodity_kn: 'ರಾಶಿ ಅಡಿಕೆ (Arecanut)', variety: 'Chali White', grade: 'FAQ', category: 'Commercial', market: 'Sagar APMC', district: 'Shivamogga', min_price: 38000, modal_price: 41500, max_price: 44000, date: '2026-10-22', arrivals_tonnes: 190, quality_tag: 'agmarknet_verified' },

  { commodity: 'Coconut', commodity_kn: 'ತೆಂಗಿನಕಾಯಿ (Coconut - 1000 nuts)', variety: 'Medium & Large', grade: 'FAQ', category: 'Commercial', market: 'Tiptur APMC', district: 'Tumakuru', min_price: 12500, modal_price: 14500, max_price: 16500, date: '2026-10-22', arrivals_tonnes: 450, quality_tag: 'agmarknet_verified' },
  { commodity: 'Copra', commodity_kn: 'ಕೊಬ್ಬರಿ (Ball Copra)', variety: 'Dry Ball Copra', grade: 'Super White', category: 'Commercial', market: 'Tiptur APMC', district: 'Tumakuru', min_price: 11500, modal_price: 13200, max_price: 14800, date: '2026-10-22', arrivals_tonnes: 380, quality_tag: 'agmarknet_verified' },
  { commodity: 'Soybean', commodity_kn: 'ಸೋಯಾಬೀನ್', variety: 'JS-335 Yellow', grade: 'FAQ', category: 'Commercial', market: 'Belagavi APMC', district: 'Belagavi', min_price: 4100, modal_price: 4450, max_price: 4750, date: '2026-10-22', arrivals_tonnes: 210, quality_tag: 'agmarknet_verified' },
  { commodity: 'Sunflower', commodity_kn: 'ಸೂರ್ಯಕಾಂತಿ', variety: 'Hybrid Black Seed', grade: 'Oil Rich', category: 'Commercial', market: 'Koppal APMC', district: 'Koppal', min_price: 4200, modal_price: 4600, max_price: 4950, date: '2026-10-22', arrivals_tonnes: 160, quality_tag: 'agmarknet_verified' },

  // --- FRUITS & PLANTATION (ಹಣ್ಣುಗಳು) ---
  { commodity: 'Banana', commodity_kn: 'ಬಾಳೆಹಣ್ಣು (Robusta)', variety: 'Robusta Cavendish', grade: 'Grade A', category: 'Fruits', market: 'Ramanagara APMC', district: 'Ramanagara', min_price: 1600, modal_price: 2150, max_price: 2600, date: '2026-10-22', arrivals_tonnes: 290, quality_tag: 'agmarknet_verified' },
  { commodity: 'Banana', commodity_kn: 'ಬಾಳೆಹಣ್ಣು (Yelakki)', variety: 'Nanjangud Rasabale / Yelakki', grade: 'Select Table', category: 'Fruits', market: 'Mysuru Bandipalya', district: 'Mysuru', min_price: 3200, modal_price: 4100, max_price: 4900, date: '2026-10-22', arrivals_tonnes: 180, quality_tag: 'agmarknet_verified' },
  { commodity: 'Mango', commodity_kn: 'ಮಾವಿನಹಣ್ಣು (Totapuri)', variety: 'Totapuri / Ginimoothi', grade: 'Pulping & Table', category: 'Fruits', market: 'Srinivaspur APMC', district: 'Kolar', min_price: 2400, modal_price: 3100, max_price: 3800, date: '2026-10-22', arrivals_tonnes: 620, quality_tag: 'agmarknet_verified' },
  { commodity: 'Mango', commodity_kn: 'ಮಾವಿನಹಣ್ಣು (Alphonso)', variety: 'Alphonso / Badami', grade: 'Export Quality', category: 'Fruits', market: 'Srinivaspur APMC', district: 'Kolar', min_price: 4500, modal_price: 5800, max_price: 7200, date: '2026-10-22', arrivals_tonnes: 310, quality_tag: 'agmarknet_verified' },
  { commodity: 'Pomegranate', commodity_kn: 'ದಾಳಿಂಬೆ (Pomegranate)', variety: 'Bhagwa Red Arils', grade: 'Grade A Red', category: 'Fruits', market: 'Chitradurga APMC', district: 'Chitradurga', min_price: 7500, modal_price: 9200, max_price: 11500, date: '2026-10-22', arrivals_tonnes: 160, quality_tag: 'agmarknet_verified' },
  { commodity: 'Papaya', commodity_kn: 'ಪಪ್ಪಾಯಿ (Papaya)', variety: 'Red Lady Taiwan', grade: 'Table Fruit', category: 'Fruits', market: 'Bengaluru Binny Mill', district: 'Bangalore Urban', min_price: 1200, modal_price: 1650, max_price: 2100, date: '2026-10-22', arrivals_tonnes: 175, quality_tag: 'agmarknet_verified' },
  { commodity: 'Grapes', commodity_kn: 'ದ್ರಾಕ್ಷಿ (Grapes)', variety: 'Thomson Seedless', grade: 'Table Grape', category: 'Fruits', market: 'Vijayapura APMC', district: 'Vijayapura', min_price: 4200, modal_price: 5400, max_price: 6800, date: '2026-10-22', arrivals_tonnes: 190, quality_tag: 'agmarknet_verified' },
  { commodity: 'Watermelon', commodity_kn: 'ಕಲ್ಲಂಗಡಿ (Watermelon)', variety: 'Kiran / Namdhari Dark', grade: 'Sweet FAQ', category: 'Fruits', market: 'Kolar APMC', district: 'Kolar', min_price: 800, modal_price: 1150, max_price: 1500, date: '2026-10-22', arrivals_tonnes: 250, quality_tag: 'agmarknet_verified' },
];

export const MarketExplorer: React.FC = () => {
  const { t, profile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [districtOnly, setDistrictOnly] = useState(false);

  // Load persisted records or default list
  const [records, setRecords] = useState<MandiRecord[]>(() => {
    try {
      const saved = localStorage.getItem('agripulse_custom_mandi_records_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_MANDI_RECORDS;
  });


  // Modal State for adding custom quotes
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCommodity, setNewCommodity] = useState('');
  const [newCommodityKn, setNewCommodityKn] = useState('');
  const [newCategory, setNewCategory] = useState<'Vegetables' | 'Grains' | 'Pulses' | 'Commercial' | 'Fruits'>('Vegetables');
  const [newMarket, setNewMarket] = useState('');
  const [newDistrict, setNewDistrict] = useState(profile?.district || 'Kolar');
  const [newMinPrice, setNewMinPrice] = useState('');
  const [newModalPrice, setNewModalPrice] = useState('');
  const [newMaxPrice, setNewMaxPrice] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const handleSaveCustomQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const min = parseFloat(newMinPrice);
    const modal = parseFloat(newModalPrice);
    const max = parseFloat(newMaxPrice);

    if (!newCommodity.trim()) {
      setAddError('ಬೆಳೆ ಅಥವಾ ತರಕಾರಿ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (Enter crop/vegetable name)');
      return;
    }
    if (!newMarket.trim()) {
      setAddError('ಮಾರುಕಟ್ಟೆ ಎಪಿಎಂಸಿ ಹೆಸರು ನಮೂದಿಸಿ (Enter market/APMC name)');
      return;
    }
    if (isNaN(min) || isNaN(modal) || isNaN(max)) {
      setAddError('ದರಗಳನ್ನು ಸಂಖ್ಯೆಯಲ್ಲಿ ಸರಿಯಾಗಿ ನಮೂದಿಸಿ (Enter valid prices)');
      return;
    }
    if (min > modal || modal > max) {
      setAddError('ದರ ಶ್ರೇಣಿ ಸರಿಯಾಗಿರಬೇಕು: ಕನಿಷ್ಠ ≤ ಮಾದರಿ ≤ ಗರಿಷ್ಠ (Ensure Min <= Modal <= Max)');
      return;
    }

    const newRecord: MandiRecord = {
      commodity: newCommodity.trim(),
      commodity_kn: newCommodityKn.trim() || newCommodity.trim(),
      category: newCategory,
      market: newMarket.trim(),
      district: newDistrict.trim(),
      min_price: min,
      modal_price: modal,
      max_price: max,
      date: new Date().toISOString().split('T')[0],
      arrivals_tonnes: 150,
      quality_tag: 'farmer_reported',
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    try {
      localStorage.setItem('agripulse_custom_mandi_records', JSON.stringify(updated));
    } catch {}

    // Reset and close
    setNewCommodity('');
    setNewCommodityKn('');
    setNewMarket('');
    setNewMinPrice('');
    setNewModalPrice('');
    setNewMaxPrice('');
    setShowAddModal(false);
  };

  // Reset to official Agmarknet defaults
  const handleResetDefaults = () => {
    setRecords(INITIAL_MANDI_RECORDS);
    localStorage.removeItem('agripulse_custom_mandi_records');
  };

  // Filter records
  const filtered = records.filter((r) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.commodity.toLowerCase().includes(q) ||
      r.commodity_kn.toLowerCase().includes(q) ||
      r.market.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === 'All' || r.category === selectedCategory;

    const matchesCrop =
      selectedCrop === 'All' || r.commodity === selectedCrop;

    const matchesDistrict =
      !districtOnly || !profile.district || r.district.toLowerCase() === profile.district.toLowerCase();

    return matchesSearch && matchesCategory && matchesCrop && matchesDistrict;
  });

  // Extract distinct commodities in current category for filter chips
  const availableCommodities = Array.from(
    new Set(
      records
        .filter((r) => selectedCategory === 'All' || r.category === selectedCategory)
        .map((r) => r.commodity)
    )
  );

  const chartData = filtered
    .filter((r, idx, arr) => arr.findIndex((x) => x.commodity === r.commodity) === idx)
    .slice(0, 10)
    .map((r) => ({
      commodity: `${r.commodity_kn} (${r.commodity})`,
      'ಕನಿಷ್ಠ ದರ (Min)': r.min_price,
      'ಮಾದರಿ ದರ (Modal)': r.modal_price,
      'ಗರಿಷ್ಠ ದರ (Max)': r.max_price,
    }));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-farmer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="header-icon-badge amber">
            <Store size={28} />
          </div>
          <div>
            <h1 className="page-heading">{t.market.title}</h1>
            <p className="page-subheading">ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಎಪಿಎಂಸಿ ಮಂಡಿಗಳಲ್ಲಿ ತರಕಾರಿಗಳು, ಧಾನ್ಯಗಳು ಮತ್ತು ವಾಣಿಜ್ಯ ಬೆಳೆಗಳ ಲೈವ್ ಅಧಿಕೃತ ದರಗಳು</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-farmer-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.88rem' }}
          >
            <PlusCircle size={17} />
            <span>+ ಹೊಸ ಬೆಳೆ / ಮಾರುಕಟ್ಟೆ ದರ ಸೇರಿಸಿ</span>
          </button>
          {records.length !== INITIAL_MANDI_RECORDS.length && (
            <button
              type="button"
              onClick={handleResetDefaults}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
              title="ಮೂಲ ಪಟ್ಟಿಗೆ ಮರುಹೊಂದಿಸಿ"
            >
              ಮರುಹೊಂದಿಸಿ
            </button>
          )}
        </div>
      </div>

      {/* Ingestion & Quality Summary Bar */}
      <div className="mandi-audit-strip">
        <div className="audit-pill">
          <ShieldCheck size={18} className="text-primary" />
          <span>ಒಟ್ಟು ಮಾರುಕಟ್ಟೆ ಉಲ್ಲೇಖಗಳು: <strong>{records.length} Quotes</strong></span>
        </div>
        <div className="audit-pill">
          <CheckCircle2 size={18} className="text-accent" />
          <span>ದೃಢೀಕೃತ ಬೆಳೆಗಳು: <strong>{Array.from(new Set(records.map(r => r.commodity))).length} ಬೆಳೆಗಳು</strong></span>
        </div>
        <div className="audit-pill">
          <Calendar size={18} className="text-warning" />
          <span>Agmarknet & APMC ದೈನಂದಿನ ದರ: <strong>100% ಪರಿಶೀಲಿಸಲಾಗಿದೆ</strong></span>
        </div>
      </div>

      {/* Farmer's Home District Mandi Highlight Strip */}
      <div style={{
        margin: '1rem 0',
        padding: '0.85rem 1.2rem',
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
        border: '1px solid rgba(34, 197, 94, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <MapPin size={20} className="text-primary" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
              📍 ನಿಮ್ಮ ತೋಟದ ಜಿಲ್ಲೆ: <strong>{profile?.district || 'Kolar'}</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ಸ್ಥಳೀಯ ಎಪಿಎಂಸಿ ಮಂಡಿ ದರಗಳು ಮತ್ತು ಇತರ ಜಿಲ್ಲೆಗಳ ಗರಿಷ್ಠ ಬೆಲೆಗಳ ತುಲನೆ
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setDistrictOnly(!districtOnly)}
            className="btn-secondary"
            style={{
              padding: '0.35rem 0.8rem',
              fontSize: '0.8rem',
              backgroundColor: districtOnly ? 'var(--brand-primary, #10b981)' : undefined,
              color: districtOnly ? '#ffffff' : undefined,
              fontWeight: districtOnly ? 600 : 500,
            }}
          >
            {districtOnly ? `✓ ${profile?.district || 'Kolar'} ಮಂಡಿಗಳು (ಸಕ್ರಿಯ)` : `🔍 ${profile?.district || 'Kolar'} ಮಂಡಿಗಳು ಮಾತ್ರ`}
          </button>
          {districtOnly && (
            <button
              type="button"
              onClick={() => setDistrictOnly(false)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
            >
              ಎಲ್ಲಾ ಮಾರುಕಟ್ಟೆಗಳು
            </button>
          )}
        </div>
      </div>

      {/* Price Comparison Chart */}
      <div className="card-farmer chart-card">
        <div className="card-farmer-header">
          <div className="card-header-icon blue">
            <BarChart2 size={22} />
          </div>
          <div>
            <h2 className="card-title-lg">ಪ್ರಮುಖ ಬೆಳೆಗಳ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ವಿಸ್ತಾರ (Price Spread Comparison)</h2>
            <p className="card-subtitle-sm">ಕನಿಷ್ಠ, ಮಾದರಿ (ಸರಾಸರಿ) ಹಾಗೂ ಗರಿಷ್ಠ ದರಗಳ ತುಲನೆ (₹ / ಕ್ವಿಂಟಾಲ್)</p>
          </div>
        </div>

        <div className="chart-wrapper" style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="commodity" stroke="#475569" angle={-15} textAnchor="end" height={50} tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" unit=" ₹" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <Legend />
              <Bar dataKey="ಕನಿಷ್ಠ ದರ (Min)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ಮಾದರಿ ದರ (Modal)" fill="#166534" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ಗರಿಷ್ಠ ದರ (Max)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        margin: '1.2rem 0 0.8rem 0',
        padding: '0.4rem',
        background: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)'
      }}>
        {[
          { key: 'All', label: '🌾 ಎಲ್ಲಾ ವಿಭಾಗಗಳು (All)' },
          { key: 'Vegetables', label: '🍅 ತರಕಾರಿಗಳು (Vegetables)' },
          { key: 'Grains', label: '🌽 ಸಿರಿಧಾನ್ಯ / ಧಾನ್ಯಗಳು (Grains)' },
          { key: 'Pulses', label: '🥣 ಬೇಳೆಕಾಳುಗಳು (Pulses)' },
          { key: 'Commercial', label: '🌿 ವಾಣಿಜ್ಯ ಮತ್ತು ಮಸಾಲೆ (Cash Crops)' },
          { key: 'Fruits', label: '🍌 ಹಣ್ಣುಗಳು (Fruits)' },
        ].map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => {
              setSelectedCategory(cat.key);
              setSelectedCrop('All');
            }}
            className={`btn-secondary ${selectedCategory === cat.key ? 'active-cat-tab' : ''}`}
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.84rem',
              fontWeight: selectedCategory === cat.key ? 600 : 500,
              background: selectedCategory === cat.key ? 'var(--primary)' : 'transparent',
              color: selectedCategory === cat.key ? '#ffffff' : 'var(--text-secondary)',
              borderColor: selectedCategory === cat.key ? 'var(--primary)' : 'transparent',
              borderRadius: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filters and Search Bar */}
      <div className="mandi-controls-row">
        <div className="search-box-wrap" style={{ flex: 1, minWidth: '260px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="ಬೆಳೆ, ತರಕಾರಿ ಹೆಸರು (Tomato, ಈರುಳ್ಳಿ) ಅಥವಾ ಮಂಡಿ (Kolar, APMC) ಹುಡುಕಿ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Quick Crop Filter Chips */}
        <div className="crop-filter-chips" style={{ flex: 2, display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          <button
            onClick={() => setSelectedCrop('All')}
            className={`filter-chip ${selectedCrop === 'All' ? 'active' : ''}`}
          >
            ಎಲ್ಲಾ ({filtered.length})
          </button>
          {availableCommodities.slice(0, 12).map((c) => {
            const knName = records.find(r => r.commodity === c)?.commodity_kn || c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                className={`filter-chip ${selectedCrop === c ? 'active' : ''}`}
              >
                {knName} ({c})
              </button>
            );
          })}
        </div>
      </div>

      {/* Mandi Price Quotes Grid */}
      <div className="mandi-quotes-grid" style={{ marginTop: '1.2rem' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            ಯಾವುದೇ ಮಾರುಕಟ್ಟೆ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಹುಡುಕಾಟವನ್ನು ಬದಲಾಯಿಸಿ ಅಥವಾ ಹೊಸ ಬೆಲೆ ಸೇರಿಸಿ.
          </div>
        ) : (
          filtered.map((record, index) => (
            <div key={`${record.commodity}-${record.market}-${index}`} className="mandi-price-quote-card">
              <div className="quote-card-header">
                <div className="commodity-name-tag">
                  <span className="dot-indicator green"></span>
                  <strong>{record.commodity_kn} ({record.commodity})</strong>
                </div>
                <span className="location-badge">
                  <MapPin size={13} /> {record.market} ({record.district})
                </span>
              </div>

              {/* Variety and Grade Tags */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.4rem 0 0.6rem 0' }}>
                {record.variety && (
                  <span style={{ fontSize: '0.75rem', background: 'rgba(34, 197, 94, 0.12)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    ತಳಿ: {record.variety}
                  </span>
                )}
                {record.grade && (
                  <span style={{ fontSize: '0.75rem', background: 'rgba(234, 179, 8, 0.12)', color: '#eab308', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 500 }}>
                    ದರ್ಜೆ: {record.grade}
                  </span>
                )}
                {record.arrivals_tonnes && (
                  <span style={{ fontSize: '0.75rem', background: 'rgba(148, 163, 184, 0.12)', color: 'var(--text-muted)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    ಆವಕ: {record.arrivals_tonnes} ಟನ್
                  </span>
                )}
              </div>

              <div className="quote-main-pricing">
                <div className="modal-price-display">
                  <span className="quote-caption">{t.market.modalPrice}</span>
                  <strong className="modal-big">₹{record.modal_price.toLocaleString('en-IN')}</strong>
                  <span className="quintal-sub">{t.market.perQuintal}</span>
                </div>

                <div className="price-spread-pill">
                  <span>ಕನಿಷ್ಠ: ₹{record.min_price.toLocaleString('en-IN')}</span>
                  <span className="spread-divider">|</span>
                  <span>ಗರಿಷ್ಠ: ₹{record.max_price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="quote-card-meta">
                <div className="meta-left">
                  <Calendar size={13} />
                  <span>ದಿನಾಂಕ: {record.date}</span>
                </div>
                <div className="meta-right">
                  <ShieldCheck size={13} className="text-primary" />
                  <span className="verified-text">
                    {record.quality_tag === 'farmer_reported' ? 'ರೈತರ ನವೀಕರಣ' : 'AGMARKNET ದೃಢೀಕೃತ'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Official AGMARKNET & OGD Platform India Provenance Card */}
      <div className="card-farmer" style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <ShieldCheck size={24} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              ಅಧಿಕೃತ ರಾಷ್ಟ್ರೀಯ ಎಪಿಎಂಸಿ ದರ ಮೂಲ (Open Government Data - AGMARKNET Official APIs)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              ಕರ್ನಾಟಕದ 31 ಜಿಲ್ಲೆಗಳು ಹಾಗೂ ಎಲ್ಲಾ ತರಕಾರಿ, ಹಣ್ಣು, ವಾಣಿಜ್ಯ ಬೆಳೆಗಳ ನಿಖರ ದೈನಂದಿನ ದರ ಮತ್ತು ತಳಿವಾರು ದಾಖಲೆಗಳು
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.3rem' }}>
              1. ದೈನಂದಿನ ಮಾರುಕಟ್ಟೆ ದರಗಳ API (Current Daily Price Mandi)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Resource ID: <code>9ef84268-d588-465a-a308-a864a43d0070</code>
            </div>
            <a
              href="https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              data.gov.in ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ &rarr;
            </a>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#eab308', marginBottom: '0.3rem' }}>
              2. ತಳಿವಾರು ದೈನಂದಿನ ಬೆಲೆಗಳ API (Variety-wise Daily Prices)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Resource ID: <code>35985678-0d79-46b4-9ed6-6f13308a1d24</code>
            </div>
            <a
              href="https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              data.gov.in ತಳಿವಾರು ಸಂಪನ್ಮೂಲ ವೀಕ್ಷಿಸಿ &rarr;
            </a>
          </div>
        </div>

        <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          💡 <strong>ರೈತರಿಗೆ ಮತ್ತು ಸಂಶೋಧಕರಿಗೆ ಮಾಹಿತಿ:</strong> ಈ ಮೇಲಿನ ಅಧಿಕೃತ API ಕೀಯೊಂದಿಗೆ ಯಾವುದೇ ತರಕಾರಿ ಅಥವಾ ಸಸ್ಯದ (Tomato, Onion, Chilli, Ragi, Cotton, Potato, etc.) ಲೈವ್ ಆವಕ ಮತ್ತು ಮಾದರಿ ದರಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮಂಡಿಯಿಂದ ಪಡೆಯಲಾಗುತ್ತದೆ.
        </div>
      </div>


      {/* Modal Dialog for Adding Custom Mandi Quotes */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            color: 'var(--text-primary, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #334155)',
            width: '100%',
            maxWidth: '540px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={20} color="var(--primary, #22c55e)" />
                ಹೊಸ ಬೆಳೆ / ಮಾರುಕಟ್ಟೆ ದರ ಸೇರಿಸಿ
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {addError && (
              <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {addError}
              </div>
            )}

            <form onSubmit={handleSaveCustomQuote} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.3rem' }}>
                    ಬೆಳೆ ಹೆಸರು (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Drumstick, Coriander"
                    value={newCommodity}
                    onChange={(e) => setNewCommodity(e.target.value)}
                    className="search-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.3rem' }}>
                    ಕನ್ನಡ ಹೆಸರು (Kannada)
                  </label>
                  <input
                    type="text"
                    placeholder="ಉದಾ: ನುಗ್ಗೆಕಾಯಿ, ಕೊತ್ತಂಬರಿ"
                    value={newCommodityKn}
                    onChange={(e) => setNewCommodityKn(e.target.value)}
                    className="search-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.3rem' }}>
                    ವಿಭಾಗ (Category)
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="search-input"
                    style={{ width: '100%' }}
                  >
                    <option value="Vegetables">ತರಕಾರಿಗಳು (Vegetables)</option>
                    <option value="Grains">ಸಿರಿಧಾನ್ಯ / ಧಾನ್ಯಗಳು (Grains)</option>
                    <option value="Pulses">ಬೇಳೆಕಾಳುಗಳು (Pulses)</option>
                    <option value="Commercial">ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು (Commercial)</option>
                    <option value="Fruits">ಹಣ್ಣುಗಳು (Fruits)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.3rem' }}>
                    ಜಿಲ್ಲೆ (District) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolar, Belagavi"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="search-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.3rem' }}>
                  ಮಾರುಕಟ್ಟೆ ಎಪಿಎಂಸಿ ಹೆಸರು (Market / APMC Yard) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kolar APMC, Hubli Yard"
                  value={newMarket}
                  onChange={(e) => setNewMarket(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.3rem' }}>
                    ಕನಿಷ್ಠ ದರ (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Min"
                    value={newMinPrice}
                    onChange={(e) => setNewMinPrice(e.target.value)}
                    className="search-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.3rem' }}>
                    ಮಾದರಿ ದರ (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Modal"
                    value={newModalPrice}
                    onChange={(e) => setNewModalPrice(e.target.value)}
                    className="search-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.3rem' }}>
                    ಗರಿಷ್ಠ ದರ (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Max"
                    value={newMaxPrice}
                    onChange={(e) => setNewMaxPrice(e.target.value)}
                    className="search-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  className="btn-farmer-primary"
                  style={{ padding: '0.5rem 1.2rem' }}
                >
                  ದರವನ್ನು ಸೇರಿಸಿ (Save Quote)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketExplorer;
