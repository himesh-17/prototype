import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAsset, transferAsset, getAssetEvents, getUsers, updateAsset } from '../services/api';
import { ArrowRight, ArrowLeft, MapPin, Edit2, X } from 'lucide-react';

const AssetDetail = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({
    to_user_id: '',
    new_status: 'IN_TRANSIT',
    location: '',
    remarks: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAsset, setEditAsset] = useState({ name: '', description: '', asset_type: '', location: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [a, e, u] = await Promise.all([getAsset(id), getAssetEvents(id), getUsers()]);
      setAsset(a);
      setEvents(e);
      setUsers(u);
      setEditAsset({
        name: a.name,
        description: a.description || '',
        asset_type: a.asset_type,
        location: a.location || '',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateAsset = async (e) => {
    e.preventDefault();
    try {
      await updateAsset(id, editAsset);
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await transferAsset(id, {
        ...transferData,
        to_user_id: parseInt(transferData.to_user_id),
      });
      setShowTransfer(false);
      setTransferData({ to_user_id: '', new_status: 'IN_TRANSIT', location: '', remarks: '' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="page flex flex-col items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="page">
        <p className="text-[var(--text-secondary)]">Asset not found.</p>
      </div>
    );
  }

  const currentCustodian = users.find((u) => u.id === asset.current_custodian_id);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-heading">
          <Link to={`/cases/${asset.case_id}`} className="page-eyebrow inline-flex items-center gap-1.5 hover:text-[var(--text-secondary)]">
            <ArrowLeft size={14} />
            Case file
          </Link>
          <h1 className="page-title">{asset.name}</h1>
          <p className="page-description">{asset.description || 'No description available.'}</p>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="badge badge-info">{asset.asset_number}</span>
            <span className="badge">{asset.asset_type}</span>
            <span className="badge">{asset.status}</span>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>
            <Edit2 size={15} />
            Edit
          </button>
          <button className="btn btn-primary" onClick={() => setShowTransfer(!showTransfer)}>
            Transfer custody
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <MapPin size={15} />
        {asset.location || 'Unknown location'}
      </div>

      {showTransfer && (
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Transfer custody</h3>
          </div>
          <form onSubmit={handleTransfer} className="panel-body space-y-4">
            <div className="field-grid">
              <div>
                <label>Transfer to</label>
                <select
                  required
                  value={transferData.to_user_id}
                  onChange={(e) => setTransferData({ ...transferData, to_user_id: e.target.value })}
                >
                  <option value="" disabled>
                    Select user
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.department || u.role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>New status</label>
                <select
                  required
                  value={transferData.new_status}
                  onChange={(e) => setTransferData({ ...transferData, new_status: e.target.value })}
                >
                  <option value="IN_TRANSIT">In transit</option>
                  <option value="IN_LAB">In lab</option>
                  <option value="IN_COURT">In court</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="DISPOSED">Disposed</option>
                </select>
              </div>
              <div>
                <label>Location</label>
                <input
                  value={transferData.location}
                  onChange={(e) => setTransferData({ ...transferData, location: e.target.value })}
                  placeholder="e.g. Forensics Lab 2"
                />
              </div>
              <div>
                <label>Remarks</label>
                <input
                  value={transferData.remarks}
                  onChange={(e) => setTransferData({ ...transferData, remarks: e.target.value })}
                  placeholder="Reason for transfer"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowTransfer(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Authorize transfer <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <div className="panel">
            <div className="panel-head">
              <h3 className="panel-title">Current custodian</h3>
            </div>
            <div className="panel-body">
              {currentCustodian ? (
                <div className="flex items-center gap-3">
                  <div className="avatar" style={{ width: 40, height: 40 }}>
                    {currentCustodian.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">{currentCustodian.name}</div>
                    <div className="text-sm text-[var(--text-secondary)] mt-0.5">
                      {currentCustodian.role} · {currentCustodian.department || 'No department'}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">Custodian ID: {asset.current_custodian_id}</p>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3 className="panel-title">Record</h3>
            </div>
            <div className="panel-body space-y-4">
              <div>
                <span className="page-eyebrow">Logged</span>
                <p className="text-sm text-[var(--text-primary)] mt-1.5">{new Date(asset.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="page-eyebrow">Updated</span>
                <p className="text-sm text-[var(--text-primary)] mt-1.5">{new Date(asset.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 panel">
          <div className="panel-head">
            <h3 className="panel-title">Chain of custody</h3>
          </div>
          <div className="panel-body">
            {events.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No timeline events found.</p>
            ) : (
              <div className="timeline">
                {events.map((evt) => {
                  const toUser = users.find((u) => u.id === evt.to_user_id);
                  const performedBy = users.find((u) => u.id === evt.performed_by);
                  return (
                    <div key={evt.id} className="timeline-item">
                      <div className="timeline-meta">{new Date(evt.timestamp).toLocaleString()}</div>
                      <h4 className="timeline-title">
                        {evt.action} · {evt.to_status}
                      </h4>
                      <p className="timeline-detail">
                        {evt.action === 'LOG'
                          ? 'Asset logged into the system.'
                          : `Transferred to ${toUser ? toUser.name : `User ${evt.to_user_id}`}.`}
                      </p>
                      {(evt.location || evt.remarks) && (
                        <p className="timeline-detail">
                          {evt.location && `Location: ${evt.location}`}
                          {evt.location && evt.remarks && ' · '}
                          {evt.remarks && evt.remarks}
                        </p>
                      )}
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        Recorded by {performedBy ? performedBy.name : `User ${evt.performed_by}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="ns-cases-backdrop" onClick={() => setShowEditModal(false)} role="dialog" aria-modal="true">
          <div className="ns-cases-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ns-cases-header">
              <h3 className="ns-cases-title">Edit asset</h3>
              <button onClick={() => setShowEditModal(false)} className="ns-cases-close" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateAsset} className="p-6 space-y-4">
              <div>
                <label>Name</label>
                <input
                  required
                  value={editAsset.name}
                  onChange={(e) => setEditAsset({ ...editAsset, name: e.target.value })}
                />
              </div>
              <div className="field-grid">
                <div>
                  <label>Type</label>
                  <input
                    required
                    value={editAsset.asset_type}
                    onChange={(e) => setEditAsset({ ...editAsset, asset_type: e.target.value })}
                  />
                </div>
                <div>
                  <label>Location</label>
                  <input
                    value={editAsset.location}
                    onChange={(e) => setEditAsset({ ...editAsset, location: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label>Description</label>
                <textarea
                  value={editAsset.description}
                  onChange={(e) => setEditAsset({ ...editAsset, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
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
