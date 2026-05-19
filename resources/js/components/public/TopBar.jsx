import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

export default function TopBar({ leftText, contact, email }) {
  const { t } = useI18n();
  const whatsappNumber = contact || "+261 38 09 137 03";
  const emailAddress = email || "worldofmadagascartour@gmail.com";
  const whatsappHref = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`;

  return (
    <div className="bg-emerald-900 text-sm text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-2 sm:flex-row sm:items-center">
        <p>{leftText}</p>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="transition hover:text-emerald-200">
            {t("public.common.whatsapp")}: {whatsappNumber}
          </a>
          <span className="hidden text-white/40 sm:inline">|</span>
          <a href={`mailto:${emailAddress}`} className="transition hover:text-emerald-200">
            {t("public.common.email")}: {emailAddress}
          </a>
        </div>
      </div>
    </div>
  );
}
