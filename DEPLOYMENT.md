# Deployment

Production deployment guide for `noeinsolutions.com`.

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
```

---

## Architecture

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
   - downloads homepage and asserts it contains `Noein Solutions`
   - asserts it is not serving the Capsar app HTML

If any step fails, deploy exits non-zero and prints an error.

---

## Source-of-Truth Templates

`deploy.sh` uses these templates from this repo:

- `deploy/templates/noeinsol.conf` — standalone nginx server block
- `deploy/templates/noeinsol-compose-override.yml` — Docker Compose override with volume mount

`landing-block.conf` mirrors the nginx config as a human-readable reference.

---

## Prerequisites

1. SSH access works: `ssh root@77.42.70.26`
2. DNS A records for `noeinsolutions.com` and `www.noeinsolutions.com` point to `77.42.70.26`
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
```
