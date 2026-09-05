import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, ArrowDown, Key, Link2 } from 'lucide-react';

export const HashChainModal = ({ log, onClose }) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!log) return null;

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="ns-audit-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="ns-audit-modal max-w-xl bg-[var(--bg-raised)] border border-[var(--border-default)] shadow-2xl rounded-lg overflow-hidden p-0 animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-inset)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-faint)] text-[var(--accent-strong)] border border-[var(--accent-soft)]">
              <Link2 size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Audit Chain Block #{log.id}
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] font-mono">
                Action: {log.action} • {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ns-audit-close p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
            aria-label="Close hash inspector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="ns-audit-body">
          <div className="rounded-lg bg-[var(--accent-faint)] border border-[var(--accent-soft)] p-3.5 flex items-center justify-between gap-3 text-xs font-mono text-[var(--accent-base)]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[var(--accent-strong)] shrink-0" />
              <span>Cryptographic Block Verified Against Root Merkle State</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-[var(--accent-strong)] font-semibold text-[11px]">
              VALID
            </span>
          </div>

          {/* Previous Hash Block */}
          <div className="rounded-lg bg-[var(--bg-inset)] border border-[var(--border-subtle)] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1">
                <Key size={12} className="text-[var(--text-tertiary)]" /> Previous Block Hash (Parent)
              </span>
              <button
                onClick={() => copyToClipboard(log.previous_hash || '0000000000000000000000000000000000000000000000000000000000000000', 'prev')}
                className="btn btn-ghost text-[11px] py-0.5 px-2 text-[var(--text-tertiary)] hover:text-[var(--accent-strong)] flex items-center gap-1"
              >
                {copiedField === 'prev' ? <Check size={12} className="text-[var(--accent-strong)]" /> : <Copy size={12} />}
                <span>{copiedField === 'prev' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-black/50 font-mono text-xs text-[var(--text-secondary)] break-all select-all border border-white/[0.04]">
              {log.previous_hash || '0000000000000000000000000000000000000000000000000000000000000000'}
            </div>
          </div>

          {/* Chain Link Indicator */}
          <div className="flex justify-center -my-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1c1c24] border border-[var(--border-default)] text-[var(--text-tertiary)]">
              <ArrowDown size={14} />
            </div>
          </div>

          {/* Current Entry Hash Block */}
          <div className="rounded-lg bg-[var(--bg-inset)] border border-[var(--accent-soft)] p-4 space-y-2 bg-gradient-to-b from-teal-500/[0.03] to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-strong)] flex items-center gap-1 font-semibold">
                <Key size={12} className="text-[var(--accent-strong)]" /> Current Block SHA-256 Hash
              </span>
              <button
                onClick={() => copyToClipboard(log.entry_hash, 'entry')}
                className="btn btn-ghost text-[11px] py-0.5 px-2 text-[var(--text-tertiary)] hover:text-[var(--accent-strong)] flex items-center gap-1"
              >
                {copiedField === 'entry' ? <Check size={12} className="text-[var(--accent-strong)]" /> : <Copy size={12} />}
                <span>{copiedField === 'entry' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-black/60 font-mono text-xs text-[var(--accent-strong)] break-all select-all border border-[var(--accent-soft)]">
              {log.entry_hash}
            </div>
          </div>

          {/* Payload Details */}
          <div className="rounded-lg bg-[var(--bg-overlay)] p-4 border border-[var(--border-subtle)] space-y-2 text-xs font-mono">
            <h4 className="text-[var(--text-tertiary)] uppercase tracking-wider text-[11px]">Block Payload Data</h4>
            <div className="grid grid-cols-2 gap-2 text-[var(--text-secondary)]">
              <div><span className="text-[var(--text-tertiary)]">Actor:</span> {log.user_name || log.user?.name || 'System'}</div>
              <div><span className="text-[var(--text-tertiary)]">Role:</span> {log.user_role || 'ADMIN'}</div>
              <div><span className="text-[var(--text-tertiary)]">Target:</span> {log.entity_type} #{log.entity_id}</div>
              <div><span className="text-[var(--text-tertiary)]">Action:</span> {log.action}</div>
            </div>
            {log.details && (
              <div className="mt-2 pt-2 border-t border-white/[0.04] text-[var(--text-secondary)] text-xs">
                <span className="text-[var(--text-tertiary)] block mb-0.5">Log Details:</span>
                {log.details}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-subtle)] bg-[#141419] px-6 py-3 flex justify-end">
          <button onClick={onClose} className="btn btn-secondary text-xs px-4 py-1.5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HashChainModal;
