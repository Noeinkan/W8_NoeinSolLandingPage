#!/usr/bin/env bash
set -euo pipefail

SERVER="root@77.42.70.26"
DOMAIN="noeinsolutions.com"
REMOTE_DIR="/var/www/noeinsol"
APP_DIR="/opt/bep-generator"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC}  $1"; }
err()  { echo -e "${RED}[error]${NC} $1"; exit 1; }

EXCLUDES_RSYNC=(
    --exclude '.git'
    --exclude 'deploy.sh'
    --exclude 'nginx.conf'
    --exclude 'landing-block.conf'
    --exclude 'DEPLOYMENT.md'
    --exclude '.cursor'
    --exclude '*.plan.md'
)

EXCLUDES_TAR=(
    --exclude='.git'
    --exclude='deploy.sh'
    --exclude='nginx.conf'
    --exclude='landing-block.conf'
    --exclude='DEPLOYMENT.md'
    --exclude='.cursor'
    --exclude='*.plan.md'
)

deploy_files() {
    if command -v rsync &> /dev/null; then
        rsync -avz --delete "${EXCLUDES_RSYNC[@]}" ./ "$SERVER:${REMOTE_DIR}/"
    else
        log "rsync not found, using tar+scp fallback..."
        local tmp_tar="/tmp/noeinsol_deploy.tar.gz"
        tar czf "$tmp_tar" "${EXCLUDES_TAR[@]}" -C . .
        scp -q "$tmp_tar" "$SERVER:/tmp/noeinsol_deploy.tar.gz"
        ssh "$SERVER" "rm -rf ${REMOTE_DIR}/* && tar xzf /tmp/noeinsol_deploy.tar.gz -C ${REMOTE_DIR} && rm /tmp/noeinsol_deploy.tar.gz"
        rm -f "$tmp_tar"
    fi
}

deploy() {
    log "Deploying to ${DOMAIN} (${SERVER})..."

    log "Syncing files to ${REMOTE_DIR}..."
    deploy_files

    log "Setting ownership..."
    ssh "$SERVER" "chown -R www-data:www-data ${REMOTE_DIR}"

    log "Reloading Docker nginx..."
    ssh "$SERVER" "cd ${APP_DIR} && docker compose exec nginx nginx -s reload 2>&1" || warn "Nginx reload returned non-zero (may still be OK)"

    echo ""
    log "Deployed successfully to https://${DOMAIN}"
}

setup_server() {
    log "Starting first-time setup..."

    log "Creating site directory at ${REMOTE_DIR}..."
    ssh "$SERVER" "mkdir -p ${REMOTE_DIR} && chown -R www-data:www-data ${REMOTE_DIR}"

    log "Deploying site files..."
    deploy_files

    log "Checking Docker nginx is running..."
    ssh "$SERVER" "cd ${APP_DIR} && docker compose ps nginx 2>&1" || err "Docker nginx not running — start the app first"

    log "Checking existing nginx server blocks..."
    ssh "$SERVER" "cd ${APP_DIR} && docker compose exec nginx grep 'server_name' /etc/nginx/conf.d/default.conf 2>&1"

    echo ""
    log "Files deployed to ${REMOTE_DIR}"
    log ""
    log "IMPORTANT: The landing page is served by the app's Docker nginx."
    log "Make sure the Docker nginx config has:"
    log "  1. A volume mount for ${REMOTE_DIR} in docker-compose.yml"
    log "  2. An HTTPS server block for ${DOMAIN} in nginx/conf.d/default.conf"
    log ""
    log "If both are in place, reload nginx:"
    log "  ssh ${SERVER} 'cd ${APP_DIR} && docker compose exec nginx nginx -s reload'"
    log ""
    log "Site should be live at https://${DOMAIN}"
}

case "${1:-}" in
    --setup)
        setup_server
        ;;
    --dry-run)
        log "Dry run — files that would be deployed:"
        if command -v rsync &> /dev/null; then
            rsync -avzn --delete "${EXCLUDES_RSYNC[@]}" ./ "$SERVER:${REMOTE_DIR}/"
        else
            tar tzf <(tar czf - "${EXCLUDES_TAR[@]}" -C . .) 2>/dev/null | sed 's|^\./||'
        fi
        ;;
    "")
        deploy
        ;;
    *)
        echo "Usage: bash deploy.sh [--setup | --dry-run]"
        echo ""
        echo "  (no args)   Deploy site files and reload Docker nginx"
        echo "  --setup     First-time setup: deploy files and verify nginx config"
        echo "  --dry-run   Show what files would be synced without deploying"
        exit 1
        ;;
esac
