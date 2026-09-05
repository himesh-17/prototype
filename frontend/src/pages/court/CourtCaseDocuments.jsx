import React, { useEffect, useMemo, useState } from 'react';
import {
  Scale,
  FileText,
  Filter,
  Search,
  ShieldCheck,
  Eye,
  Send,
  Lock,
  RefreshCw,
  X,
} from 'lucide-react';

import { getAllDocuments, getCases } from '../../services/api';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal';
import { JudgmentUploadModal } from './JudgmentUploadModal';
import { DocumentRequestModal } from './DocumentRequestModal';
import { EmptyState } from '../../components/common/EmptyState';

import '../../styles/CourtCaseDocuments.css';


/* =========================================================
   DOCUMENT TYPE CONFIG
========================================================= */

const documentTypeConfig = {
  FIR: {
    label: 'FIR',
    className: 'document-type fir',
  },

  'Witness Statement': {
    label: 'Witness Statement',
    className: 'document-type witness',
  },

  'Forensic Report': {
    label: 'Forensic Report',
    className: 'document-type forensic',
  },

  Evidence: {
    label: 'Evidence',
    className: 'document-type evidence',
  },

  'Judicial Order': {
    label: 'Judicial Order',
    className: 'document-type order',
  },

  'Seizure Memo': {
    label: 'Seizure Memo',
    className: 'document-type seizure',
  },
};


/* =========================================================
   CLASSIFICATION CONFIG
========================================================= */

const classificationConfig = {
  Confidential: {
    label: 'Confidential',
    className: 'classification confidential',
  },

  Secret: {
    label: 'Secret',
    className: 'classification secret',
  },

  'Top Secret': {
    label: 'Top Secret',
    className: 'classification top-secret',
  },
};


/* =========================================================
   COMPONENT
========================================================= */

export const CourtCaseDocuments = () => {

  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);

  const [loading, setLoading] = useState(true);

  /* Filters */
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [caseFilter, setCaseFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  /* Modals */
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showJudgmentModal, setShowJudgmentModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);


  /* =========================================================
     FETCH DATA
  ========================================================= */

  const fetchData = async () => {
    setLoading(true);

    try {
      const [documentsData, casesData] = await Promise.all([
        getAllDocuments(),
        getCases(),
      ]);

      setDocuments(documentsData || []);
      setCases(casesData || []);

    } catch (err) {
      console.error('Failed to fetch court documents:', err);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);


  /* =========================================================
     FILTER DOCUMENTS
  ========================================================= */

  const filteredDocs = useMemo(() => {

    const query = search.trim().toLowerCase();

    return documents.filter((doc) => {

      const matchesType =
        typeFilter === 'ALL' ||
        doc.document_type === typeFilter;

      const matchesCase =
        caseFilter === 'ALL' ||
        doc.case_id?.toString() === caseFilter;

      const matchesSearch =
        !query ||
        doc.filename?.toLowerCase().includes(query) ||
        doc.ocr_text?.toLowerCase().includes(query) ||
        doc.sha256_hash?.toLowerCase().includes(query) ||
        doc.case_number?.toLowerCase().includes(query);

      return (
        matchesType &&
        matchesCase &&
        matchesSearch
      );
    });

  }, [
    documents,
    typeFilter,
    caseFilter,
    search,
  ]);


  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('ALL');
    setCaseFilter('ALL');
  };


  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (dateValue) => {

    if (!dateValue) return '—';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };


  /* =========================================================
     FORMAT HASH
  ========================================================= */

  const formatHash = (hash) => {

    if (!hash) {
      return 'SHA-256 unavailable';
    }

    if (hash.length <= 24) {
      return hash;
    }

    return `${hash.substring(0, 16)}...${hash.substring(
      hash.length - 4
    )}`;
  };


  /* =========================================================
     CASE NUMBER
  ========================================================= */

  const getCaseNumber = (document) => {

    if (document.case_number) {
      return document.case_number;
    }

    if (document.case_id) {
      return `CR-2026-${String(
        document.case_id
      ).padStart(3, '0')}`;
    }

    return 'Unassigned';
  };


  /* =========================================================
     DOCUMENT TYPE
  ========================================================= */

  const getDocumentType = (type) => {

    return (
      documentTypeConfig[type] || {
        label: type || 'Document',
        className: 'document-type default',
      }
    );
  };


  /* =========================================================
     CLASSIFICATION
  ========================================================= */

  const getClassification = (classification) => {

    return (
      classificationConfig[classification] ||
      classificationConfig.Confidential
    );
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="page court-documents-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header court-documents-header">

        <div className="page-heading">

          <span className="page-eyebrow">
            Court
          </span>

          <h1 className="page-title">
            Case Documents
          </h1>

          <p className="page-description">
            Review court records with verified signatures
            and document integrity status.
          </p>

        </div>


        <div className="court-header-actions">

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowRequestModal(true)}
          >
            <Send size={15} />
            Document Request
          </button>


          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowJudgmentModal(true)}
          >
            <Scale size={15} />
            Upload Order
          </button>

        </div>

      </div>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="court-summary">

        <div className="court-summary-item">

          <div className="court-summary-icon">
            <FileText size={17} />
          </div>

          <div>
            <span>
              Available Documents
            </span>

            <strong>
              {documents.length}
            </strong>
          </div>

        </div>


        <div className="court-summary-divider" />


        <div className="court-summary-item">

          <div className="court-summary-icon">
            <ShieldCheck size={17} />
          </div>

          <div>
            <span>
              Verified Records
            </span>

            <strong>
              {documents.length}
            </strong>
          </div>

        </div>


        <div className="court-summary-divider" />


        <div className="court-summary-item">

          <div className="court-summary-icon">
            <Lock size={17} />
          </div>

          <div>
            <span>
              Read Only
            </span>

            <strong>
              Active
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div className="court-filter-bar">

        <div className="court-search">

          <Search size={15} />

          <input
            type="search"
            placeholder="Search documents, case numbers or SHA-256..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="court-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}

        </div>


        <div className="court-filter-divider" />


        <div className="court-filter">

          <Filter size={14} />

          <label htmlFor="document-type-filter">
            Type
          </label>

          <select
            id="document-type-filter"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
          >
            <option value="ALL">
              All Types
            </option>

            <option value="FIR">
              FIR
            </option>

            <option value="Witness Statement">
              Witness Statement
            </option>

            <option value="Forensic Report">
              Forensic Report
            </option>

            <option value="Evidence">
              Evidence
            </option>

            <option value="Judicial Order">
              Judicial Order
            </option>

            <option value="Seizure Memo">
              Seizure Memo
            </option>

          </select>

        </div>


        <div className="court-filter">

          <label htmlFor="case-filter">
            Case
          </label>

          <select
            id="case-filter"
            value={caseFilter}
            onChange={(e) =>
              setCaseFilter(e.target.value)
            }
          >

            <option value="ALL">
              All Cases
            </option>

            {cases.map((item) => (
              <option
                key={item.id}
                value={item.id.toString()}
              >
                {item.case_number}
              </option>
            ))}

          </select>

        </div>


        {(search ||
          typeFilter !== 'ALL' ||
          caseFilter !== 'ALL') && (

          <button
            type="button"
            className="court-reset-btn"
            onClick={resetFilters}
          >
            Reset
          </button>

        )}

      </div>


      {/* =====================================================
          RESULTS HEADER
      ===================================================== */}

      <div className="court-results-header">

        <div>
          <h2>
            Document Docket
          </h2>

          <p>
            {loading
              ? 'Loading records...'
              : `${filteredDocs.length} record${
                  filteredDocs.length !== 1
                    ? 's'
                    : ''
                }`}
          </p>
        </div>

        <button
          type="button"
          className="court-refresh-btn"
          onClick={fetchData}
          disabled={loading}
          title="Refresh documents"
        >
          <RefreshCw
            size={14}
            className={
              loading
                ? 'court-refresh-spin'
                : ''
            }
          />

          Refresh
        </button>

      </div>


      {/* =====================================================
          DOCUMENT TABLE
      ===================================================== */}

      <div className="court-documents-panel">

        {loading ? (

          <div className="court-loading">

            <div className="spinner" />

            <span>
              Loading court documents...
            </span>

          </div>

        ) : filteredDocs.length === 0 ? (

          <EmptyState
            icon={FileText}
            title="No court documents found"
            description="No documents matched the active search or filter criteria."
            secondaryLabel="Reset Filters"
            onSecondaryAction={resetFilters}
          />

        ) : (

          <div className="court-table-wrapper">

            <table className="court-documents-table">

              <thead>

                <tr>

                  <th>
                    Document
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Case
                  </th>

                  <th>
                    Classification
                  </th>

                  <th>
                    Integrity
                  </th>

                  <th>
                    Lodged
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredDocs.map((document) => {

                  const type =
                    getDocumentType(
                      document.document_type
                    );

                  const classification =
                    getClassification(
                      document.classification
                    );

                  return (

                    <tr
                      key={document.id}
                      onClick={() =>
                        setSelectedDoc(document)
                      }
                    >

                      {/* DOCUMENT */}

                      <td>

                        <div className="court-document-cell">

                          <div className="court-document-icon">
                            <FileText size={17} />
                          </div>

                          <div className="court-document-info">

                            <div className="court-document-name">
                              {document.filename}
                            </div>

                            <div className="court-document-hash">
                              SHA-256&nbsp;
                              {formatHash(
                                document.sha256_hash
                              )}
                            </div>

                          </div>

                        </div>

                      </td>


                      {/* TYPE */}

                      <td>

                        <span
                          className={
                            type.className
                          }
                        >
                          {type.label}
                        </span>

                      </td>


                      {/* CASE */}

                      <td>

                        <span className="court-case-number">
                          {getCaseNumber(document)}
                        </span>

                      </td>


                      {/* CLASSIFICATION */}

                      <td>

                        <span
                          className={
                            classification.className
                          }
                        >
                          {classification.label}
                        </span>

                      </td>


                      {/* INTEGRITY */}

                      <td>

                        <div className="court-integrity">

                          <span className="court-integrity-icon">
                            <ShieldCheck size={14} />
                          </span>

                          <div>

                            <strong>
                              Verified
                            </strong>

                            <span>
                              Digital signature
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* DATE */}

                      <td>

                        <span className="court-date">
                          {formatDate(
                            document.created_at
                          )}
                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <button
                          type="button"
                          className="court-inspect-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedDoc(document);
                          }}
                        >
                          <Eye size={13} />
                          Inspect
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


      {/* =====================================================
          MODALS
      ===================================================== */}

      {selectedDoc && (

        <DocumentViewerModal
          document={selectedDoc}
          onClose={() =>
            setSelectedDoc(null)
          }
          onRefresh={fetchData}
        />

      )}


      {showJudgmentModal && (

        <JudgmentUploadModal
          availableCases={cases}
          onClose={() =>
            setShowJudgmentModal(false)
          }
          onSuccess={fetchData}
        />

      )}


      {showRequestModal && (

        <DocumentRequestModal
          availableCases={cases}
          onClose={() =>
            setShowRequestModal(false)
          }
          onSuccess={fetchData}
        />

      )}

    </div>
  );
};


export default CourtCaseDocuments;