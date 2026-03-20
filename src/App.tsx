/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FlaskConical, 
  Settings, 
  Moon, 
  Sun, 
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from './lib/storage';
import { Patient, LabResult, TestPanel, View } from './types';
import { BUILTIN_PANELS, BUILTIN_PANEL_LABELS } from './constants';

// Components
import { NavItem, ResultBadge } from './components/UI';
import { 
  DashboardView, 
  PatientsView, 
  ResultsView, 
  PanelsView, 
  PatientDetailView, 
  SettingsView 
} from './components/Views';
import { 
  PatientModal, 
  ResultModal, 
  PanelModal, 
  ViewResultModal, 
  DeleteConfirmationModal 
} from './components/Modals';

export default function App() {
  // --- State ---
  const [view, setView] = useState<View>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [results, setResults] = useState<LabResult[]>([]);
  const [customPanels, setCustomPanels] = useState<TestPanel[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [isViewResultModalOpen, setIsViewResultModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editingResult, setEditingResult] = useState<LabResult | null>(null);
  const [editingPanel, setEditingPanel] = useState<TestPanel | null>(null);
  const [viewingResult, setViewingResult] = useState<LabResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'patient' | 'result', id: string, name: string } | null>(null);
  
  // --- Initialization ---
  useEffect(() => {
    let storedPatients = storage.getPatients();
    let storedResults = storage.getResults();
    let storedPanels = storage.getCustomPanels();
    const settings = storage.getSettings();

    // Seed data if empty
    if (storedPatients.length === 0) {
      const today = new Date().toISOString().slice(0, 10);
      storedPatients = [
        { id: 'P-00001', firstName: 'Ahmed', lastName: 'Al-Rashidi', dob: '1985-03-12', gender: 'Male', phone: '+964-770-123-4567', email: 'ahmed@example.com', address: 'Kirkuk, Iraq', bloodType: 'O+', insurance: 'INS-001234', notes: 'Hypertension, on Amlodipine', createdAt: today },
        { id: 'P-00002', firstName: 'Fatima', lastName: 'Hassan', dob: '1992-07-25', gender: 'Female', phone: '+964-750-987-6543', email: 'fatima@example.com', address: 'Kirkuk, Iraq', bloodType: 'A+', insurance: '', notes: '', createdAt: today },
        { id: 'P-00003', firstName: 'Omar', lastName: 'Khalil', dob: '1975-11-08', gender: 'Male', phone: '+964-780-555-0000', email: '', address: 'Kirkuk, Iraq', bloodType: 'B-', insurance: 'INS-005678', notes: 'Diabetic, Type 2', createdAt: today },
      ];
      storedResults = [
        { id: 'R-00001', patientId: 'P-00001', panel: 'CBC', date: today, status: 'completed', notes: 'Routine checkup', createdAt: new Date().toISOString(), values: ['7.2', '4.8', '14.2', '42', '88', '230'] },
        { id: 'R-00002', patientId: 'P-00001', panel: 'BMP', date: today, status: 'reviewed', notes: '', createdAt: new Date().toISOString(), values: ['140', '4.2', '102', '24', '18', '1.0', '95', '9.2'] },
        { id: 'R-00003', patientId: 'P-00002', panel: 'Lipid', date: today, status: 'completed', notes: 'Pre-op panel', createdAt: new Date().toISOString(), values: ['210', '135', '45', '180', '25'] },
      ];
      storage.setPatients(storedPatients);
      storage.setResults(storedResults);
      storage.seedMaxIds(3, 3);
    }

    // Deduplicate patients by ID
    const uniquePatients = storedPatients.filter((p, i, self) => 
      i === self.findIndex((t) => t.id === p.id)
    );
    if (uniquePatients.length !== storedPatients.length) {
      storage.setPatients(uniquePatients);
    }
    setPatients(uniquePatients);
    
    // Deduplicate results by ID
    const uniqueResults = storedResults.filter((r, i, self) => 
      i === self.findIndex((t) => t.id === r.id)
    );
    if (uniqueResults.length !== storedResults.length) {
      storage.setResults(uniqueResults);
    }
    setResults(uniqueResults);
    
    // Sync max IDs
    storage.syncMaxIds(uniquePatients, uniqueResults);
    
    setCustomPanels(storedPanels);
    setIsDarkMode(settings.darkMode || false);

    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // --- Derived State ---
  const allPanels = useMemo(() => {
    const panels: Record<string, any> = { ...BUILTIN_PANELS };
    customPanels.forEach(p => { panels[p.abbr] = p.tests; });
    return panels;
  }, [customPanels]);

  const allPanelLabels = useMemo(() => {
    const labels: Record<string, string> = { ...BUILTIN_PANEL_LABELS };
    customPanels.forEach(p => { labels[p.abbr] = p.name; });
    return labels;
  }, [customPanels]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      totalPatients: patients.length,
      pendingResults: results.filter(r => r.status === 'pending' || r.status === 'in-progress').length,
      completedToday: results.filter(r => (r.status === 'completed' || r.status === 'reviewed') && r.date === today).length,
      totalCompleted: results.filter(r => r.status === 'completed' || r.status === 'reviewed').length,
    };
  }, [patients, results]);

  // --- Handlers ---
  const toggleDarkMode = useCallback(() => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    storage.setSettings({ ...storage.getSettings(), darkMode: next });
  }, [isDarkMode]);

  const handleAddPatient = useCallback((data: Partial<Patient>) => {
    const newPatient: Patient = {
      id: editingPatient?.id || storage.getNextPatientId(),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      dob: data.dob || '',
      gender: data.gender || 'Male',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      bloodType: data.bloodType || '',
      insurance: data.insurance || '',
      notes: data.notes || '',
      createdAt: editingPatient?.createdAt || new Date().toISOString().slice(0, 10),
    };

    let nextPatients;
    if (editingPatient) {
      nextPatients = patients.map(p => p.id === editingPatient.id ? newPatient : p);
    } else {
      nextPatients = [...patients, newPatient];
    }

    setPatients(nextPatients);
    storage.setPatients(nextPatients);
    setIsPatientModalOpen(false);
    setEditingPatient(null);
  }, [editingPatient, patients]);

  const handleAddResult = useCallback((data: Partial<LabResult>) => {
    const newResult: LabResult = {
      id: editingResult?.id || storage.getNextResultId(),
      patientId: data.patientId || '',
      panel: data.panel || '',
      date: data.date || new Date().toISOString().slice(0, 10),
      status: data.status || 'pending',
      notes: data.notes || '',
      values: data.values || [],
      createdAt: editingResult?.createdAt || new Date().toISOString(),
    };

    let nextResults;
    if (editingResult) {
      nextResults = results.map(r => r.id === editingResult.id ? newResult : r);
    } else {
      nextResults = [...results, newResult];
    }

    setResults(nextResults);
    storage.setResults(nextResults);
    setIsResultModalOpen(false);
    setEditingResult(null);
  }, [editingResult, results]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'patient') {
      const nextPatients = patients.filter(p => p.id !== deleteTarget.id);
      const nextResults = results.filter(r => r.patientId !== deleteTarget.id);
      setPatients(nextPatients);
      setResults(nextResults);
      storage.setPatients(nextPatients);
      storage.setResults(nextResults);
      if (selectedPatientId === deleteTarget.id) {
        setView('patients');
        setSelectedPatientId(null);
      }
    } else {
      const nextResults = results.filter(r => r.id !== deleteTarget.id);
      setResults(nextResults);
      storage.setResults(nextResults);
    }

    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  }, [deleteTarget, patients, results, selectedPatientId]);

  const handleDeletePatient = useCallback((id: string) => {
    const patient = patients.find(p => p.id === id);
    if (patient) {
      setDeleteTarget({ type: 'patient', id, name: `${patient.firstName} ${patient.lastName}` });
      setIsDeleteModalOpen(true);
    }
  }, [patients]);

  const handleDeleteResult = useCallback((id: string) => {
    const result = results.find(r => r.id === id);
    if (result) {
      setDeleteTarget({ type: 'result', id, name: `${result.panel} Report (${result.id})` });
      setIsDeleteModalOpen(true);
    }
  }, [results]);

  const handleSavePanel = useCallback((data: Partial<TestPanel>) => {
    const newPanel: TestPanel = {
      name: data.name || '',
      abbr: data.abbr || '',
      desc: data.desc || '',
      tests: data.tests || [],
    };
    
    const next = editingPanel 
      ? customPanels.map(p => p.abbr === editingPanel.abbr ? newPanel : p)
      : [...customPanels, newPanel];
      
    setCustomPanels(next);
    storage.setCustomPanels(next);
    setIsPanelModalOpen(false);
  }, [editingPanel, customPanels]);

  const handleDeletePanel = useCallback((abbr: string) => {
    const next = customPanels.filter(p => p.abbr !== abbr);
    setCustomPanels(next);
    storage.setCustomPanels(next);
  }, [customPanels]);

  // --- Main Layout ---
  return (
    <div className={`app flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col flex-shrink-0">
        <div className="p-8 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <FlaskConical className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sidebar-text font-bold tracking-tight">LabMaster</h1>
              <p className="text-sidebar-text-2 text-[10px] uppercase tracking-widest font-semibold">Pro Edition</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem active={view === 'dashboard'} icon={<LayoutDashboard />} label="Dashboard" onClick={() => setView('dashboard')} />
          <NavItem active={view === 'patients' || view === 'patientDetail'} icon={<Users />} label="Patients" onClick={() => setView('patients')} />
          <NavItem active={view === 'results'} icon={<FlaskConical />} label="Lab Results" onClick={() => setView('results')} />
          <NavItem active={view === 'panels'} icon={<Layers />} label="Test Panels" onClick={() => setView('panels')} />
          <NavItem active={view === 'settings'} icon={<Settings />} label="Settings" onClick={() => setView('settings')} />
        </nav>

        <div className="p-6 border-t border-sidebar-border">
          <button onClick={toggleDarkMode} className="flex items-center gap-3 text-sidebar-text-2 hover:text-sidebar-text transition-colors w-full">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg">
        <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold capitalize tracking-tight">{view.replace(/([A-Z])/g, ' $1')}</h2>
          <div className="flex items-center gap-4">
            <div className="text-xs text-text-3 font-medium bg-surface-2 px-3 py-1 rounded-full border border-border">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'dashboard' && (
                <DashboardView 
                  stats={stats} 
                  results={results}
                  patients={patients}
                  setView={setView} 
                  setViewingResult={setViewingResult}
                  setIsViewResultModalOpen={setIsViewResultModalOpen}
                  setSelectedPatientId={setSelectedPatientId}
                />
              )}
              {view === 'patients' && (
                <PatientsView 
                  patients={patients}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onAddPatient={() => { setEditingPatient(null); setIsPatientModalOpen(true); }}
                  onEditPatient={(p) => { setEditingPatient(p); setIsPatientModalOpen(true); }}
                  onDeletePatient={handleDeletePatient}
                  onSelectPatient={(id) => { setSelectedPatientId(id); setView('patientDetail'); }}
                />
              )}
              {view === 'results' && (
                <ResultsView 
                  results={results}
                  patients={patients}
                  onAddResult={() => { setEditingResult(null); setIsResultModalOpen(true); }}
                  onEditResult={(r) => { setEditingResult(r); setIsResultModalOpen(true); }}
                  onDeleteResult={handleDeleteResult}
                  onViewResult={(r) => { setViewingResult(r); setIsViewResultModalOpen(true); }}
                  renderBadge={(s) => <ResultBadge status={s} />}
                />
              )}
              {view === 'panels' && (
                <PanelsView 
                  customPanels={customPanels}
                  onAddPanel={() => { setEditingPanel(null); setIsPanelModalOpen(true); }}
                  onEditPanel={(p) => { setEditingPanel(p); setIsPanelModalOpen(true); }}
                  onDeletePanel={handleDeletePanel}
                />
              )}
              {view === 'patientDetail' && selectedPatientId && (
                <PatientDetailView 
                  patient={patients.find(p => p.id === selectedPatientId)!} 
                  results={results.filter(r => r.patientId === selectedPatientId)}
                  onBack={() => setView('patients')}
                  onEdit={(p) => { setEditingPatient(p); setIsPatientModalOpen(true); }}
                  onAddResult={(pid) => { setEditingResult(null); setIsResultModalOpen(true); }}
                  onViewResult={(r) => { setViewingResult(r); setIsViewResultModalOpen(true); }}
                />
              )}
              {view === 'settings' && <SettingsView 
                patientsCount={patients.length} 
                resultsCount={results.length} 
                onClearData={() => { storage.clearAll(); window.location.reload(); }}
              />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      {isPatientModalOpen && (
        <PatientModal 
          patient={editingPatient} 
          onClose={() => setIsPatientModalOpen(false)} 
          onSave={handleAddPatient} 
        />
      )}
      {isResultModalOpen && (
        <ResultModal 
          result={editingResult}
          patients={patients}
          allPanels={allPanels}
          allPanelLabels={allPanelLabels}
          onClose={() => setIsResultModalOpen(false)}
          onSave={handleAddResult}
        />
      )}
      {isPanelModalOpen && (
        <PanelModal 
          panel={editingPanel}
          onClose={() => setIsPanelModalOpen(false)}
          onSave={handleSavePanel}
        />
      )}
      {isViewResultModalOpen && viewingResult && (
        <ViewResultModal 
          result={viewingResult}
          patient={patients.find(p => p.id === viewingResult.patientId) || { id: 'unknown', firstName: 'Unknown', lastName: 'Patient', dob: '', gender: 'Other', phone: '', email: '', address: '', bloodType: '', insurance: '', notes: '', createdAt: '' }}
          panelTests={allPanels[viewingResult.panel] || []}
          onClose={() => setIsViewResultModalOpen(false)}
        />
      )}
      {isDeleteModalOpen && deleteTarget && (
        <DeleteConfirmationModal 
          type={deleteTarget.type}
          name={deleteTarget.name}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
