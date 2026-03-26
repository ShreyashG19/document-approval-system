import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear token if the request sent an Authorization header and got 401
    // This avoids clearing a valid token due to 401s from login/public endpoints
    const hadAuthHeader = error.config?.headers?.Authorization;
    if (error.response?.status === 401 && hadAuthHeader) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
