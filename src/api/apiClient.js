import { notificationBus } from '../notifications';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const url = `${apiBaseUrl}${path}`;

  let response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  } catch {
    notificationBus.emit({ type: 'error', message: 'Connection failed. Please check your network.' });
    throw new Error('Network error');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.message ??
      payload?.detail ??
      payload?.error ??
      `Request failed (${response.status})`;
    notificationBus.emit({ type: 'error', message });
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (payload?.message) {
    notificationBus.emit({ type: 'success', message: payload.message });
  }

  return payload;
}

export const apiClient = {
  get:    (path, options)        => request(path, { method: 'GET', ...options }),
  post:   (path, body, options)  => request(path, { method: 'POST',   body: JSON.stringify(body), ...options }),
  put:    (path, body, options)  => request(path, { method: 'PUT',    body: JSON.stringify(body), ...options }),
  delete: (path, options)        => request(path, { method: 'DELETE', ...options }),
};
