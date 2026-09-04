import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuditLogs, verifyAuditChain } from '../services/api';
import { HashChainModal } from '../components/common/HashChainModal';
import { EmptyState } from '../components/common/EmptyState';
import {
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  X,
  Copy,
  Check,
  Calendar,
  Layers,
  Key,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const actionColors = {
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
  LOGIN: 'info',
};

const ActionBadge = ({ action }) => {
  const variant = actionColors[action] || 'info';
  return (
    <span className={`badge badge-${variant}`}>
      {action.replace(/_/g, ' ')}
    </span>
  );
};

export const AuditTrail = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Filters
  const [actionFilter, setActionFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Log for Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await verifyAuditChain();
      setVerificationResult(res);
    } catch (err) {
      console.error(err);
      setVerificationResult({ valid: false, checked_versions: 0, invalid_version_ids: [] });
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCopyHash = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch =
      !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.user_name || log.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      log.entry_hash.toLowerCase().includes(search.toLowerCase());

    let matchesDate = true;
    if (dateRange !== 'ALL' && log.timestamp) {
      const logDate = new Date(log.timestamp).getTime();
      const now = Date.now();
      if (dateRange === 'TODAY') {
        matchesDate = (now - logDate) <= 86400000;
      } else if (dateRange === 'WEEK') {
        matchesDate = (now - logDate) <= 7 * 86400000;
      } else if (dateRange === 'MONTH') {
        matchesDate = (now - logDate) <= 30 * 86400000;
      }
    }

    return matchesAction && matchesSearch && matchesDate;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-heading">
          <span className="page-eyebrow">Administration</span>
          <h1 className="page-title">Audit trail</h1>
          <p className="page-description">
            Hash-chained log of document access, custody, and case events.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? (
              <>
                <span className="spinner" />
                Verifying…
              </>
            ) : (
              <>
                <RotateCcw size={15} />
                Verify chain
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div
          className={`rounded-lg p-4 border flex items-center justify-between gap-4 animate-fade-in ${
            verificationResult.valid
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} />
            <div className="text-sm">
              <div className="font-medium">
                {verificationResult.valid
                  ? 'Hash chain verified'
                  : 'Hash mismatch detected'}
              </div>
              <div className="text-[var(--text-secondary)] mt-1">
                Checked {verificationResult.checked_versions} blocks.
              </div>
            </div>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-[var(--text-tertiary)] hover:text-white p-1 rounded"
            aria-label="Dismiss verification notice"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="toolbar">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="search"
            className="pl-10"
            placeholder="Search action, user, or hash"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="ALL">All actions</option>
          <option value="UPLOAD_DOCUMENT">Upload document</option>
          <option value="VERIFY_DOCUMENT">Verify document</option>
          <option value="TRANSFER_ASSET">Transfer custody</option>
          <option value="LOG_ASSET">Log evidence</option>
          <option value="RECORD_JUDGMENT">Record judgment</option>
          <option value="CREATE_CASE">Create case</option>
          <option value="LOGIN">Login</option>
        </select>
        <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
          <option value="ALL">All time</option>
          <option value="TODAY">Last 24 hours</option>
          <option value="WEEK">Last 7 days</option>
          <option value="MONTH">Last 30 days</option>
        </select>
      </div>

      <div className="panel">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="spinner" style={{ width: 24, height: 24 }} />
            <span className="text-xs font-mono text-[var(--text-tertiary)]">Verifying cryptographic logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No audit events found"
              description="No audit log records matched your query or filter criteria."
              secondaryLabel="Reset Filters"
              onSecondaryAction={() => {
                setSearch('');
                setActionFilter('ALL');
                setDateRange('ALL');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '160px' }}>Timestamp</th>
                  <th style={{ width: '150px' }}>Action</th>
                  <th style={{ width: '110px' }}>Entity</th>
                  <th>Actor / Officer</th>
                  <th>Log Details</th>
                  <th style={{ width: '260px' }}>Hash Chain (Prev & Entry)</th>
                  <th style={{ width: '70px' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="is-clickable" onClick={() => setSelectedLog(log)}>
                    <td className="text-[var(--text-secondary)] whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td>
                      <ActionBadge action={log.action} />
                    </td>
                    <td>
                      <span className="text-[var(--text-primary)]">
                        {log.entity_type} #{log.entity_id}
                      </span>
                    </td>
                    <td>
                      <div className="row-meta">
                        {log.user_name || log.user?.name || 'System'}
                      </div>
                      <div className="row-sub">
                        {log.user_role || 'ADMIN'}
                      </div>
                    </td>
                    <td>
                      <div className="truncate max-w-xs">
                        {log.details || '—'}
                      </div>
                    </td>
                    <td>
                      <div className="inline-flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)]">
                        <span>
                          {log.entry_hash?.substring(0, 10)}…
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyHash(log.entry_hash, log.id);
                          }}
                          className="text-[var(--text-tertiary)] hover:text-teal-400"
                          title="Copy hash"
                        >
                          {copiedHash === log.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="btn btn-ghost btn-sm"
                        title="Inspect"
                      >
                        <ExternalLink size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hash Chain Inspector Modal */}
      {selectedLog && (
        <HashChainModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default AuditTrail;
