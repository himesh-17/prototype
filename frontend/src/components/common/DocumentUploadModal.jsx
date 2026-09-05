import React, { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle, Shield, Lock } from 'lucide-react';
import { uploadDocument } from '../../services/api';

const DOCUMENT_TYPES = [
  'FIR',
  'Witness Statement',
  'Forensic Report',
  'Evidence',
  'Seizure Memo',
  'Charge Sheet',
  'Judicial Order',
];

const CLASSIFICATIONS = ['Confidential', 'Secret', 'Top Secret'];

export const DocumentUploadModal = ({
  caseId,
  caseNumber = 'CR-2026-0891',
  availableCases = [],
  onClose,
  onSuccess,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState(caseId || (availableCases[0]?.id || 1));
  const [documentType, setDocumentType] = useState('FIR');
  const [classification, setClassification] = useState('Confidential');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [signDigitally, setSignDigitally] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('classification', classification);
      formData.append('sign_digitally', signDigitally ? 'true' : 'false');

      const targetId = caseId || selectedCaseId;
      await uploadDocument(targetId, formData);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal max-w-xl bg-[var(--bg-raised)] border border-[var(--border-default)] shadow-2xl rounded-lg overflow-hidden p-0 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-inset)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-faint)] text-[var(--accent-strong)] border border-[var(--accent-soft)]">
              <Upload size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Upload Secure Document
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] font-mono">
                Target Case: {caseNumber || `Case #${selectedCaseId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
            aria-label="Close upload modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="rounded-lg bg-[var(--danger-soft)] border border-[var(--danger-soft)] p-3 text-xs text-[var(--danger-base)] flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Case Selection if not pre-provided */}
          {!caseId && availableCases.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Assign To Case
              </label>
              <select
                className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2"
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
              >
                {availableCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.case_number} — {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? 'border-[#00d4aa] bg-[var(--accent-faint)]'
                : file
                ? 'border-[var(--success-base)] bg-[var(--success-soft)]'
                : 'border-[var(--border-default)] bg-[var(--bg-base)] hover:border-[var(--border-focus)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.bin"
            />

            <div className="flex flex-col items-center justify-center gap-2">
              {file ? (
                <>
                  <div className="h-10 w-10 rounded-full bg-[var(--success-soft)] text-[var(--success-strong)] flex items-center justify-center border border-[var(--success-soft)]">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[var(--text-primary)] block">
                      {file.name}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for cryptographic hashing
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--accent-strong)] hover:underline mt-1">
                    Click to choose a different file
                  </span>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-[var(--bg-overlay)] text-[var(--text-tertiary)] flex items-center justify-center border border-[var(--border-default)]">
                    <Upload size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[var(--text-primary)] block">
                      Click to upload or drag & drop document
                    </span>
                    <span className="text-[11px] text-[var(--text-tertiary)] block mt-0.5">
                      PDF, DOCX, Images, Scanned statements up to 50 MB
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Document Type & Classification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Document Type
              </label>
              <select
                className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Security Classification
              </label>
              <select
                className="input bg-[var(--bg-inset)] border-[var(--border-default)] text-xs py-2"
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
              >
                {CLASSIFICATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Digital Signature Option */}
          <div className="rounded-lg bg-[var(--bg-overlay)] p-3.5 border border-[var(--border-subtle)] flex items-start gap-3">
            <input
              type="checkbox"
              id="sign-check"
              checked={signDigitally}
              onChange={(e) => setSignDigitally(e.target.checked)}
              className="mt-1 h-4 w-4 rounded bg-[var(--bg-card)] border-[var(--border-focus)] text-[var(--accent-strong)] focus:ring-[#00d4aa]"
            />
            <label htmlFor="sign-check" className="text-xs text-[var(--text-secondary)] cursor-pointer">
              <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                <Shield size={13} className="text-[var(--accent-strong)]" /> Digitally Sign with Officer PKI Token
              </span>
              <span className="text-[var(--text-tertiary)] block text-[11px] mt-0.5">
                Generates a SHA-256 fingerprint anchored to your authenticated hardware credentials.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="btn btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5"
            >
              {uploading ? (
                <>
                  <span className="spinner" />
                  <span>Computing SHA-256...</span>
                </>
              ) : (
                <>
                  <Lock size={13} />
                  <span>Upload & Seal to Ledger</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
