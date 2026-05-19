export function formatUsd(value, locale = "fr-FR") {
  return `${Number(value || 0).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USD`;
}
