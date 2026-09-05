import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  Lock,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { uploadDocument } from '../../services/api';
import '../../styles/document.css';

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
  const [selectedCaseId, setSelectedCaseId] = useState(
    caseId || availableCases[0]?.id || 1
  );

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
      setError('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
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
      formData.append(
        'sign_digitally',
        signDigitally ? 'true' : 'false'
      );

      const targetId = caseId || selectedCaseId;

      await uploadDocument(targetId, formData);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="ns-upload-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-document-title"
    >
      <div
        className="ns-upload-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}
        <header className="ns-upload-header">
          <div className="ns-upload-header-left">
            <div className="ns-upload-header-icon">
              <FileText size={20} strokeWidth={1.8} />
            </div>

            <div>
              <div className="ns-upload-eyebrow">
                Secure Document Registry
              </div>

              <h2
                id="upload-document-title"
                className="ns-upload-title"
              >
                Upload Document
              </h2>

              <div className="ns-upload-case-reference">
                Case Reference:
                <strong>
                  {caseNumber || `CR-${selectedCaseId}`}
                </strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="ns-upload-close"
            onClick={onClose}
            aria-label="Close upload dialog"
          >
            <X size={19} strokeWidth={1.8} />
          </button>
        </header>

        {/* =====================================================
            FORM
        ====================================================== */}
        <form
          onSubmit={handleSubmit}
          className="ns-upload-form"
        >
          {/* Error */}
          {error && (
            <div className="ns-upload-error">
              <AlertCircle size={17} />

              <div>
                <strong>Upload failed</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* =================================================
              CASE SELECTION
          ================================================== */}
          {!caseId && availableCases.length > 0 && (
            <section className="ns-upload-section">
              <div className="ns-upload-field">
                <label htmlFor="upload-case">
                  Assign to Case
                </label>

                <div className="ns-upload-select-wrap">
                  <select
                    id="upload-case"
                    className="ns-upload-select"
                    value={selectedCaseId}
                    onChange={(e) =>
                      setSelectedCaseId(e.target.value)
                    }
                  >
                    {availableCases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.case_number} — {c.title}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    className="ns-upload-select-icon"
                    size={17}
                  />
                </div>
              </div>
            </section>
          )}

          {/* =================================================
              FILE UPLOAD
          ================================================== */}
          <section className="ns-upload-section">
            <div className="ns-upload-section-heading">
              <div>
                <h3>Document File</h3>
                <p>
                  Add the original evidence document to the
                  secure registry.
                </p>
              </div>

              <span className="ns-upload-required">
                Required
              </span>
            </div>

            <div
              className={`ns-upload-dropzone ${
                isDragging
                  ? 'is-dragging'
                  : file
                  ? 'has-file'
                  : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <input
                ref={fileInputRef}
                type="file"
                className="ns-upload-hidden-input"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.bin"
              />

              {file ? (
                <div className="ns-upload-selected-file">
                  <div className="ns-upload-file-icon">
                    <CheckCircle
                      size={21}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="ns-upload-file-details">
                    <strong>{file.name}</strong>

                    <span>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                      <span className="ns-upload-dot">•</span>
                      Ready for SHA-256 hashing
                    </span>
                  </div>

                  <span className="ns-upload-change">
                    Change file
                  </span>
                </div>
              ) : (
                <div className="ns-upload-empty">
                  <div className="ns-upload-upload-icon">
                    <Upload
                      size={22}
                      strokeWidth={1.7}
                    />
                  </div>

                  <div>
                    <strong>
                      Select a document or drag it here
                    </strong>

                    <span>
                      PDF, DOCX, images or scanned statements
                    </span>

                    <small>
                      Maximum file size: 50 MB
                    </small>
                  </div>

                  <button
                    type="button"
                    className="ns-upload-browse"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Browse files
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              DOCUMENT DETAILS
          ================================================== */}
          <section className="ns-upload-section">
            <div className="ns-upload-section-heading">
              <div>
                <h3>Document Classification</h3>
                <p>
                  Specify how this document should be registered.
                </p>
              </div>
            </div>

            <div className="ns-upload-fields-grid">
              {/* Document Type */}
              <div className="ns-upload-field">
                <label htmlFor="document-type">
                  Document Type
                </label>

                <div className="ns-upload-select-wrap">
                  <select
                    id="document-type"
                    className="ns-upload-select"
                    value={documentType}
                    onChange={(e) =>
                      setDocumentType(e.target.value)
                    }
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    className="ns-upload-select-icon"
                    size={17}
                  />
                </div>
              </div>

              {/* Classification */}
              <div className="ns-upload-field">
                <label htmlFor="classification">
                  Security Classification
                </label>

                <div className="ns-upload-select-wrap">
                  <select
                    id="classification"
                    className="ns-upload-select"
                    value={classification}
                    onChange={(e) =>
                      setClassification(e.target.value)
                    }
                  >
                    {CLASSIFICATIONS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    className="ns-upload-select-icon"
                    size={17}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              DIGITAL SIGNATURE
          ================================================== */}
          <section
            className={`ns-upload-signature ${
              signDigitally ? 'is-enabled' : ''
            }`}
          >
            <div className="ns-upload-signature-icon">
              <Shield
                size={19}
                strokeWidth={1.8}
              />
            </div>

            <div className="ns-upload-signature-content">
              <label
                htmlFor="sign-check"
                className="ns-upload-signature-title"
              >
                <span>
                  Digital Signature
                </span>

                <span className="ns-upload-recommended">
                  Recommended
                </span>
              </label>

              <p>
                Sign this document using the authenticated
                officer PKI token and anchor its SHA-256
                fingerprint to the secure ledger.
              </p>
            </div>

            <label className="ns-upload-switch">
              <input
                id="sign-check"
                type="checkbox"
                checked={signDigitally}
                onChange={(e) =>
                  setSignDigitally(e.target.checked)
                }
              />

              <span className="ns-upload-switch-track">
                <span className="ns-upload-switch-thumb" />
              </span>
            </label>
          </section>

          {/* =================================================
              FOOTER
          ================================================== */}
          <footer className="ns-upload-footer">
            <div className="ns-upload-footer-note">
              <Lock size={14} />
              <span>
                Document integrity will be verified after upload.
              </span>
            </div>

            <div className="ns-upload-actions">
              <button
                type="button"
                className="ns-upload-btn ns-upload-btn-secondary"
                onClick={onClose}
                disabled={uploading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="ns-upload-btn ns-upload-btn-primary"
                disabled={uploading || !file}
              >
                {uploading ? (
                  <>
                    <span className="ns-upload-spinner" />
                    Computing SHA-256...
                  </>
                ) : (
                  <>
                    <Lock
                      size={15}
                      strokeWidth={1.8}
                    />
                    Upload & Seal
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;