import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** id entri = path file tanpa ekstensi (mis. "en/about-inland"), bukan field slug. */
const fileId = ({ entry }: { entry: string }) => entry.replace(/\.(json|mdx?)$/, '');

/**
 * Konvensi lokasi file:
 *   src/content/pages/<locale>/<nama>.json
 *   src/content/posts/<locale>/<nama>.md
 * Locale diambil dari folder pertama pada id entri.
 * `translationKey` menghubungkan versi ID & EN (dipakai untuk hreflang & tombol bahasa).
 * `slug` adalah path publik TANPA prefix locale dan TANPA garis miring, '' = beranda.
 * Gambar ditulis relatif terhadap src/assets/images (contoh: "home/hero.jpg").
 */

const seo = z.object({
  title: z.string().min(1).max(70),
  description: z.string().min(50).max(170),
  ogImage: z.string().optional(),
  noindex: z.boolean().default(false),
});

const cta = z.object({
  label: z.string(),
  href: z.string(),
  variant: z.enum(['light', 'navy', 'whatsapp', 'outline']).default('light'),
});

const hero = z.object({
  title: z.string(),
  tagline: z.string().optional(),
  body: z.string(),
  image: z.string(),
  imageAlt: z.string(),
  ctas: z.array(cta).default([]),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pages', generateId: fileId }),
  schema: z.object({
    translationKey: z.string(),
    slug: z.string().regex(/^[a-z0-9-]*$/, 'slug: huruf kecil, angka, tanda hubung'),
    template: z.enum(['home', 'about', 'services', 'service', 'contact', 'articles', 'gallery', 'generic']),
    /** true = slug sudah dicocokkan dengan URL live inland.co.id */
    slugVerified: z.boolean().default(false),
    seo,
    hero,
    /** Section halaman — skema rinci per jenis section dibangun di Fase 3. */
    sections: z.array(z.record(z.string(), z.unknown())).default([]),
    updatedAt: z.coerce.date().optional(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts', generateId: fileId }),
  schema: z.object({
    translationKey: z.string(),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    slugVerified: z.boolean().default(false),
    title: z.string(),
    seo,
    excerpt: z.string(),
    category: z.enum(['layanan', 'arsitektur', 'konstruksi', 'maintenance']),
    image: z.string(),
    imageAlt: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default('Tim Inland'),
    draft: z.boolean().default(false),
    /** Konten masih placeholder — isi lengkap diambil ulang di Fase 3. */
    contentPending: z.boolean().default(false),
  }),
});

export const collections = { pages, posts };
