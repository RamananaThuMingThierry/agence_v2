import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createPublicBooking } from "../../api/bookings";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { fetchPublicTour } from "../../api/tours";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import TopBar from "../../components/public/TopBar";
import ScrollToTopButton from "../../components/public/ScrollToTopButton";
import { contactLinks, footerLinks, navLinks, siteMeta } from "../../data/publicHomeData";
import { mapTourToPublicItem } from "../../utils/publicTour";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  start_date: "",
  end_date: "",
  number_of_people: 2,
  message: "",
};

function formatDateLabel(value) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function BookingPage() {
  const { tourId } = useParams();
  const [platformMeta, setPlatformMeta] = useState(siteMeta);
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        }));
      } catch {
        if (active) {
          setPlatformMeta(siteMeta);
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

        setTour(item ? mapTourToPublicItem(item) : null);
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
  }, [tourId]);

  const publicLinks = useMemo(
    () => navLinks.map((link) => ({
      ...link,
      href: link.href.startsWith("#") ? `/${link.href}` : link.href,
    })),
    [],
  );

  const estimatedTotal = useMemo(() => {
    if (!tour) return null;

    const people = Number(form.number_of_people || 0);

    if (!Number.isFinite(people) || people <= 0) return tour.formattedPrice;

    return (tour.price * people).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  }, [form.number_of_people, tour]);

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

      const messageParts = [result?.message || "Votre demande de reservation a ete envoyee."];

      if (result?.notifications?.email_sent) {
        messageParts.push("Une notification email a aussi ete envoyee a la plateforme.");
      }

      if (result?.notifications?.whatsapp_ready) {
        messageParts.push("Le message WhatsApp pre-rempli vient d'etre ouvert.");
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
        setFieldErrors(normalized);
      }

      setErrorMessage(apiMessage || "Impossible d'envoyer la reservation pour le moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-stone-50 text-slate-800">
      <TopBar leftText={platformMeta.topBarLeft} rightText={platformMeta.topBarRight} />
      <PublicHeader
        logo={platformMeta.logo}
        brand={platformMeta.brand}
        tagline={platformMeta.tagline}
        links={publicLinks}
        homeHref="/#home"
        contactHref="/#contact"
      />
      <section className="bg-stone-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          {loading ? (
            <div className="rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center text-sm font-semibold text-slate-500 shadow-sm">Chargement du formulaire...</div>
          ) : !tour ? (
            <div className="rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center text-sm font-semibold text-slate-500 shadow-sm">Tour introuvable.</div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
              <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-700">Reservation</p>
                <h1 className="mb-3 text-3xl font-extrabold text-slate-900 md:text-4xl">Reserver {tour.title}</h1>
                <p className="mb-8 max-w-2xl text-sm leading-relaxed text-slate-600">Indiquez vos dates, le nombre de voyageurs et vos besoins. L'agence pourra ensuite confirmer la disponibilite et finaliser le voyage correspondant.</p>

                {successMessage ? <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{successMessage}</div> : null}
                {errorMessage ? <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errorMessage}</div> : null}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Nom complet</span>
                      <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="Votre nom" />
                      {fieldErrors.name ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.name}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
                      <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="vous@email.com" />
                      {fieldErrors.email ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.email}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Telephone</span>
                      <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="Votre numero" />
                      {fieldErrors.phone ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.phone}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Nombre de voyageurs</span>
                      <input type="text" inputMode="numeric" name="number_of_people" value={form.number_of_people} onChange={handleChange} className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="2" />
                      {fieldErrors.number_of_people ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.number_of_people}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Date de depart</span>
                      <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                      {fieldErrors.start_date ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.start_date}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">Date de retour</span>
                      <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                      {fieldErrors.end_date ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.end_date}</span> : null}
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">Message</span>
                    <textarea name="message" value={form.message} onChange={handleChange} rows="5" className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="Precisez vos attentes, vos questions ou des informations utiles." />
                    {fieldErrors.message ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.message}</span> : null}
                  </label>

                  <button type="submit" disabled={submitting} className="inline-flex rounded-full bg-emerald-700 px-8 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70">
                    {submitting ? "Envoi en cours..." : "Envoyer la reservation"}
                  </button>
                </form>
              </div>

              <aside className="space-y-6">
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                  <img src={tour.image} alt={tour.title} className="h-72 w-full object-cover" />
                  <div className="p-6">
                    <span className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${tour.categoryTone}`}>{tour.category}</span>
                    <h2 className="mb-3 text-2xl font-extrabold text-slate-900">{tour.title}</h2>
                    <p className="text-sm leading-relaxed text-slate-600">{tour.excerpt || tour.description || "Description du circuit a venir."}</p>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-xl font-extrabold text-slate-900">Resume du voyage</h3>
                  <div className="space-y-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
                      <span>Duree</span>
                      <strong className="text-slate-900">{tour.duration}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
                      <span>Depart</span>
                      <strong className="text-slate-900">{tour.departure}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
                      <span>Arrivee</span>
                      <strong className="text-slate-900">{tour.arrival}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
                      <span>Prix par personne</span>
                      <strong className="text-emerald-800">{tour.formattedPrice}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
                      <span>Depart choisi</span>
                      <strong className="text-slate-900">{formatDateLabel(form.start_date)}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
                      <span>Retour choisi</span>
                      <strong className="text-slate-900">{formatDateLabel(form.end_date)}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Estimation</span>
                      <strong className="text-lg text-emerald-800">{estimatedTotal || tour.formattedPrice}</strong>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
      <PublicFooter footerLinks={footerLinks} contactLinks={contactLinks} logo={platformMeta.logo} brand={platformMeta.brand} />
      <ScrollToTopButton />
    </div>
  );
}
