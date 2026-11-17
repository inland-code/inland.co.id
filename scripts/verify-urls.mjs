#!/usr/bin/env node
/**
 * Memastikan SEMUA URL dari situs WordPress lama (migration/url-inventory.csv)
 * ada di hasil build. Gagal (exit 1) jika ada yang hilang — mencegah SEO rusak saat migrasi.
 * Juga memperingatkan URL yang slug-nya belum terverifikasi.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const csv = readFileSync(new URL('../migration/url-inventory.csv', import.meta.url), 'utf8').trim().split('\n');
const header = csv.shift().split(',');
const rows = csv.map((line) => Object.fromEntries(line.split(',').map((v, i) => [header[i], v])));

const missing = [];
const unverified = [];
for (const row of rows) {
  const p = row.path;
  const file = p.endsWith('/') ? join(dist, p, 'index.html') : join(dist, p);
  if (!existsSync(file)) missing.push(p);
  if (row.status !== 'verified') unverified.push(p);
}

console.log(`\n[verify-urls] ${rows.length} URL lama dicek terhadap dist/`);
if (unverified.length) {
  console.warn(`[verify-urls] ⚠ ${unverified.length} slug belum terverifikasi dengan situs live:`);
  for (const u of unverified) console.warn(`   - ${u}`);
}
if (missing.length) {
  console.error(`[verify-urls] ✗ ${missing.length} URL lama TIDAK ada di build:`);
  for (const m of missing) console.error(`   - ${m}`);
  process.exit(1);
}
console.log('[verify-urls] ✓ Semua URL lama tersedia.\n');
