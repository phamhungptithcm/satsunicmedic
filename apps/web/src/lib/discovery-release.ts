/** Curated educational delivery only; never changes clinical publication status. */
export function isDiscoveryEnabled(environment: string | undefined, flag?: string) {
  return environment === "development" || (environment === "production" && flag === "true");
}
