/**
 * SITE_ENV=production hanya untuk build domain utama.
 * Selain itu (preview/staging/workers.dev) halaman otomatis noindex
 * agar tidak dianggap konten duplikat oleh Google.
 */
export const isProduction = import.meta.env.PUBLIC_SITE_ENV === 'production';
