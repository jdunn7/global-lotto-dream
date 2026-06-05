#!/bin/bash
set -e

# Lotto Global — Deploy to luxe-frankfurt VPS
# Usage: ./deploy.sh

VPS="luxe-frankfurt"
REMOTE_DIR="/var/www/lottoglobal"

echo "🚀 Deploying Lotto Global to ${VPS}..."

# Build first
npm run build

# Ensure remote directory exists and sync files
echo "📡 Syncing files..."
ssh "${VPS}" "mkdir -p ${REMOTE_DIR}"
rsync -avz --delete \
  --exclude='package.json' \
  --exclude='package-lock.json' \
  --exclude='node_modules' \
  --exclude='build.mjs' \
  --exclude='deploy.sh' \
  --exclude='Caddyfile' \
  --exclude='.git' \
  --exclude='.gitignore' \
  ./dist/ "${VPS}:${REMOTE_DIR}/"

# Reload Caddy
echo "🔄 Reloading Caddy..."
ssh "${VPS}" "caddy reload --config /etc/caddy/Caddyfile || caddy run --config /etc/caddy/Caddyfile &"

echo "✅ Deployed! http://$(ssh ${VPS} 'curl -s ifconfig.me')/"
