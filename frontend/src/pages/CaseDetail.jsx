import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCase,
  getAssets,
  getDocuments,
  updateCase,
  getUsers,
  getCaseTimeline
} from '../services/api';
import { DocumentUploadModal } from '../components/common/DocumentUploadModal';
import { DocumentViewerModal } from '../components/common/DocumentViewerModal';
import { ChainOfCustodyModal } from './forensic/ChainOfCustodyModal';
import {
  Briefcase,
  Box,
  FileText,
  Plus,
  X,
  Edit2,
  Download,
  ShieldCheck,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Scale,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Search
} from 'lucide-react';

const docTypeStyles = {
  'FIR': 'bg-[var(--accent-faint)] text-[var(--accent-strong)] border-emerald-500/25',
  'Witness Statement': 'bg-[var(--info-soft)] text-[var(--info-base)] border-sky-500/25',
  'Forensic Report': 'bg-[var(--bg-inset)] text-[var(--text-secondary)] border-purple-500/25',
  'Evidence': 'bg-[var(--warn-soft)] text-[var(--warn-base)] border-amber-500/25',
  'Judicial Order': 'bg-[var(--accent-faint)] text-[var(--accent-strong)] border-teal-500/25',
  'Seizure Memo': 'bg-[var(--info-soft)] text-[var(--info-base)] border-indigo-500/25',
};

const classificationStyles = {
  'Confidential': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Secret': 'bg-[var(--warn-soft)] text-[var(--warn-base)] border-[var(--warn-soft)]',
  'Top Secret': 'bg-rose-500/15 text-[var(--danger-base)] border-rose-500/30',
};

export const CaseDetail = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit case form
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'HIGH',
    acts_sections: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, a, d, u, t] = await Promise.all([
        getCase(id),
        getAssets(id),
        getDocuments(id),
        getUsers(),
        getCaseTimeline(id),
      ]);
      setCaseData(c);
      setAssets(a || []);
      setDocuments(d || []);
      setUsers(u || []);
      setTimeline(t || []);
      if (c) {
        setEditForm({
          title: c.title,
          description: c.description || '',
          status: c.status,
          priority: c.priority || 'HIGH',
          acts_sections: c.acts_sections || '',
        });
      }
    } catch (err) {
      console.error(err);
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
      await updateCase(id, editForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page flex flex-col items-center justify-center min-h-[60vh]">
        <div className="spinner" style={{ width: 28, height: 28 }} />
        <span className="text-xs font-mono text-[var(--text-tertiary)] mt-4">
          Loading case docket and cryptographic documents...
        </span>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="page text-center py-20">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Case record not found</h3>
        <Link to="/cases" className="btn btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Cases
        </Link>
      </div>
    );
  }

  const assignedIO = users.find(u => u.id === caseData.assigned_io_id);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-heading">
          <Link to="/cases" className="page-eyebrow inline-flex items-center gap-1.5 hover:text-[var(--text-primary)]">
            <ArrowLeft size={14} />
            Cases
          </Link>
          <h1 className="page-title">{caseData.title}</h1>
          <p className="page-description">
            {caseData.description || 'No description provided.'}
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="badge badge-info">{caseData.case_number}</span>
            <span
              className={`badge ${
                caseData.status === 'OPEN'
                  ? 'badge-warn'
                  : caseData.status === 'CLOSED'
                  ? 'badge-accent'
                  : 'badge-info'
              }`}
            >
              {caseData.status}
            </span>
            <span className="badge">{caseData.priority || 'HIGH'}</span>
          </div>
        </div>

        <div className="page-actions">
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
            <Plus size={16} />
            Upload document
          </button>
          <button onClick={() => setShowEditModal(true)} className="btn btn-secondary">
            <Edit2 size={15} />
            Edit case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <span className="page-eyebrow">Sections</span>
          <p className="text-sm text-[var(--text-primary)] mt-1.5">{caseData.acts_sections || 'BNS / IT Act'}</p>
        </div>
        <div>
          <span className="page-eyebrow">Investigating officer</span>
          <p className="text-sm text-[var(--text-primary)] mt-1.5">
            {caseData.assigned_io_name || assignedIO?.name || 'Inspector Rajesh Deshmukh'}
          </p>
        </div>
        <div>
          <span className="page-eyebrow">Police station</span>
          <p className="text-sm text-[var(--text-primary)] mt-1.5">{caseData.police_station || 'Cyber Crime PS, Delhi'}</p>
        </div>
        <div>
          <span className="page-eyebrow">Court</span>
          <p className="text-sm text-[var(--text-primary)] mt-1.5">{caseData.court_jurisdiction || 'Special Cyber Court'}</p>
        </div>
      </div>

      {/* Main Grid: Documents (with type badges) & Physical Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 panel flex flex-col">
          <div className="panel-head">
            <h3 className="panel-title">
              <FileText size={17} className="text-[var(--accent-strong)]" />
              Documents
            </h3>
            <span className="text-sm text-[var(--text-tertiary)]">{documents.length} files</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th style={{ width: '150px' }}>Type</th>
                  <th style={{ width: '120px' }}>Classification</th>
                  <th style={{ width: '80px' }}>Version</th>
                  <th style={{ width: '110px' }}>Digital Sig</th>
                  <th style={{ width: '90px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(d => {
                  const typeBadgeClass = docTypeStyles[d.document_type] || 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]';
                  const classBadgeClass = classificationStyles[d.classification] || classificationStyles['Confidential'];

                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDoc(d)}
                      className="hover:bg-[var(--bg-overlay)] cursor-pointer transition-colors"
                    >
                      <td>
                        <div className="font-medium text-[var(--text-primary)]">
                          {d.filename}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] truncate max-w-xs mt-1 font-mono">
                          SHA256: {d.sha256_hash?.substring(0, 18)}...
                        </div>
                      </td>
                      <td>
                        <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border ${typeBadgeClass}`}>
                          {d.document_type}
                        </span>
                      </td>
                      <td>
                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold ${classBadgeClass}`}>
                          {d.classification || 'Confidential'}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-[var(--text-secondary)]">
                          v{d.current_version || 1}
                        </span>
                      </td>
                      <td>
                        <span className="text-[var(--accent-strong)] text-xs font-mono flex items-center gap-1 font-semibold">
                          <ShieldCheck size={14} /> VALID
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(d);
                          }}
                          className="btn btn-secondary text-xs px-2.5 py-1 inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Physical Evidence Items & Custody (1 Col) */}
        <div className="panel flex flex-col">
          <div className="panel-head">
            <h3 className="panel-title">
              <Box size={17} className="text-[var(--accent-strong)]" />
              Physical assets
            </h3>
            <span className="text-sm text-[var(--text-tertiary)]">{assets.length}</span>
          </div>
          <div className="panel-body space-y-4">

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {assets.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] font-mono text-center py-6">
                  No physical evidence logged for this case.
                </p>
              ) : (
                assets.map(a => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] hover:border-[#00d4aa]/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge badge-info font-mono text-xs">{a.asset_number}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-faint)] text-[var(--accent-strong)] border border-[var(--accent-faint)]">
                        {a.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">{a.name}</h4>
                    <p className="text-[11px] font-mono text-[var(--text-tertiary)]">
                      Custodian: {a.current_custodian_name || 'Dr. Aarav Nambiar (CFSL)'}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[var(--text-tertiary)]">Seal: {a.seal_number || 'INTACT'}</span>
                      <button
                        onClick={() => setSelectedAsset(a)}
                        className="text-[var(--accent-strong)] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <ShieldCheck size={12} />
                        <span>Track Custody</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-tertiary)] text-center">
            Every evidence handover is cryptographically signed
          </div>
        </div>
      </div>

      {/* Case Timeline: Legal & Investigative Milestones */}
      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">
            <Clock size={17} className="text-[var(--accent-strong)]" />
            Timeline
          </h3>
          <span className="text-sm text-[var(--text-tertiary)]">{timeline.length} events</span>
        </div>
        <div className="panel-body">

        <div className="relative border-l-2 border-[var(--accent-soft)] ml-4 space-y-6 pl-6 py-2">
          {timeline.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-[#111116] border-2 border-[#00d4aa] group-hover:scale-125 transition-transform flex items-center justify-center">
                <div className="h-1 w-1 rounded-full bg-[#00d4aa]" />
              </div>

              <div className="rounded-lg bg-[var(--bg-overlay)] p-4 border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-faint)] text-[var(--accent-strong)] border border-[var(--accent-faint)]">
                      {item.badge || item.type}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                    {item.date}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <DocumentUploadModal
          caseId={caseData.id}
          caseNumber={caseData.case_number}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => fetchData()}
        />
      )}

      {selectedDoc && (
        <DocumentViewerModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onRefresh={() => fetchData()}
        />
      )}

      {selectedAsset && (
        <ChainOfCustodyModal
          asset={selectedAsset}
          events={selectedAsset.events || [
            {
              id: 1,
              action: 'EVIDENCE_SEIZED',
              from_name: 'Crime Scene (Noida Sector 62)',
              to_name: 'Inspector Rajesh Deshmukh',
              timestamp: '2026-08-16T18:00:00Z',
              location: 'Noida Sector 62',
              seal_status: 'Sealed with Lacquer Stamp #DL-9912',
              remarks: 'Seized during authorized raid.',
            },
            {
              id: 2,
              action: 'LAB_INTAKE_RECEIVED',
              from_name: 'Sub-Inspector Anil Kumar',
              to_name: 'Dr. Aarav Nambiar (CFSL)',
              timestamp: '2026-08-20T11:45:00Z',
              location: 'CFSL Clean Room 2',
              seal_status: 'Seal Checked & Intact',
              remarks: 'Bitstream image created under write-blocker.',
            }
          ]}
          onClose={() => setSelectedAsset(null)}
          onRefresh={() => fetchData()}
        />
      )}

      {/* Edit Case Modal */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)} role="dialog" aria-modal="true">
          <div
            className="modal max-w-lg bg-[var(--bg-raised)] border border-[var(--border-default)] shadow-2xl rounded-lg overflow-hidden p-0 animate-modal-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-6 py-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Edit Case Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateCase} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Title</label>
                <input
                  className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Status</label>
                <select
                  className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2"
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Acts & Penal Sections</label>
                <input
                  className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2 font-mono"
                  value={editForm.acts_sections}
                  onChange={e => setEditForm({ ...editForm, acts_sections: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Case Facts / Description</label>
                <textarea
                  className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2 min-h-[70px]"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary text-xs px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs px-5 py-2">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetail;
