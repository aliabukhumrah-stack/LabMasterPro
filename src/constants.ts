/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestDefinition } from './types';

export const BUILTIN_PANELS: Record<string, TestDefinition[]> = {
  CBC: [
    { name: 'WBC', unit: '×10³/µL', ref: '4.5–11.0', low: 4.5, high: 11.0, crit_low: 2.0, crit_high: 30.0 },
    { name: 'RBC', unit: '×10⁶/µL', ref: '4.5–5.5 (M), 4.0–5.0 (F)', low: 4.0, high: 5.5, crit_low: 2.0, crit_high: 7.0 },
    { name: 'Hemoglobin', unit: 'g/dL', ref: '13.5–17.5 (M), 12.0–15.5 (F)', low: 12.0, high: 17.5, crit_low: 7.0, crit_high: 20.0 },
    { name: 'Hematocrit', unit: '%', ref: '41–53 (M), 36–46 (F)', low: 36, high: 53, crit_low: 20, crit_high: 60 },
    { name: 'MCV', unit: 'fL', ref: '80–100', low: 80, high: 100, crit_low: 60, crit_high: 120 },
    { name: 'Platelets', unit: '×10³/µL', ref: '150–400', low: 150, high: 400, crit_low: 50, crit_high: 1000 },
  ],
  BMP: [
    { name: 'Sodium', unit: 'mEq/L', ref: '136–145', low: 136, high: 145, crit_low: 120, crit_high: 160 },
    { name: 'Potassium', unit: 'mEq/L', ref: '3.5–5.0', low: 3.5, high: 5.0, crit_low: 2.5, crit_high: 6.5 },
    { name: 'Chloride', unit: 'mEq/L', ref: '98–107', low: 98, high: 107, crit_low: 80, crit_high: 120 },
    { name: 'CO2', unit: 'mEq/L', ref: '23–29', low: 23, high: 29, crit_low: 10, crit_high: 40 },
    { name: 'BUN', unit: 'mg/dL', ref: '7–25', low: 7, high: 25, crit_low: 2, crit_high: 100 },
    { name: 'Creatinine', unit: 'mg/dL', ref: '0.6–1.2', low: 0.6, high: 1.2, crit_low: 0.1, crit_high: 10 },
    { name: 'Glucose', unit: 'mg/dL', ref: '70–99', low: 70, high: 99, crit_low: 40, crit_high: 500 },
    { name: 'Calcium', unit: 'mg/dL', ref: '8.5–10.5', low: 8.5, high: 10.5, crit_low: 6.0, crit_high: 14.0 },
  ],
  Lipid: [
    { name: 'Total Cholesterol', unit: 'mg/dL', ref: '< 200 desirable', low: 0, high: 200, crit_low: 0, crit_high: 400 },
    { name: 'LDL', unit: 'mg/dL', ref: '< 100 optimal', low: 0, high: 100, crit_low: 0, crit_high: 300 },
    { name: 'HDL', unit: 'mg/dL', ref: '> 60 optimal', low: 60, high: 999, crit_low: 20, crit_high: 999 },
    { name: 'Triglycerides', unit: 'mg/dL', ref: '< 150 normal', low: 0, high: 150, crit_low: 0, crit_high: 1000 },
    { name: 'VLDL', unit: 'mg/dL', ref: '2–30', low: 2, high: 30, crit_low: 0, crit_high: 100 },
  ],
  LFT: [
    { name: 'ALT', unit: 'U/L', ref: '7–56', low: 7, high: 56, crit_low: 0, crit_high: 1000 },
    { name: 'AST', unit: 'U/L', ref: '10–40', low: 10, high: 40, crit_low: 0, crit_high: 1000 },
    { name: 'ALP', unit: 'U/L', ref: '44–147', low: 44, high: 147, crit_low: 0, crit_high: 1000 },
    { name: 'GGT', unit: 'U/L', ref: '8–61', low: 8, high: 61, crit_low: 0, crit_high: 500 },
    { name: 'Total Bilirubin', unit: 'mg/dL', ref: '0.1–1.2', low: 0.1, high: 1.2, crit_low: 0, crit_high: 20 },
    { name: 'Direct Bilirubin', unit: 'mg/dL', ref: '0.0–0.3', low: 0, high: 0.3, crit_low: 0, crit_high: 10 },
    { name: 'Total Protein', unit: 'g/dL', ref: '6.0–8.3', low: 6.0, high: 8.3, crit_low: 3.0, crit_high: 12.0 },
    { name: 'Albumin', unit: 'g/dL', ref: '3.5–5.0', low: 3.5, high: 5.0, crit_low: 1.5, crit_high: 8.0 },
  ],
  Thyroid: [
    { name: 'TSH', unit: 'µIU/mL', ref: '0.4–4.0', low: 0.4, high: 4.0, crit_low: 0.01, crit_high: 100 },
    { name: 'Free T4', unit: 'ng/dL', ref: '0.8–1.8', low: 0.8, high: 1.8, crit_low: 0.1, crit_high: 6.0 },
    { name: 'Free T3', unit: 'pg/mL', ref: '2.3–4.2', low: 2.3, high: 4.2, crit_low: 1.0, crit_high: 10.0 },
    { name: 'Total T4', unit: 'µg/dL', ref: '5.0–12.0', low: 5.0, high: 12.0, crit_low: 1.0, crit_high: 20.0 },
    { name: 'Total T3', unit: 'ng/dL', ref: '80–200', low: 80, high: 200, crit_low: 20, crit_high: 500 },
  ],
};

export const BUILTIN_PANEL_LABELS: Record<string, string> = {
  CBC: 'CBC (Complete Blood Count)',
  BMP: 'BMP (Basic Metabolic Panel)',
  Lipid: 'Lipid Panel',
  LFT: 'LFT (Liver Function Tests)',
  Thyroid: 'Thyroid Panel',
};
