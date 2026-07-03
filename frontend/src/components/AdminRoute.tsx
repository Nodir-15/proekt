import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  return user?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}
