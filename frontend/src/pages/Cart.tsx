import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ordersApi } from "../api/orders";

export default function CartPage() {
  const { items, total, remove, refresh } = useCart();
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (done)
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-royal mb-3">✅ Заявка отправлена!</h2>
          <p className="text-slate-600 mb-6">
            Объекты забронированы. Агент свяжется с вами в ближайшее время.
          </p>
          <Link to="/" className="btn-primary">На главную</Link>
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Избранное</h1>
      {items.length === 0 ? (
        <p className="text-slate-500">Список пуст. <Link to="/catalog" className="text-royal">Перейти к каталогу</Link></p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-3">
            {items.map((p) => (
              <div key={p._id} className="card p-4 flex gap-4">
                <img src={p.images[0]} alt="" className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <Link to={`/property/${p._id}`} className="font-semibold hover:text-royal">
                    {p.title}
                  </Link>
                  <div className="text-sm text-slate-500">
                    {p.location.city}, {p.location.address}
                  </div>
                  <div className="text-royal font-bold mt-1">
                    {p.price.toLocaleString("ru-RU")} $
                  </div>
                </div>
                <button
                  onClick={() => remove(p._id)}
                  className="text-slate-400 hover:text-red-600 self-start"
                  aria-label="Удалить"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <div className="card p-6 h-fit">
            <div className="flex justify-between mb-4">
              <span>Объектов</span>
              <span className="font-semibold">{items.length}</span>
            </div>
            <div className="flex justify-between mb-4 text-lg">
              <span>Итого</span>
              <span className="font-bold text-royal">
                {total.toLocaleString("ru-RU")} $
              </span>
            </div>
            <button
              className="btn-primary w-full"
              disabled={submitting}
              onClick={async () => {
                setSubmitting(true);
                try {
                  await ordersApi.create();
                  await refresh();
                  setDone(true);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "..." : "Оформить сделку"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
