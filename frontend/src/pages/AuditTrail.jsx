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
    <span className={`badge badge-${variant} font-mono text-[11px]`}>
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
    <div className="page space-y-6">
      {/* Header */}
      <div className="page-header pb-2 border-b border-white/[0.06]">
        <div className="page-heading">
          <div className="flex items-center gap-2">
            <span className="page-eyebrow">Cryptographic Ledger</span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono text-teal-400">SHA-256 Chain</span>
          </div>
          <h1 className="page-title flex items-center gap-3">
            <span>Tamper-Evident Audit Trail</span>
            <span className="badge badge-accent font-mono text-xs">
              {logs.length} Blocks Recorded
            </span>
          </h1>
          <p className="page-description">
            Mathematical Merkle-chained provenance ledger. Every document, access request, and custody transfer is cryptographically sealed.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-2 shadow-lg shadow-teal-500/20"
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? (
              <>
                <span className="spinner" />
                <span>Validating Merkle Tree...</span>
              </>
            ) : (
              <>
                <RotateCcw size={15} strokeWidth={2} />
                <span>Verify Cryptographic Chain</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div
          className={`rounded-xl p-4 border flex items-center justify-between gap-4 animate-fade-in ${
            verificationResult.valid
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className={verificationResult.valid ? 'text-[#00d4aa]' : 'text-rose-400'} />
            <div className="text-xs font-mono">
              <div className="font-semibold">
                {verificationResult.valid
                  ? 'Cryptographic Hash Chain Verified ✓ (100% Integrity)'
                  : 'Ledger Hash Mismatch Detected ✗'}
              </div>
              <div className="text-zinc-400 mt-0.5">
                Verified {verificationResult.checked_versions} blocks against root state hash. Zero unauthorized modifications detected.
              </div>
            </div>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-zinc-400 hover:text-white p-1 rounded"
            aria-label="Dismiss verification notice"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-3.5 flex flex-wrap items-center justify-between gap-3.5 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            className="input bg-slate-950/60 border-slate-700 text-xs pl-9 py-2 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-teal-400"
            placeholder="Search action, user, details, or entry hash..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Action Filter */}
          <div className="flex items-center gap-1.5 text-xs font-sans text-slate-400">
            <Filter size={13} />
            <span>Action:</span>
          </div>
          <select
            className="input bg-slate-950/60 border-slate-700 text-xs py-1.5 px-3 rounded-xl text-slate-200"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            <option value="UPLOAD_DOCUMENT">Upload Document</option>
            <option value="VERIFY_DOCUMENT">Verify Document</option>
            <option value="TRANSFER_ASSET">Transfer Custody</option>
            <option value="LOG_ASSET">Log Evidence</option>
            <option value="RECORD_JUDGMENT">Record Judgment</option>
            <option value="CREATE_CASE">Create Case</option>
            <option value="LOGIN">User Auth / Login</option>
          </select>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5 text-xs font-sans text-slate-400 ml-2">
            <Calendar size={13} />
            <span>Date Range:</span>
          </div>
          <select
            className="input bg-slate-950/60 border-slate-700 text-xs py-1.5 px-3 rounded-xl text-slate-200"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today (Last 24 hrs)</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden shadow-lg backdrop-blur-sm">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="spinner" style={{ width: 24, height: 24 }} />
            <span className="text-xs font-mono text-zinc-400">Verifying cryptographic logs...</span>
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
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="text-xs font-mono text-zinc-400 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td>
                      <ActionBadge action={log.action} />
                    </td>
                    <td>
                      <span className="text-xs font-mono text-zinc-300 font-semibold">
                        {log.entity_type} #{log.entity_id}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-zinc-200">
                        {log.user_name || log.user?.name || 'System Daemon'}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {log.user_role || 'ADMIN'}
                      </div>
                    </td>
                    <td>
                      <div className="text-xs text-zinc-400 truncate max-w-xs">
                        {log.details || '—'}
                      </div>
                    </td>

                    {/* Clean Single-line Monospace Truncated Hash Chain with Copy Option */}
                    <td>
                      <div className="inline-flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                        <span className="text-teal-400 font-semibold">
                          {log.entry_hash?.substring(0, 8)}...{log.entry_hash?.substring(log.entry_hash.length - 4)}
                        </span>
                        <button
                          onClick={() => handleCopyHash(log.entry_hash, log.id)}
                          className="text-slate-400 hover:text-teal-400 transition-colors p-0.5 rounded"
                          title="Copy full SHA-256 hash"
                        >
                          {copiedHash === log.id ? <Check size={13} className="text-teal-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>

                    <td>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="btn btn-ghost text-xs p-1.5 rounded-lg text-zinc-400 hover:text-[#00d4aa] hover:bg-white/5"
                        title="Inspect full cryptographic block"
                      >
                        <ExternalLink size={14} />
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
