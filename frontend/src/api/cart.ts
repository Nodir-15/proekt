import api from "./client";

export const cartApi = {
  get: () => api.get("/cart").then((r) => r.data),
  add: (productId: string) =>
    api.post("/cart", { productId }).then((r) => r.data),
  remove: (productId: string) =>
    api.delete(`/cart/${productId}`).then((r) => r.data),
  clear: () => api.delete("/cart/clear").then((r) => r.data),
};
