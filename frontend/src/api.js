const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('vitta_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // no body
  }

  if (!res.ok) {
    let message = 'Something went wrong. Please try again.';
    if (typeof data?.detail === 'string') {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail.map((d) => d.msg || JSON.stringify(d)).join(' ');
    }
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Public
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me', { auth: true }),
  getServices: () => request('/api/services'),
  getService: (slug) => request(`/api/services/${slug}`),
  getProperties: () => request('/api/properties'),
  submitLead: (payload) => request('/api/leads', { method: 'POST', body: payload }),
  getPublicContact: () => request('/api/auth/public-contact'),
  updateProfile: (payload) => request('/api/auth/profile', { method: 'PUT', body: payload, auth: true }),
  recoveryReset: (payload) => request('/api/auth/recovery-reset', { method: 'POST', body: payload }),
  getTestimonials: () => request('/api/testimonials'),
  submitTestimonial: (payload) => request('/api/testimonials/submit', { method: 'POST', body: payload }),
  listAllTestimonials: () => request('/api/testimonials/all', { auth: true }),
  createTestimonial: (payload) => request('/api/testimonials', { method: 'POST', body: payload, auth: true }),
  updateTestimonial: (id, payload) => request(`/api/testimonials/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteTestimonial: (id) => request(`/api/testimonials/${id}`, { method: 'DELETE', auth: true }),
  trackPageview: (path) => request('/api/analytics/pageview', { method: 'POST', body: { path } }).catch(() => {}),
  getAnalyticsSummary: () => request('/api/analytics/summary', { auth: true }),
  getAnnouncements: () => request('/api/announcements'),
  createAnnouncement: (payload) => request('/api/announcements', { method: 'POST', body: payload, auth: true }),
  deleteAnnouncement: (id) => request(`/api/announcements/${id}`, { method: 'DELETE', auth: true }),

  // Owner
  createAdmin: (payload) => request('/api/auth/create-admin', { method: 'POST', body: payload, auth: true }),
  listAdmins: () => request('/api/auth/admins', { auth: true }),
  deleteAdmin: (id) => request(`/api/auth/admins/${id}`, { method: 'DELETE', auth: true }),
  getActivityLog: () => request('/api/auth/activity', { auth: true }),
  deleteActivityEntry: (id) => request(`/api/auth/activity/${id}`, { method: 'DELETE', auth: true }),
  clearActivityLog: () => request('/api/auth/activity', { method: 'DELETE', auth: true }),

  // Credential change (OTP)
  requestOtp: (purpose, new_value) => request('/api/auth/request-otp', { method: 'POST', body: { purpose, new_value }, auth: true }),
  verifyOtp: (purpose, otp, new_value) => request('/api/auth/verify-otp', { method: 'POST', body: { purpose, otp, new_value }, auth: true }),

  // Admin — leads
  listLeads: () => request('/api/leads', { auth: true }),
  leadStats: () => request('/api/leads/stats', { auth: true }),
  updateLead: (id, payload) => request(`/api/leads/${id}`, { method: 'PATCH', body: payload, auth: true }),
  deleteLead: (id) => request(`/api/leads/${id}`, { method: 'DELETE', auth: true }),
  exportLeadsCsv: async () => {
    const token = localStorage.getItem('vitta_token');
    const res = await fetch(`${API_BASE}/api/leads/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  },

  // Admin — services
  createService: (payload) => request('/api/services', { method: 'POST', body: payload, auth: true }),
  updateService: (id, payload) => request(`/api/services/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteService: (id) => request(`/api/services/${id}`, { method: 'DELETE', auth: true }),

  // Service listings (items under a service)
  getServiceItems: (slug) => request(`/api/services/${slug}/items`),
  createServiceItem: (slug, payload) => request(`/api/services/${slug}/items`, { method: 'POST', body: payload, auth: true }),
  updateServiceItem: (itemId, payload) => request(`/api/services/items/${itemId}`, { method: 'PUT', body: payload, auth: true }),
  deleteServiceItem: (itemId) => request(`/api/services/items/${itemId}`, { method: 'DELETE', auth: true }),

  // Admin — properties
  createProperty: (payload) => request('/api/properties', { method: 'POST', body: payload, auth: true }),
  updateProperty: (id, payload) => request(`/api/properties/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteProperty: (id) => request(`/api/properties/${id}`, { method: 'DELETE', auth: true }),
};
