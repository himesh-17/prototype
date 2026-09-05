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
        className="flex w-full items-center gap-3 rounded-lg bg-[var(--bg-overlay)] px-3 py-2.5 border border-[var(--border-subtle)] hover:border-teal-400/40 transition-colors text-left"
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
          <span className="block text-sm font-semibold text-[var(--text-primary)] truncate" style={{ color: currentRole.color }}>
            {currentRole.label}
          </span>
          <span className="block text-xs text-[var(--text-tertiary)] truncate">{currentRole.officer}</span>
        </div>
        <ChevronDown size={16} className="text-[var(--text-tertiary)] shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] p-2 shadow-2xl">
            {Object.entries(roleMeta).map(([roleKey, meta]) => {
              const Icon = meta.icon;
              const isSelected = activeRole === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => handleSelect(roleKey)}
                  className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-lg text-left transition-colors ${isSelected ? 'bg-[var(--bg-card)]' : 'hover:bg-[var(--bg-card)]/60'
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
                      <span className="block text-sm font-medium text-[var(--text-primary)]">{meta.label}</span>
                      <span className="block text-xs text-[var(--text-tertiary)] truncate">{meta.agency}</span>
                    </div>
                  </div>
                  {isSelected && <Check size={16} className="text-[var(--accent-strong)] shrink-0" />}
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
