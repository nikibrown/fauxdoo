/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    SESSIONS: KVNamespace;
    FLAGS: KVNamespace;
    MEDIA: R2Bucket;
  }
}

export {};
