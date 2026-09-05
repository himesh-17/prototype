import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCases,
  getAllDocuments,
  getUsers,
  getAuditLogs,
  getAllAssets,
  getCourtRequests,
  verifyAuditChain
} from '../services/api';


import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { DocumentUploadModal } from '../components/common/DocumentUploadModal';
import { DocumentViewerModal } from '../components/common/DocumentViewerModal';
import { JudgmentUploadModal } from './court/JudgmentUploadModal';
import { DocumentRequestModal } from './court/DocumentRequestModal';
import { EvidenceIntakeModal } from './forensic/EvidenceIntakeModal';
import { ForensicReportModal } from './forensic/ForensicReportModal';
import { ChainOfCustodyModal } from './forensic/ChainOfCustodyModal';

import {
  Briefcase,
  AlertCircle,
  FileText,
  Users,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Scale,
  Microscope,
  HardDrive,
  Activity,
  Send,
  ChevronRight,
  Server
} from 'lucide-react';

export const Dashboard = () => {
  const { user, activeRole } = useAuth();

  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [courtRequests, setCourtRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showDocUpload, setShowDocUpload] = useState(false);
  const [showJudgmentModal, setShowJudgmentModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showForensicReportModal, setShowForensicReportModal] = useState(false);

  const [selectedDocForView, setSelectedDocForView] = useState(null);
  const [selectedAssetForCustody, setSelectedAssetForCustody] = useState(null);

  const [chainVerified, setChainVerified] = useState(false);
  const [verifyingChain, setVerifyingChain] = useState(false);

  const loadData = async () => {
    setLoading(true);

    try {
      const [c, d, u, a, ast, cr] = await Promise.all([
        getCases(),
        getAllDocuments(),
        getUsers(),
        getAuditLogs(),
        getAllAssets(),
        getCourtRequests()
      ]);

      setCases(c || []);
      setDocuments(d || []);
      setUsers(u || []);
      setAuditLogs(a || []);
      setAssets(ast || []);
      setCourtRequests(cr || []);
    } catch (err) {
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRole]);

  const handleVerifyChain = async () => {
    setVerifyingChain(true);

    try {
      await verifyAuditChain();

      setChainVerified(true);

      setTimeout(() => {
        setChainVerified(false);
      }, 5000);
    } catch (err) {
      console.error('Audit verification failed:', err);
    } finally {
      setVerifyingChain(false);
    }
  };

  if (loading) {
    return (
      <div className="page dashboard-loading">
        <div className="spinner dashboard-spinner" />

        <span className="dashboard-loading-text">
          Loading Nyaya Setu cryptographic ledger...
        </span>
      </div>
    );
  }

  const openCases = cases.filter(
    c => c.status === 'OPEN'
  ).length;

  /*
  ============================================================
  ADMIN DASHBOARD
  ============================================================
  */

  const renderAdminDashboard = () => (
    <div className="dashboard-content">

      {/* METRICS */}
      <section className="dashboard-section">
        <div className="dashboard-stat-grid">

          <StatCard
            title="Total Cases"
            value={cases.length}
            subtitle="State & Central registries"
            icon={Briefcase}
            trend="+12.4%"
            trendDirection="up"
            color="teal"
          />

          <StatCard
            title="Open Cases"
            value={openCases}
            subtitle="Active investigation & trial"
            icon={AlertCircle}
            trend="7 in trial"
            trendDirection="neutral"
            color="amber"
          />

          <StatCard
            title="Documents"
            value={documents.length}
            subtitle="100% SHA-256 verified"
            icon={FileText}
            trend="+18 new"
            trendDirection="up"
            color="sky"
          />

          <StatCard
            title="Active Users"
            value={users.length}
            subtitle="Across 4 national agencies"
            icon={Users}
            trend="4 roles"
            trendDirection="neutral"
            color="purple"
          />

        </div>
      </section>

      {/* VERIFICATION STATUS */}
      {chainVerified && (
        <section className="verification-banner">
          <div className="verification-content">
            <ShieldCheck size={18} />

            <span>
              Cryptographic Merkle tree audit verified.
              100% block integrity intact across all national nodes.
            </span>
          </div>

          <span className="verification-pass">
            PASS
          </span>
        </section>
      )}

      {/* ADMIN OPERATIONS */}
      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <span className="section-kicker">
              Administration
            </span>

            <h2>
              Administrative Operations
            </h2>
          </div>
        </div>

        <div className="operations-grid">

          <Link to="/cases" className="dashboard-action-card">
            <div className="action-card-left">
              <div className="action-icon action-icon-teal">
                <Plus size={18} />
              </div>

              <div>
                <span className="action-title">
                  Register Case
                </span>

                <span className="action-description">
                  Open a new investigation file
                </span>
              </div>
            </div>

            <ChevronRight size={16} className="action-arrow" />
          </Link>

          <button
            type="button"
            onClick={() => setShowDocUpload(true)}
            className="dashboard-action-card"
          >
            <div className="action-card-left">
              <div className="action-icon action-icon-blue">
                <FileText size={18} />
              </div>

              <div>
                <span className="action-title">
                  Upload Document
                </span>

                <span className="action-description">
                  Hash and seal file
                </span>
              </div>
            </div>

            <ChevronRight size={16} className="action-arrow" />
          </button>

          <button
            type="button"
            onClick={handleVerifyChain}
            disabled={verifyingChain}
            className="dashboard-action-card"
          >
            <div className="action-card-left">
              <div className="action-icon action-icon-teal">
                <ShieldCheck size={18} />
              </div>

              <div>
                <span className="action-title">
                  Verify Ledger
                </span>

                <span className="action-description">
                  {verifyingChain
                    ? 'Checking integrity…'
                    : 'Scan cryptographic hash chain'}
                </span>
              </div>
            </div>

            <ChevronRight size={16} className="action-arrow" />
          </button>

          <Link to="/users" className="dashboard-action-card">
            <div className="action-card-left">
              <div className="action-icon action-icon-purple">
                <Users size={18} />
              </div>

              <div>
                <span className="action-title">
                  User Access
                </span>

                <span className="action-description">
                  Manage roles and permissions
                </span>
              </div>
            </div>

            <ChevronRight size={16} className="action-arrow" />
          </Link>

        </div>
      </section>

      {/* CASE REGISTRY */}
      <section className="dashboard-section">

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">
            <div className="panel-heading-group">
              <div className="panel-heading-icon">
                <Briefcase size={17} />
              </div>

              <div>
                <h3>
                  National Case Registry
                </h3>

                <span>
                  Latest registered investigations
                </span>
              </div>
            </div>

            <Link to="/cases" className="panel-link">
              View all
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="dashboard-table-wrapper">

            {cases.length === 0 ? (
              <div className="empty-dashboard">
                <EmptyState
                  title="No cases on file"
                  description="Create the first investigation case in the registry."
                  actionLabel="Create Case"
                  onAction={() => {
                    window.location.href = '/cases';
                  }}
                />
              </div>
            ) : (
              <table className="table dashboard-table">

                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Title & Offence</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {cases.slice(0, 5).map(c => (

                    <tr key={c.id}>

                      <td>
                        <span className="badge badge-info font-mono text-xs">
                          {c.case_number}
                        </span>
                      </td>

                      <td>
                        <div className="table-primary-text">
                          {c.title}
                        </div>

                        <div className="table-secondary-text">
                          {c.acts_sections || 'BNS / IT Act'}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`priority-badge ${
                            c.priority === 'CRITICAL'
                              ? 'priority-critical'
                              : c.priority === 'HIGH'
                                ? 'priority-high'
                                : 'priority-normal'
                          }`}
                        >
                          {c.priority || 'NORMAL'}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            c.status === 'OPEN'
                              ? 'badge-warn'
                              : c.status === 'CLOSED'
                                ? 'badge-accent'
                                : 'badge-info'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/cases/${c.id}`}
                          className="btn btn-secondary dashboard-manage-btn"
                        >
                          Manage
                        </Link>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>
            )}

          </div>
        </div>

      </section>

      {/* SYSTEM + ACTIVITY */}
      <section className="dashboard-bottom-grid">

        {/* SYSTEM STATUS */}
        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div className="panel-heading-group">

              <div className="panel-heading-icon">
                <Server size={17} />
              </div>

              <div>
                <h3>
                  System Status
                </h3>

                <span>
                  Infrastructure & security
                </span>
              </div>

            </div>

          </div>

          <div className="system-status-body">

            <div className="status-row">
              <div>
                <span className="status-label">
                  Merkle integrity
                </span>

                <span className="status-subtext">
                  Root 8f4c19…d3c5
                </span>
              </div>

              <span className="status-valid">
                <CheckCircle2 size={14} />
                Valid
              </span>
            </div>

            <div className="storage-block">

              <div className="storage-header">
                <span>
                  Encrypted storage
                </span>

                <strong>
                  42.8 / 100 GB
                </strong>
              </div>

              <div className="storage-bar">
                <div
                  className="storage-progress"
                  style={{ width: '42.8%' }}
                />
              </div>

            </div>

            <div className="security-grid">

              <div className="security-item">
                <span>Encryption</span>
                <strong>AES-256-GCM</strong>
              </div>

              <div className="security-item">
                <span>HSM enclave</span>
                <strong>FIPS 140-3</strong>
              </div>

            </div>

            <div className="nodes-block">

              <span className="status-label">
                Connected nodes
              </span>

              <div className="node-list">

                {[
                  'NCRB HQ Delhi',
                  'CFSL CBI Lab',
                  'Cyber Courts',
                  'EOW Mumbai'
                ].map(node => (

                  <div key={node} className="node-item">
                    <span className="node-dot" />
                    {node}
                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

        {/* RECENT ACTIVITY */}
        <div className="dashboard-panel activity-panel">

          <div className="dashboard-panel-header">

            <div className="panel-heading-group">

              <div className="panel-heading-icon">
                <Activity size={17} />
              </div>

              <div>
                <h3>
                  Recent Activity
                </h3>

                <span>
                  Latest audit events
                </span>
              </div>

            </div>

            <Link to="/audit" className="panel-link">
              Full trail
              <ChevronRight size={14} />
            </Link>

          </div>

          <div className="activity-list">

            {auditLogs.slice(0, 6).map((log, index) => (

              <div
                key={log.id || index}
                className="activity-item"
              >

                <div className="activity-avatar">
                  {log.user_role?.substring(0, 2) || 'AD'}
                </div>

                <div className="activity-content">

                  <div className="activity-top">

                    <span className="activity-user">
                      {log.user_name || 'Authorized officer'}
                    </span>

                    <span className="activity-time">
                      {new Date(log.timestamp).toLocaleTimeString(
                        [],
                        {
                          hour: '2-digit',
                          minute: '2-digit'
                        }
                      )}
                    </span>

                  </div>

                  <p>
                    {log.action?.replace(/_/g, ' ')}
                    {log.details
                      ? ` — ${log.details}`
                      : ''}
                  </p>

                </div>

              </div>

            ))}

            {auditLogs.length === 0 && (
              <div className="activity-empty">
                No recent audit activity.
              </div>
            )}

          </div>

        </div>

      </section>

    </div>
  );

  /*
  ============================================================
  INVESTIGATOR DASHBOARD
  ============================================================
  */

  const renderInvestigatorDashboard = () => {

    const myCases = cases.filter(
      c =>
        c.assigned_io_id === 2 ||
        c.assigned_io_id === user?.id
    );

    const myDocs = documents.filter(
      d =>
        d.uploader_id === 2 ||
        d.case_id === 1
    );

    return (
      <div className="dashboard-content">

        <section className="dashboard-stat-grid">

          <StatCard
            title="My Assigned Cases"
            value={myCases.length || 3}
            subtitle="Active criminal investigations"
            icon={Briefcase}
            trend="Active IO"
            color="teal"
          />

          <StatCard
            title="Pending Documents"
            value={4}
            subtitle="Awaiting witness/IO signature"
            icon={FileText}
            trend="2 urgent"
            trendDirection="up"
            color="amber"
          />

          <StatCard
            title="Seized Evidence Items"
            value={assets.length || 4}
            subtitle="Secured in evidence locker"
            icon={HardDrive}
            trend="Seals intact"
            color="sky"
          />

          <StatCard
            title="Upcoming Court Dates"
            value={2}
            subtitle="Patiala House Cyber Court"
            icon={Scale}
            trend="Sep 18 & 22"
            color="purple"
          />

        </section>

        <section className="dashboard-section">

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div className="panel-heading-group">
                <div className="panel-heading-icon">
                  <Briefcase size={17} />
                </div>

                <div>
                  <h3>Active Cases</h3>
                  <span>
                    {myCases.length} assigned investigations
                  </span>
                </div>
              </div>

            </div>

            <div className="dashboard-table-wrapper">

              <table className="table dashboard-table">

                <thead>
                  <tr>
                    <th>Case #</th>
                    <th>Title</th>
                    <th>Offences</th>
                    <th>Court</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {myCases.map(c => (

                    <tr key={c.id}>

                      <td>
                        <span className="badge badge-info font-mono">
                          {c.case_number}
                        </span>
                      </td>

                      <td className="table-primary-text">
                        {c.title}
                      </td>

                      <td className="table-mono-text">
                        {c.acts_sections}
                      </td>

                      <td className="table-secondary-text">
                        {c.court_jurisdiction}
                      </td>

                      <td>
                        <span className="badge badge-warn">
                          {c.status}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/cases/${c.id}`}
                          className="btn btn-secondary dashboard-manage-btn"
                        >
                          Case Detail
                        </Link>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </section>

        <section className="dashboard-two-column">

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div className="panel-heading-group">
                <div className="panel-heading-icon">
                  <FileText size={17} />
                </div>

                <div>
                  <h3>Investigation Documents</h3>
                  <span>Recent case documents</span>
                </div>
              </div>

              <button
                onClick={() => setShowDocUpload(true)}
                className="panel-link"
              >
                Upload
              </button>

            </div>

            <div className="document-list">

              {myDocs.map(d => (

                <div
                  key={d.id}
                  onClick={() => setSelectedDocForView(d)}
                  className="document-list-item"
                >

                  <div>
                    <span className="document-name">
                      {d.filename}
                    </span>

                    <span className="document-hash">
                      SHA-256 {d.sha256_hash?.substring(0, 16)}…
                      {' · '}
                      v{d.current_version || 1}
                    </span>
                  </div>

                  <span className="badge badge-accent">
                    {d.document_type}
                  </span>

                </div>

              ))}

            </div>

          </div>

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div className="panel-heading-group">
                <div className="panel-heading-icon">
                  <Clock size={17} />
                </div>

                <div>
                  <h3>Chronology</h3>
                  <span>CR-2026-0891</span>
                </div>
              </div>

            </div>

            <div className="timeline">

              <div className="timeline-item">
                <div className="timeline-meta">
                  2026-08-14 · 09:30 IST
                </div>

                <h4>
                  Zero FIR registered
                </h4>

                <p>
                  Cyber PS Rohini on FIU requisition.
                </p>
              </div>

              <div className="timeline-item">
                <div className="timeline-meta">
                  2026-08-16 · 18:00 IST
                </div>

                <h4>
                  Raid and NVMe seizure
                </h4>

                <p>
                  Seized under Section 105 BNSS panchnama.
                </p>
              </div>

              <div className="timeline-item">
                <div className="timeline-meta">
                  2026-08-20 · 11:45 IST
                </div>

                <h4>
                  Custody transfer to CFSL
                </h4>

                <p>
                  Transferred to Dr. Aarav Nambiar for imaging.
                </p>
              </div>

            </div>

          </div>

        </section>

      </div>
    );
  };

  /*
  ============================================================
  JUDGE DASHBOARD
  ============================================================
  */

  const renderCourtDashboard = () => (
    <div className="dashboard-content">

      <section className="dashboard-stat-grid">

        <StatCard
          title="Cases Under Hearing"
          value={4}
          subtitle="Active trial docket"
          icon={Scale}
          trend="Next: Sep 12"
          color="amber"
        />

        <StatCard
          title="Pending Submissions"
          value={3}
          subtitle="From Prosecution / CFSL"
          icon={FileText}
          trend="2 urgent"
          trendDirection="up"
          color="rose"
        />

        <StatCard
          title="Judgments Pronounced"
          value={8}
          subtitle="Cryptographically sealed"
          icon={ShieldCheck}
          trend="100% indexed"
          color="teal"
        />

        <StatCard
          title="Court Requisitions"
          value={courtRequests.length}
          subtitle="Issued under Sec 91 CrPC"
          icon={Send}
          trend="Active"
          color="sky"
        />

      </section>

      <section className="dashboard-section">

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div className="panel-heading-group">
              <div className="panel-heading-icon">
                <Scale size={17} />
              </div>

              <div>
                <h3>Hearing Docket</h3>
                <span>Scheduled court matters</span>
              </div>
            </div>

            <span className="panel-counter">
              4 scheduled
            </span>

          </div>

          <div className="dashboard-table-wrapper">

            <table className="table dashboard-table">

              <thead>
                <tr>
                  <th>Case #</th>
                  <th>Matter & Title</th>
                  <th>Hearing Date</th>
                  <th>Investigating Officer</th>
                  <th>Jurisdiction</th>
                  <th>Digital Record</th>
                </tr>
              </thead>

              <tbody>

                {cases.slice(0, 4).map(c => (

                  <tr key={c.id}>

                    <td>
                      <span className="badge badge-warn font-mono">
                        {c.case_number}
                      </span>
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {c.title}
                      </div>

                      <div className="table-secondary-text">
                        {c.acts_sections}
                      </div>
                    </td>

                    <td className="table-date">
                      {c.hearing_date
                        ? new Date(
                            c.hearing_date
                          ).toLocaleDateString()
                        : '2026-09-18'}
                    </td>

                    <td className="table-mono-text">
                      {c.assigned_io_name}
                    </td>

                    <td className="table-secondary-text">
                      {c.court_jurisdiction}
                    </td>

                    <td>
                      <Link
                        to={`/cases/${c.id}`}
                        className="btn btn-secondary dashboard-manage-btn"
                      >
                        Inspect
                      </Link>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </section>

      <section className="dashboard-two-column">

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div className="panel-heading-group">
              <div className="panel-heading-icon">
                <Send size={17} />
              </div>

              <div>
                <h3>Requisitions</h3>
                <span>Active court requests</span>
              </div>
            </div>

            <button
              onClick={() => setShowRequestModal(true)}
              className="panel-link"
            >
              Issue
            </button>

          </div>

          <div className="request-list">

            {courtRequests.map(cr => (

              <div
                key={cr.id}
                className="request-item"
              >

                <div className="request-top">

                  <span className="request-title">
                    {cr.case_number}: {cr.request_type}
                  </span>

                  <span className="badge badge-danger">
                    {cr.priority}
                  </span>

                </div>

                <p>
                  To {cr.requested_to} · Due {cr.due_date}
                </p>

                <span className="request-status">
                  {cr.status}
                </span>

              </div>

            ))}

          </div>

        </div>

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div className="panel-heading-group">
              <div className="panel-heading-icon">
                <ShieldCheck size={17} />
              </div>

              <div>
                <h3>Orders</h3>
                <span>Recent judicial records</span>
              </div>
            </div>

            <button
              onClick={() => setShowJudgmentModal(true)}
              className="panel-link"
            >
              Upload
            </button>

          </div>

          <div className="order-card">

            <div className="order-top">
              <span>
                CR-2026-0891 · Bail rejection
              </span>

              <span className="badge badge-accent">
                Sealed
              </span>
            </div>

            <p>
              Pronounced 28 Aug 2026
            </p>

          </div>

        </div>

      </section>

    </div>
  );

  /*
  ============================================================
  FORENSIC DASHBOARD
  ============================================================
  */

  const renderForensicDashboard = () => (
    <div className="dashboard-content">

      <section className="dashboard-stat-grid">

        <StatCard
          title="Assigned Evidence Items"
          value={assets.length || 4}
          subtitle="Physical/Digital media in vault"
          icon={Microscope}
          trend="All seals intact"
          color="purple"
        />

        <StatCard
          title="Pending Lab Reports"
          value={2}
          subtitle="Memory & malware reverse engineering"
          icon={FileText}
          trend="Due in 48 hrs"
          color="amber"
        />

        <StatCard
          title="Reports Submitted"
          value={6}
          subtitle="Digitally signed with CFSL Key"
          icon={ShieldCheck}
          trend="100% verified"
          color="teal"
        />

        <StatCard
          title="Court Requisitions"
          value={2}
          subtitle="Formal inquiries from Judge"
          icon={Scale}
          trend="1 immediate"
          color="rose"
        />

      </section>

      <section className="dashboard-section">

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div className="panel-heading-group">
              <div className="panel-heading-icon">
                <HardDrive size={17} />
              </div>

              <div>
                <h3>Lab Custody</h3>
                <span>Evidence currently under examination</span>
              </div>
            </div>

            <span className="panel-counter">
              {assets.length} items
            </span>

          </div>

          <div className="dashboard-table-wrapper">

            <table className="table dashboard-table">

              <thead>
                <tr>
                  <th>Asset #</th>
                  <th>Exhibit Description</th>
                  <th>Evidence Type</th>
                  <th>Physical Seal #</th>
                  <th>Lab Location</th>
                  <th>Chain of Custody</th>
                </tr>
              </thead>

              <tbody>

                {assets.map(a => (

                  <tr key={a.id}>

                    <td>
                      <span className="badge badge-info font-mono">
                        {a.asset_number}
                      </span>
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {a.name}
                      </div>

                      <div className="table-secondary-text">
                        Case {a.case_number || 'CR-2026-0891'}
                      </div>
                    </td>

                    <td className="table-mono-text">
                      {a.asset_type}
                    </td>

                    <td>
                      <span className="seal-badge">
                        {a.seal_number || 'SEAL-INTACT'}
                      </span>
                    </td>

                    <td className="table-secondary-text">
                      {a.location}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          setSelectedAssetForCustody(a)
                        }
                        className="btn btn-secondary dashboard-custody-btn"
                      >
                        <ShieldCheck size={12} />
                        Track Custody
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </div>
  );

  return (
    <div className="page dashboard-page">

      {/* PAGE HEADER */}

      <header className="page-header dashboard-header">

        <div className="page-heading">

          <span className="page-eyebrow">
            {activeRole === 'ADMIN' &&
              'Administrator · Overview'}

            {activeRole === 'IO' &&
              'Investigating Officer · Overview'}

            {activeRole === 'JUDGE' &&
              'Court Docket · Overview'}

            {activeRole === 'FORENSIC_EXPERT' &&
              'Forensic Laboratory · Overview'}
          </span>

          <h1 className="page-title">

            {activeRole === 'ADMIN' &&
              'National Digital Evidence & Asset Management Registry'}

            {activeRole === 'IO' &&
              'Active Case & Evidence Workstation'}

            {activeRole === 'JUDGE' &&
              'Judicial Review & Court Submissions'}

            {activeRole === 'FORENSIC_EXPERT' &&
              'Forensic Analysis & Custody Operations'}

          </h1>

          <p className="page-description">

            {activeRole === 'ADMIN' &&
              'Monitor registered criminal cases, evidentiary documents, authorized personnel, and chain-of-custody activity.'}

            {activeRole === 'IO' &&
              'Manage your active investigations, upload new evidence, and track chain-of-custody transfers.'}

            {activeRole === 'JUDGE' &&
              'Review case files, verify cryptographic evidence integrity, and record official court judgments.'}

            {activeRole === 'FORENSIC_EXPERT' &&
              'Receive evidence, log analytical findings, and submit digitally signed examination reports.'}

          </p>

        </div>

        <div className="page-actions">

          {activeRole === 'IO' && (
            <button
              onClick={() => setShowDocUpload(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Upload document
            </button>
          )}

          {activeRole === 'JUDGE' && (
            <>
              <button
                onClick={() => setShowRequestModal(true)}
                className="btn btn-secondary"
              >
                <Send size={15} />
                Requisition
              </button>

              <button
                onClick={() => setShowJudgmentModal(true)}
                className="btn btn-primary"
              >
                <Scale size={15} />
                Record order
              </button>
            </>
          )}

          {activeRole === 'FORENSIC_EXPERT' && (
            <>
              <button
                onClick={() => setShowIntakeModal(true)}
                className="btn btn-secondary"
              >
                <Plus size={15} />
                Evidence intake
              </button>

              <button
                onClick={() => setShowForensicReportModal(true)}
                className="btn btn-primary"
              >
                <Microscope size={15} />
                Submit report
              </button>
            </>
          )}

        </div>

      </header>

      {/* DASHBOARD */}

      {activeRole === 'ADMIN' &&
        renderAdminDashboard()}

      {activeRole === 'IO' &&
        renderInvestigatorDashboard()}

      {activeRole === 'JUDGE' &&
        renderCourtDashboard()}

      {activeRole === 'FORENSIC_EXPERT' &&
        renderForensicDashboard()}

      {/* MODALS */}

      {showDocUpload && (
        <DocumentUploadModal
          availableCases={cases}
          onClose={() => setShowDocUpload(false)}
          onSuccess={loadData}
        />
      )}

      {showJudgmentModal && (
        <JudgmentUploadModal
          availableCases={cases}
          onClose={() => setShowJudgmentModal(false)}
          onSuccess={loadData}
        />
      )}

      {showRequestModal && (
        <DocumentRequestModal
          availableCases={cases}
          onClose={() => setShowRequestModal(false)}
          onSuccess={loadData}
        />
      )}

      {showIntakeModal && (
        <EvidenceIntakeModal
          availableCases={cases}
          onClose={() => setShowIntakeModal(false)}
          onSuccess={loadData}
        />
      )}

      {showForensicReportModal && (
        <ForensicReportModal
          availableCases={cases}
          availableAssets={assets}
          onClose={() =>
            setShowForensicReportModal(false)
          }
          onSuccess={loadData}
        />
      )}

      {selectedDocForView && (
        <DocumentViewerModal
          document={selectedDocForView}
          onClose={() => setSelectedDocForView(null)}
          onRefresh={loadData}
        />
      )}

      {selectedAssetForCustody && (
        <ChainOfCustodyModal
          asset={selectedAssetForCustody}
          events={
            assets.find(
              a => a.id === selectedAssetForCustody.id
            )?.events || [
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
                  'Seized during authorized raid.'
              },
              {
                id: 2,
                action: 'LAB_INTAKE_RECEIVED',
                from_name: 'Sub-Inspector Anil Kumar',
                to_name: 'Dr. Aarav Nambiar (CFSL)',
                timestamp: '2026-08-20T11:45:00Z',
                location: 'CFSL Clean Room 2',
                seal_status:
                  'Seal Checked & Intact',
                remarks:
                  'Bitstream image created under write-blocker.'
              }
            ]
          }
          onClose={() =>
            setSelectedAssetForCustody(null)
          }
          onRefresh={loadData}
        />
      )}

    </div>
  );
};

export default Dashboard;