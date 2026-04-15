# Deployment

Production deployment guide for `noeinsolutions.com`.

---

## Quick Reference

```bash
# Safe regular deploy (sync + repair + validate + smoke test)
bash deploy.sh

# First-time setup (same checks, with extra setup logging)
bash deploy.sh --setup

# Preview what will be synced
bash deploy.sh --dry-run
```

---

## Architecture (Current State)

The landing page is still served by the **same Docker nginx** used by Capsar.io.

| Domain | Purpose | Served by |
|--------|---------|-----------|
| `noeinsolutions.com` | Company landing page | Docker nginx -> static files from `/var/www/noeinsol` |
| `www.noeinsolutions.com` | Redirect to apex | Docker nginx |
| `app.noeinsolutions.com` | Capsar.io SaaS app | Docker nginx -> proxy to backend container |
| `77.42.70.26.nip.io` | Internal/fallback access | Docker nginx -> proxy to backend container |

Remote config paths:
- Docker Compose: `/opt/bep-generator/docker-compose.yml`
- Docker nginx server blocks: `/opt/bep-generator/nginx/conf.d/default.conf`

---

## What `deploy.sh` Now Enforces

Every regular deploy (`bash deploy.sh`) now does all of the following before it reports success:

1. Syncs files to `/var/www/noeinsol/` and sets ownership.
2. Ensures nginx has the required mount in Compose:
   - `/var/www/noeinsol:/var/www/noeinsol:ro`
3. Ensures nginx has the managed landing HTTPS default block for:
   - `noeinsolutions.com`
   - `www.noeinsolutions.com` (redirected to apex inside same block)
   - `default_server` on `443` to prevent wrong-certificate fallback to unrelated hosts
4. Ensures the nginx container can read `/var/www/noeinsol/index.html`.
   - If not, it force-recreates nginx to pick up mounts.
5. Runs `nginx -t` inside the container before reload.
6. Reloads nginx.
7. Runs smoke checks from your machine:
   - `curl -I https://noeinsolutions.com`
   - downloads homepage and asserts it contains `Noein Solutions`
   - asserts it is not serving the Capsar app HTML

If any step fails, deploy exits non-zero and prints an error.

---

## Source-of-Truth Templates

`deploy.sh` repairs drift using templates in this repo:

- `deploy/templates/noeinsol-https-block.conf`
- `deploy/templates/noeinsol-compose-mount.txt`

`landing-block.conf` mirrors the same managed nginx block to keep a human-readable reference.

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

This now performs setup plus the same repair/validation/smoke-check pipeline as regular deploy.

---

## Rollback / Recovery

If a deploy fails after partial server changes:

1. Check nginx container status:
   ```bash
   ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose ps nginx"
   ```
2. Re-run deploy; script is idempotent and re-applies managed mount/block:
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

# External check
curl -I https://noeinsolutions.com
```

---

## Known Risk (Until Phase 2)

This hardening prevents common drift outages, but the landing page still shares the same front-door nginx runtime as Capsar. A major change in the Capsar infrastructure can still impact the landing page.

---

## Phase 2 (Isolation Plan)

To fully decouple landing-page uptime from Capsar deploys (while keeping the same domain and server):

1. Run a dedicated landing service on the same Hetzner host (separate compose project or container).
2. Keep a single stable reverse-proxy entrypoint on `80/443` routing:
   - `noeinsolutions.com` -> landing service
   - `app.noeinsolutions.com` -> Capsar stack
3. Keep TLS cert handling centralized at that stable entrypoint.

This phase needs one-time server work outside this repo.
