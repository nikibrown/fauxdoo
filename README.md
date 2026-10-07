# Fauxdoo savings calculator

A small full-stack app on [Webflow Cloud](https://webflow.com/cloud): a "cut costs" calculator for **Fauxdoo**, a fictional all-in-one software suite. Visitors pick the apps they pay for, see how much they'd save by switching, and can leave their email so marketing can follow up.

**Live:** https://fauxdoo-software.webflow.io/savings-calculator, mounted on the Fauxdoo Webflow site (https://fauxdoo-software.webflow.io/), which links to it.

> Fauxdoo and every tool name and price here (Taskana, Fastbooks, Buyify, Slick, Siteflo, Dealforce) are made up. This is a demo built for a video about when and how to use Webflow Cloud.

## How it works

- **Prices live in a database, not in the page.** The calculator loads them from `GET /api/pricing`, which reads a SQLite (D1) database. Edit a price in the database and the calculator changes on the next refresh, with no redeploy.
- **The server does the math that counts.** The browser shows live totals, but when someone submits, `POST /api/leads` recalculates the savings from the database and ignores any totals sent by the browser.
- **Leads are stored for marketing.** Each submission saves the email, the selected apps, the user count, and the calculated savings. A token-protected endpoint exports them as CSV.

All money is stored and calculated as **integer cents** (`1600` = $16) and formatted as dollars only for display. The savings math is one pure function, `buildQuote` in `src/lib/quote.ts`, shared by the browser and the server.

```
annualSavings = (sum of selected tools (flat + perUser × users) − suitePerUser × users) × 12
```

## Stack

- Next.js 16 (App Router), React 19, TypeScript, plain CSS
- Runs on Cloudflare Workers via Webflow Cloud and the [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) adapter
- Webflow Cloud SQLite (Cloudflare D1) with plain SQL migrations; no ORM
- Tests use Node's built-in test runner; no extra test dependencies

Started from Webflow's [`hello-world-next-app`](https://github.com/Webflow-Examples/hello-world-next-app/tree/v16-with-bindings) template (branch `v16-with-bindings`).

## Project structure

```
drizzle/                      SQL migrations (folder name comes from the template; no Drizzle ORM)
  0001_init.sql               tables: tools, settings, leads
  0002_seed.sql               the six tools and the suite price
src/app/
  page.tsx                    page shell (header, headings, footer)
  components/Calculator.tsx   the interactive calculator (client component)
  globals.css                 all styles
  api/pricing/route.ts        GET  public price list
  api/leads/route.ts          POST save a lead
  api/admin/pricing/route.ts  GET/PUT prices (token required)
  api/admin/leads/route.ts    GET  leads as JSON or CSV (token required)
  api/binding-status/route.ts GET  health check for the storage bindings
src/lib/
  quote.ts                    buildQuote: the savings calculation
  pricing.ts                  reads prices from the database
  leads.ts                    lead validation and spam honeypot
  pricing-update.ts           admin price-update validation
  admin-auth.ts               bearer-token check for admin routes
  csv.ts                      CSV writer (spreadsheet-formula safe)
  paths.ts                    withBasePath: adds the mount path to URLs
  money.ts                    cents → "$1,234.00"
wrangler.json                 storage bindings (DB, plus template KV/R2)
```

## Run it locally

Requires Node 22+ and npm.

```bash
npm install
npm run db:setup     # create the local database and apply migrations (once, or after a reset)
npm run dev          # http://localhost:3000
```

`npm run dev` uses a local copy of the database stored in `.wrangler/state/`. It's separate from the live database.

To run the same Workers runtime Webflow Cloud uses (no hot reload; restart after code changes):

```bash
npm run dev:cf       # http://localhost:8787
```

Other commands:

```bash
npm test             # unit tests (savings math, validation, auth, CSV)
npm run lint
npm run build
```

### Local admin token

Admin routes need a token. Copy `.dev.vars.example` to `.dev.vars` (git-ignored) and set your own value:

```bash
cp .dev.vars.example .dev.vars
# then set ADMIN_TOKEN, for example to the output of: openssl rand -hex 32
```

### Edit prices locally

```bash
npx wrangler d1 execute DB --local --command "UPDATE tools SET per_user_cents = 900 WHERE slug = 'chat'"
```

## API

All paths are relative to the app's mount path (e.g. `/savings-calculator/api/pricing` on the live site).

### Public

**`GET /api/pricing`**: active tools in display order, plus the suite price.

```json
{
  "suitePerUserCents": 1200,
  "tools": [
    { "slug": "tasks", "name": "Taskana", "replaces": "Asana/Jira/Monday",
      "category": "Projects", "perUserCents": 2000, "flatCents": 0 }
  ]
}
```

**`POST /api/leads`**: saves a lead and returns the savings the server calculated.

```bash
curl -X POST https://fauxdoo-software.webflow.io/savings-calculator/api/leads \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","users":5,"toolSlugs":["tasks","chat","crm"],"consent":true,"website":""}'
# 201 {"ok":true,"annualSavingsCents":...}
```

Validation: valid email (up to 254 characters), `users` a whole number from 1 to 999, one or more tool slugs that all exist, `consent` must be `true`. Errors return `400 {"error":"..."}`. `website` is a hidden spam trap: if it's filled in, the response is `201` but nothing is saved.

### Admin (token required)

Send `Authorization: Bearer <ADMIN_TOKEN>`. A missing or wrong token returns `401`; if no token is configured on the server, admin routes return `503` instead of opening up.

| Route | What it does |
|---|---|
| `GET /api/admin/pricing` | All tools, including inactive ones, with `active` and `sortOrder` |
| `PUT /api/admin/pricing` | Update `suitePerUserCents` and/or tools (`name`, `perUserCents`, `flatCents`, `active`, `sortOrder`). All changes apply together or not at all. |
| `GET /api/admin/leads` | One row per email (latest submission), newest first. JSON by default; `?format=csv` downloads a CSV; `&consentOnly=1` keeps only leads who agreed to emails. |

Download the leads CSV without putting the token in your shell history:

```bash
read -s "T?Admin token: "
curl -fOJ -H "Authorization: Bearer $T" "https://fauxdoo-software.webflow.io/savings-calculator/api/admin/leads?format=csv&consentOnly=1"
unset T
```

## Deploy to Webflow Cloud

1. Push this repo to GitHub.
2. In Webflow, open the [Webflow Cloud deploy wizard](https://webflow.com/dashboard/cloud/deploy), connect GitHub, pick the repo and the `main` branch, choose **Existing site**, and set a mount path (this app uses `/savings-calculator`).
3. Webflow Cloud creates the database from `wrangler.json` and applies the migrations in `drizzle/` automatically on deploy.
4. In the environment's **Environment variables** tab, add:
   - `ADMIN_TOKEN`: a long random value, marked **Secret**.
   - `NEXT_PUBLIC_BASE_PATH` (optional): the mount path, e.g. `/savings-calculator`. If you set it, keep it in sync with the mount path.
5. Push to `main` to redeploy. Environment variable changes only take effect on the next deploy.

**Editing live data:** the environment's **Storage** tab lets you view, edit, and delete rows. Change a value in the `tools` table (in cents) and refresh the calculator; no redeploy needed.

### Mount path gotcha

Webflow Cloud sets Next.js's `basePath` from the mount path, so `<Link>`, `next/image`, and server routes work automatically. Browser `fetch()` calls and plain `<img>` tags don't get it. Every such URL in this app goes through `withBasePath()` in `src/lib/paths.ts`, which uses `NEXT_PUBLIC_BASE_PATH` if it's set and otherwise falls back to the `basePath` Next.js was built with.

## Known limitations

- No emails are sent; marketing exports the CSV.
- Spam protection is a honeypot field only (no rate limiting or CAPTCHA).
- Submitting the form counts as consent to marketing emails (a notice under the button says so); there is no separate opt-in checkbox.
- No admin screen; edit prices in the Storage tab or through the admin API.
- The template's KV (`SESSIONS`, `FLAGS`) and R2 (`MEDIA`) bindings are declared but unused.
