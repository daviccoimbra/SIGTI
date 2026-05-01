import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Sidebar from "../components/Sidebar";

export function PrivateLayout() {
  const { token, loading } = useAuth();

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="w-screen h-screen flex">
      <Sidebar />

      <div className="w-full h-full overflow-y-auto pl-[80px]">
        <Outlet />
      </div>
    </div>
  );
}