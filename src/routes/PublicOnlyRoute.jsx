import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
