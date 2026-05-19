import React, { useState } from "react";
import { createPublicContactForm } from "../../api/contactForms";
import { useI18n } from "../../hooks/admin/I18nContext";
import { localizePublicValidationErrors } from "../../utils/publicValidation";

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
  const { t, lang } = useI18n();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const address = platform.address || t("public.footer.location_city");
  const contact = platform.contact || "+261 38 09 137 03";
  const email = platform.email || "worldofmadagascartour@gmail.com";
  const whatsappHref = platform.whatsapp || `https://wa.me/${contact.replace(/[^\d]/g, "")}`;
  const facebookHref = platform.facebook || "https://www.facebook.com/profile.php?id=100084179285857";
  const instagramHref = platform.instagram || "https://www.instagram.com/world_of_madagascar?igsh=MTRuNXR4bm9sNThkag%3D%3D";
  const contactMethods = [
    { label: t("public.common.facebook"), value: platform.brand || "World of Madagascar", href: facebookHref, icon: <FacebookIcon />, tone: "bg-[#1877F2] text-white" },
    { label: t("public.common.instagram"), value: "@world_of_madagascar", href: instagramHref, icon: <InstagramIcon />, tone: "bg-[linear-gradient(135deg,#F58529,#DD2A7B,#8134AF,#515BD4)] text-white" },
    { label: t("public.common.whatsapp"), value: contact, href: whatsappHref, icon: <WhatsAppIcon />, tone: "bg-[#25D366] text-white" },
    { label: t("public.common.email"), value: email, href: `mailto:${email}`, icon: <MailIcon />, tone: "bg-[#EA4335] text-white" },
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

      const messageParts = [result?.message || t("public.home.contact.form.success")];

      if (result?.notifications?.email_sent) {
        messageParts.push(t("public.home.contact.form.email_sent"));
      }

      if (result?.notifications?.whatsapp_ready) {
        messageParts.push(t("public.home.contact.form.whatsapp_opened"));
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
              name: t("public.home.contact.form.fields.name"),
              subject: t("public.home.contact.form.fields.subject"),
              email: t("public.home.contact.form.fields.email"),
              message: t("public.home.contact.form.fields.message"),
            },
          }),
        );
      }

      setErrorMessage(apiMessage || t("public.home.contact.form.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
        <div>
          <p className="public-eyebrow mb-3 text-sm font-bold uppercase">{t("public.home.contact.eyebrow")}</p>
          <h2 className="public-heading mb-5 text-3xl font-extrabold md:text-4xl">{t("public.home.contact.title")}</h2>
          <p className="public-copy mb-6 leading-relaxed">{t("public.home.contact.text")}</p>
          <div className="public-soft-panel mb-6 rounded-3xl p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{t("public.home.contact.address")}</p>
            <p className="mt-2 text-[color:var(--ink-soft)]">{address}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {contactMethods.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="public-panel group flex items-center gap-4 rounded-3xl p-4 text-[color:var(--ink-soft)] transition hover:-translate-y-0.5 hover:border-[rgba(143,51,32,0.24)] hover:shadow-[0_18px_42px_rgba(89,44,30,0.14)]"
              >
                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}>
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">{item.label}</span>
                  <span className="block truncate text-sm font-semibold text-[color:var(--accent-deep)]">{item.value}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="public-panel-strong space-y-4 rounded-3xl p-6">
          {successMessage ? <div className="rounded-2xl border border-[rgba(45,107,86,0.2)] bg-[rgba(221,235,229,0.9)] px-4 py-3 text-sm font-semibold text-[color:var(--success)]">{successMessage}</div> : null}
          {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errorMessage}</div> : null}

          <div>
            <label className="mb-2 block text-sm font-bold">{t("public.home.contact.form.fields.name")}</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} placeholder={t("public.home.contact.form.fields.name_placeholder")} className="public-input w-full rounded-2xl px-4 py-3" />
            {fieldErrors.name ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.name}</span> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">{t("public.home.contact.form.fields.subject")}</label>
            <input name="subject" type="text" value={form.subject} onChange={handleChange} placeholder={t("public.home.contact.form.fields.subject_placeholder")} className="public-input w-full rounded-2xl px-4 py-3" />
            {fieldErrors.subject ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.subject}</span> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">{t("public.home.contact.form.fields.email")}</label>
            <input name="email" type="text" value={form.email} onChange={handleChange} placeholder={t("public.home.contact.form.fields.email_placeholder")} className="public-input w-full rounded-2xl px-4 py-3" />
            {fieldErrors.email ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.email}</span> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">{t("public.home.contact.form.fields.message")}</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows="5" placeholder={t("public.home.contact.form.fields.message_placeholder")} className="public-input w-full rounded-2xl px-4 py-3" />
            {fieldErrors.message ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.message}</span> : null}
          </div>

          <button type="submit" disabled={submitting} className="public-btn-primary w-full rounded-full py-4 font-bold transition disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? t("public.home.contact.form.submitting") : t("public.home.contact.form.submit")}
          </button>
        </form>
      </div>
    </section>
  );
}
