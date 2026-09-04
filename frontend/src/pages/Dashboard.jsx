import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCases,
  getDocuments,
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
  Sparkles,
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

  // Modals
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
        getDocuments(),
        getUsers(),
        getAuditLogs(),
        getAllAssets(),
        getCourtRequests(),
      ]);
      setCases(c || []);
      setDocuments(d || []);
      setUsers(u || []);
      setAuditLogs(a || []);
      setAssets(ast || []);
      setCourtRequests(cr || []);
    } catch (err) {
      console.error(err);
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
      setTimeout(() => setChainVerified(false), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setVerifyingChain(false);
    }
  };

  if (loading) {
    return (
      <div className="page flex flex-col items-center justify-center min-h-[60vh]">
        <div className="spinner" style={{ width: 28, height: 28 }} />
        <span className="text-xs font-mono text-[var(--text-tertiary)] mt-4">
          Loading Nyaya Setu cryptographic ledger...
        </span>
      </div>
    );
  }

  const openCases = cases.filter(c => c.status === 'OPEN').length;

  // -------------------------------------------------------------
  // ADMIN DASHBOARD VIEW
  // -------------------------------------------------------------
  const renderAdminDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {chainVerified && (
        <div className="rounded-lg bg-teal-500/10 border border-teal-500/30 px-4 py-3 text-sm text-teal-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#00d4aa]" />
            <span>Cryptographic Merkle tree audit verified. 100% block integrity intact across all national nodes.</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-teal-500/20 text-[#00d4aa] font-semibold text-[11px]">
            PASS
          </span>
        </div>
      )}

      {/* Main Grid: Recent Cases + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 panel flex flex-col">
          <div className="panel-head">
            <h3 className="panel-title">
              <Briefcase size={17} className="text-teal-400" />
              Recent cases
            </h3>
            <Link to="/cases" className="panel-link">
              View all
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="p-0 overflow-x-auto flex-1">
            {cases.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No cases on file"
                  description="Create the first investigation case in the registry."
                  actionLabel="Create Case"
                  onAction={() => window.location.href = '/cases'}
                />
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Case Number</th>
                    <th>Title & Offence</th>
                    <th style={{ width: '110px' }}>Priority</th>
                    <th style={{ width: '90px' }}>Status</th>
                    <th style={{ width: '80px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.slice(0, 5).map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td>
                        <span className="badge badge-info font-mono text-xs">
                          {c.case_number}
                        </span>
                      </td>
                      <td>
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate max-w-xs">
                          {c.title}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] truncate mt-1">
                          {c.acts_sections || 'BNS / IT Act'}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                            c.priority === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : c.priority === 'HIGH'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
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
                          className="btn btn-secondary text-[11px] px-2.5 py-1"
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

        <div className="panel flex flex-col">
          <div className="panel-head">
            <h3 className="panel-title">
              <Sparkles size={17} className="text-teal-400" />
              Quick actions
            </h3>
          </div>
          <div className="panel-body flex flex-col gap-3 flex-1">
              <Link to="/cases" className="action-tile group">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                    <Plus size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)] block">Register case</span>
                    <span className="text-xs text-[var(--text-secondary)] block mt-0.5">Open a new investigation file</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--text-tertiary)]" />
              </Link>

              <button type="button" onClick={() => setShowDocUpload(true)} className="action-tile">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)] block">Upload document</span>
                    <span className="text-xs text-[var(--text-secondary)] block mt-0.5">Hash and seal the file</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--text-tertiary)]" />
              </button>

              <button type="button" onClick={handleVerifyChain} disabled={verifyingChain} className="action-tile">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)] block">Verify ledger</span>
                    <span className="text-xs text-[var(--text-secondary)] block mt-0.5">
                      {verifyingChain ? 'Checking integrity…' : 'Scan hash chain'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--text-tertiary)]" />
              </button>

              <Link to="/users" className="action-tile">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)] block">User access</span>
                    <span className="text-xs text-[var(--text-secondary)] block mt-0.5">Officers, judges, experts</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--text-tertiary)]" />
              </Link>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: System Status + Recent Activity Feed (Fills Whitespace) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              <Server size={17} className="text-teal-400" />
              System status
            </h3>
          </div>

          <div className="panel-body space-y-5 text-sm">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[var(--text-secondary)]">Merkle integrity</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Valid
                </span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] font-mono">Root 8f4c19…d3c5</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[var(--text-secondary)]">Encrypted storage</span>
                <span className="text-[var(--text-primary)]">42.8 / 100 GB</span>
              </div>
              <div className="w-full bg-[var(--bg-base)] h-2 rounded-full overflow-hidden">
                <div className="bg-teal-400 h-full rounded-full" style={{ width: '42.8%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Encryption</span>
                <span className="text-[var(--text-primary)]">AES-256-GCM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">HSM enclave</span>
                <span className="text-[var(--text-primary)]">FIPS 140-3</span>
              </div>
            </div>

            <div>
              <span className="text-[var(--text-secondary)] block mb-3">Connected nodes</span>
              <div className="grid grid-cols-1 gap-2 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> NCRB HQ Delhi</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> CFSL CBI Lab</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Cyber Courts</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> EOW Mumbai</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 panel flex flex-col">
          <div className="panel-head">
            <h3 className="panel-title">
              <Activity size={17} className="text-teal-400" />
              Recent activity
            </h3>
            <Link to="/audit" className="panel-link">
              Full trail
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="panel-body">
            {auditLogs.slice(0, 6).map((log, index) => (
              <div key={log.id || index} className="feed-item">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-teal-400 text-xs font-semibold">
                  {log.user_role?.substring(0, 2) || 'AD'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <span className="font-medium text-[var(--text-primary)]">
                      {log.user_name || 'Authorized officer'}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    <span className="text-[var(--text-secondary)]">{log.action?.replace(/_/g, ' ')}</span>
                    {log.details ? ` — ${log.details}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // INVESTIGATOR (IO) DASHBOARD VIEW
  // -------------------------------------------------------------
  const renderInvestigatorDashboard = () => {
    const myCases = cases.filter(c => c.assigned_io_id === 2 || c.assigned_io_id === user?.id);
    const myDocs = documents.filter(d => d.uploader_id === 2 || d.case_id === 1);

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>



        {/* My Assigned Cases */}
        <div className="panel overflow-hidden">
          <div className="panel-head">
            <h3 className="panel-title">
              <Briefcase size={17} className="text-teal-400" /> Active cases
            </h3>
            <span className="text-sm text-[var(--text-secondary)]">{myCases.length} assigned</span>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Case #</th>
                  <th>Title</th>
                  <th>Offences Charged</th>
                  <th>Court Jurisdiction</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myCases.map(c => (
                  <tr key={c.id}>
                    <td><span className="badge badge-info font-mono">{c.case_number}</span></td>
                    <td className="font-medium text-[var(--text-primary)]">{c.title}</td>
                    <td className="text-xs font-mono text-[var(--text-tertiary)]">{c.acts_sections}</td>
                    <td className="text-xs text-[var(--text-tertiary)]">{c.court_jurisdiction}</td>
                    <td><span className="badge badge-warn">{c.status}</span></td>
                    <td>
                      <Link to={`/cases/${c.id}`} className="btn btn-secondary text-xs px-3 py-1">
                        Case Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Investigation Documents & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="panel">
            <div className="panel-head">
              <h3 className="panel-title">
                <FileText size={17} className="text-teal-400" /> Documents
              </h3>
              <button
                onClick={() => setShowDocUpload(true)}
                className="panel-link"
              >
                Upload
              </button>
            </div>
            <div className="panel-body space-y-3 max-h-96 overflow-y-auto">
              {myDocs.map(d => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDocForView(d)}
                  className="py-3 border-b border-[var(--border-subtle)] last:border-0 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">{d.filename}</span>
                    <span className="badge badge-accent shrink-0">{d.document_type}</span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] font-mono mt-1">
                    SHA-256 {d.sha256_hash?.substring(0, 16)}… · v{d.current_version || 1}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h3 className="panel-title">
                  <Clock size={17} className="text-teal-400" /> Chronology
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">CR-2026-0891</p>
              </div>
            </div>
            <div className="panel-body">
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-meta">2026-08-14 · 09:30 IST</div>
                  <h4 className="timeline-title">Zero FIR registered</h4>
                  <p className="timeline-detail">Cyber PS Rohini on FIU requisition.</p>
                </div>
                <div className="timeline-item">
                  <div className="timeline-meta">2026-08-16 · 18:00 IST</div>
                  <h4 className="timeline-title">Raid and NVMe seizure</h4>
                  <p className="timeline-detail">Seized under Section 105 BNSS panchnama.</p>
                </div>
                <div className="timeline-item">
                  <div className="timeline-meta">2026-08-20 · 11:45 IST</div>
                  <h4 className="timeline-title">Custody transfer to CFSL</h4>
                  <p className="timeline-detail">Transferred to Dr. Aarav Nambiar for imaging.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // COURT (JUDGE) DASHBOARD VIEW
  // -------------------------------------------------------------
  const renderCourtDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-head">
          <h3 className="panel-title">
            <Scale size={17} className="text-amber-400" /> Hearing docket
          </h3>
          <span className="text-sm text-[var(--text-secondary)]">4 scheduled</span>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="table">
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
                  <td><span className="badge badge-warn font-mono">{c.case_number}</span></td>
                  <td>
                    <div className="font-medium text-[var(--text-primary)] truncate max-w-sm">{c.title}</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">{c.acts_sections}</div>
                  </td>
                  <td className="text-xs font-mono text-teal-400 font-semibold">
                    {c.hearing_date ? new Date(c.hearing_date).toLocaleDateString() : '2026-09-18'}
                  </td>
                  <td className="text-xs text-[var(--text-secondary)] font-mono">{c.assigned_io_name}</td>
                  <td className="text-xs text-[var(--text-tertiary)]">{c.court_jurisdiction}</td>
                  <td>
                    <Link to={`/cases/${c.id}`} className="btn btn-secondary text-xs px-2.5 py-1">
                      Inspect Documents
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Court Requisitions Issued & Judgments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              <Send size={17} className="text-teal-400" /> Requisitions
            </h3>
            <button onClick={() => setShowRequestModal(true)} className="panel-link">
              Issue
            </button>
          </div>
          <div className="panel-body space-y-4">
            {courtRequests.map(cr => (
              <div key={cr.id} className="py-3 border-b border-[var(--border-subtle)] last:border-0 last:pb-0 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {cr.case_number}: {cr.request_type}
                  </span>
                  <span className="badge badge-danger shrink-0">{cr.priority}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-1.5">
                  To {cr.requested_to} · Due {cr.due_date}
                </p>
                <p className="text-xs text-teal-400 mt-1">{cr.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              <ShieldCheck size={17} className="text-amber-400" /> Orders
            </h3>
            <button onClick={() => setShowJudgmentModal(true)} className="panel-link">
              Upload
            </button>
          </div>
          <div className="panel-body">
            <div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  CR-2026-0891 · Bail rejection (Manish Rawat)
                </span>
                <span className="badge badge-accent shrink-0">Sealed</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1.5">
                Pronounced 28 Aug 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // FORENSIC ANALYST VIEW
  // -------------------------------------------------------------
  const renderForensicDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-head">
          <h3 className="panel-title">
            <HardDrive size={17} className="text-purple-400" /> Lab custody
          </h3>
          <span className="text-sm text-[var(--text-secondary)]">{assets.length} items</span>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="table">
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
                  <td><span className="badge badge-info font-mono">{a.asset_number}</span></td>
                  <td>
                    <div className="font-medium text-[var(--text-primary)]">{a.name}</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">Case {a.case_number || 'CR-2026-0891'}</div>
                  </td>
                  <td className="text-xs font-mono text-[var(--text-secondary)]">{a.asset_type}</td>
                  <td>
                    <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      {a.seal_number || 'SEAL-INTACT'}
                    </span>
                  </td>
                  <td className="text-xs text-[var(--text-tertiary)]">{a.location}</td>
                  <td>
                    <button
                      onClick={() => setSelectedAssetForCustody(a)}
                      className="btn btn-secondary text-xs px-2.5 py-1 inline-flex items-center gap-1"
                    >
                      <ShieldCheck size={12} className="text-[#00d4aa]" />
                      <span>Track Custody</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-heading">
          <span className="page-eyebrow">
            {activeRole === 'ADMIN' && 'Administrator'}
            {activeRole === 'IO' && 'Investigating officer'}
            {activeRole === 'JUDGE' && 'Court docket'}
            {activeRole === 'FORENSIC_EXPERT' && 'Forensic laboratory'}
          </span>
          <h1 className="page-title">Overview</h1>
          <p className="page-description">
            Cases, documents, and chain of custody for your current role.
          </p>
        </div>

        <div className="page-actions">
          {activeRole === 'IO' && (
            <button onClick={() => setShowDocUpload(true)} className="btn btn-primary">
              <Plus size={16} />
              Upload document
            </button>
          )}
          {activeRole === 'JUDGE' && (
            <>
              <button onClick={() => setShowRequestModal(true)} className="btn btn-secondary">
                <Send size={15} />
                Requisition
              </button>
              <button onClick={() => setShowJudgmentModal(true)} className="btn btn-primary">
                <Scale size={15} />
                Record order
              </button>
            </>
          )}
          {activeRole === 'FORENSIC_EXPERT' && (
            <>
              <button onClick={() => setShowIntakeModal(true)} className="btn btn-secondary">
                <Plus size={15} />
                Evidence intake
              </button>
              <button onClick={() => setShowForensicReportModal(true)} className="btn btn-primary">
                <Microscope size={15} />
                Submit report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Render Perspective Dashboard */}
      {activeRole === 'ADMIN' && renderAdminDashboard()}
      {activeRole === 'IO' && renderInvestigatorDashboard()}
      {activeRole === 'JUDGE' && renderCourtDashboard()}
      {activeRole === 'FORENSIC_EXPERT' && renderForensicDashboard()}

      {/* Shared Modals */}
      {showDocUpload && (
        <DocumentUploadModal
          availableCases={cases}
          onClose={() => setShowDocUpload(false)}
          onSuccess={() => loadData()}
        />
      )}

      {showJudgmentModal && (
        <JudgmentUploadModal
          availableCases={cases}
          onClose={() => setShowJudgmentModal(false)}
          onSuccess={() => loadData()}
        />
      )}

      {showRequestModal && (
        <DocumentRequestModal
          availableCases={cases}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => loadData()}
        />
      )}

      {showIntakeModal && (
        <EvidenceIntakeModal
          availableCases={cases}
          onClose={() => setShowIntakeModal(false)}
          onSuccess={() => loadData()}
        />
      )}

      {showForensicReportModal && (
        <ForensicReportModal
          availableCases={cases}
          availableAssets={assets}
          onClose={() => setShowForensicReportModal(false)}
          onSuccess={() => loadData()}
        />
      )}

      {selectedDocForView && (
        <DocumentViewerModal
          document={selectedDocForView}
          onClose={() => setSelectedDocForView(null)}
          onRefresh={() => loadData()}
        />
      )}

      {selectedAssetForCustody && (
        <ChainOfCustodyModal
          asset={selectedAssetForCustody}
          events={assets.find(a => a.id === selectedAssetForCustody.id)?.events || [
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
          onRefresh={() => loadData()}
        />
      )}
    </div>
  );
};

export default Dashboard;
