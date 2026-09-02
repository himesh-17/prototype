import { useState, useEffect } from 'react';
import { getCases, createCase, getUsers } from '../services/api';
import { Briefcase, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CaseList = () => {
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New Case Form State
  const [newCase, setNewCase] = useState({
    case_number: '',
    title: '',
    description: '',
    assigned_io_id: ''
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesData, usersData] = await Promise.all([getCases(), getUsers()]);
      setCases(casesData);
      setUsers(usersData.filter(u => u.role === 'IO' || u.role === 'ADMIN')); // Only IOs/Admins can be assigned
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await createCase({
        ...newCase,
        assigned_io_id: parseInt(newCase.assigned_io_id)
      });
      setShowModal(false);
      setNewCase({ case_number: '', title: '', description: '', assigned_io_id: '' });
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <Briefcase size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h2>Active Cases</h2>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Manage and oversee ongoing investigations</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Case
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center my-8"><div className="spinner" /></div>
        ) : cases.length === 0 ? (
          <div className="text-center my-8 text-muted">
            <Briefcase size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>No cases found. Create one to get started.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Case Number</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id}>
                    <td><div className="badge badge-info">{c.case_number}</div></td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.title}</td>
                    <td>
                      <span className={`badge ${c.status === 'OPEN' ? 'badge-warning' : c.status === 'CLOSED' ? 'badge-success' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/cases/${c.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Manage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Case</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}>
                <X size={24} />
              </button>
            </div>
            
            {error && <div className="badge badge-danger mb-4 w-full justify-center" style={{ width: '100%', padding: '0.75rem' }}>{error}</div>}
            
            <form onSubmit={handleCreateCase}>
              <div className="input-group">
                <label className="input-label">Case Number</label>
                <input required className="input-field" value={newCase.case_number} onChange={e => setNewCase({...newCase, case_number: e.target.value})} placeholder="e.g. CR-2026-001" />
              </div>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input required className="input-field" value={newCase.title} onChange={e => setNewCase({...newCase, title: e.target.value})} placeholder="Case Title" />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" value={newCase.description} onChange={e => setNewCase({...newCase, description: e.target.value})} rows={3} placeholder="Brief description..." />
              </div>
              <div className="input-group">
                <label className="input-label">Assign Investigating Officer (IO)</label>
                <select required className="input-field" value={newCase.assigned_io_id} onChange={e => setNewCase({...newCase, assigned_io_id: e.target.value})}>
                  <option value="" disabled>Select an Officer...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.badge_number || 'N/A'})</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating} style={{ minWidth: '140px' }}>
                  {creating ? <div className="spinner" /> : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseList;

