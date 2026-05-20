import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

export default function TopBar({ leftText, contact, email }) {
  const { t } = useI18n();
  const whatsappNumber = contact || "+261 38 09 137 03";
  const emailAddress = email || "worldofmadagascartour@gmail.com";
  const whatsappHref = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`;
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}`;

  return (
    <div className="bg-[color:var(--accent-deep)] text-sm text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-2 text-center sm:flex-row sm:items-center sm:text-left">
        <p className="text-white/78">{leftText}</p>
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3">
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="transition hover:text-[#f5d089]">
            {t("public.common.whatsapp")}: {whatsappNumber}
          </a>
          <span className="hidden text-white/40 sm:inline">|</span>
          <a href={gmailHref} target="_blank" rel="noreferrer" className="transition hover:text-[#f5d089]">
            {t("public.common.email")}: {emailAddress}
          </a>
        </div>
      </div>
    </div>
  );
}
