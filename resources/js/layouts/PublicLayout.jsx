import React from "react";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-800">
      <Outlet />
    </div>
  );
}
