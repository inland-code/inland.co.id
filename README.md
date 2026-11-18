# inland.co.id

Situs resmi **Inland — Jasa Arsitek, Kontraktor & Perawatan Gedung**: Astro (statis) + Cloudflare Workers,
dengan dashboard pemilik di `/admin`. Rencana & status: [`docs/PLAN.md`](docs/PLAN.md) ·
Dashboard: [`docs/DASHBOARD.md`](docs/DASHBOARD.md).

## Perintah

```bash
npm install
npm run dev               # http://localhost:4321
npm run build             # build staging (noindex) + verifikasi URL lama + audit SEO
npm run build:production  # build produksi (indexable)
npm run preview           # sajikan dist/ + Worker lewat Wrangler
npm run check             # type check situs + Worker
npm test                  # unit test Worker (formulir, login, izin path)
npm run format            # Prettier
```

Deploy: setiap push ke `main` otomatis di-build & di-deploy oleh **Cloudflare Workers Builds**.
GitHub Actions hanya menjalankan pemeriksaan (format, type check, test, build).

## Struktur

| Lokasi                             | Isi                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/content/schema.ts`            | Skema konten (zod) — dipakai build **dan** form dashboard                                        |
| `src/content/pages/{id,en}/*.json` | Halaman: SEO, hero, section                                                                      |
| `src/content/posts/{id,en}/*.md`   | Artikel                                                                                          |
| `src/assets/images/**`             | Semua media (di repo), dioptimasi ke AVIF/WebP saat build                                        |
| `src/data/site.json`               | Data bisnis: NAP, WhatsApp, jam buka, media sosial                                               |
| `src/pages/[...slug].astro`        | Satu route untuk semua halaman & artikel → `src/views/{PageView,PostView}.astro`                 |
| `src/components/sections/`         | Komponen section (hero, kartu, akordeon, tabel, FAQ, galeri, kontak, …)                          |
| `src/lib/`                         | Routing & i18n, SEO/JSON-LD, sitemap, Markdown untuk LLM, gambar OG                              |
| `src/pages/*.ts`                   | `sitemap_index.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `feed.xml`, `/og/*.jpg`, `/*.md` |
| `src/admin/`                       | Dashboard (Preact, hanya dimuat di `/admin`)                                                     |
| `worker/`                          | Cloudflare Worker: formulir kontak (D1 → WhatsApp), login GitHub, API dashboard                  |
| `migrations/`                      | Skema database D1                                                                                |
| `scripts/`                         | Pasca-build: CSP + noindex staging, verifikasi URL lama, audit SEO                               |
| `migration/url-inventory.csv`      | 40 URL situs WordPress lama — build gagal jika ada yang hilang                                   |
| `tests/`                           | Unit test Worker (Vitest)                                                                        |

## Aturan URL

- Bahasa Indonesia di root, sama persis dengan situs lama: `/tentang-inland/`
- Bahasa Inggris di `/en/` dengan slug terjemahan: `/en/about-inland/`
- Selalu diakhiri `/`; sitemap: `/sitemap_index.xml` (nama sama dengan Rank Math)

## Staging vs produksi

Hanya build dengan `PUBLIC_SITE_ENV=production` yang bisa diindeks. Build lain otomatis `noindex`
(meta robots + `X-Robots-Tag` + `robots.txt Disallow`).
