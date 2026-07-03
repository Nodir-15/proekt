import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("access");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

let refreshing: Promise<string | null> | null = null;
const doRefresh = async (): Promise<string | null> => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;
  try {
    const { data } = await axios.post(
      `${api.defaults.baseURL}/auth/refresh`,
      { refresh }
    );
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    return data.access;
  } catch {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return null;
  }
};

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      refreshing = refreshing || doRefresh();
      const token = await refreshing;
      refreshing = null;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
