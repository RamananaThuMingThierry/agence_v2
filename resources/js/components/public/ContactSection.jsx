import React, { useState } from "react";
import { createPublicContactForm } from "../../api/contactForms";

const initialForm = {
  name: "",
  subject: "",
  email: "",
  message: "",
};

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.7V11H8v3h2.3v7h3.2Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1.3 4.8 4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm5.7 13.8c-.2.6-1.3 1.1-1.9 1.2-.5.1-1.1.2-3.6-.8-3.2-1.4-5.3-4.8-5.5-5.1-.2-.3-1.3-1.7-1.3-3.2 0-1.6.8-2.4 1.1-2.8.3-.3.7-.4.9-.4h.7c.2 0 .5 0 .7.6.2.5.8 1.9.9 2 .1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.4 2 2.2 1.3 1.1 2.4 1.5 2.8 1.7.3.1.5.1.7-.1l.8-1c.2-.3.5-.3.8-.2.3.1 1.8.9 2.1 1 .3.2.5.2.6.4.1.1.1.8-.1 1.4Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export default function ContactSection({ platform = {} }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const address = platform.address || "Antananarivo, Madagascar";
  const contact = platform.contact || "+261 38 09 137 03";
  const email = platform.email || "worldofmadagascartour@gmail.com";
  const whatsappHref = platform.whatsapp || `https://wa.me/${contact.replace(/[^\d]/g, "")}`;
  const facebookHref = platform.facebook || "https://www.facebook.com/profile.php?id=100084179285857";
  const instagramHref = platform.instagram || "https://www.instagram.com/world_of_madagascar?igsh=MTRuNXR4bm9sNThkag%3D%3D";
  const contactMethods = [
    {
      label: "Facebook",
      value: "World of Madagascar",
      href: facebookHref,
      icon: <FacebookIcon />,
      tone: "bg-[#1877F2] text-white",
    },
    {
      label: "Instagram",
      value: "@world_of_madagascar",
      href: instagramHref,
      icon: <InstagramIcon />,
      tone: "bg-[#E4405F] text-white",
    },
    {
      label: "WhatsApp",
      value: contact,
      href: whatsappHref,
      icon: <WhatsAppIcon />,
      tone: "bg-[#25D366] text-white",
    },
    {
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      icon: <MailIcon />,
      tone: "bg-slate-900 text-white",
    },
  ];

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await createPublicContactForm(form);

      if (result?.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      }

      const messageParts = [result?.message || "Votre demande a ete envoyee."];

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

      setErrorMessage(apiMessage || "Impossible d'envoyer la demande pour le moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="bg-white py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-700">Contact</p>
          <h2 className="mb-5 text-3xl font-extrabold text-slate-900 md:text-4xl">Planifiez votre voyage a Madagascar</h2>
          <p className="mb-6 leading-relaxed text-slate-600">Parlez-nous de votre projet de voyage. Vous pouvez aussi nous contacter directement sur nos reseaux et canaux officiels.</p>
          <div className="mb-6 rounded-3xl bg-stone-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Adresse</p>
            <p className="mt-2 text-slate-700">{address}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {contactMethods.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="group flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}>
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{item.label}</span>
                  <span className="block truncate text-sm font-semibold text-slate-900">{item.value}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-stone-50 p-6 shadow-sm">
          {successMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{successMessage}</div> : null}
          {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errorMessage}</div> : null}

          <div>
            <label className="mb-2 block text-sm font-bold">Nom complet</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Votre nom" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            {fieldErrors.name ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.name}</span> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Sujet</label>
            <input name="subject" type="text" value={form.subject} onChange={handleChange} placeholder="Ex: Voyage sur mesure, devis, information" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            {fieldErrors.subject ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.subject}</span> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Email ou WhatsApp</label>
            <input name="email" type="text" value={form.email} onChange={handleChange} placeholder="Votre email ou votre numero" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            {fieldErrors.email ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.email}</span> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows="5" placeholder="Expliquez votre demande, vos dates, votre budget, le nombre de personnes..." className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            {fieldErrors.message ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.message}</span> : null}
          </div>

          <button type="submit" disabled={submitting} className="w-full rounded-full bg-emerald-700 py-4 font-bold text-white shadow-lg transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? "Envoi en cours..." : "Envoyer ma demande"}
          </button>
        </form>
      </div>
    </section>
  );
}
