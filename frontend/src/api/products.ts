import api from "./client";

export const productsApi = {
  list: (params: Record<string, any> = {}) =>
    api.get("/products", { params }).then((r) => r.data),
  get: (id: string) => api.get(`/products/${id}`).then((r) => r.data),
  create: (data: any) => api.post("/products", data).then((r) => r.data),
  update: (id: string, data: any) =>
    api.put(`/products/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/products/${id}`).then((r) => r.data),
};
