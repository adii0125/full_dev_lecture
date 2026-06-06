const API_URL = '/api';
const BACKEND_URL = 'http://127.0.0.1:8000';
export const AUTH_CHANGE_EVENT = 'auth-change';

export function getToken() {
  return localStorage.getItem('access');
}

export function getRefreshToken() {
  return localStorage.getItem('refresh');
}

export function getUsername() {
  return localStorage.getItem('username');
}

export function saveLogin(data) {
  localStorage.setItem('access', data.access);
  localStorage.setItem('refresh', data.refresh);
  localStorage.setItem('username', data.username);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function saveAccessToken(access) {
  localStorage.setItem('access', access);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('username');
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getImageUrl(image) {
  if (!image) {
    return '';
  }

  if (image.startsWith('http')) {
    return image;
  }

  return `${BACKEND_URL}${image}`;
}

export async function apiRequest(path, options = {}) {
  const { auth = true, headers: optionHeaders, _retry = false, ...fetchOptions } = options;
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...optionHeaders,
  };

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (auth && response.status === 401 && !_retry) {
      const refresh = getRefreshToken();

      if (refresh) {
        const refreshResponse = await fetch(`${API_URL}/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh }),
        });
        const refreshData = await refreshResponse.json().catch(() => ({}));

        if (refreshResponse.ok && refreshData.access) {
          saveAccessToken(refreshData.access);
          return apiRequest(path, { ...options, _retry: true });
        }
      }

      logout();
    }

    throw new Error(data.detail || 'Something went wrong.');
  }

  return data;
}
