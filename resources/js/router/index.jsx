import React from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import AdminLayout from "../layouts/AdminLayout";
import PublicLayout from "../layouts/PublicLayout";
import ActivityLogsPage from "../pages/admin/activity-logs/ActivityLogsPage";
import BookingDetailsPage from "../pages/admin/bookings/BookingDetailsPage";
import BookingsPage from "../pages/admin/bookings/BookingsPage";
import ContactFormDetailsPage from "../pages/admin/contact-forms/ContactFormDetailsPage";
import ContactFormsPage from "../pages/admin/contact-forms/ContactFormsPage";
import DashboardPage from "../pages/admin/DashboardPage";
import GalleriesPage from "../pages/admin/gallery/GalleriesPage";
import GalleryDetailsPage from "../pages/admin/gallery/GalleryDetailsPage";
import FormGalleryPage from "../pages/admin/gallery/FormGalleryPage";
import SettingsPage from "../pages/admin/settings/SettingsPage";
import SlidesPage from "../pages/admin/slides/SlidesPage";
import FormTestimonialPage from "../pages/admin/testimonials/FormTestimonialPage";
import TestimonialsPage from "../pages/admin/testimonials/TestimonialsPage";
import FormSlidePage from "../pages/admin/slides/FormSlidePage";
import TourDetailsPage from "../pages/admin/tours/TourDetailsPage";
import FormTourPage from "../pages/admin/tours/FormTourPage";
import ToursPage from "../pages/admin/tours/ToursPage";
import UsersPage from "../pages/admin/users/UsersPage";
import FormUserPage from "../pages/admin/users/FormUserPage";
import UserDetailsPage from "../pages/admin/users/UserDetailsPage";
import LoginPage from "../pages/auth/LoginPage";
import NotFoundPage from "../pages/errors/NotFoundPage";
import ErrorPage from "../pages/errors/ErrorPage";
import HomePage from "../pages/public/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
        ],
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "bookings",
            element: <BookingsPage />,
          },
          {
            path: "bookings/:bookingId",
            element: <BookingDetailsPage />,
          },
          {
            path: "contact-forms",
            element: <ContactFormsPage />,
          },
          {
            path: "contact-forms/:contactFormId",
            element: <ContactFormDetailsPage />,
          },
          {
            path: "slides",
            element: <SlidesPage />,
          },
          {
            path: "slides/create",
            element: <FormSlidePage />,
          },
          {
            path: "slides/:slideId/edit",
            element: <FormSlidePage />,
          },
          {
            path: "testimonials",
            element: <TestimonialsPage />,
          },
          {
            path: "testimonials/create",
            element: <FormTestimonialPage />,
          },
          {
            path: "testimonials/:testimonialId/edit",
            element: <FormTestimonialPage />,
          },
          {
            path: "tours",
            element: <ToursPage />,
          },
          {
            path: "tours/create",
            element: <FormTourPage />,
          },
          {
            path: "tours/:tourId",
            element: <TourDetailsPage />,
          },
          {
            path: "tours/:tourId/edit",
            element: <FormTourPage />,
          },
          {
            path: "galleries",
            element: <GalleriesPage />,
          },
          {
            path: "galleries/create",
            element: <FormGalleryPage />,
          },
          {
            path: "galleries/:galleryId",
            element: <GalleryDetailsPage />,
          },
          {
            path: "galleries/:galleryId/edit",
            element: <FormGalleryPage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "users/create",
            element: <FormUserPage />,
          },
          {
            path: "users/:userId",
            element: <UserDetailsPage />,
          },
          {
            path: "users/:userId/edit",
            element: <FormUserPage />,
          },
          {
            path: "activity-logs",
            element: <ActivityLogsPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
