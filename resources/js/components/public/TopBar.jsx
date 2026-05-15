import React from "react";

export default function TopBar({ leftText, rightText }) {
  return (
    <div className="bg-emerald-900 text-sm text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-2 sm:flex-row sm:items-center">
        <p>{leftText}</p>
        <p>{rightText}</p>
      </div>
    </div>
  );
}
