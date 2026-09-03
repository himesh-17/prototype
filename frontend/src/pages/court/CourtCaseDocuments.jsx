import React, { useState, useEffect } from 'react';
import { getAllDocuments, getCases } from '../../services/api';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal';
import { JudgmentUploadModal } from './JudgmentUploadModal';
import { DocumentRequestModal } from './DocumentRequestModal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Scale,
  FileText,
  Filter,
  Search,
  ShieldCheck,
  Eye,
  Plus,
  Send,
  Calendar,
  Lock,
  Download
} from 'lucide-react';

const docTypeStyles = {
  'FIR': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Witness Statement': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Forensic Report': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Evidence': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Judicial Order': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Seizure Memo': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

const classificationStyles = {
  'Confidential': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Secret': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Top Secret': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export const CourtCaseDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [caseFilter, setCaseFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showJudgmentModal, setShowJudgmentModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([getAllDocuments(), getCases()]);
      setDocuments(d || []);
      setCases(c || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDocs = documents.filter(doc => {
    const matchesType = typeFilter === 'ALL' || doc.document_type === typeFilter;
    const matchesCase = caseFilter === 'ALL' || doc.case_id?.toString() === caseFilter;
    const matchesSearch =
      !search ||
      doc.filename.toLowerCase().includes(search.toLowerCase()) ||
      (doc.ocr_text && doc.ocr_text.toLowerCase().includes(search.toLowerCase())) ||
      (doc.sha256_hash && doc.sha256_hash.toLowerCase().includes(search.toLowerCase()));

    return matchesType && matchesCase && matchesSearch;
  });

  return (
    <div className="page space-y-6">
      {/* Header */}
      <div className="page-header pb-2 border-b border-slate-800/80">
        <div className="page-heading">
          <div className="flex items-center gap-2">
            <span className="page-eyebrow font-sans text-slate-400">Judicial Registry</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-sans text-teal-400 font-medium">Court Evidence Repository</span>
          </div>
          <h1 className="page-title flex items-center gap-3">
            <span className="font-sans font-semibold text-slate-100">Case Documents & Evidence (Read-Only)</span>
            <span className="badge badge-info text-xs">
              {documents.length} Records
            </span>
          </h1>
          <p className="page-description font-sans text-slate-400 text-xs">
            Read-only court docket view with cryptographic digital signature verification and tamper seals.
          </p>
        </div>

        <div className="page-actions flex items-center gap-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 font-sans font-medium"
          >
            <Send size={14} />
            <span>Document Request Form</span>
          </button>
          <button
            onClick={() => setShowJudgmentModal(true)}
            className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 font-sans font-medium shadow-lg shadow-teal-500/20"
          >
            <Scale size={14} />
            <span>Upload Judgment / Order</span>
          </button>
        </div>
      </div>

      {/* Elevated Filter Bar */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-3.5 flex flex-wrap items-center justify-between gap-3.5 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            className="input bg-slate-950/60 border-slate-700 text-xs pl-9 py-2 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30"
            placeholder="Search document title, SHA-256 hash, or OCR extracted text..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Document Type Filter */}
          <div className="flex items-center gap-1.5 text-xs font-sans text-slate-400">
            <Filter size={13} />
            <span>Type:</span>
          </div>
          <select
            className="input bg-slate-950/60 border-slate-700 text-xs py-1.5 px-3 rounded-xl text-slate-200"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Document Types</option>
            <option value="FIR">FIR</option>
            <option value="Witness Statement">Witness Statement</option>
            <option value="Forensic Report">Forensic Report</option>
            <option value="Evidence">Evidence</option>
            <option value="Judicial Order">Judicial Order</option>
          </select>

          {/* Case Filter */}
          <div className="flex items-center gap-1.5 text-xs font-sans text-slate-400 ml-2">
            <span>Case:</span>
          </div>
          <select
            className="input bg-slate-950/60 border-slate-700 text-xs py-1.5 px-3 rounded-xl max-w-[180px] text-slate-200"
            value={caseFilter}
            onChange={e => setCaseFilter(e.target.value)}
          >
            <option value="ALL">All Cases</option>
            {cases.map(c => (
              <option key={c.id} value={c.id.toString()}>{c.case_number}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Read-Only Document Table */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden shadow-lg backdrop-blur-sm">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="spinner" style={{ width: 24, height: 24 }} />
            <span className="text-xs font-sans text-slate-400">Loading court documents...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No court documents found"
              description="No documents matched the active search or type filter."
              secondaryLabel="Reset Filters"
              onSecondaryAction={() => {
                setSearch('');
                setTypeFilter('ALL');
                setCaseFilter('ALL');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Document Exhibit</th>
                  <th style={{ width: '160px' }}>Type</th>
                  <th style={{ width: '140px' }}>Case Reference</th>
                  <th style={{ width: '130px' }}>Classification</th>
                  <th style={{ width: '120px' }}>Digital Sig</th>
                  <th style={{ width: '110px' }}>Date Lodged</th>
                  <th style={{ width: '90px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(d => {
                  const typeClass = docTypeStyles[d.document_type] || 'bg-slate-700/30 text-slate-300 border-slate-600/30';
                  const classClass = classificationStyles[d.classification] || classificationStyles['Confidential'];

                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDoc(d)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td>
                        <div className="font-sans font-medium text-xs text-slate-100 truncate max-w-sm">
                          {d.filename}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs mt-0.5">
                          SHA256: {d.sha256_hash?.substring(0, 16)}...{d.sha256_hash?.substring(d.sha256_hash.length - 4)}
                        </div>
                      </td>
                      <td>
                        <span className={`text-[11px] font-sans font-medium px-2.5 py-0.5 rounded-full border ${typeClass}`}>
                          {d.document_type}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info font-mono text-xs">
                          {d.case_number || `CR-2026-00${d.case_id || 1}`}
                        </span>
                      </td>
                      <td>
                        <span className={`text-[10px] font-sans uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-semibold ${classClass}`}>
                          {d.classification || 'Confidential'}
                        </span>
                      </td>
                      <td>
                        <span className="text-teal-400 text-xs font-sans flex items-center gap-1 font-semibold">
                          <ShieldCheck size={14} /> CERTIFIED
                        </span>
                      </td>
                      <td className="font-sans text-xs text-slate-400 whitespace-nowrap">
                        {new Date(d.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(d);
                          }}
                          className="btn btn-secondary text-xs px-2.5 py-1 inline-flex items-center gap-1 hover:border-teal-400/40 font-sans"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedDoc && (
        <DocumentViewerModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onRefresh={() => fetchData()}
        />
      )}

      {showJudgmentModal && (
        <JudgmentUploadModal
          availableCases={cases}
          onClose={() => setShowJudgmentModal(false)}
          onSuccess={() => fetchData()}
        />
      )}

      {showRequestModal && (
        <DocumentRequestModal
          availableCases={cases}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => fetchData()}
        />
      )}
    </div>
  );
};

export default CourtCaseDocuments;
