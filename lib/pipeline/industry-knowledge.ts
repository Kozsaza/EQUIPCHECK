/* ─── Industry Abbreviation Equivalencies ─── */

export const INDUSTRY_ABBREVIATIONS = `
═══════════════════════════════════════════════════════
INDUSTRY REFERENCE: ABBREVIATION EQUIVALENCIES
═══════════════════════════════════════════════════════

These are KNOWN equivalencies from public industry standards. Items using these variant names should be treated as MATCHING (if all other specs align):

ELECTRICAL (derived from NEC / NECA 100 standards):
- "Single Pole" = "1P" = "SP" = "1-Pole"
- "Double Pole" = "2P" = "DP" = "2-Pole"
- "Three Pole" = "3P" = "TP" = "3-Pole"
- "#12 AWG" = "#12" = "12 AWG" = "12 GA" = "No. 12"
- "THHN" = "THHN/THWN" = "THWN-2" (common dual-rated wire)
- "EMT" = "Electrical Metallic Tubing" = "thin-wall conduit"
- "Romex" = "NM Cable" = "NM-B" = "Non-Metallic Cable"
- "MC Cable" = "Metal Clad Cable" = "BX" (colloquial)
- "4-SQ" = "4-Square" = "4 in Square" = "4x4"
- "1G" = "Single Gang" = "1-Gang"
- "2G" = "Double Gang" = "2-Gang"
- "CB" = "Circuit Breaker" = "Breaker"
- "Disconnect" = "Disconnect Switch" = "Safety Switch" = "Disc."
- "GND" = "Ground" = "Grounding" = "EGC" (Equipment Grounding Conductor)
- "ft" = "feet" = "'" (apostrophe after number)
- "in" = "inch" = '"' (quote after number)
- "Satin Chrome" = "US26D" = "626" (finish designations)
- "Satin Stainless" = "US32D" = "630"

HVAC (derived from ASHRAE / industry standards):
- "RTU" = "Rooftop Unit" = "Rooftop Package Unit" = "PKG Unit"
- "AHU" = "Air Handling Unit" = "Air Handler"
- "FCU" = "Fan Coil Unit" = "Fan Coil"
- "CFM" = "Cubic Feet per Minute" (airflow)
- "SEER" = Seasonal Energy Efficiency Ratio
- "AFUE" = Annual Fuel Utilization Efficiency
- "EER" = Energy Efficiency Ratio
- "Ton" = 12,000 BTU/hr (1 Ton cooling = 12,000 BTU)
- "MBH" = 1,000 BTU/hr
- "VFD" = "VSD" = "Variable Frequency Drive" = "Variable Speed Drive"
- "T-STAT" = "Thermostat" = "Tstat"
- "EF" = "Exhaust Fan"
- "SF" = "Supply Fan"
- "RF" = "Return Fan"
- "CHW" = "Chilled Water"
- "HHW" = "Hot Water" = "Heating Hot Water"
- "DX" = "Direct Expansion"
- "VAV" = "Variable Air Volume"
- "Flex Duct" = "Flexible Duct" = "Flex"
- "Galv" = "Galvanized"

SECURITY / LOW-VOLTAGE:
- "IP Cam" = "IP Camera" = "Network Camera"
- "NVR" = "Network Video Recorder"
- "DVR" = "Digital Video Recorder"
- "PoE" = "Power over Ethernet"
- "PoE+" = "PoE Plus" = "802.3at"
- "VF" = "Varifocal" (adjustable lens)
- "IR" = "Infrared" (night vision distance)
- "Cat6" = "CAT6" = "Category 6"
- "Cat5e" = "CAT5E" = "Category 5e"
- "1U" = "1 Rack Unit" = "1RU"
- "HDD" = "Hard Drive" = "Hard Disk"

CONSTRUCTION / DOOR HARDWARE:
- "BB Hinge" = "Ball Bearing Hinge"
- "NRP" = "Non-Removable Pin"
- "5K" = "5-Knuckle"
- "Gr1" = "Grade 1"
- "Gr2" = "Grade 2"
- "Alum" = "Aluminum"
- "SSP" = "Stainless Steel"
- "B4E" = "Beveled 4 Edges"
- "Sz3" = "Size 3" (door closer)
- "Sz4" = "Size 4"
- "ADA" = "Americans with Disabilities Act" compliant
- "1P" = "1 Pole" (for switches)
- "3P" = "3 Pole"

GENERAL CONSTRUCTION:
- "EA" = "Each"
- "LF" = "Linear Feet" = "Lin. Ft."
- "SF" = "Square Feet" = "Sq. Ft." (context-dependent — also "Supply Fan" in HVAC)
- "CY" = "Cubic Yard"
- "GA" = "Gauge"
- "Qty" = "Quantity"
- "Spec" = "Specification"
- "Submittal" = documentation proving equipment meets spec requirements`;

/* ─── Critical Distinction Rules ─── */

export const CRITICAL_DISTINCTIONS = `
═══════════════════════════════════════════════════════
CRITICAL DISTINCTION RULES (NEVER treat as equivalent)
═══════════════════════════════════════════════════════

These items look similar but are CRITICALLY different. A mismatch on any of these MUST be flagged as severity CRITICAL:

ELECTRICAL:
- GFCI breaker ≠ Standard breaker (ground fault protection — life safety)
- AFCI breaker ≠ Standard breaker (arc fault protection — fire safety)
- GFCI ≠ AFCI (different protection types)
- 120V ≠ 240V ≠ 208V ≠ 277V ≠ 480V (voltage ratings)
- Single Phase ≠ Three Phase
- Fused Disconnect ≠ Non-Fused Disconnect
- Copper wire ≠ Aluminum wire
- Different wire gauges (#14 ≠ #12 ≠ #10 etc.)
- Different breaker amperage (15A ≠ 20A ≠ 30A etc.)
- Plenum-rated cable ≠ Non-plenum cable (fire code)

HVAC:
- Different tonnage (1 Ton ≠ 1.5 Ton ≠ 2 Ton — affects capacity)
- Different SEER ratings (indicates efficiency difference)
- Different voltage (208V ≠ 230V ≠ 460V)
- R-410A ≠ R-22 ≠ R-32 (different refrigerants, not interchangeable)
- Gas/Electric ≠ Heat Pump ≠ Electric Only (different heating methods)
- MERV-8 ≠ MERV-13 (different filtration levels)

SECURITY:
- 2MP ≠ 4MP ≠ 8MP (resolution — affects coverage)
- Fixed lens ≠ Varifocal lens (2.8mm ≠ 2.8-12mm)
- Different IR distances (affects night coverage)
- Indoor ≠ Outdoor rated (weatherproofing)
- 8-Channel NVR ≠ 16-Channel ≠ 32-Channel (capacity)
- Different HDD sizes (4TB ≠ 8TB — recording duration)

CONSTRUCTION:
- Grade 1 ≠ Grade 2 ≠ Grade 3 (durability/security rating)
- Different finish codes (US26D ≠ US10B ≠ US3 — appearance and material)
- Entrance function ≠ Privacy function ≠ Classroom function (lockset behavior)
- Fire-rated ≠ Non-fire-rated
- ADA compliant ≠ Non-ADA (accessibility requirement)
- Different door closer sizes (affects door weight capacity)

SEVERITY CLASSIFICATION:
- CRITICAL: Violates a Critical Distinction Rule, safety specification, or capacity difference that would cause system failure
- MODERATE: Quantity difference, wrong finish, minor model variation that affects function
- LOW: Cosmetic difference, packaging variation, description style only`;
