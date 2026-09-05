import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/api';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  X,
  Check,
  Shield,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserCog,
  RefreshCw,
} from 'lucide-react';

import "../styles/users.css";

const roleConfig = {
  ADMIN: {
    label: 'Administrator',
    className: 'user-role admin',
  },
  IO: {
    label: 'Investigating Officer',
    className: 'user-role io',
  },
  FORENSIC_EXPERT: {
    label: 'Forensic Expert',
    className: 'user-role forensic',
  },
  JUDGE: {
    label: 'Judge',
    className: 'user-role judge',
  },
};

const emptyUser = {
  name: '',
  email: '',
  password: '',
  role: 'IO',
  badge_number: '',
  department: '',
};

const USERS_PER_PAGE = 6;

const UserManagement = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyUser);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /* --------------------------------
     FETCH USERS
  -------------------------------- */

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* --------------------------------
     FILTER USERS
  -------------------------------- */

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((u) => {
      const matchesSearch =
        !query ||
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.role?.toLowerCase().includes(query) ||
        u.badge_number?.toLowerCase().includes(query) ||
        u.department?.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === 'ALL' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  /* --------------------------------
     PAGINATION
  -------------------------------- */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedUsers = filteredUsers.slice(
    (safePage - 1) * USERS_PER_PAGE,
    safePage * USERS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  /* --------------------------------
     STATS
  -------------------------------- */

  const stats = useMemo(() => {
    return {
      total: users.length,
      officers: users.filter((u) => u.role === 'IO').length,
      forensic: users.filter(
        (u) => u.role === 'FORENSIC_EXPERT'
      ).length,
      judges: users.filter((u) => u.role === 'JUDGE').length,
      admins: users.filter((u) => u.role === 'ADMIN').length,
    };
  }, [users]);

  /* --------------------------------
     HELPERS
  -------------------------------- */

  const formatDate = (dateVal) => {
    if (!dateVal) return '—';

    const date = new Date(dateVal);

    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ').filter(Boolean);

    if (!parts.length) return '?';

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  /* --------------------------------
     MODAL
  -------------------------------- */

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData({ ...emptyUser });
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setModalMode('edit');
    setEditingId(u.id);

    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'IO',
      badge_number: u.badge_number || '',
      department: u.department || '',
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setFormData({ ...emptyUser });
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* --------------------------------
     CREATE USER
  -------------------------------- */

  const handleCreate = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        badge_number: formData.badge_number || null,
        department: formData.department || null,
      };

      const res = await fetch(
        'http://localhost:8000/api/v1/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem(
              'nyaya_token'
            )}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      closeModal();
      await fetchUsers();
    } catch (err) {
      alert('Create user: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------
     UPDATE USER
  -------------------------------- */

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingId) return;

    setSaving(true);

    try {
      const payload = {
        id: editingId,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        badge_number: formData.badge_number || null,
        department: formData.department || null,
      };

      const res = await fetch(
        'http://localhost:8000/api/v1/auth',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem(
              'nyaya_token'
            )}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      closeModal();
      await fetchUsers();
    } catch (err) {
      alert('Update user: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------
     DELETE USER
  -------------------------------- */

  const handleDelete = async (id) => {
    if (
      !confirm(
        'Delete this user? This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/auth/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'nyaya_token'
            )}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      await fetchUsers();
    } catch (err) {
      alert('Delete user: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  /* --------------------------------
     RENDER
  -------------------------------- */

  return (
    <div className="page users-page">

      {/* HEADER */}

      <div className="page-header users-header">
        <div className="page-heading">
          <span className="page-eyebrow">
            Administration
          </span>

          <h1 className="page-title">
            User Management
          </h1>

          <p className="page-description">
            Manage system accounts, roles and access permissions.
          </p>
        </div>

        <div className="users-header-actions">

          <button
            className="btn btn-secondary users-refresh"
            onClick={fetchUsers}
            disabled={loading}
            title="Refresh users"
          >
            <RefreshCw
              size={15}
              className={loading ? 'users-spin' : ''}
            />
          </button>

          <button
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            <UserPlus size={16} strokeWidth={1.8} />
            Add User
          </button>

        </div>
      </div>

      {/* STATS */}

      <div className="user-stats">

        <div className="user-stat-card">
          <div className="user-stat-icon">
            <Users size={18} />
          </div>

          <div>
            <span className="user-stat-label">
              Total Users
            </span>

            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon">
            <UserCheck size={18} />
          </div>

          <div>
            <span className="user-stat-label">
              Officers
            </span>

            <strong>{stats.officers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon">
            <Shield size={18} />
          </div>

          <div>
            <span className="user-stat-label">
              Forensic
            </span>

            <strong>{stats.forensic}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon">
            <UserCog size={18} />
          </div>

          <div>
            <span className="user-stat-label">
              Judges
            </span>

            <strong>{stats.judges}</strong>
          </div>
        </div>

      </div>

      {/* USERS PANEL */}

      <div className="panel users-panel">

        <div className="users-panel-header">

          <div>
            <h3 className="panel-title">
              System Users
            </h3>

            <p className="users-panel-subtitle">
              {filteredUsers.length} account
              {filteredUsers.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="users-controls">

            <div className="user-search">
              <Search size={15} />

              <input
                type="search"
                placeholder="Search users..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  className="search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              className="user-role-filter"
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value)
              }
            >
              <option value="ALL">All roles</option>
              <option value="ADMIN">
                Administrators
              </option>
              <option value="IO">
                Investigating Officers
              </option>
              <option value="FORENSIC_EXPERT">
                Forensic Experts
              </option>
              <option value="JUDGE">
                Judges
              </option>
            </select>

          </div>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="users-loading">
            <div className="spinner" />
            <span>Loading users...</span>
          </div>

        ) : paginatedUsers.length === 0 ? (

          /* EMPTY */

          <div className="users-empty">

            <div className="users-empty-icon">
              <Users size={24} />
            </div>

            <h3>No users found</h3>

            <p>
              {search || roleFilter !== 'ALL'
                ? 'Try adjusting your search or filters.'
                : 'No users have been added to the system yet.'}
            </p>

            {(search || roleFilter !== 'ALL') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('ALL');
                }}
              >
                Clear filters
              </button>
            )}

          </div>

        ) : (

          <>
            {/* TABLE */}

            <div className="users-table-wrapper">

              <table className="users-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Badge</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th className="users-actions-heading">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {paginatedUsers.map((u) => {

                    const role =
                      roleConfig[u.role] || roleConfig.IO;

                    const isCurrentUser =
                      user?.id === u.id;

                    return (
                      <tr key={u.id}>

                        {/* USER */}

                        <td>
                          <div className="user-cell">

                            <div className="user-avatar">
                              {getInitials(u.name)}
                            </div>

                            <div className="user-identity">

                              <div className="user-name">
                                {u.name}
                              </div>

                              {isCurrentUser && (
                                <span className="current-user">
                                  Current session
                                </span>
                              )}

                            </div>

                          </div>
                        </td>

                        {/* ROLE */}

                        <td>
                          <span
                            className={role.className}
                          >
                            <span className="role-dot" />
                            {role.label}
                          </span>
                        </td>

                        {/* BADGE */}

                        <td>
                          <span className="user-secondary">
                            {u.badge_number || '—'}
                          </span>
                        </td>

                        {/* DEPARTMENT */}

                        <td>
                          <span className="user-secondary">
                            {u.department || '—'}
                          </span>
                        </td>

                        {/* EMAIL */}

                        <td>
                          <span className="user-email">
                            {u.email}
                          </span>
                        </td>

                        {/* JOINED */}

                        <td>
                          <span className="user-secondary">
                            {formatDate(u.created_at)}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="user-actions">

                            <button
                              className="user-action-btn"
                              onClick={() =>
                                openEditModal(u)
                              }
                              title="Edit user"
                            >
                              <Edit2 size={14} />
                            </button>

                            {u.id !== user?.id && (
                              <button
                                className="user-action-btn danger"
                                onClick={() =>
                                  handleDelete(u.id)
                                }
                                disabled={
                                  deletingId === u.id
                                }
                                title="Delete user"
                              >
                                {deletingId === u.id ? (
                                  <span className="mini-spinner" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            )}

                          </div>
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}

            <div className="users-pagination">

              <span className="pagination-info">
                Showing{' '}
                <strong>
                  {(safePage - 1) * USERS_PER_PAGE + 1}
                </strong>{' '}
                –{' '}
                <strong>
                  {Math.min(
                    safePage * USERS_PER_PAGE,
                    filteredUsers.length
                  )}
                </strong>{' '}
                of{' '}
                <strong>
                  {filteredUsers.length}
                </strong>
              </span>

              <div className="pagination-controls">

                <button
                  className="pagination-btn"
                  disabled={safePage === 1}
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.max(1, p - 1)
                    )
                  }
                >
                  <ChevronLeft size={15} />
                </button>

                <span className="pagination-page">
                  {safePage} / {totalPages}
                </span>

                <button
                  className="pagination-btn"
                  disabled={
                    safePage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(
                        totalPages,
                        p + 1
                      )
                    )
                  }
                >
                  <ChevronRight size={15} />
                </button>

              </div>

            </div>
          </>
        )}

      </div>

      {/* CREATE / EDIT MODAL */}

      {showModal && (
        <div
          className="user-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="user-modal">

            <div className="user-modal-header">

              <div>
                <span className="modal-eyebrow">
                  {modalMode === 'create'
                    ? 'New account'
                    : 'Account settings'}
                </span>

                <h2>
                  {modalMode === 'create'
                    ? 'Create User'
                    : 'Edit User'}
                </h2>

                <p>
                  {modalMode === 'create'
                    ? 'Add a new authorized account to Nyaya Setu.'
                    : 'Update this user’s account and access role.'}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                <X size={18} />
              </button>

            </div>

            <form
              className="user-form"
              onSubmit={
                modalMode === 'create'
                  ? handleCreate
                  : handleUpdate
              }
            >

              <div className="user-form-grid">

                <div className="input-group">
                  <label htmlFor="user-name">
                    Full Name
                  </label>

                  <input
                    id="user-name"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) =>
                      updateField(
                        'name',
                        e.target.value
                      )
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="user-email">
                    Email Address
                  </label>

                  <input
                    id="user-email"
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) =>
                      updateField(
                        'email',
                        e.target.value
                      )
                    }
                    placeholder="name@department.gov.in"
                    required
                  />
                </div>

                {modalMode === 'create' && (
                  <div className="input-group">
                    <label htmlFor="user-password">
                      Password
                    </label>

                    <input
                      id="user-password"
                      type="password"
                      className="input-field"
                      value={formData.password}
                      onChange={(e) =>
                        updateField(
                          'password',
                          e.target.value
                        )
                      }
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      required
                    />
                  </div>
                )}

                <div className="input-group">
                  <label htmlFor="user-role">
                    System Role
                  </label>

                  <select
                    id="user-role"
                    className="input-field"
                    value={formData.role}
                    onChange={(e) =>
                      updateField(
                        'role',
                        e.target.value
                      )
                    }
                  >
                    <option value="IO">
                      Investigating Officer
                    </option>

                    <option value="FORENSIC_EXPERT">
                      Forensic Expert
                    </option>

                    <option value="JUDGE">
                      Judge
                    </option>

                    <option value="ADMIN">
                      Administrator
                    </option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="user-badge">
                    Badge Number
                  </label>

                  <input
                    id="user-badge"
                    className="input-field"
                    value={formData.badge_number}
                    onChange={(e) =>
                      updateField(
                        'badge_number',
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="user-department">
                    Department
                  </label>

                  <input
                    id="user-department"
                    className="input-field"
                    value={formData.department}
                    onChange={(e) =>
                      updateField(
                        'department',
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </div>

              </div>

              <div className="user-form-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner spinner-small" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      {modalMode === 'create'
                        ? 'Create User'
                        : 'Save Changes'}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default UserManagement;

