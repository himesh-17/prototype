import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAsset, transferAsset, getAssetEvents, getUsers, updateAsset } from '../services/api';
import { Box, ArrowRight, ArrowLeft, GitCommit, MapPin, Edit2, X } from 'lucide-react';

const AssetDetail = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transfer State
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({
    to_user_id: '',
    new_status: 'IN_TRANSIT',
    location: '',
    remarks: ''
  });

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAsset, setEditAsset] = useState({ name: '', description: '', asset_type: '', location: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [a, e, u] = await Promise.all([
        getAsset(id),
        getAssetEvents(id),
        getUsers()
      ]);
      setAsset(a);
      setEvents(e);
      setUsers(u);
      setEditAsset({
        name: a.name,
        description: a.description || '',
        asset_type: a.asset_type,
        location: a.location || ''
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
        to_user_id: parseInt(transferData.to_user_id)
      });
      setShowTransfer(false);
      setTransferData({ to_user_id: '', new_status: 'IN_TRANSIT', location: '', remarks: '' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full min-h-[300px]"><div className="spinner" /></div>;
  if (!asset) return <div className="card text-center my-8 text-muted">Asset not found</div>;

  const currentCustodian = users.find(u => u.id === asset.current_custodian_id);

  return (
    <div className="page space-y-6">
      <div>
        <Link to={`/cases/${asset.case_id}`} className="btn btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Back to Case
        </Link>
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#00d4aa]"></div>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <Box size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div className="badge badge-info">{asset.asset_number}</div>
            </div>
            <h1 className="mb-2 text-3xl">{asset.name}</h1>
            <p className="text-muted" style={{ maxWidth: '800px', marginBottom: '1.5rem' }}>{asset.description || 'No description available.'}</p>
            
            <div className="flex gap-4 items-center">
              <div><span className="text-muted text-sm uppercase tracking-wide">Type:</span> <span style={{ fontWeight: 500 }}>{asset.asset_type}</span></div>
              <div style={{ width: '1px', height: '1rem', background: 'var(--border-color)' }}></div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-muted" />
                <span>{asset.location || 'Unknown Location'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <span className={`badge ${asset.status === 'LOGGED' ? 'badge-info' : asset.status === 'ARCHIVED' || asset.status === 'DISPOSED' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '1rem', padding: '0.5rem 1.25rem' }}>
              {asset.status}
            </span>
            <div className="flex gap-2">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>
                <Edit2 size={16} /> Edit
              </button>
              <button className="btn btn-primary" onClick={() => setShowTransfer(!showTransfer)}>
                Transfer Custody
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTransfer && (
        <div className="card mb-8 animate-fade-in" style={{ border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(15, 23, 42, 0.8)' }}>
          <h3 className="mb-4">Transfer Chain of Custody</h3>
          <form onSubmit={handleTransfer}>
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Transfer To User</label>
                <select required className="input-field" value={transferData.to_user_id} onChange={e => setTransferData({...transferData, to_user_id: e.target.value})}>
                  <option value="" disabled>Select User...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} - {u.department || u.role}</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">New Status</label>
                <select required className="input-field" value={transferData.new_status} onChange={e => setTransferData({...transferData, new_status: e.target.value})}>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="IN_LAB">In Lab</option>
                  <option value="IN_COURT">In Court</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="DISPOSED">Disposed</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">New Location</label>
                <input className="input-field" value={transferData.location} onChange={e => setTransferData({...transferData, location: e.target.value})} placeholder="e.g. Forensics Lab 2" />
              </div>
              <div className="input-group" style={{ flex: 2 }}>
                <label className="input-label">Remarks / Reason</label>
                <input className="input-field" value={transferData.remarks} onChange={e => setTransferData({...transferData, remarks: e.target.value})} placeholder="Why is this being transferred?" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Authorize Transfer <ArrowRight size={18} /></button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left Column: Details */}
        <div style={{ flex: 1 }}>
          <div className="card mb-6">
            <h3 className="mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>Current Custody</h3>
            {currentCustodian ? (
              <div className="flex items-center gap-4">
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  {currentCustodian.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{currentCustodian.name}</div>
                  <div className="text-muted text-sm">{currentCustodian.role} • {currentCustodian.department || 'No Department'}</div>
                </div>
              </div>
            ) : (
              <p className="text-muted">Custodian ID: {asset.current_custodian_id}</p>
            )}
          </div>
          
          <div className="card">
            <h3 className="mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>Security Info</h3>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Date Logged</p>
                <p style={{ fontWeight: 500 }}>{new Date(asset.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Last Updated</p>
                <p style={{ fontWeight: 500 }}>{new Date(asset.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div style={{ flex: 2 }}>
          <div className="card h-full">
            <div className="flex items-center gap-3 mb-8">
              <GitCommit size={24} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ margin: 0 }}>Chain of Custody Timeline</h3>
            </div>
            
            {events.length === 0 ? (
              <p className="text-muted">No timeline events found.</p>
            ) : (
              <div className="timeline-container">
                {events.map((evt, idx) => {
                  const toUser = users.find(u => u.id === evt.to_user_id);
                  const performedBy = users.find(u => u.id === evt.performed_by);
                  
                  return (
                    <div key={evt.id} className="timeline-item animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="timeline-dot" style={{ background: evt.action === 'LOG' ? 'var(--success)' : 'var(--accent-primary)' }}></div>
                      <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`badge ${evt.action === 'LOG' ? 'badge-success' : 'badge-info'}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}>{evt.action}</span>
                            <span style={{ fontWeight: 600 }}>{evt.to_status}</span>
                          </div>
                          <span className="text-muted text-sm">{new Date(evt.timestamp).toLocaleString()}</span>
                        </div>
                        
                        <p className="mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                          {evt.action === 'LOG' 
                            ? `Asset originally logged into system.` 
                            : `Transferred to ${toUser ? toUser.name : `User ${evt.to_user_id}`}.`}
                        </p>
                        
                        {(evt.location || evt.remarks) && (
                          <div style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                            {evt.location && <div className="text-sm mb-1"><span className="text-muted">Location:</span> {evt.location}</div>}
                            {evt.remarks && <div className="text-sm"><span className="text-muted">Remarks:</span> <span style={{ fontStyle: 'italic' }}>"{evt.remarks}"</span></div>}
                          </div>
                        )}
                        
                        <div className="mt-3 text-xs text-muted flex items-center gap-1">
                          <span style={{ opacity: 0.6 }}>Recorded by:</span> {performedBy ? performedBy.name : `User ${evt.performed_by}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT ASSET MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Asset Details</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateAsset}>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input required className="input-field" value={editAsset.name} onChange={e => setEditAsset({...editAsset, name: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Type</label>
                  <input required className="input-field" value={editAsset.asset_type} onChange={e => setEditAsset({...editAsset, asset_type: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Location</label>
                  <input className="input-field" value={editAsset.location} onChange={e => setEditAsset({...editAsset, location: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" value={editAsset.description} onChange={e => setEditAsset({...editAsset, description: e.target.value})} rows={3} />
              </div>
              <div className="flex justify-end mt-6 pt-4 gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;
