const API_URL = 'http://localhost:8000/api/v1';

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

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('nyaya_token');
  if (!token) throw new Error('Not authenticated');
  const headers = { ...options.headers, Authorization: `Bearer ${token}` };
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
  const token = localStorage.getItem('nyaya_token');
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw await readError(response);
  return response.json();
};

export const downloadFile = async (endpoint) => {
  const token = localStorage.getItem('nyaya_token');
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${API_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
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
};

export const getMe = async () => {
  return await fetchApi('/auth/me');
};

export const getCases = async () => {
  return await fetchApi('/cases');
};

export const createCase = async (data) => {
  return await fetchApi('/cases', { method: 'POST', body: data });
};

export const getCase = async (id) => {
  return await fetchApi(`/cases/${id}`);
};

export const updateCase = async (id, data) => {
  return await fetchApi(`/cases/${id}`, { method: 'PUT', body: data });
};

export const deleteCase = async (id) => {
  return await fetchApi(`/cases/${id}`, { method: 'DELETE' });
};


export const getAssets = async (caseId) => {
  return await fetchApi(`/cases/${caseId}/assets`);
};

export const getAllAssets = async () => {
  return [
    { id: 1, asset_number: "AST-2026-001", name: "iPhone 14 Pro - Subject A", case_number: "CR-2026-0891", asset_type: "Mobile Device", seal_number: "SEAL-A8912", location: "Locker A-12, CFSL Lab", current_custodian_name: "Dr. Aarav Nambiar" },
    { id: 2, asset_number: "AST-2026-002", name: "Seagate 2TB HDD", case_number: "CR-2026-0923", asset_type: "Storage Media", seal_number: "SEAL-B2144", location: "Imaging Bay 3", current_custodian_name: "Forensic Analyst Verma" },
    { id: 3, asset_number: "AST-2026-003", name: "ThinkPad X1 Carbon", case_number: "CR-2026-1001", asset_type: "Laptop", seal_number: "SEAL-C9011", location: "Locker B-04, Cyber Cell", current_custodian_name: "IO Rajesh Deshmukh" },
    { id: 4, asset_number: "AST-2026-004", name: "Ledger Nano X Wallet", case_number: "CR-2026-1045", asset_type: "Hardware Wallet", seal_number: "SEAL-X0099", location: "Secure Vault 1", current_custodian_name: "Dr. Aarav Nambiar" }
  ];
};

export const createAsset = async (caseId, data) => {
  return await fetchApi(`/cases/${caseId}/assets`, { method: 'POST', body: data });
};

export const getAsset = async (id) => {
  return await fetchApi(`/assets/${id}`);
};

export const updateAsset = async (id, data) => {
  return await fetchApi(`/assets/${id}`, { method: 'PUT', body: data });
};

export const transferAsset = async (id, data) => {
  return await fetchApi(`/assets/${id}/transfer`, { method: 'POST', body: data });
};

export const getAssetEvents = async (id) => {
  return await fetchApi(`/assets/${id}/events`);
};

export const getDocuments = async (caseId) => {
  return await fetchApi(`/cases/${caseId}/documents`);
};

export const getAllDocuments = async () => {
  return [
    { id: 101, filename: "Forensic_Report_CR-2026-0891.pdf", document_type: "Forensic Report", case_number: "CR-2026-0891", classification: "Top Secret", created_at: new Date().toISOString(), sha256_hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2", ocr_text: "Malware signatures identified." },
    { id: 102, filename: "Court_Order_Remand_0923.pdf", document_type: "Judicial Order", case_number: "CR-2026-0923", classification: "Confidential", created_at: new Date().toISOString(), sha256_hash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3", ocr_text: "Judicial remand granted." },
    { id: 103, filename: "Witness_Statement_JohnDoe.pdf", document_type: "Witness Statement", case_number: "CR-2026-1001", classification: "Confidential", created_at: new Date().toISOString(), sha256_hash: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4", ocr_text: "Witness testified seeing unauthorized access." },
    { id: 104, filename: "FIR_Copy_1045.pdf", document_type: "FIR", case_number: "CR-2026-1045", classification: "Confidential", created_at: new Date().toISOString(), sha256_hash: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5", ocr_text: "Initial complaint filed by cyber cell." },
    { id: 105, filename: "Seizure_Memo_HardDrive.pdf", document_type: "Evidence", case_number: "CR-2026-1050", classification: "Secret", created_at: new Date().toISOString(), sha256_hash: "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6", ocr_text: "Seized 2TB Seagate HDD." },
    { id: 106, filename: "Ballistics_Memory_Analysis.pdf", document_type: "Forensic Report", case_number: "CR-2026-1102", classification: "Top Secret", created_at: new Date().toISOString(), sha256_hash: "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1", ocr_text: "RAM dump analysis completed. Rootkit found." },
    { id: 107, filename: "Subpoena_Telecom_Provider.pdf", document_type: "Judicial Order", case_number: "CR-2026-1133", classification: "Secret", created_at: new Date().toISOString(), sha256_hash: "1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b", ocr_text: "Subpoena for call detail records." }
  ];
};

export const searchDocuments = async (query) => {
  const docs = await getAllDocuments();
  if (!query) return docs;
  const lowerQuery = query.toLowerCase();
  return docs.filter(d => 
    d.filename.toLowerCase().includes(lowerQuery) || 
    (d.ocr_text && d.ocr_text.toLowerCase().includes(lowerQuery)) ||
    (d.case_number && d.case_number.toLowerCase().includes(lowerQuery))
  );
};

export const uploadDocument = async (caseId, formData) => {
  return await uploadFile(`/cases/${caseId}/documents/upload`, formData);
};

export const uploadDocumentVersion = async (caseId, documentId, formData) => {
  return await uploadFile(`/cases/${caseId}/documents/${documentId}/versions`, formData);
};

export const getDocumentVersions = async (documentId) => {
  return await fetchApi(`/documents/${documentId}/versions`);
};

export const downloadDocumentVersion = async (documentId, versionNumber) => {
  return await downloadFile(`/documents/${documentId}/versions/${versionNumber}/download`);
};

export const verifyDocument = async (documentId) => {
  return await fetchApi(`/documents/${documentId}/verify`);
};

export const getUsers = async () => {
  return await fetchApi('/auth/users');
};

export const getAuditLogs = async () => {
  return [
    { id: 1001, timestamp: new Date(Date.now() - 5000000).toISOString(), user_id: 2, user: { name: "Rajesh Deshmukh", role: "IO" }, action: "CREATE_CASE", entity_type: "Case", entity_id: 1045, details: "Registered FIR for cyber fraud", current_hash: "2f3a4b...", previous_hash: "1e2d3c..." },
    { id: 1002, timestamp: new Date(Date.now() - 4000000).toISOString(), user_id: 3, user: { name: "Dr. Aarav Nambiar", role: "FORENSIC_EXPERT" }, action: "UPLOAD_DOCUMENT", entity_type: "Document", entity_id: 101, details: "Uploaded memory dump analysis", current_hash: "3a4b5c...", previous_hash: "2f3a4b..." },
    { id: 1003, timestamp: new Date(Date.now() - 3000000).toISOString(), user_id: 4, user: { name: "Justice Sundaram", role: "JUDGE" }, action: "VIEW_CASE", entity_type: "Case", entity_id: 891, details: "Reviewed case docket", current_hash: "4b5c6d...", previous_hash: "3a4b5c..." },
    { id: 1004, timestamp: new Date(Date.now() - 2000000).toISOString(), user_id: 1, user: { name: "Admin", role: "ADMIN" }, action: "UPDATE_USER", entity_type: "User", entity_id: 2, details: "Updated access level", current_hash: "5c6d7e...", previous_hash: "4b5c6d..." },
    { id: 1005, timestamp: new Date(Date.now() - 1000000).toISOString(), user_id: 2, user: { name: "Rajesh Deshmukh", role: "IO" }, action: "SEIZE_ASSET", entity_type: "Asset", entity_id: 3, details: "Seized ThinkPad laptop", current_hash: "6d7e8f...", previous_hash: "5c6d7e..." }
  ];
};

export const verifyAuditChain = async () => {
  return await fetchApi('/audit-logs/verify');
};

export const uploadCourtOrder = async (caseId, data) => {
  return await fetchApi(`/cases/${caseId}/court-orders`, { method: 'POST', body: data });
};

export const getCourtRequests = async () => {
  return [
    { id: 1, case_number: "CR-2026-0891", request_type: "Digital Forensics Report", requested_by: "Hon'ble Justice Meenakshi Sundaram", requested_to: "CFSL Lab", due_date: new Date(Date.now() + 86400000 * 2).toISOString(), priority: "URGENT", status: "PENDING" },
    { id: 2, case_number: "CR-2026-0923", request_type: "Seizure Memo", requested_by: "Hon'ble Justice Meenakshi Sundaram", requested_to: "Investigating Officer (IO Rajesh Deshmukh)", due_date: new Date(Date.now() + 86400000 * 5).toISOString(), priority: "NORMAL", status: "FULFILLED" },
    { id: 3, case_number: "CR-2026-1001", request_type: "Witness Statement", requested_by: "Hon'ble Justice Meenakshi Sundaram", requested_to: "Economic Offences Wing", due_date: new Date(Date.now() - 86400000 * 1).toISOString(), priority: "URGENT", status: "OVERDUE" }
  ];
};

export const getCaseTimeline = async (caseId) => {
  return [
    { id: 1, action: "FIR Registered", timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), description: "Initial complaint filed by cyber cell.", performed_by_name: "IO Rajesh Deshmukh" },
    { id: 2, action: "Evidence Seized", timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), description: "Seized ThinkPad laptop from suspect premises.", performed_by_name: "IO Rajesh Deshmukh" },
    { id: 3, action: "Forensic Analysis", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), description: "Completed memory dump and hash verification.", performed_by_name: "Dr. Aarav Nambiar" },
    { id: 4, action: "Report Submitted", timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), description: "Forensic report sealed and uploaded to blockchain.", performed_by_name: "Dr. Aarav Nambiar" },
    { id: 5, action: "Judicial Review", timestamp: new Date().toISOString(), description: "Case docket accessed by the honorable court.", performed_by_name: "Justice Sundaram" }
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const createCourtRequest = async (data) => {
  return { success: true, ...data };
};

export const submitForensicReport = async (data) => {
  return { success: true, ...data };
};
