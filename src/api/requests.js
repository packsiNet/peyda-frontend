import { apiClient } from './apiClient.js';

export const requestsApi = {
  getAll: (type) => {
    const qs = type ? `?type=${type}` : '';
    return apiClient.get(`/api/requests${qs}`);
  },
  getById: (id) => apiClient.get(`/api/requests/${id}`),
  search: ({ type, currency, amount }) => {
    const p = new URLSearchParams({ type, currency, amount: String(amount) });
    return apiClient.get(`/api/requests/search?${p}`);
  },
  preview: (body) => apiClient.post('/api/requests/preview', body),
  create: (body) => apiClient.post('/api/requests', body),
  cancel: (id) => apiClient.delete(`/api/requests/${id}`),
};
