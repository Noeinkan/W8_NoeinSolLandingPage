# Deployment

Production deployment guide for `noeinsolutions.com`.

This repo now supports two deployment paths for the landing site:

1. **Target primary path:** Cloudflare Pages for `noeinsolutions.com` and `www.noeinsolutions.com`
2. **Fallback path:** the existing Hetzner + Docker nginx deployment via `deploy.sh`

`app.noeinsolutions.com` is the production Capsar app and stays on the Hetzner VPS throughout the landing-site migration.

---

## Quick Reference

```bash
# Run local checks only (no upload)
bash deploy.sh --check

# Safe regular deploy (sync + validate + smoke test)
bash deploy.sh

# First-time setup (same checks, with extra setup logging)
bash deploy.sh --setup

# Preview what will be synced
bash deploy.sh --dry-run

# Run live landing + app smoke checks
node scripts/smoke-check.js
```

---

## Target Architecture

After cutover, the intended steady state is:

| Domain | Purpose | Served by |
|--------|---------|-----------|
| `noeinsolutions.com` | Company landing page | Cloudflare Pages -> static files from this repo |
| `www.noeinsolutions.com` | Redirect to apex | Cloudflare custom domain / Redirect Rule |
| `app.noeinsolutions.com` | Capsar.io SaaS app | Hetzner VPS -> Docker nginx -> backend containers |
| `jobs.noeinsolutions.com` | Jobs / product-specific surface | Hetzner VPS |
| `77.42.70.26.nip.io` | Internal/fallback access | Hetzner VPS |

Cloudflare Pages becomes the primary origin only for the marketing site. The Capsar app stays on its current origin and must remain reachable before, during, and after the landing cutover.

---

## Repo-Hosted Static Config

The repo now contains provider-ready static-host config for the landing site:

- `_headers` — Cloudflare Pages response headers for security, cache policy, and noindex on preview domains
- `_redirects` — path redirects for extensionless EN/IT routes
- `.github/workflows/static-site-checks.yml` — CI gates on pull requests and `main`, plus manual live smoke checks
- `scripts/smoke-check.js` — live smoke checks for both the landing site and `app.noeinsolutions.com`

Important constraint: Cloudflare Pages `_redirects` does **not** support domain-level redirects. `www.noeinsolutions.com` -> apex must be configured in Cloudflare custom domain settings or Redirect Rules, not in the repo.

---

## Cloudflare Pages Setup

Use these settings when creating the Pages project:

1. Connect the repository directly in Cloudflare Pages.
2. Framework preset: `None`.
3. Build command: none.
4. Build output directory: `.`
5. Custom domains: attach only `noeinsolutions.com` and `www.noeinsolutions.com`.
6. Keep `app.noeinsolutions.com`, `jobs.noeinsolutions.com`, and any other product subdomains pointing at the Hetzner VPS.
7. If the DNS zone moves to Cloudflare, keep `app.noeinsolutions.com` DNS-only for the first cutover so landing migration does not change Capsar proxy behavior at the same time.

Before cutover:

1. Validate the Pages preview deployment for `/`, `/about.html`, `/contact.html`, `/it/index.html`, and `/it/contact.html`.
2. Run the repo checks in GitHub Actions.
3. Run `node scripts/smoke-check.js` against production to capture a clean baseline for both the landing site and the app.
4. Lower DNS TTL for the apex and `www` records.

During cutover:

1. Point `noeinsolutions.com` and `www.noeinsolutions.com` at the Pages project.
2. Configure `www` -> apex in Cloudflare.
3. Confirm `app.noeinsolutions.com` still resolves to the Hetzner origin and still serves the Capsar app.
4. Re-run `node scripts/smoke-check.js`.

After cutover:

1. Keep the Hetzner landing deploy path intact as a bounded rollback path.
2. Rehearse rollback once by restoring the previous Pages deployment first.
3. Use DNS rollback to Hetzner only if the Pages rollback does not resolve the issue.

---

## Current Fallback Runtime

The landing page shares the same Docker nginx as Capsar.io, but its config is **fully isolated** in a standalone file and override, so Capsar deploys cannot affect it.

| Domain | Purpose | Served by |
|--------|---------|-----------|
| `noeinsolutions.com` | Company landing page | Docker nginx -> static files from `/var/www/noeinsol` |
| `www.noeinsolutions.com` | Redirect to apex | Docker nginx (via `noeinsol.conf`) |
| `app.noeinsolutions.com` | Capsar.io SaaS app | Docker nginx -> proxy to backend container |
| `77.42.70.26.nip.io` | Internal/fallback access | Docker nginx -> proxy to backend container |

Remote config paths:
- Landing page nginx config: `/opt/bep-generator/nginx/conf.d/noeinsol.conf` (standalone, untracked by Capsar git)
- Volume mount override: `/opt/bep-generator/docker-compose.override.yml` (untracked by Capsar git)
- Capsar nginx config: `/opt/bep-generator/nginx/conf.d/default.conf` (tracked by Capsar git)
- Capsar Docker Compose: `/opt/bep-generator/docker-compose.yml` (tracked by Capsar git)

### Why this is resilient

1. `noeinsol.conf` is an untracked file in Capsar's `nginx/conf.d/` — `git pull` only resets tracked files
2. `docker-compose.override.yml` is untracked — same reason
3. Capsar's deploy runs `docker compose up -d --force-recreate nginx` which automatically merges the override
4. Nginx loads all `*.conf` from `conf.d/` — no injection into `default.conf` needed

---

## What `deploy.sh` Enforces

Every regular deploy (`bash deploy.sh`) does all of the following before reporting success:

1. Runs local preflight checks before any upload:
   - required site files exist
   - every local HTML link/src/action/srcset points to an existing local file
   - each HTML file has `<title>` and canonical link
2. Syncs files to `/var/www/noeinsol/` and sets ownership.
3. Deploys `docker-compose.override.yml` with the `/var/www/noeinsol` volume mount (skips if already present).
4. Deploys `noeinsol.conf` to `conf.d/` as a standalone server block for:
   - `noeinsolutions.com`
   - `www.noeinsolutions.com` (redirected to apex inside same block)
   - `default_server` on `443` to prevent wrong-certificate fallback
5. Cleans up any legacy injected blocks from `default.conf` (one-time migration, no-op after first run).
6. Ensures the nginx container can read `/var/www/noeinsol/index.html`.
   - If not, it force-recreates nginx to pick up mounts.
7. Runs `nginx -t` inside the container before reload.
8. Reloads nginx.
9. Runs smoke checks from your machine:
   - `curl -I https://noeinsolutions.com`
   - downloads homepage and asserts it matches the local homepage title and canonical
   - asserts it is not serving the Capsar app HTML

If any step fails, deploy exits non-zero and prints an error.

Treat this as the fallback landing deploy path after Cloudflare Pages is live. It should remain available until the new primary path has been exercised and rollback has been rehearsed.

---

## What CI Enforces

The GitHub Actions workflow at `.github/workflows/static-site-checks.yml` runs:

1. `node ui-ux.test.js`
2. `node it-translation.test.js`
3. `bash deploy.sh --check`

On manual dispatch, the same workflow also runs `node scripts/smoke-check.js` against the live landing and app domains.

This is release gating, not uptime monitoring. Use an external service for continuous probes and alerts.

---

## Source-of-Truth Templates

`deploy.sh` uses these templates from this repo:

- `deploy/templates/noeinsol.conf` — standalone nginx server block
- `deploy/templates/noeinsol-compose-override.yml` — Docker Compose override with volume mount

`landing-block.conf` mirrors the nginx config as a human-readable reference.

---

## Prerequisites

1. SSH access works: `ssh root@77.42.70.26`
2. For the fallback deploy path, DNS A records for `noeinsolutions.com` and `www.noeinsolutions.com` point to `77.42.70.26`
3. Capsar stack is running in `/opt/bep-generator`
4. Host-level nginx is disabled to avoid port conflicts with Docker nginx

---

## First-Time Setup

Run:

```bash
bash deploy.sh --setup
```

This performs setup plus the same validation/smoke-check pipeline as regular deploy.

---

## Rollback / Recovery

If a deploy fails after partial server changes:

1. Check nginx container status:
   ```bash
   ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose ps nginx"
   ```
2. Re-run deploy; script is idempotent:
   ```bash
   bash deploy.sh
   ```
3. If needed, force recreate nginx:
   ```bash
   ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose up -d --force-recreate nginx"
   ```

If Cloudflare Pages is the primary landing origin and the landing site has to be rolled back:

1. Roll back the Pages deployment first.
2. Confirm `app.noeinsolutions.com` is still healthy before touching DNS.
3. Only then restore apex and `www` DNS to Hetzner if the provider-side rollback is insufficient.

---

## Useful Commands

```bash
# Check Docker nginx status
ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose ps nginx"

# View Docker nginx logs
ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose logs nginx --tail=40"

# Test nginx config inside container
ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose exec nginx nginx -t"

# Check if nginx sees landing page files
ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose exec nginx sh -lc 'ls -l /var/www/noeinsol/index.html'"

# Check SSL certificate status on host
ssh root@77.42.70.26 "certbot certificates"

# Verify noeinsol.conf is in place
ssh root@77.42.70.26 "ls -la /opt/bep-generator/nginx/conf.d/noeinsol.conf"

# Verify override is in place
ssh root@77.42.70.26 "cat /opt/bep-generator/docker-compose.override.yml"

# External check
curl -I https://noeinsolutions.com

# Landing + app smoke checks
node scripts/smoke-check.js
```
