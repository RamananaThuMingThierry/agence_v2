const VALIDATION_MESSAGES = {
  fr: {
    required: "Le champ :field est obligatoire.",
    email: "Le champ :field doit être une adresse email valide.",
    integer: "Le champ :field doit être un nombre entier.",
    numeric: "Le champ :field doit être un nombre.",
    string: "Le champ :field doit être un texte.",
    date: "Le champ :field doit être une date valide.",
    image: "Le champ :field doit être une image valide.",
    min: "Le champ :field doit être au minimum de :value.",
    max: "Le champ :field ne peut pas dépasser :value.",
    after_or_equal: "Le champ :field doit être postérieur ou égal à :other.",
  },
  en: {
    required: "The :field field is required.",
    email: "The :field field must be a valid email address.",
    integer: "The :field field must be an integer.",
    numeric: "The :field field must be a number.",
    string: "The :field field must be a string.",
    date: "The :field field must be a valid date.",
    image: "The :field field must be a valid image.",
    min: "The :field field must be at least :value.",
    max: "The :field field may not be greater than :value.",
    after_or_equal: "The :field field must be a date after or equal to :other.",
  },
  es: {
    required: "El campo :field es obligatorio.",
    email: "El campo :field debe ser una dirección de correo válida.",
    integer: "El campo :field debe ser un número entero.",
    numeric: "El campo :field debe ser un número.",
    string: "El campo :field debe ser un texto.",
    date: "El campo :field debe ser una fecha válida.",
    image: "El campo :field debe ser una imagen válida.",
    min: "El campo :field debe ser al menos :value.",
    max: "El campo :field no debe ser mayor que :value.",
    after_or_equal: "El campo :field debe ser una fecha posterior o igual a :other.",
  },
  de: {
    required: "Das Feld :field ist erforderlich.",
    email: "Das Feld :field muss eine gültige E-Mail-Adresse sein.",
    integer: "Das Feld :field muss eine ganze Zahl sein.",
    numeric: "Das Feld :field muss eine Zahl sein.",
    string: "Das Feld :field muss ein Text sein.",
    date: "Das Feld :field muss ein gültiges Datum sein.",
    image: "Das Feld :field muss ein gültiges Bild sein.",
    min: "Das Feld :field muss mindestens :value sein.",
    max: "Das Feld :field darf nicht größer als :value sein.",
    after_or_equal: "Das Feld :field muss ein Datum nach oder gleich :other sein.",
  },
};

function interpolate(template, replacements) {
  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replaceAll(`:${key}`, String(value)),
    template,
  );
}

function detectRule(message = "") {
  const value = String(message).toLowerCase();

  if (value.includes("required")) return { rule: "required" };
  if (value.includes("valid email")) return { rule: "email" };
  if (value.includes("must be an integer")) return { rule: "integer" };
  if (value.includes("must be a number")) return { rule: "numeric" };
  if (value.includes("must be a string")) return { rule: "string" };
  if (value.includes("must be a valid date")) return { rule: "date" };
  if (value.includes("must be an image") || value.includes("must be a valid image")) return { rule: "image" };

  const minMatch = value.match(/at least (\d+)/);
  if (minMatch) return { rule: "min", value: minMatch[1] };

  const maxMatch = value.match(/greater than (\d+)/);
  if (maxMatch) return { rule: "max", value: maxMatch[1] };

  const afterMatch = value.match(/after or equal to ([a-z0-9_.-]+)/);
  if (afterMatch) return { rule: "after_or_equal", other: afterMatch[1] };

  return null;
}

export function localizePublicValidationErrors({ lang = "fr", errors = {}, fieldLabels = {} }) {
  const templates = VALIDATION_MESSAGES[lang] || VALIDATION_MESSAGES.fr;

  return Object.fromEntries(
    Object.entries(errors).map(([field, message]) => {
      const detected = detectRule(message);
      const fieldLabel = fieldLabels[field] || field;

      if (!detected || !templates[detected.rule]) {
        return [field, message];
      }

      const otherLabel = fieldLabels[detected.other] || detected.other || "";

      return [
        field,
        interpolate(templates[detected.rule], {
          field: fieldLabel,
          value: detected.value || "",
          other: otherLabel,
        }),
      ];
    }),
  );
}
