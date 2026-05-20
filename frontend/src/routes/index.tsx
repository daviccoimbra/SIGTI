import { lazy, Suspense, type ReactNode } from "react";
import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import Layout from "../layout";
import { PrivateLayout } from "../layout/privateLayout";
import { SectorGuard } from "../components/SectorGuard";

const Boards = lazy(() => import("../pages/boards"));
const NewCall = lazy(() => import("../pages/newcall"));
const Dashboard = lazy(() => import("../pages/dashboard"));
const Login = lazy(() => import("../pages/login"));
const Archive = lazy(() => import("../pages/archive"));
const RegisterUser = lazy(() => import("../pages/register"));
const Users = lazy(() => import("../pages/users"));

function PageLoader({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      {children || (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Carregando...</p>
        </div>
      )}
    </div>
  );
}

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      {
        path: "login",
        element: <Suspense fallback={<PageLoader />}><Login /></Suspense>,
      },
      {
        element: <PrivateLayout />,
        children: [
          {
            index: true,
            element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense>,
          },
          {
            path: "chamados",
            element: <Suspense fallback={<PageLoader />}><Boards /></Suspense>,
          },
          {
            path: "novochamado",
            element: <Suspense fallback={<PageLoader />}><NewCall /></Suspense>,
          },
          {
            path: "dashboard",
            element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense>,
          },
          {
            path: "arquivados",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SectorGuard allowed={["ADMIN"]}>
                  <Archive />
                </SectorGuard>
              </Suspense>
            ),
          },
          {
            path: "cadastro-usuario",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SectorGuard allowed={["ADMIN"]}>
                  <RegisterUser />
                </SectorGuard>
              </Suspense>
            ),
          },
          {
            path: "usuarios",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SectorGuard allowed={["ADMIN"]}>
                  <Users />
                </SectorGuard>
              </Suspense>
            ),
          },

        ],
      },
      {
        path: "*",
        element: <Navigate to='/login' replace />,
      },
    ],
  },
];

export default routes;