import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import { productsApi } from "../../api/products";
import { ordersApi } from "../../api/orders";
import { Property, Order } from "../../types";

export default function AdminDashboard() {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [items, setItems] = useState<Property[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadProducts = () =>
    productsApi.list({ limit: 50 }).then((d) => setItems(d.items));
  const loadOrders = () => ordersApi.all().then(setOrders);

  useEffect(() => {
    if (tab === "products") loadProducts();
    else loadOrders();
  }, [tab]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Админ-панель</h1>
        {tab === "products" && (
          <Link to="/admin/property/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Добавить объект
          </Link>
        )}
      </div>

      <div className="flex gap-2 mb-6 border-b">
        {(["products", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-medium border-b-2 -mb-px ${
              tab === t
                ? "border-royal text-royal"
                : "border-transparent text-slate-500 hover:text-royal"
            }`}
          >
            {t === "products" ? "Объекты" : "Заявки"}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="p-3">Объект</th>
                <th className="p-3">Тип</th>
                <th className="p-3">Цена</th>
                <th className="p-3">Статус</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-slate-500">
                          {p.location.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{p.transactionType}</td>
                  <td className="p-3 font-semibold text-royal">
                    {p.price.toLocaleString("ru-RU")} $
                  </td>
                  <td className="p-3">
                    <span className="chip">{p.status}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link
                        to={`/admin/property/${p._id}`}
                        className="text-slate-500 hover:text-royal"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={async () => {
                          if (confirm("Удалить?")) {
                            await productsApi.remove(p._id);
                            loadProducts();
                          }
                        }}
                        className="text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-500">
                  {new Date(o.createdAt).toLocaleString("ru-RU")} ·{" "}
                  {(o.user as any)?.email}
                </div>
                <select
                  value={o.status}
                  className="input max-w-[180px]"
                  onChange={async (e) => {
                    await ordersApi.updateStatus(o._id, e.target.value);
                    loadOrders();
                  }}
                >
                  <option value="pending">В обработке</option>
                  <option value="approved">Одобрить</option>
                  <option value="rejected">Отклонить</option>
                </select>
              </div>
              <div className="text-sm text-slate-700">
                Объектов: {o.items.length} · Сумма:{" "}
                <span className="text-royal font-semibold">
                  {o.totalAmount.toLocaleString("ru-RU")} $
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
