import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productsApi } from "../../api/products";

interface FormState {
  title: string;
  description: string;
  price: number;
  transactionType: "rent" | "sale";
  category: "house" | "apartment" | "townhouse" | "commercial";
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: { city: string; address: string };
  images: string;
  amenities: string;
  status: "available" | "booked" | "sold";
}

const empty: FormState = {
  title: "",
  description: "",
  price: 0,
  transactionType: "sale",
  category: "apartment",
  area: 0,
  bedrooms: 1,
  bathrooms: 1,
  location: { city: "", address: "" },
  images: "",
  amenities: "",
  status: "available",
};

export default function PropertyForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState<FormState>(empty);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      productsApi.get(id).then((p) =>
        setF({
          ...p,
          images: (p.images || []).join("\n"),
          amenities: (p.amenities || []).join(", "),
        })
      );
    }
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const payload = {
      ...f,
      price: Number(f.price),
      area: Number(f.area),
      bedrooms: Number(f.bedrooms),
      bathrooms: Number(f.bathrooms),
      images: f.images.split("\n").map((s) => s.trim()).filter(Boolean),
      amenities: f.amenities.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (id) await productsApi.update(id, payload);
      else await productsApi.create(payload);
      nav("/admin");
    } catch (e: any) {
      setErr(e.response?.data?.message || "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {id ? "Редактировать объект" : "Новый объект"}
      </h1>
      <form className="card p-6 space-y-4" onSubmit={submit}>
        <div>
          <label className="label">Название</label>
          <input
            className="input"
            required
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Описание</label>
          <textarea
            className="input"
            rows={4}
            required
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Тип сделки</label>
            <select
              className="input"
              value={f.transactionType}
              onChange={(e) =>
                setF({ ...f, transactionType: e.target.value as any })
              }
            >
              <option value="sale">Продажа</option>
              <option value="rent">Аренда</option>
            </select>
          </div>
          <div>
            <label className="label">Категория</label>
            <select
              className="input"
              value={f.category}
              onChange={(e) =>
                setF({ ...f, category: e.target.value as any })
              }
            >
              <option value="apartment">Квартира</option>
              <option value="house">Дом</option>
              <option value="townhouse">Таунхаус</option>
              <option value="commercial">Коммерция</option>
            </select>
          </div>
          <div>
            <label className="label">Цена ($)</label>
            <input
              type="number"
              className="input"
              required
              value={f.price}
              onChange={(e) => setF({ ...f, price: +e.target.value })}
            />
          </div>
          <div>
            <label className="label">Площадь (м²)</label>
            <input
              type="number"
              className="input"
              required
              value={f.area}
              onChange={(e) => setF({ ...f, area: +e.target.value })}
            />
          </div>
          <div>
            <label className="label">Спальни</label>
            <input
              type="number"
              className="input"
              value={f.bedrooms}
              onChange={(e) => setF({ ...f, bedrooms: +e.target.value })}
            />
          </div>
          <div>
            <label className="label">Санузлы</label>
            <input
              type="number"
              className="input"
              value={f.bathrooms}
              onChange={(e) => setF({ ...f, bathrooms: +e.target.value })}
            />
          </div>
          <div>
            <label className="label">Город</label>
            <input
              className="input"
              required
              value={f.location.city}
              onChange={(e) =>
                setF({ ...f, location: { ...f.location, city: e.target.value } })
              }
            />
          </div>
          <div>
            <label className="label">Адрес</label>
            <input
              className="input"
              required
              value={f.location.address}
              onChange={(e) =>
                setF({
                  ...f,
                  location: { ...f.location, address: e.target.value },
                })
              }
            />
          </div>
        </div>
        <div>
          <label className="label">Картинки (URL, по одной на строку)</label>
          <textarea
            className="input"
            rows={3}
            value={f.images}
            onChange={(e) => setF({ ...f, images: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Удобства (через запятую)</label>
          <input
            className="input"
            value={f.amenities}
            onChange={(e) => setF({ ...f, amenities: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Статус</label>
          <select
            className="input"
            value={f.status}
            onChange={(e) => setF({ ...f, status: e.target.value as any })}
          >
            <option value="available">Доступен</option>
            <option value="booked">Забронирован</option>
            <option value="sold">Продан</option>
          </select>
        </div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "..." : id ? "Сохранить" : "Создать"}
        </button>
      </form>
    </div>
  );
}
