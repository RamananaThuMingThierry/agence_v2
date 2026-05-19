import React from "react";
import { Link } from "react-router-dom";

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

function ActionIcon({ name, className = "h-4 w-4" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "details":
      return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>;
    case "edit":
      return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>;
    case "delete":
      return <svg {...common}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5" /><path d="M14 11v5" /></svg>;
    case "restore":
      return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 3v6h6" /></svg>;
    case "force":
      return <svg {...common}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /><path d="m9 10 6 6" /><path d="m15 10-6 6" /></svg>;
    default:
      return null;
  }
}

export function ActionLink({ to, title, icon, tone = "default" }) {
  const tones = {
    default: "border-stone-300 text-slate-700 hover:bg-stone-100",
    dark: "border-stone-300 text-slate-700 hover:bg-black hover:text-white",
  };

  return (
    <Link
      to={to}
      title={title}
      aria-label={title}
      className={cn("inline-flex h-10 w-10 items-center justify-center rounded-sm border transition", tones[tone] || tones.default)}
    >
      <ActionIcon name={icon} />
    </Link>
  );
}

export function ActionButton({ onClick, title, icon, tone = "default", type = "button", disabled = false }) {
  const tones = {
    default: "border-stone-300 text-slate-700 hover:bg-stone-100",
    danger: "border-rose-200 text-rose-700 hover:bg-red-600 hover:text-white",
    warning: "border-red-200 text-red-700 hover:bg-red-50",
    subtleDanger: "border-rose-200 text-rose-700 hover:bg-rose-50",
    dark: "border-stone-300 text-slate-700 hover:bg-black hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={cn("inline-flex h-10 w-10 items-center justify-center rounded-sm border transition disabled:cursor-not-allowed disabled:opacity-60", tones[tone] || tones.default)}
    >
      <ActionIcon name={icon} />
    </button>
  );
}
