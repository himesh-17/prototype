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

export const getAssets = async (caseId) => {
  return await fetchApi(`/cases/${caseId}/assets`);
};

export const getAllAssets = async () => {
  return await fetchApi('/cases');
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
  return await fetchApi('/documents/search?query=');
};

export const searchDocuments = async (query) => {
  return await fetchApi(`/documents/search?query=${encodeURIComponent(query)}`);
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
  return await fetchApi('/audit-logs');
};

export const verifyAuditChain = async () => {
  return await fetchApi('/audit-logs/verify');
};
