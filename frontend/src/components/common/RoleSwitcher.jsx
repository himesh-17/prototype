import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Briefcase, Scale, Microscope, ChevronDown, Check } from 'lucide-react';

const roleMeta = {
  ADMIN: {
    label: 'ADMIN',
    fullName: 'Administrator',
    officer: 'Vikramaditya Sharma (IPS)',
    agency: 'NCRB HQ',
    icon: Shield,
    color: '#00d4aa',
    badgeClass: 'bg-teal-500/10 text-[#00d4aa] border-teal-500/20',
  },
  IO: {
    label: 'INVESTIGATOR',
    fullName: 'Investigating Officer (IO)',
    officer: 'Inspector Rajesh Deshmukh',
    agency: 'Cyber Crime Branch',
    icon: Briefcase,
    color: '#38bdf8',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  JUDGE: {
    label: 'COURT',
    fullName: "Hon'ble Presiding Judge",
    officer: 'Justice Meenakshi Sundaram',
    agency: 'Special CBI & Cyber Court',
    icon: Scale,
    color: '#f59e0b',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  FORENSIC_EXPERT: {
    label: 'FORENSIC ANALYST',
    fullName: 'Senior Forensic Scientist',
    officer: 'Dr. Aarav Nambiar (PhD)',
    agency: 'CFSL CBI Complex',
    icon: Microscope,
    color: '#c084fc',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
};

export const RoleSwitcher = () => {
  const { user, activeRole, switchRole } = useAuth();
  const [open, setOpen] = useState(false);

  const currentRole = roleMeta[activeRole] || roleMeta.ADMIN;
  const CurrentIcon = currentRole.icon;

  const handleSelect = (roleKey) => {
    switchRole(roleKey);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl bg-[#16161d] px-3 py-1.5 border border-white/[0.1] hover:border-white/[0.2] transition-colors text-left shadow-sm"
        aria-label="Switch active role"
        aria-expanded={open}
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${currentRole.color}20`, color: currentRole.color }}
        >
          <CurrentIcon size={14} />
        </div>
        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-semibold tracking-wider" style={{ color: currentRole.color }}>
              {currentRole.label}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 block truncate max-w-[130px]">
            {currentRole.officer}
          </span>
        </div>
        <ChevronDown size={13} className="text-zinc-400 shrink-0 ml-0.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 z-50 rounded-2xl bg-[#14141a] border border-white/[0.12] p-2 shadow-2xl space-y-1 animate-modal-in">
            <div className="px-3 py-1.5 border-b border-white/[0.06] mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Switch Role / Perspective
              </span>
            </div>

            {Object.entries(roleMeta).map(([roleKey, meta]) => {
              const Icon = meta.icon;
              const isSelected = activeRole === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => handleSelect(roleKey)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-white/[0.08] border border-white/[0.1]'
                      : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-zinc-100">
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {meta.officer}
                      </p>
                      <span className="text-[10px] font-mono text-zinc-500 block truncate">
                        {meta.agency}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-[#00d4aa] shrink-0 ml-2" />
                  )}
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
