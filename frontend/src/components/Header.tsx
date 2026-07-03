import { Link, NavLink, useNavigate } from "react-router-dom";
import { Building2, ShoppingCart, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const nav = useNavigate();
  const link = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "text-royal bg-royal/5" : "text-slate-700 hover:text-royal"
    }`;
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-royal font-bold text-lg">
          <Building2 className="w-6 h-6" /> Estate
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/buy" className={link}>Купить</NavLink>
          <NavLink to="/rent" className={link}>Снять</NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className={link}>Админ</NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative p-2 text-slate-700 hover:text-royal"
            aria-label="Корзина"
          >
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
              <button
                onClick={async () => {
                  await logout();
                  nav("/");
                }}
                className="text-slate-500 hover:text-royal"
                aria-label="Выйти"
              >
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
}
