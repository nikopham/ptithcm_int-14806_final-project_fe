import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { Role } from "./role";
import MoviesPage from "@/pages/public/MoviesPage";
import MovieDetailPage from "@/pages/public/MovieDetailPage";
import SubscriptionPage from "@/pages/public/SubscriptionPage";
import ViewerLayout from "@/layouts/ViewerLayout";
import AccountPage from "@/pages/viewer/AccountPage";
import LikedPage from "@/pages/viewer/LikedPage";
import ContinueWatchPage from "@/pages/viewer/ContinueWatchPage";
import BalancePage from "@/pages/viewer/BalancePage";
import MovieSearchPage from "@/pages/public/MovieSearchPage";
import AdminLayout from "@/layouts/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import MovieList from "@/pages/admin/MovieList";
import MovieAdd from "@/pages/admin/MovieAdd";

const Home = lazy(() => import("@/pages/public/Home"));
const Login = lazy(() => import("@/pages/public/Login"));

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/movies", element: <MoviesPage /> },
      { path: "/movies/1", element: <MovieDetailPage /> },
      { path: "/subscriptions", element: <SubscriptionPage /> },
      { path: "/filter", element: <MovieSearchPage /> },
      { path: "login", element: <Login /> },
    ],
  },
  {
    element: <ProtectedRoute allow={[Role.VIEWER]} />, // same guard you have
    children: [
      {
        path: "viewer",
        element: <ViewerLayout />,
        children: [
          { path: "favorites", element: <LikedPage /> },
          // { path: "lists", element: <ListsPage /> },
          { path: "continue", element: <ContinueWatchPage /> },
          { path: "balance-account", element: <BalancePage /> },
          { index: true, element: <AccountPage /> },
        ],
      },
    ],
  },
  {
    element: (
      <ProtectedRoute
        allow={[Role.SUPER_ADMIN, Role.COMMENT_ADMIN, Role.COMMENT_ADMIN]}
      />
    ), // same guard you have
    children: [
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "movies", element: <MovieList /> },
          { path: "movies/new", element: <MovieAdd /> },
          // // { path: "lists", element: <ListsPage /> },
          // { path: "continue", element: <ContinueWatchPage /> },
          // { path: "balance-account", element: <BalancePage /> },
          // { index: true, element: <AccountPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allow={[Role.VIEWER]} />,
    children: [{ path: "viewer", element: <>Viewer dashboard TODO</> }],
  },
  { path: "403", element: <>Bạn không có quyền.</> },
  { path: "*", element: <>404</> },
]);
