import React from "react";

export default function PublicHeader({
  logo,
  brand,
  tagline,
  links,
  homeHref = "#home",
  contactHref = "#contact",
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <a href={homeHref} className="flex items-center gap-3">
          <img src={logo} alt={`${brand} logo`} className="h-14 w-14 rounded bg-white p-1 object-contain" />
          <div>
            <h1 className="text-lg font-extrabold leading-tight text-red-700">{brand}</h1>
            <p className="text-xs text-slate-500">{tagline}</p>
          </div>
        </a>

        <div className="hidden items-center gap-7 text-sm font-medium md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-emerald-700">
              {link.label}
            </a>
          ))}
        </div>

        <a href={contactHref} className="hidden rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 sm:inline-flex">
          Planifier mon voyage
        </a>
      </nav>
    </header>
  );
}
