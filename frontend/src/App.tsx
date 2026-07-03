/**
 * Real-estate frontend — ВСЁ В ОДНОМ ФАЙЛЕ.
 * Зависимости: react, react-dom, react-router-dom, axios, lucide-react, tailwindcss.
 * main.tsx импортирует <App /> отсюда.
 */
import {
  createContext, useCallback, useContext, useEffect, useState, ReactNode,
} from "react";
import {
  BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes,
  useLocation, useNavigate, useParams, useSearchParams,
} from "react-router-dom";
import axios from "axios";
import {
  Bath, Bed, Building2, Heart, Home as HomeIcon, LogOut, MapPin, Maximize,
  Pencil, Plus, Search, ShoppingCart, Store, Trash2, User as UserIcon, Warehouse,
} from "lucide-react";

/* ────────────── ТИПЫ ────────────── */
type Role = "user" | "admin";
interface User { id: string; name: string; email: string; role: Role }
type TransactionType = "rent" | "sale";
type Category = "house" | "apartment" | "townhouse" | "commercial";
type Status = "available" | "booked" | "sold";
interface Property {
  _id: string; title: string; description: string; price: number;
  transactionType: TransactionType; category: Category;
  area: number; bedrooms: number; bathrooms: number;
  location: { city: string; address: string; lat?: number; lng?: number };
  images: string[]; amenities: string[]; status: Status;
  owner: string | User;
}
interface Order {
  _id: string; user: string | User; items: Property[];
  totalAmount: number; status: "pending" | "approved" | "rejected"; createdAt: string;
}

/* ────────────── AXIOS + AUTH-REFRESH ────────────── */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("access");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
let refreshing: Promise<string | null> | null = null;
const doRefresh = async (): Promise<string | null> => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refresh });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    return data.access;
  } catch {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return null;
  }
};
api.interceptors.response.use((r) => r, async (err) => {
  const o = err.config;
  if (err.response?.status === 401 && !o._retry) {
    o._retry = true;
    refreshing = refreshing || doRefresh();
    const tok = await refreshing; refreshing = null;
    if (tok) { o.headers.Authorization = `Bearer ${tok}`; return api(o); }
  }
  return Promise.reject(err);
});

/* ────────────── API-МЕТОДЫ ────────────── */
const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) => api.post("/auth/register", { name, email, password }).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  logout: (refresh: string) => api.post("/auth/logout", { refresh }).then((r) => r.data),
};
const productsApi = {
  list: (params: Record<string, any> = {}) => api.get("/products", { params }).then((r) => r.data),
  get: (id: string) => api.get(`/products/${id}`).then((r) => r.data),
  create: (data: any) => api.post("/products", data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/products/${id}`).then((r) => r.data),
};
const cartApi = {
  get: () => api.get("/cart").then((r) => r.data),
  add: (productId: string) => api.post("/cart", { productId }).then((r) => r.data),
  remove: (productId: string) => api.delete(`/cart/${productId}`).then((r) => r.data),
  clear: () => api.delete("/cart/clear").then((r) => r.data),
};
const ordersApi = {
  create: () => api.post("/orders").then((r) => r.data),
  mine: () => api.get("/orders/mine").then((r) => r.data),
  all: () => api.get("/orders").then((r) => r.data),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}`, { status }).then((r) => r.data),
};

/* ────────────── CONTEXT: Auth + Cart ────────────── */
interface AuthCtxT {
  user: User | null; loading: boolean;
  login: (e: string, p: string) => Promise<void>;
  register: (n: string, e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthCtx = createContext<AuthCtxT | null>(null);
const useAuth = () => {
  const v = useContext(AuthCtx); if (!v) throw new Error("useAuth outside provider"); return v;
};
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      if (!localStorage.getItem("access")) { setLoading(false); return; }
      try { const { user } = await authApi.me(); setUser(user); }
      catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);
  const persist = (data: any) => {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    setUser(data.user);
  };
  return (
    <AuthCtx.Provider value={{
      user, loading,
      login: async (e, p) => persist(await authApi.login(e, p)),
      register: async (n, e, p) => persist(await authApi.register(n, e, p)),
      logout: async () => {
        const r = localStorage.getItem("refresh");
        if (r) { try { await authApi.logout(r); } catch { /* ignore */ } }
        localStorage.clear(); setUser(null);
      },
    }}>{children}</AuthCtx.Provider>
  );
};

interface CartCtxT {
  items: Property[]; total: number;
  refresh: () => Promise<void>;
  add: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}
const CartCtx = createContext<CartCtxT | null>(null);
const useCart = () => {
  const v = useContext(CartCtx); if (!v) throw new Error("useCart outside provider"); return v;
};
const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Property[]>([]);
  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    const c = await cartApi.get(); setItems(c.items || []);
  }, [user]);
  useEffect(() => { refresh(); }, [refresh]);
  const total = items.reduce((s, p) => s + p.price, 0);
  return (
    <CartCtx.Provider value={{
      items, total, refresh,
      add: async (id) => { const c = await cartApi.add(id); setItems(c.items || []); },
      remove: async (id) => { const c = await cartApi.remove(id); setItems(c.items || []); },
      clear: async () => { await cartApi.clear(); setItems([]); },
    }}>{children}</CartCtx.Provider>
  );
};

/* ────────────── РОУТ-ГВАРДЫ ────────────── */
const ProtectedRoute = () => {
  const { user, loading } = useAuth(); const loc = useLocation();
  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: loc }} replace />;
};
const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  return user?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
};

/* ────────────── ЛЭЙАУТ ────────────── */
const Header = () => {
  const { user, logout } = useAuth(); const { items } = useCart(); const nav = useNavigate();
  const link = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-royal bg-royal/5" : "text-slate-700 hover:text-royal"}`;
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-royal font-bold text-lg">
          <Building2 className="w-6 h-6" /> Estate
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/buy" className={link}>Купить</NavLink>
          <NavLink to="/rent" className={link}>Снять</NavLink>
          {user?.role === "admin" && <NavLink to="/admin" className={link}>Админ</NavLink>}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative p-2 text-slate-700 hover:text-royal" aria-label="Корзина">
            <ShoppingCart className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-royal text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-royal text-white flex items-center justify-center text-sm font-semibold">
                {user.name[0]?.toUpperCase()}
              </div>
              <Link to="/profile" className="text-sm text-slate-700 flex items-center gap-1">
                <UserIcon className="w-4 h-4" /> {user.name}
              </Link>
              <button onClick={async () => { await logout(); nav("/"); }}
                className="text-slate-500 hover:text-royal" aria-label="Выйти">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm">Вход</Link>
          )}
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="border-t border-slate-100 py-8 mt-12">
    <div className="max-w-7xl mx-auto px-4 text-sm text-slate-500 flex flex-col md:flex-row items-center justify-between gap-3">
      <div>© {new Date().getFullYear()} Estate. Все права защищены.</div>
      <div className="flex gap-4">
        <a href="#" className="hover:text-royal">О нас</a>
        <a href="#" className="hover:text-royal">Контакты</a>
        <a href="#" className="hover:text-royal">Помощь</a>
      </div>
    </div>
  </footer>
);

/* ────────────── КАРТОЧКИ / СПИСКИ ────────────── */
const PropertyCard = ({ p }: { p: Property }) => {
  const { user } = useAuth(); const { add } = useCart();
  return (
    <div className="card hover:-translate-y-0.5 transition">
      <Link to={`/property/${p._id}`}>
        <div className="aspect-[4/3] overflow-hidden">
          <img src={p.images[0]} alt={p.title}
            className="w-full h-full object-cover hover:scale-105 transition" loading="lazy" />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="chip bg-royal/10 text-royal">
            {p.transactionType === "rent" ? "Аренда" : "Продажа"}
          </span>
          <span className="text-royal font-bold">
            {p.price.toLocaleString("ru-RU")} ${" "}
            {p.transactionType === "rent" && <span className="text-xs text-slate-500">/мес</span>}
          </span>
        </div>
        <Link to={`/property/${p._id}`} className="font-semibold text-slate-900 hover:text-royal line-clamp-1">
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
};

interface Filters {
  transactionType?: "rent" | "sale";
  category?: string; city?: string;
  minPrice?: string; maxPrice?: string;
  minArea?: string; maxArea?: string;
  bedrooms?: string;
}

const FilterSidebar = ({ value, onChange }: { value: Filters; onChange: (f: Filters) => void }) => {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...value, [k]: v });
  return (
    <aside className="card p-5 space-y-4 h-fit lg:sticky lg:top-20">
      <h3 className="font-semibold text-slate-900">Фильтры</h3>
      <div>
        <label className="label">Тип сделки</label>
        <select className="input" value={value.transactionType || ""}
          onChange={(e) => set("transactionType", (e.target.value || undefined) as any)}>
          <option value="">Все</option><option value="sale">Продажа</option><option value="rent">Аренда</option>
        </select>
      </div>
      <div>
        <label className="label">Категория</label>
        <select className="input" value={value.category || ""}
          onChange={(e) => set("category", e.target.value || undefined)}>
          <option value="">Все</option>
          <option value="apartment">Квартира</option><option value="house">Дом</option>
          <option value="townhouse">Таунхаус</option><option value="commercial">Коммерция</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label">Цена от</label>
          <input type="number" className="input" value={value.minPrice || ""}
            onChange={(e) => set("minPrice", e.target.value)} /></div>
        <div><label className="label">Цена до</label>
          <input type="number" className="input" value={value.maxPrice || ""}
            onChange={(e) => set("maxPrice", e.target.value)} /></div>
        <div><label className="label">Площадь от</label>
          <input type="number" className="input" value={value.minArea || ""}
            onChange={(e) => set("minArea", e.target.value)} /></div>
        <div><label className="label">Площадь до</label>
          <input type="number" className="input" value={value.maxArea || ""}
            onChange={(e) => set("maxArea", e.target.value)} /></div>
      </div>
      <div><label className="label">Комнат от</label>
        <input type="number" min={0} className="input" value={value.bedrooms || ""}
          onChange={(e) => set("bedrooms", e.target.value)} /></div>
      <div><label className="label">Город</label>
        <input className="input" value={value.city || ""}
          onChange={(e) => set("city", e.target.value)} /></div>
      <button className="btn-outline w-full" onClick={() => onChange({})}>Сбросить</button>
    </aside>
  );
};

const SearchHero = () => {
  const nav = useNavigate();
  const [f, setF] = useState({ transactionType: "sale", category: "", city: "", maxPrice: "" });
  return (
    <section className="bg-gradient-to-br from-royal to-royal-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Найдите дом своей мечты</h1>
        <p className="text-white/80 mb-8 text-lg">Тысячи объектов для аренды и покупки по всей стране</p>
        <div className="bg-white p-4 rounded-xl shadow-card grid grid-cols-1 md:grid-cols-5 gap-3">
          <select className="input" value={f.transactionType}
            onChange={(e) => setF({ ...f, transactionType: e.target.value })}>
            <option value="sale">Продажа</option><option value="rent">Аренда</option>
          </select>
          <select className="input" value={f.category}
            onChange={(e) => setF({ ...f, category: e.target.value })}>
            <option value="">Любая</option>
            <option value="apartment">Квартира</option><option value="house">Дом</option>
            <option value="townhouse">Таунхаус</option><option value="commercial">Коммерция</option>
          </select>
          <input className="input" placeholder="Город" value={f.city}
            onChange={(e) => setF({ ...f, city: e.target.value })} />
          <input className="input" type="number" placeholder="Цена до" value={f.maxPrice}
            onChange={(e) => setF({ ...f, maxPrice: e.target.value })} />
          <button className="btn-primary"
            onClick={() => {
              const q = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
              nav(`/catalog?${q}`);
            }}>
            <Search className="w-4 h-4" /> Искать
          </button>
        </div>
      </div>
    </section>
  );
};

/* ────────────── СТРАНИЦЫ ────────────── */
const homeCats = [
  { key: "apartment", label: "Квартиры", Icon: Building2 },
  { key: "house", label: "Дома", Icon: HomeIcon },
  { key: "townhouse", label: "Таунхаусы", Icon: Warehouse },
  { key: "commercial", label: "Коммерция", Icon: Store },
];

const Home = () => {
  const [top, setTop] = useState<Property[]>([]);
  useEffect(() => {
    productsApi.list({ limit: 6, sort: "-createdAt" })
      .then((d) => setTop(d.items)).catch(() => setTop([]));
  }, []);
  return (
    <>
      <SearchHero />
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Популярные категории</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {homeCats.map(({ key, label, Icon }) => (
            <Link key={key} to={`/catalog?category=${key}`}
              className="card p-6 hover:border-royal hover:text-royal transition">
              <Icon className="w-8 h-8 mb-3" />
              <div className="font-semibold">{label}</div>
            </Link>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">Лучшие предложения</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {top.map((p) => <PropertyCard key={p._id} p={p} />)}
        </div>
      </section>
    </>
  );
};

const Catalog = () => {
  const [sp] = useSearchParams();
  const init: Filters = Object.fromEntries(sp.entries()) as Filters;
  const [filters, setFilters] = useState<Filters>(init);
  const [sort, setSort] = useState("-createdAt");
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    productsApi.list({ ...filters, sort })
      .then((d) => setItems(d.items)).finally(() => setLoading(false));
  }, [filters, sort]);
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <FilterSidebar value={filters} onChange={setFilters} />
      <div>
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="text-slate-600">Найдено: {items.length}</div>
          <select className="input max-w-xs" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="-createdAt">Сначала новые</option>
            <option value="price">Цена ↑</option><option value="-price">Цена ↓</option>
            <option value="-area">Площадь ↓</option>
          </select>
        </div>
        {loading ? <div className="p-8 text-center">Загрузка...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((p) => <PropertyCard key={p._id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const PropertyDetails = () => {
  const { id } = useParams(); const { user } = useAuth(); const { add } = useCart();
  const [p, setP] = useState<Property | null>(null);
  const [idx, setIdx] = useState(0);
  const [contact, setContact] = useState({ name: "", phone: "", message: "" });
  useEffect(() => { if (id) productsApi.get(id).then(setP); }, [id]);
  if (!p) return <div className="p-8 text-center">Загрузка...</div>;
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="card overflow-hidden">
          <img src={p.images[idx]} alt={p.title} className="w-full aspect-video object-cover" />
          {p.images.length > 1 && (
            <div className="p-3 flex gap-2 overflow-x-auto">
              {p.images.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setIdx(i)}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                    i === idx ? "border-royal" : "border-transparent"
                  }`} />
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
              {p.amenities.map((a) => <span key={a} className="chip">{a}</span>)}
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
            {p.transactionType === "rent" && <span className="text-base text-slate-500">/мес</span>}
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
        <form className="card p-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            alert(`Спасибо, ${contact.name}! Агент свяжется с вами.`);
            setContact({ name: "", phone: "", message: "" });
          }}>
          <h3 className="font-semibold">Связаться с агентом</h3>
          <input className="input" placeholder="Ваше имя" required maxLength={80}
            value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
          <input className="input" placeholder="Телефон" required maxLength={20}
            value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          <textarea className="input" rows={3} placeholder="Сообщение" maxLength={1000}
            value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} />
          <button className="btn-primary w-full">Отправить заявку</button>
        </form>
      </aside>
    </div>
  );
};

const Login = () => {
  const { login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Вход</h1>
      <form className="card p-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault(); setErr(""); setLoading(true);
          try { await login(f.email, f.password); nav("/"); }
          catch (e: any) { setErr(e.response?.data?.message || "Ошибка"); }
          finally { setLoading(false); }
        }}>
        <div><label className="label">Email</label>
          <input className="input" type="email" required value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><label className="label">Пароль</label>
          <input className="input" type="password" required minLength={8}
            value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "..." : "Войти"}</button>
        <p className="text-sm text-center text-slate-600">
          Нет аккаунта? <Link to="/register" className="text-royal font-medium">Регистрация</Link>
        </p>
      </form>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Регистрация</h1>
      <form className="card p-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault(); setErr(""); setLoading(true);
          try { await register(f.name, f.email, f.password); nav("/"); }
          catch (e: any) { setErr(e.response?.data?.message || "Ошибка"); }
          finally { setLoading(false); }
        }}>
        <div><label className="label">Имя</label>
          <input className="input" required minLength={2} maxLength={80}
            value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="label">Email</label>
          <input className="input" type="email" required value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><label className="label">Пароль</label>
          <input className="input" type="password" required minLength={8}
            value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "..." : "Создать аккаунт"}</button>
        <p className="text-sm text-center text-slate-600">
          Уже есть аккаунт? <Link to="/login" className="text-royal font-medium">Вход</Link>
        </p>
      </form>
    </div>
  );
};

const CartPage = () => {
  const { items, total, remove, refresh } = useCart();
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  if (done) return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-royal mb-3">✅ Заявка отправлена!</h2>
        <p className="text-slate-600 mb-6">Объекты забронированы. Агент свяжется с вами в ближайшее время.</p>
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
                  <Link to={`/property/${p._id}`} className="font-semibold hover:text-royal">{p.title}</Link>
                  <div className="text-sm text-slate-500">{p.location.city}, {p.location.address}</div>
                  <div className="text-royal font-bold mt-1">{p.price.toLocaleString("ru-RU")} $</div>
                </div>
                <button onClick={() => remove(p._id)}
                  className="text-slate-400 hover:text-red-600 self-start" aria-label="Удалить">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <div className="card p-6 h-fit">
            <div className="flex justify-between mb-4">
              <span>Объектов</span><span className="font-semibold">{items.length}</span>
            </div>
            <div className="flex justify-between mb-4 text-lg">
              <span>Итого</span>
              <span className="font-bold text-royal">{total.toLocaleString("ru-RU")} $</span>
            </div>
            <button className="btn-primary w-full" disabled={submitting}
              onClick={async () => {
                setSubmitting(true);
                try { await ordersApi.create(); await refresh(); setDone(true); }
                finally { setSubmitting(false); }
              }}>
              {submitting ? "..." : "Оформить сделку"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const statusLabel: Record<Order["status"], string> = {
  pending: "В обработке", approved: "Одобрена", rejected: "Отклонена",
};
const statusColor: Record<Order["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const Profile = () => {
  const { user } = useAuth(); const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { ordersApi.mine().then(setOrders); }, []);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="card p-6 mb-6">
        <h1 className="text-2xl font-bold">{user?.name}</h1>
        <p className="text-slate-500">{user?.email}</p>
        <span className="chip mt-2 bg-royal/10 text-royal">{user?.role}</span>
      </div>
      <h2 className="text-xl font-semibold mb-4">Мои заявки</h2>
      {orders.length === 0 ? <p className="text-slate-500">Заявок пока нет.</p> : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-500">
                  {new Date(o.createdAt).toLocaleString("ru-RU")}
                </div>
                <span className={`chip ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {o.items.map((p) => (
                  <div key={p._id} className="flex gap-3">
                    <img src={p.images[0]} alt="" className="w-16 h-16 object-cover rounded" />
                    <div>
                      <div className="font-medium text-sm">{p.title}</div>
                      <div className="text-xs text-slate-500">{p.location.city}</div>
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
};

const AdminDashboard = () => {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [items, setItems] = useState<Property[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const loadProducts = () => productsApi.list({ limit: 50 }).then((d) => setItems(d.items));
  const loadOrders = () => ordersApi.all().then(setOrders);
  useEffect(() => { tab === "products" ? loadProducts() : loadOrders(); }, [tab]);
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
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 font-medium border-b-2 -mb-px ${
              tab === t ? "border-royal text-royal" : "border-transparent text-slate-500 hover:text-royal"
            }`}>
            {t === "products" ? "Объекты" : "Заявки"}
          </button>
        ))}
      </div>
      {tab === "products" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="p-3">Объект</th><th className="p-3">Тип</th>
                <th className="p-3">Цена</th><th className="p-3">Статус</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded" />
                      <div>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-slate-500">{p.location.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{p.transactionType}</td>
                  <td className="p-3 font-semibold text-royal">
                    {p.price.toLocaleString("ru-RU")} $
                  </td>
                  <td className="p-3"><span className="chip">{p.status}</span></td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link to={`/admin/property/${p._id}`} className="text-slate-500 hover:text-royal">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={async () => {
                        if (confirm("Удалить?")) { await productsApi.remove(p._id); loadProducts(); }
                      }} className="text-slate-500 hover:text-red-600">
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
                  {new Date(o.createdAt).toLocaleString("ru-RU")} · {(o.user as any)?.email}
                </div>
                <select value={o.status} className="input max-w-[180px]"
                  onChange={async (e) => { await ordersApi.updateStatus(o._id, e.target.value); loadOrders(); }}>
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
};

interface FormState {
  title: string; description: string; price: number;
  transactionType: "rent" | "sale"; category: Category;
  area: number; bedrooms: number; bathrooms: number;
  location: { city: string; address: string };
  images: string; amenities: string; status: Status;
}
const emptyForm: FormState = {
  title: "", description: "", price: 0,
  transactionType: "sale", category: "apartment",
  area: 0, bedrooms: 1, bathrooms: 1,
  location: { city: "", address: "" },
  images: "", amenities: "", status: "available",
};

const PropertyForm = () => {
  const { id } = useParams(); const nav = useNavigate();
  const [f, setF] = useState<FormState>(emptyForm);
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (id) productsApi.get(id).then((p) =>
      setF({ ...p, images: (p.images || []).join("\n"), amenities: (p.amenities || []).join(", ") }));
  }, [id]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setLoading(true);
    const payload = {
      ...f, price: +f.price, area: +f.area, bedrooms: +f.bedrooms, bathrooms: +f.bathrooms,
      images: f.images.split("\n").map((s) => s.trim()).filter(Boolean),
      amenities: f.amenities.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (id) await productsApi.update(id, payload); else await productsApi.create(payload);
      nav("/admin");
    } catch (e: any) { setErr(e.response?.data?.message || "Ошибка сохранения"); }
    finally { setLoading(false); }
  };
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{id ? "Редактировать объект" : "Новый объект"}</h1>
      <form className="card p-6 space-y-4" onSubmit={submit}>
        <div><label className="label">Название</label>
          <input className="input" required value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        <div><label className="label">Описание</label>
          <textarea className="input" rows={4} required value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Тип сделки</label>
            <select className="input" value={f.transactionType}
              onChange={(e) => setF({ ...f, transactionType: e.target.value as any })}>
              <option value="sale">Продажа</option><option value="rent">Аренда</option>
            </select></div>
          <div><label className="label">Категория</label>
            <select className="input" value={f.category}
              onChange={(e) => setF({ ...f, category: e.target.value as any })}>
              <option value="apartment">Квартира</option><option value="house">Дом</option>
              <option value="townhouse">Таунхаус</option><option value="commercial">Коммерция</option>
            </select></div>
          <div><label className="label">Цена ($)</label>
            <input type="number" className="input" required value={f.price}
              onChange={(e) => setF({ ...f, price: +e.target.value })} /></div>
          <div><label className="label">Площадь (м²)</label>
            <input type="number" className="input" required value={f.area}
              onChange={(e) => setF({ ...f, area: +e.target.value })} /></div>
          <div><label className="label">Спальни</label>
            <input type="number" className="input" value={f.bedrooms}
              onChange={(e) => setF({ ...f, bedrooms: +e.target.value })} /></div>
          <div><label className="label">Санузлы</label>
            <input type="number" className="input" value={f.bathrooms}
              onChange={(e) => setF({ ...f, bathrooms: +e.target.value })} /></div>
          <div><label className="label">Город</label>
            <input className="input" required value={f.location.city}
              onChange={(e) => setF({ ...f, location: { ...f.location, city: e.target.value } })} /></div>
          <div><label className="label">Адрес</label>
            <input className="input" required value={f.location.address}
              onChange={(e) => setF({ ...f, location: { ...f.location, address: e.target.value } })} /></div>
        </div>
        <div><label className="label">Картинки (URL, по одной на строку)</label>
          <textarea className="input" rows={3} value={f.images}
            onChange={(e) => setF({ ...f, images: e.target.value })} /></div>
        <div><label className="label">Удобства (через запятую)</label>
          <input className="input" value={f.amenities}
            onChange={(e) => setF({ ...f, amenities: e.target.value })} /></div>
        <div><label className="label">Статус</label>
          <select className="input" value={f.status}
            onChange={(e) => setF({ ...f, status: e.target.value as any })}>
            <option value="available">Доступен</option>
            <option value="booked">Забронирован</option>
            <option value="sold">Продан</option>
          </select></div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "..." : id ? "Сохранить" : "Создать"}
        </button>
      </form>
    </div>
  );
};

/* ────────────── ROOT ────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/buy" element={<Catalog />} />
                <Route path="/rent" element={<Catalog />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/property/new" element={<PropertyForm />} />
                  <Route path="/admin/property/:id" element={<PropertyForm />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
