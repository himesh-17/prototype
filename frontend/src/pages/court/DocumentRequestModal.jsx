import React, { useEffect, useState } from 'react';
import {
  X,
  Send,
  AlertCircle,
  FileSearch,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { createCourtRequest } from '../../services/api';

const RECIPIENTS = [
  'Investigating Officer (IO Rajesh Deshmukh)',
  'Central Forensic Science Laboratory (Dr. Aarav Nambiar)',
  'National Cyber Crime Threat Analytics Unit (NCRB)',
  'Telecom Service Provider Nodal Officer',
  'Joint Commissioner of Police (Crime Branch)',
];
import '../../styles/DocumentRequestModal.css';

const DocumentRequestModal = ({
  availableCases = [],
  onClose,
  onSuccess,
}) => {
  const [caseNumber, setCaseNumber] = useState('');
  const [requestType, setRequestType] = useState('');
  const [priority, setPriority] = useState('URGENT');
  const [requestedTo, setRequestedTo] = useState(RECIPIENTS[0]);

  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 86400000)
      .toISOString()
      .split('T')[0]
  );

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (availableCases.length > 0 && !caseNumber) {
      setCaseNumber(availableCases[0].case_number);
    }
  }, [availableCases, caseNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!caseNumber) {
      setError('Select a case reference before continuing.');
      return;
    }

    if (!requestType.trim()) {
      setError('Enter the document or evidence required.');
      return;
    }

    if (!dueDate) {
      setError('Select a submission deadline.');
      return;
    }

    setSubmitting(true);

    try {
      await createCourtRequest({
        case_number: caseNumber,
        request_type: requestType.trim(),
        priority,
        requested_to: requestedTo,
        due_date: dueDate,
        notes: notes.trim(),
        requested_by: "Hon'ble Justice Meenakshi Sundaram",
      });

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (err) {
      setError(
        err?.message || 'Unable to submit the document requisition.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="court-request-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="court-request-title"
    >
      <div
        className="court-request-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <header className="court-request-header">
          <div className="court-request-title-wrap">
            <div className="court-request-title-icon">
              <FileSearch size={17} strokeWidth={1.8} />
            </div>

            <div>
              <h2 id="court-request-title">
                Document Requisition
              </h2>

              <p>
                Request official records or evidence
              </p>
            </div>
          </div>

          <button
            type="button"
            className="court-request-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </header>


        {/* Form */}
        <form
          className="court-request-form"
          onSubmit={handleSubmit}
        >

          {error && (
            <div className="court-request-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}


          {/* Section: Case */}
          <section className="court-request-section">

            <div className="court-request-section-heading">
              <span className="court-request-section-number">
                01
              </span>

              <div>
                <h3>Request details</h3>
                <p>
                  Identify the proceeding and required material.
                </p>
              </div>
            </div>


            <div className="court-request-grid">

              <div className="court-request-field">

                <label htmlFor="court-case">
                  Case reference
                </label>

                <div className="court-select">
                  <select
                    id="court-case"
                    value={caseNumber}
                    onChange={(e) =>
                      setCaseNumber(e.target.value)
                    }
                    disabled={availableCases.length === 0}
                    required
                  >
                    {availableCases.length === 0 ? (
                      <option value="">
                        No cases available
                      </option>
                    ) : (
                      availableCases.map((item) => (
                        <option
                          key={item.id}
                          value={item.case_number}
                        >
                          {item.case_number}
                          {item.title
                            ? ` — ${item.title}`
                            : ''}
                        </option>
                      ))
                    )}
                  </select>

                  <ChevronDown size={14} />
                </div>

              </div>


              <div className="court-request-field">

                <label htmlFor="court-priority">
                  Priority
                </label>

                <div className="court-select">
                  <select
                    id="court-priority"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value)
                    }
                  >
                    <option value="ROUTINE">
                      Routine
                    </option>

                    <option value="URGENT">
                      Urgent
                    </option>

                    <option value="IMMEDIATE">
                      Immediate
                    </option>
                  </select>

                  <ChevronDown size={14} />
                </div>

              </div>

            </div>


            <div className="court-request-field">

              <label htmlFor="court-requirement">
                Document / evidence required
              </label>

              <input
                id="court-requirement"
                type="text"
                value={requestType}
                onChange={(e) =>
                  setRequestType(e.target.value)
                }
                placeholder="Describe the record, report, evidence or material required"
                required
              />

            </div>

          </section>


          {/* Section: Recipient */}
          <section className="court-request-section">

            <div className="court-request-section-heading">
              <span className="court-request-section-number">
                02
              </span>

              <div>
                <h3>Recipient & deadline</h3>
                <p>
                  Specify who must furnish the requested material.
                </p>
              </div>
            </div>


            <div className="court-request-grid">

              <div className="court-request-field">

                <label htmlFor="court-recipient">
                  Requested from
                </label>

                <div className="court-select">
                  <select
                    id="court-recipient"
                    value={requestedTo}
                    onChange={(e) =>
                      setRequestedTo(e.target.value)
                    }
                  >
                    {RECIPIENTS.map((recipient) => (
                      <option
                        key={recipient}
                        value={recipient}
                      >
                        {recipient}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={14} />
                </div>

              </div>


              <div className="court-request-field">

                <label htmlFor="court-deadline">
                  Submission deadline
                </label>

                <input
                  id="court-deadline"
                  type="date"
                  value={dueDate}
                  min={
                    new Date()
                      .toISOString()
                      .split('T')[0]
                  }
                  onChange={(e) =>
                    setDueDate(e.target.value)
                  }
                  required
                />

              </div>

            </div>

          </section>


          {/* Section: Directions */}
          <section className="court-request-section">

            <div className="court-request-section-heading">
              <span className="court-request-section-number">
                03
              </span>

              <div>
                <h3>Judicial directions</h3>
                <p>
                  Add any specific instructions or points of inquiry.
                </p>
              </div>
            </div>


            <div className="court-request-field">

              <textarea
                id="court-notes"
                rows={4}
                value={notes}
                maxLength={1000}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                placeholder="Enter relevant directions, scope of records required, or specific points of inquiry..."
              />

              <span className="court-request-counter">
                {notes.length}/1000
              </span>

            </div>

          </section>


          {/* Security notice */}
          <div className="court-request-security">

            <ShieldCheck size={16} />

            <div>
              <strong>Secure court record</strong>

              <span>
                This requisition will be recorded against the
                selected case and transmitted through the
                authorized system workflow.
              </span>
            </div>

          </div>


          {/* Footer */}
          <footer className="court-request-footer">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary court-request-submit"
              disabled={
                submitting ||
                availableCases.length === 0
              }
            >
              {submitting ? (
                <span className="spinner" />
              ) : (
                <Send size={14} />
              )}

              {submitting
                ? 'Submitting...'
                : 'Issue Requisition'}
            </button>

          </footer>

        </form>

      </div>
    </div>
  );
};

export { DocumentRequestModal };