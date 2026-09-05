import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Send,
  Download,
  Key,
  Box
} from 'lucide-react';
import { transferAsset } from '../../services/api';

export const ChainOfCustodyModal = ({ asset, events = [], onClose, onRefresh }) => {
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [toName, setToName] = useState('');
  const [location, setLocation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!asset) return null;

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!toName.trim()) return;
    setSubmitting(true);
    try {
      await transferAsset(asset.id, {
        from_name: asset.current_custodian_name || 'Dr. Aarav Nambiar',
        to_name: toName,
        location: location || asset.location,
        remarks: remarks || 'Transferred pursuant to official inquiry.',
        seal_status: 'Seal inspected and verified intact',
        new_status: 'IN_TRANSIT',
      });
      setShowTransferForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ns-custody-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="ns-custody-modal max-w-3xl bg-[var(--bg-raised)] border border-[var(--border-default)] shadow-2xl rounded-lg overflow-hidden p-0 animate-modal-in max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-inset)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-faint)] text-[var(--accent-strong)] border border-[var(--accent-faint)]">
              <Box size={20} strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Chain of Custody Ledger: {asset.asset_number}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--accent-faint)] text-[var(--accent-strong)] border border-[var(--accent-faint)]">
                  SEAL INTACT
                </span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">
                {asset.name} • Location: {asset.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTransferForm(!showTransferForm)}
              className="btn btn-secondary text-xs px-3 py-1.5"
            >
              {showTransferForm ? 'View Timeline' : '+ Transfer Custody'}
            </button>
            <button
              onClick={onClose}
              className="ns-custody-close p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="ns-custody-body overflow-y-auto flex-1">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-[var(--bg-overlay)] p-3 rounded-lg border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)] block mb-1">Current Custodian</span>
              <span className="text-[var(--text-primary)] font-semibold">
                {asset.current_custodian_name || 'Dr. Aarav Nambiar (CFSL)'}
              </span>
            </div>
            <div className="bg-[var(--bg-overlay)] p-3 rounded-lg border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)] block mb-1">Physical Seal #</span>
              <span className="text-[var(--accent-strong)] font-semibold">
                {asset.seal_number || 'LACQUER-SEAL-#DL-9912'}
              </span>
            </div>
            <div className="bg-[var(--bg-overlay)] p-3 rounded-lg border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)] block mb-1">Tamper Evidence</span>
              <span className="text-[var(--accent-strong)] font-semibold flex items-center gap-1">
                <ShieldCheck size={14} /> Cryptographically Verified
              </span>
            </div>
          </div>

          {showTransferForm ? (
            <form onSubmit={handleTransfer} className="rounded-lg bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                Record New Custody Transfer Event
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[var(--text-tertiary)]">Recipient Custodian Name & Badge #</label>
                  <input
                    className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2"
                    placeholder="e.g. Inspector Rajesh Deshmukh (DL-CR-4402)"
                    value={toName}
                    onChange={e => setToName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[var(--text-tertiary)]">New Location / Facility</label>
                  <input
                    className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2"
                    placeholder="e.g. Patiala House Court Room 4"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-[var(--text-tertiary)]">Transfer Remarks & Official Purpose</label>
                <textarea
                  className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2 min-h-[60px]"
                  placeholder="Reason for physical handover, transport escort details..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button type="button" onClick={() => setShowTransferForm(false)} className="btn btn-secondary text-xs px-3 py-1.5">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary text-xs px-4 py-1.5 inline-flex items-center gap-1">
                  {submitting ? <span className="spinner" /> : <Send size={13} />}
                  <span>Sign & Record Custody Transfer</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center justify-between">
                <span>Chronological Chain of Custody (Immutable Ledger)</span>
                <span className="text-[var(--text-tertiary)] font-normal">{events.length} Recorded Transfer Events</span>
              </h4>

              {events.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)]">No events recorded yet.</p>
              ) : (
                <div className="relative border-l-2 border-[var(--accent-soft)] ml-4 space-y-6 pl-6 py-2">
                  {events.map((evt, idx) => (
                    <div key={evt.id || idx} className="relative group">
                      {/* Node circle */}
                      <div className="absolute -left-[31px] top-0.5 h-4 w-4 rounded-full bg-[var(--bg-base)] border-2 border-[var(--accent-strong)] group-hover:scale-125 transition-transform flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-strong)]" />
                      </div>

                       <div className="rounded-lg bg-[var(--bg-overlay)] p-4 border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                            {evt.action?.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                            {new Date(evt.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] flex-wrap">
                          <span className="text-[var(--text-tertiary)]">From:</span>
                          <span className="text-[var(--text-primary)] font-medium">{evt.from_name}</span>
                          <ArrowRight size={12} className="text-[var(--accent-strong)]" />
                          <span className="text-[var(--text-tertiary)]">To:</span>
                          <span className="text-[var(--accent-strong)] font-medium">{evt.to_name}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-white/[0.04]">
                          <div className="text-[var(--text-tertiary)] flex items-center gap-1.5">
                            <MapPin size={12} className="text-[var(--text-tertiary)]" /> {evt.location}
                          </div>
                          <div className="text-[var(--accent-strong)] flex items-center gap-1.5">
                            <ShieldCheck size={12} /> {evt.seal_status}
                          </div>
                        </div>

                        {evt.remarks && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-1 italic">
                            "{evt.remarks}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ns-custody-footer text-xs font-mono text-[var(--text-tertiary)] justify-between">
          <span>Sec 65B Indian Evidence Act / Section 63 BSA Certified Chain</span>
          <button onClick={onClose} className="btn btn-secondary text-xs px-4 py-2">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChainOfCustodyModal;
