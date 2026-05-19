import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteContactForm, fetchContactForms } from "../../../api/contactForms";
import { useI18n } from "../../../hooks/admin/I18nContext";

function EmptyState({ title, description }) {
  return (
    <div className="rounded-sm border border-dashed border-stone-300 bg-white/80 px-6 py-14 text-center shadow-sm">
      <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmText, cancelText, loading, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button type="button" className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60" onClick={onConfirm} disabled={loading}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function getLocale(lang) {
  const locales = {
    fr: "fr-FR",
    en: "en-US",
    es: "es-ES",
    de: "de-DE",
  };

  return locales[lang] || locales.fr;
}

function formatDate(value, lang) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(getLocale(lang));
}

export default function ContactFormsPage() {
  const { lang, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [contactForms, setContactForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [confirmState, setConfirmState] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadContactForms();
  }, []);

  useEffect(() => {
    if (!location.state?.notice) return;
    setNotice(location.state.notice);
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  async function loadContactForms() {
    setLoading(true);
    setError("");

    try {
      const items = await fetchContactForms();
      setContactForms(Array.isArray(items) ? items : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("contact_forms.list.load_error"));
      setContactForms([]);
    } finally {
      setLoading(false);
    }
  }

  function openConfirm(contactForm) {
    setConfirmState(contactForm);
  }

  async function handleDelete() {
    if (!confirmState) return;

    setActionLoading(true);
    setError("");

    try {
      await deleteContactForm(confirmState.encrypted_id);
      setConfirmState(null);
      setNotice(t("contact_forms.list.delete_success"));
      await loadContactForms();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("contact_forms.list.delete_error"));
    } finally {
      setActionLoading(false);
    }
  }

  const filteredContactForms = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contactForms;

    return contactForms.filter((contactForm) =>
      [contactForm.name, contactForm.email, contactForm.subject, contactForm.message]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [contactForms, search]);

  return (
    <div className="space-y-2">
      <section className="overflow-hidden rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">{t("contact_forms.list.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("contact_forms.list.description")}</p>
          </div>
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("contact_forms.list.stats.total")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{contactForms.length}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("contact_forms.list.stats.with_subject")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{contactForms.filter((item) => Boolean(item.subject)).length}</p>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div />
            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("contact_forms.list.search_placeholder")} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition sm:w-80" />
              <button type="button" onClick={loadContactForms} className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800">
                {t("contact_forms.common.refresh")}
              </button>
            </div>
          </div>

          {notice ? <div className="mt-5 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</div> : null}
          {error ? <div className="mt-5 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

          <div className="mt-3">
            {loading ? (
              <EmptyState title={t("contact_forms.list.loading_title")} description={t("contact_forms.list.loading_description")} />
            ) : filteredContactForms.length === 0 ? (
              <EmptyState title={t("contact_forms.list.empty_title")} description={t("contact_forms.list.empty_description")} />
            ) : (
              <div className="overflow-hidden rounded-sm border border-stone-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50 text-left">
                      <tr>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("contact_forms.list.table.name_email")}</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("contact_forms.list.table.subject")}</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("contact_forms.list.table.message")}</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("contact_forms.list.table.created_at")}</th>
                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("contact_forms.list.table.actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {filteredContactForms.map((contactForm) => (
                        <tr key={contactForm.encrypted_id || contactForm.id} className="align-top">
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-extrabold text-slate-950">{contactForm.name}</p>
                              <p className="mt-1 text-sm text-slate-500">{contactForm.email}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-700">{contactForm.subject || "-"}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            <p className="max-w-xl line-clamp-3">{contactForm.message}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">{formatDate(contactForm.created_at, lang)}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap justify-end gap-2">
                              <Link to={`/admin/contact-forms/${contactForm.encrypted_id}`} className="rounded-sm border px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-black hover:text-white">
                                {t("contact_forms.common.details")}
                              </Link>
                              <button type="button" onClick={() => openConfirm(contactForm)} className="rounded-sm border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-red-600 hover:text-white">
                                {t("contact_forms.common.delete")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ConfirmModal
        open={Boolean(confirmState)}
        title={t("contact_forms.list.delete_modal.title")}
        message={t("contact_forms.list.delete_modal.message", { name: confirmState?.name || "" })}
        confirmText={actionLoading ? t("contact_forms.list.delete_modal.loading") : t("contact_forms.list.delete_modal.confirm")}
        cancelText={t("contact_forms.common.cancel")}
        loading={actionLoading}
        onCancel={() => (actionLoading ? undefined : setConfirmState(null))}
        onConfirm={handleDelete}
      />
    </div>
  );
}
