import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, AlertCircle, FlaskConical, Printer } from 'lucide-react';
import { Patient, LabResult, TestPanel, Gender, BloodType, ResultStatus } from '../types';
import { flagValue } from '../lib/storage';

export function PatientModal({ patient, onClose, onSave }: { patient: Patient | null, onClose: () => void, onSave: (data: Partial<Patient>) => void }) {
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

export function ResultModal({ result, patients, allPanels, allPanelLabels, onClose, onSave }: { result: LabResult | null, patients: Patient[], allPanels: Record<string, any>, allPanelLabels: Record<string, string>, onClose: () => void, onSave: (data: Partial<LabResult>) => void }) {
  const [formData, setFormData] = useState<Partial<LabResult>>(result || { status: 'pending', date: new Date().toISOString().slice(0, 10), values: [] });
  
  const selectedPanelTests = formData.panel ? allPanels[formData.panel] : null;

  useEffect(() => {
    if (selectedPanelTests && (!formData.values || formData.values.length !== selectedPanelTests.length)) {
      setFormData(prev => ({ ...prev, values: new Array(selectedPanelTests.length).fill('') }));
    }
  }, [formData.panel, selectedPanelTests]);

  const handleSave = () => {
    if (!formData.patientId || !formData.panel) {
      alert('Please select both a patient and a test panel.');
      return;
    }
    onSave(formData);
  };

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
                {Object.keys(allPanelLabels).map(k => <option key={k} value={k}>{allPanelLabels[k]}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Date</label>
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
            <div className="space-y-4 pt-6 border-t border-border">
              <h4 className="font-bold text-sm uppercase tracking-widest text-accent">Test Values</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedPanelTests.map((test: any, i: number) => (
                  <div key={test.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-text-3 uppercase tracking-wider">{test.name}</label>
                      <span className="text-[10px] text-text-3 font-mono">{test.unit}</span>
                    </div>
                    <input 
                      type="text" 
                      value={formData.values?.[i] || ''} 
                      onChange={e => {
                        const next = [...(formData.values || [])];
                        next[i] = e.target.value;
                        setFormData({...formData, values: next});
                      }} 
                      className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none" 
                      placeholder={`Ref: ${test.ref}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Clinical Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none h-24 resize-none" placeholder="Observations, critical findings..." />
          </div>
        </div>
        <div className="p-6 border-t border-border bg-surface-2 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save Result</button>
        </div>
      </motion.div>
    </div>
  );
}

export function PanelModal({ panel, onClose, onSave }: { panel: TestPanel | null, onClose: () => void, onSave: (data: Partial<TestPanel>) => void }) {
  const [formData, setFormData] = useState<Partial<TestPanel>>(panel || { tests: [] });
  const [newTest, setNewTest] = useState({ name: '', unit: '', ref: '', low: 0, high: 0, crit_low: 0, crit_high: 0 });

  const addTest = () => {
    if (!newTest.name) return;
    setFormData({ ...formData, tests: [...(formData.tests || []), { ...newTest }] });
    setNewTest({ name: '', unit: '', ref: '', low: 0, high: 0, crit_low: 0, crit_high: 0 });
  };

  const removeTest = (index: number) => {
    const next = [...(formData.tests || [])];
    next.splice(index, 1);
    setFormData({ ...formData, tests: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface-2 flex-shrink-0">
          <h3 className="text-xl font-bold tracking-tight">{panel ? 'Edit Test Panel' : 'Create Custom Panel'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-3 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Panel Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none" placeholder="e.g. Comprehensive Metabolic Panel" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-3 uppercase tracking-wider">Abbreviation</label>
              <input type="text" value={formData.abbr} onChange={e => setFormData({...formData, abbr: e.target.value})} className="w-full p-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 outline-none" placeholder="e.g. CMP" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-accent">Define Tests</h4>
            <div className="p-4 bg-surface-2 border border-border rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Test Name" value={newTest.name} onChange={e => setNewTest({...newTest, name: e.target.value})} className="p-2 bg-surface border border-border rounded-lg outline-none" />
                <input type="text" placeholder="Unit" value={newTest.unit} onChange={e => setNewTest({...newTest, unit: e.target.value})} className="p-2 bg-surface border border-border rounded-lg outline-none" />
                <input type="text" placeholder="Ref Range" value={newTest.ref} onChange={e => setNewTest({...newTest, ref: e.target.value})} className="p-2 bg-surface border border-border rounded-lg outline-none" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="number" placeholder="Low" value={newTest.low || ''} onChange={e => setNewTest({...newTest, low: parseFloat(e.target.value)})} className="p-2 bg-surface border border-border rounded-lg outline-none" />
                <input type="number" placeholder="High" value={newTest.high || ''} onChange={e => setNewTest({...newTest, high: parseFloat(e.target.value)})} className="p-2 bg-surface border border-border rounded-lg outline-none" />
                <input type="number" placeholder="Crit Low" value={newTest.crit_low || ''} onChange={e => setNewTest({...newTest, crit_low: parseFloat(e.target.value)})} className="p-2 bg-surface border border-border rounded-lg outline-none" />
                <input type="number" placeholder="Crit High" value={newTest.crit_high || ''} onChange={e => setNewTest({...newTest, crit_high: parseFloat(e.target.value)})} className="p-2 bg-surface border border-border rounded-lg outline-none" />
              </div>
              <button onClick={addTest} className="btn btn-secondary w-full">Add Test to Panel</button>
            </div>

            <div className="space-y-2">
              {formData.tests?.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-surface-2 border border-border rounded-xl">
                  <div className="flex gap-4 items-center">
                    <span className="font-bold text-sm">{t.name}</span>
                    <span className="text-xs text-text-3 font-mono">{t.ref} {t.unit}</span>
                  </div>
                  <button onClick={() => removeTest(i)} className="text-red hover:bg-red/10 p-1 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-border bg-surface-2 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={() => onSave(formData)} className="btn btn-primary">Save Panel</button>
        </div>
      </motion.div>
    </div>
  );
}

export function ViewResultModal({ result, patient, panelTests, onClose }: { 
  result: LabResult, 
  patient: Patient, 
  panelTests: any[], 
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print-modal-backdrop">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col print-modal-content">
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface-2 flex-shrink-0 print:bg-white print:border-b-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent print:hidden">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{result.panel} Report</h3>
              <p className="text-xs text-text-3 font-mono">{result.id} • {result.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={() => window.print()} className="p-2 hover:bg-surface-3 rounded-full transition-colors text-text-3"><Printer className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-2 hover:bg-surface-3 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 space-y-8 print:overflow-visible print:p-0">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-surface-2 rounded-2xl border border-border print:bg-white print:border-2 print:rounded-none">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Patient Details</div>
              <div className="font-bold text-lg">{patient.firstName} {patient.lastName}</div>
              <div className="text-xs text-text-3">{patient.gender} • {patient.dob}</div>
              <div className="text-xs text-text-3">ID: {patient.id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Clinic Information</div>
              <div className="font-bold">Kirkuk General Hospital</div>
              <div className="text-xs text-text-3">Pathology Department</div>
              <div className="text-xs text-text-3">Kirkuk, Iraq</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Report Status</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${result.status === 'completed' ? 'badge-completed' : 'badge-pending'}`}>{result.status}</span>
              </div>
              <div className="text-[10px] text-text-3 mt-2">Generated: {new Date(result.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2 text-[10px] font-bold text-text-3 uppercase tracking-widest border-b border-border">
                  <th className="px-6 py-4">Test Name</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Reference Range</th>
                  <th className="px-6 py-4">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {panelTests.map((test, i) => {
                  const val = result.values[i];
                  const flag = flagValue(val, test);
                  return (
                    <tr key={test.name} className="hover:bg-surface-2/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-sm">{test.name}</td>
                      <td className={`px-6 py-4 font-mono font-bold ${flag === 'critical' ? 'text-red animate-pulse' : flag === 'low' || flag === 'high' ? 'text-orange' : ''}`}>
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
        </div>
      </motion.div>
    </div>
  );
}

export function DeleteConfirmationModal({ type, name, onClose, onConfirm }: { type: string, name: string, onClose: () => void, onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red/10 text-red rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight">Delete {type}?</h3>
            <p className="text-text-3 text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-text">{name}</span>? 
              This action cannot be undone.
            </p>
          </div>
          {type === 'patient' && (
            <div className="p-3 bg-red/5 border border-red/10 rounded-xl flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-red shrink-0" />
              <p className="text-[10px] text-red/80 font-medium leading-tight">
                Warning: Deleting a patient will also permanently delete all associated lab results and history.
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
