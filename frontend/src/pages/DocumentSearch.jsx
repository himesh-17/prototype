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
  'FIR': 'bg-[var(--accent-faint)] text-[var(--accent-strong)] border-emerald-500/20',
  'Witness Statement': 'bg-[var(--info-soft)] text-[var(--info-base)] border-sky-500/20',
  'Forensic Report': 'bg-[var(--bg-inset)] text-[var(--text-secondary)] border-purple-500/20',
  'Evidence': 'bg-[var(--warn-soft)] text-[var(--warn-base)] border-[var(--warn-soft)]',
  'Judicial Order': 'bg-[var(--accent-faint)] text-[var(--accent-strong)] border-[var(--accent-faint)]',
};

const classificationStyles = {
  'Confidential': 'bg-[var(--info-soft)] text-[var(--info-base)] border-sky-500/20',
  'Secret': 'bg-[var(--warn-soft)] text-[var(--warn-base)] border-[var(--warn-soft)]',
  'Top Secret': 'bg-[var(--danger-soft)] text-[var(--danger-base)] border-[var(--danger-soft)]',
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
    <div className="page">
      <div className="page-header">
        <div className="page-heading">
          <span className="page-eyebrow">Evidence</span>
          <h1 className="page-title">Document search</h1>
          <p className="page-description">
            Find FIRs, statements, reports, and hashed exhibits.
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="toolbar">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="search"
            className="pl-10"
            placeholder="Search filename, type, or hash"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <select
          className="w-auto min-w-[160px]"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All types</option>
          <option value="FIR">FIR</option>
          <option value="Witness Statement">Witness Statement</option>
          <option value="Forensic Report">Forensic Report</option>
          <option value="Evidence">Evidence</option>
          <option value="Judicial Order">Judicial Order</option>
        </select>
        <button type="submit" className="btn btn-primary">
          <Search size={16} />
          Search
        </button>
      </form>

      <div className="panel">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="spinner" style={{ width: 24, height: 24 }} />
            <span className="text-xs font-sans text-[var(--text-tertiary)]">Executing cryptographic search...</span>
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
                  const typeClass = docTypeStyles[doc.document_type] || 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]';
                  const classClass = classificationStyles[doc.classification] || classificationStyles['Confidential'];

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="hover:bg-[var(--bg-overlay)] cursor-pointer transition-colors"
                    >
                      <td>
                        <div className="font-medium text-[var(--text-primary)] truncate max-w-sm">
                          {doc.filename}
                        </div>
                        <div className="row-sub truncate max-w-sm">
                          {doc.sha256_hash?.substring(0, 16)}…
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${typeClass.includes('emerald') ? 'badge-accent' : 'badge-info'}`}>
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
                        <span className="font-sans text-xs text-[var(--text-secondary)]">
                          v{doc.current_version || 1}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-sans text-[var(--accent-strong)] bg-[var(--accent-faint)] px-2 py-0.5 rounded-full border border-[var(--accent-faint)] font-medium">
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
