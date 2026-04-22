#!/usr/bin/env bash
#
# One-shot deploy: Neon project -> schema -> Vercel link -> env vars -> deploy.
# Idempotent where possible; safe to re-run.
#
# Requires:
#   VERCEL_TOKEN  (env or from ~/.claude/settings.json)
#   NEON_API_KEY  (env or from ~/.claude/settings.json)
#   ADMIN_TOKEN   (optional; auto-generated if missing)
#
# Run: bash scripts/deploy.sh

set -euo pipefail

# ---------- config ----------
PROJECT_SLUG="${PROJECT_SLUG:-gebrekan}"
NEON_REGION="${NEON_REGION:-aws-ap-southeast-1}"   # Singapore, closest to Jakarta
VERCEL_SCOPE="${VERCEL_SCOPE:-}"                   # team slug; leave empty for personal

# ---------- load tokens from claude settings if not in env ----------
if [[ -z "${VERCEL_TOKEN:-}" || -z "${NEON_API_KEY:-}" ]] && [[ -r "${HOME}/.claude/settings.json" ]]; then
  if command -v jq >/dev/null; then
    VERCEL_TOKEN="${VERCEL_TOKEN:-$(jq -r '.env.VERCEL_TOKEN // empty' < "${HOME}/.claude/settings.json")}"
    NEON_API_KEY="${NEON_API_KEY:-$(jq -r '.env.NEON_API_KEY // empty' < "${HOME}/.claude/settings.json")}"
  else
    echo "note: install 'jq' to auto-load tokens from ~/.claude/settings.json" >&2
  fi
fi

: "${VERCEL_TOKEN:?set VERCEL_TOKEN (https://vercel.com/account/tokens)}"
: "${NEON_API_KEY:?set NEON_API_KEY (https://console.neon.tech/app/settings/api-keys)}"
export VERCEL_TOKEN NEON_API_KEY

ADMIN_TOKEN="${ADMIN_TOKEN:-$(openssl rand -hex 16 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 32)}"

# ---------- prereqs ----------
cd "$(dirname "$0")/.."
if [[ ! -d node_modules ]]; then
  echo "→ installing deps"
  npm install --no-audit --no-fund --loglevel=error
fi

VERCEL="npx --yes vercel --token $VERCEL_TOKEN"
NEON="npx --yes neonctl --api-key $NEON_API_KEY --output json"

# ---------- neon: find or create project ----------
echo "→ finding or creating Neon project '$PROJECT_SLUG'"
NEON_PROJECT_ID="$($NEON projects list 2>/dev/null | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
    const rows=JSON.parse(d).projects || [];
    const hit=rows.find(p=>p.name==='$PROJECT_SLUG');
    if(hit) console.log(hit.id);
  })" || true)"

if [[ -z "$NEON_PROJECT_ID" ]]; then
  echo "  creating new Neon project in $NEON_REGION"
  NEON_PROJECT_ID="$($NEON projects create --name "$PROJECT_SLUG" --region-id "$NEON_REGION" | node -e "
    let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
      console.log(JSON.parse(d).project.id);
    })")"
fi
echo "  Neon project id: $NEON_PROJECT_ID"

# ---------- neon: get pooled connection string ----------
DATABASE_URL="$($NEON connection-string --project-id "$NEON_PROJECT_ID" --pooled 2>/dev/null | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
    try { const o=JSON.parse(d); console.log(o.connection_uri || o.uri || d.trim()); }
    catch { console.log(d.trim()); }
  })")"
if [[ -z "$DATABASE_URL" || "$DATABASE_URL" == "null" ]]; then
  # fallback: older neonctl versions just print the string
  DATABASE_URL="$(npx --yes neonctl --api-key "$NEON_API_KEY" connection-string --project-id "$NEON_PROJECT_ID" --pooled | tail -n1)"
fi
[[ -n "$DATABASE_URL" ]] || { echo "failed to read connection string"; exit 1; }

# ---------- schema ----------
echo "→ applying schema"
DATABASE_URL="$DATABASE_URL" npx --yes tsx scripts/init-db.ts

# ---------- vercel: link or create project ----------
echo "→ linking Vercel project '$PROJECT_SLUG'"
if [[ -n "$VERCEL_SCOPE" ]]; then
  $VERCEL link --yes --project "$PROJECT_SLUG" --scope "$VERCEL_SCOPE" || true
else
  $VERCEL link --yes --project "$PROJECT_SLUG" || true
fi

# ---------- vercel: set env vars (overwrite any existing) ----------
set_env() {
  local key="$1" val="$2"
  for env in production preview development; do
    $VERCEL env rm "$key" "$env" --yes >/dev/null 2>&1 || true
    printf '%s' "$val" | $VERCEL env add "$key" "$env" >/dev/null
  done
  echo "  set $key for production/preview/development"
}

echo "→ setting env vars"
set_env DATABASE_URL "$DATABASE_URL"
set_env ADMIN_TOKEN  "$ADMIN_TOKEN"

# ---------- deploy ----------
echo "→ deploying to production"
DEPLOY_URL="$($VERCEL deploy --prod --yes | tail -n1)"

echo
echo "✓ done"
echo "  app:   $DEPLOY_URL"
echo "  inbox: $DEPLOY_URL/inbox"
echo "  ADMIN_TOKEN: $ADMIN_TOKEN"
