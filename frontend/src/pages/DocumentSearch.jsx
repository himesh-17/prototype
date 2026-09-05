import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  searchDocuments,
  getAllDocuments
} from '../services/api';

import { DocumentViewerModal } from '../components/common/DocumentViewerModal';
import { EmptyState } from '../components/common/EmptyState';

import {
  Search,
  FileText,
  Eye,
  ShieldCheck
} from 'lucide-react';

import '../styles/document-search.css';


const DOCUMENT_TYPES = [
  'FIR',
  'Witness Statement',
  'Forensic Report',
  'Evidence',
  'Judicial Order',
];

const classificationClass = (classification) => {
  switch (classification) {
    case 'Secret':
      return 'ns-docsearch-badge-secret';

    case 'Top Secret':
      return 'ns-docsearch-badge-topsecret';

    default:
      return 'ns-docsearch-badge-confidential';
  }
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


  const filteredResults = results.filter((doc) => {

    if (typeFilter === 'ALL') {
      return true;
    }

    return doc.document_type === typeFilter;

  });


  return (
    <div className="page ns-docsearch">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="page-header">

        <div className="page-heading">

          <span className="page-eyebrow">
            Evidence Repository
          </span>

          <h1 className="page-title">
            Document Search
          </h1>

          <p className="page-description">
            Search and inspect digitally secured case documents,
            reports, statements, and exhibits.
          </p>

        </div>

      </div>


      {/* =====================================================
          SEARCH CONTROLS
          ===================================================== */}

      <form
        onSubmit={handleSearch}
        className="ns-docsearch-toolbar"
      >

        <div className="ns-docsearch-search">

          <Search
            size={16}
            className="ns-docsearch-search-icon"
          />

          <input
            type="search"
            className="ns-docsearch-input"
            placeholder="Search by filename, document type, case number or SHA-256 hash"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

        </div>


        <select
          className="ns-docsearch-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter documents by type"
        >

          <option value="ALL">
            All document types
          </option>

          {DOCUMENT_TYPES.map((type) => (
            <option
              key={type}
              value={type}
            >
              {type}
            </option>
          ))}

        </select>


        <button
          type="submit"
          className="btn btn-primary ns-docsearch-button"
        >

          <Search size={15} />

          Search

        </button>

      </form>


      {/* =====================================================
          RESULTS
          ===================================================== */}

      <section className="ns-docsearch-results">

        {/* Results heading */}

        <div className="ns-docsearch-results-head">

          <div className="ns-docsearch-results-title">

            <FileText
              size={16}
              className="text-[var(--accent-strong)]"
            />

            <span>
              Document Registry
            </span>

          </div>


          {!loading && (
            <span className="ns-docsearch-results-count">
              {filteredResults.length} document
              {filteredResults.length !== 1 ? 's' : ''}
            </span>
          )}

        </div>


        {/* =================================================
            LOADING
            ================================================= */}

        {loading && (

          <div className="ns-docsearch-loading">

            <div
              className="spinner"
              style={{
                width: 25,
                height: 25
              }}
            />

            <span className="ns-docsearch-loading-text">
              Searching secure document repository...
            </span>

          </div>

        )}


        {/* =================================================
            EMPTY
            ================================================= */}

        {!loading && filteredResults.length === 0 && (

          <div className="ns-docsearch-empty">

            <EmptyState
              title="No documents found"
              description={
                query
                  ? `No documents matched "${query}". Try another search term or clear the filters.`
                  : 'No documents are currently available in the repository.'
              }
              secondaryLabel="Show All Documents"
              onSecondaryAction={() => {

                setQuery('');
                setTypeFilter('ALL');

                loadInitialDocs();

              }}
            />

          </div>

        )}


        {/* =================================================
            TABLE
            ================================================= */}

        {!loading && filteredResults.length > 0 && (

          <div className="ns-docsearch-table-wrap">

            <table className="ns-docsearch-table">

              <thead>

                <tr>

                  <th>
                    Document
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Case Reference
                  </th>

                  <th>
                    Classification
                  </th>

                  <th>
                    Version
                  </th>

                  <th>
                    OCR Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredResults.map((doc) => {

                  const classification =
                    doc.classification || 'Confidential';


                  return (

                    <tr
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      style={{ cursor: 'pointer' }}
                    >

                      {/* ---------------------------------
                          Document
                          --------------------------------- */}

                      <td>

                        <div className="ns-docsearch-document">

                          <div className="ns-docsearch-document-icon">

                            <FileText size={17} />

                          </div>


                          <div className="ns-docsearch-document-info">

                            <div className="ns-docsearch-document-name">

                              {doc.filename}

                            </div>


                            <div className="ns-docsearch-document-hash">

                              SHA-256:{' '}

                              {doc.sha256_hash
                                ? `${doc.sha256_hash.substring(0, 18)}…`
                                : 'Not available'}

                            </div>

                          </div>

                        </div>

                      </td>


                      {/* ---------------------------------
                          Type
                          --------------------------------- */}

                      <td>

                        <span className="ns-docsearch-badge ns-docsearch-badge-type">

                          {doc.document_type || 'Document'}

                        </span>

                      </td>


                      {/* ---------------------------------
                          Case
                          --------------------------------- */}

                      <td>

                        <span className="ns-docsearch-badge ns-docsearch-badge-case">

                          {doc.case_number ||
                            `CR-2026-00${doc.case_id || 1}`}

                        </span>

                      </td>


                      {/* ---------------------------------
                          Classification
                          --------------------------------- */}

                      <td>

                        <span
                          className={`ns-docsearch-badge ${classificationClass(
                            classification
                          )}`}
                        >

                          {classification}

                        </span>

                      </td>


                      {/* ---------------------------------
                          Version
                          --------------------------------- */}

                      <td>

                        <span className="ns-docsearch-version">

                          v{doc.current_version || 1}

                        </span>

                      </td>


                      {/* ---------------------------------
                          OCR
                          --------------------------------- */}

                      <td>

                        {doc.ocr_text ? (

                          <span className="ns-docsearch-ocr ns-docsearch-ocr-indexed">

                            <ShieldCheck size={13} />

                            Indexed

                          </span>

                        ) : (

                          <span className="ns-docsearch-ocr ns-docsearch-ocr-queued">

                            Queued

                          </span>

                        )}

                      </td>


                      {/* ---------------------------------
                          Action
                          --------------------------------- */}

                      <td>

                        <button
                          type="button"
                          className="ns-docsearch-view"
                          onClick={(e) => {

                            e.stopPropagation();

                            setSelectedDoc(doc);

                          }}
                        >

                          <Eye size={13} />

                          View

                        </button>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          DOCUMENT VIEWER
          ===================================================== */}

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