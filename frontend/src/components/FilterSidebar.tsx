import { Filters } from "../pages/Catalog";

export default function FilterSidebar({
  value, onChange,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
}) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <aside className="card p-5 space-y-4 h-fit lg:sticky lg:top-20">
      <h3 className="font-semibold text-slate-900">Фильтры</h3>
      <div>
        <label className="label">Тип сделки</label>
        <select
          className="input"
          value={value.transactionType || ""}
          onChange={(e) => set("transactionType", (e.target.value || undefined) as any)}
        >
          <option value="">Все</option>
          <option value="sale">Продажа</option>
          <option value="rent">Аренда</option>
        </select>
      </div>
      <div>
        <label className="label">Категория</label>
        <select
          className="input"
          value={value.category || ""}
          onChange={(e) => set("category", e.target.value || undefined)}
        >
          <option value="">Все</option>
          <option value="apartment">Квартира</option>
          <option value="house">Дом</option>
          <option value="townhouse">Таунхаус</option>
          <option value="commercial">Коммерция</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Цена от</label>
          <input
            type="number"
            className="input"
            value={value.minPrice || ""}
            onChange={(e) => set("minPrice", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Цена до</label>
          <input
            type="number"
            className="input"
            value={value.maxPrice || ""}
            onChange={(e) => set("maxPrice", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Площадь от</label>
          <input
            type="number"
            className="input"
            value={value.minArea || ""}
            onChange={(e) => set("minArea", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Площадь до</label>
          <input
            type="number"
            className="input"
            value={value.maxArea || ""}
            onChange={(e) => set("maxArea", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label">Комнат от</label>
        <input
          type="number"
          min={0}
          className="input"
          value={value.bedrooms || ""}
          onChange={(e) => set("bedrooms", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Город</label>
        <input
          className="input"
          value={value.city || ""}
          onChange={(e) => set("city", e.target.value)}
        />
      </div>
      <button className="btn-outline w-full" onClick={() => onChange({})}>
        Сбросить
      </button>
    </aside>
  );
}
