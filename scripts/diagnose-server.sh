#!/usr/bin/env bash
# Run on the server to capture why the Node app may 503/404.
# Usage: ssh retreatyourself@s15256 'bash -s' < scripts/diagnose-server.sh
#   or:  ssh retreatyourself@s15256 "cd ~/apps/retreat-yourself-releases/c08b1c1-20260228233224 && bash" < scripts/diagnose-server.sh
set -e
RELEASE_ROOT="${1:-$HOME/apps/retreat-yourself-releases/c08b1c1-20260228233224}"
cd "$RELEASE_ROOT"
echo "=== Release root: $RELEASE_ROOT ==="
echo "=== Has src/app? ==="
ls -la src/app 2>/dev/null || echo "MISSING src/app"
echo "=== Has next.config.mjs? ==="
ls -la next.config.mjs 2>/dev/null || echo "MISSING next.config.mjs"
echo "=== node_modules (symlink?) ==="
ls -la node_modules 2>/dev/null || echo "MISSING node_modules"
echo "=== stderr.log (last 20 lines) ==="
tail -20 stderr.log 2>/dev/null || echo "(no stderr.log or empty)"
echo "=== Other log locations ==="
ls -la ~/nodejsapp/logs 2>/dev/null || echo "~/nodejsapp/logs not found"
echo "=== Manual start (8s) ==="
timeout 8 env PORT=3000 NODE_ENV=production node app.js 2>&1 || true
echo "=== Done ==="
