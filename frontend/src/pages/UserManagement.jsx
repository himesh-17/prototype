import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/api';
import { Users, Shield, Search, UserPlus, MoreHorizontal, Edit2, Trash2, X, Check } from 'lucide-react';

const roleBadge = {
  ADMIN: 'badge-danger',
  IO: 'badge-accent',
  FORENSIC_EXPERT: 'badge-info',
  JUDGE: 'badge-warn',
};

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'IO', badge_number: '', department: '' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    (u.badge_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    setCreating(true);
    try {
      const payload = { ...newUser, badge_number: newUser.badge_number || null, department: newUser.department || null };
      const res = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('nyaya_token')}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setCreating(false);
      setNewUser({ name: '', email: '', password: '', role: 'IO', badge_number: '', department: '' });
      fetchUsers();
    } catch (err) {
      alert('Create user: ' + err.message);
      setCreating(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/auth`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('nyaya_token')}` },
        body: JSON.stringify({ id, ...editData }),
      });
      if (!res.ok) throw new Error(await res.text());
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert('Update user: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/auth/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('nyaya_token')}` },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchUsers();
    } catch (err) {
      alert('Delete user: ' + err.message);
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditData({ name: u.name, email: u.email, role: u.role, badge_number: u.badge_number || '', department: u.department || '' });
  };

  const formatSafeDate = (dateVal) => {
    if (!dateVal) return '15 Jan 2026';
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? '15 Jan 2026' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderUserRows = (u) => {
    const isEditing = editingId === u.id;
    return [
      <tr key={u.id} className="hover:bg-[var(--bg-overlay)] transition-colors">
        <td>
          <div className="flex items-center gap-3">
            <div className="avatar bg-[var(--bg-card)] text-[var(--accent-strong)] border-[var(--border-subtle)] font-sans font-semibold text-xs" style={{ width: 34, height: 34 }}>
              {u.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div className="row-meta">{u.name}</div>
              <div className="text-xs text-[var(--text-secondary)]">{u.id === user.id ? 'Current session' : ''}</div>
            </div>
          </div>
        </td>
        <td>
          <span className={`badge ${roleBadge[u.role] || 'badge-info'}`}>
            {u.role.replace('_', ' ')}
          </span>
        </td>
        <td className="text-[var(--text-secondary)]">{u.badge_number || '—'}</td>
        <td className="text-[var(--text-secondary)] truncate max-w-[200px]">{u.department || '—'}</td>
        <td className="text-[var(--text-secondary)]">{u.email}</td>
        <td className="text-[var(--text-secondary)] whitespace-nowrap">{formatSafeDate(u.created_at)}</td>
        <td className="row-actions">
          {isEditing ? (
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => handleUpdate(u.id)}><Check size={14} strokeWidth={1.8} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}><X size={14} strokeWidth={1.8} /></button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]" onClick={() => startEdit(u)}><Edit2 size={14} strokeWidth={1.8} /></button>
              {u.id !== user.id && (
                <button className="btn btn-ghost btn-sm btn-danger text-[var(--danger-base)] hover:bg-[var(--danger-soft)]" onClick={() => handleDelete(u.id)}><Trash2 size={14} strokeWidth={1.8} /></button>
              )}
            </div>
          )}
        </td>
      </tr>,
      isEditing && (
        <tr key={`${u.id}-edit`}>
          <td colSpan={7} style={{ padding: 0, borderTop: '1px solid var(--border-subtle)' }}>
            <div className="surface-elevated" style={{ margin: '0.5rem 1rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(u.id); }} className="field-grid" style={{ padding: '1rem' }}>
                <div className="input-group">
                  <label>Name</label>
                  <input className="input-field" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" className="input-field" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Role</label>
                  <select className="input-field" value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })}>
                    <option value="IO">Investigating Officer</option>
                    <option value="FORENSIC_EXPERT">Forensic Expert</option>
                    <option value="JUDGE">Judge</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Badge Number</label>
                  <input className="input-field" value={editData.badge_number} onChange={e => setEditData({ ...editData, badge_number: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Department</label>
                  <input className="input-field" value={editData.department} onChange={e => setEditData({ ...editData, department: e.target.value })} />
                </div>
                <div className="form-actions" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save</button>
                </div>
              </form>
            </div>
          </td>
        </tr>
      ),
    ];
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-heading">
          <span className="page-eyebrow">Administration</span>
          <h1 className="page-title">Users</h1>
          <p className="page-description">Accounts and roles for this system.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <UserPlus size={16} strokeWidth={1.8} /> Add User
        </button>
      </div>

      {creating && (
        <div className="panel" style={{ maxWidth: 560 }}>
          <div className="panel-head">
            <h3 className="panel-title">Create user</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setCreating(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="panel-body field-grid">
            <div className="input-group">
              <label htmlFor="nu-name">Name</label>
              <input id="nu-name" className="input-field" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label htmlFor="nu-email">Email</label>
              <input id="nu-email" type="email" className="input-field" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
            </div>
            <div className="input-group">
              <label htmlFor="nu-password">Password</label>
              <input id="nu-password" type="password" className="input-field" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required minLength={8} />
            </div>
            <div className="input-group">
              <label htmlFor="nu-role">Role</label>
              <select id="nu-role" className="input-field" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                <option value="IO">Investigating Officer</option>
                <option value="FORENSIC_EXPERT">Forensic Expert</option>
                <option value="JUDGE">Judge</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="nu-badge">Badge Number (optional)</label>
              <input id="nu-badge" className="input-field" value={newUser.badge_number} onChange={e => setNewUser({ ...newUser, badge_number: e.target.value })} />
            </div>
            <div className="input-group">
              <label htmlFor="nu-dept">Department (optional)</label>
              <input id="nu-dept" className="input-field" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} />
            </div>
            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? <span className="spinner" /> : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="toolbar">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            id="user-search"
            type="search"
            className="pl-10"
            placeholder="Search name, email, role, or badge"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="panel">
        {loading ? (
          <div className="spinner-block"><div className="spinner" /></div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={32} style={{ opacity: 0.3 }} />
            <h3>No users found</h3>
            <p>{search ? `No matches for "${search}"` : 'No users in the system.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>User</th>
                  <th style={{ width: '120px' }}>Role</th>
                  <th style={{ width: '140px' }}>Badge</th>
                  <th style={{ width: '140px' }}>Department</th>
                  <th style={{ width: '160px' }}>Email</th>
                  <th style={{ width: '160px' }}>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.flatMap(renderUserRows)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;