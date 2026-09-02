import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCase, getAssets, createAsset, getDocuments, createDocumentMetadata, updateCase, getUsers } from '../services/api';
import { Briefcase, Box, FileText, Plus, X, Edit2, FileSearch } from 'lucide-react';

const CaseDetail = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showEditCaseModal, setShowEditCaseModal] = useState(false);
  
  // Forms State
  const [newAsset, setNewAsset] = useState({ asset_number: '', name: '', description: '', asset_type: '', location: '' });
  const [newDoc, setNewDoc] = useState({ filename: '', document_type: '', asset_id: '' });
  const [editCase, setEditCase] = useState({ title: '', description: '', status: '', assigned_io_id: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, a, d, u] = await Promise.all([
        getCase(id),
        getAssets(id),
        getDocuments(id),
        getUsers()
      ]);
      setCaseData(c);
      setAssets(a);
      setDocuments(d);
      setUsers(u);
      setEditCase({
        title: c.title,
        description: c.description || '',
        status: c.status,
        assigned_io_id: c.assigned_io_id
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

  const handleUpdateCase = async (e) => {
    e.preventDefault();
    try {
      await updateCase(id, {
        ...editCase,
        assigned_io_id: parseInt(editCase.assigned_io_id)
      });
      setShowEditCaseModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      await createAsset(id, newAsset);
      setShowAssetModal(false);
      setNewAsset({ asset_number: '', name: '', description: '', asset_type: '', location: '' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateDoc = async (e) => {
    e.preventDefault();
    try {
      await createDocumentMetadata(id, {
        ...newDoc,
        asset_id: newDoc.asset_id ? parseInt(newDoc.asset_id) : null
      });
      setShowDocModal(false);
      setNewDoc({ filename: '', document_type: '', asset_id: '' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full min-h-[300px]"><div className="spinner" /></div>;
  if (!caseData) return <div className="card text-center my-8 text-muted">Case not found</div>;

  const assignedIO = users.find(u => u.id === caseData.assigned_io_id);

  return (
    <div className="animate-fade-in">
      {/* Case Header Card */}
      <div className="card mb-6" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', opacity: 0.5, transform: 'translate(30%, -30%)' }}></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="badge badge-info text-sm" style={{ padding: '0.5rem 1rem' }}>{caseData.case_number}</div>
              <span className={`badge ${caseData.status === 'OPEN' ? 'badge-warning' : caseData.status === 'CLOSED' ? 'badge-success' : 'badge-danger'}`} style={{ padding: '0.5rem 1rem' }}>
                {caseData.status}
              </span>
            </div>
            <h1 className="mb-2">{caseData.title}</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', fontSize: '1.1rem' }}>
              {caseData.description || 'No description provided.'}
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="badge badge-info" style={{ background: 'var(--bg-elevated)' }}>
                IO: {assignedIO ? `${assignedIO.name} (${assignedIO.badge_number})` : `ID: ${caseData.assigned_io_id}`}
              </div>
              <div className="text-muted text-sm">
                Created on {new Date(caseData.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowEditCaseModal(true)}>
            <Edit2 size={16} /> Edit Case
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Physical Assets Section */}
        <div style={{ flex: 1.5 }}>
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-3">
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <Box size={22} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3 style={{ margin: 0 }}>Physical Assets</h3>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setShowAssetModal(true)}>
              <Plus size={16} /> Log Asset
            </button>
          </div>
          
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {assets.length === 0 ? (
              <div className="text-center py-12 px-4 text-muted">
                <Box size={40} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p>No physical assets logged for this case.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Asset #</th>
                      <th>Name / Type</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map(a => (
                      <tr key={a.id}>
                        <td><div className="badge badge-info">{a.asset_number}</div></td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</div>
                          <div className="text-muted text-xs mt-1">{a.asset_type}</div>
                        </td>
                        <td><span className="badge badge-warning">{a.status}</span></td>
                        <td>
                          <Link to={`/assets/${a.id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>View Details</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div style={{ flex: 1 }}>
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-3">
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <FileText size={22} style={{ color: 'var(--accent-secondary)' }} />
              </div>
              <h3 style={{ margin: 0 }}>Documents</h3>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setShowDocModal(true)}>
              <Plus size={16} /> Upload
            </button>
          </div>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {documents.length === 0 ? (
              <div className="text-center py-12 px-4 text-muted">
                <FileSearch size={40} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p>No documents attached to this case.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(d => (
                      <tr key={d.id}>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{d.filename}</div>
                          <div className="text-muted text-xs mt-1">Hash: {d.sha256_hash.substring(0,10)}...</div>
                        </td>
                        <td><span className="badge badge-info" style={{ background: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>{d.document_type}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT CASE MODAL */}
      {showEditCaseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Case</h3>
              <button onClick={() => setShowEditCaseModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateCase}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input required className="input-field" value={editCase.title} onChange={e => setEditCase({...editCase, title: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" value={editCase.description} onChange={e => setEditCase({...editCase, description: e.target.value})} rows={3} />
              </div>
              <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Status</label>
                  <select required className="input-field" value={editCase.status} onChange={e => setEditCase({...editCase, status: e.target.value})}>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Assign IO</label>
                  <select required className="input-field" value={editCase.assigned_io_id} onChange={e => setEditCase({...editCase, assigned_io_id: e.target.value})}>
                    <option value="" disabled>Select an Officer...</option>
                    {users.filter(u => u.role === 'IO' || u.role === 'ADMIN').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.badge_number || 'N/A'})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-4 gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditCaseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSET MODAL */}
      {showAssetModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Log New Physical Asset</h3>
              <button onClick={() => setShowAssetModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateAsset}>
              <div className="input-group">
                <label className="input-label">Asset Number</label>
                <input required className="input-field" value={newAsset.asset_number} onChange={e => setNewAsset({...newAsset, asset_number: e.target.value})} placeholder="e.g. EV-1001" />
              </div>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input required className="input-field" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="e.g. Mobile Phone" />
              </div>
              <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Type</label>
                  <input required className="input-field" value={newAsset.asset_type} onChange={e => setNewAsset({...newAsset, asset_type: e.target.value})} placeholder="e.g. ELECTRONICS" />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Location (Optional)</label>
                  <input className="input-field" value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} placeholder="e.g. Locker A" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" value={newAsset.description} onChange={e => setNewAsset({...newAsset, description: e.target.value})} rows={2} placeholder="Optional details..." />
              </div>
              <div className="flex justify-end mt-6 pt-4 gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssetModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOC MODAL */}
      {showDocModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button onClick={() => setShowDocModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div className="badge badge-warning mb-4 w-full" style={{ padding: '0.75rem' }}>Note: Real file upload is pending integration. This logs metadata only for tracking.</div>
            <form onSubmit={handleCreateDoc}>
              <div className="input-group">
                <label className="input-label">Filename</label>
                <input required className="input-field" value={newDoc.filename} onChange={e => setNewDoc({...newDoc, filename: e.target.value})} placeholder="e.g. forensic_report.pdf" />
              </div>
              <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Document Type</label>
                  <input required className="input-field" value={newDoc.document_type} onChange={e => setNewDoc({...newDoc, document_type: e.target.value})} placeholder="e.g. FIR, FORENSIC_REPORT" />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Link to Asset (Optional)</label>
                  <select className="input-field" value={newDoc.asset_id} onChange={e => setNewDoc({...newDoc, asset_id: e.target.value})}>
                    <option value="">None</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.asset_number} - {a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-4 gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDocModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Metadata</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetail;
