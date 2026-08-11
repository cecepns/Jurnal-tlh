import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.kingcreativestudio.my.id/the-little-hijabi/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for JWT Auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
