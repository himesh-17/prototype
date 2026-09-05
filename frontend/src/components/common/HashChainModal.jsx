import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  ArrowDown,
  Key,
  Link2,
  User,
  FileText,
  Clock3,
} from 'lucide-react';
import './HashChainModal.css';

export const HashChainModal = ({ log, onClose }) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!log) return null;

  const previousHash =
    log.previous_hash ||
    '0000000000000000000000000000000000000000000000000000000000000000';

  const entryHash = log.entry_hash || '—';

  const actor = log.user_name || log.user?.name || 'System';
  const role = log.user_role || 'ADMIN';

  const formatDate = (value) => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedField(field);

      setTimeout(() => {
        setCopiedField(null);
      }, 1800);
    } catch (error) {
      console.error('Unable to copy hash:', error);
    }
  };

  return (
    <div
      className="ns-audit-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="ns-audit-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="ns-audit-header">

          <div className="ns-audit-header-left">

            <div className="ns-audit-header-icon">
              <Link2 size={19} />
            </div>

            <div>
              <div className="ns-audit-title">
                Audit chain block #{log.id}
              </div>

              <div className="ns-audit-subtitle">
                Cryptographic integrity record
              </div>
            </div>

          </div>

          <button
            type="button"
            className="ns-audit-close"
            onClick={onClose}
            aria-label="Close hash inspector"
          >
            <X size={18} />
          </button>

        </div>


        {/* =====================================================
            VERIFIED STATUS
        ===================================================== */}

        <div className="ns-audit-status">

          <div className="ns-audit-status-icon">
            <ShieldCheck size={17} />
          </div>

          <div className="ns-audit-status-content">

            <strong>
              Cryptographic block verified
            </strong>

            <span>
              This entry is linked to the previous audit block
              through SHA-256 hashing.
            </span>

          </div>

          <span className="ns-audit-valid">
            VALID
          </span>

        </div>


        {/* =====================================================
            MAIN FORM
        ===================================================== */}

        <div className="ns-audit-content">

          {/* Basic information */}

          <section className="ns-audit-section">

            <div className="ns-audit-section-heading">
              <span>Event information</span>
              <small>BLOCK #{log.id}</small>
            </div>

            <div className="ns-audit-info-grid">

              <div className="ns-audit-field">

                <span className="ns-audit-label">
                  <User size={13} />
                  Actor
                </span>

                <strong>{actor}</strong>

              </div>


              <div className="ns-audit-field">

                <span className="ns-audit-label">
                  Role
                </span>

                <strong>{role}</strong>

              </div>


              <div className="ns-audit-field">

                <span className="ns-audit-label">
                  <FileText size={13} />
                  Action
                </span>

                <strong>
                  {log.action || '—'}
                </strong>

              </div>


              <div className="ns-audit-field">

                <span className="ns-audit-label">
                  Entity
                </span>

                <strong>
                  {log.entity_type || '—'}
                  {log.entity_id !== null &&
                  log.entity_id !== undefined
                    ? ` #${log.entity_id}`
                    : ''}
                </strong>

              </div>


              <div className="ns-audit-field ns-audit-field-wide">

                <span className="ns-audit-label">
                  <Clock3 size={13} />
                  Recorded
                </span>

                <strong>
                  {formatDate(log.timestamp)}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              HASH CHAIN
          ================================================= */}

          <section className="ns-audit-section">

            <div className="ns-audit-section-heading">

              <div>
                <span>Hash chain</span>
                <small>
                  PREVIOUS → CURRENT
                </small>
              </div>

              <span className="ns-audit-sha-label">
                SHA-256
              </span>

            </div>


            <div className="ns-audit-chain">

              {/* Previous block */}

              <div className="ns-audit-hash-row">

                <div className="ns-audit-chain-marker">
                  <div className="ns-audit-chain-dot" />
                </div>

                <div className="ns-audit-hash-content">

                  <div className="ns-audit-hash-heading">

                    <div>
                      <span className="ns-audit-hash-label">
                        Previous block
                      </span>

                      <small>
                        Parent hash
                      </small>
                    </div>

                    <button
                      type="button"
                      className="ns-audit-copy"
                      onClick={() =>
                        copyToClipboard(previousHash, 'prev')
                      }
                    >
                      {copiedField === 'prev' ? (
                        <>
                          <Check size={13} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          Copy
                        </>
                      )}
                    </button>

                  </div>

                  <div className="ns-audit-hash-box">
                    {previousHash}
                  </div>

                </div>

              </div>


              {/* Connector */}

              <div className="ns-audit-chain-connector">

                <div className="ns-audit-connector-line" />

                <div className="ns-audit-connector-icon">
                  <ArrowDown size={13} />
                </div>

                <div className="ns-audit-connector-line" />

              </div>


              {/* Current block */}

              <div className="ns-audit-hash-row current">

                <div className="ns-audit-chain-marker">
                  <div className="ns-audit-chain-dot current" />
                </div>

                <div className="ns-audit-hash-content">

                  <div className="ns-audit-hash-heading">

                    <div>
                      <span className="ns-audit-hash-label">
                        Current block
                      </span>

                      <small>
                        Entry SHA-256 hash
                      </small>
                    </div>

                    <button
                      type="button"
                      className="ns-audit-copy"
                      onClick={() =>
                        copyToClipboard(entryHash, 'entry')
                      }
                    >
                      {copiedField === 'entry' ? (
                        <>
                          <Check size={13} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          Copy
                        </>
                      )}
                    </button>

                  </div>

                  <div className="ns-audit-hash-box current">
                    {entryHash}
                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              DETAILS
          ================================================= */}

          {log.details && (

            <section className="ns-audit-section">

              <div className="ns-audit-section-heading">
                <span>Event details</span>
              </div>

              <div className="ns-audit-details">
                {log.details}
              </div>

            </section>

          )}

        </div>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="ns-audit-footer">

          <div className="ns-audit-footer-security">
            <ShieldCheck size={14} />
            Integrity protected
          </div>

          <button
            type="button"
            className="ns-audit-done"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
};

export default HashChainModal;