/**
 * Canonical site URL configuration.
 *
 * Canonical production URL: https://estimex-nine.vercel.app
 *
 * Can be overridden via NEXT_PUBLIC_SITE_URL environment variable.
 */

export const DEFAULT_SITE_URL = "https://estimex-nine.vercel.app";

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return DEFAULT_SITE_URL;
}
