/**
 * Prefixes a path with the app's Webflow Cloud mount path.
 *
 * Next.js `basePath` only auto-prefixes <Link>, next/image, and the router,
 * not fetch() or plain <img>. Use this for every API call and public asset.
 *
 * Sources, in order:
 * 1. NEXT_PUBLIC_BASE_PATH, the variable Webflow's docs say to set to the
 *    mount path (inlined at build time via next.config.ts).
 * 2. __NEXT_ROUTER_BASEPATH, which Next.js inlines from its own `basePath`
 *    config. Webflow Cloud's builder sets that from the mount path, so this
 *    keeps working even if (1) is missing or stale. It's a Next.js internal,
 *    hence only a fallback.
 * Both are "" locally, where the app runs at /.
 */
const BASE_PATH = (
  process.env.NEXT_PUBLIC_BASE_PATH ||
  process.env.__NEXT_ROUTER_BASEPATH ||
  ""
).replace(/\/+$/, "");

export function withBasePath(path: string): string {
  return `${BASE_PATH}/${path.replace(/^\/+/, "")}`;
}
