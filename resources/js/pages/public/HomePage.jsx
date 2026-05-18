import React, { useEffect, useState } from "react";
import { fetchPublicGalleries } from "../../api/galleries";
import ContactSection from "../../components/public/ContactSection";
import CustomTripCtaSection from "../../components/public/CustomTripCtaSection";
import FeaturedToursSection from "../../components/public/FeaturedToursSection";
import GalleryPreviewSection from "../../components/public/GalleryPreviewSection";
import HeroSection from "../../components/public/HeroSection";
import PaymentMethodsSection from "../../components/public/PaymentMethodsSection";
import PhotoDetailSection from "../../components/public/PhotoDetailSection";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import TestimonialsSection from "../../components/public/TestimonialsSection";
import TopBar from "../../components/public/TopBar";
import TourDetailPreviewSection from "../../components/public/TourDetailPreviewSection";
import ToursCatalogSection from "../../components/public/ToursCatalogSection";
import TrustStatsSection from "../../components/public/TrustStatsSection";
import WhatsAppButton from "../../components/public/WhatsAppButton";
import WhyChooseSection from "../../components/public/WhyChooseSection";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { fetchPublicSlides } from "../../api/slides";
import { fetchPublishedTestimonials } from "../../api/testimonials";
import {
  allTours,
  contactLinks,
  customTrips,
  fallbackTestimonials,
  featuredTours,
  footerLinks,
  hero,
  highlights,
  navLinks,
  paymentMethods,
  photoRelated,
  reasons,
  siteMeta,
} from "../../data/publicHomeData";
import { mapGalleryToPublicItem } from "../../utils/publicGallery";

export default function HomePage() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [platformMeta, setPlatformMeta] = useState(siteMeta);
  const [slides, setSlides] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadTestimonials() {
      try {
        const items = await fetchPublishedTestimonials();

        if (!active || !Array.isArray(items) || items.length === 0) {
          return;
        }

        setTestimonials(items);
      } catch {
        if (active) {
          setTestimonials(fallbackTestimonials);
        }
      }
    }

    loadTestimonials();

    return () => {
      active = false;
    };
  }, []);

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

        setGalleryPreview(items.map(mapGalleryToPublicItem).slice(0, 4));
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
  }, []);

  return (
    <div className="bg-stone-50 text-slate-800">
      <TopBar leftText={platformMeta.topBarLeft} rightText={platformMeta.topBarRight} />
      <PublicHeader
        logo={platformMeta.logo}
        brand={platformMeta.brand}
        tagline={platformMeta.tagline}
        links={navLinks}
      />
      <HeroSection hero={hero} slides={slides} />
      <TrustStatsSection items={highlights} />
      <WhyChooseSection items={reasons} />
      <FeaturedToursSection tours={featuredTours} />
      <ToursCatalogSection tours={allTours} />
      <GalleryPreviewSection items={galleryPreview} />
      <TourDetailPreviewSection paymentMethods={paymentMethods} />
      <PaymentMethodsSection methods={paymentMethods} />
      <CustomTripCtaSection trips={customTrips} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection />
      <PublicFooter footerLinks={footerLinks} contactLinks={contactLinks} />
      <WhatsAppButton />
    </div>
  );
}
