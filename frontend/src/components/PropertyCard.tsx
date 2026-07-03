import { Link } from "react-router-dom";
import { Bed, Bath, Maximize, MapPin, Heart } from "lucide-react";
import { Property } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function PropertyCard({ p }: { p: Property }) {
  const { user } = useAuth();
  const { add } = useCart();
  return (
    <div className="card hover:-translate-y-0.5 transition">
      <Link to={`/property/${p._id}`}>
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={p.images[0]}
            alt={p.title}
            className="w-full h-full object-cover hover:scale-105 transition"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="chip bg-royal/10 text-royal">
            {p.transactionType === "rent" ? "Аренда" : "Продажа"}
          </span>
          <span className="text-royal font-bold">
            {p.price.toLocaleString("ru-RU")} ${" "}
            {p.transactionType === "rent" && (
              <span className="text-xs text-slate-500">/мес</span>
            )}
          </span>
        </div>
        <Link
          to={`/property/${p._id}`}
          className="font-semibold text-slate-900 hover:text-royal line-clamp-1"
        >
          {p.title}
        </Link>
        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
          <MapPin className="w-3.5 h-3.5" /> {p.location.city}, {p.location.address}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {p.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {p.bathrooms}</span>
          <span className="flex items-center gap-1"><Maximize className="w-4 h-4" /> {p.area} м²</span>
        </div>
        {user && (
          <button onClick={() => add(p._id)} className="btn-outline w-full mt-3 text-sm">
            <Heart className="w-4 h-4" /> В избранное
          </button>
        )}
      </div>
    </div>
  );
}
