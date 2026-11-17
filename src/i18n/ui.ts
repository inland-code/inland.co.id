import type { Locale } from './config';

/** String antarmuka (bukan konten). Konten halaman ada di src/content. */
export const ui = {
  id: {
    'nav.home': 'Beranda',
    'nav.about': 'Tentang Kami',
    'nav.services': 'Layanan Kami',
    'nav.contact': 'Kontak',
    'nav.articles': 'Artikel',
    'nav.gallery': 'Galeri',
    'nav.menu': 'Menu',
    'nav.close': 'Tutup menu',
    'nav.skip': 'Langsung ke konten',
    'cta.whatsapp': 'Hubungi Kami',
    'cta.consult': 'Konsultasi Gratis',
    'footer.rights': 'Hak cipta',
    'footer.design': 'Design by',
    'footer.contact': 'Kontak',
    'footer.services': 'Layanan',
    'footer.company': 'Perusahaan',
    'footer.hours': 'Jam Operasional',
    'lang.switch': 'Ganti bahasa',
    'post.publishedOn': 'Diterbitkan',
    'post.updatedOn': 'Diperbarui',
    'post.readMore': 'Baca selengkapnya',
    'breadcrumb.home': 'Beranda',
    '404.title': 'Halaman tidak ditemukan',
    '404.body': 'Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.',
    '404.back': 'Kembali ke Beranda',
    'placeholder.sections': 'Bagian konten halaman ini akan dibangun pada Fase 3.',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.services': 'Our Services',
    'nav.contact': 'Contact',
    'nav.articles': 'Articles',
    'nav.gallery': 'Gallery',
    'nav.menu': 'Menu',
    'nav.close': 'Close menu',
    'nav.skip': 'Skip to content',
    'cta.whatsapp': 'Contact Us',
    'cta.consult': 'Free Consultation',
    'footer.rights': 'Copyright',
    'footer.design': 'Design by',
    'footer.contact': 'Contact',
    'footer.services': 'Services',
    'footer.company': 'Company',
    'footer.hours': 'Opening Hours',
    'lang.switch': 'Switch language',
    'post.publishedOn': 'Published',
    'post.updatedOn': 'Updated',
    'post.readMore': 'Read more',
    'breadcrumb.home': 'Home',
    '404.title': 'Page not found',
    '404.body': 'Sorry, the page you are looking for does not exist or has been moved.',
    '404.back': 'Back to Home',
    'placeholder.sections': 'The content sections of this page will be built in Phase 3.',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UiKey = keyof (typeof ui)['id'];

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key] ?? ui.id[key];
}
