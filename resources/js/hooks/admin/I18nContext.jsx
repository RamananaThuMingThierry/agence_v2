import React, { createContext, useContext, useMemo, useState } from "react";

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("fr");

  const value = useMemo(
    () => ({
      lang,
      setLang,
    }),
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
