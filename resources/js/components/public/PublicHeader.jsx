import React, { useEffect, useState } from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function TranslateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 5h12" />
      <path d="M10 5c0 6-2 10-6 12" />
      <path d="M7 9c1.5 3 4 5.5 7 7" />
      <path d="m17 5 4 10" />
      <path d="m15 11 4-1 4 1" />
    </svg>
  );
}

export default function PublicHeader({
  logo,
  brand,
  tagline,
  links,
  homeHref = "#home",
  contactHref = "#contact",
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useI18n();
  const languageOptions = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "de", label: "DE" },
  ];

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  function closeMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:py-4">
        <a href={homeHref} className="flex min-w-0 items-center gap-3" onClick={closeMenu}>
          <img src={logo} alt={`${brand} logo`} className="h-11 w-11 rounded bg-white p-1 object-contain sm:h-12 sm:w-12 md:h-14 md:w-14" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-extrabold leading-tight text-red-700 sm:text-base md:text-lg">{brand}</h1>
            <p className="truncate text-[11px] text-slate-500 sm:text-xs">{tagline}</p>
          </div>
        </a>

        <div className="hidden items-center gap-5 text-sm font-medium lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-emerald-700">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="relative hidden md:block">
            <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-slate-500">
              <TranslateIcon />
            </span>
            <select
              value={lang}
              onChange={(event) => setLang(event.target.value)}
              className="appearance-none rounded-full border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm font-semibold text-slate-700 outline-none transition hover:border-emerald-300 focus:border-emerald-500"
              aria-label={t("public.header.language_switcher.label")}
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <a href={contactHref} className="hidden rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 md:inline-flex">
            {t("public.header.cta.plan_trip")}
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
            aria-label={mobileOpen ? t("public.header.menu.close") : t("public.header.menu.open")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="space-y-2">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <label className="relative mt-4 block md:hidden">
              <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-slate-500">
                <TranslateIcon />
              </span>
              <select
                value={lang}
                onChange={(event) => setLang(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition hover:border-emerald-300 focus:border-emerald-500"
                aria-label={t("public.header.language_switcher.label")}
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <a
              href={contactHref}
              onClick={closeMenu}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 md:hidden"
            >
              {t("public.header.cta.plan_trip")}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
