import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { fetchPublicTours } from "../../api/tours";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import SectionTitle from "../../components/public/SectionTitle";
import TopBar from "../../components/public/TopBar";
import ScrollToTopButton from "../../components/public/ScrollToTopButton";
import { contactLinks, footerLinks, navLinks, siteMeta } from "../../data/publicHomeData";
import { mapTourToPublicItem } from "../../utils/publicTour";

function TourCard({ tour }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
      <img src={tour.image} alt={tour.title} className="h-60 w-full object-cover" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${tour.categoryTone}`}>{tour.category}</span>
          <span className="font-bold text-slate-900">{tour.duration}</span>
        </div>
        <h2 className="mb-3 text-xl font-extrabold text-slate-900">{tour.title}</h2>
        <p className="mb-5 text-sm leading-relaxed text-slate-600">{tour.excerpt || "Description a venir."}</p>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Depart</p>
            <p className="text-sm font-semibold text-slate-700">{tour.departure}</p>
          </div>
          <p className="text-2xl font-extrabold text-emerald-800">{tour.formattedPrice}</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/circuits/${tour.tourId}`} className="flex-1 rounded-full bg-emerald-700 py-3 text-center font-bold text-white transition hover:bg-emerald-800">
            Voir plus
          </Link>
          <Link to={`/reservations/${tour.tourId}`} className="flex-1 rounded-full border border-emerald-700 py-3 text-center font-bold text-emerald-700 transition hover:bg-emerald-50">
            Reserver
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ToursListPage() {
  const [platformMeta, setPlatformMeta] = useState(siteMeta);
  const [tours, setTours] = useState([]);

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

    async function loadTours() {
      try {
        const items = await fetchPublicTours();

        if (!active || !Array.isArray(items)) return;

        setTours(items.map(mapTourToPublicItem));
      } catch {
        if (active) {
          setTours([]);
        }
      }
    }

    loadTours();

    return () => {
      active = false;
    };
  }, []);

  const publicLinks = useMemo(
    () =>
      navLinks.map((link) => ({
        ...link,
        href: link.href.startsWith("#") ? `/${link.href}` : link.href,
      })),
    [],
  );

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

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle
            eyebrow="Tous les circuits"
            title="Explorez tous nos circuits en mode carte"
            text="Comparez facilement les destinations, la duree et le prix de chaque voyage avant de consulter le detail."
          />

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.tourId || tour.id || tour.title} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      <PublicFooter footerLinks={footerLinks} contactLinks={contactLinks} logo={platformMeta.logo} brand={platformMeta.brand} />
      <ScrollToTopButton />
    </div>
  );
}
