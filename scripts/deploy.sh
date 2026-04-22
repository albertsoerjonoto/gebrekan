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

VERCEL_BASE="npx --yes vercel --token $VERCEL_TOKEN"
NEON="npx --yes neonctl --api-key $NEON_API_KEY --output json"

# ---------- vercel: resolve scope (non-interactive when account has teams) ----------
if [[ -z "$VERCEL_SCOPE" ]]; then
  # teams list emits a plain-text table to stderr; redirect 2>&1 so node sees it.
  VERCEL_SCOPE="$($VERCEL_BASE teams list 2>&1 | node -e "
    let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
      const lines=d.split('\n').map(l=>l.trim()).filter(Boolean);
      const headerIdx=lines.findIndex(l=>/^id\s/i.test(l));
      if(headerIdx>=0 && lines[headerIdx+1]) console.log(lines[headerIdx+1].split(/\s+/)[0]);
    })" || true)"
fi
VERCEL="$VERCEL_BASE"
[[ -n "$VERCEL_SCOPE" ]] && VERCEL="$VERCEL_BASE --scope $VERCEL_SCOPE" && echo "  using Vercel scope: $VERCEL_SCOPE"

# ---------- neon: resolve org (non-interactive when account has orgs) ----------
if [[ -z "${NEON_ORG_ID:-}" ]]; then
  NEON_ORG_ID="$($NEON orgs list 2>/dev/null | node -e "
    let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
      try { const rows=JSON.parse(d); if(Array.isArray(rows) && rows.length===1) console.log(rows[0].id); }
      catch {}
    })" || true)"
fi
NEON_ORG_FLAG=""
[[ -n "$NEON_ORG_ID" ]] && NEON_ORG_FLAG="--org-id $NEON_ORG_ID"
[[ -n "$NEON_ORG_ID" ]] && echo "  using Neon org: $NEON_ORG_ID"

# ---------- neon: find or create project ----------
echo "→ finding or creating Neon project '$PROJECT_SLUG'"
NEON_PROJECT_ID="$($NEON projects list $NEON_ORG_FLAG 2>/dev/null | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
    try {
      const parsed=JSON.parse(d);
      const rows=Array.isArray(parsed) ? parsed : (parsed.projects || []);
      const hit=rows.find(p=>p.name==='$PROJECT_SLUG');
      if(hit) console.log(hit.id);
    } catch {}
  })" || true)"

if [[ -z "$NEON_PROJECT_ID" ]]; then
  echo "  creating new Neon project in $NEON_REGION"
  NEON_PROJECT_ID="$($NEON projects create --name "$PROJECT_SLUG" --region-id "$NEON_REGION" $NEON_ORG_FLAG | node -e "
    let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
      const o=JSON.parse(d);
      console.log((o.project && o.project.id) || o.id);
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
$VERCEL link --yes --project "$PROJECT_SLUG" || true

# ---------- vercel: set env vars (overwrite any existing) ----------
GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"

set_env() {
  local key="$1" val="$2"
  # production + development accept --value/--yes directly; preview needs a git branch.
  for env in production development; do
    $VERCEL env rm "$key" "$env" --yes >/dev/null 2>&1 || true
    $VERCEL env add "$key" "$env" --value "$val" --yes >/dev/null 2>&1
  done
  if [[ -n "$GIT_BRANCH" && "$GIT_BRANCH" != "HEAD" ]]; then
    $VERCEL env rm "$key" preview "$GIT_BRANCH" --yes >/dev/null 2>&1 || true
    $VERCEL env add "$key" preview "$GIT_BRANCH" --value "$val" --yes >/dev/null 2>&1 || true
  fi
  echo "  set $key for production/development${GIT_BRANCH:+/preview@$GIT_BRANCH}"
}

echo "→ setting env vars"
set_env DATABASE_URL "$DATABASE_URL"
set_env ADMIN_TOKEN  "$ADMIN_TOKEN"

# ---------- deploy ----------
echo "→ deploying to production"
DEPLOY_LOG="$($VERCEL deploy --prod --yes 2>&1)"
echo "$DEPLOY_LOG"
# Prefer the aliased (stable) URL; fall back to the deployment URL.
DEPLOY_URL="$(printf '%s\n' "$DEPLOY_LOG" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
    const lines=d.split('\n');
    const alias=lines.map(l=>l.match(/Aliased:\s*(https:\/\/\S+)/)).find(Boolean);
    const prod=lines.map(l=>l.match(/Production:\s*(https:\/\/\S+)/)).find(Boolean);
    const pick=(alias||prod);
    if(pick) console.log(pick[1]);
  })")"

echo
echo "✓ done"
echo "  app:   $DEPLOY_URL"
echo "  inbox: $DEPLOY_URL/inbox?token=$ADMIN_TOKEN"
echo "  ADMIN_TOKEN: $ADMIN_TOKEN"
