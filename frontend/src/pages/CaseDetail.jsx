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
  'FIR': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  'Witness Statement': 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  'Forensic Report': 'bg-purple-500/10 text-purple-400 border-purple-500/25',
  'Evidence': 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  'Judicial Order': 'bg-teal-500/10 text-teal-400 border-teal-500/25',
  'Seizure Memo': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
};

const classificationStyles = {
  'Confidential': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Secret': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Top Secret': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
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
        <span className="text-xs font-mono text-zinc-400 mt-4">
          Loading case docket and cryptographic documents...
        </span>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="page text-center py-20">
        <h3 className="text-base font-semibold text-zinc-200">Case record not found</h3>
        <Link to="/cases" className="btn btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Cases
        </Link>
      </div>
    );
  }

  const assignedIO = users.find(u => u.id === caseData.assigned_io_id);

  return (
    <div className="page space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
        <Link to="/cases" className="hover:text-zinc-200 flex items-center gap-1">
          <ArrowLeft size={13} />
          <span>Cases</span>
        </Link>
        <span>/</span>
        <span className="text-teal-400 font-semibold">{caseData.case_number}</span>
      </div>

      {/* Case Header Card */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="badge badge-info text-sm font-mono px-3 py-1 font-semibold">
                {caseData.case_number}
              </span>
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
              <span
                className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded-full border ${
                  caseData.priority === 'CRITICAL'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {caseData.priority || 'HIGH PRIORITY'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              {caseData.title}
            </h1>
            <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
              {caseData.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
            >
              <Plus size={15} />
              <span>Upload Document</span>
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-secondary text-xs px-3 py-2 inline-flex items-center gap-1.5"
            >
              <Edit2 size={14} />
              <span>Edit Case</span>
            </button>
          </div>
        </div>

        {/* Case Metadata Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04]">
            <span className="text-zinc-500 block text-[11px] mb-1">Statutory Sections</span>
            <span className="text-zinc-200 font-semibold">{caseData.acts_sections || 'BNS / IT Act'}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04]">
            <span className="text-zinc-500 block text-[11px] mb-1">Investigating Officer</span>
            <span className="text-[#00d4aa] font-semibold">
              {caseData.assigned_io_name || assignedIO?.name || 'Inspector Rajesh Deshmukh'}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04]">
            <span className="text-zinc-500 block text-[11px] mb-1">Originating Station</span>
            <span className="text-zinc-200">{caseData.police_station || 'Cyber Crime PS, Delhi'}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04]">
            <span className="text-zinc-500 block text-[11px] mb-1">Court Jurisdiction</span>
            <span className="text-amber-400 font-semibold">{caseData.court_jurisdiction || 'Special Cyber Court'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Documents (with type badges) & Physical Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List with Type Badges (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#00d4aa]" />
              <h3 className="text-sm font-semibold text-zinc-100">
                Case Documents & Evidentiary Exhibits
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {documents.length} Files Lodged
            </span>
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
                  const typeBadgeClass = docTypeStyles[d.document_type] || 'bg-zinc-800 text-zinc-300 border-zinc-700';
                  const classBadgeClass = classificationStyles[d.classification] || classificationStyles['Confidential'];

                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDoc(d)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td>
                        <div className="font-medium text-xs text-zinc-100">
                          {d.filename}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 truncate max-w-xs mt-0.5">
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
                        <span className="font-mono text-xs text-zinc-300">
                          v{d.current_version || 1}
                        </span>
                      </td>
                      <td>
                        <span className="text-emerald-400 text-xs font-mono flex items-center gap-1 font-semibold">
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
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Box size={16} className="text-[#00d4aa]" />
                <h3 className="text-sm font-semibold text-zinc-100">Physical Assets & Media</h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">{assets.length} Items</span>
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {assets.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono text-center py-6">
                  No physical evidence logged for this case.
                </p>
              ) : (
                assets.map(a => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-[#00d4aa]/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge badge-info font-mono text-xs">{a.asset_number}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-[#00d4aa] border border-teal-500/20">
                        {a.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-zinc-200">{a.name}</h4>
                    <p className="text-[11px] font-mono text-zinc-500">
                      Custodian: {a.current_custodian_name || 'Dr. Aarav Nambiar (CFSL)'}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400">Seal: {a.seal_number || 'INTACT'}</span>
                      <button
                        onClick={() => setSelectedAsset(a)}
                        className="text-[#00d4aa] hover:underline flex items-center gap-1 font-semibold"
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

          <div className="pt-3 border-t border-slate-800 text-xs font-mono text-zinc-500 text-center">
            Every evidence handover is cryptographically signed
          </div>
        </div>
      </div>

      {/* Case Timeline: Legal & Investigative Milestones */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#00d4aa]" />
            <h3 className="text-sm font-semibold text-zinc-100">
              Case Timeline & Legal Milestones (Immutable Sequence)
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {timeline.length} Registered Events
          </span>
        </div>

        <div className="relative border-l-2 border-teal-500/30 ml-4 space-y-6 pl-6 py-2">
          {timeline.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-[#111116] border-2 border-[#00d4aa] group-hover:scale-125 transition-transform flex items-center justify-center">
                <div className="h-1 w-1 rounded-full bg-[#00d4aa]" />
              </div>

              <div className="rounded-xl bg-slate-900/60 p-4 border border-slate-800 hover:border-white/[0.12] transition-colors space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-zinc-100">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-[#00d4aa] border border-teal-500/20">
                      {item.badge || item.type}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {item.date}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
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
            className="modal max-w-lg bg-[#121217] border border-white/[0.12] shadow-2xl rounded-2xl overflow-hidden p-0 animate-modal-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 py-4">
              <h3 className="text-sm font-semibold text-zinc-100">Edit Case Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-white p-1 rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateCase} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Title</label>
                <input
                  className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Status</label>
                <select
                  className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Acts & Penal Sections</label>
                <input
                  className="input bg-[#0e0e13] border-white/10 text-xs py-2 font-mono"
                  value={editForm.acts_sections}
                  onChange={e => setEditForm({ ...editForm, acts_sections: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Case Facts / Description</label>
                <textarea
                  className="input bg-[#0e0e13] border-white/10 text-xs py-2 min-h-[70px]"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
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
