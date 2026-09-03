import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Briefcase,
  Scale,
  Microscope,
  Lock,
} from 'lucide-react';

const DEMO_PRESETS = [
  {
    role: 'ADMIN',
    name: 'Vikramaditya Sharma',
    title: 'Administrator',
    email: 'admin@nyaya.dms',
    color: '#2dd4bf',
    icon: Shield,
  },
  {
    role: 'IO',
    name: 'Rajesh Deshmukh',
    title: 'Investigating officer',
    email: 'io.deshmukh@police.gov.in',
    color: '#38bdf8',
    icon: Briefcase,
  },
  {
    role: 'JUDGE',
    name: 'Justice Sundaram',
    title: 'Presiding judge',
    email: 'judge.sundaram@delhicourts.nic.in',
    color: '#f59e0b',
    icon: Scale,
  },
  {
    role: 'FORENSIC_EXPERT',
    name: 'Dr. Aarav Nambiar',
    title: 'Forensic scientist',
    email: 'aarav.nambiar@cfsl.gov.in',
    color: '#c084fc',
    icon: Microscope,
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-5 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Shield size={24} strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Nyaya Setu
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            NCRB secure document portal
          </p>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Demo access</h2>
          </div>
          <div className="panel-body grid grid-cols-2 gap-3">
            {DEMO_PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleQuickLogin(preset)}
                  className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-slate-600 transition-colors text-left"
                >
                  <div
                    className="h-8 w-8 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${preset.color}18`, color: preset.color }}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-medium text-slate-100">{preset.title}</span>
                    <span className="block text-xs text-slate-400 mt-0.5 truncate">{preset.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Sign in</h2>
          </div>
          <form onSubmit={handleSubmit} className="panel-body space-y-5">
            {error && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2.5 text-sm text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email">Official email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Continue
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 leading-relaxed">
          Ministry of Home Affairs · NCRB
        </p>
      </div>
    </div>
  );
};

export default Login;
