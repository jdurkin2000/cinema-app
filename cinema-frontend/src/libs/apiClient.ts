import axios from "axios";
import { getToken } from "@/libs/authStore";

const BASE = "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject Authorization header from centralized token store on each request
api.interceptors.request.use(
  (config) => {
    try {
      const token = getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
