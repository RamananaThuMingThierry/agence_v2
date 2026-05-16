import React from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import AdminLayout from "../layouts/AdminLayout";
import PublicLayout from "../layouts/PublicLayout";
import ActivityLogsPage from "../pages/admin/activity-logs/ActivityLogsPage";
import DashboardPage from "../pages/admin/DashboardPage";
import SettingsPage from "../pages/admin/settings/SettingsPage";
import SlidesPage from "../pages/admin/slides/SlidesPage";
import FormSlidePage from "../pages/admin/slides/FormSlidePage";
import UsersPage from "../pages/admin/users/UsersPage";
import FormUserPage from "../pages/admin/users/FormUserPage";
import UserDetailsPage from "../pages/admin/users/UserDetailsPage";
import LoginPage from "../pages/auth/LoginPage";
import NotFoundPage from "../pages/errors/NotFoundPage";
import ErrorPage from "../pages/errors/ErrorPage";
import HomePage from "../pages/public/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
        ],
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "slides",
            element: <SlidesPage />,
          },
          {
            path: "slides/create",
            element: <FormSlidePage />,
          },
          {
            path: "slides/:slideId/edit",
            element: <FormSlidePage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "users/create",
            element: <FormUserPage />,
          },
          {
            path: "users/:userId",
            element: <UserDetailsPage />,
          },
          {
            path: "users/:userId/edit",
            element: <FormUserPage />,
          },
          {
            path: "activity-logs",
            element: <ActivityLogsPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
