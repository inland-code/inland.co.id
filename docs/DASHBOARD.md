# Dashboard Inland (`/admin`)

Dashboard untuk pemilik situs: mengedit halaman, menulis artikel, mengelola media,
membaca pesan formulir kontak, dan mengubah data bisnis — tanpa menyentuh kode.

## Cara kerja

```
Browser (/admin, hanya pemilik)
   │  Cloudflare Access (login OTP email)
   ▼
Worker /api/admin/*  ── verifikasi token Access + email pemilik
   ├─ baca/tulis konten ──► GitHub API (commit ke branch main)
   │                          └─► GitHub Actions: build + audit SEO + deploy (±1–3 menit)
   └─ pesan masuk ─────────► Cloudflare D1
```

- **Semua konten & media tetap di repo.** Setiap "Simpan" = satu commit, jadi ada riwayat dan bisa di-rollback.
- **Build adalah pengaman terakhir.** Jika konten tidak valid, build gagal dan situs live tidak berubah.
  Dashboard juga memvalidasi dengan skema yang sama sebelum menyimpan.
- **Halaman publik tetap 0 KB JavaScript.** Kode dashboard hanya dimuat di `/admin`.

| Menu | Fungsi |
|---|---|
| Ringkasan | Jumlah pesan baru, status build & deploy terakhir |
| Halaman | Edit SEO, hero, dan section (tambah/hapus/urutkan) semua halaman ID & EN |
| Artikel | Buat, edit (Markdown + pratinjau), hapus artikel; FAQ untuk rich result |
| Media | Unggah gambar (otomatis dikompres maks 2560px/WebP di browser), salin path |
| Pesan Masuk | Riwayat formulir kontak, ubah status, balas langsung via WhatsApp |
| Data Bisnis | Nama, telepon, WhatsApp, alamat, jam buka, media sosial |
| Redirect | Kelola `public/_redirects` (301) dengan validasi format |

## Setup (sekali saja)

### 1. Database D1 (pesan formulir)
```bash
npx wrangler d1 create inland-db
# salin database_id ke wrangler.jsonc (blok d1_databases), hapus komentarnya
npm run db:migrate
```

### 2. Token GitHub (fine-grained, khusus repo ini)
GitHub → Settings → Developer settings → **Fine-grained personal access tokens** → Generate new token
- Resource owner: `inland-code` · Repository access: **Only select repositories** → `inland.co.id`
- Permissions: **Contents: Read and write**, **Actions: Read-only** (Metadata otomatis read-only)
- Expiration: maks. 1 tahun — catat tanggalnya untuk diperpanjang.

```bash
npx wrangler secret put GITHUB_TOKEN   # tempel token
npx wrangler secret put ADMIN_EMAIL    # email pemilik yang boleh login
```

### 3. Cloudflare Access (login pemilik)
Zero Trust → Settings → Authentication: aktifkan **One-time PIN**.

**Selama staging (`*.workers.dev`):** Workers & Pages → `inland-co-id` → Settings → Domains & Routes →
aktifkan **Cloudflare Access** pada workers.dev. Seluruh staging hanya bisa dibuka pemilik (aman, staging memang noindex).

**Setelah domain `inland.co.id` tersambung:** Zero Trust → Access → Applications → Add → *Self-hosted*
- Destinations: `inland.co.id/admin` dan `inland.co.id/api/admin`
- Policy: Allow → Emails → email pemilik

Lalu salin **Application Audience (AUD) tag** dan nama tim, isi sebagai variable Worker:
`ACCESS_TEAM_DOMAIN` = `<tim>.cloudflareaccess.com`, `ACCESS_AUD` = `<AUD>`
(di `wrangler.jsonc` → `vars`, atau Settings → Variables di dashboard Cloudflare).

### 4. Deploy otomatis dari GitHub
Repo → Settings → Secrets and variables → Actions:
- Secrets: `CLOUDFLARE_API_TOKEN` (template *Edit Cloudflare Workers*), `CLOUDFLARE_ACCOUNT_ID`
- Variables: `DEPLOY_ENABLED` = `true`

Dashboard meng-commit ke branch `main`; workflow CI membangun & men-deploy setiap push ke `main`.

## Pengembangan lokal
```bash
npm run build
npx wrangler dev --var ADMIN_DEV_BYPASS:1 --var GITHUB_TOKEN:<token-uji>
# buka http://localhost:8787/admin/
```
`ADMIN_DEV_BYPASS` hanya berlaku untuk host `localhost`/`127.0.0.1`, tidak pernah di produksi.

## Keamanan
- API menolak semua permintaan tanpa token Access yang valid (tanda tangan, audience, kedaluwarsa, email pemilik).
- Permintaan yang mengubah data wajib dari origin yang sama (anti-CSRF).
- Hanya path konten tertentu yang bisa ditulis: `src/content/**`, `src/assets/images/**`, `src/data/site.json`, `public/_redirects`.
- Penyimpanan memakai `sha` file sehingga tidak menimpa perubahan lain secara diam-diam (konflik → pesan error).
