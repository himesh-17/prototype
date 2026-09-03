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
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal modal-wide max-w-3xl bg-[#121217] border border-white/[0.12] shadow-2xl rounded-2xl overflow-hidden p-0 animate-modal-in max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#16161d] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-[#00d4aa] border border-teal-500/20">
              <Box size={20} strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Chain of Custody Ledger: {asset.asset_number}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-teal-500/10 text-[#00d4aa] border border-teal-500/20">
                  SEAL INTACT
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
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
              className="modal-close p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-[#16161d] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-zinc-500 block mb-1">Current Custodian</span>
              <span className="text-zinc-100 font-semibold">
                {asset.current_custodian_name || 'Dr. Aarav Nambiar (CFSL)'}
              </span>
            </div>
            <div className="bg-[#16161d] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-zinc-500 block mb-1">Physical Seal #</span>
              <span className="text-[#00d4aa] font-semibold">
                {asset.seal_number || 'LACQUER-SEAL-#DL-9912'}
              </span>
            </div>
            <div className="bg-[#16161d] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-zinc-500 block mb-1">Tamper Evidence</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck size={14} /> Cryptographically Verified
              </span>
            </div>
          </div>

          {showTransferForm ? (
            <form onSubmit={handleTransfer} className="rounded-xl bg-[#16161d] p-5 border border-white/[0.08] space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Record New Custody Transfer Event
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Recipient Custodian Name & Badge #</label>
                  <input
                    className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                    placeholder="e.g. Inspector Rajesh Deshmukh (DL-CR-4402)"
                    value={toName}
                    onChange={e => setToName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">New Location / Facility</label>
                  <input
                    className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                    placeholder="e.g. Patiala House Court Room 4"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400">Transfer Remarks & Official Purpose</label>
                <textarea
                  className="input bg-[#0e0e13] border-white/10 text-xs py-2 min-h-[60px]"
                  placeholder="Reason for physical handover, transport escort details..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
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
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Chronological Chain of Custody (Immutable Ledger)</span>
                <span className="text-zinc-500 font-normal">{events.length} Recorded Transfer Events</span>
              </h4>

              {events.length === 0 ? (
                <p className="text-xs text-zinc-500">No events recorded yet.</p>
              ) : (
                <div className="relative border-l-2 border-teal-500/30 ml-4 space-y-6 pl-6 py-2">
                  {events.map((evt, idx) => (
                    <div key={evt.id || idx} className="relative group">
                      {/* Node circle */}
                      <div className="absolute -left-[31px] top-0.5 h-4 w-4 rounded-full bg-[#111116] border-2 border-[#00d4aa] group-hover:scale-125 transition-transform flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#00d4aa]" />
                      </div>

                      <div className="rounded-xl bg-[#16161d] p-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-mono font-semibold text-zinc-100">
                            {evt.action?.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400">
                            {new Date(evt.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 flex-wrap">
                          <span className="text-zinc-400">From:</span>
                          <span className="text-zinc-100 font-medium">{evt.from_name}</span>
                          <ArrowRight size={12} className="text-[#00d4aa]" />
                          <span className="text-zinc-400">To:</span>
                          <span className="text-[#00d4aa] font-medium">{evt.to_name}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-white/[0.04]">
                          <div className="text-zinc-400 flex items-center gap-1.5">
                            <MapPin size={12} className="text-zinc-500" /> {evt.location}
                          </div>
                          <div className="text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck size={12} /> {evt.seal_status}
                          </div>
                        </div>

                        {evt.remarks && (
                          <p className="text-xs text-zinc-400 mt-1 italic">
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
        <div className="border-t border-white/[0.08] bg-[#141419] px-6 py-3 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Sec 65B Indian Evidence Act / Section 63 BSA Certified Chain</span>
          <button onClick={onClose} className="btn btn-secondary text-xs px-4 py-1">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChainOfCustodyModal;
