import React, { useEffect, useMemo, useState } from "react";
import { createPublicBooking } from "../../api/bookings";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { fetchPublicTour } from "../../api/tours";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import TopBar from "../../components/public/TopBar";
import ScrollToTopButton from "../../components/public/ScrollToTopButton";
import { useI18n } from "../../hooks/admin/I18nContext";
import { formatUsd } from "../../utils/currency";
import { mapTourToPublicItem } from "../../utils/publicTour";
import { localizePublicValidationErrors } from "../../utils/publicValidation";
import { useParams } from "react-router-dom";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  start_date: "",
  end_date: "",
  number_of_people: 2,
  message: "",
};

function formatDateLabel(value, lang) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  const localeMap = { fr: "fr-FR", en: "en-GB", es: "es-ES", de: "de-DE" };
  return new Intl.DateTimeFormat(localeMap[lang] || "fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatPrice(price, lang) {
  const localeMap = { fr: "fr-FR", en: "en-GB", es: "es-ES", de: "de-DE" };
  return formatUsd(price, localeMap[lang] || "fr-FR");
}

export default function BookingPage() {
  const { t, lang } = useI18n();
  const { tourId } = useParams();
  const [platformMeta, setPlatformMeta] = useState({
    logo: "/images/logo.png",
    brand: "World of Madagascar",
    tagline: t("public.home.meta.tagline"),
    topBarLeft: t("public.home.meta.topbar_left"),
    contact: "+261 38 09 137 03",
    whatsapp: "https://wa.me/261380913703",
    email: "worldofmadagascartour@gmail.com",
  });
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setPlatformMeta((current) => ({
      ...current,
      tagline: t("public.home.meta.tagline"),
      topBarLeft: t("public.home.meta.topbar_left"),
    }));
  }, [t]);

  useEffect(() => {
    let active = true;

    async function loadPlatformMeta() {
      try {
        const settings = await fetchPlatformSettings();

        if (!active || !settings) return;

        setPlatformMeta((current) => ({
          ...current,
          logo: settings.logo ? `/${String(settings.logo).replace(/^\/+/, "")}` : current.logo,
          brand: settings.platform_name || current.brand,
          contact: settings.contact || current.contact,
          whatsapp: settings.whatsapp || current.whatsapp,
          email: settings.email || current.email,
        }));
      } catch {
        if (active) {
          setPlatformMeta((current) => ({ ...current }));
        }
      }
    }

    loadPlatformMeta();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadTour() {
      setLoading(true);

      try {
        const item = await fetchPublicTour(tourId);

        if (!active) return;

        const mappedTour = item ? mapTourToPublicItem(item, t) : null;
        setTour(
          mappedTour
            ? {
                ...mappedTour,
                formattedPrice: formatPrice(mappedTour.price, lang),
              }
            : null,
        );
      } catch {
        if (active) {
          setTour(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTour();

    return () => {
      active = false;
    };
  }, [lang, t, tourId]);

  const publicLinks = useMemo(
    () => [
      { href: "/#home", label: t("public.home.nav.home") },
      { href: "/#about", label: t("public.home.nav.about") },
      { href: "/#tours", label: t("public.home.nav.tours") },
      { href: "/#gallery", label: t("public.home.nav.gallery") },
      { href: "/#why", label: t("public.home.nav.why") },
      { href: "/#testimonials", label: t("public.home.nav.testimonials") },
      { href: "/#contact", label: t("public.home.nav.contact") },
    ],
    [t],
  );

  const footerLinks = useMemo(
    () => [
      { label: t("public.home.nav.home"), href: "/#home" },
      { label: t("public.home.nav.about"), href: "/#about" },
      { label: t("public.home.nav.tours"), href: "/#tours" },
      { label: t("public.home.nav.gallery"), href: "/#gallery" },
      { label: t("public.home.nav.why"), href: "/#why" },
      { label: t("public.home.nav.testimonials"), href: "/#testimonials" },
      { label: t("public.home.nav.contact"), href: "/#contact" },
    ],
    [t],
  );

  const estimatedTotal = useMemo(() => {
    if (!tour) return null;

    const people = Number(form.number_of_people || 0);
    if (!Number.isFinite(people) || people <= 0) return tour.formattedPrice;

    return formatPrice(tour.price * people, lang);
  }, [form.number_of_people, lang, tour]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "number_of_people" ? value.replace(/[^0-9]/g, "") : value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: undefined,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!tour) return;

    setSubmitting(true);
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await createPublicBooking({
        ...form,
        tour_id: tour.id,
        number_of_people: Number(form.number_of_people || 0),
      });

      if (result?.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      }

      const messageParts = [result?.message || t("public.booking.form.success")];

      if (result?.notifications?.email_sent) {
        messageParts.push(t("public.booking.form.email_sent"));
      }

      if (result?.notifications?.whatsapp_ready) {
        messageParts.push(t("public.booking.form.whatsapp_opened"));
      }

      setSuccessMessage(messageParts.join(" "));
      setForm(initialForm);
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      const apiMessage = error?.response?.data?.message;

      if (apiErrors && typeof apiErrors === "object") {
        const normalized = Object.fromEntries(
          Object.entries(apiErrors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)]),
        );
        setFieldErrors(
          localizePublicValidationErrors({
            lang,
            errors: normalized,
            fieldLabels: {
              name: t("public.booking.form.fields.name"),
              email: t("public.booking.form.fields.email"),
              phone: t("public.booking.form.fields.phone"),
              start_date: t("public.booking.form.fields.start_date"),
              end_date: t("public.booking.form.fields.end_date"),
              number_of_people: t("public.booking.form.fields.people"),
              message: t("public.booking.form.fields.message"),
              tour_id: "tour",
            },
          }),
        );
      }

      setErrorMessage(apiMessage || t("public.booking.form.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="public-shell">
      <TopBar leftText={platformMeta.topBarLeft} contact={platformMeta.contact} email={platformMeta.email} />
      <PublicHeader
        logo={platformMeta.logo}
        brand={platformMeta.brand}
        tagline={platformMeta.tagline}
        links={publicLinks}
        homeHref="/#home"
        contactHref="/#contact"
      />
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          {loading ? (
            <div className="public-panel rounded-3xl px-6 py-12 text-center text-sm font-semibold text-[color:var(--muted)]">{t("public.booking.loading")}</div>
          ) : !tour ? (
            <div className="public-panel rounded-3xl px-6 py-12 text-center text-sm font-semibold text-[color:var(--muted)]">{t("public.booking.not_found")}</div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
              <div className="public-panel-strong rounded-3xl p-6 md:p-8">
                <p className="public-eyebrow mb-3 text-sm font-bold uppercase">{t("public.booking.eyebrow")}</p>
                <h1 className="public-heading mb-3 text-3xl font-extrabold md:text-4xl">{t("public.booking.title", { tour: tour.title })}</h1>
                <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[color:var(--ink-soft)]">{t("public.booking.text")}</p>

                {successMessage ? <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{successMessage}</div> : null}
                {errorMessage ? <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errorMessage}</div> : null}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.booking.form.fields.name")}</span>
                      <input type="text" name="name" value={form.name} onChange={handleChange} className="public-input w-full rounded-2xl px-4 py-3 text-sm" placeholder={t("public.booking.form.fields.name_placeholder")} />
                      {fieldErrors.name ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.name}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.booking.form.fields.email")}</span>
                      <input type="email" name="email" value={form.email} onChange={handleChange} className="public-input w-full rounded-2xl px-4 py-3 text-sm" placeholder={t("public.booking.form.fields.email_placeholder")} />
                      {fieldErrors.email ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.email}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.booking.form.fields.phone")}</span>
                      <input type="text" name="phone" value={form.phone} onChange={handleChange} className="public-input w-full rounded-2xl px-4 py-3 text-sm" placeholder={t("public.booking.form.fields.phone_placeholder")} />
                      {fieldErrors.phone ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.phone}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.booking.form.fields.people")}</span>
                      <input type="text" inputMode="numeric" name="number_of_people" value={form.number_of_people} onChange={handleChange} className="public-input w-full rounded-2xl px-4 py-3 text-sm" placeholder={t("public.booking.form.fields.people_placeholder")} />
                      {fieldErrors.number_of_people ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.number_of_people}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.booking.form.fields.start_date")}</span>
                      <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="public-input w-full rounded-2xl px-4 py-3 text-sm" />
                      {fieldErrors.start_date ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.start_date}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.booking.form.fields.end_date")}</span>
                      <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="public-input w-full rounded-2xl px-4 py-3 text-sm" />
                      {fieldErrors.end_date ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.end_date}</span> : null}
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.booking.form.fields.message")}</span>
                    <textarea name="message" value={form.message} onChange={handleChange} rows="5" className="public-input w-full rounded-2xl px-4 py-3 text-sm" placeholder={t("public.booking.form.fields.message_placeholder")} />
                    {fieldErrors.message ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.message}</span> : null}
                  </label>

                  <button type="submit" disabled={submitting} className="public-btn-primary inline-flex rounded-full px-8 py-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70">
                    {submitting ? t("public.booking.form.submitting") : t("public.booking.form.submit")}
                  </button>
                </form>
              </div>

              <aside className="space-y-6">
                <div className="public-panel overflow-hidden rounded-3xl">
                  <img src={tour.image} alt={tour.title} className="h-72 w-full object-cover" />
                  <div className="p-6">
                    <span className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${tour.categoryTone}`}>{tour.category}</span>
                    <h2 className="public-heading mb-3 text-2xl font-extrabold">{tour.title}</h2>
                    <p className="text-sm leading-relaxed text-[color:var(--ink-soft)]">{tour.excerpt || tour.description || t("public.tour_detail.description_coming")}</p>
                  </div>
                </div>

                <div className="public-panel rounded-3xl p-6">
                  <h3 className="public-heading mb-4 text-xl font-extrabold">{t("public.booking.summary.title")}</h3>
                  <div className="space-y-4 text-sm text-[color:var(--ink-soft)]">
                    <div className="flex items-center justify-between gap-4 border-b border-[rgba(125,94,78,0.12)] pb-4">
                      <span>{t("public.booking.summary.duration")}</span>
                      <strong className="text-[color:var(--accent-deep)]">{tour.duration}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-[rgba(125,94,78,0.12)] pb-4">
                      <span>{t("public.booking.summary.departure")}</span>
                      <strong className="text-[color:var(--accent-deep)]">{tour.departure}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-[rgba(125,94,78,0.12)] pb-4">
                      <span>{t("public.booking.summary.arrival")}</span>
                      <strong className="text-[color:var(--accent-deep)]">{tour.arrival}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-[rgba(125,94,78,0.12)] pb-4">
                      <span>{t("public.booking.summary.price_per_person")}</span>
                      <strong className="public-price">{tour.formattedPrice}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-[rgba(125,94,78,0.12)] pb-4">
                      <span>{t("public.booking.summary.selected_departure")}</span>
                      <strong className="text-[color:var(--accent-deep)]">{formatDateLabel(form.start_date, lang)}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-[rgba(125,94,78,0.12)] pb-4">
                      <span>{t("public.booking.summary.selected_return")}</span>
                      <strong className="text-[color:var(--accent-deep)]">{formatDateLabel(form.end_date, lang)}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>{t("public.booking.summary.estimate")}</span>
                      <strong className="public-price text-lg">{estimatedTotal || tour.formattedPrice}</strong>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
      <PublicFooter footerLinks={footerLinks} logo={platformMeta.logo} brand={platformMeta.brand} />
      <ScrollToTopButton />
    </div>
  );
}
