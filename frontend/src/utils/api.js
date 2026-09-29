// Centralized API configuration to prevent CORS/Host mismatch errors

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || '127.0.0.1';
    return `http://${hostname}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();
