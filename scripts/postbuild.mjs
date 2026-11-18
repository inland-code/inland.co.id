#!/usr/bin/env node
/**
 * Build non-produksi (staging/preview): tambahkan header X-Robots-Tag: noindex
 * ke semua respons, sebagai lapisan kedua selain <meta robots> dan robots.txt.
 */
import { readFileSync, writeFileSync } from 'node:fs';

if (process.env.PUBLIC_SITE_ENV === 'production') {
  console.log('[postbuild] produksi: header indexable dipertahankan.');
} else {
  const file = new URL('../dist/_headers', import.meta.url);
  const current = readFileSync(file, 'utf8');
  writeFileSync(file, `/*\n  X-Robots-Tag: noindex, nofollow\n\n${current}`);
  console.log('[postbuild] staging: X-Robots-Tag noindex ditambahkan ke dist/_headers.');
}
