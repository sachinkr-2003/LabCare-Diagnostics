export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data?.data ?? data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const patientApi = {
  getAll: (search = '') => request(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getById: (id) => request(`/patients/${id}`),
  create: (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/patients/${id}`, { method: 'DELETE' }),
};

export const testApi = {
  getAll: (search = '', category = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    const queryString = params.toString();
    return request(`/tests${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => request(`/tests/${id}`),
  create: (data) => request('/tests', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/tests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/tests/${id}`, { method: 'DELETE' }),
};

export const orderApi = {
  getAll: (status = '') => request(`/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  getById: (id) => request(`/orders/${id}`),
  create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  delete: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
};

export const resultApi = {
  getByOrderId: (orderId) => request(`/results/${orderId}`),
  search: (query) => request(`/results/search?query=${encodeURIComponent(query)}`),
  getSuggestions: (query = '') => request(`/results/suggestions/list${query ? `?query=${encodeURIComponent(query)}` : ''}`),
  save: (orderId, results, doctor_name) => request(`/results/${orderId}`, { method: 'POST', body: JSON.stringify({ results, doctor_name }) }),
};

export const reportApi = {
  getAll: (search = '', status = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All Status') params.append('status', status);
    const queryString = params.toString();
    return request(`/reports${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => request(`/reports/${id}`),
  search: (query) => request(`/reports/search?q=${encodeURIComponent(query)}`),
  delete: (id) => request(`/reports/${id}`, { method: 'DELETE' }),
};

export const settingsApi = {
  get: () => request('/settings'),
  update: (data) => request('/settings', { method: 'POST', body: JSON.stringify(data) }),
};

export const dashboardApi = {
  getStats: () => request('/dashboard/stats'),
};

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  verifyMe: () => request('/auth/me'),
  changePassword: (data) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
};

export const backupApi = {
  getStats: () => request('/backup/stats'),
  downloadDbUrl: `${API_BASE}/backup/download`,
  exportPatientsUrl: `${API_BASE}/backup/export-patients`,
  exportOrdersUrl: `${API_BASE}/backup/export-orders`,
};
