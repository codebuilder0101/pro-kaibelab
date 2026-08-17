#!/usr/bin/env bash
# Rebuild and redeploy the kaibelab.com static site.
# The site is served directly by nginx from ./dist — no Node process runs in prod.
# Requires Node 22 (installed via nvm) to build; nginx just serves the output.
set -euo pipefail

cd "$(dirname "$0")"

# Load Node 22 via nvm
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1090
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22 >/dev/null

corepack enable >/dev/null 2>&1 || true

echo "==> Installing dependencies (pnpm)"
pnpm install

echo "==> Building static site"
pnpm run build

echo "==> Reloading nginx"
nginx -t && systemctl reload nginx

echo "==> Done. Live at https://kaibelab.com"
