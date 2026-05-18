import { apiClient } from './apiClient.js';

export const usersApi = {
  getMe: () => apiClient.get('/api/users/me'),
  submitKyc: (formData) => apiClient.upload('/api/users/me/kyc', formData),
};
