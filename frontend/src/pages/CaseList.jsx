import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCases, createCase, getUsers } from '../services/api';
import { EmptyState } from '../components/common/EmptyState';

import {
  Briefcase,
  Plus,
  X,
  Search,
  Shield,
  AlertCircle,
  Clock,
  ArrowRight,
  FolderPlus,
  MapPin,
  User,
  CalendarDays,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import '../styles/case-list.css';

const CASES_PER_PAGE = 4;

const initialCaseState = () => ({
  case_number: `CR-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
  title: '',
  description: '',
  assigned_io_id: '2',
  police_station: 'Cyber Crime Police Station, Rohini, New Delhi',
  acts_sections: 'BNS Sec 318(4) / IT Act Sec 66C, 66D',
  court_jurisdiction: 'Special CBI & Cyber Court, Patiala House',
  priority: 'HIGH',
  hearing_date: '',
});

export const CaseList = () => {
  const { activeRole } = useAuth();

  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);

  const [newCase, setNewCase] = useState(initialCaseState);
  const [error, setError] = useState('');

  const canCreateCase =
    activeRole === 'ADMIN' || activeRole === 'IO';

  /* ---------------------------------------------------------
     Fetch Cases + Users
  --------------------------------------------------------- */

  const fetchData = async () => {
    setLoading(true);

    try {
      const [casesData, usersData] = await Promise.all([
        getCases(),
        getUsers(),
      ]);

      setCases(casesData || []);

      setUsers(
        (usersData || []).filter(
          (u) => u.role === 'IO' || u.role === 'ADMIN'
        )
      );
    } catch (err) {
      console.error('Failed to fetch case data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------------------------------------------------
     Create Case
  --------------------------------------------------------- */

  const handleCreateCase = async (e) => {
    e.preventDefault();

    setCreating(true);
    setError('');

    try {
      const assignedUser = users.find(
        (u) => u.id === parseInt(newCase.assigned_io_id)
      );

      await createCase({
        ...newCase,
        assigned_io_id: parseInt(newCase.assigned_io_id),
        assigned_io_name:
          assignedUser?.name || 'Inspector Rajesh Deshmukh',
      });

      setShowModal(false);
      setNewCase(initialCaseState());

      await fetchData();

      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to create case');
    } finally {
      setCreating(false);
    }
  };

  /* ---------------------------------------------------------
     Filtering
  --------------------------------------------------------- */

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cases.filter((c) => {
      const searchableText = [
        c.case_number,
        c.title,
        c.description,
        c.acts_sections,
        c.assigned_io_name,
        c.police_station,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        statusFilter === 'ALL' ||
        c.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'ALL' ||
        c.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [cases, search, statusFilter, priorityFilter]);

  /* ---------------------------------------------------------
     Pagination
  --------------------------------------------------------- */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCases.length / CASES_PER_PAGE)
  );

  const visibleCases = useMemo(() => {
    const start =
      (currentPage - 1) * CASES_PER_PAGE;

    return filteredCases.slice(
      start,
      start + CASES_PER_PAGE
    );
  }, [filteredCases, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* ---------------------------------------------------------
     Statistics
  --------------------------------------------------------- */

  const totalCases = cases.length;

  const openCases = cases.filter(
    (c) => c.status === 'OPEN'
  ).length;

  const criticalCases = cases.filter(
    (c) => c.priority === 'CRITICAL'
  ).length;

  const highPriorityCases = cases.filter(
    (c) => c.priority === 'HIGH'
  ).length;

  /* ---------------------------------------------------------
     Helpers
  --------------------------------------------------------- */

  const formatDate = (date) => {
    if (!date) return '—';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '—';
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'case-priority critical';

      case 'HIGH':
        return 'case-priority high';

      case 'MEDIUM':
        return 'case-priority medium';

      case 'LOW':
        return 'case-priority low';

      default:
        return 'case-priority medium';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'case-status open';

      case 'CLOSED':
        return 'case-status closed';

      case 'ARCHIVED':
        return 'case-status archived';

      default:
        return 'case-status archived';
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCurrentPage(1);
  };

  const closeModal = () => {
    if (!creating) {
      setShowModal(false);
      setError('');
    }
  };

  return (
    <div className="case-list-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="case-page-header">
        <div className="case-page-heading">

          <div className="case-eyebrow">
            <Shield size={14} />
            Investigation Registry
          </div>

          <h1>Cases</h1>

          <p>
            Manage investigation files, assigned officers,
            offences and case lifecycle status.
          </p>
        </div>

        {canCreateCase && (
          <button
            type="button"
            className="case-new-button"
            onClick={() => setShowModal(true)}
          >
            <Plus size={17} />
            New Case
          </button>
        )}
      </section>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section className="case-stats-grid">

        <div className="case-stat-card">
          <div className="case-stat-icon blue">
            <Briefcase size={19} />
          </div>

          <div>
            <span>Total Cases</span>
            <strong>{totalCases}</strong>
          </div>
        </div>

        <div className="case-stat-card">
          <div className="case-stat-icon orange">
            <Clock size={19} />
          </div>

          <div>
            <span>Open Investigations</span>
            <strong>{openCases}</strong>
          </div>
        </div>

        <div className="case-stat-card">
          <div className="case-stat-icon red">
            <AlertCircle size={19} />
          </div>

          <div>
            <span>Critical</span>
            <strong>{criticalCases}</strong>
          </div>
        </div>

        <div className="case-stat-card">
          <div className="case-stat-icon slate">
            <Shield size={19} />
          </div>

          <div>
            <span>High Priority</span>
            <strong>{highPriorityCases}</strong>
          </div>
        </div>

      </section>

      {/* =====================================================
          SEARCH / FILTER BAR
      ====================================================== */}

      <section className="case-filter-panel">

        <div className="case-search-box">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search case number, title, officer or offence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="case-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="case-filter-select"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value)
          }
          className="case-filter-select"
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

      </section>

      {/* =====================================================
          CASE LIST HEADER
      ====================================================== */}

      <div className="case-list-heading">

        <div>
          <h2>Investigation Files</h2>

          <p>
            {filteredCases.length === 0
              ? 'No cases found'
              : `Showing ${
                  Math.min(
                    (currentPage - 1) * CASES_PER_PAGE + 1,
                    filteredCases.length
                  )
                }–${
                  Math.min(
                    currentPage * CASES_PER_PAGE,
                    filteredCases.length
                  )
                } of ${filteredCases.length} cases`}
          </p>
        </div>

        <div className="case-registry-label">
          <FileText size={15} />
          Registry View
        </div>

      </div>

      {/* =====================================================
          CASE GRID
      ====================================================== */}

      {loading ? (
        <div className="case-loading">
          <div className="case-spinner" />

          <span>
            Fetching case records...
          </span>
        </div>
      ) : visibleCases.length === 0 ? (
        <div className="case-empty-wrapper">

          <EmptyState
            icon={FolderPlus}
            title={
              search ||
              statusFilter !== 'ALL' ||
              priorityFilter !== 'ALL'
                ? 'No matching cases'
                : 'No active cases in registry'
            }
            description={
              search ||
              statusFilter !== 'ALL' ||
              priorityFilter !== 'ALL'
                ? 'No investigation files matched your current filters. Try clearing the filters or searching for another term.'
                : 'Start by registering your first investigation case file.'
            }
            actionLabel={
              canCreateCase ? 'New Case File' : null
            }
            onAction={
              canCreateCase
                ? () => setShowModal(true)
                : null
            }
            secondaryLabel={
              search ||
              statusFilter !== 'ALL' ||
              priorityFilter !== 'ALL'
                ? 'Reset Filters'
                : null
            }
            onSecondaryAction={resetFilters}
          />

        </div>
      ) : (
        <>
          <section className="case-grid">

            {visibleCases.map((c) => (
              <article
                className="case-card"
                key={c.id}
              >

                {/* Card Header */}

                <div className="case-card-header">

                  <div className="case-card-number">

                    <div className="case-card-icon">
                      <Briefcase size={17} />
                    </div>

                    <span>
                      {c.case_number || 'UNASSIGNED'}
                    </span>

                  </div>

                  <div className="case-card-badges">
                    <span className={getPriorityClass(c.priority)}>
                      {c.priority || 'NORMAL'}
                    </span>

                    <span className={getStatusClass(c.status)}>
                      <i />
                      {c.status || 'UNKNOWN'}
                    </span>
                  </div>

                </div>

                {/* Main Content */}

                <div className="case-card-body">

                  <h3>
                    {c.title || 'Untitled Investigation'}
                  </h3>

                  <p className="case-description">
                    {c.description ||
                      'No investigation summary has been provided for this case.'}
                  </p>

                  {/* Meta Grid */}

                  <div className="case-meta-grid">

                    <div className="case-meta-item">

                      <div className="case-meta-label">
                        <User size={13} />
                        Investigating Officer
                      </div>

                      <div className="case-meta-value">
                        {c.assigned_io_name ||
                          `Officer #${c.assigned_io_id || '—'}`}
                      </div>

                    </div>

                    <div className="case-meta-item">

                      <div className="case-meta-label">
                        <MapPin size={13} />
                        Police Station
                      </div>

                      <div className="case-meta-value">
                        {c.police_station ||
                          'Police station not specified'}
                      </div>

                    </div>

                    <div className="case-meta-item">

                      <div className="case-meta-label">
                        <Shield size={13} />
                        Offences / Sections
                      </div>

                      <div className="case-meta-value">
                        {c.acts_sections ||
                          'Sections not specified'}
                      </div>

                    </div>

                    <div className="case-meta-item">

                      <div className="case-meta-label">
                        <CalendarDays size={13} />
                        Registered
                      </div>

                      <div className="case-meta-value">
                        {formatDate(c.created_at)}
                      </div>

                    </div>

                  </div>

                </div>

                {/* Card Footer */}

                <div className="case-card-footer">

                  <div className="case-security-status">
                    <span className="security-dot" />
                    Digital docket secured
                  </div>

                  <Link
                    to={`/cases/${c.id}`}
                    className="case-manage-button"
                  >
                    Manage Case
                    <ArrowRight size={15} />
                  </Link>

                </div>

              </article>
            ))}

          </section>

          {/* =================================================
              PAGINATION
          ================================================== */}

          {totalPages > 1 && (
            <div className="case-pagination">

              <button
                type="button"
                className="case-pagination-button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="case-page-numbers">

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={
                      page === currentPage
                        ? 'case-page-number active'
                        : 'case-page-number'
                    }
                    onClick={() =>
                      setCurrentPage(page)
                    }
                  >
                    {page}
                  </button>
                ))}

              </div>

              <button
                type="button"
                className="case-pagination-button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
              >
                Next
                <ChevronRight size={16} />
              </button>

            </div>
          )}

        </>
      )}

      {/* =====================================================
          NEW CASE MODAL
      ====================================================== */}

      {showModal && canCreateCase && (
        <div
          className="case-modal-backdrop"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >

          <div
            className="case-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="case-modal-header">

              <div className="case-modal-title">

                <div className="case-modal-icon">
                  <Briefcase size={19} />
                </div>

                <div>
                  <h3>
                    Register Investigation Case
                  </h3>

                  <p>
                    Create a new digital case docket
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="case-modal-close"
                onClick={closeModal}
                disabled={creating}
              >
                <X size={18} />
              </button>

            </div>

            {/* Modal Form */}

            <form
              onSubmit={handleCreateCase}
              className="case-modal-form"
            >

              {error && (
                <div className="case-form-error">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="case-form-grid">

                <div className="case-form-field">
                  <label>
                    Case / FIR Number
                  </label>

                  <input
                    value={newCase.case_number}
                    onChange={(e) =>
                      setNewCase({
                        ...newCase,
                        case_number: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="case-form-field">
                  <label>
                    Priority Level
                  </label>

                  <select
                    value={newCase.priority}
                    onChange={(e) =>
                      setNewCase({
                        ...newCase,
                        priority: e.target.value,
                      })
                    }
                  >
                    <option value="CRITICAL">
                      Critical
                    </option>
                    <option value="HIGH">
                      High
                    </option>
                    <option value="MEDIUM">
                      Medium
                    </option>
                    <option value="LOW">
                      Low
                    </option>
                  </select>
                </div>

              </div>

              <div className="case-form-field">
                <label>
                  Case Title
                </label>

                <input
                  placeholder="e.g. State vs. Network Syndicate"
                  value={newCase.title}
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="case-form-field">
                <label>
                  Acts & Penal Sections Invoked
                </label>

                <input
                  placeholder="e.g. BNS Sec 318(4) / IT Act Sec 66C"
                  value={newCase.acts_sections}
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      acts_sections: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="case-form-grid">

                <div className="case-form-field">
                  <label>
                    Assigned Investigating Officer
                  </label>

                  <select
                    value={newCase.assigned_io_id}
                    onChange={(e) =>
                      setNewCase({
                        ...newCase,
                        assigned_io_id: e.target.value,
                      })
                    }
                    required
                  >
                    {users.map((u) => (
                      <option
                        key={u.id}
                        value={u.id}
                      >
                        {u.name} (
                        {u.badge_number || 'IO'}
                        )
                      </option>
                    ))}
                  </select>
                </div>

                <div className="case-form-field">
                  <label>
                    Originating Police Station
                  </label>

                  <input
                    value={newCase.police_station}
                    onChange={(e) =>
                      setNewCase({
                        ...newCase,
                        police_station: e.target.value,
                      })
                    }
                    required
                  />
                </div>

              </div>

              <div className="case-form-field">
                <label>
                  Brief Facts / First Information Summary
                </label>

                <textarea
                  rows={4}
                  placeholder="Summary of allegations, preliminary findings and suspect entities..."
                  value={newCase.description}
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Modal Actions */}

              <div className="case-modal-actions">

                <button
                  type="button"
                  className="case-cancel-button"
                  onClick={closeModal}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="case-submit-button"
                  disabled={creating}
                >
                  {creating ? (
                    <span className="case-button-spinner" />
                  ) : (
                    <Briefcase size={15} />
                  )}

                  {creating
                    ? 'Creating Case...'
                    : 'Initialize Case Docket'}
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