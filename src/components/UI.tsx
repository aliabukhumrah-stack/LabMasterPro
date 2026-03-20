import React from 'react';
import { motion } from 'motion/react';
import { ResultStatus } from '../types';

export function NavItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 relative group ${
        active 
          ? 'bg-sidebar-active text-sidebar-text shadow-sm' 
          : 'text-sidebar-text-2 hover:bg-sidebar-hover hover:text-sidebar-text'
      }`}
    >
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute inset-0 bg-accent/10 rounded-xl blur-md -z-10 opacity-0 dark:opacity-100"
        />
      )}
      <span className={`w-5 h-5 ${active ? 'text-accent' : ''}`}>{icon}</span>
      <span className="text-sm font-semibold tracking-wide">{label}</span>
    </button>
  );
}

export function StatCard({ label, value, icon, color, onClick }: { label: string, value: number, icon: React.ReactNode, color: 'blue' | 'orange' | 'green' | 'purple', onClick?: () => void }) {
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
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[color]} opacity-0 dark:group-hover:opacity-5 transition-opacity`} />
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

export function Badge({ children, variant }: { children: React.ReactNode, variant: string }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function ResultBadge({ status }: { status: ResultStatus }) {
  const styles: Record<ResultStatus, string> = {
    'pending': 'badge-pending',
    'in-progress': 'badge-inprogress',
    'completed': 'badge-completed',
    'reviewed': 'badge-reviewed',
  };
  return <span className={`badge ${styles[status]}`}>{status.replace('-', ' ')}</span>;
}
