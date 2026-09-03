import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Briefcase,
  Scale,
  Microscope,
  Lock,
  ArrowRight,
  ShieldCheck,
  Key
} from 'lucide-react';

const DEMO_PRESETS = [
  {
    role: 'ADMIN',
    name: 'Vikramaditya Sharma (IPS)',
    title: 'Administrator',
    email: 'admin@nyaya.dms',
    color: '#2dd4bf',
    icon: Shield,
    badge: 'HQ ADMIN',
  },
  {
    role: 'IO',
    name: 'Inspector Rajesh Deshmukh',
    title: 'Investigating Officer',
    email: 'io.deshmukh@police.gov.in',
    color: '#38bdf8',
    icon: Briefcase,
    badge: 'POLICE IO',
  },
  {
    role: 'JUDGE',
    name: "Hon'ble Justice Meenakshi Sundaram",
    title: 'Special CBI Judge',
    email: 'judge.sundaram@delhicourts.nic.in',
    color: '#f59e0b',
    icon: Scale,
    badge: 'JUDICIARY',
  },
  {
    role: 'FORENSIC_EXPERT',
    name: 'Dr. Aarav Nambiar (PhD)',
    title: 'Forensic Scientist',
    email: 'aarav.nambiar@cfsl.gov.in',
    color: '#c084fc',
    icon: Microscope,
    badge: 'CFSL LAB',
  },
];

export const Login = () => {
  const [email, setEmail] = useState('admin@nyaya.dms');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);
  const { login, switchRole, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  const handleQuickLogin = (preset) => {
    switchRole(preset.role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-teal-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Constrained Focal Container */}
      <div className="w-full max-w-md space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/10">
            <Shield size={26} strokeWidth={1.8} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans mt-2">
            NYAYA SETU • न्याय सेतु
          </h1>
          <p className="text-xs font-sans text-slate-400/80 leading-relaxed max-w-sm mx-auto">
            National Crime Records Bureau (NCRB) • Secure Digital Document Management Portal
          </p>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-sans text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-medium">
            <ShieldCheck size={12} /> SIH PROBLEM 26190 READY
          </div>
        </div>

        {/* 1-Click Role Access presets */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl space-y-2.5 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-medium flex items-center gap-1.5">
              <Key size={13} className="text-teal-400" /> 1-Click Multi-Role Demo
            </span>
            <span className="text-[10px] font-sans text-slate-500">Select Persona</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleQuickLogin(preset)}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-slate-600 transition-all text-left group hover:bg-slate-800/70"
                >
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${preset.color}15`, color: preset.color }}
                  >
                    <Icon size={14} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-teal-400 transition-colors truncate font-sans">
                        {preset.role}
                      </span>
                      <span
                        className="text-[9px] font-sans px-1.5 py-0.2 rounded border"
                        style={{ borderColor: `${preset.color}30`, color: preset.color }}
                      >
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
                      {preset.name.split(' ')[0]} {preset.name.split(' ')[1] || ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Smartcard Credentials Form */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-sans uppercase tracking-wider text-slate-300 font-medium">
              Hardware Smartcard / Credential Login
            </span>
            <span className="text-[10px] font-sans text-emerald-400 font-medium">FIPS-140-3 Active</span>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-400 font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-wider text-slate-400 font-medium">
                Official Email / Police ID
              </label>
              <input
                type="email"
                className="input bg-slate-950 border-slate-700 text-xs py-2 rounded-xl text-slate-100 focus:border-teal-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-sans uppercase tracking-wider text-slate-400 font-medium">
                PKI Certificate Passphrase
              </label>
              <input
                type="password"
                className="input bg-slate-950 border-slate-700 text-xs py-2 rounded-xl text-slate-100 font-mono focus:border-teal-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 text-xs font-semibold tracking-wide uppercase shadow-lg shadow-teal-500/20 rounded-xl flex items-center justify-center gap-2 mt-2 font-sans"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Authenticating Enclave...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center space-y-0.5 text-[11px] font-sans text-slate-400">
          <p>Government of India • Ministry of Home Affairs • NCRB</p>
          <p className="text-slate-400">All interactions logged in tamper-evident blockchain audit ledger</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
