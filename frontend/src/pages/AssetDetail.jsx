import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getAsset,
  transferAsset,
  getAssetEvents,
  getUsers,
  updateAsset,
} from '../services/api';

import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Edit2,
  X,
  Package,
  ShieldCheck,
  UserRound,
  Clock3,
  History,
  ChevronRight,
  Send,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import '../styles/AssetDetail.css';

const statusConfig = {
  IN_TRANSIT: {
    label: 'In Transit',
    className: 'asset-status-transit',
  },
  IN_LAB: {
    label: 'In Laboratory',
    className: 'asset-status-lab',
  },
  IN_COURT: {
    label: 'In Court',
    className: 'asset-status-court',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'asset-status-archived',
  },
  DISPOSED: {
    label: 'Disposed',
    className: 'asset-status-disposed',
  },
};

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatus = (status) => {
  return (
    statusConfig[status] || {
      label: status || 'Unknown',
      className: 'asset-status-default',
    }
  );
};

const AssetDetail = () => {
  const { id } = useParams();

  const [asset, setAsset] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const [showTransfer, setShowTransfer] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [error, setError] = useState('');

  const [transferData, setTransferData] = useState({
    to_user_id: '',
    new_status: 'IN_TRANSIT',
    location: '',
    remarks: '',
  });

  const [editAsset, setEditAsset] = useState({
    name: '',
    description: '',
    asset_type: '',
    location: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [assetData, eventData, userData] = await Promise.all([
        getAsset(id),
        getAssetEvents(id),
        getUsers(),
      ]);

      setAsset(assetData);
      setEvents(eventData || []);
      setUsers(userData || []);

      setEditAsset({
        name: assetData?.name || '',
        description: assetData?.description || '',
        asset_type: assetData?.asset_type || '',
        location: assetData?.location || '',
      });
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Unable to load asset details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateAsset = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {
      await updateAsset(id, editAsset);

      setShowEditModal(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Unable to update asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!transferData.to_user_id) {
      setError('Select a receiving custodian.');
      return;
    }

    setTransferring(true);
    setError('');

    try {
      await transferAsset(id, {
        ...transferData,
        to_user_id: parseInt(transferData.to_user_id, 10),
      });

      setShowTransfer(false);

      setTransferData({
        to_user_id: '',
        new_status: 'IN_TRANSIT',
        location: '',
        remarks: '',
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Unable to transfer custody.');
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <div className="asset-detail-loading">
        <div className="asset-loading-spinner" />
        <span>Loading asset record...</span>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="asset-detail-page">
        <div className="asset-not-found">
          <AlertCircle size={28} />
          <h2>Asset not found</h2>
          <p>
            The requested evidence asset could not be located or may no longer
            be available.
          </p>

          <Link to="/assets" className="asset-back-button">
            <ArrowLeft size={15} />
            Back to assets
          </Link>
        </div>
      </div>
    );
  }

  const currentCustodian = users.find(
    (u) => u.id === asset.current_custodian_id
  );

  const currentStatus = getStatus(asset.status);

  return (
    <div className="asset-detail-page">

      {error && (
        <div className="asset-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>

          <button onClick={() => setError('')}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* HEADER */}
      <header className="asset-hero">

        <div className="asset-breadcrumb">
          <Link to={`/cases/${asset.case_id}`}>
            <ArrowLeft size={14} />
            Case file
          </Link>

          <ChevronRight size={13} />

          <span>Evidence asset</span>
        </div>

        <div className="asset-hero-main">

          <div className="asset-icon-large">
            <Package size={25} />
          </div>

          <div className="asset-heading">

            <div className="asset-heading-top">
              <span className="asset-number">
                {asset.asset_number}
              </span>

              <span className={`asset-status ${currentStatus.className}`}>
                <span className="asset-status-dot" />
                {currentStatus.label}
              </span>
            </div>

            <h1>{asset.name}</h1>

            <p>
              {asset.description ||
                'No description has been provided for this evidence asset.'}
            </p>

          </div>

          <div className="asset-actions">

            <button
              className="asset-btn asset-btn-secondary"
              onClick={() => setShowEditModal(true)}
            >
              <Edit2 size={15} />
              Edit asset
            </button>

            <button
              className="asset-btn asset-btn-primary"
              onClick={() => setShowTransfer(!showTransfer)}
            >
              <Send size={15} />
              Transfer custody
            </button>

          </div>

        </div>

        <div className="asset-meta-strip">

          <div className="asset-meta-item">
            <MapPin size={15} />

            <div>
              <span>Current location</span>
              <strong>
                {asset.location || 'Location not recorded'}
              </strong>
            </div>
          </div>

          <div className="asset-meta-divider" />

          <div className="asset-meta-item">
            <FileText size={15} />

            <div>
              <span>Asset type</span>
              <strong>{asset.asset_type || 'Not specified'}</strong>
            </div>
          </div>

          <div className="asset-meta-divider" />

          <div className="asset-meta-item">
            <Activity size={15} />

            <div>
              <span>Custody events</span>
              <strong>{events.length}</strong>
            </div>
          </div>

        </div>

      </header>

      {/* TRANSFER PANEL */}
      {showTransfer && (
        <section className="transfer-panel">

          <div className="transfer-header">

            <div className="transfer-title">
              <div className="transfer-icon">
                <Send size={17} />
              </div>

              <div>
                <h2>Transfer custody</h2>
                <p>
                  Record the next authorized movement of this evidence asset.
                </p>
              </div>
            </div>

            <button
              className="asset-icon-button"
              onClick={() => setShowTransfer(false)}
            >
              <X size={17} />
            </button>

          </div>

          <form onSubmit={handleTransfer}>

            <div className="transfer-grid">

              <div className="asset-field">
                <label>Receiving custodian</label>

                <select
                  required
                  value={transferData.to_user_id}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      to_user_id: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select receiving officer
                  </option>

                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.department || u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="asset-field">
                <label>New custody status</label>

                <select
                  required
                  value={transferData.new_status}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      new_status: e.target.value,
                    })
                  }
                >
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="IN_LAB">In Laboratory</option>
                  <option value="IN_COURT">In Court</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="DISPOSED">Disposed</option>
                </select>
              </div>

              <div className="asset-field">
                <label>Destination</label>

                <input
                  value={transferData.location}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g. CFSL Laboratory 02"
                />
              </div>

              <div className="asset-field">
                <label>Transfer remarks</label>

                <input
                  value={transferData.remarks}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      remarks: e.target.value,
                    })
                  }
                  placeholder="Reason or authorization reference"
                />
              </div>

            </div>

            <div className="transfer-footer">

              <div className="transfer-notice">
                <ShieldCheck size={15} />
                <span>
                  This action will create a permanent custody event.
                </span>
              </div>

              <div className="transfer-actions">

                <button
                  type="button"
                  className="asset-btn asset-btn-secondary"
                  onClick={() => setShowTransfer(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="asset-btn asset-btn-primary"
                  disabled={transferring}
                >
                  {transferring ? (
                    <>
                      <span className="asset-mini-spinner" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Authorize transfer
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

              </div>

            </div>

          </form>

        </section>
      )}

      {/* MAIN CONTENT */}
      <main className="asset-content">

        {/* LEFT COLUMN */}
        <aside className="asset-sidebar">

          {/* CUSTODIAN */}
          <section className="asset-card">

            <div className="asset-card-header">
              <div>
                <span className="asset-card-eyebrow">
                  CUSTODY
                </span>

                <h2>Current custodian</h2>
              </div>

              <ShieldCheck
                size={18}
                className="asset-card-icon"
              />
            </div>

            {currentCustodian ? (
              <div className="custodian">

                <div className="custodian-avatar">
                  {currentCustodian.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div className="custodian-info">

                  <strong>{currentCustodian.name}</strong>

                  <span>
                    {currentCustodian.role || 'Authorized user'}
                  </span>

                  <small>
                    {currentCustodian.department ||
                      'Department not recorded'}
                  </small>

                </div>

              </div>
            ) : (
              <div className="custodian-empty">
                <UserRound size={18} />

                <span>
                  Custodian ID:{' '}
                  {asset.current_custodian_id || 'Not assigned'}
                </span>
              </div>
            )}

          </section>

          {/* RECORD */}
          <section className="asset-card">

            <div className="asset-card-header">
              <div>
                <span className="asset-card-eyebrow">
                  RECORD
                </span>

                <h2>Asset information</h2>
              </div>

              <Clock3
                size={18}
                className="asset-card-icon"
              />
            </div>

            <div className="asset-record-list">

              <div className="asset-record-row">
                <span>Asset ID</span>
                <strong>#{asset.id}</strong>
              </div>

              <div className="asset-record-row">
                <span>Created</span>
                <strong>{formatDate(asset.created_at)}</strong>
              </div>

              <div className="asset-record-row">
                <span>Last updated</span>
                <strong>{formatDate(asset.updated_at)}</strong>
              </div>

              <div className="asset-record-row">
                <span>Case ID</span>
                <strong>{asset.case_id || '—'}</strong>
              </div>

            </div>

          </section>

        </aside>

        {/* TIMELINE */}
        <section className="asset-card custody-card">

          <div className="custody-header">

            <div>
              <span className="asset-card-eyebrow">
                CHAIN OF CUSTODY
              </span>

              <h2>Evidence movement history</h2>

              <p>
                Chronological record of every recorded custody transition.
              </p>
            </div>

            <div className="custody-count">
              <History size={15} />
              {events.length} events
            </div>

          </div>

          {events.length === 0 ? (
            <div className="custody-empty">

              <div className="custody-empty-icon">
                <History size={22} />
              </div>

              <h3>No custody events</h3>

              <p>
                No movement or custody events have been recorded for
                this asset yet.
              </p>

            </div>
          ) : (
            <div className="custody-timeline">

              {events.map((evt, index) => {

                const toUser = users.find(
                  (u) => u.id === evt.to_user_id
                );

                const performedBy = users.find(
                  (u) => u.id === evt.performed_by
                );

                const isLatest = index === events.length - 1;

                return (
                  <div
                    key={evt.id}
                    className={`custody-event ${
                      isLatest ? 'custody-event-latest' : ''
                    }`}
                  >

                    <div className="custody-marker">

                      <div className="custody-dot">
                        <CheckCircle2 size={12} />
                      </div>

                      {index < events.length - 1 && (
                        <div className="custody-line" />
                      )}

                    </div>

                    <div className="custody-event-content">

                      <div className="custody-event-top">

                        <div>
                          <span className="custody-event-action">
                            {evt.action || 'CUSTODY EVENT'}
                          </span>

                          <h3>
                            {evt.action === 'LOG'
                              ? 'Asset registered'
                              : `Transferred to ${
                                  toUser?.name ||
                                  `User ${evt.to_user_id || 'Unknown'}`
                                }`}
                          </h3>
                        </div>

                        <time>
                          {formatDate(evt.timestamp)}
                        </time>

                      </div>

                      <div className="custody-event-status">
                        <span>
                          Status
                        </span>

                        <strong>
                          {getStatus(evt.to_status).label}
                        </strong>
                      </div>

                      {(evt.location || evt.remarks) && (
                        <div className="custody-event-details">

                          {evt.location && (
                            <div>
                              <MapPin size={13} />
                              <span>{evt.location}</span>
                            </div>
                          )}

                          {evt.remarks && (
                            <div>
                              <FileText size={13} />
                              <span>{evt.remarks}</span>
                            </div>
                          )}

                        </div>
                      )}

                      <div className="custody-event-footer">

                        <UserRound size={13} />

                        <span>
                          Recorded by{' '}
                          <strong>
                            {performedBy?.name ||
                              `User ${evt.performed_by || 'Unknown'}`}
                          </strong>
                        </span>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div
          className="asset-modal-backdrop"
          onClick={() => setShowEditModal(false)}
          role="dialog"
          aria-modal="true"
        >

          <div
            className="asset-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="asset-modal-header">

              <div>
                <span className="asset-card-eyebrow">
                  ASSET MANAGEMENT
                </span>

                <h2>Edit asset</h2>

                <p>
                  Update the descriptive information associated with
                  this evidence record.
                </p>
              </div>

              <button
                className="asset-icon-button"
                onClick={() => setShowEditModal(false)}
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={handleUpdateAsset}
              className="asset-modal-form"
            >

              <div className="asset-field">

                <label>Asset name</label>

                <input
                  required
                  value={editAsset.name}
                  onChange={(e) =>
                    setEditAsset({
                      ...editAsset,
                      name: e.target.value,
                    })
                  }
                />

              </div>

              <div className="asset-form-grid">

                <div className="asset-field">

                  <label>Asset type</label>

                  <input
                    required
                    value={editAsset.asset_type}
                    onChange={(e) =>
                      setEditAsset({
                        ...editAsset,
                        asset_type: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="asset-field">

                  <label>Current location</label>

                  <input
                    value={editAsset.location}
                    onChange={(e) =>
                      setEditAsset({
                        ...editAsset,
                        location: e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <div className="asset-field">

                <label>Description</label>

                <textarea
                  rows={4}
                  value={editAsset.description}
                  onChange={(e) =>
                    setEditAsset({
                      ...editAsset,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the evidence asset..."
                />

              </div>

              <div className="asset-modal-footer">

                <button
                  type="button"
                  className="asset-btn asset-btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="asset-btn asset-btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="asset-mini-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save changes
                      <CheckCircle2 size={15} />
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

export default AssetDetail;