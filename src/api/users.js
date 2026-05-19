import { apiClient } from './apiClient.js';

export const usersApi = {
  getMe: () => apiClient.get('/api/users/me'),
  verifyPhone: (phoneNumber) => apiClient.post('/api/users/me/phone', { phoneNumber }),
  submitKyc: (formData) => apiClient.upload('/api/users/me/kyc', formData),
};
