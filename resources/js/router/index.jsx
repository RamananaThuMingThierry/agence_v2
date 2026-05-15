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
import LoginPage from "../pages/auth/LoginPage";
import HomePage from "../pages/public/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
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
            path: "activity-logs",
            element: <ActivityLogsPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);
