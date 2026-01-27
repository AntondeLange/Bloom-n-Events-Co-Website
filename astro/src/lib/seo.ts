/**
 * SEO defaults and helpers.
 * Every page must provide title, description; OG/twitter derived from these.
 */

import { SITE } from "./constants";

export interface SeoProps {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noindex?: boolean;
}

const defaultOgImage = `${SITE.baseUrl}/images/logo-wht.png`;

export function getSeoProps(props: SeoProps): SeoProps {
  return {
    title: props.title,
    description: props.description,
    path: props.path ?? "/",
    ogImage: props.ogImage ?? defaultOgImage,
    noindex: props.noindex ?? false,
  };
}

export function canonicalUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.baseUrl}${p}`;
}

export function fullTitle(pageTitle: string): string {
  return `${pageTitle} | ${SITE.name}`;
}
