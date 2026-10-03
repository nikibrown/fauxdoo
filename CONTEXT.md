# CONTEXT — Fauxdoo

Orientation for contributors to this **Next.js + bindings** Hello World example
for [Webflow Cloud](https://developers.webflow.com/webflow-cloud). Keep this
file current when structure or workflows change.

## What this is

A minimal, branded **Hello, world** page built with **Next.js 16 (App Router)**
and deployed on Cloudflare Workers via Webflow Cloud. This is the
**bindings** variant — it wires up all four Cloudflare bindings provisioned by
Webflow Cloud (D1, KV Sessions, KV Flags, R2) and renders live status cards.

The page shows:

- Webflow brand hero + gradient logo
- A curated set of Webflow Cloud doc cards
- A live **BindingsStatus** block pinging D1, KV, and R2 via
  `/api/binding-status`

## Stack

- Framework: **Next.js 16** (App Router, React 19)
- Cloudflare adapter: `@opennextjs/cloudflare`
- Styling: vanilla CSS + `wf-*` brand tokens (see `src/app/globals.css`)
- Deploy target: Cloudflare Workers via **Webflow Cloud** (`wrangler.json`)
- Bindings: `DB` (D1), `SESSIONS` + `FLAGS` (KV), `MEDIA` (R2)

## Repo layout

```
src/app/
  page.tsx                         ← hero, DOC_LINKS, <BindingsStatus />
  layout.tsx                       ← root layout + metadata
  globals.css                      ← vanilla CSS + .wf-* design tokens
  components/
    WebflowLogo.tsx
    DocCard.tsx
    BindingsStatus.tsx             ← client component, fetches /api/binding-status
  api/
    binding-status/route.ts        ← server route: pings D1, KV, R2 and returns JSON
drizzle/                            ← D1 migrations
open-next.config.ts
next.config.ts
wrangler.json                       ← bindings declaration
package.json
```

## Running locally

```bash
npm install
npm run dev             # Next dev server — API routes use local wrangler bindings (run `npm run db:setup` first)
npm run dev:cf          # OpenNext + wrangler dev — full bindings simulation
```

`dev:cf` runs `opennextjs-cloudflare build && wrangler dev`, giving you the
same runtime Webflow Cloud uses in production.

## Building

```bash
npm run build
```

Build output lands in `.next/` (Next standard build). The Cloudflare worker
is produced by `opennextjs-cloudflare build` and lands in `.open-next/`.

## Bindings

Declared in `wrangler.json`:

| Binding    | Kind | Purpose                         |
| ---------- | ---- | ------------------------------- |
| `DB`       | D1   | SQL database (Drizzle migrations in `drizzle/`) |
| `SESSIONS` | KV   | Session store                   |
| `FLAGS`    | KV   | Feature flags                   |
| `MEDIA`    | R2   | Object storage                  |

Webflow Cloud provisions these on deploy — you don't manage them manually.
The health-check route (`src/app/api/binding-status/route.ts`) performs a
cheap read/write against each binding and returns per-binding status + latency.

To seed D1 locally:

```bash
npm run db:setup
```

## Editing the UI

- **Page content (hero, CTAs, doc cards):** `src/app/page.tsx`
- **Doc card list:** search for `DOC_LINKS` in `src/app/page.tsx`
- **Bindings status cards:** `src/app/components/BindingsStatus.tsx`
- **Health-check route (server):** `src/app/api/binding-status/route.ts`
- **Brand tokens and `.wf-*` styles:** `src/app/globals.css`

## Deploying to Webflow Cloud

1. Push this repo to GitHub.
2. In your Webflow Cloud project, connect the repo and pick a mount path
   (e.g. `/my-app`). The app runs under any prefix.
3. Webflow Cloud builds with `npm run build`, wraps the output with
   OpenNext, and provisions all bindings from `wrangler.json` automatically.

See [Deployments](https://developers.webflow.com/webflow-cloud/deployments)
and [Environments](https://developers.webflow.com/webflow-cloud/environments).

## Contributing

- Keep the **Webflow brand tone**: blue gradient (`#4353FF` → `#146EF5`), dark
  background, minimal copy. Reuse the existing `.wf-*` CSS tokens.
- This is a Hello World. Do **not** add extra pages, client-state libraries,
  or UI kits. Small and readable beats clever.
- Run `npm run build` before opening a PR.
- Keep **cross-app parity**: if you change shared copy or doc links, update
  the sibling `hello-world-*-app[-bindings]` apps too.

## Related docs

- [Webflow Cloud overview](https://developers.webflow.com/webflow-cloud)
- [Getting started](https://developers.webflow.com/webflow-cloud/getting-started)
- [Storing data overview](https://developers.webflow.com/webflow-cloud/storing-data/overview)
- [SQLite (D1)](https://developers.webflow.com/webflow-cloud/storing-data/sqlite)
- [Key Value Store](https://developers.webflow.com/webflow-cloud/storing-data/key-value-store)
- [Object Storage (R2)](https://developers.webflow.com/webflow-cloud/storing-data/object-storage)
- [Environments](https://developers.webflow.com/webflow-cloud/environments)
- [Deployments](https://developers.webflow.com/webflow-cloud/deployments)
- [Configuration](https://developers.webflow.com/webflow-cloud/environment/configuration)
- [Node.js compatibility](https://developers.webflow.com/webflow-cloud/environment/nodejs-compatibility)
- [Limits](https://developers.webflow.com/webflow-cloud/limits)

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
