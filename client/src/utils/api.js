const API_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = (path, options = {}) => {
  return fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      ...options.headers,
    },
  });
};