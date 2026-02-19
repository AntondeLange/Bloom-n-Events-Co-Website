/**
 * URL path normalization helpers for canonical URLs and route matching.
 */

export function normalizePathname(rawPath: string): string {
  const value = `${rawPath ?? ""}`.trim();
  const pathOnly = (value.split("#", 1)[0] || "/").split("?", 1)[0] || "/";
  let normalized = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;

  normalized = normalized.replace(/\/{2,}/g, "/");
  if (normalized.length > 1) {
    normalized = normalized.replace(/\/+$/, "");
  }

  if (normalized === "/index" || normalized === "/index.html") {
    return "/";
  }

  if (/\/index(?:\.html)?$/i.test(normalized)) {
    normalized = normalized.replace(/\/index(?:\.html)?$/i, "") || "/";
  } else if (/\.html$/i.test(normalized)) {
    normalized = normalized.replace(/\.html$/i, "") || "/";
  }

  if (normalized.length > 1) {
    normalized = normalized.replace(/\/+$/, "");
  }

  return normalized || "/";
}

export function isHomePath(rawPath: string): boolean {
  return normalizePathname(rawPath) === "/";
}
