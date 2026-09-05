import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Briefcase,
  Scale,
  Microscope,
  Lock,
  ChevronRight,
} from 'lucide-react';

import '../styles/login.css';

const DEMO_PRESETS = [
  {
    role: 'ADMIN',
    name: 'Vikramaditya Sharma',
    title: 'Administrator',
    email: 'admin@nyaya.dms',
    color: '#0f766e',
    icon: Shield,
  },
  {
    role: 'IO',
    name: 'Rajesh Deshmukh',
    title: 'Investigating Officer',
    email: 'io.deshmukh@police.gov.in',
    color: '#0369a1',
    icon: Briefcase,
  },
  {
    role: 'JUDGE',
    name: 'Justice Sundaram',
    title: 'Presiding Judge',
    email: 'judge.sundaram@delhicourts.nic.in',
    color: '#b45309',
    icon: Scale,
  },
  {
    role: 'FORENSIC_EXPERT',
    name: 'Dr. Aarav Nambiar',
    title: 'Forensic Scientist',
    email: 'aarav.nambiar@cfsl.gov.in',
    color: '#7e22ce',
    icon: Microscope,
  },
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickError, setQuickError] = useState(null);

  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) navigate('/');
  };

  const handleQuickLogin = async (preset) => {
    setQuickError(null);
    setLoading(true);
    const success = await login(preset.email, preset.email);
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setQuickError(`${preset.email} not found. Register it first via Admin panel, or use Sign In below.`);
    }
  };

  return (
    <div className="ns-login-page">
      <main className="ns-login-container">

        <header className="ns-login-brand">
          <div className="ns-login-brand-mark">
            <Shield size={25} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="ns-login-brand-name">Nyaya Setu</h1>
            <p className="ns-login-brand-subtitle">Secure Digital Document Management System</p>
          </div>
        </header>

        <div className="ns-login-notice">
          <div className="ns-login-notice-icon">
            <Shield size={15} />
          </div>
          <div>
            <strong>Authorized access only</strong>
            <span>This system is restricted to authorized government personnel.</span>
          </div>
        </div>

        <section className="ns-login-card">
          <div className="ns-login-card-header">
            <div>
              <span className="ns-login-section-label">DEMONSTRATION ENVIRONMENT</span>
              <h2>Select a role</h2>
              <p>Choose a predefined role to enter the prototype.</p>
            </div>
          </div>

          {quickError && (
            <div className="ns-login-error">
              <Shield size={15} />
              <span>{quickError}</span>
            </div>
          )}

          <div className="ns-login-role-grid">
            {DEMO_PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleQuickLogin(preset)}
                  className="ns-login-role-card"
                  disabled={loading}
                >
                  <div className="ns-login-role-icon" style={{ '--role-color': preset.color }}>
                    <Icon size={19} strokeWidth={1.8} />
                  </div>
                  <div className="ns-login-role-content">
                    <div className="ns-login-role-top">
                      <span className="ns-login-role-title">{preset.title}</span>
                      <ChevronRight size={15} className="ns-login-role-arrow" />
                    </div>
                    <span className="ns-login-role-name">{preset.name}</span>
                    <span className="ns-login-role-email">{preset.email}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="ns-login-card">
          <div className="ns-login-card-header">
            <div>
              <span className="ns-login-section-label">SECURE AUTHENTICATION</span>
              <h2>Sign in</h2>
              <p>Use your official credentials to continue.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="ns-login-form">
            {(error || quickError) && (
              <div className="ns-login-error">
                <Shield size={15} />
                <span>{error || quickError}</span>
              </div>
            )}

            <div className="ns-login-field">
              <label htmlFor="login-email">Official email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@department.gov.in"
                autoComplete="email"
                required
              />
            </div>

            <div className="ns-login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="ns-login-submit">
              {loading ? (
                <>
                  <span className="ns-login-spinner" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Continue securely</span>
                </>
              )}
            </button>

            <div className="ns-login-security-note">
              <Lock size={13} />
              <span>Your session is protected by role-based access control.</span>
            </div>
          </form>
        </section>

        <footer className="ns-login-footer">
          <div className="ns-login-footer-line" />
          <div className="ns-login-footer-content">
            <span>Ministry of Home Affairs</span>
            <span className="ns-login-footer-dot">•</span>
            <span>National Crime Records Bureau</span>
          </div>
          <span className="ns-login-footer-system">NYAYA SETU · SECURE PROTOTYPE</span>
        </footer>

      </main>
    </div>
  );
};

export default Login;
