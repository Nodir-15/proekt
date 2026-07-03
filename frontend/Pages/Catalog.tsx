import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "../components/FilterSidebar";
import PropertyCard from "../components/PropertyCard";
import { productsApi } from "../api/products";
import { Property } from "../types";

export interface Filters {
  transactionType?: "rent" | "sale";
  category?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  bedrooms?: string;
}

export default function Catalog() {
  const [sp] = useSearchParams();
  const init: Filters = Object.fromEntries(sp.entries()) as Filters;
  const [filters, setFilters] = useState<Filters>(init);
  const [sort, setSort] = useState("-createdAt");
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({ ...filters, sort })
      .then((d) => setItems(d.items))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <FilterSidebar value={filters} onChange={setFilters} />
      <div>
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="text-slate-600">Найдено: {items.length}</div>
          <select
            className="input max-w-xs"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="-createdAt">Сначала новые</option>
            <option value="price">Цена ↑</option>
            <option value="-price">Цена ↓</option>
            <option value="-area">Площадь ↓</option>
          </select>
        </div>
        {loading ? (
          <div className="p-8 text-center">Загрузка...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((p) => (
              <PropertyCard key={p._id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
