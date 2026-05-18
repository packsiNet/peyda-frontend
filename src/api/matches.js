import { apiClient } from './apiClient.js';

export const matchesApi = {
  getMy:  ()     => apiClient.get('/api/matches/my'),
  create: (body) => apiClient.post('/api/matches', body),
};
