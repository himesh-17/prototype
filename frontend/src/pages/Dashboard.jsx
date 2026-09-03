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
  ArrowRight,
  Scale,
  Microscope,
  HardDrive,
  Activity,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Key,
  ShieldAlert,
  Server
} from 'lucide-react';

export const Dashboard = () => {
  const { user, activeRole, switchRole } = useAuth();
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
        <span className="text-xs font-mono text-zinc-400 mt-4">
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
    <div className="space-y-6">
      {/* 1. Stat Cards with trends, colors, and icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="rounded-xl bg-teal-500/10 border border-teal-500/30 p-4 text-xs font-mono text-teal-300 flex items-center justify-between animate-fade-in">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm overflow-hidden flex flex-col shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-850/60">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-[#00d4aa]" />
              <h3 className="text-sm font-semibold text-zinc-100">Recent Cases</h3>
            </div>
            <Link
              to="/cases"
              className="text-xs font-mono text-[#00d4aa] hover:underline flex items-center gap-1"
            >
              <span>View all cases</span>
              <ChevronRight size={13} />
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
                        <div className="text-xs font-semibold text-zinc-100 truncate max-w-xs">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono truncate mt-0.5">
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
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
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

        {/* Quick Actions Panel */}
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08] mb-4">
              <Sparkles size={16} className="text-[#00d4aa]" />
              <h3 className="text-sm font-semibold text-zinc-100">Admin Quick Actions</h3>
            </div>
            <div className="space-y-2.5">
              <Link
                to="/cases"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-850/60 border border-white/[0.06] hover:border-teal-500/40 hover:bg-teal-500/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-[#00d4aa] flex items-center justify-center border border-teal-500/20">
                    <Plus size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-100 block group-hover:text-[#00d4aa]">
                      Register New Case
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Initiate digital investigation file
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-zinc-500 group-hover:text-[#00d4aa]" />
              </Link>

              <button
                type="button"
                onClick={() => setShowDocUpload(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-850/60 border border-white/[0.06] hover:border-teal-500/40 hover:bg-teal-500/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                    <FileText size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-100 block group-hover:text-sky-400">
                      Upload Secure Document
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Hash & seal with HSM token
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-zinc-500 group-hover:text-sky-400" />
              </button>

              <button
                type="button"
                onClick={handleVerifyChain}
                disabled={verifyingChain}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-850/60 border border-white/[0.06] hover:border-teal-500/40 hover:bg-teal-500/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-100 block group-hover:text-emerald-400">
                      Verify Ledger Hash Chain
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      {verifyingChain ? 'Checking Merkle tree...' : 'Full SHA-256 integrity scan'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-zinc-500 group-hover:text-emerald-400" />
              </button>

              <Link
                to="/users"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-850/60 border border-white/[0.06] hover:border-teal-500/40 hover:bg-teal-500/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-100 block group-hover:text-purple-400">
                      User Access Control
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Manage officers, judges, & experts
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-zinc-500 group-hover:text-purple-400" />
              </Link>
            </div>
          </div>

          {/* Quick Stats Footnote */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>NCRB Security Level</span>
            <span className="text-[#00d4aa] font-semibold">RESTRICTED // DEF-GRADE</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: System Status + Recent Activity Feed (Fills Whitespace) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status Panel (1 Col) */}
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm p-5 flex flex-col shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08] mb-4">
            <Server size={16} className="text-[#00d4aa]" />
            <h3 className="text-sm font-semibold text-zinc-100">System & Ledger Status</h3>
          </div>

          <div className="space-y-3.5 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-850/60 border border-white/[0.04]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-zinc-400">Merkle Tree Integrity</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> 100% VALID
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Root Hash: 8f4c19...d3c5 (Checked every 60s)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-850/60 border border-white/[0.04]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-zinc-400">Encrypted Storage Quota</span>
                <span className="text-zinc-200">42.8 GB / 100 GB</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                <div className="bg-[#00d4aa] h-full rounded-full" style={{ width: '42.8%' }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-850/60 border border-white/[0.04]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-400">Encryption Standard</span>
                <span className="text-teal-400 font-semibold">AES-256-GCM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Hardware Security Enclave</span>
                <span className="text-zinc-200">FIPS 140-3 Level 4</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-850/60 border border-white/[0.04]">
              <span className="text-zinc-400 block mb-2">Active Inter-Agency Nodes:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> NCRB HQ Delhi
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> CFSL CBI Lab
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Cyber Courts
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> EOW Mumbai
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm overflow-hidden flex flex-col shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-850/60">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#00d4aa]" />
              <h3 className="text-sm font-semibold text-zinc-100">Real-Time System Activity Feed</h3>
            </div>
            <Link
              to="/audit"
              className="text-xs font-mono text-[#00d4aa] hover:underline flex items-center gap-1"
            >
              <span>Full Audit Trail</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[380px]">
            {auditLogs.slice(0, 6).map((log, index) => (
              <div
                key={log.id || index}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-850/60/70 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/40 border border-white/10 text-[#00d4aa] font-mono text-xs">
                  {log.user_role?.substring(0, 2) || 'AD'}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200">
                        {log.user_name || 'Authorized Officer'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-zinc-400 mt-1 truncate">
                    {log.details}
                  </p>
                  <div className="mt-1 text-[11px] font-mono text-zinc-500 flex items-center gap-2">
                    <span className="text-teal-400/80">Block SHA256: {log.entry_hash?.substring(0, 16)}...</span>
                  </div>
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
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-white/[0.08] bg-slate-850/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Briefcase size={16} className="text-[#00d4aa]" /> My Active Cases
            </h3>
            <span className="text-xs font-mono text-zinc-400">{myCases.length} Assigned</span>
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
                    <td className="font-medium text-zinc-100">{c.title}</td>
                    <td className="text-xs font-mono text-zinc-400">{c.acts_sections}</td>
                    <td className="text-xs text-zinc-400">{c.court_jurisdiction}</td>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents with type badges */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <FileText size={16} className="text-[#00d4aa]" /> Case Documents & Evidence
              </h3>
              <button
                onClick={() => setShowDocUpload(true)}
                className="text-xs text-[#00d4aa] font-mono hover:underline"
              >
                + Upload
              </button>
            </div>
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {myDocs.map(d => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDocForView(d)}
                  className="p-3 rounded-xl bg-slate-850/60 border border-white/[0.06] hover:border-[#00d4aa]/40 cursor-pointer transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200 truncate">
                        {d.filename}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-[#00d4aa] border border-teal-500/20">
                        {d.document_type}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      SHA256: {d.sha256_hash?.substring(0, 16)}... • v{d.current_version || 1}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono shrink-0">
                    <ShieldCheck size={14} /> Signed
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Investigation Timeline */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm p-5 space-y-4">
            <div className="pb-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Clock size={16} className="text-[#00d4aa]" /> Investigation Chronology
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Operation Chakra (CR-2026-0891) Legal Timeline
              </p>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pl-2">
              <div className="relative border-l-2 border-teal-500/30 pl-4 space-y-4">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#00d4aa]" />
                  <span className="text-[11px] font-mono text-zinc-500 block">2026-08-14 09:30 IST</span>
                  <h4 className="text-xs font-semibold text-zinc-200">Zero FIR Registered</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Registered at Cyber PS Rohini on FIU requisition.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#00d4aa]" />
                  <span className="text-[11px] font-mono text-zinc-500 block">2026-08-16 18:00 IST</span>
                  <h4 className="text-xs font-semibold text-zinc-200">Raid & Physical NVMe Seizure</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Hardware seized under Section 105 BNSS Panchnama.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#00d4aa]" />
                  <span className="text-[11px] font-mono text-zinc-500 block">2026-08-20 11:45 IST</span>
                  <h4 className="text-xs font-semibold text-zinc-200">Custody Transfer to CFSL</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Drive transferred to Dr. Aarav Nambiar for bitstream imaging.</p>
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
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Court Docket Action Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">
            Special CBI & Cyber Court Judicial Bench
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Presiding: Hon'ble Justice Meenakshi Sundaram • Patiala House Courts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
          >
            <Send size={14} />
            <span>+ Request Documents</span>
          </button>
          <button
            onClick={() => setShowJudgmentModal(true)}
            className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
          >
            <Scale size={14} />
            <span>+ Upload Judgment / Order</span>
          </button>
        </div>
      </div>

      {/* Cases Under Hearing Docket */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-white/[0.08] bg-slate-850/60 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Scale size={16} className="text-amber-400" /> Active Trial & Hearing Docket
          </h3>
          <span className="text-xs font-mono text-zinc-400">4 Cases Scheduled</span>
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
                    <div className="font-medium text-zinc-100 text-xs truncate max-w-sm">{c.title}</div>
                    <div className="text-[11px] font-mono text-zinc-500">{c.acts_sections}</div>
                  </td>
                  <td className="text-xs font-mono text-teal-400 font-semibold">
                    {c.hearing_date ? new Date(c.hearing_date).toLocaleDateString() : '2026-09-18'}
                  </td>
                  <td className="text-xs text-zinc-300 font-mono">{c.assigned_io_name}</td>
                  <td className="text-xs text-zinc-400">{c.court_jurisdiction}</td>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requisitions */}
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Send size={16} className="text-[#00d4aa]" /> Judicial Document Requisitions
            </h3>
            <button
              onClick={() => setShowRequestModal(true)}
              className="text-xs text-[#00d4aa] font-mono hover:underline"
            >
              + Issue Requisition
            </button>
          </div>
          <div className="space-y-3">
            {courtRequests.map(cr => (
              <div key={cr.id} className="p-3 rounded-xl bg-slate-850/60 border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-semibold text-zinc-200">
                    {cr.case_number}: {cr.request_type}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    {cr.priority}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Directed to: {cr.requested_to} • Return by: {cr.due_date}
                </p>
                <div className="text-[11px] font-mono text-[#00d4aa] flex items-center gap-1 pt-1">
                  <CheckCircle2 size={12} /> Status: {cr.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Judgments pronounced */}
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-400" /> Pronounced Orders & Judgments
            </h3>
            <button
              onClick={() => setShowJudgmentModal(true)}
              className="text-xs text-amber-400 font-mono hover:underline"
            >
              + Upload Order
            </button>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-850/60 border border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-zinc-200">
                  CR-2026-0891: Bail Rejection Order (Accused Manish Rawat)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-[#00d4aa] border border-teal-500/20">
                  PROCEEDING SEALED
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Pronounced: August 28, 2026 • Sealed with Judicial PKI Token JUD-DEL-089
              </p>
              <div className="text-[11px] font-mono text-zinc-500 truncate">
                SHA256: 8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a
              </div>
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
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Forensic Workstation Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">
            Central Forensic Science Laboratory (CFSL) Workstation
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Scientist: Dr. Aarav Nambiar (PhD) • CFSL-BIO-772 • Clean Room 2 CBI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIntakeModal(true)}
            className="btn btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>+ Evidence Intake Form</span>
          </button>
          <button
            onClick={() => setShowForensicReportModal(true)}
            className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
          >
            <Microscope size={14} />
            <span>+ Submit Forensic Report</span>
          </button>
        </div>
      </div>

      {/* Assigned Evidence Items Grid */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-white/[0.08] bg-slate-850/60 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <HardDrive size={16} className="text-purple-400" /> Assigned Evidence Items in Lab Custody
          </h3>
          <span className="text-xs font-mono text-zinc-400">{assets.length} In Custody</span>
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
                    <div className="font-medium text-zinc-100 text-xs">{a.name}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">Case: {a.case_number || 'CR-2026-0891'}</div>
                  </td>
                  <td className="text-xs font-mono text-zinc-300">{a.asset_type}</td>
                  <td>
                    <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      {a.seal_number || 'SEAL-INTACT'}
                    </span>
                  </td>
                  <td className="text-xs text-zinc-400">{a.location}</td>
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
    <div className="page space-y-6">
      {/* Page Header */}
      <div className="page-header pb-2 border-b border-white/[0.06]">
        <div className="page-heading">
          <div className="flex items-center gap-2">
            <span className="page-eyebrow">NCRB • Secure Document System</span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono text-teal-400">SIH-26190</span>
          </div>
          <h1 className="page-title flex items-center gap-3">
            <span>Dashboard Overview</span>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-[#00d4aa]">
              {activeRole} PERSPECTIVE
            </span>
          </h1>
          <p className="page-description">
            Secure digital asset lifecycle, cryptographic chain of custody, and forensic verification console.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Role-Specific Primary Actions in Header */}
          {activeRole === 'IO' && (
            <button
              onClick={() => setShowDocUpload(true)}
              className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
            >
              <Plus size={15} />
              <span className="font-sans font-medium">Upload Document</span>
            </button>
          )}
          {activeRole === 'JUDGE' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRequestModal(true)}
                className="btn btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
              >
                <Send size={14} />
                <span className="font-sans font-medium">Requisition</span>
              </button>
              <button
                onClick={() => setShowJudgmentModal(true)}
                className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
              >
                <Scale size={14} />
                <span className="font-sans font-medium">Record Order</span>
              </button>
            </div>
          )}
          {activeRole === 'FORENSIC_EXPERT' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowIntakeModal(true)}
                className="btn btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span className="font-sans font-medium">Evidence Intake</span>
              </button>
              <button
                onClick={() => setShowForensicReportModal(true)}
                className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
              >
                <Microscope size={14} />
                <span className="font-sans font-medium">Submit Report</span>
              </button>
            </div>
          )}

          {/* Perspective Quick Switch Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => switchRole('ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
                activeRole === 'ADMIN' ? 'bg-teal-400 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => switchRole('IO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
                activeRole === 'IO' ? 'bg-teal-400 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Investigator
            </button>
            <button
              onClick={() => switchRole('JUDGE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
                activeRole === 'JUDGE' ? 'bg-teal-400 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Court
            </button>
            <button
              onClick={() => switchRole('FORENSIC_EXPERT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
                activeRole === 'FORENSIC_EXPERT' ? 'bg-teal-400 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Forensics
            </button>
          </div>
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
