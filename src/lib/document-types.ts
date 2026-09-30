export const DOCUMENT_TYPES = [
  "CEDULA_CIUDADANIA",
  "CEDULA_EXTRANJERIA",
  "NIT",
  "PASAPORTE",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CEDULA_CIUDADANIA: "Cédula de ciudadanía",
  CEDULA_EXTRANJERIA: "Cédula de extranjería",
  NIT: "NIT",
  PASAPORTE: "Pasaporte",
};
