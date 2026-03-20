import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Clock, 
  Activity, 
  Zap, 
  Search, 
  UserPlus, 
  FilePlus, 
  Layers, 
  FlaskConical, 
  Trash2, 
  Edit2, 
  Eye, 
  ChevronRight, 
  Download, 
  Upload, 
  CheckCircle2,
  Printer,
  Plus
} from 'lucide-react';
import { Patient, LabResult, TestPanel, ResultStatus } from '../types';
import { StatCard, Badge, ResultBadge } from './UI';

export function DashboardView({ stats, results, patients, setView, setViewingResult, setIsViewResultModalOpen, setSelectedPatientId }: { 
  stats: any, 
  results: LabResult[], 
  patients: Patient[], 
  setView: (v: any) => void,
  setViewingResult: (r: LabResult) => void,
  setIsViewResultModalOpen: (o: boolean) => void,
  setSelectedPatientId: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          icon={<Activity className="w-6 h-6" />} 
          color="green"
          onClick={() => setView('results')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border bg-surface-2 flex justify-between items-center">
            <h3 className="font-bold tracking-tight">Recent Results</h3>
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
                  <ResultBadge status={r.status} />
                </div>
              );
            })}
            {results.length === 0 && <div className="p-8 text-center text-text-3">No results recorded yet.</div>}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border bg-surface-2 flex justify-between items-center">
            <h3 className="font-bold tracking-tight">Recently Added Patients</h3>
            <button onClick={() => setView('patients')} className="text-xs text-accent hover:underline">View all</button>
          </div>
          <div className="divide-y divide-border">
            {patients.slice(-5).reverse().map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-surface-2 transition-colors cursor-pointer" onClick={() => { setSelectedPatientId(p.id); setView('patientDetail'); }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
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
}

export function PatientsView({ 
  patients, 
  searchQuery, 
  setSearchQuery, 
  onAddPatient, 
  onEditPatient, 
  onDeletePatient, 
  onSelectPatient 
}: { 
  patients: Patient[], 
  searchQuery: string, 
  setSearchQuery: (q: string) => void, 
  onAddPatient: () => void, 
  onEditPatient: (p: Patient) => void, 
  onDeletePatient: (id: string) => void, 
  onSelectPatient: (id: string) => void 
}) {
  const filtered = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-border rounded-2xl focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
        </div>
        <button onClick={onAddPatient} className="btn btn-primary w-full sm:w-auto">
          <UserPlus className="w-4 h-4" /> Register Patient
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-2 text-[10px] font-bold text-text-3 uppercase tracking-widest border-b border-border">
                <th className="px-6 py-4">Patient ID</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">DOB / Gender</th>
                <th className="px-6 py-4">Blood Type</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-surface-2/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-text-3">{p.id}</td>
                  <td className="px-6 py-4 font-medium cursor-pointer" onClick={() => onSelectPatient(p.id)}>
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium">{p.dob}</div>
                    <div className="text-xs text-text-3">{p.gender}</div>
                  </td>
                  <td className="px-6 py-4">
                    {p.bloodType ? <span className="badge badge-normal">{p.bloodType}</span> : <span className="text-text-3">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onSelectPatient(p.id)} className="p-2 text-text-3 hover:text-accent transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => onEditPatient(p)} className="p-2 text-text-3 hover:text-accent transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDeletePatient(p.id)} className="p-2 text-text-3 hover:text-red transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-3 italic">No patients found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ResultsView({ 
  results, 
  patients, 
  onAddResult, 
  onEditResult, 
  onDeleteResult, 
  onViewResult,
  renderBadge
}: { 
  results: LabResult[], 
  patients: Patient[], 
  onAddResult: () => void, 
  onEditResult: (r: LabResult) => void, 
  onDeleteResult: (id: string) => void, 
  onViewResult: (r: LabResult) => void,
  renderBadge: (s: ResultStatus) => React.ReactNode
}) {
  const [activeTab, setActiveTab] = React.useState<'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filtered = useMemo(() => {
    return results.filter(r => {
      const patient = patients.find(p => p.id === r.patientId);
      const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
      const matchesSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           r.panel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           patientName.includes(searchQuery.toLowerCase());
      
      if (activeTab === 'active') {
        return matchesSearch && (r.status === 'pending' || r.status === 'in-progress');
      } else {
        return matchesSearch && (r.status === 'completed' || r.status === 'reviewed');
      }
    }).reverse();
  }, [results, patients, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold tracking-tight text-2xl">Lab Results</h3>
          <p className="text-text-3 text-sm">Manage and track all laboratory reports.</p>
        </div>
        <button onClick={onAddResult} className="btn btn-primary shadow-lg shadow-accent/20">
          <FilePlus className="w-4 h-4" /> New Lab Result
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface p-2 rounded-2xl border border-border">
        <div className="flex p-1 bg-surface-2 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-surface text-accent shadow-sm' : 'text-text-3 hover:text-text-2'}`}
          >
            Active Orders
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-surface text-accent shadow-sm' : 'text-text-3 hover:text-text-2'}`}
          >
            Completed
          </button>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <input 
            type="text" 
            placeholder="Search results..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(r => {
          const patient = patients.find(p => p.id === r.patientId);
          return (
            <div key={r.id} className="card p-5 hover:border-accent/30 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-accent">
                  <FlaskConical className="w-5 h-5" />
                </div>
                {renderBadge(r.status)}
              </div>
              <div className="space-y-1 mb-4">
                <div className="text-[10px] text-text-3 font-mono uppercase tracking-widest">{r.id}</div>
                <div className="font-bold text-lg leading-tight">{r.panel}</div>
                <div className="text-sm font-medium text-text-2">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-xs text-text-3 font-medium">{r.date}</div>
                <div className="flex gap-1">
                  <button onClick={() => onViewResult(r)} title="View Report" className="p-2 text-text-3 hover:text-accent transition-colors"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => onEditResult(r)} title="Edit Result" className="p-2 text-text-3 hover:text-accent transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDeleteResult(r.id)} title="Delete Result" className="p-2 text-text-3 hover:text-red transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center space-y-3 bg-surface-2 rounded-2xl border border-dashed border-border">
            <div className="w-12 h-12 bg-surface-3 rounded-full flex items-center justify-center mx-auto text-text-3">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-2 font-bold">No results found</p>
              <p className="text-text-3 text-sm">Try adjusting your search or filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PanelsView({ 
  customPanels, 
  onAddPanel, 
  onEditPanel, 
  onDeletePanel 
}: { 
  customPanels: TestPanel[], 
  onAddPanel: () => void, 
  onEditPanel: (p: TestPanel) => void, 
  onDeletePanel: (abbr: string) => void 
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold tracking-tight">Custom Test Panels</h3>
        <button onClick={onAddPanel} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Create Panel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customPanels.map(p => (
          <div key={p.abbr} className="card p-6 flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                {p.abbr}
              </div>
              <div>
                <div className="font-bold">{p.name}</div>
                <div className="text-xs text-text-3">{p.tests.length} tests defined</div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEditPanel(p)} className="p-2 text-text-3 hover:text-accent transition-colors"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDeletePanel(p.abbr)} className="p-2 text-text-3 hover:text-red transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {customPanels.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-3 italic bg-surface-2 rounded-2xl border border-dashed border-border">
            No custom panels created yet.
          </div>
        )}
      </div>
    </div>
  );
}

export function PatientDetailView({ 
  patient, 
  results, 
  onBack, 
  onEdit, 
  onAddResult, 
  onViewResult 
}: { 
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
      
      <div className="card bg-gradient-to-br from-accent to-accent-hover dark:from-accent/20 dark:to-accent-hover/20 dark:backdrop-blur-xl p-8 text-white dark:text-text shadow-xl shadow-accent/20 dark:shadow-none border-none dark:border dark:border-white/10">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-24 h-24 rounded-3xl bg-white/20 dark:bg-accent/20 backdrop-blur-md flex items-center justify-center text-4xl font-bold border border-white/30 dark:border-accent/30">
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2">{patient.firstName} {patient.lastName}</h2>
            <p className="text-white/70 dark:text-text-3 font-mono text-sm mb-6">{patient.id}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div><div className="text-xs text-white/50 dark:text-text-3 uppercase font-bold tracking-widest mb-1">Gender</div><div className="font-semibold">{patient.gender}</div></div>
              <div><div className="text-xs text-white/50 dark:text-text-3 uppercase font-bold tracking-widest mb-1">DOB</div><div className="font-semibold">{patient.dob}</div></div>
              <div><div className="text-xs text-white/50 dark:text-text-3 uppercase font-bold tracking-widest mb-1">Blood</div><div className="font-semibold">{patient.bloodType || '—'}</div></div>
              <div><div className="text-xs text-white/50 dark:text-text-3 uppercase font-bold tracking-widest mb-1">Phone</div><div className="font-semibold">{patient.phone || '—'}</div></div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button onClick={() => onEdit(patient)} className="btn bg-white/20 dark:bg-surface-3 hover:bg-white/30 dark:hover:bg-surface-2 text-white dark:text-text border border-white/30 dark:border-border justify-center">Edit Profile</button>
            <button onClick={() => onAddResult(patient.id)} className="btn bg-white dark:bg-accent text-accent dark:text-white hover:bg-white/90 dark:hover:bg-accent-hover justify-center">New Result</button>
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

export function SettingsView({ patientsCount, resultsCount, onClearData }: { patientsCount: number, resultsCount: number, onClearData: () => void }) {
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
