import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Briefcase, Scale, Microscope, ChevronDown, Check } from 'lucide-react';

const roleMeta = {
  ADMIN: {
    label: 'Administrator',
    officer: 'Vikramaditya Sharma',
    agency: 'NCRB HQ',
    icon: Shield,
    color: '#2dd4bf',
  },
  IO: {
    label: 'Investigator',
    officer: 'Rajesh Deshmukh',
    agency: 'Cyber Crime Branch',
    icon: Briefcase,
    color: '#38bdf8',
  },
  JUDGE: {
    label: 'Court',
    officer: 'Justice Sundaram',
    agency: 'Patiala House',
    icon: Scale,
    color: '#f59e0b',
  },
  FORENSIC_EXPERT: {
    label: 'Forensics',
    officer: 'Dr. Aarav Nambiar',
    agency: 'CFSL CBI',
    icon: Microscope,
    color: '#c084fc',
  },
};

export const RoleSwitcher = () => {
  const { activeRole, switchRole } = useAuth();
  const [open, setOpen] = useState(false);

  const currentRole = roleMeta[activeRole] || roleMeta.ADMIN;
  const CurrentIcon = currentRole.icon;

  const handleSelect = (roleKey) => {
    switchRole(roleKey);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-lg bg-slate-900 px-3 py-2.5 border border-slate-800 hover:border-slate-700 transition-colors text-left"
        aria-label="Switch active role"
        aria-expanded={open}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md shrink-0"
          style={{ backgroundColor: `${currentRole.color}20`, color: currentRole.color }}
        >
          <CurrentIcon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-100 truncate" style={{ color: currentRole.color }}>
            {currentRole.label}
          </span>
          <span className="block text-xs text-slate-400 truncate">{currentRole.officer}</span>
        </div>
        <ChevronDown size={16} className="text-slate-500 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl bg-slate-900 border border-slate-700 p-2 shadow-2xl">
            {Object.entries(roleMeta).map(([roleKey, meta]) => {
              const Icon = meta.icon;
              const isSelected = activeRole === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => handleSelect(roleKey)}
                  className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-lg text-left transition-colors ${
                    isSelected ? 'bg-slate-800' : 'hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-md shrink-0"
                      style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-medium text-slate-100">{meta.label}</span>
                      <span className="block text-xs text-slate-400 truncate">{meta.agency}</span>
                    </div>
                  </div>
                  {isSelected && <Check size={16} className="text-teal-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default RoleSwitcher;
