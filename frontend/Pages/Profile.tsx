import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ordersApi } from "../api/orders";
import { Order } from "../types";

const statusLabel: Record<Order["status"], string> = {
  pending: "В обработке",
  approved: "Одобрена",
  rejected: "Отклонена",
};

const statusColor: Record<Order["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    ordersApi.mine().then(setOrders);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="card p-6 mb-6">
        <h1 className="text-2xl font-bold">{user?.name}</h1>
        <p className="text-slate-500">{user?.email}</p>
        <span className="chip mt-2 bg-royal/10 text-royal">{user?.role}</span>
      </div>

      <h2 className="text-xl font-semibold mb-4">Мои заявки</h2>
      {orders.length === 0 ? (
        <p className="text-slate-500">Заявок пока нет.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-500">
                  {new Date(o.createdAt).toLocaleString("ru-RU")}
                </div>
                <span className={`chip ${statusColor[o.status]}`}>
                  {statusLabel[o.status]}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {o.items.map((p) => (
                  <div key={p._id} className="flex gap-3">
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium text-sm">{p.title}</div>
                      <div className="text-xs text-slate-500">
                        {p.location.city}
                      </div>
                      <div className="text-royal font-semibold text-sm">
                        {p.price.toLocaleString("ru-RU")} $
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t flex justify-end font-bold text-royal">
                Итого: {o.totalAmount.toLocaleString("ru-RU")} $
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
