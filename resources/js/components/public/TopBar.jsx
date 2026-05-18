import React from "react";

function extractContactValue(text, label) {
  const pattern = new RegExp(`${label}\\s*:\\s*([^|]+)`, "i");
  const match = String(text || "").match(pattern);
  return match ? match[1].trim() : "";
}

export default function TopBar({ leftText, rightText }) {
  const whatsappNumber = extractContactValue(rightText, "WhatsApp") || "+261 38 09 137 03";
  const emailAddress = extractContactValue(rightText, "Email") || "worldofmadagascartour@gmail.com";
  const whatsappHref = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`;

  return (
    <div className="bg-emerald-900 text-sm text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-2 sm:flex-row sm:items-center">
        <p>{leftText}</p>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="transition hover:text-emerald-200">
            WhatsApp: {whatsappNumber}
          </a>
          <span className="hidden text-white/40 sm:inline">|</span>
          <a href={`mailto:${emailAddress}`} className="transition hover:text-emerald-200">
            Email: {emailAddress}
          </a>
        </div>
      </div>
    </div>
  );
}
