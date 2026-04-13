# Deployment

Production deployment guide for noeinsolutions.com.

---

## Quick Reference

```bash
# Regular deploy (sync files + reload nginx)
bash deploy.sh

# First-time setup (deploy files + verify config)
bash deploy.sh --setup

# Preview what will be synced
bash deploy.sh --dry-run
```

---

## Architecture

The landing page is served by the **same Docker nginx** that serves the Capsar.io app. There is no separate host-level nginx.

| Domain | Purpose | Served by |
|--------|---------|-----------|
| `noeinsolutions.com` | Company landing page | Docker nginx → static files from `/var/www/noeinsol` |
| `app.noeinsolutions.com` | Capsar.io SaaS app | Docker nginx → proxy to backend container |
| `77.42.70.26.nip.io` | Internal/fallback access | Docker nginx → proxy to backend container |

The Docker nginx config lives at `/opt/bep-generator/nginx/conf.d/default.conf` on the server.

### How it works

1. `deploy.sh` syncs landing page files to `/var/www/noeinsol/` on the server
2. The Docker nginx container has `/var/www/noeinsol` mounted as a read-only volume
3. An HTTPS server block in the Docker nginx config serves `noeinsolutions.com` from that directory
4. After syncing files, the script reloads nginx inside the Docker container

---

## Prerequisites

1. **SSH access** to the Hetzner server — `ssh root@77.42.70.26` must work without password prompt
2. **DNS** — A records for `noeinsolutions.com` and `www.noeinsolutions.com` pointing to `77.42.70.26`
3. **The Capsar.io app must be running** — Docker nginx needs to be up

---

## Regular Deployments

After the initial setup, deploy code changes with:

```bash
bash deploy.sh
```

This syncs changed files to the server and reloads nginx inside the Docker container. Takes a few seconds.

---

## First-Time Setup

If this is a fresh server or the Docker nginx config hasn't been set up yet:

### 1. Deploy files

```bash
bash deploy.sh --setup
```

### 2. Add volume mount to Docker compose

Edit `/opt/bep-generator/docker-compose.yml` on the server. Under the `nginx` service's `volumes`, add:

```yaml
- /var/www/noeinsol:/var/www/noeinsol:ro
```

Without this mount, nginx will not be able to serve the landing page files even if the HTTPS server block exists.

### 3. Add landing page server block

Add the contents of `landing-block.conf` (in this repo) to `/opt/bep-generator/nginx/conf.d/default.conf` on the server, before the `www` redirect block.

This block must include `server_name noeinsolutions.com;` and the certificate paths under `/etc/letsencrypt/live/noeinsolutions.com/`.

### 4. Restart Docker nginx

```bash
cd /opt/bep-generator
docker compose up -d --force-recreate nginx
```

Use `--force-recreate` for the first time because nginx needs to be recreated to pick up new volume mounts. After that, `deploy.sh` handles reloads automatically.

`bash deploy.sh --setup` now fails fast if either of these is missing:

- `/var/www/noeinsol:/var/www/noeinsol:ro` in `/opt/bep-generator/docker-compose.yml`
- an HTTPS block with `server_name noeinsolutions.com;` in `/opt/bep-generator/nginx/conf.d/default.conf`

---

## Useful Commands

```bash
# Check Docker nginx status
ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose ps nginx"

# View Docker nginx logs
ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose logs nginx --tail=20"

# Test nginx config inside container
ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose exec nginx nginx -t"

# Reload nginx inside container
ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose exec nginx nginx -s reload"

# Check SSL certificate status
ssh root@77.42.70.26 "certbot certificates"

# Test site is responding
curl -I https://noeinsolutions.com

# Verify correct SSL cert
curl -sv https://noeinsolutions.com 2>&1 | grep 'subject:'
```

---

## Server Details

| Item | Value |
|------|-------|
| **Provider** | Hetzner Cloud |
| **Server** | CX43 |
| **IP** | `77.42.70.26` |
| **OS** | Ubuntu |
| **Location** | Helsinki, Finland (hel1-dc2) |
| **Landing page files** | `/var/www/noeinsol/` |
| **Docker nginx config** | `/opt/bep-generator/nginx/conf.d/default.conf` |
| **Docker compose** | `/opt/bep-generator/docker-compose.yml` |
| **SSL certs** | `/etc/letsencrypt/live/noeinsolutions.com/` |

---

## Project Structure

```
W8_NoeinSolLandingPage/
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── index.html
├── about.html
├── services.html
├── case-studies.html
├── capsar.html
├── contact.html
├── deploy.sh              ← deployment script
├── nginx.conf             ← reference nginx config (not used directly)
├── landing-block.conf     ← nginx server block for Docker nginx
└── DEPLOYMENT.md          ← this file
```

Files excluded from deployment: `.git/`, `deploy.sh`, `nginx.conf`, `landing-block.conf`, `DEPLOYMENT.md`, `.cursor/`.

---

## Troubleshooting

### Changes not appearing after deploy

- HTML is cached for 1 hour; hard-refresh with `Ctrl+Shift+R`
- CSS/JS is cached for 30 days; append a query string to bust cache (e.g. `styles.css?v=2`)
- Verify files landed: `ssh root@77.42.70.26 "ls -la /var/www/noeinsol/"`

### Docker nginx won't start

```bash
# Check logs
ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose logs nginx --tail=30"

# Test config
ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose exec nginx nginx -t"
```

### Host nginx conflict

The host-level nginx service should be **disabled**. If it's running, it'll conflict with Docker on port 80/443:

```bash
ssh root@77.42.70.26 "systemctl disable nginx && systemctl stop nginx"
```

### SSL certificate errors

- Check certificate status: `ssh root@77.42.70.26 "certbot certificates"`
- Renew: `ssh root@77.42.70.26 "certbot renew"`
- If the browser shows `NET::ERR_CERT_COMMON_NAME_INVALID`, check which cert is actually being served:

```bash
openssl s_client -connect noeinsolutions.com:443 -servername noeinsolutions.com </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

- If you see the old `77.42.70.26.nip.io` certificate instead of `noeinsolutions.com`, the live nginx config is missing the apex HTTPS block or Docker nginx was recreated without the `/var/www/noeinsol` mount. Fix both, then run:

```bash
ssh root@77.42.70.26 "cd /opt/bep-generator && docker compose up -d --force-recreate nginx"
```
