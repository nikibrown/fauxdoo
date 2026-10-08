/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    /** Bearer token for /api/admin/*. Secret: set in Webflow Cloud and in local .dev.vars. */
    ADMIN_TOKEN?: string;
  }
}

export {};
