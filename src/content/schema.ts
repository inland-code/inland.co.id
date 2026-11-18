/**
 * Skema konten Inland — satu sumber kebenaran untuk:
 *   1) validasi build Astro (src/content.config.ts), dan
 *   2) form editor dashboard /admin (diekspor ke JSON Schema lewat /admin/schema.json).
 * `.meta({ title, description, widget })` dipakai dashboard sebagai label & jenis input.
 * Widget: text (default) | textarea | markdown | image | link | date.
 */
import { z } from 'astro/zod';

const s = (title: string, description?: string) => z.string().meta({ title, ...(description ? { description } : {}) });
const text = (title: string, description?: string) =>
  z.string().meta({ title, widget: 'textarea', ...(description ? { description } : {}) });
const img = (title = 'Gambar') =>
  z.string().meta({ title, widget: 'image', description: 'Path relatif dari src/assets/images, mis. "home/hero.jpg"' });
const href = (title = 'Tautan') =>
  z.string().meta({ title, widget: 'link', description: 'translationKey halaman (mis. "about"), "#whatsapp", "/path/", atau URL lengkap' });

export const seoSchema = z
  .object({
    title: s('Judul SEO', 'Maks. 70 karakter, idealnya ≤ 60').min(1).max(70),
    description: text('Meta description', '50–170 karakter, idealnya 120–160').min(50).max(170),
    ogImage: img('Gambar OG (opsional)').optional(),
    noindex: z.boolean().default(false).meta({ title: 'Sembunyikan dari Google (noindex)' }),
  })
  .meta({ title: 'SEO' });

const cta = z
  .object({
    label: s('Teks tombol'),
    href: href(),
    variant: z.enum(['light', 'dark', 'whatsapp', 'outline']).default('light').meta({ title: 'Gaya tombol' }),
  })
  .meta({ title: 'Tombol' });

export const heroSchema = z
  .object({
    title: s('Judul (H1)'),
    tagline: s('Tagline').optional(),
    body: text('Paragraf'),
    image: img('Foto hero'),
    imageAlt: s('Teks alternatif foto'),
    ctas: z.array(cta).default([]).meta({ title: 'Tombol' }),
  })
  .meta({ title: 'Hero' });

/* ---------- Section ---------- */

export const iconNames = [
  'architect',
  'contractor',
  'maintenance',
  'home',
  'office',
  'store',
  'shield',
  'clock',
  'chat',
  'ruler',
  'check',
  'rope',
  'sparkle',
] as const;
const icon = z.enum(iconNames).meta({ title: 'Ikon' });
const link = z.object({ label: s('Teks'), href: href() }).meta({ title: 'Tautan' });
const heading = {
  eyebrow: s('Label kecil di atas judul').optional(),
  title: s('Judul section'),
  intro: text('Pengantar').optional(),
};
const imageItem = z.object({ image: img(), alt: s('Teks alternatif'), caption: s('Keterangan').optional() }).meta({ title: 'Foto' });

export const sectionSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('trust'),
      items: z
        .array(z.object({ icon, title: s('Judul'), text: s('Teks') }).meta({ title: 'Poin' }))
        .min(2)
        .max(4)
        .meta({ title: 'Poin keunggulan' }),
    })
    .meta({ title: 'Strip keunggulan' }),
  z
    .object({
      type: z.literal('stats'),
      ...heading,
      items: z
        .array(
          z
            .object({
              value: z.number().nonnegative().meta({ title: 'Angka' }),
              suffix: s('Akhiran (mis. +)').default(''),
              label: s('Label'),
              note: s('Catatan kecil').optional(),
            })
            .meta({ title: 'Statistik' }),
        )
        .min(2)
        .max(4)
        .meta({ title: 'Angka' }),
    })
    .meta({ title: 'Statistik bisnis' }),
  z
    .object({
      type: z.literal('service-cards'),
      ...heading,
      items: z
        .array(
          z
            .object({
              icon: icon.optional(),
              title: s('Judul'),
              text: text('Teks'),
              href: href('Tautan kartu (opsional)').optional(),
              links: z.array(link).default([]).meta({ title: 'Tautan tambahan' }),
            })
            .meta({ title: 'Kartu' }),
        )
        .meta({ title: 'Kartu' }),
    })
    .meta({ title: 'Kartu layanan' }),
  z
    .object({
      type: z.literal('value-cards'),
      ...heading,
      title: s('Judul section').optional(),
      items: z
        .array(
          z
            .object({
              title: s('Judul'),
              text: text('Teks').optional(),
              bullets: z
                .array(z.object({ title: s('Judul'), text: text('Teks') }).meta({ title: 'Poin' }))
                .default([])
                .meta({ title: 'Poin' }),
            })
            .meta({ title: 'Kartu' }),
        )
        .meta({ title: 'Kartu' }),
    })
    .meta({ title: 'Kartu nilai (Visi/Misi)' }),
  z
    .object({
      type: z.literal('service-detail'),
      title: s('Judul'),
      text: text('Teks'),
      bars: z
        .array(z.object({ label: s('Label'), value: z.number().min(0).max(100).meta({ title: 'Persen' }) }).meta({ title: 'Bar' }))
        .default([])
        .meta({ title: 'Bar cakupan' }),
      cards: z
        .array(z.object({ title: s('Judul'), text: text('Teks'), cta: link.optional() }).meta({ title: 'Kartu' }))
        .min(1)
        .meta({ title: 'Kartu' }),
    })
    .meta({ title: 'Detail layanan' }),
  z
    .object({
      type: z.literal('banner'),
      title: s('Judul'),
      text: text('Teks'),
      button: link.optional(),
    })
    .meta({ title: 'Banner oranye' }),
  z
    .object({
      type: z.literal('gallery'),
      groups: z
        .array(z.object({ title: s('Judul grup'), images: z.array(imageItem).min(1).meta({ title: 'Foto' }) }).meta({ title: 'Grup' }))
        .meta({ title: 'Grup galeri' }),
    })
    .meta({ title: 'Galeri' }),
  z
    .object({
      type: z.literal('contact'),
      infoTitle: s('Judul informasi kontak'),
      socialTitle: s('Judul media sosial'),
      socialText: text('Teks media sosial'),
      formTitle: s('Judul formulir'),
      formText: text('Teks formulir'),
    })
    .meta({ title: 'Kontak + formulir' }),
  z
    .object({
      type: z.literal('accordion-media'),
      ...heading,
      tone: z.enum(['brand', 'light']).default('brand').meta({ title: 'Latar' }),
      imageSide: z.enum(['left', 'right']).default('right').meta({ title: 'Posisi foto' }),
      image: img('Foto'),
      imageAlt: s('Teks alternatif foto'),
      numbered: z.boolean().default(false).meta({ title: 'Bernomor' }),
      items: z
        .array(z.object({ title: s('Judul'), text: text('Teks') }).meta({ title: 'Poin' }))
        .min(1)
        .meta({ title: 'Poin akordeon' }),
      cta: link.optional(),
    })
    .meta({ title: 'Akordeon + foto' }),
  z
    .object({
      type: z.literal('gallery-teaser'),
      ...heading,
      images: z.array(imageItem).min(3).meta({ title: 'Foto' }),
      cta: link.optional(),
    })
    .meta({ title: 'Cuplikan portofolio' }),
  z
    .object({
      type: z.literal('testimonials'),
      ...heading,
      items: z
        .array(z.object({ quote: text('Kutipan'), name: s('Nama'), location: s('Kota').optional() }).meta({ title: 'Testimoni' }))
        .min(1)
        .meta({ title: 'Testimoni' }),
    })
    .meta({ title: 'Testimoni' }),
  z
    .object({
      type: z.literal('latest-posts'),
      ...heading,
      limit: z.number().int().min(1).max(6).default(3).meta({ title: 'Jumlah artikel' }),
      cta: link.optional(),
    })
    .meta({ title: 'Artikel terbaru' }),
  z
    .object({
      type: z.literal('faq'),
      ...heading,
      items: z
        .array(z.object({ q: s('Pertanyaan'), a: text('Jawaban') }).meta({ title: 'Tanya-jawab' }))
        .min(1)
        .meta({ title: 'Tanya-jawab' }),
    })
    .meta({ title: 'FAQ' }),
  z
    .object({
      type: z.literal('table'),
      ...heading,
      columns: z.array(s('Judul kolom')).min(2).max(4).meta({ title: 'Kolom' }),
      rows: z
        .array(z.array(s('Sel')).min(2).max(4).meta({ title: 'Baris' }))
        .min(1)
        .meta({ title: 'Baris' }),
      note: text('Catatan di bawah tabel').optional(),
    })
    .meta({ title: 'Tabel (estimasi biaya, perbandingan)' }),
  z
    .object({
      type: z.literal('areas'),
      ...heading,
      areas: z.array(s('Wilayah')).min(2).meta({ title: 'Wilayah / kecamatan' }),
      note: text('Catatan').optional(),
    })
    .meta({ title: 'Wilayah layanan' }),
  z
    .object({
      type: z.literal('cta'),
      title: s('Judul'),
      text: text('Teks'),
      button: link,
      tone: z.enum(['brand', 'light']).default('light').meta({ title: 'Warna' }),
    })
    .meta({ title: 'Ajakan konsultasi' }),
]);

export type Section = z.infer<typeof sectionSchema>;

export const pageSchema = z.object({
  translationKey: s('Kunci terjemahan', 'Sama untuk versi ID & EN dari halaman yang sama'),
  slug: s('Slug URL', 'Huruf kecil, angka, tanda hubung. Kosong = beranda. JANGAN ubah slug halaman lama.').regex(
    /^[a-z0-9-]*$/,
    'slug: huruf kecil, angka, tanda hubung',
  ),
  template: z.enum(['home', 'about', 'services', 'service', 'contact', 'articles', 'gallery', 'generic']).meta({ title: 'Template' }),
  slugVerified: z.boolean().default(false).meta({ title: 'Slug sama dengan situs lama' }),
  contentStatus: z.enum(['screenshot', 'draft', 'final']).default('screenshot').meta({ title: 'Status konten' }),
  seo: seoSchema,
  hero: heroSchema,
  sections: z.array(sectionSchema).default([]).meta({ title: 'Section' }),
  updatedAt: z.string().meta({ title: 'Terakhir diperbarui', widget: 'date' }).optional(),
});

export const postCategories = ['layanan', 'arsitektur', 'konstruksi', 'maintenance'] as const;

export const postSchema = z.object({
  translationKey: s('Kunci terjemahan'),
  slug: s('Slug URL', 'Huruf kecil, angka, tanda hubung').regex(/^[a-z0-9-]+$/),
  slugVerified: z.boolean().default(false).meta({ title: 'Slug sama dengan situs lama' }),
  title: s('Judul artikel (H1)'),
  seo: seoSchema,
  excerpt: text('Ringkasan'),
  category: z.enum(postCategories).meta({ title: 'Kategori' }),
  image: img('Gambar utama'),
  imageAlt: s('Teks alternatif gambar'),
  publishedAt: z.coerce.date().meta({ title: 'Tanggal terbit', widget: 'date' }),
  updatedAt: z.coerce.date().meta({ title: 'Tanggal diperbarui', widget: 'date' }).optional(),
  author: s('Penulis').default('Tim Inland'),
  draft: z.boolean().default(false).meta({ title: 'Draf (belum terbit)' }),
  faq: z
    .array(z.object({ q: s('Pertanyaan'), a: text('Jawaban') }).meta({ title: 'Tanya-jawab' }))
    .default([])
    .meta({ title: 'FAQ (rich result)' }),
});

const hours = z
  .object({
    days: z.array(z.enum(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'])).meta({ title: 'Hari' }),
    opens: s('Buka (HH:MM)'),
    closes: s('Tutup (HH:MM)'),
  })
  .meta({ title: 'Jam' });

export const siteSchema = z.object({
  name: s('Nama bisnis'),
  legalName: s('Nama legal'),
  url: s('URL situs'),
  tagline: z.object({ id: s('Tagline (ID)'), en: s('Tagline (EN)') }).meta({ title: 'Tagline' }),
  email: s('Email'),
  phoneDisplay: s('Telepon (tampilan)'),
  phoneE164: s('Telepon (format +62…)'),
  whatsapp: s('Nomor WhatsApp (62…)'),
  whatsappMessage: z.object({ id: s('Pesan awal (ID)'), en: s('Pesan awal (EN)') }).meta({ title: 'Pesan WhatsApp' }),
  address: z
    .object({
      street: s('Jalan'),
      locality: s('Kecamatan/Kota'),
      region: s('Provinsi'),
      postalCode: s('Kode pos'),
      country: s('Negara (kode)'),
    })
    .meta({ title: 'Alamat' }),
  areaServed: z.array(s('Kota')).meta({ title: 'Area layanan' }),
  openingHours: z.array(hours).meta({ title: 'Jam operasional' }),
  social: z
    .object({
      facebook: s('Facebook URL'),
      instagram: s('Instagram URL'),
      youtube: s('YouTube URL'),
      tiktok: s('TikTok URL'),
    })
    .meta({ title: 'Media sosial' }),
});
