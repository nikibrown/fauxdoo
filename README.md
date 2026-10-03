# Fauxdoo

A **Next.js** starter for [**Webflow Cloud**](https://webflow.com/cloud) with Cloudflare bindings (D1, R2, KV) wired in.

At deploy time, Webflow Cloud provisions the configured services and injects them into your app as typed bindings — no API keys, no connection strings.

> Looking for the plain vanilla variant (no bindings)?
> See [`hello-world-next-app`](https://github.com/Webflow-Examples/hello-world-next-app).

[![Deploy to Webflow](https://webflow.com/img/deploy-dark.svg)](https://webflow.com/dashboard/cloud/deploy?repo=https://github.com/Webflow-Examples/hello-world-next-app-bindings)

> **Sentry / observability example:** the
> [`feat/sentry-integration-example`](https://github.com/Webflow-Examples/hello-world-next-app-bindings/tree/feat/sentry-integration-example)
> branch adds a working Sentry setup — browser + server logs on every request,
> error capture, and a recurring ping endpoint — validated on the Cloudflare
> Workers runtime Webflow Cloud uses. See its README for setup.

## What's included

- Next.js 16 (App Router) + React 19
- `@opennextjs/cloudflare` for deploying Next.js to Cloudflare Workers via Webflow Cloud
- `wrangler.json` with **D1** (SQL), **R2** (object storage), **KV · Sessions**, and **KV · Flags** declared
- `/api/binding-status` — a live health check that pings every binding
- Branded landing page that renders real-time binding status

## Quickstart

```bash
npm install

# Run locally (no bindings)
npm run dev

# Run locally against real bindings (via wrangler)
npm run dev:cf
```

## Deploy to Webflow Cloud

1. Fork this repo.
2. In your Webflow site, open **Apps → Webflow Cloud → Create new app** and select this repo.
3. Webflow Cloud reads `wrangler.json` and provisions D1, R2, and KV automatically.
4. Pick a mount path (e.g. `/app`) and click **Deploy**.

Full walkthrough: <https://developers.webflow.com/webflow-cloud/quickstart>.

## Bindings map

| Binding        | Type | Where it's declared       | Learn more                                                                |
| -------------- | ---- | ------------------------- | ------------------------------------------------------------------------- |
| `DB`           | D1   | `wrangler.json`           | [D1 docs](https://developers.webflow.com/webflow-cloud/storing-data/sqlite)       |
| `MEDIA`        | R2   | `wrangler.json`           | [R2 docs](https://developers.webflow.com/webflow-cloud/storing-data/object-storage)       |
| `SESSIONS`     | KV   | `wrangler.json`           | [KV docs](https://developers.webflow.com/webflow-cloud/storing-data/key-value-store)       |
| `FLAGS`        | KV   | `wrangler.json`           | [Flags docs](https://developers.webflow.com/webflow-cloud/storing-data/key-value-store) |

Access them from any route handler via `getCloudflareContext()`:

```ts
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  const { env } = await getCloudflareContext();
  const rows = await env.DB.prepare("SELECT 1").first();
  return Response.json({ rows });
}
```

See `src/app/api/binding-status/route.ts` for a full working example that pings all four bindings.

## Customizing

The landing page lives in `src/app/page.tsx`. The binding status component is
`src/app/components/BindingsStatus.tsx`. Styles are in `src/app/globals.css`
under the `wf-*` prefix.

## Learn more

- [Webflow Cloud docs](https://developers.webflow.com/webflow-cloud)
- [Bindings guide](https://developers.webflow.com/webflow-cloud/storing-data/overview)
- [Next.js on Webflow Cloud](https://developers.webflow.com/webflow-cloud/frameworks/next-js)

---

Built with Next.js · Deployed on Webflow Cloud.

## Branch naming convention

This repo is the canonical `hello-world-<framework>-app` example. Every framework
version and variant lives on a branch here, not in a separate repo:

| Branch | Contents |
| --- | --- |
| `main` | Current default example. Advances to the latest framework version once dependent pipelines are updated. |
| `vN` | Framework major version N, no storage bindings (for example `v6`). |
| `vN-with-bindings` | Version N plus D1, R2, and KV bindings and a `/api/binding-status` health check. |
| `sentry` | Latest version with bindings, plus a working Sentry setup. |

### Adding a new framework version

When a new major version M ships:

1. Create `vM` from the new plain app and `vM-with-bindings` from its bindings variant.
2. Point `sentry` at the latest version with bindings.
3. Leave `main` until the pipelines that consume this repo (webflow-cli,
   infrastructure/cosmic-builder, cosmic-test) are updated, then advance `main` to `vM`.
4. Keep older `vN` / `vN-with-bindings` branches so pinned references keep working.

Version branches (`vN`, `vN-with-bindings`, `sentry`) are protected: they can't be
deleted or force-pushed.
