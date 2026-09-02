const API_URL = 'http://localhost:8000/api/v1';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('nyaya_token');
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is an object and not FormData, stringify it
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Something went wrong');
  }

  return response.json();
};

export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.json();
};

export const getMe = () => fetchApi('/auth/me');
export const getCases = () => fetchApi('/cases');
export const createCase = (data) => fetchApi('/cases', { method: 'POST', body: data });
export const getCase = (id) => fetchApi(`/cases/${id}`);
export const updateCase = (id, data) => fetchApi(`/cases/${id}`, { method: 'PUT', body: data });

export const getAssets = (caseId) => fetchApi(`/cases/${caseId}/assets`);
export const createAsset = (caseId, data) => fetchApi(`/cases/${caseId}/assets`, { method: 'POST', body: data });
export const getAsset = (id) => fetchApi(`/assets/${id}`);
export const updateAsset = (id, data) => fetchApi(`/assets/${id}`, { method: 'PUT', body: data });
export const transferAsset = (id, data) => fetchApi(`/assets/${id}/transfer`, { method: 'POST', body: data });
export const getAssetEvents = (id) => fetchApi(`/assets/${id}/events`);

export const getDocuments = (caseId) => fetchApi(`/cases/${caseId}/documents`);
export const createDocumentMetadata = (caseId, data) => fetchApi(`/cases/${caseId}/documents`, { method: 'POST', body: data });
export const getUsers = () => fetchApi('/auth'); // Wait, the endpoint is /auth, and we added GET / to router. So it's /auth.
