export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Fast in-memory cache for static/infrequent data
const apiCache = new Map();

function getCached(key, ttlMs) {
  const item = apiCache.get(key);
  if (item && (Date.now() - item.time < ttlMs)) {
    return item.data;
  }
  return null;
}

function setCached(key, data) {
  apiCache.set(key, { data, time: Date.now() });
}

export function clearApiCache(prefix = '') {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) apiCache.delete(key);
  }
}

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
  getAll: (search = '', limit = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit);
    const qs = params.toString();
    return request(`/patients${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => request(`/patients/${id}`),
  create: (data) => {
    clearApiCache('/patients');
    clearApiCache('/dashboard');
    return request('/patients', { method: 'POST', body: JSON.stringify(data) });
  },
  update: (id, data) => {
    clearApiCache('/patients');
    return request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  delete: (id) => {
    clearApiCache('/patients');
    clearApiCache('/dashboard');
    return request(`/patients/${id}`, { method: 'DELETE' });
  },
};

export const testApi = {
  getAll: async (search = '', category = '') => {
    const cacheKey = `/tests_${search}_${category}`;
    if (!search && (!category || category === 'All')) {
      const cached = getCached(cacheKey, 30000); // 30s cache for tests catalogue
      if (cached) return cached;
    }
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    const queryString = params.toString();
    const data = await request(`/tests${queryString ? `?${queryString}` : ''}`);
    if (!search && (!category || category === 'All')) {
      setCached(cacheKey, data);
    }
    return data;
  },
  getById: (id) => request(`/tests/${id}`),
  create: (data) => {
    clearApiCache('/tests');
    return request('/tests', { method: 'POST', body: JSON.stringify(data) });
  },
  update: (id, data) => {
    clearApiCache('/tests');
    return request(`/tests/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  delete: (id) => {
    clearApiCache('/tests');
    return request(`/tests/${id}`, { method: 'DELETE' });
  },
};

export const orderApi = {
  getAll: (status = '') => request(`/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  getById: (id) => request(`/orders/${id}`),
  create: (data) => {
    clearApiCache('/dashboard');
    return request('/orders', { method: 'POST', body: JSON.stringify(data) });
  },
  updateStatus: (id, status) => {
    clearApiCache('/dashboard');
    return request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  },
  delete: (id) => {
    clearApiCache('/dashboard');
    return request(`/orders/${id}`, { method: 'DELETE' });
  },
};

export const resultApi = {
  getByOrderId: (orderId) => request(`/results/${orderId}`),
  search: (query) => request(`/results/search?query=${encodeURIComponent(query)}`),
  getSuggestions: (query = '') => request(`/results/suggestions/list${query ? `?query=${encodeURIComponent(query)}` : ''}`),
  save: (orderId, results, doctor_name) => {
    clearApiCache('/dashboard');
    return request(`/results/${orderId}`, { method: 'POST', body: JSON.stringify({ results, doctor_name }) });
  },
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
  delete: (id) => {
    clearApiCache('/dashboard');
    return request(`/reports/${id}`, { method: 'DELETE' });
  },
};

export const settingsApi = {
  get: async () => {
    const cached = getCached('/settings', 60000); // 60s cache for lab settings
    if (cached) return cached;
    const data = await request('/settings');
    setCached('/settings', data);
    return data;
  },
  update: async (data) => {
    clearApiCache('/settings');
    return request('/settings', { method: 'POST', body: JSON.stringify(data) });
  },
};

export const dashboardApi = {
  getStats: async () => {
    const cached = getCached('/dashboard/stats', 10000); // 10s cache
    if (cached) return cached;
    const data = await request('/dashboard/stats');
    setCached('/dashboard/stats', data);
    return data;
  },
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
