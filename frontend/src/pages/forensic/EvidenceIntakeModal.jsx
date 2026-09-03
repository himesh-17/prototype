import React, { useState } from 'react';
import { X, Microscope, Box, CheckCircle, Shield, QrCode } from 'lucide-react';
import { createAsset } from '../../services/api';

const ASSET_TYPES = [
  'Digital Storage Media (SSD/HDD)',
  'Mobile Terminal / SIM Card',
  'Hardware Device / Embedded IC',
  'Network Telemetry Appliance',
  'Paper Document / Physical Seizure',
  'Cryptographic Hardware Token',
];

export const EvidenceIntakeModal = ({ availableCases = [], onClose, onSuccess }) => {
  const [selectedCaseId, setSelectedCaseId] = useState(availableCases[0]?.id || 1);
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState(ASSET_TYPES[0]);
  const [description, setDescription] = useState('');
  const [sealNumber, setSealNumber] = useState(`LACQUER-SEAL-#DL-${Math.floor(Math.random() * 9000 + 1000)}`);
  const [location, setLocation] = useState('CFSL Cyber Forensics Lab, Clean Room 2');
  const [escortOfficer, setEscortOfficer] = useState('Sub-Inspector Anil Kumar (Escort Officer)');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide evidence item name.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const activeCase = availableCases.find(c => c.id === parseInt(selectedCaseId));
      await createAsset(selectedCaseId, {
        name,
        asset_type: assetType,
        description: description || `Intake received from ${escortOfficer}. Seal verified intact.`,
        case_number: activeCase?.case_number || 'CR-2026-0891',
        location,
        seal_number: sealNumber,
        status: 'IN_LAB',
        current_custodian_name: 'Dr. Aarav Nambiar (CFSL)',
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to log evidence intake');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal max-w-xl bg-[#121217] border border-white/[0.12] shadow-2xl rounded-2xl overflow-hidden p-0 animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#16161d] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-[#00d4aa] border border-teal-500/20">
              <Microscope size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                CFSL Evidence Intake Registration
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Central Forensic Science Laboratory • Inward Malkhana Registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Case Reference
              </label>
              <select
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                value={selectedCaseId}
                onChange={e => setSelectedCaseId(e.target.value)}
              >
                {availableCases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.case_number} — {c.title.substring(0, 25)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Evidence Category
              </label>
              <select
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                value={assetType}
                onChange={e => setAssetType(e.target.value)}
              >
                {ASSET_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Evidence Exhibit Item Name & Model / Serial No.
            </label>
            <input
              className="input bg-[#0e0e13] border-white/10 text-xs py-2"
              placeholder="e.g. SanDisk 1TB MicroSD Card (Recovered from Accused Phone)"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Packaging Seal Number & Integrity
              </label>
              <input
                className="input bg-[#0e0e13] border-white/10 text-xs py-2 font-mono"
                value={sealNumber}
                onChange={e => setSealNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Handing-Over Escort Officer
              </label>
              <input
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                value={escortOfficer}
                onChange={e => setEscortOfficer(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Laboratory Storage Vault / Examination Station
            </label>
            <input
              className="input bg-[#0e0e13] border-white/10 text-xs py-2"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Initial Physical Inspection Notes
            </label>
            <textarea
              className="input bg-[#0e0e13] border-white/10 text-xs py-2 min-h-[70px]"
              placeholder="Note any physical damage, write-blocker connection, or initial hash state..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Chain of Custody Notice */}
          <div className="rounded-xl bg-[#16161d] p-3 text-xs font-mono text-zinc-300 border border-white/[0.06] flex items-center gap-2">
            <Shield size={16} className="text-[#00d4aa] shrink-0" />
            <span>Digital barcode & SHA-256 genesis block will be generated automatically for this evidence exhibit.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5"
            >
              {submitting ? <span className="spinner" /> : <Box size={14} />}
              <span>Register Intake & Generate Barcode</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvidenceIntakeModal;
