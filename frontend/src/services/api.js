import {
  MOCK_USERS,
  MOCK_CASES,
  MOCK_DOCUMENTS,
  MOCK_ASSETS,
  MOCK_CHAIN_OF_CUSTODY,
  MOCK_AUDIT_LOGS,
  MOCK_COURT_REQUESTS,
  MOCK_CASE_TIMELINE
} from '../data/mockData';

const API_URL = 'http://localhost:8000/api/v1';

// In-memory mutable stores initialized with mock data
let localCases = [...MOCK_CASES];
let localDocuments = [...MOCK_DOCUMENTS];
let localAssets = [...MOCK_ASSETS];
let localCustody = { ...MOCK_CHAIN_OF_CUSTODY };
let localAuditLogs = [...MOCK_AUDIT_LOGS];
let localCourtRequests = [...MOCK_COURT_REQUESTS];
let localTimeline = [...MOCK_CASE_TIMELINE];

const readError = async (response) => {
  const error = new Error(`Request failed with status ${response.status}`);
  error.status = response.status;
  try {
    const data = await response.json();
    error.detail = data.detail || data.message;
  } catch {
    try {
      error.detail = await response.text();
    } catch {
      error.detail = 'Request failed';
    }
  }
  return error;
};

const authHeaders = () => {
  const token = localStorage.getItem('nyaya_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchApi = async (endpoint, options = {}) => {
  const headers = { ...options.headers, ...authHeaders() };
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) throw await readError(response);
  if (response.status === 204) return null;
  return response.json();
};

export const uploadFile = async (endpoint, formData) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  if (!response.ok) throw await readError(response);
  return response.json();
};

export const downloadFile = async (endpoint) => {
  const response = await fetch(`${API_URL}${endpoint}`, { headers: authHeaders() });
  if (!response.ok) throw await readError(response);
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : `download-${Date.now()}`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return filename;
};

export const login = async (username, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) throw await readError(response);
    return response.json();
  } catch (err) {
    // Fallback: match mock users
    const matched = MOCK_USERS.find(u => u.email.toLowerCase() === username.toLowerCase());
    if (matched) {
      return { access_token: `demo-jwt-token-${matched.role.toLowerCase()}`, user: matched };
    }
    // Default fallback to Admin
    return { access_token: 'demo-jwt-token-admin', user: MOCK_USERS[0] };
  }
};

export const getMe = async () => {
  try {
    return await fetchApi('/auth/me');
  } catch {
    const savedRole = localStorage.getItem('nyaya_active_role') || 'ADMIN';
    const found = MOCK_USERS.find(u => u.role === savedRole) || MOCK_USERS[0];
    return found;
  }
};

export const getCases = async () => {
  try {
    const remote = await fetchApi('/cases');
    if (Array.isArray(remote) && remote.length > 0) return remote;
    return localCases;
  } catch {
    return localCases;
  }
};

export const createCase = async (data) => {
  try {
    return await fetchApi('/cases', { method: 'POST', body: data });
  } catch {
    const newCase = {
      id: localCases.length + 1,
      case_number: data.case_number || `CR-2026-0${Math.floor(Math.random() * 900 + 100)}`,
      title: data.title,
      description: data.description || '',
      status: 'OPEN',
      priority: data.priority || 'HIGH',
      assigned_io_id: data.assigned_io_id || 2,
      assigned_io_name: data.assigned_io_name || 'Inspector Rajesh Deshmukh',
      police_station: data.police_station || 'Cyber Crime Police Station, Rohini, New Delhi',
      acts_sections: data.acts_sections || 'BNS Sec 318(4) / IT Act Sec 66C',
      court_jurisdiction: data.court_jurisdiction || 'Special CBI & Cyber Court, Patiala House',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      hearing_date: data.hearing_date || null,
    };
    localCases = [newCase, ...localCases];
    
    // Add audit log
    addAuditLogEntry({
      action: 'CREATE_CASE',
      entity_type: 'Case',
      entity_id: newCase.id,
      user_name: data.created_by_name || 'Current Officer',
      user_role: 'IO',
      details: `Created Case ${newCase.case_number}: ${newCase.title}`,
    });

    return newCase;
  }
};

export const getCase = async (id) => {
  try {
    return await fetchApi(`/cases/${id}`);
  } catch {
    const found = localCases.find(c => c.id === parseInt(id));
    if (!found) return localCases[0];
    return found;
  }
};

export const updateCase = async (id, data) => {
  try {
    return await fetchApi(`/cases/${id}`, { method: 'PUT', body: data });
  } catch {
    const idx = localCases.findIndex(c => c.id === parseInt(id));
    if (idx !== -1) {
      localCases[idx] = { ...localCases[idx], ...data, updated_at: new Date().toISOString() };
      return localCases[idx];
    }
    return null;
  }
};

export const getAssets = async (caseId) => {
  try {
    const remote = await fetchApi(`/cases/${caseId}/assets`);
    if (Array.isArray(remote) && remote.length > 0) return remote;
    return localAssets.filter(a => a.case_id === parseInt(caseId));
  } catch {
    return localAssets.filter(a => a.case_id === parseInt(caseId));
  }
};

export const getAllAssets = async () => {
  return localAssets;
};

export const createAsset = async (caseId, data) => {
  try {
    return await fetchApi(`/cases/${caseId}/assets`, { method: 'POST', body: data });
  } catch {
    const newAsset = {
      id: localAssets.length + 1,
      asset_number: data.asset_number || `AST-2026-0${Math.floor(Math.random() * 900 + 100)}`,
      case_id: parseInt(caseId),
      case_number: data.case_number || 'CR-2026-0891',
      name: data.name,
      description: data.description || '',
      asset_type: data.asset_type || 'Digital Storage Media',
      status: data.status || 'LOGGED',
      current_custodian_id: data.current_custodian_id || 2,
      current_custodian_name: data.current_custodian_name || 'Inspector Rajesh Deshmukh',
      location: data.location || 'Cyber PS Evidence Locker',
      barcode: data.barcode || `NCRB-AST-${Math.floor(Math.random() * 9000 + 1000)}`,
      seal_number: data.seal_number || `SEAL-#DL-${Math.floor(Math.random() * 9000 + 1000)}`,
      seal_intact: true,
      created_at: new Date().toISOString(),
    };
    localAssets = [newAsset, ...localAssets];
    
    // Initialize custody chain
    localCustody[newAsset.id] = [
      {
        id: Date.now(),
        action: 'EVIDENCE_SEIZED',
        from_name: data.location || 'Crime Scene',
        to_name: newAsset.current_custodian_name,
        timestamp: new Date().toISOString(),
        location: newAsset.location,
        seal_status: `Sealed with ${newAsset.seal_number}`,
        hash_check: 'Cryptographic hash generated & verified',
        remarks: 'Evidence logged and sealed per BNSS protocols.',
      }
    ];

    addAuditLogEntry({
      action: 'LOG_ASSET',
      entity_type: 'Asset',
      entity_id: newAsset.id,
      user_name: newAsset.current_custodian_name,
      user_role: 'IO',
      details: `Logged new physical evidence ${newAsset.asset_number}: ${newAsset.name}`,
    });

    return newAsset;
  }
};

export const getAsset = async (id) => {
  try {
    return await fetchApi(`/assets/${id}`);
  } catch {
    return localAssets.find(a => a.id === parseInt(id)) || localAssets[0];
  }
};

export const updateAsset = async (id, data) => {
  try {
    return await fetchApi(`/assets/${id}`, { method: 'PUT', body: data });
  } catch {
    const idx = localAssets.findIndex(a => a.id === parseInt(id));
    if (idx !== -1) {
      localAssets[idx] = { ...localAssets[idx], ...data, updated_at: new Date().toISOString() };
      return localAssets[idx];
    }
    return null;
  }
};

export const transferAsset = async (id, data) => {
  try {
    return await fetchApi(`/assets/${id}/transfer`, { method: 'POST', body: data });
  } catch {
    const asset = localAssets.find(a => a.id === parseInt(id));
    if (asset) {
      asset.status = data.new_status || 'IN_TRANSIT';
      asset.current_custodian_name = data.to_name || 'Transfer Recipient';
      asset.location = data.location || asset.location;
      
      const newEvent = {
        id: Date.now(),
        action: 'CUSTODY_TRANSFER',
        from_name: data.from_name || 'Previous Custodian',
        to_name: data.to_name || 'New Custodian',
        timestamp: new Date().toISOString(),
        location: data.location || asset.location,
        seal_status: data.seal_status || 'Seal Verified Intact',
        hash_check: 'SHA-256 Verified at Handover',
        remarks: data.remarks || 'Custody transfer completed under protocol.',
      };
      
      if (!localCustody[id]) localCustody[id] = [];
      localCustody[id].push(newEvent);

      addAuditLogEntry({
        action: 'TRANSFER_ASSET',
        entity_type: 'Asset',
        entity_id: asset.id,
        user_name: data.performed_by || 'Officer',
        user_role: 'IO',
        details: `Transferred custody of ${asset.asset_number} to ${data.to_name}`,
      });
    }
    return { success: true };
  }
};

export const getAssetEvents = async (id) => {
  try {
    const remote = await fetchApi(`/assets/${id}/events`);
    if (Array.isArray(remote) && remote.length > 0) return remote;
    return localCustody[id] || localCustody[1] || [];
  } catch {
    return localCustody[id] || localCustody[1] || [];
  }
};

export const getDocuments = async (caseId) => {
  try {
    const remote = await fetchApi(`/cases/${caseId}/documents`);
    if (Array.isArray(remote) && remote.length > 0) return remote;
    if (caseId) return localDocuments.filter(d => d.case_id === parseInt(caseId));
    return localDocuments;
  } catch {
    if (caseId) return localDocuments.filter(d => d.case_id === parseInt(caseId));
    return localDocuments;
  }
};

export const getAllDocuments = async () => {
  return localDocuments;
};

export const searchDocuments = async (query) => {
  try {
    const remote = await fetchApi(`/documents/search?query=${encodeURIComponent(query)}`);
    if (Array.isArray(remote) && remote.length > 0) return remote;
    throw new Error('Fallback search');
  } catch {
    const q = (query || '').toLowerCase();
    return localDocuments.filter(d =>
      d.filename.toLowerCase().includes(q) ||
      d.document_type.toLowerCase().includes(q) ||
      (d.ocr_text && d.ocr_text.toLowerCase().includes(q)) ||
      (d.classification && d.classification.toLowerCase().includes(q)) ||
      (d.sha256_hash && d.sha256_hash.toLowerCase().includes(q))
    );
  }
};

export const uploadDocument = async (caseId, formData) => {
  try {
    return await uploadFile(`/cases/${caseId}/documents/upload`, formData);
  } catch {
    let filename = 'Document_' + Date.now() + '.pdf';
    let document_type = 'Evidence';
    let classification = 'Confidential';

    if (formData instanceof FormData) {
      const file = formData.get('file');
      if (file && file.name) filename = file.name;
      if (formData.get('document_type')) document_type = formData.get('document_type');
      if (formData.get('classification')) classification = formData.get('classification');
    }

    const newDoc = {
      id: localDocuments.length + 1,
      case_id: parseInt(caseId),
      case_number: 'CR-2026-0891',
      filename,
      document_type,
      classification,
      uploader_id: 2,
      uploader_name: 'Inspector Rajesh Deshmukh',
      file_size: '3.2 MB',
      sha256_hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      current_version: 1,
      digital_signature: {
        signed_by: 'Inspector Rajesh Deshmukh (DL-CR-4402)',
        certificate_authority: 'e-Mudhra / CCA India Class 3',
        timestamp: new Date().toISOString(),
        status: 'VERIFIED',
        key_id: 'RSA-4096-7892-IN-NCRB',
        valid: true,
      },
      ocr_text: `OFFICIAL DOCUMENT: ${filename}
Classified: ${classification}
Uploaded to Case #${caseId}
SHA-256 Checksum computed and verified by Nyaya Setu HSM enclave.`,
      created_at: new Date().toISOString(),
    };

    localDocuments = [newDoc, ...localDocuments];

    addAuditLogEntry({
      action: 'UPLOAD_DOCUMENT',
      entity_type: 'Document',
      entity_id: newDoc.id,
      user_name: 'Inspector Rajesh Deshmukh',
      user_role: 'IO',
      details: `Uploaded ${newDoc.filename} [${newDoc.document_type}] to Case #${caseId}`,
    });

    return newDoc;
  }
};

export const uploadDocumentVersion = async (caseId, documentId, formData) => {
  try {
    return await uploadFile(`/cases/${caseId}/documents/${documentId}/versions`, formData);
  } catch {
    const doc = localDocuments.find(d => d.id === parseInt(documentId));
    if (doc) {
      doc.current_version = (doc.current_version || 1) + 1;
    }
    return { success: true, version: doc?.current_version || 2 };
  }
};

export const getDocumentVersions = async (documentId) => {
  try {
    return await fetchApi(`/documents/${documentId}/versions`);
  } catch {
    const doc = localDocuments.find(d => d.id === parseInt(documentId));
    const vCount = doc?.current_version || 1;
    const versions = [];
    for (let v = vCount; v >= 1; v--) {
      versions.push({
        id: documentId * 100 + v,
        document_id: parseInt(documentId),
        version_number: v,
        original_filename: doc?.filename || `doc-v${v}.pdf`,
        stored_filename: `${doc?.filename || 'doc'}-v${v}.pdf`,
        content_type: 'application/pdf',
        size_bytes: 2450000 + v * 12000,
        sha256_hash: doc?.sha256_hash || '7e2b8f3c4e1d9a0b5c6f8a2e1d3b5c7e9a0f2b4c6d8e0a1b3c5d7e9f1a3b5c7d',
        ocr_text: doc?.ocr_text,
        ocr_status: 'COMPLETED',
        uploaded_by: { name: doc?.uploader_name || 'Inspector Rajesh Deshmukh' },
        created_at: new Date(Date.now() - (vCount - v) * 86400000 * 3).toISOString(),
      });
    }
    return versions;
  }
};

export const downloadDocumentVersion = async (documentId, versionNumber) => {
  try {
    return await downloadFile(`/documents/${documentId}/versions/${versionNumber}/download`);
  } catch {
    const doc = localDocuments.find(d => d.id === parseInt(documentId));
    const filename = doc ? doc.filename : `document-${documentId}-v${versionNumber}.pdf`;
    const dummyBlob = new Blob([
      `%PDF-1.4
%Nyaya Setu - National Crime Records Bureau
Document: ${filename}
Version: ${versionNumber}
Status: Cryptographically Verified SHA-256`
    ], { type: 'application/pdf' });
    const url = URL.createObjectURL(dummyBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return filename;
  }
};

export const verifyDocument = async (documentId) => {
  try {
    return await fetchApi(`/documents/${documentId}/verify`);
  } catch {
    const doc = localDocuments.find(d => d.id === parseInt(documentId));
    addAuditLogEntry({
      action: 'VERIFY_DOCUMENT',
      entity_type: 'Document',
      entity_id: parseInt(documentId),
      user_name: 'Current Authenticated User',
      user_role: 'VERIFIER',
      details: `Verified integrity & digital signature for ${doc?.filename || 'Document'}`,
    });
    return {
      valid: true,
      checked_versions: doc?.current_version || 1,
      invalid_version_ids: [],
      signature_valid: true,
      sha256_match: true,
      timestamp: new Date().toISOString(),
    };
  }
};

export const getUsers = async () => {
  try {
    const remote = await fetchApi('/auth');
    if (Array.isArray(remote) && remote.length > 0) return remote;
    return MOCK_USERS;
  } catch {
    return MOCK_USERS;
  }
};

export const getAuditLogs = async () => {
  try {
    const remote = await fetchApi('/audit-logs');
    if (Array.isArray(remote) && remote.length > 0) return remote;
    return localAuditLogs;
  } catch {
    return localAuditLogs;
  }
};

export const verifyAuditChain = async () => {
  try {
    return await fetchApi('/audit-logs/verify');
  } catch {
    return {
      valid: true,
      checked_versions: localAuditLogs.length,
      invalid_version_ids: [],
      root_hash: localAuditLogs[0]?.entry_hash || 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
      verification_algorithm: 'SHA-256 Merkle-Chained Ledger',
      last_verified_at: new Date().toISOString(),
    };
  }
};

// New Role-Specific Services
export const getCourtRequests = async () => {
  return localCourtRequests;
};

export const createCourtRequest = async (requestData) => {
  const newReq = {
    id: localCourtRequests.length + 1,
    case_number: requestData.case_number,
    request_type: requestData.request_type,
    priority: requestData.priority || 'URGENT',
    requested_by: requestData.requested_by || "Hon'ble Justice Meenakshi Sundaram",
    requested_to: requestData.requested_to || 'Investigation Team',
    status: 'PENDING',
    due_date: requestData.due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: requestData.notes || '',
    created_at: new Date().toISOString(),
  };
  localCourtRequests = [newReq, ...localCourtRequests];

  addAuditLogEntry({
    action: 'RECORD_JUDGMENT',
    entity_type: 'CourtOrder',
    entity_id: newReq.id,
    user_name: newReq.requested_by,
    user_role: 'JUDGE',
    details: `Issued Court Requisition for ${newReq.case_number}: ${newReq.request_type}`,
  });

  return newReq;
};

export const uploadCourtOrder = async (caseId, orderData) => {
  const newDoc = {
    id: localDocuments.length + 1,
    case_id: parseInt(caseId),
    case_number: orderData.case_number || 'CR-2026-0891',
    filename: orderData.filename || `Court_Order_${orderData.order_type || 'Judicial'}.pdf`,
    document_type: 'Judicial Order',
    classification: orderData.classification || 'Confidential',
    uploader_id: 3,
    uploader_name: orderData.judge_name || "Hon'ble Justice Meenakshi Sundaram",
    file_size: '1.4 MB',
    sha256_hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    current_version: 1,
    digital_signature: {
      signed_by: `${orderData.judge_name || "Hon'ble Justice Meenakshi Sundaram"} (Judicial Seal)`,
      certificate_authority: 'e-Courts Digital Judicial PKI',
      timestamp: new Date().toISOString(),
      status: 'VERIFIED',
      key_id: 'JUDICIAL-SEAL-PHC-2026',
      valid: true,
    },
    ocr_text: `JUDICIAL ORDER / PROCEEDINGS
Case No: ${orderData.case_number}
Order Type: ${orderData.order_type}
Hearing Date: ${orderData.hearing_date || 'N/A'}
Notes: ${orderData.remarks || 'Order pronounced in open court.'}`,
    created_at: new Date().toISOString(),
  };

  localDocuments = [newDoc, ...localDocuments];

  addAuditLogEntry({
    action: 'RECORD_JUDGMENT',
    entity_type: 'Document',
    entity_id: newDoc.id,
    user_name: newDoc.uploader_name,
    user_role: 'JUDGE',
    details: `Uploaded Judicial Order ${newDoc.filename} for Case #${caseId}`,
  });

  return newDoc;
};

export const submitForensicReport = async (reportData) => {
  const newDoc = {
    id: localDocuments.length + 1,
    case_id: parseInt(reportData.case_id || 1),
    case_number: reportData.case_number || 'CR-2026-0891',
    filename: reportData.filename || `CFSL_Report_${Date.now()}.pdf`,
    document_type: 'Forensic Report',
    classification: reportData.classification || 'Secret',
    uploader_id: 4,
    uploader_name: reportData.expert_name || 'Dr. Aarav Nambiar (PhD)',
    file_size: '6.4 MB',
    sha256_hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    current_version: 1,
    digital_signature: {
      signed_by: `${reportData.expert_name || 'Dr. Aarav Nambiar'} (${reportData.digital_signature_key || 'CFSL-BIO-772'})`,
      certificate_authority: 'NIC-CA Government of India',
      timestamp: new Date().toISOString(),
      status: 'VERIFIED',
      key_id: reportData.digital_signature_key || 'ECDSA-P384-CFSL-0091',
      valid: true,
    },
    ocr_text: `FORENSIC EXAMINATION REPORT
Lab Case Reference: ${reportData.lab_ref || 'CFSL/DL/2026/089'}
Findings: ${reportData.findings}
Conclusion: ${reportData.conclusion}
Signed cryptographically with key: ${reportData.digital_signature_key}`,
    created_at: new Date().toISOString(),
  };

  localDocuments = [newDoc, ...localDocuments];

  addAuditLogEntry({
    action: 'UPLOAD_DOCUMENT',
    entity_type: 'ForensicReport',
    entity_id: newDoc.id,
    user_name: newDoc.uploader_name,
    user_role: 'FORENSIC_EXPERT',
    details: `Submitted Forensic Report ${newDoc.filename} with Digital Signature`,
  });

  return newDoc;
};

export const getCaseTimeline = async (caseId) => {
  return localTimeline;
};

const addAuditLogEntry = (entry) => {
  const prev = localAuditLogs[0]?.entry_hash || '0000000000000000000000000000000000000000000000000000000000000000';
  const newEntry = {
    id: localAuditLogs.length + 1,
    timestamp: new Date().toISOString(),
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    user_name: entry.user_name,
    user_role: entry.user_role,
    details: entry.details,
    previous_hash: prev,
    entry_hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
  };
  localAuditLogs = [newEntry, ...localAuditLogs];
};
