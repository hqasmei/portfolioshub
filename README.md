# PortfoliosHub — SvelteKit

A SvelteKit 2 / Svelte 5 port of [portfolioshub](https://portfolioshub.com), deployed to Cloudflare
Workers. The Convex backend and Clerk tenant are unchanged from the original Next.js app — `convex/`
is a direct copy, so both apps can run against the same deployment during the migration.

## Stack

| Concern   | Package                                                        |
| --------- | -------------------------------------------------------------- |
| Framework | SvelteKit 2 + Svelte 5 (runes), `@sveltejs/adapter-cloudflare` |
| Backend   | Convex, via `convex-svelte`                                    |
| Auth      | Clerk, via the community `svelte-clerk`                        |
| UI        | Tailwind v4 + shadcn-svelte (bits-ui)                          |
| Forms     | `sveltekit-superforms` (SPA mode) + zod                        |
| Theme     | `mode-watcher`                                                 |
| Toasts    | `svelte-sonner`                                                |
| Markdown  | `mdsvex` for the legal pages, `marked` for changelog/roadmap   |

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values
npm run dev            # runs vite dev and `convex dev` in parallel
```

Only run `convex dev` from one checkout at a time — the Next app and this one push to the same dev
deployment.

## Environment

Two kinds of variable, and the distinction matters on Cloudflare:

- **Build-time** (`$env/static/public`, inlined into the bundle): `PUBLIC_CONVEX_URL`,
  `PUBLIC_SITE_URL`, `PUBLIC_PROJECT_PLANNER_AI_ID`. These come from `.env` locally and from CI env
  at build time.
- **Runtime** (`$env/dynamic/*`, read from the Worker's bindings): `PUBLIC_CLERK_PUBLISHABLE_KEY`,
  `PUBLIC_CLERK_SIGN_IN_URL`, `PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL`, `CLERK_SECRET_KEY`.
  svelte-clerk reads these itself. Locally `vite dev` picks them up from `.env`, but `wrangler dev`
  needs them in `.dev.vars`; in production they are Worker vars/secrets.

`CLERK_JWT_ISSUER_DOMAIN`, `CLERK_WEBHOOK_SECRET` and `RECAPTCHA_SECRET_KEY` are set on the Convex
deployment, not here.

Clerk needs a JWT template named **`convex`** — the same one the Next app uses.

## Scripts

| Script                   | What it does                                          |
| ------------------------ | ----------------------------------------------------- |
| `npm run dev`            | Vite + `convex dev`                                   |
| `npm run check`          | `svelte-check`                                        |
| `npm run build`          | Production build                                      |
| `npm run preview:worker` | Build, then serve from **workerd** via `wrangler dev` |
| `npm run deploy`         | Build and `wrangler deploy`                           |

Use `preview:worker` before shipping anything that touches server code. Vite dev runs on Node and
will happily hide a `nodejs_compat` gap that only shows up in workerd — that is exactly how the
`@clerk/shared` resolution bug below was found.

## Deployment

`.github/workflows/deploy.yml` runs on push to `main`: `npm ci` → `npm run check` →
`convex deploy --cmd 'npm run build'` → `wrangler deploy`. Chaining the build under `convex deploy`
means `PUBLIC_CONVEX_URL` always points at the backend that was just pushed.

Required in the GitHub repo: secrets `CONVEX_DEPLOY_KEY`, `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`; variables `PUBLIC_SITE_URL`, `PUBLIC_PROJECT_PLANNER_AI_ID`.

### Domain cutover (not done yet)

`portfolioshub.com` is on Route 53, serving the Next app from AWS via SST. Workers custom domains
need the zone on Cloudflare, so:

1. Deploy to `*.workers.dev` first, with **Clerk development keys** — a production publishable key
   is domain-locked to `portfolioshub.com` and will not work on workers.dev.
2. Add the zone to Cloudflare and import the Route 53 records. Re-create Clerk's production CNAMEs
   (`clerk.`, `accounts.`, `clkmail.`, `clk._domainkey.`) **DNS-only, orange cloud off** — proxying
   them breaks Clerk's certificate issuance.
3. Drop Route 53 TTLs to 60s a day ahead, then switch nameservers.
4. Uncomment `routes` in `wrangler.jsonc`, redeploy, then swap in the production Clerk key.
5. Leave the SST stack up as a rollback until DNS has settled.

Convex needs no changes: `auth.config.ts` keys off `CLERK_JWT_ISSUER_DOMAIN`, and the `/getImage`
HTTP action already sends `Access-Control-Allow-Origin: *`.

## Notes on the port

Things that are deliberately different from the Next app:

- **`@clerk/shared` is a direct dependency.** `@clerk/themes@2.x` hoists `@clerk/shared@3.x`, but
  svelte-clerk needs 4.x. Once svelte-clerk's code is bundled into an app chunk the bare import
  resolves against the hoisted copy and the build fails on a missing export. Pinning 4.x at the top
  level fixes it. Remove this once `@clerk/themes` moves to the 4.x line.
- **Auth-dependent Convex queries are gated** behind `'skip'` until the Clerk token reaches Convex.
  The Next app fired them immediately, so favourites and the `/admin` link briefly rendered as if
  signed out.
- **`getPortfolioFromId` is skipped** unless a card is a favourite card. The Next app opened that
  subscription for every card in the grid and discarded the result.
- **The image dropzone revokes its object URLs**; the Next app leaked them.
- **Adding a portfolio without an image shows an error** instead of throwing on `image!.type`.
- **`sitemap.xml` lists routes that exist.** The Next app's emitted `undefined/about` and
  `undefined/posts`.
- **`/changelog` and `/roadmap` degrade to their empty state** when projectplannerai is unreachable
  rather than returning a 500.
- **Three type-only fixes in `convex/`** were needed for convex@1.43 — see the initial commit.

Not carried over, because it was dead code: `word-rotate`, `counter`, the newsletter form and
`next-recaptcha-v3`, the unused Radix toast, and ~25 unused Radix packages.

`prose` is intentionally unstyled: `@tailwindcss/typography` was never installed in the Next app
either, so adding it here would be a visual change, not a port.
