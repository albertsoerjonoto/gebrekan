# CLAUDE.md — gebrekan

Next.js 14 invitation app deployed on Vercel with a Neon Postgres backend.

## workflow

After completing any code changes: always create a PR, review the diff, and merge it — no need to ask for confirmation.

## toolchain already present

`vercel` and `neonctl` are installed as devDependencies. Always invoke via `npx`:

```bash
npx vercel <cmd>
npx neonctl <cmd>
```

Do **not** install them globally — the web sandbox doesn't persist `/opt/node22`.

## auth

Both CLIs require credentials. Read them from env (never from chat, never committed):

- `VERCEL_TOKEN` — https://vercel.com/account/tokens
- `NEON_API_KEY` — https://console.neon.tech/app/settings/api-keys

Order Claude should check:
1. `process.env.VERCEL_TOKEN` / `process.env.NEON_API_KEY` already set in the shell
2. `~/.claude/settings.json` `env` block (persists across web sessions)
3. `.env.local` (gitignored; last resort)

If **none** are present, stop and tell the user what's needed. Do not prompt for
interactive `vercel login` / `neonctl auth` — the web sandbox can't open a browser.

## non-interactive commands

```bash
# vercel
npx vercel --token "$VERCEL_TOKEN" whoami
npx vercel --token "$VERCEL_TOKEN" link --yes --project gebrekan
npx vercel --token "$VERCEL_TOKEN" env pull .env.local --yes
npx vercel --token "$VERCEL_TOKEN" deploy --prod --yes

# neon
npx neonctl --api-key "$NEON_API_KEY" projects list
npx neonctl --api-key "$NEON_API_KEY" projects create --name gebrekan --region-id aws-ap-southeast-1
npx neonctl --api-key "$NEON_API_KEY" connection-string --project-id <id>
```

`--yes` on Vercel skips confirmation prompts. `--api-key` on neonctl bypasses
OAuth entirely.

## project-specific

- Production URL: `https://gebrekan.vercel.app` (or the project's actual domain)
- Required env vars in Vercel: `DATABASE_URL` (auto from Neon integration),
  `ADMIN_TOKEN` (random string, gates `/inbox`), `RESEND_API_KEY` (owner
  confirmation emails), optional `EMAIL_FROM` (verified sender for Resend).
- Schema: `drizzle/schema.sql`. Apply once with `npm run db:init` (needs
  `DATABASE_URL` in env).
- Dev: `npm run dev`
- Build check: `npm run build` (run before declaring work done)

## do-not-touch: guest-forward email button

The `pesan` page has a `kirim juga ke albert ✉️` button that forwards the
submission to `albert.soerjonoto@gmail.com` (the guest recipient — see
`GUEST_EMAIL` in `lib/email.ts`). This send is **opt-in and must be
triggered by the human owner only**.

- **Never** click / submit / fetch-POST that button, and never call
  `/api/submit` with `notifyGuest: true` while testing, scripting, or
  end-to-end-verifying anything — that emails a real person.
- For verification, only exercise the auto-submit path (owner email to
  `albertsoerjonoto98@gmail.com`), or stub `RESEND_API_KEY` / the `fetch` to
  Resend out.
- The auto-submit on `/pesan` mount is safe: it sends only to the owner.
  Anything that would additionally hit `GUEST_EMAIL` is off-limits.

## data model

Two tables in Neon — see `lib/db.ts` `SCHEMA_SQL`:
- `sessions` — final answer + message + snapshot + timestamps
- `events` — audit log (every page view, every option change)

## known conventions

- `andrea` → `deedee_foodie`, `christine` → `weirdoalien` (used in
  `lib/options.ts` activity gating for SCBD weekdays).
- Color accent: bossy pink `#CE3D66` if user picked `udh HAHA` on page 1,
  otherwise french blue `#0072BB`.
- Form state persists in `localStorage` so back/forward never loses progress.
