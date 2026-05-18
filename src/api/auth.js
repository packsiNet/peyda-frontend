import { apiClient } from './apiClient.js';

export const authApi = {
  telegramLogin: (initData) =>
    apiClient.post('/api/auth/telegram-login', { initData }),
};
