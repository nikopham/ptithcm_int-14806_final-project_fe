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
import MovieEdit from "@/pages/admin/MovieEdit";
import GenreList from "@/pages/admin/GenreList";
import MoviePeopleList from "@/pages/admin/MoviePeopleList";
import RatingList from "@/pages/admin/RatingList";
import CommentList from "@/pages/admin/CommentList";
import SubscriptionList from "@/pages/admin/SubscriptionList";
import ViewerList from "@/pages/admin/ViewerList";
import AdminList from "@/pages/admin/AdminList";
import TransactionList from "@/pages/admin/TransactionList";
import SourceManager from "@/pages/admin/SourceManager";
import { RootLayout } from "@/layouts/RootLayout";
import { GlobalConstant } from "@/constants/GlobalConstant";
import { VerifySuccessPage } from "@/pages/verify/VerifySuccessPage";
import { VerifyFailPage } from "@/pages/verify/VerifyFailPage";
import { ResetPasswordPage } from "@/pages/verify/ResetPasswordPage";
import { ForbiddenPage } from "@/pages/public/ForbiddenPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import MoviePeoplePage from "@/pages/public/MoviePeoplePage";

const Home = lazy(() => import("@/pages/public/Home"));
const Login = lazy(() => import("@/pages/public/Login"));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "/movies", element: <MoviesPage /> },
          { path: "/movie/detail/:id", element: <MovieDetailPage /> },
          { path: "/movie/people/:id", element: <MoviePeoplePage /> },
          { path: "/subscriptions", element: <SubscriptionPage /> },
          { path: "/filter", element: <MovieSearchPage /> },
          { path: "login", element: <Login /> },
        ],
      },
      {
        element: (
          <ProtectedRoute
            allow={[
              GlobalConstant.VIEWER,
              GlobalConstant.SUPER_ADMIN,
              GlobalConstant.COMMENT_ADMIN,
              GlobalConstant.COMMENT_ADMIN,
            ]}
          />
        ), // same guard you have
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
            allow={[
              GlobalConstant.SUPER_ADMIN,
              GlobalConstant.COMMENT_ADMIN,
              GlobalConstant.COMMENT_ADMIN,
            ]}
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
              { path: "movies/edit/:id", element: <MovieEdit /> },
              { path: "movies", element: <MovieList /> },
              { path: "movies/source/:id", element: <SourceManager /> },
              { path: "genres", element: <GenreList /> },
              { path: "movie-people", element: <MoviePeopleList /> },
              { path: "ratings", element: <RatingList /> },
              { path: "comments", element: <CommentList /> },
              { path: "plans", element: <SubscriptionList /> },
              { path: "users/viewer", element: <ViewerList /> },
              { path: "users/admin", element: <AdminList /> },
              { path: "transactions", element: <TransactionList /> },

              // { path: "balance-account", element: <BalancePage /> },
              // { index: true, element: <AccountPage /> },
            ],
          },
        ],
      },

      {
        element: <ProtectedRoute allow={[GlobalConstant.VIEWER]} />,
        children: [{ path: "viewer", element: <>Viewer dashboard TODO</> }],
      },
      {
        path: "/verify-success",
        element: <VerifySuccessPage />,
      },
      {
        path: "/verify-fail",
        element: <VerifyFailPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
      { path: "403", element: <ForbiddenPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
