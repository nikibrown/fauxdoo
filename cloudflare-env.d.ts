/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    SESSIONS: KVNamespace;
    FLAGS: KVNamespace;
    MEDIA: R2Bucket;
    /** Bearer token for /api/admin/*. Secret: set in Webflow Cloud and in local .dev.vars. */
    ADMIN_TOKEN?: string;
  }
}

export {};
