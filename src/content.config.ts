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
  variant: z.enum(['light', 'dark', 'whatsapp', 'outline']).default('light'),
});

const hero = z.object({
  title: z.string(),
  tagline: z.string().optional(),
  body: z.string(),
  image: z.string(),
  imageAlt: z.string(),
  ctas: z.array(cta).default([]),
});

/* ---------- Section halaman (blok yang bisa disusun dari dashboard) ---------- */

const icon = z.enum(['architect', 'contractor', 'maintenance', 'home', 'office', 'store', 'shield', 'clock', 'chat', 'ruler', 'check', 'rope', 'sparkle']);
const link = z.object({ label: z.string(), href: z.string() });

const sectionHeading = {
  eyebrow: z.string().optional(),
  title: z.string(),
  intro: z.string().optional(),
};

export const sectionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('trust'),
    items: z.array(z.object({ icon, title: z.string(), text: z.string() })).min(2).max(4),
  }),
  z.object({
    type: z.literal('stats'),
    ...sectionHeading,
    /** Angka bisnis — ganti kapan saja dari konten/dashboard. */
    items: z.array(z.object({ value: z.number().nonnegative(), suffix: z.string().default(''), label: z.string(), note: z.string().optional() })).min(2).max(4),
  }),
  z.object({
    type: z.literal('service-cards'),
    ...sectionHeading,
    items: z.array(
      z.object({ icon: icon.optional(), title: z.string(), text: z.string(), href: z.string().optional(), links: z.array(link).default([]) }),
    ),
  }),
  z.object({
    type: z.literal('value-cards'),
    ...sectionHeading,
    title: z.string().optional(),
    items: z.array(
      z.object({
        title: z.string(),
        text: z.string().optional(),
        bullets: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
      }),
    ),
  }),
  z.object({
    type: z.literal('service-detail'),
    title: z.string(),
    text: z.string(),
    bars: z.array(z.object({ label: z.string(), value: z.number().min(0).max(100) })).default([]),
    cards: z.array(z.object({ title: z.string(), text: z.string(), cta: link.optional() })).min(1),
  }),
  z.object({
    type: z.literal('banner'),
    title: z.string(),
    text: z.string(),
    button: link.optional(),
  }),
  z.object({
    type: z.literal('gallery'),
    groups: z.array(
      z.object({ title: z.string(), images: z.array(z.object({ image: z.string(), alt: z.string(), caption: z.string().optional() })).min(1) }),
    ),
  }),
  z.object({
    type: z.literal('contact'),
    infoTitle: z.string(),
    socialTitle: z.string(),
    socialText: z.string(),
    formTitle: z.string(),
    formText: z.string(),
  }),
  z.object({
    type: z.literal('accordion-media'),
    ...sectionHeading,
    tone: z.enum(['brand', 'light']).default('brand'),
    imageSide: z.enum(['left', 'right']).default('right'),
    image: z.string(),
    imageAlt: z.string(),
    numbered: z.boolean().default(false),
    items: z.array(z.object({ title: z.string(), text: z.string() })).min(1),
    cta: link.optional(),
  }),
  z.object({
    type: z.literal('gallery-teaser'),
    ...sectionHeading,
    images: z.array(z.object({ image: z.string(), alt: z.string(), caption: z.string().optional() })).min(3),
    cta: link.optional(),
  }),
  z.object({
    type: z.literal('testimonials'),
    ...sectionHeading,
    items: z.array(z.object({ quote: z.string(), name: z.string(), location: z.string().optional() })).min(1),
  }),
  z.object({
    type: z.literal('latest-posts'),
    ...sectionHeading,
    limit: z.number().int().min(1).max(6).default(3),
    cta: link.optional(),
  }),
  z.object({
    type: z.literal('cta'),
    title: z.string(),
    text: z.string(),
    button: link,
    tone: z.enum(['brand', 'light']).default('light'),
  }),
]);

export type Section = z.infer<typeof sectionSchema>;

const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pages', generateId: fileId }),
  schema: z.object({
    translationKey: z.string(),
    slug: z.string().regex(/^[a-z0-9-]*$/, 'slug: huruf kecil, angka, tanda hubung'),
    template: z.enum(['home', 'about', 'services', 'service', 'contact', 'articles', 'gallery', 'generic']),
    /** true = slug sudah dicocokkan dengan URL live inland.co.id */
    slugVerified: z.boolean().default(false),
    /**
     * Asal konten:
     *  screenshot = ditranskripsi dari screenshot situs lama
     *  draft      = halaman ada di sitemap lama tapi isinya belum diketahui; ditulis ulang, perlu review
     *  final      = sudah direview pemilik
     */
    contentStatus: z.enum(['screenshot', 'draft', 'final']).default('screenshot'),
    seo,
    hero,
    sections: z.array(sectionSchema).default([]),
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
