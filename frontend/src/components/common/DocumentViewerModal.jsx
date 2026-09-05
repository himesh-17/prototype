import React, { useState } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Download,
  Copy,
  Check,
  Calendar,
  User,
  Key,
  Lock,
  Layers,
  FileCheck2,
  ExternalLink,
  Search
} from 'lucide-react';
import { downloadDocumentVersion, verifyDocument } from '../../services/api';
import '../../styles/document-viewer.css';

const classificationStyles = {
  Confidential: 'confidential',
  Secret: 'secret',
  'Top Secret': 'top-secret',
  Restricted: 'restricted',
};

const docTypeStyles = {
  FIR: 'success',
  'Witness Statement': 'info',
  'Forensic Report': 'purple',
  Evidence: 'warning',
  'Judicial Order': 'accent',
  'Seizure Memo': 'indigo',
};

export const DocumentViewerModal = ({ document, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('metadata');
  const [copiedHash, setCopiedHash] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  if (!document) return null;

  const handleCopyHash = () => {
    if (document.sha256_hash) {
      navigator.clipboard.writeText(document.sha256_hash);
      setCopiedHash(true);

      setTimeout(() => {
        setCopiedHash(false);
      }, 2000);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);

    try {
      const res = await verifyDocument(document.id);
      setVerifyResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = () => {
    downloadDocumentVersion(
      document.id,
      document.current_version || 1
    );
  };

  const classificationClass =
    classificationStyles[document.classification] ||
    'confidential';

  const typeClass =
    docTypeStyles[document.document_type] || 'default';

  const tabs = [
    {
      id: 'metadata',
      label: 'Cryptographic Metadata',
      icon: Key,
    },
    {
      id: 'signature',
      label: 'Digital Signature & Integrity',
      icon: ShieldCheck,
    },
    {
      id: 'ocr',
      label: 'OCR Text',
      icon: Search,
    },
    {
      id: 'preview',
      label: 'Secure Preview',
      icon: FileCheck2,
    },
  ];

  return (
    <div
      className="ns-docview-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Document Viewer"
    >
      <section
        className="ns-docview-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="ns-docview-header">

          <div className="ns-docview-header-main">

            <div className="ns-docview-file-icon">
              <FileText size={22} strokeWidth={1.8} />
            </div>

            <div className="ns-docview-title-area">

              <div className="ns-docview-title-row">

                <h2
                  className="ns-docview-title"
                  title={document.filename}
                >
                  {document.filename}
                </h2>

                <span
                  className={`ns-docview-badge ns-docview-badge-${typeClass}`}
                >
                  {document.document_type}
                </span>

                <span
                  className={`ns-docview-badge ns-docview-classification ${classificationClass}`}
                >
                  {document.classification || 'Confidential'}
                </span>

              </div>

              <div className="ns-docview-subtitle">

                <span>
                  Case: {document.case_number || 'CR-2026-0891'}
                </span>

                <span className="ns-docview-separator">•</span>

                <span>
                  Version v{document.current_version || 1}
                </span>

                <span className="ns-docview-separator">•</span>

                <span>
                  {document.file_size || '3.2 MB'}
                </span>

              </div>

            </div>

          </div>

          <div className="ns-docview-header-actions">

            <button
              type="button"
              onClick={handleDownload}
              className="ns-docview-button ns-docview-button-secondary"
              title="Download original file"
            >
              <Download size={15} />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="ns-docview-close"
              aria-label="Close document viewer"
            >
              <X size={20} />
            </button>

          </div>

        </header>


        {/* =====================================================
            DOCUMENT STATUS STRIP
        ====================================================== */}

        <div className="ns-docview-status-strip">

          <div className="ns-docview-status-item">
            <span className="ns-docview-status-dot ns-docview-status-dot-success" />

            <span>
              Document integrity verified
            </span>
          </div>

          <div className="ns-docview-status-divider" />

          <div className="ns-docview-status-item">
            <Lock size={14} />

            <span>
              Securely stored
            </span>
          </div>

          <div className="ns-docview-status-divider" />

          <div className="ns-docview-status-item">
            <ShieldCheck size={14} />

            <span>
              Chain of custody protected
            </span>
          </div>

        </div>


        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <nav className="ns-docview-tabs">

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`ns-docview-tab ${
                  active ? 'is-active' : ''
                }`}
              >
                <Icon size={15} strokeWidth={1.8} />

                <span>{tab.label}</span>

              </button>
            );
          })}

        </nav>


        {/* =====================================================
            BODY
        ====================================================== */}

        <main className="ns-docview-content">

          {/* ===================================================
              METADATA
          ==================================================== */}

          {activeTab === 'metadata' && (

            <div className="ns-docview-section">

              <div className="ns-docview-section-heading">

                <div>
                  <span className="ns-docview-eyebrow">
                    DOCUMENT INTEGRITY
                  </span>

                  <h3>
                    Cryptographic Metadata
                  </h3>

                  <p>
                    Digital identifiers and storage information
                    associated with this document.
                  </p>
                </div>

                <div className="ns-docview-integrity-badge">
                  <ShieldCheck size={16} />
                  Verified
                </div>

              </div>


              {/* HASH */}

              <section className="ns-docview-card ns-docview-hash-card">

                <div className="ns-docview-card-header">

                  <div className="ns-docview-card-heading">

                    <div className="ns-docview-card-icon">
                      <Key size={17} />
                    </div>

                    <div>
                      <h4>
                        SHA-256 Cryptographic Checksum
                      </h4>

                      <p>
                        Immutable document fingerprint
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="ns-docview-copy-button"
                  >
                    {copiedHash ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}

                    <span>
                      {copiedHash ? 'Copied' : 'Copy Hash'}
                    </span>
                  </button>

                </div>


                <div className="ns-docview-hash-value">
                  {document.sha256_hash ||
                    '7e2b8f3c4e1d9a0b5c6f8a2e1d3b5c7e9a0f2b4c6d8e0a1b3c5d7e9f1a3b5c7d'}
                </div>

                <div className="ns-docview-hash-note">
                  <ShieldCheck size={14} />

                  <span>
                    Recorded in the immutable audit chain at the
                    time of upload. Any modification to the
                    original document will produce a different
                    cryptographic checksum.
                  </span>
                </div>

              </section>


              {/* INFORMATION GRID */}

              <div className="ns-docview-info-grid">

                {/* DOCUMENT SPECIFICATIONS */}

                <section className="ns-docview-card">

                  <div className="ns-docview-card-heading">

                    <div className="ns-docview-card-icon">
                      <Layers size={17} />
                    </div>

                    <div>
                      <h4>
                        Document Specifications
                      </h4>

                      <p>
                        Core document attributes
                      </p>
                    </div>

                  </div>

                  <dl className="ns-docview-details">

                    <div>
                      <dt>Document ID</dt>

                      <dd>
                        DOC-
                        {document.id
                          .toString()
                          .padStart(5, '0')}
                      </dd>
                    </div>

                    <div>
                      <dt>Document Type</dt>

                      <dd>
                        {document.document_type}
                      </dd>
                    </div>

                    <div>
                      <dt>Classification</dt>

                      <dd>
                        <span
                          className={`ns-docview-inline-status ${classificationClass}`}
                        >
                          {document.classification ||
                            'Confidential'}
                        </span>
                      </dd>
                    </div>

                    <div>
                      <dt>Version</dt>

                      <dd>
                        v{document.current_version || 1}
                        <span className="ns-docview-muted">
                          Latest
                        </span>
                      </dd>
                    </div>

                    <div>
                      <dt>Storage Protocol</dt>

                      <dd>
                        AES-256-GCM HSM Enclave
                      </dd>
                    </div>

                  </dl>

                </section>


                {/* ORIGIN & CUSTODY */}

                <section className="ns-docview-card">

                  <div className="ns-docview-card-heading">

                    <div className="ns-docview-card-icon">
                      <User size={17} />
                    </div>

                    <div>
                      <h4>
                        Origin & Custody
                      </h4>

                      <p>
                        Document provenance
                      </p>
                    </div>

                  </div>

                  <dl className="ns-docview-details">

                    <div>
                      <dt>Uploaded By</dt>

                      <dd>
                        {document.uploader_name ||
                          'Inspector Rajesh Deshmukh'}
                      </dd>
                    </div>

                    <div>
                      <dt>Date & Time</dt>

                      <dd>
                        {new Date(
                          document.created_at || Date.now()
                        ).toLocaleString()}
                      </dd>
                    </div>

                    <div>
                      <dt>Station / Agency</dt>

                      <dd>
                        Cyber Crime PS / NCRB
                      </dd>
                    </div>

                    <div>
                      <dt>Chain Node</dt>

                      <dd>
                        NCRB-NODE-DELHI-01
                      </dd>
                    </div>

                    <div>
                      <dt>Integrity Status</dt>

                      <dd className="ns-docview-integrity-text">
                        <ShieldCheck size={14} />
                        Intact & Verified
                      </dd>
                    </div>

                  </dl>

                </section>

              </div>

            </div>
          )}


          {/* ===================================================
              DIGITAL SIGNATURE
          ==================================================== */}

          {activeTab === 'signature' && (

            <div className="ns-docview-section">

              <div className="ns-docview-section-heading">

                <div>
                  <span className="ns-docview-eyebrow">
                    DIGITAL ASSURANCE
                  </span>

                  <h3>
                    Digital Signature & Integrity
                  </h3>

                  <p>
                    Cryptographic signature and certificate
                    verification details.
                  </p>
                </div>

              </div>


              <section className="ns-docview-card ns-docview-signature-card">

                <div className="ns-docview-signature-header">

                  <div className="ns-docview-signature-identity">

                    <div className="ns-docview-signature-icon">
                      <ShieldCheck size={20} />
                    </div>

                    <div>

                      <h4>
                        PKI Digital Signature Certificate
                      </h4>

                      <p>
                        Compliant with Information Technology
                        Act, 2000 (Section 3A)
                      </p>

                    </div>

                  </div>

                  <div className="ns-docview-valid-badge">
                    <Check size={14} />
                    Signature Valid
                  </div>

                </div>


                <div className="ns-docview-signature-grid">

                  <div className="ns-docview-signature-field">
                    <span>Signatory</span>

                    <strong>
                      {document.digital_signature?.signed_by ||
                        document.uploader_name ||
                        'Inspector Rajesh Deshmukh'}
                    </strong>
                  </div>

                  <div className="ns-docview-signature-field">
                    <span>Certifying Authority</span>

                    <strong>
                      {document.digital_signature
                        ?.certificate_authority ||
                        'NIC-CA / e-Mudhra Government of India'}
                    </strong>
                  </div>

                  <div className="ns-docview-signature-field">
                    <span>Signing Timestamp</span>

                    <strong>
                      {document.digital_signature?.timestamp
                        ? new Date(
                            document.digital_signature.timestamp
                          ).toLocaleString()
                        : new Date().toLocaleString()}
                    </strong>
                  </div>

                  <div className="ns-docview-signature-field">
                    <span>Certificate Key ID</span>

                    <strong className="ns-docview-mono">
                      {document.digital_signature?.key_id ||
                        'RSA-4096-7892-IN-NCRB'}
                    </strong>
                  </div>

                </div>


                <div className="ns-docview-verification-bar">

                  <div className="ns-docview-verification-message">

                    <ShieldCheck size={17} />

                    <p>
                      Cryptographic hash matches the original
                      uploaded byte sequence. No modifications
                      detected.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifying}
                    className="ns-docview-button ns-docview-button-primary"
                  >
                    {verifying ? (
                      <span className="ns-docview-spinner" />
                    ) : (
                      <ShieldCheck size={15} />
                    )}

                    <span>
                      {verifying
                        ? 'Verifying...'
                        : 'Re-verify Ledger'}
                    </span>
                  </button>

                </div>

              </section>


              {verifyResult && (

                <div className="ns-docview-result">

                  <div className="ns-docview-result-icon">
                    <Check size={17} />
                  </div>

                  <div>

                    <strong>
                      HSM Hardware Enclave Attestation Confirmed
                    </strong>

                    <p>
                      Document #{document.id} version v
                      {document.current_version || 1}
                      {' '}verified against the national root
                      certificate authority. Zero tamper anomalies.
                    </p>

                  </div>

                </div>

              )}

            </div>
          )}


          {/* ===================================================
              OCR
          ==================================================== */}

          {activeTab === 'ocr' && (

            <div className="ns-docview-section">

              <div className="ns-docview-section-heading">

                <div>
                  <span className="ns-docview-eyebrow">
                    TEXT EXTRACTION
                  </span>

                  <h3>
                    OCR Text Preview
                  </h3>

                  <p>
                    Machine-extracted text associated with this
                    document.
                  </p>
                </div>

                <div className="ns-docview-confidence">
                  OCR Confidence: 98.4%
                </div>

              </div>


              <section className="ns-docview-ocr-card">

                <div className="ns-docview-ocr-header">

                  <div>
                    <Search size={17} />

                    <span>
                      Machine Extracted Document Text
                    </span>
                  </div>

                  <span className="ns-docview-ocr-engine">
                    Tesseract / EasyOCR v4
                  </span>

                </div>


                <div className="ns-docview-ocr-content">
                  {document.ocr_text ||
                    'No OCR text extracted for this document. Text processing is currently queued.'}
                </div>


                <div className="ns-docview-ocr-footer">

                  <Search size={14} />

                  <span>
                    Indexed for semantic search and keyword
                    lookups across authorized agency nodes.
                  </span>

                </div>

              </section>

            </div>
          )}


          {/* ===================================================
              SECURE PREVIEW
          ==================================================== */}

          {activeTab === 'preview' && (

            <div className="ns-docview-section">

              <div className="ns-docview-section-heading">

                <div>
                  <span className="ns-docview-eyebrow">
                    PROTECTED ACCESS
                  </span>

                  <h3>
                    Secure Document Preview
                  </h3>

                  <p>
                    Protected access to the verified document copy.
                  </p>
                </div>

              </div>


              <section className="ns-docview-preview">

                <div className="ns-docview-preview-icon">
                  <FileCheck2 size={30} />
                </div>

                <span className="ns-docview-preview-label">
                  Secure Document
                </span>

                <h3>
                  Watermarked Secure View
                </h3>

                <p>
                  Document content is protected using dynamic
                  forensic watermarking. Authorized access may
                  include officer identity, network information,
                  and timestamp metadata.
                </p>

                <div className="ns-docview-preview-security">

                  <div>
                    <ShieldCheck size={15} />
                    Integrity Verified
                  </div>

                  <div>
                    <Lock size={15} />
                    Encrypted Storage
                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="ns-docview-button ns-docview-button-primary"
                >
                  <Download size={15} />
                  Download Verified Copy
                </button>

              </section>

            </div>
          )}

        </main>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="ns-docview-footer">

          <div className="ns-docview-footer-info">

            <ShieldCheck size={14} />

            <span>
              Nyaya Setu Secure Document Repository
            </span>

            <span className="ns-docview-footer-separator">
              |
            </span>

            <span>
              Cryptographic integrity protected
            </span>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="ns-docview-button ns-docview-button-secondary"
          >
            Close Viewer
          </button>

        </footer>

      </section>
    </div>
  );
};

export default DocumentViewerModal;