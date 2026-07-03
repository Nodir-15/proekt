import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Home as HomeIcon, Warehouse, Store } from "lucide-react";
import SearchHero from "../components/SearchHero";
import PropertyCard from "../components/PropertyCard";
import { productsApi } from "../api/products";
import { Property } from "../types";

const cats = [
  { key: "apartment", label: "Квартиры", Icon: Building2 },
  { key: "house", label: "Дома", Icon: HomeIcon },
  { key: "townhouse", label: "Таунхаусы", Icon: Warehouse },
  { key: "commercial", label: "Коммерция", Icon: Store },
];

export default function Home() {
  const [top, setTop] = useState<Property[]>([]);
  useEffect(() => {
    productsApi
      .list({ limit: 6, sort: "-createdAt" })
      .then((d) => setTop(d.items))
      .catch(() => setTop([]));
  }, []);
  return (
    <>
      <SearchHero />
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Популярные категории</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cats.map(({ key, label, Icon }) => (
            <Link
              key={key}
              to={`/catalog?category=${key}`}
              className="card p-6 hover:border-royal hover:text-royal transition"
            >
              <Icon className="w-8 h-8 mb-3" />
              <div className="font-semibold">{label}</div>
            </Link>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">Лучшие предложения</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {top.map((p) => (
            <PropertyCard key={p._id} p={p} />
          ))}
        </div>
      </section>
    </>
  );
}
