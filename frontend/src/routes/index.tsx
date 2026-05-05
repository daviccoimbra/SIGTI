import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import Layout from "../layout";
import Boards from "../pages/boards";
import NewCall from "../pages/newcall";
import Dashboard from "../pages/dashboard";
import { PrivateLayout } from "../layout/privateLayout";
import Login from "../pages/login";
import Archive from "../pages/archive";

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        element: <PrivateLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "chamados",
            element: <Boards />,
          },
          {
            path: "novochamado",
            element: <NewCall />,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "arquivados",
            element: <Archive />,
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