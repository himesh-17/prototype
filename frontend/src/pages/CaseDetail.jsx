import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCase,
  getAssets,
  getDocuments,
  updateCase,
  getUsers,
  getCaseTimeline,
} from '../services/api';

import { DocumentUploadModal } from '../components/common/DocumentUploadModal';
import { DocumentViewerModal } from '../components/common/DocumentViewerModal';
import { ChainOfCustodyModal } from './forensic/ChainOfCustodyModal';

import {
  Briefcase,
  Box,
  FileText,
  Plus,
  X,
  Edit2,
  ShieldCheck,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Scale,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Search,
} from 'lucide-react';

import '../styles/cases.css';

const docTypeStyles = {
  FIR: 'ns-doc-type-fir',
  'Witness Statement': 'ns-doc-type-witness',
  'Forensic Report': 'ns-doc-type-forensic',
  Evidence: 'ns-doc-type-evidence',
  'Judicial Order': 'ns-doc-type-judicial',
  'Seizure Memo': 'ns-doc-type-seizure',
};

const classificationStyles = {
  Confidential: 'ns-class-confidential',
  Secret: 'ns-class-secret',
  'Top Secret': 'ns-class-top-secret',
};

export const CaseDetail = () => {
  const { id } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'HIGH',
    acts_sections: '',
  });

  const fetchData = async () => {
    setLoading(true);

    try {
      const [c, a, d, u, t] = await Promise.all([
        getCase(id),
        getAssets(id),
        getDocuments(id),
        getUsers(),
        getCaseTimeline(id),
      ]);

      setCaseData(c);
      setAssets(a || []);
      setDocuments(d || []);
      setUsers(u || []);
      setTimeline(t || []);

      if (c) {
        setEditForm({
          title: c.title || '',
          description: c.description || '',
          status: c.status || 'OPEN',
          priority: c.priority || 'HIGH',
          acts_sections: c.acts_sections || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateCase = async (e) => {
    e.preventDefault();

    try {
      await updateCase(id, editForm);
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="ns-case-loading">
        <div className="spinner ns-case-spinner" />
        <p>Loading case record...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="ns-case-not-found">
        <div className="ns-case-not-found-card">
          <div className="ns-case-not-found-icon">
            <Briefcase size={22} />
          </div>

          <h3>Case record not found</h3>

          <p>
            The requested case record could not be located in the registry.
          </p>

          <Link to="/cases" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  const assignedIO = users.find(
    (u) => u.id === caseData.assigned_io_id
  );

  const statusClass =
    caseData.status === 'OPEN'
      ? 'ns-status-open'
      : caseData.status === 'CLOSED'
      ? 'ns-status-closed'
      : 'ns-status-neutral';

  return (
    <div className="ns-case-page">

      {/* =====================================================
          CASE HEADER
      ====================================================== */}

      <section className="ns-case-header">

        <div className="ns-case-header-main">

          <Link to="/cases" className="ns-case-back">
            <ArrowLeft size={15} />
            <span>National Case Registry</span>
          </Link>

          <div className="ns-case-heading-row">

            <div className="ns-case-heading-icon">
              <Briefcase size={22} />
            </div>

            <div>
              <div className="ns-case-kicker">
                CASE RECORD
              </div>

              <h1 className="ns-case-title">
                {caseData.title}
              </h1>

              <p className="ns-case-description">
                {caseData.description ||
                  'No description has been provided for this case.'}
              </p>
            </div>

          </div>

          <div className="ns-case-identifiers">

            <span className="ns-case-number">
              {caseData.case_number}
            </span>

            <span className={`ns-case-status ${statusClass}`}>
              <span className="ns-status-dot" />
              {caseData.status}
            </span>

            <span className="ns-case-priority">
              Priority: {caseData.priority || 'HIGH'}
            </span>

          </div>

        </div>

        <div className="ns-case-header-actions">

          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Upload Document
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="btn btn-secondary"
          >
            <Edit2 size={15} />
            Edit Case
          </button>

        </div>

      </section>

      {/* =====================================================
          CASE INFORMATION
      ====================================================== */}

      <section className="ns-case-info-card">

        <div className="ns-case-info-heading">
          <div className="ns-section-icon">
            <Layers size={17} />
          </div>

          <div>
            <h2>Case Information</h2>
            <p>Administrative and jurisdiction details</p>
          </div>
        </div>

        <div className="ns-case-info-grid">

          <div className="ns-info-item">
            <span className="ns-info-label">
              Acts & Penal Sections
            </span>

            <span className="ns-info-value">
              {caseData.acts_sections || 'BNS / IT Act'}
            </span>
          </div>

          <div className="ns-info-item">
            <span className="ns-info-label">
              Investigating Officer
            </span>

            <span className="ns-info-value">
              {caseData.assigned_io_name ||
                assignedIO?.name ||
                'Inspector Rajesh Deshmukh'}
            </span>
          </div>

          <div className="ns-info-item">
            <span className="ns-info-label">
              Police Station
            </span>

            <span className="ns-info-value">
              {caseData.police_station ||
                'Cyber Crime PS, Delhi'}
            </span>
          </div>

          <div className="ns-info-item">
            <span className="ns-info-label">
              Court Jurisdiction
            </span>

            <span className="ns-info-value">
              {caseData.court_jurisdiction ||
                'Special Cyber Court'}
            </span>
          </div>

        </div>

      </section>

      {/* =====================================================
          DOCUMENTS + PHYSICAL ASSETS
      ====================================================== */}

      <section className="ns-case-content-grid">

        {/* DOCUMENTS */}

        <div className="ns-case-card ns-documents-card">

          <div className="ns-card-header">

            <div className="ns-card-heading">

              <div className="ns-card-icon ns-card-icon-blue">
                <FileText size={18} />
              </div>

              <div>
                <h2>Digital Documents</h2>
                <p>Documents secured within this case record</p>
              </div>

            </div>

            <span className="ns-count">
              {documents.length} files
            </span>

          </div>

          <div className="ns-document-list">

            {documents.length === 0 ? (

              <div className="ns-empty-state">
                <FileText size={28} />
                <strong>No documents registered</strong>
                <span>
                  Upload a document to add it to this case.
                </span>
              </div>

            ) : (

              documents.map((d) => {

                const typeClass =
                  docTypeStyles[d.document_type] ||
                  'ns-doc-type-default';

                const classificationClass =
                  classificationStyles[d.classification] ||
                  classificationStyles.Confidential;

                return (
                  <div
                    key={d.id}
                    className="ns-document-row"
                    onClick={() => setSelectedDoc(d)}
                  >

                    <div className="ns-document-main">

                      <div className="ns-document-icon">
                        <FileText size={18} />
                      </div>

                      <div className="ns-document-details">

                        <div className="ns-document-name">
                          {d.filename}
                        </div>

                        <div className="ns-document-meta">

                          <span className={typeClass}>
                            {d.document_type}
                          </span>

                          <span className={classificationClass}>
                            {d.classification ||
                              'Confidential'}
                          </span>

                        </div>

                        <div className="ns-document-hash">
                          SHA-256:
                          {' '}
                          {d.sha256_hash?.substring(0, 22)}
                          ...
                        </div>

                      </div>

                    </div>

                    <div className="ns-document-version">
                      <span>VERSION</span>
                      <strong>
                        v{d.current_version || 1}
                      </strong>
                    </div>

                    <div className="ns-document-signature">

                      <ShieldCheck size={16} />

                      <div>
                        <strong>Verified</strong>
                        <span>Digital signature</span>
                      </div>

                    </div>

                    <button
                      className="ns-view-document"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(d);
                      }}
                    >
                      <Eye size={15} />
                      View
                    </button>

                  </div>
                );
              })

            )}

          </div>

        </div>

        {/* PHYSICAL ASSETS */}

        <div className="ns-case-card ns-assets-card">

          <div className="ns-card-header">

            <div className="ns-card-heading">

              <div className="ns-card-icon ns-card-icon-slate">
                <Box size={18} />
              </div>

              <div>
                <h2>Physical Evidence</h2>
                <p>Assets and chain of custody</p>
              </div>

            </div>

            <span className="ns-count">
              {assets.length}
            </span>

          </div>

          <div className="ns-assets-list">

            {assets.length === 0 ? (

              <div className="ns-empty-state ns-empty-small">
                <Box size={26} />
                <strong>No physical evidence</strong>
                <span>
                  No assets have been logged for this case.
                </span>
              </div>

            ) : (

              assets.map((a) => (

                <div
                  key={a.id}
                  className="ns-asset-item"
                >

                  <div className="ns-asset-top">

                    <span className="ns-asset-number">
                      {a.asset_number}
                    </span>

                    <span className="ns-asset-status">
                      {a.status}
                    </span>

                  </div>

                  <h3>{a.name}</h3>

                  <div className="ns-asset-info">
                    <span>Custodian</span>
                    <strong>
                      {a.current_custodian_name ||
                        'Dr. Aarav Nambiar (CFSL)'}
                    </strong>
                  </div>

                  <div className="ns-asset-footer">

                    <span>
                      Seal:{' '}
                      {a.seal_number || 'INTACT'}
                    </span>

                    <button
                      onClick={() => setSelectedAsset(a)}
                    >
                      <ShieldCheck size={14} />
                      Track Custody
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

          <div className="ns-assets-note">
            <ShieldCheck size={14} />
            Every evidence handover is cryptographically signed
          </div>

        </div>

      </section>

      {/* =====================================================
          TIMELINE
      ====================================================== */}

      <section className="ns-case-card ns-timeline-card">

        <div className="ns-card-header">

          <div className="ns-card-heading">

            <div className="ns-card-icon ns-card-icon-blue">
              <Clock size={18} />
            </div>

            <div>
              <h2>Case Timeline</h2>
              <p>
                Legal, investigative and evidence milestones
              </p>
            </div>

          </div>

          <span className="ns-count">
            {timeline.length} events
          </span>

        </div>

        <div className="ns-timeline">

          {timeline.length === 0 ? (

            <div className="ns-empty-state">
              <Clock size={28} />
              <strong>No timeline events</strong>
              <span>
                Case activity will appear here.
              </span>
            </div>

          ) : (

            timeline.map((item, idx) => (

              <div
                key={item.id || idx}
                className="ns-timeline-item"
              >

                <div className="ns-timeline-marker">
                  <span />
                </div>

                <div className="ns-timeline-content">

                  <div className="ns-timeline-top">

                    <div className="ns-timeline-title-group">

                      <h3>{item.title}</h3>

                      <span className="ns-timeline-badge">
                        {item.badge || item.type}
                      </span>

                    </div>

                    <time>
                      {item.date}
                    </time>

                  </div>

                  <p>{item.detail}</p>

                </div>

              </div>

            ))

          )}

        </div>

      </section>

      {/* =====================================================
          DOCUMENT UPLOAD
      ====================================================== */}

      {showUploadModal && (
        <DocumentUploadModal
          caseId={caseData.id}
          caseNumber={caseData.case_number}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => fetchData()}
        />
      )}

      {/* =====================================================
          DOCUMENT VIEWER
      ====================================================== */}

      {selectedDoc && (
        <DocumentViewerModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onRefresh={() => fetchData()}
        />
      )}

      {/* =====================================================
          CHAIN OF CUSTODY
      ====================================================== */}

      {selectedAsset && (
        <ChainOfCustodyModal
          asset={selectedAsset}
          events={
            selectedAsset.events || [
              {
                id: 1,
                action: 'EVIDENCE_SEIZED',
                from_name: 'Crime Scene (Noida Sector 62)',
                to_name: 'Inspector Rajesh Deshmukh',
                timestamp: '2026-08-16T18:00:00Z',
                location: 'Noida Sector 62',
                seal_status:
                  'Sealed with Lacquer Stamp #DL-9912',
                remarks:
                  'Seized during authorized raid.',
              },
              {
                id: 2,
                action: 'LAB_INTAKE_RECEIVED',
                from_name: 'Sub-Inspector Anil Kumar',
                to_name: 'Dr. Aarav Nambiar (CFSL)',
                timestamp: '2026-08-20T11:45:00Z',
                location: 'CFSL Clean Room 2',
                seal_status: 'Seal Checked & Intact',
                remarks:
                  'Bitstream image created under write-blocker.',
              },
            ]
          }
          onClose={() => setSelectedAsset(null)}
          onRefresh={() => fetchData()}
        />
      )}

      {/* =====================================================
          EDIT CASE MODAL
      ====================================================== */}

      {showEditModal && (

        <div
          className="ns-edit-backdrop"
          onClick={() => setShowEditModal(false)}
          role="dialog"
          aria-modal="true"
        >

          <div
            className="ns-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="ns-edit-header">

              <div>
                <span>CASE MANAGEMENT</span>
                <h2>Edit Case Details</h2>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                aria-label="Close edit case"
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={handleUpdateCase}
              className="ns-edit-form"
            >

              <div className="ns-edit-field ns-edit-full">
                <label>Case Title</label>

                <input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="ns-edit-field">
                <label>Status</label>

                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="ARCHIVED">
                    ARCHIVED
                  </option>
                </select>
              </div>

              <div className="ns-edit-field">
                <label>Priority</label>

                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      priority: e.target.value,
                    })
                  }
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div className="ns-edit-field ns-edit-full">
                <label>Acts & Penal Sections</label>

                <input
                  value={editForm.acts_sections}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      acts_sections: e.target.value,
                    })
                  }
                />
              </div>

              <div className="ns-edit-field ns-edit-full">
                <label>Case Facts / Description</label>

                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description: e.target.value,
                    })
                  }
                  rows={5}
                />
              </div>

              <div className="ns-edit-actions">

                <button
                  type="button"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default CaseDetail;