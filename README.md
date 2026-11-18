# inland.co.id

Situs resmi **Inland — Jasa Arsitek, Kontraktor & Perawatan Gedung**, dibangun ulang dengan
[Astro](https://astro.build) dan di-hosting di Cloudflare Workers (static assets).
Rencana lengkap: [`docs/PLAN.md`](docs/PLAN.md).

## Menjalankan

```bash
npm install
npm run dev               # http://localhost:4321
npm run build             # build staging (noindex) + verifikasi URL lama
npm run build:production  # build produksi (indexable)
npm run preview           # sajikan dist/ lewat Wrangler (perilaku Cloudflare asli)
npm run check             # type check
```

## Struktur

| Lokasi | Isi |
|---|---|
| `src/content/pages/{id,en}/*.json` | Halaman (hero, SEO, section). `translationKey` menghubungkan ID ↔ EN |
| `src/content/posts/{id,en}/*.md` | Artikel |
| `src/assets/images/**` | Semua media (disimpan di repo, dioptimasi saat build ke WebP/AVIF responsif) |
| `src/data/site.json` | Data bisnis: NAP, WhatsApp, jam operasional, media sosial |
| `src/data/navigation.ts` | Menu utama |
| `src/i18n/` | Konfigurasi bahasa & string antarmuka |
| `src/pages/[...slug].astro` | Satu route untuk semua halaman & artikel, kedua bahasa |
| `migration/url-inventory.csv` | Daftar URL situs lama — build gagal jika ada yang hilang |
| `public/_headers`, `public/_redirects` | Cache, header keamanan, redirect URL warisan WordPress |

## Dashboard

Panduan lengkap: [`docs/DASHBOARD.md`](docs/DASHBOARD.md). Skema konten & label form: `src/content/schema.ts`.

## Aturan URL

- Bahasa Indonesia di root, sama persis dengan situs lama: `/tentang-inland/`
- Bahasa Inggris di `/en/` dengan slug terjemahan: `/en/about-inland/`
- Selalu diakhiri `/`
- Sitemap: `/sitemap_index.xml` → `page-sitemap.xml`, `post-sitemap.xml` (nama sama dengan Rank Math)

## Staging vs produksi

Hanya build dengan `PUBLIC_SITE_ENV=production` yang bisa diindeks. Build lain otomatis
`noindex` (meta robots + `X-Robots-Tag` + `robots.txt Disallow`) agar subdomain staging
tidak dianggap konten duplikat.
