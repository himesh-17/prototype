import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { searchDocuments, getAllDocuments, downloadDocumentVersion, verifyDocument } from '../services/api';
import { DocumentViewerModal } from '../components/common/DocumentViewerModal';
import { EmptyState } from '../components/common/EmptyState';
import {
  Search,
  FileText,
  Download,
  ShieldCheck,
  Eye,
  Filter,
  Check,
  ExternalLink,
  Layers
} from 'lucide-react';

const docTypeStyles = {
  'FIR': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Witness Statement': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Forensic Report': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Evidence': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Judicial Order': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

const classificationStyles = {
  'Confidential': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Secret': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Top Secret': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export const DocumentSearch = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const loadInitialDocs = async () => {
    setLoading(true);
    try {
      const docs = await getAllDocuments();
      setResults(docs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialDocs();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      loadInitialDocs();
      return;
    }
    setLoading(true);
    try {
      const data = await searchDocuments(query.trim());
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(doc => {
    if (typeFilter === 'ALL') return true;
    return doc.document_type === typeFilter;
  });

  return (
    <div className="page space-y-6">
      {/* Header */}
      <div className="page-header pb-2 border-b border-slate-800/80">
        <div className="page-heading">
          <div className="flex items-center gap-2">
            <span className="page-eyebrow font-sans text-slate-400">Federated Search</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-sans text-teal-400 font-medium">OCR & Cryptographic Discovery</span>
          </div>
          <h1 className="page-title flex items-center gap-3">
            <span className="font-sans font-semibold text-slate-100">Document & Evidence Search</span>
            <span className="badge badge-info text-xs">{filteredResults.length} Indexed</span>
          </h1>
          <p className="page-description font-sans text-slate-400 text-xs">
            Search across OCR extracted witness statements, FIR descriptions, forensic findings, and SHA-256 cryptographic hashes.
          </p>
        </div>
      </div>

      {/* Elevated Search Bar & Filter Group */}
      <form onSubmit={handleSearch} className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-3.5 flex flex-wrap items-center justify-between gap-3.5 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            className="input bg-slate-950/60 border-slate-700 text-xs pl-10 py-2.5 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30"
            placeholder="Search by keyword, witness name, SCADA, SHA-256 hash, or OCR phrases..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-sans text-slate-400">
            <Filter size={13} />
            <span>Type:</span>
          </div>
          <select
            className="input bg-slate-950/60 border-slate-700 text-xs py-1.5 px-3 rounded-xl text-slate-200"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="FIR">FIR</option>
            <option value="Witness Statement">Witness Statement</option>
            <option value="Forensic Report">Forensic Report</option>
            <option value="Evidence">Evidence</option>
            <option value="Judicial Order">Judicial Order</option>
          </select>

          <button type="submit" className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 font-sans font-medium shadow-md shadow-teal-500/10">
            <Search size={14} />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Results Table */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden shadow-lg backdrop-blur-sm">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="spinner" style={{ width: 24, height: 24 }} />
            <span className="text-xs font-sans text-slate-400">Executing cryptographic search...</span>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No documents found"
              description={query ? `No documents matched "${query}". Try searching for 'Trojan', 'biometric', 'FIR', or clearing filters.` : 'No documents available.'}
              secondaryLabel="Show All Documents"
              onSecondaryAction={() => {
                setQuery('');
                setTypeFilter('ALL');
                loadInitialDocs();
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th style={{ width: '160px' }}>Type</th>
                  <th style={{ width: '140px' }}>Case Reference</th>
                  <th style={{ width: '130px' }}>Classification</th>
                  <th style={{ width: '90px' }}>Version</th>
                  <th style={{ width: '110px' }}>OCR Text</th>
                  <th style={{ width: '90px' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(doc => {
                  const typeClass = docTypeStyles[doc.document_type] || 'bg-slate-700/30 text-slate-300 border-slate-600/30';
                  const classClass = classificationStyles[doc.classification] || classificationStyles['Confidential'];

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td>
                        <div className="font-sans font-medium text-xs text-slate-100 truncate max-w-sm">
                          {doc.filename}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-sm mt-0.5">
                          SHA256: {doc.sha256_hash?.substring(0, 16)}...{doc.sha256_hash?.substring(doc.sha256_hash.length - 4)}
                        </div>
                      </td>
                      <td>
                        <span className={`text-[11px] font-sans font-medium px-2.5 py-0.5 rounded-full border ${typeClass}`}>
                          {doc.document_type}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info font-mono text-xs">
                          {doc.case_number || `CR-2026-00${doc.case_id || 1}`}
                        </span>
                      </td>
                      <td>
                        <span className={`text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold ${classClass}`}>
                          {doc.classification || 'Confidential'}
                        </span>
                      </td>
                      <td>
                        <span className="font-sans text-xs text-slate-300">
                          v{doc.current_version || 1}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-sans text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 font-medium">
                          {doc.ocr_text ? 'Indexed' : 'Queued'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                          }}
                          className="btn btn-secondary text-xs px-2.5 py-1 inline-flex items-center gap-1 hover:border-teal-400/40 font-sans"
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
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <DocumentViewerModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onRefresh={() => loadInitialDocs()}
        />
      )}
    </div>
  );
};

export default DocumentSearch;
