import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every outgoing request, if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gradlink_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired/invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("gradlink_token");
      localStorage.removeItem("gradlink_user");
    }
    return Promise.reject(error);
  }
);

export default api;
