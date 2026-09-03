import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';

const initials = (name = '') => {
  if (!name) return '·';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
};

const PAGE_TITLES = [
  { match: (p) => p.startsWith('/cases/') && p.includes('/assets') === false, title: 'Case file' },
  { match: (p) => p.startsWith('/assets/'), title: 'Evidence asset' },
  { match: (p) => p === '/cases', title: 'Cases' },
  { match: (p) => p === '/search', title: 'Document search' },
  { match: (p) => p === '/court/documents', title: 'Court records' },
  { match: (p) => p === '/forensic', title: 'Forensic lab' },
  { match: (p) => p === '/audit', title: 'Audit trail' },
  { match: (p) => p === '/users', title: 'User access' },
  { match: (p) => p === '/', title: 'Overview' },
];

export const Layout = () => {
  const { user, activeRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (activeRole === 'JUDGE') {
      return [
        { to: '/', label: 'Court docket', icon: Scale, end: true },
        { to: '/cases', label: 'Trial cases', icon: Briefcase },
        { to: '/court/documents', label: 'Case documents', icon: FileText },
        { to: '/search', label: 'Evidence search', icon: Search },
      ];
    }
    if (activeRole === 'FORENSIC_EXPERT') {
      return [
        { to: '/', label: 'Lab overview', icon: Microscope, end: true },
        { to: '/forensic', label: 'Evidence & reports', icon: HardDrive },
        { to: '/cases', label: 'Assigned cases', icon: Briefcase },
        { to: '/search', label: 'Document search', icon: Search },
      ];
    }
    if (activeRole === 'IO') {
      return [
        { to: '/', label: 'Workstation', icon: LayoutDashboard, end: true },
        { to: '/cases', label: 'My cases', icon: Briefcase },
        { to: '/search', label: 'Document search', icon: Search },
        { to: '/forensic', label: 'Evidence & custody', icon: HardDrive },
      ];
    }
    return [
      { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/cases', label: 'All cases', icon: Briefcase },
      { to: '/search', label: 'Document search', icon: Search },
      { to: '/court/documents', label: 'Court records', icon: Scale },
      { to: '/forensic', label: 'Forensics', icon: Microscope },
    ];
  };

  const navItems = getNavLinks();
  const pageMeta = PAGE_TITLES.find((item) => item.match(location.pathname));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden>
            NS
          </div>
          <div className="brand-text">
            <span className="brand-title">Nyaya Setu</span>
            <span className="brand-subtitle">NCRB document system</span>
          </div>
        </div>

        <div>
          <div className="nav-label">Perspective</div>
          <RoleSwitcher />
        </div>

        <div className="nav-section flex-1">
          <span className="nav-label">Workspace</span>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.7} />
              <span>{label}</span>
            </NavLink>
          ))}

          {activeRole === 'ADMIN' && (
            <div className="mt-5 pt-4 border-t border-slate-800">
              <span className="nav-label">Administration</span>
              <NavLink
                to="/audit"
                className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              >
                <ShieldCheck size={17} strokeWidth={1.7} />
                <span>Audit trail</span>
              </NavLink>
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              >
                <Users size={17} strokeWidth={1.7} />
                <span>User access</span>
              </NavLink>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar" aria-hidden>
              {initials(user?.name).toUpperCase()}
            </div>
            <div className="user-meta min-w-0">
              <span className="user-name">{user?.name || 'Authorized user'}</span>
              <span className="user-role">{user?.badge_number || user?.role || 'NCRB HQ'}</span>
            </div>
          </div>

          <button className="nav-link" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.7} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-meta">
            <span className="topbar-title">{pageMeta?.title || 'Workspace'}</span>
            <span className="topbar-subtitle">National Crime Records Bureau</span>
          </div>
          <div className="topbar-actions">
            <span className="badge badge-accent">
              <span className="status-dot dot-active" />
              Ledger live
            </span>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
