import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach the logged-in user's ID to every single request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user?.id) {
          config.headers["x-owner-id"] = user.id;
        }
      } catch {
        // localStorage corrupted — ignore
      }
    }
  }
  return config;
});

export default api;
