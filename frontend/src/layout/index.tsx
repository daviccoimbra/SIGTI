import { Outlet } from "react-router-dom";
import { AuthProvider } from "../context/authContext";
import { ToastContainer } from "../components/Toast";
import { ToastProvider } from "../context/toastContext";

const Layout = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Outlet />
        <ToastContainer />
      </AuthProvider>
    </ToastProvider>
  );
};

export default Layout;