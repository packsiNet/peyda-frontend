import { apiClient } from './apiClient.js';

const REQUEST_TYPE = { Send: 0, Receive: 1 };

export const requestsApi = {
  getAll: (type) => {
    const typeNum = type != null ? (REQUEST_TYPE[type] ?? type) : null;
    const qs = typeNum != null ? `?type=${typeNum}` : '';
    return apiClient.get(`/api/Requests${qs}`);
  },
  getById: (id) => apiClient.get(`/api/Requests/${id}`),
  search: ({ type, currency, amount }) => {
    const p = new URLSearchParams({ type, currency, amount: String(amount) });
    return apiClient.get(`/api/Requests/search?${p}`);
  },
  preview: (body) => apiClient.post('/api/Requests/preview', body),
  create: (body) => apiClient.post('/api/Requests', body),
  cancel: (id) => apiClient.delete(`/api/Requests/${id}`),
};
