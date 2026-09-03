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
        className="modal max-w-xl bg-[#121217] border border-white/[0.12] shadow-2xl rounded-2xl overflow-hidden p-0 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#16161d] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-[#00d4aa] border border-teal-500/20">
              <Upload size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Upload Secure Document
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Target Case: {caseNumber || `Case #${selectedCaseId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
            aria-label="Close upload modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Case Selection if not pre-provided */}
          {!caseId && availableCases.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Assign To Case
              </label>
              <select
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
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
            className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? 'border-[#00d4aa] bg-teal-500/10'
                : file
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-white/10 bg-[#0d0d12] hover:border-white/20'
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
                  <div className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-200 block">
                      {file.name}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for cryptographic hashing
                    </span>
                  </div>
                  <span className="text-[11px] text-[#00d4aa] hover:underline mt-1">
                    Click to choose a different file
                  </span>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center border border-white/10">
                    <Upload size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-200 block">
                      Click to upload or drag & drop document
                    </span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">
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
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Document Type
              </label>
              <select
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
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
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Security Classification
              </label>
              <select
                className="input bg-[#0e0e13] border-white/10 text-xs py-2"
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
          <div className="rounded-xl bg-[#16161d] p-3.5 border border-white/[0.06] flex items-start gap-3">
            <input
              type="checkbox"
              id="sign-check"
              checked={signDigitally}
              onChange={(e) => setSignDigitally(e.target.checked)}
              className="mt-1 h-4 w-4 rounded bg-zinc-900 border-white/20 text-[#00d4aa] focus:ring-[#00d4aa]"
            />
            <label htmlFor="sign-check" className="text-xs text-zinc-300 cursor-pointer">
              <span className="font-medium text-zinc-100 flex items-center gap-1.5">
                <Shield size={13} className="text-[#00d4aa]" /> Digitally Sign with Officer PKI Token
              </span>
              <span className="text-zinc-500 block text-[11px] mt-0.5">
                Generates a SHA-256 fingerprint anchored to your authenticated hardware credentials.
              </span>
            </label>
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
