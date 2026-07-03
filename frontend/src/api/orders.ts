import api from "./client";

export const ordersApi = {
  create: () => api.post("/orders").then((r) => r.data),
  mine: () => api.get("/orders/mine").then((r) => r.data),
  all: () => api.get("/orders").then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}`, { status }).then((r) => r.data),
};
