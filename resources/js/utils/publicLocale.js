export const PUBLIC_LOCALE_MAP = {
  de: "de-DE",
  en: "en-GB",
  es: "es-ES",
  fr: "fr-FR",
  it: "it-IT",
  mg: "mg-MG",
  ru: "ru-RU",
  zh: "zh-CN",
};

export function getPublicLocale(lang) {
  return PUBLIC_LOCALE_MAP[lang] || PUBLIC_LOCALE_MAP.en;
}
