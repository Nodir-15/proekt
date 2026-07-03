import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchHero() {
  const nav = useNavigate();
  const [f, setF] = useState({
    transactionType: "sale",
    category: "",
    city: "",
    maxPrice: "",
  });
  return (
    <section className="bg-gradient-to-br from-royal to-royal-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Найдите дом своей мечты
        </h1>
        <p className="text-white/80 mb-8 text-lg">
          Тысячи объектов для аренды и покупки по всей стране
        </p>
        <div className="bg-white p-4 rounded-xl shadow-card grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            className="input"
            value={f.transactionType}
            onChange={(e) => setF({ ...f, transactionType: e.target.value })}
          >
            <option value="sale">Купить</option>
            <option value="rent">Снять</option>
          </select>
          <select
            className="input"
            value={f.category}
            onChange={(e) => setF({ ...f, category: e.target.value })}
          >
            <option value="">Любой тип</option>
            <option value="apartment">Квартира</option>
            <option value="house">Дом</option>
            <option value="townhouse">Таунхаус</option>
            <option value="commercial">Коммерция</option>
          </select>
          <input
            className="input"
            placeholder="Город"
            value={f.city}
            onChange={(e) => setF({ ...f, city: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Цена до"
            value={f.maxPrice}
            onChange={(e) => setF({ ...f, maxPrice: e.target.value })}
          />
          <button
            className="btn-primary"
            onClick={() => {
              const q = new URLSearchParams(
                Object.entries(f).filter(([, v]) => v)
              ).toString();
              nav(`/catalog?${q}`);
            }}
          >
            <Search className="w-4 h-4" /> Искать
          </button>
        </div>
      </div>
    </section>
  );
}
