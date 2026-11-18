import type { UiKey } from '@/i18n/ui';

/** Menu utama; item merujuk translationKey supaya URL otomatis sesuai bahasa. */
export type NavItem = {
  key: string;
  label: UiKey | { id: string; en: string };
  children?: { group: { id: string; en: string }; groupKey: string; items: { key: string; label: { id: string; en: string } }[] }[];
};

export const mainNav: NavItem[] = [
  { key: 'home', label: 'nav.home' },
  { key: 'about', label: 'nav.about' },
  {
    key: 'services',
    label: 'nav.services',
    children: [
      {
        groupKey: 'service-architect',
        group: { id: 'Jasa Arsitek', en: 'Architect Services' },
        items: [
          { key: 'service-interior', label: { id: 'Jasa Desain Interior', en: 'Interior Design' } },
          { key: 'service-house-design', label: { id: 'Jasa Desain Rumah', en: 'House Design' } },
        ],
      },
      {
        groupKey: 'service-contractor',
        group: { id: 'Jasa Kontraktor', en: 'Contractor Services' },
        items: [
          { key: 'service-house-construction', label: { id: 'Jasa Pembangunan Rumah', en: 'House Construction' } },
          { key: 'service-renovation', label: { id: 'Jasa Renovasi Rumah', en: 'House Renovation' } },
        ],
      },
      {
        groupKey: 'service-maintenance',
        group: { id: 'Jasa Maintenance', en: 'Maintenance Services' },
        items: [
          { key: 'service-glass-cleaning', label: { id: 'Jasa Pembersihan Kaca Gedung', en: 'Building Glass Cleaning' } },
          { key: 'service-rope-access', label: { id: 'Jasa Rope Access', en: 'Rope Access' } },
        ],
      },
    ],
  },
  { key: 'contact', label: 'nav.contact' },
  { key: 'articles', label: 'nav.articles' },
  { key: 'gallery', label: 'nav.gallery' },
];
