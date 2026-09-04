import React, { useState } from 'react';
import { X, Scale, Upload, CheckCircle2, Shield, Calendar } from 'lucide-react';
import { uploadCourtOrder } from '../../services/api';

const ORDER_TYPES = [
  'Bail Application Order',
  'Framing of Charges',
  'Judicial Remand Order',
  'Evidence Production Warrant',
  'Summons to Witness / Expert',
  'Final Judgment & Order',
];

export const JudgmentUploadModal = ({ caseId, caseNumber, availableCases = [], onClose, onSuccess }) => {
  const [selectedCaseId, setSelectedCaseId] = useState(caseId || (availableCases[0]?.id || 1));
  const [orderType, setOrderType] = useState('Bail Application Order');
  const [hearingDate, setHearingDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [judgeName, setJudgeName] = useState("Hon'ble Justice Meenakshi Sundaram");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError('Please provide operative order text or judicial summary.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const activeCase = availableCases.find(c => c.id === parseInt(selectedCaseId));
      await uploadCourtOrder(selectedCaseId, {
        case_number: caseNumber || activeCase?.case_number || 'CR-2026-0891',
        filename: file ? file.name : `Court_Order_${orderType.replace(/\s+/g, '_')}.pdf`,
        order_type: orderType,
        hearing_date: hearingDate,
        remarks: remarks,
        judge_name: judgeName,
        classification: 'Confidential',
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload judicial order');
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
              <Scale size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Upload Judicial Order / Judgment
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] font-mono">
                Special CBI & Cyber Court • Digital Registry
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
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Target Case
              </label>
              <select
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                value={selectedCaseId}
                onChange={e => setSelectedCaseId(e.target.value)}
              >
                {availableCases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.case_number} — {c.title.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Order Type
              </label>
              <select
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                value={orderType}
                onChange={e => setOrderType(e.target.value)}
              >
                {ORDER_TYPES.map(ot => (
                  <option key={ot} value={ot}>{ot}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Presiding Judge / Bench
              </label>
              <input
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                value={judgeName}
                onChange={e => setJudgeName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Hearing / Pronouncement Date
              </label>
              <input
                type="date"
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
                value={hearingDate}
                onChange={e => setHearingDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Operative Order Text / Judgment Summary
            </label>
            <textarea
              className="input bg-[#0e0e13] border-white/10 text-xs py-2 min-h-[90px]"
              placeholder="State operative directions, bail conditions, or trial schedule..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Upload Signed Order Copy (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={e => setFile(e.target.files[0])}
              className="input bg-[#0e0e13] border-white/10 text-xs py-1.5"
            />
            <p className="text-[11px] text-[var(--text-tertiary)]">
              If no file is attached, an official digital decree will be synthesized and cryptographically sealed.
            </p>
          </div>

          {/* Judicial Security Note */}
          <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-3 text-xs font-mono text-teal-300 flex items-center gap-2">
            <Shield size={16} className="shrink-0 text-[#00d4aa]" />
            <span>Cryptographic Judicial Seal [JUDICIAL-SEAL-PHC-2026] will be permanently affixed.</span>
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
              {submitting ? <span className="spinner" /> : <Scale size={14} />}
              <span>Seal & Pronounce Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JudgmentUploadModal;
