import axios from "axios";

const defaultBaseURL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://api.kingcreativestudio.my.id/the-little-hijabi/api';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
});

// Add request interceptor for JWT Auth token & auto Content-Type
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let axios auto-detect Content-Type for FormData (multipart/form-data)
  // Only set application/json for non-FormData requests
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});
