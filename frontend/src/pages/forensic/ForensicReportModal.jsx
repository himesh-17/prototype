import React, { useState } from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Key, Lock } from 'lucide-react';
import { submitForensicReport } from '../../services/api';

export const ForensicReportModal = ({ availableCases = [], availableAssets = [], onClose, onSuccess }) => {
  const [selectedCaseId, setSelectedCaseId] = useState(availableCases[0]?.id || 1);
  const [reportTitle, setReportTitle] = useState('CFSL Ballistics & Volatile Memory Analysis Report');
  const [labRef, setLabRef] = useState(`CFSL/CYB/2026/0${Math.floor(Math.random() * 900 + 100)}`);
  const [methodology, setMethodology] = useState('Volatility Framework 3.2, FTK Imager Write-Blocker v4.7, YARA Signature Analysis');
  const [findings, setFindings] = useState('Analysis of physical RAM dump confirmed injected rootkit shellcode matching Trojan.Banker.Hydra. Automated persistent callback beacon verified to IP 103.21.144.18.');
  const [conclusion, setConclusion] = useState('The seized digital evidence exhibits definite artifacts of unauthorized biometric database cloning and credential harvest. Cryptographic hashes match baseline bitstream image without modification.');
  const [digitalSignatureKey, setDigitalSignatureKey] = useState('ECDSA-P384-CFSL-0091 (Dr. Aarav Nambiar)');
  const [pin, setPin] = useState('••••••••');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const activeCase = availableCases.find(c => c.id === parseInt(selectedCaseId));
      await submitForensicReport({
        case_id: selectedCaseId,
        case_number: activeCase?.case_number || 'CR-2026-0891',
        filename: `CFSL_Report_${labRef.replace(/\//g, '_')}.pdf`,
        lab_ref: labRef,
        findings,
        conclusion,
        methodology,
        expert_name: 'Dr. Aarav Nambiar (PhD)',
        digital_signature_key: digitalSignatureKey,
        classification: 'Secret',
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit forensic report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ns-forensic-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="ns-forensic-modal max-w-2xl bg-[var(--bg-raised)] border border-[var(--border-default)] shadow-2xl rounded-lg overflow-hidden p-0 animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-inset)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-faint)] text-[var(--accent-strong)] border border-[var(--accent-faint)]">
              <FileText size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Submit Expert Forensic Examination Report
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] font-mono">
                Central Forensic Science Laboratory • Section 39 BSA Compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ns-forensic-close p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded-lg bg-[var(--danger-soft)] border border-[var(--danger-soft)] p-3 text-xs text-[var(--danger-base)]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Target Case Reference
              </label>
              <select
                className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2"
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
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Lab Examination Reference #
              </label>
              <input
                className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2 font-mono"
                value={labRef}
                onChange={e => setLabRef(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Report Title
            </label>
            <input
              className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2"
              value={reportTitle}
              onChange={e => setReportTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Forensic Tools & ISO/IEC 17025 Methodology Used
            </label>
            <input
              className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2 font-mono text-[var(--text-secondary)]"
              value={methodology}
              onChange={e => setMethodology(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Detailed Examination Findings & Indicators of Compromise (IoC)
            </label>
            <textarea
              className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2 min-h-[70px] font-mono text-[var(--text-secondary)]"
              value={findings}
              onChange={e => setFindings(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Formal Forensic Opinion & Conclusion (Sec 39 BSA / Sec 45 IEA)
            </label>
            <textarea
              className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2 min-h-[60px]"
              value={conclusion}
              onChange={e => setConclusion(e.target.value)}
              rows={2}
              required
            />
          </div>

          {/* Digital Signature Panel */}
           <div className="rounded-lg bg-[var(--bg-overlay)] p-4 border border-[var(--accent-soft)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-strong)] flex items-center gap-1.5 font-semibold">
                <Key size={14} /> Cryptographic Digital Signature Authorization
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--accent-faint)] text-[var(--accent-strong)] border border-[var(--accent-faint)]">
                HARDWARE TOKEN CONNECTED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-[var(--text-tertiary)] block text-[11px] mb-1">Hardware Certificate Key</label>
                <select
                  className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-1.5"
                  value={digitalSignatureKey}
                  onChange={e => setDigitalSignatureKey(e.target.value)}
                >
                  <option value="ECDSA-P384-CFSL-0091 (Dr. Aarav Nambiar)">ECDSA-P384-CFSL-0091 (Dr. Aarav Nambiar)</option>
                  <option value="RSA-4096-CFSL-DIRECTOR">RSA-4096-CFSL-DIRECTOR (Director CFSL)</option>
                </select>
              </div>

              <div>
                <label className="text-[var(--text-tertiary)] block text-[11px] mb-1">Crypto Token PIN / Passphrase</label>
                <input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-1.5 font-mono"
                  required
                />
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-tertiary)] pt-1">
              Upon signing, an immutable SHA-256 hash tree entry is committed to the Nyaya Setu blockchain ledger, preventing any repudiation or subsequent tampering.
            </p>
          </div>

          {/* Actions */}
          <div className="ns-forensic-footer">
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
              {submitting ? <span className="spinner" /> : <ShieldCheck size={14} />}
              <span>Digitally Sign & Submit to Registry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForensicReportModal;
