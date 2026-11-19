import type { UiKey } from '@/i18n/ui';

/** Menu utama; item merujuk translationKey supaya URL otomatis sesuai bahasa. */
export type NavItem = {
  key: string;
  /** Nama ikon dari src/components/icons/Icon.astro */
  icon: string;
  label: UiKey | { id: string; en: string };
  children?: {
    group: { id: string; en: string };
    groupKey: string;
    icon: string;
    items: { key: string; icon: string; label: { id: string; en: string } }[];
  }[];
};

export const mainNav: NavItem[] = [
  { key: 'home', icon: 'home', label: 'nav.home' },
  { key: 'about', icon: 'info', label: 'nav.about' },
  {
    key: 'services',
    icon: 'grid',
    label: 'nav.services',
    children: [
      {
        groupKey: 'service-architect',
        icon: 'architect',
        group: { id: 'Jasa Arsitek', en: 'Architect Services' },
        items: [
          { key: 'service-interior', icon: 'brush', label: { id: 'Jasa Desain Interior', en: 'Interior Design' } },
          { key: 'service-house-design', icon: 'ruler', label: { id: 'Jasa Desain Rumah', en: 'House Design' } },
        ],
      },
      {
        groupKey: 'service-contractor',
        icon: 'contractor',
        group: { id: 'Jasa Kontraktor', en: 'Contractor Services' },
        items: [
          { key: 'service-house-construction', icon: 'contractor', label: { id: 'Jasa Pembangunan Rumah', en: 'House Construction' } },
          { key: 'service-renovation', icon: 'hammer', label: { id: 'Jasa Renovasi Rumah', en: 'House Renovation' } },
        ],
      },
      {
        groupKey: 'service-maintenance',
        icon: 'maintenance',
        group: { id: 'Jasa Maintenance', en: 'Maintenance Services' },
        items: [
          { key: 'service-glass-cleaning', icon: 'sparkle', label: { id: 'Jasa Pembersihan Kaca Gedung', en: 'Building Glass Cleaning' } },
          { key: 'service-rope-access', icon: 'rope', label: { id: 'Jasa Rope Access', en: 'Rope Access' } },
          { key: 'service-glass-sealant', icon: 'shield', label: { id: 'Jasa Sealant Kaca Gedung', en: 'Building Glass Sealant' } },
        ],
      },
    ],
  },
  { key: 'contact', icon: 'phone', label: 'nav.contact' },
  { key: 'articles', icon: 'news', label: 'nav.articles' },
  { key: 'gallery', icon: 'image', label: 'nav.gallery' },
];
