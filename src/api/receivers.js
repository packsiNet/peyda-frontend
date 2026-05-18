import { apiClient } from './apiClient.js';

export const receiversApi = {
  getAll: () => apiClient.get('/api/receivers'),
  create: (body) => apiClient.post('/api/receivers', body),
  remove: (id) => apiClient.delete(`/api/receivers/${id}`),
};
