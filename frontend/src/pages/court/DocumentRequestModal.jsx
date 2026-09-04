import React, { useState } from 'react';
import { X, Send, AlertCircle, FileSearch, ShieldCheck } from 'lucide-react';
import { createCourtRequest } from '../../services/api';

const RECIPIENTS = [
  'Investigating Officer (IO Rajesh Deshmukh)',
  'Central Forensic Science Laboratory (Dr. Aarav Nambiar)',
  'National Cyber Crime Threat Analytics Unit (NCRB)',
  'Telecom Service Provider Nodal Officer',
  'Joint Commissioner of Police (Crime Branch)',
];

export const DocumentRequestModal = ({ availableCases = [], onClose, onSuccess }) => {
  const [caseNumber, setCaseNumber] = useState(availableCases[0]?.case_number || 'CR-2026-0891');
  const [requestType, setRequestType] = useState('');
  const [priority, setPriority] = useState('URGENT');
  const [requestedTo, setRequestedTo] = useState(RECIPIENTS[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestType.trim()) {
      setError('Please specify the document or evidence requirement.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createCourtRequest({
        case_number: caseNumber,
        request_type: requestType,
        priority: priority,
        requested_to: requestedTo,
        due_date: dueDate,
        notes: notes,
        requested_by: "Hon'ble Justice Meenakshi Sundaram",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit court document request');
    } finally {
      setSubmitting(false);
    }
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
              <FileSearch size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Issue Judicial Document Requisition
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] font-mono">
                Direct Investigation / Forensic Team to Furnish Records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-white hover:bg-white/5"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Case Reference
              </label>
              <select
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                value={caseNumber}
                onChange={e => setCaseNumber(e.target.value)}
              >
                {availableCases.map(c => (
                  <option key={c.id} value={c.case_number}>
                    {c.case_number} — {c.title.substring(0, 25)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Priority Level
              </label>
              <select
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="ROUTINE">Routine (Standard 14-day return)</option>
                <option value="URGENT">Urgent (48-hour compliance)</option>
                <option value="IMMEDIATE">Immediate Court Order (24-hour)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Document / Evidence Requirement Description
            </label>
            <input
              className="input bg-[#0e0e13] border-white/10 text-xs py-2"
              placeholder="e.g. Certified bitstream forensic image hash & decrypted transaction logs"
              value={requestType}
              onChange={e => setRequestType(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Direct To Agency / Officer
              </label>
              <select
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                value={requestedTo}
                onChange={e => setRequestedTo(e.target.value)}
              >
                {RECIPIENTS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Submission Deadline
              </label>
              <input
                type="date"
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Judicial Directions / Specific Points of Inquiry
            </label>
            <textarea
              className="input bg-[#0e0e13] border-white/10 text-xs py-2 min-h-[80px]"
              placeholder="Explain why these materials are material to the ongoing hearing..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Legal Notice */}
          <div className="rounded-lg bg-[var(--bg-overlay)] p-3 text-xs font-mono text-[var(--text-tertiary)] border border-white/[0.06] flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#00d4aa] shrink-0" />
            <span>Issued under Section 91 CrPC / Section 94 BNSS. Formal notice will be transmitted via encrypted inter-agency bus.</span>
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
              {submitting ? <span className="spinner" /> : <Send size={14} />}
              <span>Issue Formal Requisition</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentRequestModal;
