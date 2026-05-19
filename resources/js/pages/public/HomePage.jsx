import React, { useEffect, useMemo, useState } from "react";
import { fetchPublicGalleries } from "../../api/galleries";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { fetchPublicPlatformVideos } from "../../api/platformVideos";
import { fetchPublicSlides } from "../../api/slides";
import { fetchPublishedTestimonials } from "../../api/testimonials";
import { fetchPublicTours } from "../../api/tours";
import AboutSection from "../../components/public/AboutSection";
import ContactSection from "../../components/public/ContactSection";
import CustomTripCtaSection from "../../components/public/CustomTripCtaSection";
import FaqSection from "../../components/public/FaqSection";
import FeaturedToursSection from "../../components/public/FeaturedToursSection";
import GalleryPreviewSection from "../../components/public/GalleryPreviewSection";
import HeroSection from "../../components/public/HeroSection";
import LocationMapSection from "../../components/public/LocationMapSection";
import PaymentMethodsSection from "../../components/public/PaymentMethodsSection";
import PlatformVideoSection from "../../components/public/PlatformVideoSection";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import ScrollToTopButton from "../../components/public/ScrollToTopButton";
import TestimonialsSection from "../../components/public/TestimonialsSection";
import TopBar from "../../components/public/TopBar";
import ToursCatalogSection from "../../components/public/ToursCatalogSection";
import TrustStatsSection from "../../components/public/TrustStatsSection";
import WhyChooseSection from "../../components/public/WhyChooseSection";
import { useI18n } from "../../hooks/admin/I18nContext";
import { consumePublicSectionScroll, scrollToPublicSection } from "../../utils/publicScroll";
import { mapGalleryToPublicItem } from "../../utils/publicGallery";
import { mapTourToPublicItem } from "../../utils/publicTour";
import { mapPlatformVideoToPublicItem } from "../../utils/publicVideo";

export default function HomePage() {
  const { t } = useI18n();
  const fallbackTestimonials = useMemo(
    () => [
      { name: "Sarah M.", country: "France", quote: t("public.home.testimonials.fallback.0.quote") },
      { name: "James K.", country: "United Kingdom", quote: t("public.home.testimonials.fallback.1.quote") },
      { name: "Anna B.", country: "Germany", quote: t("public.home.testimonials.fallback.2.quote") },
    ],
    [t],
  );
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [platformMeta, setPlatformMeta] = useState({
    logo: "/images/logo.png",
    brand: "World of Madagascar",
    tagline: t("public.home.meta.tagline"),
    topBarLeft: t("public.home.meta.topbar_left"),
    contact: "+261 38 09 137 03",
    whatsapp: "https://wa.me/261380913703",
    email: "worldofmadagascartour@gmail.com",
    facebook: "https://www.facebook.com/profile.php?id=100084179285857",
    instagram: "https://www.instagram.com/world_of_madagascar?igsh=MTRuNXR4bm9sNThkag%3D%3D",
    address: t("public.footer.location_city"),
  });
  const [slides, setSlides] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [featuredTours, setFeaturedTours] = useState([]);
  const [allTours, setAllTours] = useState([]);
  const [platformVideos, setPlatformVideos] = useState([]);

  useEffect(() => {
    const targetId = consumePublicSectionScroll();
    if (!targetId) return;

    const frame = window.requestAnimationFrame(() => {
      scrollToPublicSection(targetId);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const navLinks = useMemo(
    () => [
      { href: "#home", label: t("public.home.nav.home") },
      { href: "#about", label: t("public.home.nav.about") },
      { href: "#tours", label: t("public.home.nav.tours") },
      { href: "#gallery", label: t("public.home.nav.gallery") },
      { href: "#why", label: t("public.home.nav.why") },
      { href: "#testimonials", label: t("public.home.nav.testimonials") },
      { href: "#contact", label: t("public.home.nav.contact") },
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

  const hero = useMemo(
    () => ({
      title: t("public.home.hero.title"),
      text: t("public.home.hero.text"),
      image: "https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=1600&q=80",
      highlights: [
        t("public.home.hero.highlights.0"),
        t("public.home.hero.highlights.1"),
        t("public.home.hero.highlights.2"),
        t("public.home.hero.highlights.3"),
      ],
    }),
    [t],
  );

  const aboutFounder = useMemo(
    () => ({
      name: "MILASOA Ricki Cardo",
      role: t("public.home.about.founder.role"),
      image: "/images/founder.jpg",
      location: t("public.home.about.founder.location"),
      experience: t("public.home.about.founder.experience"),
      languages: [
        t("public.home.about.founder.languages.0"),
        t("public.home.about.founder.languages.1"),
        t("public.home.about.founder.languages.2"),
        t("public.home.about.founder.languages.3"),
      ],
      countries: [
        t("public.home.about.founder.countries.0"),
        t("public.home.about.founder.countries.1"),
        t("public.home.about.founder.countries.2"),
        t("public.home.about.founder.countries.3"),
        t("public.home.about.founder.countries.4"),
        t("public.home.about.founder.countries.5"),
        t("public.home.about.founder.countries.6"),
        t("public.home.about.founder.countries.7"),
        t("public.home.about.founder.countries.8"),
        t("public.home.about.founder.countries.9"),
      ],
      paragraphs: [
        t("public.home.about.founder.paragraphs.0"),
        t("public.home.about.founder.paragraphs.1"),
        t("public.home.about.founder.paragraphs.2"),
        t("public.home.about.founder.paragraphs.3"),
      ],
      safariBookingsText: t("public.home.about.founder.reference_text"),
    }),
    [t],
  );

  const highlights = useMemo(
    () => [
      { value: "8+", label: t("public.home.highlights.0") },
      { value: "100%", label: t("public.home.highlights.1") },
      { value: "4", label: t("public.home.highlights.2") },
      { value: "24/7", label: t("public.home.highlights.3") },
    ],
    [t],
  );

  const reasons = useMemo(
    () => [
      { icon: "map-pin", title: t("public.home.reasons.0.title"), text: t("public.home.reasons.0.text"), tone: "bg-[rgba(198,90,61,0.14)] text-[color:var(--accent-dark)]" },
      { icon: "route", title: t("public.home.reasons.1.title"), text: t("public.home.reasons.1.text"), tone: "bg-[rgba(245,208,137,0.26)] text-[#855611]" },
      { icon: "leaf", title: t("public.home.reasons.2.title"), text: t("public.home.reasons.2.text"), tone: "bg-[rgba(115,132,106,0.18)] text-[color:var(--success)]" },
      { icon: "message", title: t("public.home.reasons.3.title"), text: t("public.home.reasons.3.text"), tone: "bg-[rgba(221,197,170,0.42)] text-[color:var(--accent-deep)]" },
    ],
    [t],
  );

  const paymentMethods = useMemo(
    () => [
      t("public.home.payment_methods.0"),
      t("public.home.payment_methods.1"),
      t("public.home.payment_methods.2"),
      t("public.home.payment_methods.3"),
      t("public.home.payment_methods.4"),
      t("public.home.payment_methods.5"),
    ],
    [t],
  );

  const customTrips = useMemo(
    () => [
      t("public.home.custom_trip.items.0"),
      t("public.home.custom_trip.items.1"),
      t("public.home.custom_trip.items.2"),
      t("public.home.custom_trip.items.3"),
    ],
    [t],
  );

  const faqItems = useMemo(
    () => [
      { question: t("public.home.faq.items.0.question"), answer: t("public.home.faq.items.0.answer") },
      { question: t("public.home.faq.items.1.question"), answer: t("public.home.faq.items.1.answer") },
      { question: t("public.home.faq.items.2.question"), answer: t("public.home.faq.items.2.answer") },
      { question: t("public.home.faq.items.3.question"), answer: t("public.home.faq.items.3.answer") },
      { question: t("public.home.faq.items.4.question"), answer: t("public.home.faq.items.4.answer") },
    ],
    [t],
  );

  const officeLocation = useMemo(
    () => ({
      query: t("public.home.location.map_query"),
    }),
    [t],
  );

  useEffect(() => {
    setTestimonials(fallbackTestimonials);
  }, [fallbackTestimonials]);

  useEffect(() => {
    setPlatformMeta((current) => ({
      ...current,
      tagline: t("public.home.meta.tagline"),
      topBarLeft: t("public.home.meta.topbar_left"),
    }));
  }, [t]);

  useEffect(() => {
    let active = true;

    async function loadTestimonials() {
      try {
        const items = await fetchPublishedTestimonials();

        if (!active || !Array.isArray(items) || items.length === 0) {
          return;
        }

        setTestimonials(items.slice(0, 3));
      } catch {
        if (active) {
          setTestimonials(fallbackTestimonials.slice(0, 3));
        }
      }
    }

    loadTestimonials();

    return () => {
      active = false;
    };
  }, [fallbackTestimonials]);

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
          facebook: settings.facebook || current.facebook,
          instagram: settings.instagram || current.instagram,
          address: settings.address || current.address,
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

    async function loadSlides() {
      try {
        const items = await fetchPublicSlides();

        if (!active || !Array.isArray(items)) return;

        setSlides(items);
      } catch {
        if (active) {
          setSlides([]);
        }
      }
    }

    loadSlides();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadGalleries() {
      try {
        const items = await fetchPublicGalleries();

        if (!active || !Array.isArray(items)) return;

        setGalleryPreview(items.map((item) => mapGalleryToPublicItem(item, t)).slice(0, 4));
      } catch {
        if (active) {
          setGalleryPreview([]);
        }
      }
    }

    loadGalleries();

    return () => {
      active = false;
    };
  }, [t]);

  useEffect(() => {
    let active = true;

    async function loadPlatformVideos() {
      try {
        const items = await fetchPublicPlatformVideos();

        if (!active || !Array.isArray(items)) return;

        setPlatformVideos(items.map((item) => mapPlatformVideoToPublicItem(item)));
      } catch {
        if (active) {
          setPlatformVideos([]);
        }
      }
    }

    loadPlatformVideos();

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

        const latestTours = [...items].sort((left, right) => {
          const leftTime = left?.created_at ? new Date(left.created_at).getTime() : 0;
          const rightTime = right?.created_at ? new Date(right.created_at).getTime() : 0;

          if (leftTime !== rightTime) {
            return rightTime - leftTime;
          }

          return Number(right?.id || 0) - Number(left?.id || 0);
        });
        const mappedTours = latestTours.map((item) => mapTourToPublicItem(item, t));
        setAllTours(mappedTours);
        setFeaturedTours(mappedTours.slice(0, 6));
      } catch {
        if (active) {
          setAllTours([]);
          setFeaturedTours([]);
        }
      }
    }

    loadTours();

    return () => {
      active = false;
    };
  }, [t]);

  return (
    <div className="public-shell">
      <TopBar leftText={platformMeta.topBarLeft} contact={platformMeta.contact} email={platformMeta.email} />
      <PublicHeader
        logo={platformMeta.logo}
        brand={platformMeta.brand}
        tagline={platformMeta.tagline}
        links={navLinks}
      />
      <HeroSection hero={hero} slides={slides}>
        <TrustStatsSection items={highlights} />
      </HeroSection>
      <div className="bg-stone-50 md:hidden">
        <TrustStatsSection
          items={highlights}
          containerClassName="m-0 max-w-none px-0"
          panelClassName="w-full rounded-none border-x-0 p-0"
        />
      </div>
      <div className="hidden h-24 md:block" />
      <WhyChooseSection items={reasons} />
      <AboutSection founder={aboutFounder} />
      <PlatformVideoSection videos={platformVideos} />
      <FeaturedToursSection tours={featuredTours} />
      <ToursCatalogSection tours={allTours} />
      <GalleryPreviewSection items={galleryPreview} />
      <PaymentMethodsSection methods={paymentMethods} />
      <CustomTripCtaSection trips={customTrips} />
      <TestimonialsSection testimonials={testimonials} showMoreHref="/avis" />
      <FaqSection items={faqItems} />
      <ContactSection platform={platformMeta} />
      <LocationMapSection location={officeLocation} />
      <PublicFooter footerLinks={footerLinks} logo={platformMeta.logo} brand={platformMeta.brand} />
      <ScrollToTopButton />
    </div>
  );
}
