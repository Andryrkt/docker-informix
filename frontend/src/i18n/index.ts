import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

// List of namespaces (must match the files in public/locales/{{lng}}/)
export const namespaces = [
  "common",
  "header",
  "login",
  "breadcrumb",
  "vignette",
  "table",
  "filters",
  "messages",
  "ticket",
] as const;
export type Namespace = (typeof namespaces)[number];

i18n
  .use(HttpBackend) // Load translations via HTTP
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next)
  .init({
    fallbackLng: "fr",
    debug: process.env.NODE_ENV === "development",
    ns: namespaces,
    defaultNS: "common",
    interpolation: { escapeValue: false },
    backend: {
      // Path pattern for loading files
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator"],
      caches: ["localStorage", "cookie"],
    },
  });

export default i18n;
