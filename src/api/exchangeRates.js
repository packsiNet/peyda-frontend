import { apiClient } from './apiClient.js';

export const exchangeRatesApi = {
  getAll: () => apiClient.get('/api/exchangerates'),
};
