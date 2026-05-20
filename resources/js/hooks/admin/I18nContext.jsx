import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import deAdmin from "../../../lang/de/admin.json";
import dePublic from "../../../lang/de/public.json";
import enAdmin from "../../../lang/en/admin.json";
import enPublic from "../../../lang/en/public.json";
import esAdmin from "../../../lang/es/admin.json";
import esPublic from "../../../lang/es/public.json";
import frAdmin from "../../../lang/fr/admin.json";
import frPublic from "../../../lang/fr/public.json";
import itAdmin from "../../../lang/it/admin.json";
import itPublic from "../../../lang/it/public.json";
import mgAdmin from "../../../lang/mg/admin.json";
import mgPublic from "../../../lang/mg/public.json";
import ruAdmin from "../../../lang/ru/admin.json";
import ruPublic from "../../../lang/ru/public.json";
import zhAdmin from "../../../lang/zh/admin.json";
import zhPublic from "../../../lang/zh/public.json";

const I18nContext = createContext(null);
const STORAGE_KEY = "public_lang";
const DEFAULT_LANG = "en";
const FALLBACK_MESSAGES = { public: enPublic, admin: enAdmin };
const MESSAGES = {
  fr: { public: frPublic, admin: frAdmin },
  en: { public: enPublic, admin: enAdmin },
  es: { public: esPublic, admin: esAdmin },
  de: { public: dePublic, admin: deAdmin },
  it: { public: itPublic, admin: itAdmin },
  mg: { public: mgPublic, admin: mgAdmin },
  ru: { public: ruPublic, admin: ruAdmin },
  zh: { public: zhPublic, admin: zhAdmin },
};

function getNestedValue(object, key) {
  return String(key)
    .split(".")
    .reduce((current, segment) => (current && current[segment] !== undefined ? current[segment] : undefined), object);
}

function interpolate(message, replacements = {}) {
  return Object.entries(replacements).reduce(
    (result, [name, value]) => result.replaceAll(`:${name}`, String(value)),
    message,
  );
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_LANG;
    }

    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    axios.defaults.headers.common["Accept-Language"] = lang;
  }, [lang]);

  const value = useMemo(
    () => {
      const messages = MESSAGES[lang] || FALLBACK_MESSAGES;

      return {
        lang,
        setLang,
        t: (key, replacements = {}) => {
          const normalizedKey = String(key);
          const publicScopedKey = normalizedKey.startsWith("public.") ? normalizedKey : `public.${normalizedKey}`;
          const adminScopedKey = normalizedKey.startsWith("admin.") ? normalizedKey : `admin.${normalizedKey}`;
          const message =
            getNestedValue(messages, normalizedKey) ??
            getNestedValue(messages, publicScopedKey) ??
            getNestedValue(messages, adminScopedKey) ??
            getNestedValue(FALLBACK_MESSAGES, normalizedKey) ??
            getNestedValue(FALLBACK_MESSAGES, publicScopedKey) ??
            getNestedValue(FALLBACK_MESSAGES, adminScopedKey) ??
            normalizedKey;

          return typeof message === "string" ? interpolate(message, replacements) : message;
        },
      };
    },
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
}
