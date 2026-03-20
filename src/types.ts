/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Gender = 'Male' | 'Female' | 'Other';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type ResultStatus = 'pending' | 'in-progress' | 'completed' | 'reviewed';
export type Flag = 'normal' | 'low' | 'high' | 'critical' | 'pending';
export type View = 'dashboard' | 'patients' | 'results' | 'panels' | 'history' | 'patientDetail' | 'settings';

export interface TestDefinition {
  name: string;
  unit: string;
  ref: string;
  low: number;
  high: number;
  crit_low: number;
  crit_high: number;
}

export interface TestPanel {
  name: string;
  abbr: string;
  desc?: string;
  tests: TestDefinition[];
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  bloodType: BloodType | '';
  insurance: string;
  notes: string;
  createdAt: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  panel: string;
  date: string;
  status: ResultStatus;
  notes: string;
  values: string[]; // Values correspond to the test definitions in the panel
  createdAt: string;
}

export interface ClinicInfo {
  clinicName: string;
  clinicLicense: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
}

export interface AppSettings {
  darkMode: boolean;
  pageSize: number;
  dateFormat: string;
  criticalHighlight: boolean;
  criticalPulse: boolean;
  printHeader: boolean;
}
