import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Регистрация</h1>
      <form
        className="card p-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr("");
          setLoading(true);
          try {
            await register(f.name, f.email, f.password);
            nav("/");
          } catch (e: any) {
            setErr(e.response?.data?.message || "Ошибка");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div>
          <label className="label">Имя</label>
          <input
            className="input"
            required
            minLength={2}
            maxLength={80}
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Пароль</label>
          <input
            className="input"
            type="password"
            required
            minLength={8}
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
          />
        </div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "..." : "Создать аккаунт"}
        </button>
        <p className="text-sm text-center text-slate-600">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-royal font-medium">Вход</Link>
        </p>
      </form>
    </div>
  );
}
