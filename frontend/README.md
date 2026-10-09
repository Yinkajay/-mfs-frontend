This is the MFS Services static Next.js site. `npm run build` writes the cPanel-ready site to `out/`.

## One-command cPanel deployment

The deployment command builds the site and syncs `out/` to cPanel over encrypted FTPS. It does not create a ZIP or require File Manager uploads.

1. In cPanel, create a dedicated FTP account whose directory is the site's `public_html` folder. For encrypted FTPS, use the hosting server's hostname (shown in cPanel's Server Information), not a custom `ftp.yourdomain.com` address; the hostname must match the server's TLS certificate. Plain FTP is not supported by the script.
2. Copy `deploy.config.example.json` to `deploy.config.local.json` if the local config does not already exist. Enter the FTP host and full FTP username. Set `remoteDir` to `/` for an FTP account rooted in `public_html`, or `/public_html` if you are using the main cPanel FTP account. The local config file is Git-ignored; never commit or send it.
3. Run `npm install` once, then run `npm run deploy` whenever you want to publish. The script asks for the FTP password in the terminal without showing it.

For noninteractive deployments, set `MFS_FTPS_PASSWORD` in your environment, or add `password` to the ignored local config. The script requires a valid TLS certificate and will not fall back to unencrypted FTP.

The first run requires an existing `index.html` in the selected remote directory, so a wrong or empty FTP folder is not silently used. It uploads the new site but leaves unknown files from earlier manual deployments alone. After that, a manifest in `public_html` lets the script remove only files it previously uploaded. It keeps the previous build's hashed assets for one extra deployment so visitors with an older page can still load them. Files such as `.htaccess`, `.well-known` and unrelated uploads are never cleared wholesale. `npm run deploy:check` checks the local `out/` folder without connecting to cPanel.

## Local development

Run `npm install` once, then `npm run dev` and open [http://localhost:3000](http://localhost:3000). Run `npm run lint` before publishing.

## Customer authentication

The existing static frontend calls the separate NestJS API directly. Set the public API URL in a frontend environment file; never copy the backend `.env` or database credentials here.

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/v1
```

Use `.env.development.local` for local development (configured locally), or copy `.env.example` to that file on another machine. Start the backend on port 3001 using its README, then start this frontend on port 3000. Open **localhost** for both apps: mixing localhost and 127.0.0.1 breaks the same-site cookie flow.

- Signup sends names, email, phone, and the unchanged password. The backend checks phone number length and structure before normalizing it; new passwords require 8–128 Unicode characters. After a generic accepted response, the frontend automatically calls the separate login endpoint with the entered credentials, confirms the session through `/me`, and returns home. Acceptance alone never counts as authentication or promises email verification. If automatic login fails, the entered email/password remain available for retrying login without registering again.
- Login, session restore (`GET /v1/me`), and logout use `credentials: 'include'`. Every auth POST sends JSON and `X-MFS-CSRF: 1`. Only the safe customer profile is held in memory; no tokens or profile are persisted in browser storage. Login also checks `/me` to confirm the HttpOnly cookie works.
- The existing navigation shows Account/Log out when signed in. Refreshing or returning to a visible tab checks the session quietly; a background connection failure does not show a form error or count as a confirmed logout. Explicit signup/login/logout failures remain visible and retryable. Unverified customers remain allowed to sign in.
- The existing terms checkbox is a client-side requirement only. The current API does not record legal-consent evidence; that policy remains unresolved.

### Before publishing

Set `NEXT_PUBLIC_API_BASE_URL` to the **real public HTTPS API URL including `/v1`** in `.env.production.local` or the build environment, then rebuild. Next.js embeds this public value at build time; changing cPanel environment variables after upload will not change an exported bundle. The local development URL is not loaded by a production build. No public API deployment is configured by this change.

The backend must allow the exact frontend origin through `AUTH_ALLOWED_ORIGINS` with credentialed CORS, never `*`. Local port 3000 is already allowed, so no backend source change is needed. Public deployment requires HTTPS, secure cookies, and a same-site frontend/API (for example, `https://mfsservicesng.com` and `https://api.mfsservicesng.com`). A frontend served from an unrelated site will not work with the current `SameSite=Lax` cookie. Only configure proxy hops for the actual restricted hosting topology.

```sh
npm run typecheck
npm run lint
npm run test:auth
npm run test:auth:browser
```

Before browser tests, build with `NEXT_PUBLIC_API_BASE_URL=http://localhost:3003/v1` in the command environment. Browser tests use locally installed Google Chrome and serve the actual static `out/` export on port 3002 (test API port 3003), without stopping an existing dev server. They mock API errors and verify the existing desktop/mobile UI. Traces, videos, and screenshots are disabled to avoid retaining credentials. This test export is **not** a public deployment build; rebuild with the real HTTPS API URL before deploying.

For the opt-in real-backend check, use Node 24, keep ports 3002/3003 free, ensure `../backend` has its existing generated build and authenticated Neon development link, then set `MFS_AUTH_LIVE=1` and run `npm run test:auth:live`. It verifies the pinned development target before creating one synthetic customer, and removes only that fixture and its exact rate-limit counters afterward. It does not migrate or deploy anything.

Verification delivery, password recovery, and staff authentication are not part of this integration.

## Customer workspace

The customer pages share a full width shell with a desktop navigation rail and a keyboard accessible mobile dialog. Open **Dashboard** from the signed-in Account menu. The existing landing/auth designs and their post-login destination are unchanged.

| Route                  | Content                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/dashboard/`          | Overview with a real account summary, workspace links, and the existing MFS WhatsApp contact as the next useful action. |
| `/dashboard/vehicles/` | Customer-owned vehicles from the garage API, with add/edit forms and pagination. No deletion UI.                        |
| `/dashboard/services/` | Informational empty layout; no hard-coded catalogue, availability, prices, or checkout.                                 |
| `/dashboard/requests/` | Informational empty layout; no request records, progress, or submission actions.                                        |
| `/dashboard/account/`  | Read-only name, email, and phone from the existing authenticated `GET /v1/me` response.                                 |

The existing `AuthProvider` remains the only session store. Initial checks show a skeleton; a confirmed signed-out session redirects to `/auth/login/`. An initial connection failure offers retry without treating it as a logout. A failed background refresh keeps the last loaded profile with a visible notice, while a confirmed `401` removes it. Logout uses the existing credentialed, CSRF-protected API flow. No credentials or profile data are added to browser storage, and no verification requirement is introduced.

These statically exported pages use a **client-side UI gate**, not server-side page access control. Only generic shell content is exported; account and vehicle details arrive from the protected customer API. The garage API enforces customer ownership on every operation. Future request/file APIs must enforce authorization too. Do not put private records into static pages or treat this shell as an authorization boundary.

Dashboard metadata uses `noindex, nofollow`. Account editing, staff pages, services, requests, uploads, and vehicle deletion remain out of scope.

### Vehicle garage

Vehicles use the existing `NEXT_PUBLIC_API_BASE_URL` and shared cookie/CSRF transport. The page calls `GET /vehicles?limit=20&offset=…`, reads fresh details through `GET /vehicles/:id` before editing, creates through `POST /vehicles`, and sends only changed fields through `PATCH /vehicles/:id`. POST/PATCH send JSON with `X-MFS-CSRF: 1`; all requests include credentials. No backend or CORS adjustment is required.

The five confirmed categories are available. Category is the only required field; optional details can be cleared with `null`. Registration spacing and case are preserved as entered. Other text is trimmed/normalized, year is a four-digit integer, and usage/engine capacity remain text rather than invented business enums or units. Duplicate plates are not blocked by the frontend.

Customers can add an optional **Vehicle name** such as Family car or Work van (up to 80 characters). The saved name is the card title, with make/model underneath. Unnamed vehicles fall back to make/model, then category. Naming, renaming, and clearing the name use the existing create/edit requests; no browser storage or new routes are introduced.

Garage data and drafts stay in component memory and reset when the customer changes. Loading, genuine empty responses, field validation, unavailable services, expired sessions, and failed saves have separate states. A garage `401` hides vehicle records and asks the existing provider to restore the session. Failed refreshes retain previously loaded records with a notice; uncertain network writes are not automatically repeated.

After building with the documented test API URL, run:

```sh
npm run test:auth
npm run test:vehicles
npx playwright test tests/auth.spec.ts tests/dashboard.spec.ts tests/vehicles.spec.ts
```

The dashboard and garage browser tests mock `/v1/me`, logout, and garage endpoints. They cover navigation, profile projection, session failures, logout retries, vehicle loading/add/edit, validation and API failures, pagination, keyboard focus, and narrow viewport overflow. They do not connect to the backend or create database fixtures.
