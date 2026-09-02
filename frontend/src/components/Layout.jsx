import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Briefcase, Box, LogOut } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Shield className="text-accent-primary" size={24} />
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>NYAYA SETU</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <Briefcase size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/cases" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Briefcase size={20} />
            Cases
          </NavLink>
          <div style={{ flexGrow: 1 }}></div>
          <div className="nav-link" style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'default' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
          <button className="nav-link" onClick={handleLogout} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ fontSize: '1.125rem', fontWeight: 500 }}>
            Secure Asset & Document Lifecycle Management
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
