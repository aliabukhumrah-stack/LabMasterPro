/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, LabResult, TestPanel, TestDefinition, Flag } from '../types';

const KEYS = {
  PATIENTS: 'lc_patients',
  RESULTS: 'lc_results',
  CUSTOM_PANELS: 'lc_customPanels',
  MAX_PATIENT_ID: 'lc_maxPatientId',
  MAX_RESULT_ID: 'lc_maxResultId',
  CLINIC_INFO: 'lc_clinicInfo',
  SETTINGS: 'lc_settings',
};

export const storage = {
  getPatients: (): Patient[] => JSON.parse(localStorage.getItem(KEYS.PATIENTS) || '[]'),
  setPatients: (patients: Patient[]) => localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients)),
  
  getResults: (): LabResult[] => JSON.parse(localStorage.getItem(KEYS.RESULTS) || '[]'),
  setResults: (results: LabResult[]) => localStorage.setItem(KEYS.RESULTS, JSON.stringify(results)),
  
  getCustomPanels: (): TestPanel[] => JSON.parse(localStorage.getItem(KEYS.CUSTOM_PANELS) || '[]'),
  setCustomPanels: (panels: TestPanel[]) => localStorage.setItem(KEYS.CUSTOM_PANELS, JSON.stringify(panels)),

  getClinicInfo: () => JSON.parse(localStorage.getItem(KEYS.CLINIC_INFO) || '{}'),
  setClinicInfo: (info: any) => localStorage.setItem(KEYS.CLINIC_INFO, JSON.stringify(info)),

  getSettings: () => JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}'),
  setSettings: (settings: any) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)),

  getNextPatientId: (): string => {
    const next = (parseInt(localStorage.getItem(KEYS.MAX_PATIENT_ID) || '0') + 1);
    localStorage.setItem(KEYS.MAX_PATIENT_ID, next.toString());
    return `P-${next.toString().padStart(5, '0')}`;
  },

  getNextResultId: (): string => {
    const next = (parseInt(localStorage.getItem(KEYS.MAX_RESULT_ID) || '0') + 1);
    localStorage.setItem(KEYS.MAX_RESULT_ID, next.toString());
    return `R-${next.toString().padStart(5, '0')}`;
  },

  seedMaxIds: (patientId: number, resultId: number) => {
    localStorage.setItem(KEYS.MAX_PATIENT_ID, patientId.toString());
    localStorage.setItem(KEYS.MAX_RESULT_ID, resultId.toString());
  },

  syncMaxIds: (patients: Patient[], results: LabResult[]) => {
    const maxP = Math.max(...patients.map(p => parseInt(p.id.split('-')[1]) || 0), 0);
    const maxR = Math.max(...results.map(r => parseInt(r.id.split('-')[1]) || 0), 0);
    
    const currentP = parseInt(localStorage.getItem(KEYS.MAX_PATIENT_ID) || '0');
    const currentR = parseInt(localStorage.getItem(KEYS.MAX_RESULT_ID) || '0');
    
    if (maxP > currentP) localStorage.setItem(KEYS.MAX_PATIENT_ID, maxP.toString());
    if (maxR > currentR) localStorage.setItem(KEYS.MAX_RESULT_ID, maxR.toString());
  },

  clearAll: () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  }
};

export function flagValue(val: string | number, def: TestDefinition): Flag {
  if (val === '' || val === null || val === undefined) return 'pending';
  const v = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(v)) return 'pending';
  
  if (v < def.low) return v < def.crit_low ? 'critical' : 'low';
  if (v > def.high) return v > def.crit_high ? 'critical' : 'high';
  return 'normal';
}

export function getResultFlags(result: LabResult, panelTests: TestDefinition[]) {
  if (!result.values || !panelTests) return [];
  return panelTests.map((def, i) => {
    const val = result.values[i];
    return { name: def.name, flag: flagValue(val, def) };
  }).filter(f => f.flag !== 'normal' && f.flag !== 'pending');
}
