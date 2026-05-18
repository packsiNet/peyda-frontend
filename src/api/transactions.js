import { apiClient } from './apiClient.js';

export const transactionsApi = {
  getAll: ({ type, status, page = 1, pageSize = 20 } = {}) => {
    const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (type)   p.set('type', type);
    if (status) p.set('status', status);
    return apiClient.get(`/api/transactions?${p}`);
  },
  getById: (id) => apiClient.get(`/api/transactions/${id}`),
  uploadScreenshot: (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.upload(`/api/transactions/${id}/screenshot`, fd);
  },
  confirm: (id) => apiClient.post(`/api/transactions/${id}/confirm`),
  settle:  (id) => apiClient.post(`/api/transactions/${id}/settle`),
};
