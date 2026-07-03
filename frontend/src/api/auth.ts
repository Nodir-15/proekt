import api from "./client";

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  logout: (refresh: string) =>
    api.post("/auth/logout", { refresh }).then((r) => r.data),
};
