# gebrekan

undangan. next.js + neon postgres + vercel.

## live

https://gebrekan.vercel.app

## flow

1. `/` — *udh berani ketemu berdua lagi belom?* (reverse pyramid, 5 pilihan, bossy pink → french blue)
2. `/kapan` — *wow. kapan u free* / *gpp. kapan u free* (6 pilihan hari, AM/PM dengan tema siang/malam)
3. `/lokasi` — hanya kalau dia pilih sabtu/minggu. bekasi hanya kalau minggu.
4. `/siapa` — hanya kalau dia **tidak** pilih `udh HAHA`. multi-select. opsi bergantung hari + lokasi.
5. `/ngapain` — activity list bergantung ke seluruh kombinasi sebelumnya.
6. `/pesan` — review + pesan bebas + submit.
7. `/done` — konfirmasi.
8. `/inbox` — dashboard buat lo (token-gated).

Dia bisa balik/lanjut bebas; state di-persist ke `localStorage`. Setiap perubahan di-push ke `/api/track` (debounced 250 ms, dengan fallback `sendBeacon` ketika halaman ditutup) supaya lo bisa lihat dia pindah-pindah pilihan.

## deploy

butuh akun GitHub + Vercel + Neon (semua gratis). estimasi 3 menit.

### 1. push repo ke GitHub

Repo di `albertsoerjonoto/gebrekan`. Deploy dari `main`.

### 2. import ke Vercel

1. https://vercel.com/new → pilih `albertsoerjonoto/gebrekan`
2. Framework preset: **Next.js** (auto-detected)
3. Build/Output settings: biarkan default
4. **Jangan klik Deploy dulu** — set env var dulu di step 3.

### 3. tambahkan Neon via Vercel Integrations Marketplace

Ini cara paling cepat — `DATABASE_URL` di-provision otomatis, tidak perlu copy-paste.

1. Masih di halaman project Vercel, masuk ke **Storage** tab (atau buka https://vercel.com/marketplace/neon)
2. Klik **Create Database** → pilih **Neon Postgres**
3. Pilih region terdekat (Singapore untuk Jakarta → `ap-southeast-1`)
4. Connect ke project `gebrekan`. Vercel otomatis inject env vars:
   - `DATABASE_URL` (yang kita pakai)
   - `DATABASE_URL_UNPOOLED`, `PGHOST`, dsb. (gak dipakai tapi aman)

### 4. tambahkan `ADMIN_TOKEN`

1. Vercel project → **Settings** → **Environment Variables**
2. Tambahkan `ADMIN_TOKEN` = string random apapun (contoh: `openssl rand -hex 16`)
3. Apply ke Production + Preview + Development.

### 5. init schema

Ada dua opsi.

**Opsi A (paling cepat) — jalanin lokal sekali:**

```bash
# ambil DATABASE_URL dari Neon console atau: `vercel env pull .env.local`
vercel env pull .env.local
npm install
npm run db:init
```

**Opsi B — Neon SQL Editor:**

Buka Neon console → project → SQL Editor → paste isi [`lib/db.ts`](./lib/db.ts) bagian `SCHEMA_SQL` (atau `drizzle/schema.sql`) dan run.

### 6. deploy

Klik **Deploy** di Vercel. Build selesai sekitar 1–2 menit.

### shortcut: one-shot script

Kalau udah punya `VERCEL_TOKEN` + `NEON_API_KEY` (set di env atau di
`~/.claude/settings.json`):

```bash
bash scripts/deploy.sh
```

Script ini idempotent — aman di-run ulang. Dia bakal:
1. Cari atau bikin Neon project `gebrekan` di Singapore region.
2. Ambil `DATABASE_URL` (pooled) dari Neon.
3. Apply schema via `npm run db:init`.
4. Link repo ke Vercel project `gebrekan`.
5. Set `DATABASE_URL` + `ADMIN_TOKEN` env var di Vercel (production+preview+dev).
6. Deploy ke production.
7. Print URL + `ADMIN_TOKEN`.

### 7. kirim linknya

- Production URL: `https://<project>.vercel.app/`
- Inbox lo: `https://<project>.vercel.app/inbox` (masukin `ADMIN_TOKEN` yang lo set tadi)

## dev lokal

```bash
cp .env.example .env.local
# isi DATABASE_URL (dari Neon) + ADMIN_TOKEN
npm install
npm run db:init
npm run dev
```

Buka http://localhost:3000/.

## data model

Dua tabel:

- `sessions` — satu row per pengunjung. Kolom penting: `final` (jsonb, isi jawaban terakhir), `message` (pesan dia), `submitted_at` (null = belum submit), `snapshot` (jsonb, state terakhir saat dia lagi ngisi, di-update tiap flush).
- `events` — audit log. Tiap page view dan tiap perubahan pilihan masuk ke sini. Berguna kalau lo mau lihat dia pindah-pindah pilihan.

Schema: lihat `SCHEMA_SQL` di [`lib/db.ts`](./lib/db.ts).

## tweaks

- Ganti pemetaan "andrea/christine" → invitee mana: [`lib/options.ts`](./lib/options.ts) cari `hasAndreaOrChristine`.
- Nambah/ngurangin opsi: semua di [`lib/options.ts`](./lib/options.ts).
- Warna: `COLORS` di [`lib/options.ts`](./lib/options.ts).
- Copy page: masing-masing `app/*/page.tsx`.
