#!/usr/bin/env bash
set -euo pipefail

SERVER="root@77.42.70.26"
DOMAIN="noeinsolutions.com"
WWW_DOMAIN="www.noeinsolutions.com"
REMOTE_DIR="/var/www/noeinsol"
APP_DIR="/opt/bep-generator"
REMOTE_COMPOSE_PATH="${APP_DIR}/docker-compose.yml"
REMOTE_NGINX_PATH="${APP_DIR}/nginx/conf.d/default.conf"
MOUNT_LINE="${REMOTE_DIR}:${REMOTE_DIR}:ro"
LOCAL_NGINX_TEMPLATE="deploy/templates/noeinsol-https-block.conf"
LOCAL_MOUNT_TEMPLATE="deploy/templates/noeinsol-compose-mount.txt"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC}  $1"; }
err()  { echo -e "${RED}[error]${NC} $1"; exit 1; }

EXCLUDES_RSYNC=(
    --exclude '.git'
    --exclude '.claude'
    --exclude '.cursor'
    --exclude '.env'
    --exclude '.env.*'
    --exclude 'deploy.sh'
    --exclude 'nginx.conf'
    --exclude 'landing-block.conf'
    --exclude '*.md'
)

EXCLUDES_TAR=(
    --exclude='.git'
    --exclude='.claude'
    --exclude='.cursor'
    --exclude='.env'
    --exclude='.env.*'
    --exclude='deploy.sh'
    --exclude='nginx.conf'
    --exclude='landing-block.conf'
    --exclude='*.md'
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

require_local_templates() {
    [ -f "$LOCAL_NGINX_TEMPLATE" ] || err "Missing template: ${LOCAL_NGINX_TEMPLATE}"
    [ -f "$LOCAL_MOUNT_TEMPLATE" ] || err "Missing template: ${LOCAL_MOUNT_TEMPLATE}"
}

run_local_preflight_checks() {
    log "Running local preflight checks..."

    local py_cmd=""
    local py_args=()
    if command -v python3 >/dev/null 2>&1 && python3 -c "import sys" >/dev/null 2>&1; then
        py_cmd="python3"
    elif command -v py >/dev/null 2>&1 && py -3 -c "import sys" >/dev/null 2>&1; then
        py_cmd="py"
        py_args=(-3)
    elif command -v python >/dev/null 2>&1 && python -c "import sys" >/dev/null 2>&1; then
        py_cmd="python"
    else
        err "Python is required for preflight checks (python3, py, or python not found)."
    fi

    "$py_cmd" "${py_args[@]}" - <<'PY' || exit 1
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(".").resolve()
REQUIRED_FILES = [
    "index.html",
    "about.html",
    "services.html",
    "case-studies.html",
    "capsar.html",
    "contact.html",
    "privacy.html",
    "it/index.html",
    "it/about.html",
    "it/services.html",
    "it/case-studies.html",
    "it/capsar.html",
    "it/contact.html",
    "it/privacy.html",
    "css/styles.css",
    "js/main.js",
    "sitemap.xml",
    "robots.txt",
]

errors = []
warnings = []

for rel in REQUIRED_FILES:
    if not (ROOT / rel).exists():
        errors.append(f"Missing required file: {rel}")

html_files = sorted(ROOT.glob("*.html")) + sorted((ROOT / "it").glob("*.html"))

class LinkCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        attr_map = dict(attrs)
        for name in ("href", "src", "action", "poster"):
            if name in attr_map:
                self.refs.append((name, attr_map[name]))
        if "srcset" in attr_map:
            for item in attr_map["srcset"].split(","):
                candidate = item.strip().split(" ")[0].strip()
                if candidate:
                    self.refs.append(("srcset", candidate))

def is_local_reference(value: str) -> bool:
    if not value:
        return False
    value = value.strip()
    if value.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return False
    if value.startswith(("http://", "https://", "//")):
        return False
    return True

def resolve_reference(page_path: Path, ref: str) -> Path:
    ref_no_query = ref.split("#", 1)[0].split("?", 1)[0].strip()
    if ref_no_query.startswith("/"):
        return ROOT / ref_no_query.lstrip("/")
    return (page_path.parent / ref_no_query).resolve()

for page in html_files:
    content = page.read_text(encoding="utf-8")
    parser = LinkCollector()
    parser.feed(content)

    if "<title>" not in content or "</title>" not in content:
        errors.append(f"{page.relative_to(ROOT)}: missing <title>")
    if "meta name=\"description\"" not in content:
        warnings.append(f"{page.relative_to(ROOT)}: missing meta description")
    if "rel=\"canonical\"" not in content:
        errors.append(f"{page.relative_to(ROOT)}: missing canonical link")

    for attr_name, ref in parser.refs:
        if not is_local_reference(ref):
            continue
        target = resolve_reference(page, ref)
        if not target.exists():
            errors.append(
                f"{page.relative_to(ROOT)}: broken {attr_name} reference '{ref}'"
            )

if errors:
    print("[preflight] FAILED")
    for item in errors:
        print(f"  - {item}")
    if warnings:
        print("[preflight] warnings:")
        for item in warnings:
            print(f"  - {item}")
    sys.exit(1)

print("[preflight] OK")
if warnings:
    print("[preflight] warnings:")
    for item in warnings:
        print(f"  - {item}")
PY
}

ssh_run() {
    ssh "$SERVER" "$1"
}

has_remote_mount() {
    ssh_run "grep -F '${MOUNT_LINE}' '${REMOTE_COMPOSE_PATH}' >/dev/null 2>&1"
}

has_remote_apex_block() {
    ssh_run "grep -F 'server_name ${DOMAIN};' '${REMOTE_NGINX_PATH}' >/dev/null 2>&1"
}

ensure_remote_compose_mount() {
    if has_remote_mount; then
        log "Compose mount present (${MOUNT_LINE})."
        return
    fi

    log "Compose mount missing. Repairing ${REMOTE_COMPOSE_PATH}..."
    local mount_line
    mount_line="$(tr -d '\r\n' < "${LOCAL_MOUNT_TEMPLATE}")"
    [ -n "$mount_line" ] || err "Mount template ${LOCAL_MOUNT_TEMPLATE} is empty."

    ssh_run "python3 - <<'PY'
from pathlib import Path
import re
import sys

compose_path = Path('${REMOTE_COMPOSE_PATH}')
mount_line = '${mount_line}'
text = compose_path.read_text()
if mount_line in text:
    sys.exit(0)

lines = text.splitlines()

try:
    nginx_idx = next(i for i, line in enumerate(lines) if re.match(r'^\\s{2}nginx:\\s*$', line))
except StopIteration:
    print('nginx service not found in docker-compose.yml', file=sys.stderr)
    sys.exit(1)

end_idx = len(lines)
for idx in range(nginx_idx + 1, len(lines)):
    if re.match(r'^\\s{2}[A-Za-z0-9_-]+:\\s*$', lines[idx]):
        end_idx = idx
        break

try:
    volumes_idx = next(i for i in range(nginx_idx + 1, end_idx) if re.match(r'^\\s{4}volumes:\\s*$', lines[i]))
except StopIteration:
    print('nginx volumes block not found in docker-compose.yml', file=sys.stderr)
    sys.exit(1)

insert_idx = volumes_idx + 1
while insert_idx < end_idx and re.match(r'^\\s{6}-\\s+', lines[insert_idx]):
    insert_idx += 1

lines.insert(insert_idx, f'      - {mount_line}')
compose_path.write_text('\\n'.join(lines) + '\\n')
PY" || err "Failed to repair ${REMOTE_COMPOSE_PATH}"
}

ensure_remote_nginx_blocks() {
    log "Syncing managed nginx landing block in ${REMOTE_NGINX_PATH}..."
    scp -q "${LOCAL_NGINX_TEMPLATE}" "${SERVER}:/tmp/noeinsol-https-block.conf" \
        || err "Failed to upload nginx template."

    ssh_run "python3 - <<'PY'
from pathlib import Path
import re
import sys

nginx_path = Path('${REMOTE_NGINX_PATH}')
template_path = Path('/tmp/noeinsol-https-block.conf')

managed_start = '# BEGIN NOEINSOL LANDING BLOCK (managed by deploy.sh)'
managed_end = '# END NOEINSOL LANDING BLOCK (managed by deploy.sh)'

text = nginx_path.read_text()
template = template_path.read_text().strip() + '\\n'

block_re = re.compile(re.escape(managed_start) + r'.*?' + re.escape(managed_end) + r'\\n?', re.S)
if block_re.search(text):
    text = block_re.sub(template, text)
else:
    text = text.rstrip() + '\\n\\n' + template

# Remove legacy standalone www redirect block to avoid conflicting server_name warnings.
legacy_www_re = re.compile(
    r'\\n?#\\s*www redirect\\s*→\\s*landing page\\s*\\([^\\n]*\\)\\n'
    r'server\\s*\\{\\n'
    r'\\s*listen\\s+443\\s+ssl(?:\\s+http2)?;\\n'
    r'\\s*server_name\\s+www\\.noeinsolutions\\.com;\\n'
    r'.*?'
    r'\\s*return\\s+301\\s+https://noeinsolutions\\.com[^\\n]*;\\n'
    r'\\}\\n?',
    re.S
)
text = legacy_www_re.sub('\\n', text)

nginx_path.write_text(text)
PY" || err "Failed to repair ${REMOTE_NGINX_PATH}"

    ssh_run "rm -f /tmp/noeinsol-https-block.conf"
}

verify_remote_setup() {
    log "Checking nginx volume mount for ${REMOTE_DIR}..."
    has_remote_mount || err "Missing ${REMOTE_DIR} volume mount in ${REMOTE_COMPOSE_PATH}"

    log "Checking HTTPS server block for ${DOMAIN}..."
    has_remote_apex_block || err "Missing HTTPS server block for ${DOMAIN} in ${REMOTE_NGINX_PATH}"

    log "Checking nginx can see deployed site files..."
    ssh_run "cd ${APP_DIR} && docker compose exec nginx sh -lc 'test -f ${REMOTE_DIR}/index.html'" \
        || err "Docker nginx cannot access ${REMOTE_DIR}/index.html"
}

validate_nginx_container_config() {
    ssh_run "cd ${APP_DIR} && docker compose exec nginx nginx -t >/dev/null" \
        || err "Nginx config validation failed inside container."
}

ensure_container_can_see_landing_files() {
    if ssh_run "cd ${APP_DIR} && docker compose exec nginx sh -lc 'test -f ${REMOTE_DIR}/index.html'"; then
        log "Nginx container can read ${REMOTE_DIR}/index.html."
        return
    fi

    warn "Nginx container cannot read ${REMOTE_DIR}/index.html. Recreating nginx container..."
    ssh_run "cd ${APP_DIR} && docker compose up -d --force-recreate nginx" \
        || err "Failed to recreate nginx container."

    ssh_run "cd ${APP_DIR} && docker compose exec nginx sh -lc 'test -f ${REMOTE_DIR}/index.html'" \
        || err "Nginx container still cannot read ${REMOTE_DIR}/index.html after recreate."
}

reload_nginx() {
    validate_nginx_container_config
    log "Reloading Docker nginx..."
    ssh_run "cd ${APP_DIR} && docker compose exec nginx nginx -s reload >/dev/null" \
        || err "Nginx reload failed."
}

smoke_test_live_site() {
    log "Running smoke checks for https://${DOMAIN}..."
    curl -fsSI "https://${DOMAIN}" >/dev/null \
        || err "HTTPS HEAD check failed for ${DOMAIN}."

    local homepage
    homepage="$(curl -fsSL "https://${DOMAIN}")" \
        || err "Failed to fetch https://${DOMAIN} homepage."

    [[ "$homepage" == *"<title>Noein Solutions — Digital Delivery Consulting</title>"* ]] \
        || err "Homepage smoke check failed: expected homepage title marker."
    [[ "$homepage" == *'<link rel="canonical" href="https://noeinsolutions.com/">'* ]] \
        || err "Homepage smoke check failed: expected homepage canonical URL."
    [[ "$homepage" != *'<link rel="canonical" href="https://noeinsolutions.com/capsar.html">'* ]] \
        || err "Homepage smoke check failed: Capsar page is being served for the homepage."

    log "Smoke checks passed."
}

enforce_remote_runtime_state() {
    ensure_remote_compose_mount
    ensure_remote_nginx_blocks
    ensure_container_can_see_landing_files
    validate_nginx_container_config
}

deploy() {
    log "Deploying to ${DOMAIN} (${SERVER})..."
    require_local_templates
    run_local_preflight_checks

    log "Syncing files to ${REMOTE_DIR}..."
    deploy_files

    log "Setting ownership..."
    ssh_run "chown -R www-data:www-data ${REMOTE_DIR}"

    log "Enforcing remote runtime state..."
    enforce_remote_runtime_state

    reload_nginx
    smoke_test_live_site

    echo ""
    log "Deployed successfully to https://${DOMAIN}"
}

setup_server() {
    log "Starting first-time setup..."
    require_local_templates
    run_local_preflight_checks

    log "Creating site directory at ${REMOTE_DIR}..."
    ssh_run "mkdir -p ${REMOTE_DIR} && chown -R www-data:www-data ${REMOTE_DIR}"

    log "Deploying site files..."
    deploy_files

    log "Checking Docker nginx is running..."
    ssh_run "cd ${APP_DIR} && docker compose ps nginx >/dev/null" || err "Docker nginx not running — start the app first"

    log "Repairing remote compose/nginx configuration from templates..."
    ensure_remote_compose_mount
    ensure_remote_nginx_blocks
    ensure_container_can_see_landing_files

    verify_remote_setup

    log "Checking existing nginx server blocks..."
    ssh_run "cd ${APP_DIR} && docker compose exec nginx grep 'server_name' /etc/nginx/conf.d/default.conf"
    reload_nginx
    smoke_test_live_site

    echo ""
    log "Files deployed to ${REMOTE_DIR}"
    log ""
    log "Verified Docker nginx mount and HTTPS server block for ${DOMAIN}."
    log "Site should be live at https://${DOMAIN}"
}

case "${1:-}" in
    --check)
        require_local_templates
        run_local_preflight_checks
        ;;
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
        echo "Usage: bash deploy.sh [--check | --setup | --dry-run]"
        echo ""
        echo "  (no args)   Safe deploy: sync, repair, validate, and smoke-test"
        echo "  --check     Run local preflight checks only"
        echo "  --setup     First-time setup with repair and smoke checks"
        echo "  --dry-run   Show what files would be synced without deploying"
        exit 1
        ;;
esac
