import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleSwitcher } from './common/RoleSwitcher';
import {
  LayoutDashboard,
  Briefcase,
  Search,
  ShieldCheck,
  Users,
  LogOut,
  Scale,
  Microscope,
  HardDrive,
  FileText,
  Shield,
  Send,
  Lock
} from 'lucide-react';

const initials = (name = '') => {
  if (!name) return '·';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
};

export const Layout = () => {
  const { user, activeRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role tailored navigation links
  const getNavLinks = () => {
    if (activeRole === 'JUDGE') {
      return [
        { to: '/', label: 'Court Docket', icon: Scale, end: true },
        { to: '/cases', label: 'Trial Cases', icon: Briefcase },
        { to: '/court/documents', label: 'Case Documents', icon: FileText },
        { to: '/search', label: 'Evidence Search', icon: Search },
      ];
    }
    if (activeRole === 'FORENSIC_EXPERT') {
      return [
        { to: '/', label: 'Forensic Lab', icon: Microscope, end: true },
        { to: '/forensic', label: 'Evidence & Reports', icon: HardDrive },
        { to: '/cases', label: 'Assigned Cases', icon: Briefcase },
        { to: '/search', label: 'Document Search', icon: Search },
      ];
    }
    if (activeRole === 'IO') {
      return [
        { to: '/', label: 'IO Workstation', icon: LayoutDashboard, end: true },
        { to: '/cases', label: 'My Cases', icon: Briefcase },
        { to: '/search', label: 'Document Search', icon: Search },
        { to: '/forensic', label: 'Evidence & Custody', icon: HardDrive },
      ];
    }
    // Default ADMIN
    return [
      { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/cases', label: 'All Cases', icon: Briefcase },
      { to: '/search', label: 'Document Search', icon: Search },
      { to: '/court/documents', label: 'Court Records', icon: Scale },
      { to: '/forensic', label: 'Forensics & Lab', icon: Microscope },
    ];
  };

  const navItems = getNavLinks();

  return (
    <div className="app-shell bg-slate-900">
      <aside className="sidebar bg-slate-950 border-r border-slate-800/80">
        {/* Brand */}
        <div className="brand border-b border-slate-800/80">
          <div className="brand-mark font-sans text-teal-400 border-teal-500/30 bg-slate-900" aria-hidden>
            NS
          </div>
          <div className="brand-text">
            <span className="brand-title font-sans font-semibold tracking-tight text-slate-100">Nyaya Setu</span>
            <span className="brand-subtitle font-sans text-[11px] text-teal-400/90 font-medium">
              NCRB • SIH 26190
            </span>
          </div>
        </div>

        {/* Role Selector in Sidebar */}
        <div className="my-2 px-1">
          <div className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-medium mb-1.5 px-1">
            Active Perspective
          </div>
          <RoleSwitcher />
        </div>

        {/* Main Navigation Section */}
        <div className="nav-section flex-1">
          <span className="nav-label text-slate-400 font-medium">Workspace</span>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={16} strokeWidth={1.7} />
              <span className="font-sans font-medium">{label}</span>
            </NavLink>
          ))}

          {/* Admin Dedicated Section */}
          {activeRole === 'ADMIN' && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="nav-label text-slate-400 font-medium">Administration</span>
              <NavLink
                to="/audit"
                className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              >
                <ShieldCheck size={16} strokeWidth={1.7} />
                <span className="font-sans font-medium">Audit Trail (Merkle)</span>
              </NavLink>
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              >
                <Users size={16} strokeWidth={1.7} />
                <span className="font-sans font-medium">User Access Control</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer pt-3 border-t border-slate-800/80">
          <div className="user-chip bg-slate-900 border border-slate-800">
            <div className="avatar bg-teal-500/10 text-teal-400 border border-teal-500/20 font-sans font-semibold text-xs" aria-hidden>
              {initials(user?.name).toUpperCase()}
            </div>
            <div className="user-meta min-w-0">
              <span className="user-name font-sans font-medium text-slate-200 truncate text-xs">
                {user?.name || 'Authorized User'}
              </span>
              <span className="user-role font-sans text-[11px] text-slate-400 truncate">
                {user?.badge_number || user?.role || 'NCRB HQ'}
              </span>
            </div>
          </div>

          <button
            className="nav-link text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
            onClick={handleLogout}
          >
            <LogOut size={16} strokeWidth={1.7} />
            <span className="font-sans font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="workspace bg-slate-900 text-slate-300 min-h-screen">
        <header className="topbar bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md">
          <div className="topbar-meta">
            <span className="topbar-title font-sans font-semibold text-slate-100 text-sm">
              National Crime Records Bureau (NCRB) • Digital Chain of Custody
            </span>
          </div>

          <div className="topbar-actions flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="badge badge-accent text-xs flex items-center gap-1.5">
                <span className="status-dot dot-active" />
                <span>HSM Node Active</span>
              </span>
              <span className="badge badge-info text-xs flex items-center gap-1.5">
                <Lock size={11} className="text-sky-400" />
                <span>SHA-256 Validated</span>
              </span>
            </div>

            <RoleSwitcher />
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
