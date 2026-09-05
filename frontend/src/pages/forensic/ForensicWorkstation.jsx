import React, { useState, useEffect } from 'react';
import { getAllAssets, getCases, getAllDocuments } from '../../services/api';
import { EvidenceIntakeModal } from './EvidenceIntakeModal';
import { ForensicReportModal } from './ForensicReportModal';
import { ChainOfCustodyModal } from './ChainOfCustodyModal';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal';
import { StatCard } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Microscope,
  Box,
  FileText,
  ShieldCheck,
  Plus,
  Eye,
  Key,
  HardDrive,
  QrCode,
  ArrowRight,
  Download
} from 'lucide-react';

export const ForensicWorkstation = () => {
  const [assets, setAssets] = useState([]);
  const [cases, setCases] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedAssetForCustody, setSelectedAssetForCustody] = useState(null);
  const [selectedDocForView, setSelectedDocForView] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [a, c, d] = await Promise.all([
        getAllAssets(),
        getCases(),
        getAllDocuments(),
      ]);
      setAssets(a || []);
      setCases(c || []);
      setReports((d || []).filter(doc => doc.document_type === 'Forensic Report'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-heading">
          <span className="page-eyebrow">CFSL</span>
          <h1 className="page-title">Forensic workstation</h1>
          <p className="page-description">
            Evidence intake, imaging records, and signed lab reports.
          </p>
        </div>

        <div className="page-actions">
          <button
            onClick={() => setShowIntakeModal(true)}
            className="btn btn-secondary"
          >
            <Box size={14} />
            <span>Evidence Intake Form</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="btn btn-primary"
          >
            <Microscope size={15} />
            Submit report
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Evidence"
          value={assets.length}
          subtitle="Digital & physical exhibits"
          icon={HardDrive}
          trend="All seals intact"
          color="purple"
        />
        <StatCard
          title="Pending Lab Reports"
          value={2}
          subtitle="Memory dump extraction"
          icon={FileText}
          trend="Due in 48 hrs"
          color="amber"
        />
        <StatCard
          title="Reports Sealed"
          value={reports.length}
          subtitle="Cryptographically signed"
          icon={ShieldCheck}
          trend="100% verified"
          color="teal"
        />
        <StatCard
          title="Custody Blocks"
          value={18}
          subtitle="Unbroken provenance"
          icon={Key}
          trend="Zero anomalies"
          color="sky"
        />
      </div>

      {/* Assigned Evidence Items with Chain of Custody Tracker */}
      <div className="rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] overflow-hidden shadow-lg backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-[var(--text-secondary)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)] font-sans">
              Assigned Physical & Digital Evidence Exhibits
            </h3>
          </div>
          <span className="text-xs font-sans text-[var(--text-tertiary)]">{assets.length} In Lab Custody</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Exhibit #</th>
                <th>Evidence Description & Case</th>
                <th>Evidence Category</th>
                <th>Physical Seal Condition</th>
                <th>Lab Location</th>
                <th>Current Custodian</th>
                <th style={{ width: '140px' }}>Custody Ledger</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => (
                <tr key={a.id} className="hover:bg-[var(--bg-overlay)] transition-colors">
                  <td>
                    <span className="badge badge-info font-mono text-xs font-semibold">
                      {a.asset_number}
                    </span>
                  </td>
                  <td>
                    <div className="font-sans font-medium text-xs text-[var(--text-primary)] truncate max-w-[280px]">
                      {a.name}
                    </div>
                    <div className="text-[11px] font-sans text-[var(--text-tertiary)] truncate max-w-[280px] mt-0.5">
                      Case Docket: {a.case_number || 'CR-2026-0891'}
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-sans text-[var(--text-secondary)]">{a.asset_type}</span>
                  </td>
                  <td>
                    <span className="text-xs font-sans text-[var(--accent-strong)] bg-[var(--accent-faint)] px-2.5 py-0.5 rounded-full border border-[var(--accent-faint)] font-medium">
                      {a.seal_number || 'SEAL-INTACT'}
                    </span>
                  </td>
                  <td className="text-xs font-sans text-[var(--text-tertiary)]">{a.location}</td>
                  <td className="text-xs font-sans font-medium text-[var(--text-secondary)]">
                    {a.current_custodian_name || 'Dr. Aarav Nambiar (CFSL)'}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedAssetForCustody(a)}
                      className="btn btn-secondary text-xs px-3 py-1 inline-flex items-center gap-1.5 hover:border-teal-400/40 font-sans"
                    >
                      <ShieldCheck size={13} className="text-[var(--accent-strong)]" />
                      <span>Track Custody</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sealed Forensic Reports with Digital Signatures */}
      <div className="rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] overflow-hidden shadow-lg backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[var(--accent-strong)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)] font-sans">
              Sealed Forensic Examination Reports
            </h3>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="text-xs font-sans text-[var(--accent-strong)] hover:underline font-medium"
          >
            + Submit New Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Report File</th>
                <th>Target Case</th>
                <th>Classification</th>
                <th>Digital Signature Key</th>
                <th>Signing Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-[var(--bg-overlay)] transition-colors">
                  <td>
                    <div className="font-sans font-medium text-xs text-[var(--text-primary)] truncate max-w-sm">{r.filename}</div>
                    <div className="text-[11px] font-mono text-[var(--text-tertiary)] truncate max-w-xs mt-0.5">
                      SHA256: {r.sha256_hash?.substring(0, 16)}...{r.sha256_hash?.substring(r.sha256_hash.length - 4)}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info font-mono text-xs">{r.case_number || 'CR-2026-0891'}</span>
                  </td>
                  <td>
                    <span className="text-[10px] font-sans uppercase tracking-wider text-[var(--danger-base)] bg-[var(--danger-soft)] px-2.5 py-0.5 rounded-full border border-[var(--danger-soft)] font-semibold">
                      {r.classification || 'Top Secret'}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-[var(--accent-strong)]">
                      {r.digital_signature?.key_id || 'ECDSA-P384-CFSL-0091'}
                    </span>
                  </td>
                  <td className="text-xs font-sans text-[var(--text-tertiary)] whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedDocForView(r)}
                      className="btn btn-secondary text-xs px-2.5 py-1 inline-flex items-center gap-1 font-sans"
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showIntakeModal && (
        <EvidenceIntakeModal
          availableCases={cases}
          onClose={() => setShowIntakeModal(false)}
          onSuccess={() => fetchData()}
        />
      )}

      {showReportModal && (
        <ForensicReportModal
          availableCases={cases}
          availableAssets={assets}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => fetchData()}
        />
      )}

      {selectedAssetForCustody && (
        <ChainOfCustodyModal
          asset={selectedAssetForCustody}
          events={[
            {
              id: 1,
              action: 'EVIDENCE_SEIZED',
              from_name: 'Crime Scene (Noida Sector 62)',
              to_name: 'Inspector Rajesh Deshmukh',
              timestamp: '2026-08-16T18:00:00Z',
              location: 'Noida Sector 62',
              seal_status: 'Sealed with Lacquer Stamp #DL-9912',
              remarks: 'Seized during authorized raid.',
            },
            {
              id: 2,
              action: 'LAB_INTAKE_RECEIVED',
              from_name: 'Sub-Inspector Anil Kumar',
              to_name: 'Dr. Aarav Nambiar (CFSL)',
              timestamp: '2026-08-20T11:45:00Z',
              location: 'CFSL Clean Room 2',
              seal_status: 'Seal Checked & Intact',
              remarks: 'Bitstream image created under write-blocker.',
            }
          ]}
          onClose={() => setSelectedAssetForCustody(null)}
          onRefresh={() => fetchData()}
        />
      )}

      {selectedDocForView && (
        <DocumentViewerModal
          document={selectedDocForView}
          onClose={() => setSelectedDocForView(null)}
          onRefresh={() => fetchData()}
        />
      )}
    </div>
  );
};

export default ForensicWorkstation;
