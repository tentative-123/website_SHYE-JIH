import siteContent from "../content/site-content.json";

export const SUPPORTED_LANGS = ["zh", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export type DualText = {
  zh: string;
  en: string;
};

export type SiteImage = {
  url: string;
  alt: DualText;
  caption?: DualText;
};

export function resolveLang(input: string | undefined): Lang {
  return input === "en" ? "en" : "zh";
}

export function t(value: DualText, lang: Lang): string {
  if (!value) {
    return "";
  }

  if (lang === "en") {
    return value.en || value.zh || "";
  }

  return value.zh || value.en || "";
}

export function localizedHref(lang: Lang, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/") {
    return `/${lang}/`;
  }

  const pathWithoutLang = cleanPath.replace(/^\/(zh|en)\b/, "");
  return `/${lang}${pathWithoutLang}`;
}

export const content = siteContent as any;
