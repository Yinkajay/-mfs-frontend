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
