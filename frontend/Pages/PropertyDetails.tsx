import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bed, Bath, Maximize, MapPin, ShoppingCart } from "lucide-react";
import { productsApi } from "../src/api/products";
import { Property } from "../types";
import { useCart } from "../Context/CardContext";
import { useAuth } from "../Context/AuthContext";

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const [p, setP] = useState<Property | null>(null);
  const [idx, setIdx] = useState(0);
  const [contact, setContact] = useState({ name: "", phone: "", message: "" });

  useEffect(() => {
    if (id) productsApi.get(id).then(setP);
  }, [id]);
  if (!p) return <div className="p-8 text-center">Загрузка...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="card overflow-hidden">
          <img src={p.images[idx]} alt={p.title} className="w-full aspect-video object-cover" />
          {p.images.length > 1 && (
            <div className="p-3 flex gap-2 overflow-x-auto">
              {p.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setIdx(i)}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                    i === idx ? "border-royal" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold mt-6">{p.title}</h1>
        <p className="text-slate-500 flex items-center gap-1 mt-2">
          <MapPin className="w-4 h-4" /> {p.location.city}, {p.location.address}
        </p>
        <div className="flex gap-6 mt-4 text-slate-700">
          <span className="flex items-center gap-1"><Bed className="w-5 h-5" /> {p.bedrooms} спален</span>
          <span className="flex items-center gap-1"><Bath className="w-5 h-5" /> {p.bathrooms} с/у</span>
          <span className="flex items-center gap-1"><Maximize className="w-5 h-5" /> {p.area} м²</span>
        </div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Описание</h2>
        <p className="text-slate-700 whitespace-pre-line">{p.description}</p>
        {p.amenities.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-6 mb-2">Удобства</h2>
            <div className="flex flex-wrap gap-2">
              {p.amenities.map((a) => (
                <span key={a} className="chip">{a}</span>
              ))}
            </div>
          </>
        )}
        <h2 className="text-xl font-semibold mt-6 mb-2">Расположение</h2>
        <div className="card aspect-video bg-slate-100 flex items-center justify-center text-slate-400">
          🗺 Интерактивная карта — {p.location.address}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-6">
          <div className="text-3xl font-bold text-royal">
            {p.price.toLocaleString("ru-RU")} $
            {p.transactionType === "rent" && (
              <span className="text-base text-slate-500">/мес</span>
            )}
          </div>
          <div className="chip mt-2 bg-royal/10 text-royal">
            {p.transactionType === "rent" ? "Аренда" : "Продажа"}
          </div>
          {user && (
            <button className="btn-primary w-full mt-4" onClick={() => add(p._id)}>
              <ShoppingCart className="w-4 h-4" /> В корзину
            </button>
          )}
        </div>
        <form
          className="card p-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            alert(`Спасибо, ${contact.name}! Агент свяжется с вами.`);
            setContact({ name: "", phone: "", message: "" });
          }}
        >
          <h3 className="font-semibold">Связаться с агентом</h3>
          <input
            className="input"
            placeholder="Ваше имя"
            required
            maxLength={80}
            value={contact.name}
            onChange={(e) => setContact({ ...contact, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Телефон"
            required
            maxLength={20}
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
          />
          <textarea
            className="input"
            rows={3}
            placeholder="Сообщение"
            maxLength={1000}
            value={contact.message}
            onChange={(e) => setContact({ ...contact, message: e.target.value })}
          />
          <button 
  onClick={async (e) => {
    e.preventDefault();
    
    // Проверяем, что данные заполнены
    if (!contact.name || !contact.phone) {
      alert('Пожалуйста, заполните имя и телефон');
      return;
    }

    try {
      const response = await fetch('/api/contact', {  // ← Замени на свой реальный endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contact.name,
          phone: contact.phone,
          message: contact.message,
        }),
      });

      if (response.ok) {
        alert(`Спасибо, ${contact.name}! Агент свяжется с вами.`);
        setContact({ name: "", phone: "", message: "" });
      } else {
        alert('Что-то пошло не так. Попробуйте ещё раз.');
      }
    } catch (error) {
      console.error('Ошибка при отправке:', error);
      alert('Ошибка соединения с сервером');
    }
  }} 
  className="btn-primary w-full"
>
  Отправить заявку
</button>
        </form>
      </aside>
    </div>
  );
}