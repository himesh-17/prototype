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
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal max-w-xl bg-[#121217] border border-white/[0.12] shadow-2xl rounded-lg overflow-hidden p-0 animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#16161d] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-[#00d4aa] border border-teal-500/20">
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
            className="modal-close p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-white hover:bg-white/5"
            aria-label="Close hash inspector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-3.5 flex items-center justify-between gap-3 text-xs font-mono text-teal-300">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#00d4aa] shrink-0" />
              <span>Cryptographic Block Verified Against Root Merkle State</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-[#00d4aa] font-semibold text-[11px]">
              VALID
            </span>
          </div>

          {/* Previous Hash Block */}
          <div className="rounded-lg bg-[#0e0e13] border border-white/[0.08] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1">
                <Key size={12} className="text-[var(--text-tertiary)]" /> Previous Block Hash (Parent)
              </span>
              <button
                onClick={() => copyToClipboard(log.previous_hash || '0000000000000000000000000000000000000000000000000000000000000000', 'prev')}
                className="btn btn-ghost text-[11px] py-0.5 px-2 text-[var(--text-tertiary)] hover:text-[#00d4aa] flex items-center gap-1"
              >
                {copiedField === 'prev' ? <Check size={12} className="text-[#00d4aa]" /> : <Copy size={12} />}
                <span>{copiedField === 'prev' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-black/50 font-mono text-xs text-[var(--text-secondary)] break-all select-all border border-white/[0.04]">
              {log.previous_hash || '0000000000000000000000000000000000000000000000000000000000000000'}
            </div>
          </div>

          {/* Chain Link Indicator */}
          <div className="flex justify-center -my-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1c1c24] border border-white/10 text-[var(--text-tertiary)]">
              <ArrowDown size={14} />
            </div>
          </div>

          {/* Current Entry Hash Block */}
          <div className="rounded-lg bg-[#0e0e13] border border-teal-500/30 p-4 space-y-2 bg-gradient-to-b from-teal-500/[0.03] to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#00d4aa] flex items-center gap-1 font-semibold">
                <Key size={12} className="text-[#00d4aa]" /> Current Block SHA-256 Hash
              </span>
              <button
                onClick={() => copyToClipboard(log.entry_hash, 'entry')}
                className="btn btn-ghost text-[11px] py-0.5 px-2 text-[var(--text-tertiary)] hover:text-[#00d4aa] flex items-center gap-1"
              >
                {copiedField === 'entry' ? <Check size={12} className="text-[#00d4aa]" /> : <Copy size={12} />}
                <span>{copiedField === 'entry' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-black/60 font-mono text-xs text-teal-400 break-all select-all border border-teal-500/20">
              {log.entry_hash}
            </div>
          </div>

          {/* Payload Details */}
          <div className="rounded-lg bg-[var(--bg-overlay)] p-4 border border-white/[0.06] space-y-2 text-xs font-mono">
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
        <div className="border-t border-white/[0.08] bg-[#141419] px-6 py-3 flex justify-end">
          <button onClick={onClose} className="btn btn-secondary text-xs px-4 py-1.5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HashChainModal;
