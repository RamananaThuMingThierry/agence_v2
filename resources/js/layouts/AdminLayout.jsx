import React, { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/admin/AuthContext";
import { useI18n } from "../hooks/admin/I18nContext";

function buildAvatarUrl(path) {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `/${String(path).replace(/^\/+/, "")}`;
}

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

function Icon({ name, className = "h-5 w-5" }) {
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
    case "dashboard":
      return (
        <svg {...common}>
          <path d="M3 13h8V3H3z" />
          <path d="M13 21h8v-6h-8z" />
          <path d="M13 10h8V3h-8z" />
          <path d="M3 21h8v-4H3z" />
        </svg>
      );
    case "slides":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 15 4-4 4 4 3-3 7 7" />
          <circle cx="15.5" cy="9.5" r="1.5" />
        </svg>
      );
    case "testimonials":
      return (
        <svg {...common}>
          <path d="M7 10h.01" />
          <path d="M12 10h.01" />
          <path d="M17 10h.01" />
          <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "contact-forms":
      return (
        <svg {...common}>
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "bookings":
      return (
        <svg {...common}>
          <path d="M7 4v4" />
          <path d="M17 4v4" />
          <rect x="4" y="6" width="16" height="14" rx="2" />
          <path d="M4 10h16" />
        </svg>
      );
    case "tours":
      return (
        <svg {...common}>
          <path d="M3 20h18" />
          <path d="M5 20V8l7-4 7 4v12" />
          <path d="M9 12h6" />
          <path d="M12 8v8" />
        </svg>
      );
    case "gallery":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m7 14 3-3 4 4 2-2 3 3" />
          <circle cx="9" cy="8" r="1.5" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "activity":
      return (
        <svg {...common}>
          <path d="M4 12h4l2-7 4 14 2-7h4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4.6H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H22a2 2 0 1 1 0 4h-.09c-.66 0-1.3.26-1.77.73-.47.47-.73 1.11-.73 1.77Z" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
    case "collapse":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
        </svg>
      );
    case "expand":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M15 4v16" />
        </svg>
      );
    case "translate":
      return (
        <svg {...common}>
          <path d="M4 5h12" />
          <path d="M10 5c0 6-2 10-6 12" />
          <path d="M7 9c1.5 3 4 5.5 7 7" />
          <path d="m17 5 4 10" />
          <path d="m15 11 4-1 4 1" />
        </svg>
      );
    case "account":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20a8 8 0 0 1 16 0" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
          <path d="M10 12h4" />
          <path d="M12 10v4" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg {...common}>
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      );
    default:
      return null;
  }
}

const NAV = [
  { to: "/admin/dashboard", icon: "dashboard", labelKey: "layout.nav.dashboard" },

  { to: "/admin/bookings", icon: "bookings", labelKey: "layout.nav.bookings" },
  { to: "/admin/tours", icon: "tours", labelKey: "layout.nav.tours" },

  { to: "/admin/slides", icon: "slides", labelKey: "layout.nav.slides" },
  { to: "/admin/galleries", icon: "gallery", labelKey: "layout.nav.galleries" },
  { to: "/admin/testimonials", icon: "testimonials", labelKey: "layout.nav.testimonials" },

  { to: "/admin/contact-forms", icon: "contact-forms", labelKey: "layout.nav.contact_forms" },

  { to: "/admin/users", icon: "users", labelKey: "layout.nav.users" },
  { to: "/admin/activity-logs", icon: "activity", labelKey: "layout.nav.activity_logs" },
  { to: "/admin/settings", icon: "settings", labelKey: "layout.nav.settings" },

  { action: "logout", icon: "logout", labelKey: "layout.nav.logout" },
];

function SidebarItem({ item, label, collapsed, onAction, mobile = false }) {
  const baseClass = "group flex w-full items-center gap-3 rounded px-3 py-3 text-sm font-semibold transition";

  if (item.action) {
    return (
      <button type="button" title={collapsed ? label : undefined} className={cn(baseClass, "text-red-50 bg-white/12 text-white")} onClick={() => onAction(item.action)}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/20 bg-white/10 text-white transition group-hover:border-white/40 group-hover:bg-white/20">
          <Icon name={item.icon} />
        </span>
        {!collapsed || mobile ? <span className="truncate">{label}</span> : null}
      </button>
    );
  }

  return (
    <NavLink
      to={item.to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          baseClass,
          isActive ? "bg-white text-red-700 shadow-[0_18px_45px_rgba(220,38,38,0.22)]" : "text-red-50 bg-white/20 hover:bg-white/40 hover:text-white",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded border transition",
              isActive ? "border-red-200 bg-red-50 text-red-700" : "border-white/20 bg-white/10 text-white group-hover:border-white/40 group-hover:bg-white/20",
            )}
          >
            <Icon name={item.icon} />
          </span>

          {!collapsed || mobile ? <span className="truncate">{label}</span> : null}
        </>
      )}
    </NavLink>
  );
}

function ConfirmModal({ open, title, message, labels, loading, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" aria-label={labels.cancel} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />

      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" onClick={onCancel} disabled={loading}>
            {labels.cancel}
          </button>
          <button type="button" className="inline-flex btn-sm items-center justify-center rounded-sm bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60" onClick={onConfirm} disabled={loading}>
            {loading ? labels.loading : labels.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

function getPageTitle(pathname, t) {
  if (pathname.startsWith("/admin/settings")) return t("layout.page_titles.settings");
  if (pathname.startsWith("/admin/activity-logs")) return t("layout.page_titles.activity_logs");
  if (pathname.startsWith("/admin/users")) return t("layout.page_titles.users");
  if (pathname.startsWith("/admin/contact-forms")) return t("layout.page_titles.contact_forms");
  if (pathname.startsWith("/admin/bookings")) return t("layout.page_titles.bookings");
  if (pathname.startsWith("/admin/galleries")) return t("layout.page_titles.galleries");
  if (pathname.startsWith("/admin/slides")) return t("layout.page_titles.slides");
  if (pathname.startsWith("/admin/testimonials")) return t("layout.page_titles.testimonials");
  if (pathname.startsWith("/admin/dashboard")) return t("layout.page_titles.dashboard");
  return t("layout.page_titles.default");
}

function LanguageSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    function handleClick(event) {
      if (!event.target.closest("[data-language-switcher]")) {
        setOpen(false);
      }
    }

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <div className="relative" data-language-switcher>
      <button type="button" className="inline-flex items-center gap-2 rounded-sm border border-black bg-white px-4 py-2 text-sm font-bold text-black transition hover:border-red-400 hover:bg-red-50 hover:text-red-800" onClick={() => setOpen((value) => !value)}>
        <Icon name="translate" className="h-4 w-4" />
        {lang.toUpperCase()}
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-3 w-28 rounded border border-red-100 bg-white p-2 shadow-[0_18px_45px_rgba(220,38,38,0.12)]">
          {["fr", "en", "es", "de"].map((code) => (
            <button
              key={code}
              type="button"
              className={cn("flex w-full items-center rounded px-3 py-1 text-sm font-semibold transition", lang === code ? "bg-red-600 text-white" : "text-black hover:bg-black/5")}
              onClick={() => {
                setLang(code);
                setOpen(false);
              }}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SidebarContent({ collapsed, onAction, t, mobile = false }) {
  return (
    <>
      <div className="mb-4">
        <div className={cn("flex items-center gap-3 overflow-hidden rounded-sm border border-white/15 bg-white px-3 py-2 shadow-[0_18px_40px_rgba(127,29,29,0.18)]", collapsed && !mobile ? "justify-center px-2 py-2" : "")}>
          <img src="/images/logo.png" alt="World of Madagascar" className={cn("block shrink-0 object-contain", collapsed && !mobile ? "h-12 w-12" : "h-14 w-14")} />

          {!collapsed || mobile ? (
            <div className="min-w-0">
              <div className="text-sm font-black leading-tight tracking-[0.14em] text-red-700">WORLD OF MADAGASCAR</div>
            </div>
          ) : null}
        </div>
      </div>

      <hr className="mb-5 border-white/15" />

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <nav className="space-y-2">
          {NAV.map((item) => (
            <SidebarItem key={item.to ?? item.action} item={item} label={t(item.labelKey)} collapsed={collapsed} onAction={onAction} mobile={mobile} />
          ))}
        </nav>
      </div>

      <div className="pt-6">
        <a
          href="/"
          className={cn("inline-flex items-center justify-center gap-3 rounded-sm border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20", collapsed && !mobile ? "w-14 px-0" : "w-full")}
          title={collapsed && !mobile ? t("layout.switcher.back_to_site") : undefined}
        >
          <Icon name="arrow-left" className="h-4 w-4" />
          {!collapsed || mobile ? <span>{t("layout.switcher.back_to_site")}</span> : null}
        </a>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { lang, setLang, t } = useI18n();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const headerAvatar = buildAvatarUrl(user?.avatar);
  const sidebarWidth = useMemo(() => (collapsed ? "lg:w-24" : "lg:w-72"), [collapsed]);
  const pageTitle = getPageTitle(location.pathname, t);

  useEffect(() => {
    document.title = `${pageTitle} | WORLD OF MADAGASCAR`;
  }, [pageTitle]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        setLogoutOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const lock = drawerOpen || logoutOpen;
    document.body.style.overflow = lock ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen, logoutOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  function handleAction(action) {
    if (action === "logout") {
      setLogoutOpen(true);
      setDrawerOpen(false);
    }
  }

  async function confirmLogout() {
    setLogoutLoading(true);

    try {
      await logout();
      setLogoutOpen(false);
      nav("/login", { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 px-6 text-center text-sm font-semibold text-slate-500">
        {t("layout.session.checking")}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen bg-white text-red-950">
      <div className="flex min-h-screen">
        <aside className={cn("sticky top-0 hidden h-screen shrink-0 border-r border-red-800 bg-red-700 p-5 text-white lg:flex lg:flex-col", sidebarWidth)}>
          <SidebarContent collapsed={collapsed} onAction={handleAction} t={t} />
        </aside>

        {drawerOpen ? (
          <button type="button" aria-label={t("layout.switcher.close_menu")} className="fixed inset-0 z-40 bg-red-950/45 backdrop-blur-sm lg:hidden" onClick={() => setDrawerOpen(false)} />
        ) : null}

        <aside className={cn("fixed inset-y-0 left-0 z-50 flex h-screen w-[88vw] max-w-sm -translate-x-full flex-col border-r border-red-800 bg-red-700 p-5 text-white shadow-[0_30px_80px_rgba(127,29,29,0.35)] transition-transform duration-300 lg:hidden", drawerOpen && "translate-x-0")}>
          <div className="flex h-full flex-col">
            <div className="mb-5 flex justify-end">
              <button type="button" aria-label={t("layout.switcher.close_menu")} className="inline-flex h-11 w-11 items-center justify-center rounded border border-white/20 bg-white/10 text-white transition hover:bg-white/20" onClick={() => setDrawerOpen(false)}>
                <Icon name="close" />
              </button>
            </div>

            <SidebarContent collapsed={false} onAction={handleAction} t={t} mobile />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-red-100 bg-white/95 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button type="button" aria-label={t("layout.switcher.open_menu")} className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-black bg-white text-black transition hover:border-red-400 hover:bg-red-50 hover:text-red-800 lg:hidden" onClick={() => setDrawerOpen(true)}>
                  <Icon name="menu" />
                </button>

                <button
                  type="button"
                  className="hidden h-11 w-11 items-center justify-center rounded-sm border border-black bg-white text-black transition hover:border-red-400 hover:bg-red-50 hover:text-red-800 lg:inline-flex"
                  onClick={() => setCollapsed((value) => !value)}
                  title={collapsed ? t("layout.switcher.expand_menu") : t("layout.switcher.collapse_menu")}
                >
                  <Icon name={collapsed ? "expand" : "collapse"} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <LanguageSwitcher lang={lang} setLang={setLang} />

                <button type="button" className="inline-flex items-center gap-2 rounded-sm border border-red-200 bg-black px-2 py-1 btn-sm text-sm font-bold text-white shadow-[0_18px_40px_rgba(220,38,38,0.18)] transition hover:bg-black" onClick={() => nav("/admin/settings")}>
                  {headerAvatar ? (
                    <span className="flex h-9 w-9 overflow-hidden rounded-sm border border-white/30 bg-white/15">
                      <img src={headerAvatar} alt={user?.pseudo || t("layout.account.profile")} className="h-full w-full object-cover" />
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/30 bg-white/15">
                      <Icon name="account" className="h-4 w-4" />
                    </span>
                  )}
                  <span className="hidden sm:inline">{t("layout.account.my_account")}</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>

          <footer className="border-t border-red-100 bg-red-50/70 backdrop-blur-xl">
            <div className="flex flex-col gap-3 px-4 py-5 text-sm text-red-700 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
              <p>{t("layout.footer.copyright", { year: new Date().getFullYear() })}</p>
              <div className="flex flex-wrap items-center gap-5">
                <span className="inline-flex items-center gap-2">
                  <Icon name="shield" className="h-4 w-4" />
                  {t("layout.footer.secure")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Icon name="bolt" className="h-4 w-4" />
                  {t("layout.footer.responsive")}
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <ConfirmModal
        open={logoutOpen}
        title={t("layout.logout_modal.title")}
        message={t("layout.logout_modal.message")}
        labels={{
          confirm: t("layout.logout_modal.confirm"),
          loading: t("layout.logout_modal.loading"),
          cancel: t("layout.logout_modal.cancel"),
        }}
        loading={logoutLoading}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
