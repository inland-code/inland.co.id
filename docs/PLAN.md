# Rencana Rebuild inland.co.id — Astro + Cloudflare

Status: **Fase 2 berjalan** · Terakhir diperbarui: 2026-11-18

## Keputusan yang sudah diambil

| # | Topik | Keputusan |
|---|---|---|
| 1 | Slug Bahasa Inggris | **Diterjemahkan** (contoh: `/en/about-us/`, `/en/services/interior-design/`), dihubungkan via `hreflang` |
| 2 | Sumber konten | **Dibuat dari nol berdasarkan screenshot** yang diberikan; foto di-crop dari screenshot. Slug URL dari sitemap Rank Math asli (lihat `migration/url-inventory.csv`) |
| 3 | Penyimpanan media | **Di repo** (`src/assets/`), dioptimasi saat build — bukan di Cloudflare R2 |
| 4 | URL Bahasa Indonesia | **Sama persis** dengan situs WordPress saat ini, termasuk trailing slash, di root tanpa prefix |
| 5 | Formulir kontak | **Diarahkan ke WhatsApp** (pesan terisi otomatis) **dan tercatat di dashboard** (Worker `/api/contact` → Cloudflare D1 → redirect `wa.me`). D1 hanya untuk data formulir; media tetap di repo |
| 6 | Font | **Roboto** (self-hosted, variable woff2) |
| 7 | DNS domain | Nameserver **belum** di Cloudflare. Pengembangan & uji di subdomain `*.workers.dev` (noindex); domain disambungkan di Fase 9 setelah semua selesai |
| 8 | Pengguna dashboard | **Hanya pemilik** (1 akun email). Login via Cloudflare Access (OTP email), tanpa sistem password sendiri |

---

## A. Arsitektur

```
[Dashboard /admin]  →  [API Worker Cloudflare]  →  commit ke GitHub (konten + media)
                                                        ↓
                                     GitHub Actions: build Astro + optimasi gambar
                                                        ↓
                                     Deploy ke Cloudflare Workers (static assets)
```

- Semua halaman publik **di-prerender jadi HTML statis**: tanpa query database per pengunjung, dilayani dari edge.
- Hanya 2 hal yang dinamis (Worker): **API dashboard** dan **endpoint formulir kontak**.
- Konten = file di repo: artikel Markdown/MDX, halaman & pengaturan JSON/YAML, media di `src/assets/`. Riwayat & rollback via Git.
- Alur publish dashboard: Simpan → commit → build otomatis → live ±1–3 menit.

### Aturan media di repo
- Batas: GitHub 100 MB/file (repo idealnya < 1 GB); Cloudflare 25 MiB/aset.
- Dashboard mengompres gambar sebelum commit (maks 2560px). Repo menyimpan 1 master; Astro membuat AVIF/WebP multi-ukuran saat build.
- Tanpa Git LFS. Build di **GitHub Actions** dengan cache hasil optimasi gambar.
- Video besar → embed YouTube.

### Kebijakan URL
- `trailingSlash: 'always'`, `build.format: 'directory'`.
- ID di root, EN di `/en/` dengan slug terjemahan; peta pasangan slug ID↔EN disimpan di frontmatter (`translationKey`).
- `/sitemap_index.xml` tetap tersedia di path yang sama.
- 301 redirect untuk URL warisan WordPress: `/wp-content/uploads/...`, `/category/...`, `/author/...`, `/feed/`, `/page/N/`, `?p=ID`.
- Script verifikasi: semua URL sitemap lama harus ada di build baru (target 0 hilang).

---

## B. Tahapan

### Fase 0 — Ekstraksi konten ✅ (dari screenshot)
1. ✅ Inventaris URL `migration/url-inventory.csv`: 40 URL (35 halaman + 5 artikel) dari sitemap Rank Math asli, semuanya terverifikasi.
   - 20 halaman tidak ada di screenshot (landing renovasi per kota/jenis, landing pembersihan kaca, dll.) → konten sementara ditulis ulang, ditandai `contentStatus: draft`, hanya versi ID.
2. ✅ 28 foto di-crop dari screenshot ke `src/assets/images/`.
3. ✅ Warna brand diambil dari piksel: oranye `#EF8619` → coklat `#69431F`, navy `#001F54`.
4. ✅ Logo resmi dari pemilik (`src/assets/brand/logo-inland.png`) + favicon/ikon dari bagian simbolnya.
   - ✅ WhatsApp resmi `+62 856 770 0883`, Instagram `@inland_id`.
5. ⏳ Teks lengkap per section ditranskripsi dari screenshot di Fase 3.

### Fase 1 — Fondasi proyek ✅
- Astro terbaru, TypeScript, Tailwind v4, Content Collections dengan skema tervalidasi.
- i18n (ID tanpa prefix, EN `/en/` slug terjemahan).
- CI GitHub Actions: lint, type-check, build, cek link rusak, verifikasi URL.
- Deploy Cloudflare Workers static assets; staging dengan `X-Robots-Tag: noindex`.

### Fase 2 — Desain sistem & mockup (perlu persetujuan)
Identitas & warna tetap, tampilan dimodernkan:
- Header sticky transparan → solid saat scroll; menu mobile rapi.
- Hero: tipografi tegas, angka kepercayaan (tahun pengalaman, jumlah proyek), badge layanan.
- Kartu layanan: ikon line konsisten, hover halus.
- Galeri: grid + lightbox, filter kategori, before/after renovasi.
- Tombol WhatsApp melayang, testimoni dengan rating, footer lengkap (NAP, jam buka, peta, sosial).
- Artikel: daftar isi otomatis, waktu baca, breadcrumb, artikel terkait, kotak penulis (E-E-A-T).
- Mockup Beranda dulu → disetujui → diterapkan ke semua halaman.

### Fase 3 — Pembangunan halaman
- Beranda, Tentang Kami, Layanan Kami, Kontak, Artikel (list + detail), Galeri.
- Layanan: Desain Interior, Desain Rumah, Pembangunan Rumah, Renovasi Rumah, Pembersihan Kaca Gedung, halaman Sealant.
- Accordion `<details>` native (tanpa JS), carousel CSS scroll-snap (tanpa library).
- Formulir kontak: Worker + Cloudflare Turnstile → simpan ke D1 → buka WhatsApp dengan pesan terisi (nama, kebutuhan, pesan). Riwayat tampil di dashboard.
- Perbaikan konten: judul salah di halaman Renovasi, tipografi halaman Sealant, konsistensi nomor telepon (NAP).

### Fase 4 — SEO lanjutan
- Meta, canonical, `hreflang` (id, en, x-default), Open Graph, Twitter Card.
- Gambar OG otomatis per halaman/artikel saat build.
- JSON-LD: `Organization`, `LocalBusiness`/`GeneralContractor`, `WebSite`, `Service`, `Article`, `BreadcrumbList`, `FAQPage`, `ImageObject`.
- Sitemap index terpisah per tipe & bahasa, robots.txt, RSS.
- Audit otomatis di CI: duplikat judul/deskripsi, alt kosong, link rusak.

### Fase 5 — GEO / optimasi LLM
- `/llms.txt` & `/llms-full.txt` otomatis dari konten.
- Versi Markdown tiap halaman (`/halaman/index.md`).
- Blok fakta entitas konsisten (siapa, layanan, area Jabodetabek, kontak).
- FAQ di tiap halaman layanan, tanggal "terakhir diperbarui", profil penulis.
- Izinkan bot AI (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) di robots.txt **dan** setting Cloudflare ("Block AI bots" harus dinonaktifkan).

### Fase 6 — Performa & cache
- Target: Lighthouse 100×4, LCP < 1,2 dtk, CLS 0, JS ≈ 0 di halaman publik.
- Font self-hosted woff2 subset + preload; CSS kritis inline.
- Gambar AVIF/WebP, `srcset`, width/height eksplisit, hero `fetchpriority="high"`, lainnya lazy.
- Speculation Rules API untuk prefetch.
- Cache: `/_astro/*` immutable 1 tahun; HTML di-cache di edge dengan purge otomatis per deploy; Early Hints, HTTP/3, Brotli, Tiered Cache.

### Fase 7 — Dashboard custom `/admin`
- Login via Cloudflare Access (Zero Trust), policy hanya untuk email pemilik.
- Menu "Pesan Masuk": riwayat formulir kontak dari D1 (status: baru / dihubungi / selesai).
- Editor halaman berbasis field (layout terkunci), editor artikel (rich text, kategori, gambar unggulan, jadwal terbit).
- Media library: upload, kompres otomatis, alt text, peringatan ukuran.
- Panel SEO per halaman + preview Google/WhatsApp.
- Editor terjemahan ID/EN berdampingan (+ opsi draf terjemahan AI).
- Pengaturan global: NAP, WhatsApp, sosial media, menu, redirect manager.
- Draft (branch) → URL preview → Publish.

### Fase 8 — Terjemahan Bahasa Inggris
- Draf terjemahan EN semua halaman + slug terjemahan; review di dashboard.

### Fase 9 — QA & peluncuran
1. Staging: verifikasi 100% URL, Lighthouse, Rich Results Test, uji multi-perangkat.
2. Cutover: salin semua DNS record (**termasuk MX email**), pasang custom domain, hapus `noindex`.
3. Pasca-live: submit sitemap ke Google Search Console & Bing (IndexNow), pantau 404 selama 2–4 minggu.
