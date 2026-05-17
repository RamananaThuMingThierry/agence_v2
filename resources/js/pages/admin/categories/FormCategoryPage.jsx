import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createCategory, fetchCategory, updateCategory } from "../../../api/categories";

const initialForm = {
  name: "",
  description: "",
  is_active: true,
};

export default function FormCategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(categoryId);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategory() {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const category = await fetchCategory(categoryId);

        if (!active) return;

        setForm({
          name: category?.name || "",
          description: category?.description || "",
          is_active: category?.is_active ?? true,
        });
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || "Impossible de charger la categorie.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCategory();

    return () => {
      active = false;
    };
  }, [categoryId, isEditMode]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEditMode) {
        await updateCategory(categoryId, form);
      } else {
        await createCategory(form);
      }

      navigate("/admin/categories", {
        replace: true,
        state: {
          notice: isEditMode ? "Categorie mise a jour." : "Categorie creee.",
        },
      });
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || "Echec de l'enregistrement de la categorie.");
      } else {
        setError(requestError.response?.data?.message || "Echec de l'enregistrement de la categorie.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">Chargement de la categorie...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">{isEditMode ? "Modifier la categorie" : "Ajouter une categorie"}</h2>
            <p className="mt-2 text-sm text-slate-500">Configurez le nom, la description et le statut de la categorie.</p>
          </div>

          <Link to="/admin/categories" className="inline-flex items-center justify-center gap-2 self-start rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black">
            Retour a la liste
          </Link>
        </div>
      </section>

      {error ? <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-6">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Nom</span>
                <input type="text" name="name" required value={form.name} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder="Nom de la categorie" />
              </label>

              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Description</span>
                <textarea name="description" rows="6" value={form.description} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder="Description de la categorie" />
              </label>

              <label className="flex items-center gap-3 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500" />
                <div>
                  <span className="block text-sm font-bold text-slate-800">Active</span>
                  <span className="block text-xs text-slate-500">Affiche ou masque cette categorie.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link to="/admin/categories" className="inline-flex w-full items-center justify-center rounded-sm border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition sm:w-auto">Annuler</Link>
              <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center rounded-sm bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                {saving ? "Enregistrement..." : isEditMode ? "Mettre a jour" : "Enregistrer"}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
