/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FlaskConical, 
  History, 
  Settings, 
  Plus, 
  Search, 
  Moon, 
  Sun, 
  Printer, 
  Trash2, 
  Edit2, 
  Eye, 
  ChevronRight, 
  AlertCircle,
  BrainCircuit,
  Database,
  Download,
  Upload,
  X,
  CheckCircle2,
  Clock,
  Activity,
  CloudOff,
  Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage, getResultFlags, flagValue } from './lib/storage';
import { Patient, LabResult, TestPanel, Gender, BloodType, ResultStatus } from './types';
import { BUILTIN_PANELS, BUILTIN_PANEL_LABELS } from './constants';
import { analyzeLabResult } from './lib/gemini';

type View = 'dashboard' | 'patients' | 'results' | 'history' | 'panels' | 'settings' | 'patientDetail';

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
  const [isViewResultModalOpen, setIsViewResultModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editingResult, setEditingResult] = useState<LabResult | null>(null);
  const [viewingResult, setViewingResult] = useState<LabResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'patient' | 'result', id: string, name: string } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    }

    setPatients(storedPatients);
    setResults(storedResults);
    setCustomPanels(storedPanels);
    setIsDarkMode(settings.darkMode || false);

    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Derived State ---
  const allPanels = useMemo(() => {
    const panels: Record<string, any> = { ...BUILTIN_PANELS };
    customPanels.forEach(p => { panels[p.abbr] = p.tests; });
    return panels;
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
  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    storage.setSettings({ ...storage.getSettings(), darkMode: next });
  };

  const handleAddPatient = (data: Partial<Patient>) => {
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
  };

  const handleAddResult = (data: Partial<LabResult>) => {
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
  };

  const confirmDelete = () => {
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
  };

  const handleDeletePatient = (id: string) => {
    const patient = patients.find(p => p.id === id);
    if (patient) {
      setDeleteTarget({ type: 'patient', id, name: `${patient.firstName} ${patient.lastName}` });
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteResult = (id: string) => {
    const result = results.find(r => r.id === id);
    if (result) {
      setDeleteTarget({ type: 'result', id, name: `${result.panel} Report (${result.id})` });
      setIsDeleteModalOpen(true);
    }
  };

  const runAIAnalysis = async (result: LabResult) => {
    if (!isOnline) {
      setAiAnalysis("AI analysis requires an internet connection. Please connect to the internet and try again.");
      return;
    }
    const patient = patients.find(p => p.id === result.patientId);
    const panelTests = allPanels[result.panel];
    if (!patient || !panelTests) return;

    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const analysis = await analyzeLabResult(result, patient, panelTests);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiAnalysis("Failed to generate AI analysis. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Render Helpers ---
  const renderBadge = (status: ResultStatus) => {
    const styles: Record<ResultStatus, string> = {
      'pending': 'badge-pending',
      'in-progress': 'badge-inprogress',
      'completed': 'badge-completed',
      'reviewed': 'badge-reviewed',
    };
    return <span className={`badge ${styles[status]}`}>{status.replace('-', ' ')}</span>;
  };

  // --- Views ---
  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Patients" 
          value={stats.totalPatients} 
          icon={<Users className="w-6 h-6" />} 
          color="blue"
          onClick={() => setView('patients')}
        />
        <StatCard 
          label="Pending Results" 
          value={stats.pendingResults} 
          icon={<Clock className="w-6 h-6" />} 
          color="orange"
          onClick={() => setView('results')}
        />
        <StatCard 
          label="Completed Today" 
          value={stats.completedToday} 
          icon={<CheckCircle2 className="w-6 h-6" />} 
          color="green"
          onClick={() => setView('results')}
        />
        <StatCard 
          label="Total Completed" 
          value={stats.totalCompleted} 
          icon={<Activity className="w-6 h-6" />} 
          color="purple"
          onClick={() => setView('results')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="p-4 border-bottom border-border flex justify-between items-center bg-surface-2">
            <h3 className="font-semibold">Recent Results</h3>
            <button onClick={() => setView('results')} className="text-xs text-accent hover:underline">View all</button>
          </div>
          <div className="divide-y divide-border">
            {results.slice(-5).reverse().map(r => {
              const p = patients.find(p => p.id === r.patientId);
              return (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-surface-2 transition-colors cursor-pointer" onClick={() => { setViewingResult(r); setIsViewResultModalOpen(true); }}>
                  <div>
                    <div className="font-medium">{p ? `${p.firstName} ${p.lastName}` : 'Unknown'}</div>
                    <div className="text-xs text-text-3">{r.panel} • {r.date}</div>
                  </div>
                  {renderBadge(r.status)}
                </div>
              );
            })}
            {results.length === 0 && <div className="p-8 text-center text-text-3">No results recorded yet.</div>}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-bottom border-border flex justify-between items-center bg-surface-2">
            <h3 className="font-semibold">Recently Added Patients</h3>
            <button onClick={() => setView('patients')} className="text-xs text-accent hover:underline">View all</button>
          </div>
          <div className="divide-y divide-border">
            {patients.slice(-5).reverse().map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-surface-2 transition-colors cursor-pointer" onClick={() => { setSelectedPatientId(p.id); setView('patientDetail'); }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold text-xs">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div>
                    <div className="font-medium">{p.firstName} {p.lastName}</div>
                    <div className="text-xs text-text-3">{p.id} • {p.gender}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-3" />
              </div>
            ))}
            {patients.length === 0 && <div className="p-8 text-center text-text-3">No patients registered yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const PatientsView = () => {
    const filtered = patients.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => { setEditingPatient(null); setIsPatientModalOpen(true); }} className="btn btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Add Patient
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-2 text-text-3 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-semibold">ID</th>
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Gender</th>
                  <th className="px-6 py-3 font-semibold">DOB</th>
                  <th className="px-6 py-3 font-semibold">Blood</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-surface-2 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-text-3">{p.id}</td>
                    <td className="px-6 py-4 font-medium cursor-pointer" onClick={() => { setSelectedPatientId(p.id); setView('patientDetail'); }}>
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm">{p.gender}</td>
                    <td className="px-6 py-4 text-sm">{p.dob}</td>
                    <td className="px-6 py-4">
                      {p.bloodType && <span className="px-2 py-1 rounded bg-red-bg text-red text-xs font-bold border border-red/10">{p.bloodType}</span>}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { setEditingPatient(p); setIsPatientModalOpen(true); }} className="p-2 text-text-3 hover:text-accent transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeletePatient(p.id)} className="p-2 text-text-3 hover:text-red transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-3">No patients found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ResultsView = () => {
    const filtered = results.filter(r => {
      const p = patients.find(p => p.id === r.patientId);
      const name = p ? `${p.firstName} ${p.lastName}` : '';
      return name.toLowerCase().includes(searchQuery.toLowerCase()) || r.panel.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
            <input 
              type="text" 
              placeholder="Search results..." 
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => { setEditingResult(null); setIsResultModalOpen(true); }} className="btn btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Add Result
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-2 text-text-3 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-semibold">ID</th>
                  <th className="px-6 py-3 font-semibold">Patient</th>
                  <th className="px-6 py-3 font-semibold">Panel</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.reverse().map(r => {
                  const p = patients.find(p => p.id === r.patientId);
                  const flags = getResultFlags(r, allPanels[r.panel] || []);
                  const hasCritical = flags.some(f => f.flag === 'critical');
                  
                  return (
                    <tr key={r.id} className={`hover:bg-surface-2 transition-colors ${hasCritical ? 'bg-red/5' : ''}`}>
                      <td className="px-6 py-4 font-mono text-xs text-text-3">{r.id}</td>
                      <td className="px-6 py-4 font-medium">
                        {p ? `${p.firstName} ${p.lastName}` : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">{r.panel}</td>
                      <td className="px-6 py-4 text-sm">{r.date}</td>
                      <td className="px-6 py-4">{renderBadge(r.status)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => { setViewingResult(r); setIsViewResultModalOpen(true); }} className="p-2 text-text-3 hover:text-accent transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditingResult(r); setIsResultModalOpen(true); }} className="p-2 text-text-3 hover:text-accent transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteResult(r.id)} className="p-2 text-text-3 hover:text-red transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-3">No results found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const HistoryView = () => {
    // Group results by date
    const groupedResults = useMemo(() => {
      const groups: Record<string, LabResult[]> = {};
      results.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach(r => {
        if (!groups[r.date]) groups[r.date] = [];
        groups[r.date].push(r);
      });
      return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [results]);

    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold tracking-tight">Audit History</h3>
          <div className="text-xs text-text-3 font-bold uppercase tracking-widest">Timeline of all system activity</div>
        </div>

        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {groupedResults.map(([date, items]) => (
            <div key={date} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface-2 text-accent shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Clock className="w-5 h-5" />
              </div>
              {/* Content */}
              <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <time className="font-bold text-accent font-mono">{date}</time>
                  <span className="badge badge-normal">{items.length} events</span>
                </div>
                <div className="space-y-4">
                  {items.map(r => {
                    const p = patients.find(p => p.id === r.patientId);
                    return (
                      <div key={r.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer group/item" onClick={() => { setViewingResult(r); setIsViewResultModalOpen(true); }}>
                        <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover/item:bg-accent group-hover/item:text-white transition-colors">
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{r.panel} Report</div>
                          <div className="text-xs text-text-3 truncate">Patient: {p ? `${p.firstName} ${p.lastName}` : 'Unknown'}</div>
                        </div>
                        <div className="shrink-0">
                          {renderBadge(r.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {results.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4 text-text-3">
                <History className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold">No History Found</h4>
              <p className="text-text-3 text-sm">System activity will appear here as you add lab results.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
          <NavItem active={view === 'history'} icon={<History />} label="History" onClick={() => setView('history')} />
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
            {!isOnline && (
              <div className="flex items-center gap-2 text-red bg-red/5 px-3 py-1 rounded-full border border-red/10 animate-pulse">
                <CloudOff className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Offline Mode</span>
              </div>
            )}
            {isOnline && (
              <div className="flex items-center gap-2 text-emerald bg-emerald/5 px-3 py-1 rounded-full border border-emerald/10">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Online</span>
              </div>
            )}
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
              {view === 'dashboard' && <DashboardView />}
              {view === 'patients' && <PatientsView />}
              {view === 'results' && <ResultsView />}
              {view === 'history' && <HistoryView />}
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
          onClose={() => setIsResultModalOpen(false)} 
          onSave={handleAddResult} 
        />
      )}
      {isViewResultModalOpen && viewingResult && (
        <ViewResultModal 
          result={viewingResult} 
          patient={patients.find(p => p.id === viewingResult.patientId)!}
          panelTests={allPanels[viewingResult.panel] || []}
          aiAnalysis={aiAnalysis}
          isAnalyzing={isAnalyzing}
          isOnline={isOnline}
          onRunAI={() => runAIAnalysis(viewingResult)}
          onClose={() => { setIsViewResultModalOpen(false); setAiAnalysis(null); }} 
        />
      )}
      {isDeleteModalOpen && deleteTarget && (
        <DeleteConfirmationModal 
          type={deleteTarget.type}
          name={deleteTarget.name}
          onClose={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function DeleteConfirmationModal({ type, name, onClose, onConfirm }: { type: 'patient' | 'result', name: string, onClose: () => void, onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="card w-full max-w-md overflow-hidden shadow-2xl border-red/20"
      >
        <div className="p-6 bg-red-bg border-b border-red/10 flex items-center gap-3 text-red">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-bold tracking-tight">Confirm Deletion</h3>
        </div>
        <div className="p-8 space-y-4">
          <p className="text-text-2 leading-relaxed">
            Are you sure you want to permanently delete <span className="font-bold text-text">{name}</span>?
          </p>
          {type === 'patient' && (
            <div className="p-3 bg-red/5 rounded-lg border border-red/10 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red shrink-0" />
              <p className="text-xs text-red/80 font-medium">
                Warning: This will also delete all lab results associated with this patient. This action cannot be undone.
              </p>
            </div>
          )}
          {type === 'result' && (
            <p className="text-xs text-text-3 font-medium italic">
              This action will permanently remove this report from the system.
            </p>
          )}
        </div>
        <div className="p-6 border-t border-border bg-surface-2 flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger bg-red text-white hover:bg-red-700 border-none px-6">
            Delete Permanently
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Sub-Components ---

function NavItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-sidebar-active text-sidebar-text shadow-sm' 
          : 'text-sidebar-text-2 hover:bg-sidebar-hover hover:text-sidebar-text'
      }`}
    >
      <span className={`w-5 h-5 ${active ? 'text-accent' : ''}`}>{icon}</span>
      <span className="text-sm font-semibold tracking-wide">{label}</span>
    </button>
  );
}

function StatCard({ label, value, icon, color, onClick }: { label: string, value: number, icon: React.ReactNode, color: 'blue' | 'orange' | 'green' | 'purple', onClick?: () => void }) {
  const colors = {
    blue: 'from-accent to-blue-600 shadow-accent/20',
    orange: 'from-orange to-amber-600 shadow-orange/20',
    green: 'from-green to-emerald-600 shadow-green/20',
    purple: 'from-purple to-violet-600 shadow-purple/20',
  };

  return (
    <button 
      onClick={onClick}
      className={`card p-6 flex flex-col justify-between text-left relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform`} />
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tighter mb-1">{value}</div>
        <div className="text-xs font-bold text-text-3 uppercase tracking-widest">{label}</div>
      </div>
    </button>
  );
}

function PatientDetailView({ patient, results, onBack, onEdit, onAddResult, onViewResult }: { 
  patient: Patient, 
  results: LabResult[], 
  onBack: () => void, 
  onEdit: (p: Patient) => void,
  onAddResult: (pid: string) => void,
  onViewResult: (r: LabResult) => void
}) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="btn btn-secondary btn-sm">← Back to Patients</button>
      
      <div className="card bg-gradient-to-br from-accent to-accent-hover p-8 text-white shadow-xl shadow-accent/20">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-bold border border-white/30">
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2">{patient.firstName} {patient.lastName}</h2>
            <p className="text-white/70 font-mono text-sm mb-6">{patient.id}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div><div className="text-xs text-white/50 uppercase font-bold tracking-widest mb-1">Gender</div><div className="font-semibold">{patient.gender}</div></div>
              <div><div className="text-xs text-white/50 uppercase font-bold tracking-widest mb-1">DOB</div><div className="font-semibold">{patient.dob}</div></div>
              <div><div className="text-xs text-white/50 uppercase font-bold tracking-widest mb-1">Blood</div><div className="font-semibold">{patient.bloodType || '—'}</div></div>
              <div><div className="text-xs text-white/50 uppercase font-bold tracking-widest mb-1">Phone</div><div className="font-semibold">{patient.phone || '—'}</div></div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button onClick={() => onEdit(patient)} className="btn bg-white/20 hover:bg-white/30 text-white border border-white/30 justify-center">Edit Profile</button>
            <button onClick={() => onAddResult(patient.id)} className="btn bg-white text-accent hover:bg-white/90 justify-center">New Result</button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border bg-surface-2 flex justify-between items-center">
          <h3 className="font-bold tracking-tight">Lab History</h3>
          <span className="badge badge-normal">{results.length} results</span>
        </div>
        <div className="divide-y divide-border">
          {results.slice().reverse().map(r => (
            <div key={r.id} className="p-4 flex items-center justify-between hover:bg-surface-2 transition-colors cursor-pointer" onClick={() => onViewResult(r)}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center text-accent">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">{r.panel}</div>
                  <div className="text-xs text-text-3 font-mono">{r.id} • {r.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`badge ${r.status === 'completed' ? 'badge-completed' : 'badge-pending'}`}>{r.status}</span>
                <ChevronRight className="w-4 h-4 text-text-3" />
              </div>
            </div>
          ))}
          {results.length === 0 && <div className="p-12 text-center text-text-3">No lab results found for this patient.</div>}
        </div>
      </div>
    </div>
  );
}

function SettingsView({ patientsCount, resultsCount, onClearData }: { patientsCount: number, resultsCount: number, onClearData: () => void }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="card">
        <div className="p-4 border-b border-border bg-surface-2 font-bold">Data Management</div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Export Data</div>
              <div className="text-sm text-text-3">Download a full backup of all records.</div>
            </div>
            <button className="btn btn-secondary"><Download className="w-4 h-4" /> Export JSON</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Import Data</div>
              <div className="text-sm text-text-3">Restore records from a backup file.</div>
            </div>
            <button className="btn btn-secondary"><Upload className="w-4 h-4" /> Import JSON</button>
          </div>
          <div className="pt-6 border-t border-border">
            <div className="p-4 bg-red-bg rounded-xl border border-red/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-red">Danger Zone</div>
                <div className="text-xs text-red/70">Permanently delete all application data.</div>
              </div>
              <button onClick={onClearData} className="btn btn-danger">Clear All Data</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-border bg-surface-2 font-bold">Offline & PWA</div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-emerald/5 border border-emerald/10 rounded-xl">
            <div className="w-10 h-10 bg-emerald/10 rounded-lg flex items-center justify-center text-emerald">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-emerald">Offline Ready</div>
              <div className="text-xs text-emerald/70">This app is fully functional without an internet connection. Your data is stored locally on this device.</div>
            </div>
          </div>
          <div className="p-4 bg-surface-2 border border-border rounded-xl space-y-2">
            <div className="font-semibold text-sm">Install as App</div>
            <p className="text-xs text-text-3 leading-relaxed">
              You can install LabMaster Pro on your phone or desktop for a native-like experience. 
              Look for the "Install" or "Add to Home Screen" option in your browser menu.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6 text-center space-y-2">
        <div className="text-text-3 text-xs font-bold uppercase tracking-widest">System Info</div>
        <div className="text-2xl font-bold tracking-tight">LabMaster Pro v2.0</div>
        <div className="text-sm text-text-3">{patientsCount} Patients • {resultsCount} Results</div>
      </div>
    </div>
  );
}

// --- Modals ---

function PatientModal({ patient, onClose, onSave }: { patient: Patient | null, onClose: () => void, onSave: (data: Partial<Patient>) => void }) {
  const [formData, setFormData] = useState<Partial<Patient>>(patient || { gender: 'Male', bloodType: '' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface-2">
          <h3 className="text-xl font-bold tracking-tight">{patient ? 'Edit Patient' : 'Register New Patient'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-3 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-3 uppercase tracking-wider">First Name</label>
            <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none" placeholder="John" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Last Name</label>
            <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none" placeholder="Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Date of Birth</label>
            <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Gender</label>
            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Phone</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none" placeholder="+1 555-0000" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Blood Type</label>
            <select value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value as BloodType})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none">
              <option value="">Unknown</option>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Notes / Allergies</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none h-24 resize-none" placeholder="Any relevant medical history..." />
          </div>
        </div>
        <div className="p-6 border-t border-border bg-surface-2 flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={() => onSave(formData)} className="btn btn-primary">Save Patient</button>
        </div>
      </motion.div>
    </div>
  );
}

function ResultModal({ result, patients, allPanels, onClose, onSave }: { result: LabResult | null, patients: Patient[], allPanels: Record<string, any>, onClose: () => void, onSave: (data: Partial<LabResult>) => void }) {
  const [formData, setFormData] = useState<Partial<LabResult>>(result || { status: 'pending', date: new Date().toISOString().slice(0, 10), values: [] });
  
  const selectedPanelTests = formData.panel ? allPanels[formData.panel] : null;

  useEffect(() => {
    if (selectedPanelTests && (!formData.values || formData.values.length !== selectedPanelTests.length)) {
      setFormData(prev => ({ ...prev, values: new Array(selectedPanelTests.length).fill('') }));
    }
  }, [formData.panel, selectedPanelTests]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface-2 flex-shrink-0">
          <h3 className="text-xl font-bold tracking-tight">{result ? 'Edit Lab Result' : 'New Lab Result'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-3 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Patient</label>
              <select value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none">
                <option value="">Select Patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Test Panel</label>
              <select value={formData.panel} onChange={e => setFormData({...formData, panel: e.target.value})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none">
                <option value="">Select Panel...</option>
                {Object.keys(BUILTIN_PANEL_LABELS).map(k => <option key={k} value={k}>{BUILTIN_PANEL_LABELS[k]}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Collection Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ResultStatus})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          </div>

          {selectedPanelTests && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-text-3 uppercase tracking-widest border-b border-border pb-2">Test Values</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedPanelTests.map((test: any, i: number) => (
                  <div key={test.name} className="p-4 bg-surface-2 rounded-xl border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{test.name}</span>
                      <span className="text-[10px] text-text-3 font-mono">{test.unit}</span>
                    </div>
                    <input 
                      type="number" 
                      step="any"
                      value={formData.values?.[i] || ''} 
                      onChange={e => {
                        const nextValues = [...(formData.values || [])];
                        nextValues[i] = e.target.value;
                        setFormData({...formData, values: nextValues});
                      }}
                      className="w-full p-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent/20 outline-none text-sm font-mono"
                      placeholder={test.ref}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-border bg-surface-2 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={() => onSave(formData)} className="btn btn-primary">Save Result</button>
        </div>
      </motion.div>
    </div>
  );
}

function ViewResultModal({ result, patient, panelTests, aiAnalysis, isAnalyzing, isOnline, onRunAI, onClose }: { 
  result: LabResult, 
  patient: Patient, 
  panelTests: any[],
  aiAnalysis: string | null,
  isAnalyzing: boolean,
  isOnline: boolean,
  onRunAI: () => void,
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface-2 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold tracking-tight">Lab Report</h3>
            <span className="text-xs font-mono text-text-3">{result.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="p-2 hover:bg-surface-3 rounded-full transition-colors"><Printer className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-2 hover:bg-surface-3 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-text-3 uppercase tracking-widest border-b border-border pb-2">Patient Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-text-3">Name:</span> <span className="font-semibold">{patient.firstName} {patient.lastName}</span></div>
                <div><span className="text-text-3">ID:</span> <span className="font-mono">{patient.id}</span></div>
                <div><span className="text-text-3">Gender:</span> <span className="font-semibold">{patient.gender}</span></div>
                <div><span className="text-text-3">DOB:</span> <span className="font-semibold">{patient.dob}</span></div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-text-3 uppercase tracking-widest border-b border-border pb-2">Report Info</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-text-3">Panel:</span> <span className="font-semibold">{result.panel}</span></div>
                <div><span className="text-text-3">Date:</span> <span className="font-semibold">{result.date}</span></div>
                <div><span className="text-text-3">Status:</span> <span>{result.status}</span></div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-2 text-text-3 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-bold">Test Name</th>
                  <th className="px-6 py-3 font-bold">Result</th>
                  <th className="px-6 py-3 font-bold">Unit</th>
                  <th className="px-6 py-3 font-bold">Reference Range</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {panelTests.map((test, i) => {
                  const val = result.values[i];
                  const flag = flagValue(val, test);
                  const isCritical = flag === 'critical';
                  const isAbnormal = flag === 'low' || flag === 'high';

                  return (
                    <tr key={test.name} className={`${isCritical ? 'bg-red/5' : ''}`}>
                      <td className="px-6 py-4 font-semibold text-sm">{test.name}</td>
                      <td className={`px-6 py-4 font-mono font-bold ${isCritical ? 'text-red' : isAbnormal ? 'text-orange' : ''}`}>
                        {val || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-text-3 font-mono">{test.unit}</td>
                      <td className="px-6 py-4 text-xs text-text-3 font-mono">{test.ref}</td>
                      <td className="px-6 py-4">
                        {val && <span className={`badge badge-${flag}`}>{flag.toUpperCase()}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* AI Insights Section */}
          <div className="card bg-surface-2 border-accent/20 overflow-hidden">
            <div className="p-4 bg-accent/5 border-b border-accent/10 flex justify-between items-center">
              <div className="flex items-center gap-2 text-accent">
                <BrainCircuit className="w-5 h-5" />
                <h4 className="font-bold text-sm tracking-tight">AI Clinical Insights</h4>
              </div>
              {!aiAnalysis && !isAnalyzing && (
                <button 
                  onClick={onRunAI} 
                  disabled={!isOnline}
                  className={`btn btn-sm flex items-center gap-2 ${
                    isOnline 
                      ? 'btn-primary bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20' 
                      : 'bg-surface-3 text-text-3 border border-border cursor-not-allowed'
                  }`}
                >
                  {!isOnline && <CloudOff className="w-3.5 h-3.5" />}
                  Analyze with Gemini
                </button>
              )}
            </div>
            <div className="p-6 min-h-[100px] flex flex-col justify-center">
              {!isOnline && !aiAnalysis && (
                <div className="flex flex-col items-center gap-2 text-text-3">
                  <CloudOff className="w-6 h-6 opacity-30" />
                  <p className="text-xs font-medium">AI analysis is unavailable offline.</p>
                </div>
              )}
              {isOnline && isAnalyzing ? (
                <div className="flex flex-col items-center gap-3 text-text-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <BrainCircuit className="w-8 h-8 opacity-50" />
                  </motion.div>
                  <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Analyzing results...</span>
                </div>
              ) : aiAnalysis ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
              ) : (
                <div className="text-center text-text-3 text-sm italic">
                  Click the button above to generate an AI-powered clinical summary of these results.
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
