import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCases, createCase, getUsers } from '../services/api';
import { EmptyState } from '../components/common/EmptyState';
import {
  Briefcase,
  Plus,
  X,
  Search,
  Filter,
  Calendar,
  User,
  Shield,
  AlertCircle,
  Clock,
  ArrowRight,
  FolderPlus
} from 'lucide-react';

export const CaseList = () => {
  const { user, activeRole } = useAuth();
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // New Case Form State
  const [newCase, setNewCase] = useState({
    case_number: `CR-2026-0${Math.floor(Math.random() * 900 + 100)}`,
    title: '',
    description: '',
    assigned_io_id: '2',
    police_station: 'Cyber Crime Police Station, Rohini, New Delhi',
    acts_sections: 'BNS Sec 318(4) / IT Act Sec 66C, 66D',
    court_jurisdiction: 'Special CBI & Cyber Court, Patiala House',
    priority: 'HIGH',
    hearing_date: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const canCreateCase = activeRole === 'ADMIN' || activeRole === 'IO';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesData, usersData] = await Promise.all([getCases(), getUsers()]);
      setCases(casesData || []);
      setUsers((usersData || []).filter(u => u.role === 'IO' || u.role === 'ADMIN'));
    } catch (err) {
      console.error(err);
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
      const assignedUser = users.find(u => u.id === parseInt(newCase.assigned_io_id));
      await createCase({
        ...newCase,
        assigned_io_id: parseInt(newCase.assigned_io_id),
        assigned_io_name: assignedUser?.name || 'Inspector Rajesh Deshmukh',
      });
      setShowModal(false);
      setNewCase({
        case_number: `CR-2026-0${Math.floor(Math.random() * 900 + 100)}`,
        title: '',
        description: '',
        assigned_io_id: '2',
        police_station: 'Cyber Crime Police Station, Rohini, New Delhi',
        acts_sections: 'BNS Sec 318(4) / IT Act Sec 66C',
        court_jurisdiction: 'Special CBI & Cyber Court, Patiala House',
        priority: 'HIGH',
        hearing_date: '',
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create case');
    } finally {
      setCreating(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.case_number.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.acts_sections || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.assigned_io_name || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-heading">
          <span className="page-eyebrow">Registry</span>
          <h1 className="page-title">Cases</h1>
          <p className="page-description">
            Investigation files, assignment, and docket status.
          </p>
        </div>

        {canCreateCase && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} />
            New case
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="search"
            className="pl-10"
            placeholder="Search case number, title, or officer"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="w-auto min-w-[140px]"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <select
          className="w-auto min-w-[140px]"
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className="panel">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="spinner" style={{ width: 24, height: 24 }} />
            <span className="text-xs font-sans text-[var(--text-secondary)]">Fetching case records...</span>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FolderPlus}
              title={search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' ? 'No matching cases' : 'No active cases in registry'}
              description={
                search || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? 'No criminal investigation files matched your active filter criteria. Try clearing filters or searching for another term.'
                  : 'Start by registering your first investigation case file. Each case receives an immutable cryptographic docket and chain of custody ledger.'
              }
              actionLabel={canCreateCase ? "New Case File" : null}
              onAction={canCreateCase ? () => setShowModal(true) : null}
              secondaryLabel={search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' ? 'Reset Filters' : null}
              onSecondaryAction={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Case Number</th>
                  <th>Title & Allegation</th>
                  <th>Offences Charged</th>
                  <th>Assigned Officer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--bg-overlay)] transition-colors">
                    <td>
                      <span className="badge badge-info font-mono text-xs font-semibold">
                        {c.case_number}
                      </span>
                    </td>
                    <td>
                      <div className="font-medium text-[var(--text-primary)] truncate max-w-[260px]">
                        {c.title}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] truncate max-w-[260px] mt-1">
                        {c.description || 'No description provided.'}
                      </div>
                    </td>
                    <td>
                      <span className="font-sans text-xs text-[var(--text-secondary)] truncate max-w-[180px] block">
                        {c.acts_sections || 'BNS Sec 318 / IT Act 66C'}
                      </span>
                    </td>
                    <td>
                      <div className="font-sans text-xs text-[var(--text-primary)] font-medium">
                        {c.assigned_io_name || `Officer #${c.assigned_io_id}`}
                      </div>
                      <div className="font-sans text-[11px] text-[var(--text-secondary)]">
                        {c.police_station || 'Cyber Crime PS'}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`text-[11px] font-sans font-medium px-2.5 py-0.5 rounded-full border ${
                          c.priority === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : c.priority === 'HIGH'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                        }`}
                      >
                        {c.priority || 'NORMAL'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          c.status === 'OPEN'
                            ? 'badge-warn'
                            : c.status === 'CLOSED'
                            ? 'badge-accent'
                            : 'badge-info'
                        } text-[11px]`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="font-sans text-xs text-[var(--text-secondary)] whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <Link
                        to={`/cases/${c.id}`}
                        className="btn btn-secondary text-xs px-3 py-1 inline-flex items-center gap-1 hover:border-teal-400/40"
                      >
                        <span className="font-sans font-medium">Manage</span>
                        <ArrowRight size={12} className="text-[var(--text-secondary)] group-hover:text-teal-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Case Creation Modal */}
      {showModal && canCreateCase && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)} role="dialog" aria-modal="true">
          <div
            className="modal max-w-xl bg-[var(--bg-overlay)] border-[var(--border-subtle)] rounded-lg shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-base)] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Briefcase size={18} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] font-sans">
                    Register Criminal Investigation Case File
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-sans">
                    National Crime Records Bureau Case Docket
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCase} className="p-6 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                    Case / FIR Number
                  </label>
                  <input
                    className="input bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-xs py-2 font-mono text-[var(--text-primary)]"
                    value={newCase.case_number}
                    onChange={e => setNewCase({ ...newCase, case_number: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                    Priority Level
                  </label>
                  <select
                    className="input bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-xs py-2 text-[var(--text-primary)]"
                    value={newCase.priority}
                    onChange={e => setNewCase({ ...newCase, priority: e.target.value })}
                  >
                    <option value="CRITICAL">Critical (Cyber Terrorism / State Security)</option>
                    <option value="HIGH">High (Inter-state Identity/Financial Fraud)</option>
                    <option value="MEDIUM">Medium (Standard Cyber Offence)</option>
                    <option value="LOW">Low (Routine Regulatory Investigation)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                  Case Title
                </label>
                <input
                  className="input bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-xs py-2 text-[var(--text-primary)]"
                  placeholder="e.g. State vs. Network Syndicate: SCADA Intrusion"
                  value={newCase.title}
                  onChange={e => setNewCase({ ...newCase, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                  Acts & Penal Sections Invoked
                </label>
                <input
                  className="input bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-xs py-2 font-sans text-[var(--text-secondary)]"
                  placeholder="e.g. BNS Sec 318(4), Sec 336 / IT Act Sec 66C"
                  value={newCase.acts_sections}
                  onChange={e => setNewCase({ ...newCase, acts_sections: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                    Assigned Investigating Officer (IO)
                  </label>
                  <select
                    className="input bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-xs py-2 text-[var(--text-primary)]"
                    value={newCase.assigned_io_id}
                    onChange={e => setNewCase({ ...newCase, assigned_io_id: e.target.value })}
                    required
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.badge_number || 'IO'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                    Originating Police Station
                  </label>
                  <input
                    className="input bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-xs py-2 text-[var(--text-primary)]"
                    value={newCase.police_station}
                    onChange={e => setNewCase({ ...newCase, police_station: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                  Brief Facts / First Information Summary
                </label>
                <textarea
                  className="input bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-xs py-2 min-h-[70px] text-[var(--text-primary)]"
                  placeholder="Summary of allegations, preliminary findings, and suspect entities..."
                  value={newCase.description}
                  onChange={e => setNewCase({ ...newCase, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary text-xs px-4 py-2 font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5 font-sans"
                >
                  {creating ? <span className="spinner" /> : <Briefcase size={14} />}
                  <span>Initialize Digital Case Docket</span>
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
