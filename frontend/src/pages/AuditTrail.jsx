import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAuditLogs,
  verifyAuditChain,
} from '../services/api';

import { HashChainModal } from '../components/common/HashChainModal';
import { EmptyState } from '../components/common/EmptyState';

import {
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Search,
  X,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Activity,
} from 'lucide-react';

import '../styles/AuditTrail.css';

const ACTION_LABELS = {
  UPLOAD_DOCUMENT: 'Upload document',
  UPLOAD_DOCUMENT_VERSION: 'Upload version',
  DOWNLOAD_DOCUMENT: 'Download document',
  VERIFY_DOCUMENT: 'Verify document',
  SEARCH_DOCUMENTS: 'Search documents',
  LOG_ASSET: 'Log evidence',
  TRANSFER_ASSET: 'Transfer custody',
  CREATE_CASE: 'Create case',
  UPDATE_CASE: 'Update case',
  RECORD_JUDGMENT: 'Record judgment',
  LOGIN: 'Login',
};


const ACTION_VARIANTS = {
  UPLOAD_DOCUMENT: 'accent',
  UPLOAD_DOCUMENT_VERSION: 'accent',
  DOWNLOAD_DOCUMENT: 'info',
  VERIFY_DOCUMENT: 'accent',
  SEARCH_DOCUMENTS: 'info',
  LOG_ASSET: 'warn',
  TRANSFER_ASSET: 'warn',
  CREATE_CASE: 'info',
  UPDATE_CASE: 'info',
  RECORD_JUDGMENT: 'accent',
  LOGIN: 'neutral',
};


const ActionBadge = ({ action }) => {
  const variant = ACTION_VARIANTS[action] || 'neutral';

  const label =
    ACTION_LABELS[action] ||
    action?.replace(/_/g, ' ') ||
    'Unknown action';

  return (
    <span className={`audit-action audit-action-${variant}`}>
      <span className="audit-action-dot" />
      {label}
    </span>
  );
};


const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


const getDateBoundary = (range) => {
  const now = new Date();

  if (range === 'TODAY') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  }

  if (range === 'WEEK') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return start.getTime();
  }

  if (range === 'MONTH') {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return start.getTime();
  }

  return null;
};


const truncateHash = (hash) => {
  if (!hash) return '—';

  if (hash.length <= 18) {
    return hash;
  }

  return `${hash.substring(0, 10)}…${hash.substring(hash.length - 6)}`;
};


export const AuditTrail = () => {
  const { user } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState(null);

  const [actionFilter, setActionFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');
  const [search, setSearch] = useState('');

  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);


  const fetchLogs = async () => {
    setLoading(true);

    try {
      const data = await getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchLogs();
  }, []);


  const handleVerify = async () => {
    setVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyAuditChain();

      setVerificationResult({
        valid: Boolean(result?.valid),
        checked_versions:
          result?.checked_versions ?? 0,
        invalid_version_ids:
          result?.invalid_version_ids ?? [],
      });
    } catch (err) {
      console.error('Audit chain verification failed:', err);

      setVerificationResult({
        valid: false,
        checked_versions: 0,
        invalid_version_ids: [],
        error: true,
      });
    } finally {
      setVerifying(false);
    }
  };


  const handleCopyHash = async (hash, id) => {
    if (!hash) return;

    try {
      await navigator.clipboard.writeText(hash);

      setCopiedHash(id);

      window.setTimeout(() => {
        setCopiedHash(null);
      }, 1800);

    } catch (err) {
      console.error('Unable to copy hash:', err);
    }
  };


  const resetFilters = () => {
    setSearch('');
    setActionFilter('ALL');
    setDateRange('ALL');
  };


  const filteredLogs = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const boundary =
      getDateBoundary(dateRange);

    return logs.filter((log) => {

      const action =
        log.action || '';

      const details =
        log.details || '';

      const userName =
        log.user_name ||
        log.user?.name ||
        'System';

      const role =
        log.user_role ||
        'ADMIN';

      const hash =
        log.entry_hash ||
        '';

      const entityType =
        log.entity_type ||
        '';

      const entityId =
        log.entity_id?.toString() ||
        '';


      const matchesAction =
        actionFilter === 'ALL' ||
        action === actionFilter;


      const searchableText = [
        action,
        ACTION_LABELS[action] || '',
        details,
        userName,
        role,
        hash,
        entityType,
        entityId,
      ]
        .join(' ')
        .toLowerCase();


      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);


      let matchesDate = true;

      if (boundary !== null && log.timestamp) {
        const timestamp =
          new Date(log.timestamp).getTime();

        matchesDate =
          !Number.isNaN(timestamp) &&
          timestamp >= boundary;
      }


      return (
        matchesAction &&
        matchesSearch &&
        matchesDate
      );
    });

  }, [
    logs,
    search,
    actionFilter,
    dateRange,
  ]);


  return (
    <div className="page audit-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-header">

        <div className="page-heading">

          <span className="page-eyebrow">
            Administration
          </span>

          <h1 className="page-title">
            Audit trail
          </h1>

          <p className="page-description">
            Immutable record of document access, custody,
            authentication and case activity.
          </p>

        </div>


        <div className="page-actions">

          <button
            className="btn btn-primary audit-verify-button"
            onClick={handleVerify}
            disabled={verifying}
          >

            {verifying ? (
              <>
                <span className="spinner" />
                Verifying
              </>
            ) : (
              <>
                <ShieldCheck size={15} />
                Verify chain
              </>
            )}

          </button>

        </div>

      </div>


      {/* =====================================================
          VERIFICATION STATUS
      ===================================================== */}

      {verificationResult && (

        <div
          className={`audit-verification ${
            verificationResult.valid
              ? 'audit-verification-valid'
              : 'audit-verification-invalid'
          }`}
        >

          <div className="audit-verification-main">

            <div className="audit-verification-icon">

              {verificationResult.valid ? (
                <ShieldCheck size={18} />
              ) : (
                <ShieldAlert size={18} />
              )}

            </div>


            <div>

              <div className="audit-verification-title">

                {verificationResult.valid
                  ? 'Audit chain verified'
                  : 'Audit chain integrity failure'}

              </div>

              <div className="audit-verification-text">

                {verificationResult.valid
                  ? `All ${verificationResult.checked_versions} recorded blocks passed verification.`
                  : verificationResult.error
                    ? 'The audit chain could not be verified.'
                    : `${verificationResult.invalid_version_ids?.length || 0} invalid block(s) detected.`}

              </div>

            </div>

          </div>


          <button
            type="button"
            className="audit-dismiss"
            onClick={() =>
              setVerificationResult(null)
            }
            aria-label="Dismiss verification result"
          >
            <X size={15} />
          </button>

        </div>

      )}


      {/* =====================================================
          AUDIT SUMMARY
      ===================================================== */}

      {!loading && logs.length > 0 && (

        <div className="audit-summary">

          <div className="audit-summary-item">

            <Activity size={15} />

            <div>
              <span className="audit-summary-label">
                Recorded events
              </span>

              <strong>
                {logs.length.toLocaleString('en-IN')}
              </strong>
            </div>

          </div>


          <div className="audit-summary-divider" />


          <div className="audit-summary-item">

            <ShieldCheck size={15} />

            <div>
              <span className="audit-summary-label">
                Visible records
              </span>

              <strong>
                {filteredLogs.length.toLocaleString('en-IN')}
              </strong>
            </div>

          </div>


          <div className="audit-summary-spacer" />


          {search || actionFilter !== 'ALL' || dateRange !== 'ALL' ? (

            <button
              type="button"
              className="audit-reset-button"
              onClick={resetFilters}
            >
              <RotateCcw size={13} />
              Reset filters
            </button>

          ) : null}

        </div>

      )}


      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div className="audit-toolbar">

        <div className="audit-search">

          <Search size={15} />

          <input
            type="search"
            placeholder="Search action, officer, entity or hash"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (

            <button
              type="button"
              className="audit-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>

          )}

        </div>


        <div className="audit-filter">

          <span>Action</span>

          <div className="audit-select">

            <select
              value={actionFilter}
              onChange={(e) =>
                setActionFilter(e.target.value)
              }
            >

              <option value="ALL">
                All actions
              </option>

              <option value="UPLOAD_DOCUMENT">
                Upload document
              </option>

              <option value="VERIFY_DOCUMENT">
                Verify document
              </option>

              <option value="TRANSFER_ASSET">
                Transfer custody
              </option>

              <option value="LOG_ASSET">
                Log evidence
              </option>

              <option value="RECORD_JUDGMENT">
                Record judgment
              </option>

              <option value="CREATE_CASE">
                Create case
              </option>

              <option value="LOGIN">
                Login
              </option>

            </select>

            <ChevronDown size={13} />

          </div>

        </div>


        <div className="audit-filter">

          <span>Period</span>

          <div className="audit-select">

            <select
              value={dateRange}
              onChange={(e) =>
                setDateRange(e.target.value)
              }
            >

              <option value="ALL">
                All time
              </option>

              <option value="TODAY">
                Today
              </option>

              <option value="WEEK">
                Last 7 days
              </option>

              <option value="MONTH">
                Last 30 days
              </option>

            </select>

            <ChevronDown size={13} />

          </div>

        </div>

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="audit-table-panel">

        {loading ? (

          <div className="audit-loading">

            <span className="spinner" />

            <div>
              <strong>
                Loading audit trail
              </strong>

              <span>
                Retrieving cryptographically recorded events...
              </span>
            </div>

          </div>

        ) : filteredLogs.length === 0 ? (

          <div className="audit-empty">

            <EmptyState
              title="No audit events found"
              description={
                search ||
                actionFilter !== 'ALL' ||
                dateRange !== 'ALL'
                  ? 'No audit records match the current search or filter criteria.'
                  : 'There are no audit records available.'
              }
              secondaryLabel={
                search ||
                actionFilter !== 'ALL' ||
                dateRange !== 'ALL'
                  ? 'Reset filters'
                  : undefined
              }
              onSecondaryAction={resetFilters}
            />

          </div>

        ) : (

          <div className="audit-table-wrapper">

            <table className="table audit-table">

              <thead>

                <tr>

                  <th className="audit-col-time">
                    Timestamp
                  </th>

                  <th className="audit-col-action">
                    Action
                  </th>

                  <th className="audit-col-entity">
                    Entity
                  </th>

                  <th className="audit-col-actor">
                    Actor
                  </th>

                  <th>
                    Event details
                  </th>

                  <th className="audit-col-hash">
                    Entry hash
                  </th>

                  <th className="audit-col-inspect">
                    Inspect
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredLogs.map((log) => {

                  const actor =
                    log.user_name ||
                    log.user?.name ||
                    'System';

                  const role =
                    log.user_role ||
                    'ADMIN';

                  const hash =
                    log.entry_hash || '';

                  return (

                    <tr
                      key={log.id}
                      className="audit-row"
                      onClick={() =>
                        setSelectedLog(log)
                      }
                    >

                      {/* Timestamp */}

                      <td className="audit-time">

                        <span>
                          {formatDate(log.timestamp)}
                        </span>

                      </td>


                      {/* Action */}

                      <td>
                        <ActionBadge
                          action={log.action}
                        />
                      </td>


                      {/* Entity */}

                      <td>

                        <div className="audit-entity">

                          <strong>
                            {log.entity_type || '—'}
                          </strong>

                          {log.entity_id !== null &&
                          log.entity_id !== undefined ? (
                            <span>
                              #{log.entity_id}
                            </span>
                          ) : null}

                        </div>

                      </td>


                      {/* Actor */}

                      <td>

                        <div className="audit-actor">

                          <div className="audit-avatar">
                            {actor
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {actor}
                            </strong>

                            <span>
                              {role}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* Details */}

                      <td>

                        <div className="audit-details">
                          {log.details || 'No additional details'}
                        </div>

                      </td>


                      {/* Hash */}

                      <td>

                        <div className="audit-hash">

                          <span title={hash}>
                            {truncateHash(hash)}
                          </span>

                          {hash && (

                            <button
                              type="button"
                              className="audit-copy"
                              onClick={(e) => {
                                e.stopPropagation();

                                handleCopyHash(
                                  hash,
                                  log.id
                                );
                              }}
                              title="Copy entry hash"
                            >

                              {copiedHash === log.id ? (
                                <Check size={13} />
                              ) : (
                                <Copy size={13} />
                              )}

                            </button>

                          )}

                        </div>

                      </td>


                      {/* Inspect */}

                      <td>

                        <button
                          type="button"
                          className="audit-inspect"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          aria-label="Inspect audit event"
                          title="Inspect audit event"
                        >
                          <ExternalLink size={14} />
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
          HASH CHAIN MODAL
      ===================================================== */}

      {selectedLog && (

        <HashChainModal
          log={selectedLog}
          onClose={() =>
            setSelectedLog(null)
          }
        />

      )}

    </div>
  );
};


export default AuditTrail;