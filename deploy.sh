#!/usr/bin/env bash
set -euo pipefail

SERVER="root@77.42.70.26"
DOMAIN="noeinsolutions.com"
WWW_DOMAIN="www.noeinsolutions.com"
REMOTE_DIR="/var/www/noeinsol"
APP_DIR="/opt/bep-generator"
REMOTE_COMPOSE_PATH="${APP_DIR}/docker-compose.yml"
REMOTE_NGINX_CONF_DIR="${APP_DIR}/nginx/conf.d"
REMOTE_NOEINSOL_CONF="${REMOTE_NGINX_CONF_DIR}/noeinsol.conf"
REMOTE_DEFAULT_CONF="${REMOTE_NGINX_CONF_DIR}/default.conf"
REMOTE_OVERRIDE_PATH="${APP_DIR}/docker-compose.override.yml"
MOUNT_LINE="${REMOTE_DIR}:${REMOTE_DIR}:ro"
LOCAL_NGINX_TEMPLATE="deploy/templates/noeinsol.conf"
LOCAL_OVERRIDE_TEMPLATE="deploy/templates/noeinsol-compose-override.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC}  $1"; }
err()  { echo -e "${RED}[error]${NC} $1"; exit 1; }

LOCAL_PY_CMD=""
LOCAL_PY_ARGS=()

is_windows_shell() {
    case "$(uname -s 2>/dev/null || printf '')" in
        MINGW*|MSYS*|CYGWIN*) return 0 ;;
    esac

    return 1
}

EXCLUDES_RSYNC=(
    --exclude '.git'
    --exclude '.claude'
    --exclude '.cursor'
    --exclude '.env'
    --exclude '.env.*'
    --exclude 'deploy'
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
    --exclude='deploy'
    --exclude='deploy.sh'
    --exclude='nginx.conf'
    --exclude='landing-block.conf'
    --exclude='*.md'
)

resolve_local_python() {
    if [ -n "$LOCAL_PY_CMD" ]; then
        return 0
    fi

    if is_windows_shell; then
        if command -v py >/dev/null 2>&1 && py -3 -c "import sys" >/dev/null 2>&1; then
            LOCAL_PY_CMD="py"
            LOCAL_PY_ARGS=(-3)
        elif command -v python >/dev/null 2>&1 && python -c "import sys" >/dev/null 2>&1; then
            LOCAL_PY_CMD="python"
            LOCAL_PY_ARGS=()
        elif command -v python3 >/dev/null 2>&1 && python3 -c "import sys" >/dev/null 2>&1; then
            LOCAL_PY_CMD="python3"
            LOCAL_PY_ARGS=()
        else
            err "Python is required for preflight checks (py, python, or python3 not found)."
        fi

        return 0
    fi

    if command -v python3 >/dev/null 2>&1 && python3 -c "import sys" >/dev/null 2>&1; then
        LOCAL_PY_CMD="python3"
        LOCAL_PY_ARGS=()
    elif command -v py >/dev/null 2>&1 && py -3 -c "import sys" >/dev/null 2>&1; then
        LOCAL_PY_CMD="py"
        LOCAL_PY_ARGS=(-3)
    elif command -v python >/dev/null 2>&1 && python -c "import sys" >/dev/null 2>&1; then
        LOCAL_PY_CMD="python"
        LOCAL_PY_ARGS=()
    else
        err "Python is required for preflight checks (python3, py, or python not found)."
    fi
}

run_local_python() {
    resolve_local_python
    "$LOCAL_PY_CMD" "${LOCAL_PY_ARGS[@]}" "$@"
}

deploy_files() {
    if command -v rsync &> /dev/null; then
        rsync -avz --delete "${EXCLUDES_RSYNC[@]}" ./ "$SERVER:${REMOTE_DIR}/"
    else
        log "rsync not found, using tar+scp fallback..."
        local tmp_tar="/tmp/noeinsol_deploy.tar.gz"
        local remote_tar="/tmp/noeinsol_deploy.tar.gz"

        log "Creating deployment archive..."
        tar czf "$tmp_tar" "${EXCLUDES_TAR[@]}" -C . . \
            || err "Failed to create deployment archive."

        log "Uploading deployment archive to ${SERVER}..."
        scp -q "$tmp_tar" "$SERVER:${remote_tar}" \
            || err "Failed to upload deployment archive to ${SERVER}."

        log "Extracting deployment archive on remote host..."
        ssh "$SERVER" "mkdir -p ${REMOTE_DIR} && rm -rf ${REMOTE_DIR}/* && tar xzf ${remote_tar} -C ${REMOTE_DIR} && rm -f ${remote_tar}" \
            || err "Failed to extract deployment archive on ${SERVER}."

        rm -f "$tmp_tar"
    fi
}

require_local_templates() {
    [ -f "$LOCAL_NGINX_TEMPLATE" ] || err "Missing template: ${LOCAL_NGINX_TEMPLATE}"
    [ -f "$LOCAL_OVERRIDE_TEMPLATE" ] || err "Missing template: ${LOCAL_OVERRIDE_TEMPLATE}"
}

run_local_preflight_checks() {
    log "Running local preflight checks..."

    run_local_python - <<'PY' || exit 1
from html.parser import HTMLParser
from pathlib import Path
import sys

ROOT = Path(".").resolve()
REQUIRED_FILES = [
    "index.html",
    "about.html",
    "capsar.html",
    "bep-checklist.html",
    "privacy.html",
    "it/index.html",
    "it/about.html",
    "it/capsar.html",
    "it/bep-checklist.html",
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
print(f"[preflight] checking {len(html_files)} HTML files...")

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

def read_html(page: Path):
    try:
        return page.read_text(encoding="utf-8")
    except KeyboardInterrupt:
        print(
            f"[preflight] interrupted while reading {page.relative_to(ROOT)}",
            file=sys.stderr,
        )
        raise
    except OSError as exc:
        errors.append(f"{page.relative_to(ROOT)}: failed to read file ({exc})")
    except UnicodeDecodeError as exc:
        errors.append(f"{page.relative_to(ROOT)}: failed to decode utf-8 ({exc})")

    return None

for index, page in enumerate(html_files, start=1):
    print(f"[preflight] [{index}/{len(html_files)}] {page.relative_to(ROOT)}")
    content = read_html(page)
    if content is None:
        continue

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

get_local_homepage_title() {
    run_local_python - <<'PY'
from pathlib import Path
import re
import sys

content = Path('index.html').read_text(encoding='utf-8')
match = re.search(r'<title>(.*?)</title>', content, re.S)
if not match:
    sys.exit(1)

print(match.group(1).strip())
PY
}

get_local_homepage_canonical() {
    run_local_python - <<'PY'
from pathlib import Path
import re
import sys

content = Path('index.html').read_text(encoding='utf-8')
match = re.search(r'<link rel="canonical" href="([^"]+)">', content, re.S)
if not match:
    sys.exit(1)

print(match.group(1).strip())
PY
}

ssh_run() {
    ssh "$SERVER" "$1"
}

has_remote_override() {
    ssh_run "test -f '${REMOTE_OVERRIDE_PATH}' && grep -qF '${MOUNT_LINE}' '${REMOTE_OVERRIDE_PATH}' && grep -qF 'noeinsol.conf' '${REMOTE_OVERRIDE_PATH}'"
}

has_remote_noeinsol_conf() {
    ssh_run "test -f '${REMOTE_NOEINSOL_CONF}'"
}

ensure_remote_compose_override() {
    if has_remote_override; then
        log "docker-compose.override.yml present with landing mount."
        return
    fi

    log "Deploying docker-compose.override.yml to ${REMOTE_OVERRIDE_PATH}..."
    scp -q "${LOCAL_OVERRIDE_TEMPLATE}" "${SERVER}:${REMOTE_OVERRIDE_PATH}" \
        || err "Failed to upload docker-compose.override.yml"
}

ensure_remote_noeinsol_conf() {
    log "Deploying noeinsol.conf to ${REMOTE_NOEINSOL_CONF}..."
    scp -q "${LOCAL_NGINX_TEMPLATE}" "${SERVER}:${REMOTE_NOEINSOL_CONF}" \
        || err "Failed to upload noeinsol.conf"

    # One-time migration: remove legacy injected block and www redirect from default.conf
    cleanup_default_conf_legacy
}

cleanup_default_conf_legacy() {
    ssh_run "python3 - <<'PY'
from pathlib import Path
import re

default_conf = Path('${REMOTE_DEFAULT_CONF}')
if not default_conf.exists():
    exit(0)

text = default_conf.read_text()
original = text

# Remove managed block (between markers)
managed_start = '# BEGIN NOEINSOL LANDING BLOCK (managed by deploy.sh)'
managed_end = '# END NOEINSOL LANDING BLOCK (managed by deploy.sh)'
block_re = re.compile(re.escape(managed_start) + r'.*?' + re.escape(managed_end) + r'\\n?', re.S)
text = block_re.sub('', text)

# Remove legacy standalone www redirect block
legacy_www_re = re.compile(
    r'\\n?#\\s*www redirect[^\\n]*\\n'
    r'server\\s*\\{\\n'
    r'\\s*listen\\s+443\\s+ssl(?:\\s+http2)?;\\n'
    r'\\s*server_name\\s+www\\.noeinsolutions\\.com;\\n'
    r'[^}]*?'
    r'\\s*return\\s+301\\s+https://noeinsolutions\\.com[^\\n]*;\\n'
    r'\\}\\n?',
    re.S
)
text = legacy_www_re.sub('\\n', text)

# Clean up excessive blank lines
text = re.sub(r'\\n{3,}', '\\n\\n', text)

if text != original:
    default_conf.write_text(text)
    print('Cleaned legacy noeinsol blocks from default.conf')
else:
    print('No legacy noeinsol blocks found in default.conf')
PY"
}

normalize_remote_compose_config() {
    ssh_run "python3 - <<'PY'
from pathlib import Path
import re

compose_path = Path('${REMOTE_COMPOSE_PATH}')
if not compose_path.exists():
    raise SystemExit(0)

text = compose_path.read_text()
updated = re.sub(r'^(?:\ufeff)?version:\s*[^\n]*\n', '', text, count=1)

if updated != text:
    compose_path.write_text(updated)
    print('Removed obsolete version key from docker-compose.yml')
else:
    print('docker-compose.yml already omits obsolete version key')
PY"
}

normalize_remote_nginx_http2_syntax() {
    ssh_run "python3 - <<'PY'
from pathlib import Path

conf_dir = Path('${REMOTE_NGINX_CONF_DIR}')
if not conf_dir.exists():
    raise SystemExit(0)

changed_files = []

for conf_path in sorted(conf_dir.glob('*.conf')):
    text = conf_path.read_text()
    lines = text.splitlines()
    updated_lines = []
    changed = False

    for index, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('listen ') and 'http2' in stripped and stripped.endswith(';'):
            tokens = stripped[:-1].split()
            if 'http2' in tokens:
                indent = line[:len(line) - len(line.lstrip())]
                tokens.remove('http2')
                updated_lines.append(indent + ' '.join(tokens) + ';')

                next_non_empty = ''
                for candidate in lines[index + 1:]:
                    if candidate.strip():
                        next_non_empty = candidate.strip()
                        break

                if next_non_empty != 'http2 on;':
                    updated_lines.append(indent + 'http2 on;')

                changed = True
                continue

        updated_lines.append(line)

    updated = '\n'.join(updated_lines)
    if text.endswith('\n'):
        updated += '\n'

    if updated != text:
        conf_path.write_text(updated)
        changed_files.append(conf_path.name)

if changed_files:
    print('Normalized nginx http2 syntax in: ' + ', '.join(changed_files))
else:
    print('Nginx conf.d already uses standalone http2 directives')
PY"
}

verify_remote_setup() {
    log "Checking docker-compose.override.yml for ${REMOTE_DIR} mount..."
    has_remote_override || err "Missing override with ${REMOTE_DIR} mount at ${REMOTE_OVERRIDE_PATH}"

    log "Checking noeinsol.conf exists at ${REMOTE_NOEINSOL_CONF}..."
    has_remote_noeinsol_conf || err "Missing ${REMOTE_NOEINSOL_CONF}"

    log "Checking nginx can see deployed site files..."
    ssh_run "cd ${APP_DIR} && docker compose exec nginx sh -lc 'test -f ${REMOTE_DIR}/index.html'" \
        || err "Docker nginx cannot access ${REMOTE_DIR}/index.html"
}

validate_nginx_container_config() {
    ssh_run "cd ${APP_DIR} && docker compose exec nginx nginx -t >/dev/null" \
        || err "Nginx config validation failed inside container."
}

ensure_container_can_see_landing_files() {
    local needs_recreate=false

    if ! ssh_run "cd ${APP_DIR} && docker compose exec nginx sh -lc 'test -f ${REMOTE_DIR}/index.html'"; then
        warn "Nginx container cannot read ${REMOTE_DIR}/index.html."
        needs_recreate=true
    fi

    if ! ssh_run "cd ${APP_DIR} && docker compose exec nginx sh -lc 'test -f /etc/nginx/conf.d/noeinsol.conf'"; then
        warn "Nginx container cannot see /etc/nginx/conf.d/noeinsol.conf."
        needs_recreate=true
    fi

    if [ "$needs_recreate" = true ]; then
        log "Recreating nginx container to pick up volume mounts..."
        ssh_run "cd ${APP_DIR} && docker compose up -d --force-recreate nginx" \
            || err "Failed to recreate nginx container."

        ssh_run "cd ${APP_DIR} && docker compose exec nginx sh -lc 'test -f ${REMOTE_DIR}/index.html'" \
            || err "Nginx container still cannot read ${REMOTE_DIR}/index.html after recreate."
        ssh_run "cd ${APP_DIR} && docker compose exec nginx sh -lc 'test -f /etc/nginx/conf.d/noeinsol.conf'" \
            || err "Nginx container still cannot see noeinsol.conf after recreate."
    else
        log "Nginx container can read site files and noeinsol.conf."
    fi
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

    local homepage expected_title expected_canonical
    homepage="$(curl -fsSL "https://${DOMAIN}")" \
        || err "Failed to fetch https://${DOMAIN} homepage."
    expected_title="$(get_local_homepage_title)" \
        || err "Failed to read homepage title from local index.html."
    expected_canonical="$(get_local_homepage_canonical)" \
        || err "Failed to read homepage canonical URL from local index.html."

    printf '%s' "$homepage" | grep -F "<title>${expected_title}</title>" >/dev/null \
        || err "Homepage smoke check failed: expected homepage title marker."
    printf '%s' "$homepage" | grep -F "<link rel=\"canonical\" href=\"${expected_canonical}\">" >/dev/null \
        || err "Homepage smoke check failed: expected homepage canonical URL."
    [[ "$homepage" != *'<link rel="canonical" href="https://noeinsolutions.com/capsar.html">'* ]] \
        || err "Homepage smoke check failed: Capsar page is being served for the homepage."

    log "Smoke checks passed."
}

enforce_remote_runtime_state() {
    ensure_remote_compose_override
    ensure_remote_noeinsol_conf
    normalize_remote_compose_config
    normalize_remote_nginx_http2_syntax
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

    log "Deploying standalone nginx config and compose override..."
    enforce_remote_runtime_state

    verify_remote_setup

    log "Checking existing nginx server blocks..."
    ssh_run "cd ${APP_DIR} && docker compose exec nginx grep -r 'server_name' /etc/nginx/conf.d/"
    reload_nginx
    smoke_test_live_site

    echo ""
    log "Files deployed to ${REMOTE_DIR}"
    log ""
    log "Verified standalone noeinsol.conf and compose override for ${DOMAIN}."
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
