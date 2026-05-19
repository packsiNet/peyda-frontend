import { apiClient } from './apiClient.js';

export const usersApi = {
  getMe:        () => apiClient.get('/api/users/me'),
  getKycStatus: () => apiClient.get('/api/Users/me/kyc'),
  verifyPhone:  (phoneNumber) => apiClient.post('/api/users/me/phone', { phoneNumber }),
  submitKyc:    (formData) => apiClient.upload('/api/users/me/kyc', formData),
};
