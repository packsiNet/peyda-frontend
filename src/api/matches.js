import { apiClient } from './apiClient.js';

export const matchesApi = {
  getMy:                 ()        => apiClient.get('/api/matches/my'),
  getPendingConfirmation:()        => apiClient.get('/api/matches/pending-confirmation'),
  confirm:               (matchId) => apiClient.post(`/api/matches/${matchId}/confirm`),
  reject:                (matchId) => apiClient.post(`/api/matches/${matchId}/reject`),
  create:                (body)    => apiClient.post('/api/matches', body),
};
