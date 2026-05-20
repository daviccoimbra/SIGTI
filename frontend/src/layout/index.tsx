import { Outlet } from "react-router-dom";
import { AuthProvider } from "../context/authContext";
import { ToastContainer } from "../components/Toast";
import { ToastProvider } from "../context/toastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const Layout = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <ToastContainer />
        </QueryClientProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default Layout;