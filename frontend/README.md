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

- Signup sends names, email, phone, and the unchanged password. The backend validates/normalizes inputs; new passwords require 15–128 Unicode characters. After a generic accepted response, the frontend automatically calls the separate login endpoint with the entered credentials, confirms the session through `/me`, and returns home. Acceptance alone never counts as authentication or promises email verification. If automatic login fails, the entered email/password remain available for retrying login without registering again.
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

Verification delivery, password recovery, staff authentication, and a dashboard are not part of this integration.
