import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: loc }} replace />;
}
