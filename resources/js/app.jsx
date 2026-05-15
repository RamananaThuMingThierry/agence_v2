import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "./hooks/admin/AuthContext";
import { I18nProvider } from "./hooks/admin/I18nContext";
import "../css/app.css";

createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <AuthProvider>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </AuthProvider>
  </React.StrictMode>
);
