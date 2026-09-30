// Centralized API configuration to prevent CORS/Host mismatch errors

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || '127.0.0.1';
    // If running on production/Vercel (not localhost/127.0.0.1) and no VITE_API_URL set, use relative path ''
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return '';
    }
    return `http://${hostname}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();
