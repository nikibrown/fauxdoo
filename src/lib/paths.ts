/**
 * Prefixes a path with the app's Webflow Cloud mount path.
 *
 * Next.js `basePath` only auto-prefixes <Link>, next/image, and the router,
 * not fetch() or plain <img>. Use this for every API call and public asset.
 * NEXT_PUBLIC_BASE_PATH is set from COSMIC_MOUNT_PATH in next.config.ts
 * ("" locally, e.g. "/calculator" when mounted).
 */
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

export function withBasePath(path: string): string {
  return `${BASE_PATH}/${path.replace(/^\/+/, "")}`;
}
