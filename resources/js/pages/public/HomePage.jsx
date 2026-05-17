import React, { useEffect, useState } from "react";
import ContactSection from "../../components/public/ContactSection";
import CustomTripCtaSection from "../../components/public/CustomTripCtaSection";
import FeaturedToursSection from "../../components/public/FeaturedToursSection";
import GalleryPageSection from "../../components/public/GalleryPageSection";
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
import { fetchPublishedTestimonials } from "../../api/testimonials";
import {
  allTours,
  contactLinks,
  customTrips,
  fallbackTestimonials,
  featuredTours,
  footerLinks,
  galleryFilters,
  galleryFull,
  galleryPreview,
  hero,
  highlights,
  navLinks,
  paymentMethods,
  photoRelated,
  reasons,
  siteMeta,
} from "../../data/publicHomeData";

export default function HomePage() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);

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

  return (
    <div className="bg-stone-50 text-slate-800">
      <TopBar leftText={siteMeta.topBarLeft} rightText={siteMeta.topBarRight} />
      <PublicHeader
        logo={siteMeta.logo}
        brand={siteMeta.brand}
        tagline={siteMeta.tagline}
        links={navLinks}
      />
      <HeroSection hero={hero} />
      <TrustStatsSection items={highlights} />
      <WhyChooseSection items={reasons} />
      <FeaturedToursSection tours={featuredTours} />
      <ToursCatalogSection tours={allTours} />
      <GalleryPreviewSection items={galleryPreview} />
      <TourDetailPreviewSection paymentMethods={paymentMethods} />
      <GalleryPageSection filters={galleryFilters} items={galleryFull} />
      <PhotoDetailSection relatedPhotos={photoRelated} />
      <PaymentMethodsSection methods={paymentMethods} />
      <CustomTripCtaSection trips={customTrips} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection />
      <PublicFooter footerLinks={footerLinks} contactLinks={contactLinks} />
      <WhatsAppButton />
    </div>
  );
}
