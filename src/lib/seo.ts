import site from '@/data/site.json';
import type { Locale } from '@/i18n/config';

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}

/** Entitas bisnis: dipakai Google (rich result lokal) & mesin AI (GEO). */
export function organizationSchema() {
  const sameAs = Object.values(site.social).filter(Boolean);
  return {
    '@type': ['GeneralContractor', 'HomeAndConstructionBusiness'],
    '@id': ORG_ID,
    name: site.name,
    url: site.url,
    logo: absoluteUrl('/logo-inland.png'),
    image: absoluteUrl('/logo-inland.png'),
    email: site.email,
    telephone: site.phoneE164,
    slogan: 'Architect, Build And Maintenance',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    areaServed: site.areaServed.map((name) => ({ '@type': 'City', name })),
    openingHoursSpecification: site.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => `https://schema.org/${dayName(d)}`),
      opens: h.opens,
      closes: h.closes,
    })),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

function dayName(d: string): string {
  return (
    (
      { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' } as Record<string, string>
    )[d] ?? d
  );
}

export function websiteSchema(locale: Locale) {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: site.url,
    name: site.name,
    inLanguage: locale === 'id' ? 'id-ID' : 'en',
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

export { ORG_ID, WEBSITE_ID };

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function serviceSchema(opts: { name: string; description: string; path: string; image?: string; locale: Locale }) {
  return {
    '@type': 'Service',
    '@id': `${absoluteUrl(opts.path)}#service`,
    name: opts.name,
    serviceType: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    ...(opts.image ? { image: opts.image } : {}),
    inLanguage: opts.locale === 'id' ? 'id-ID' : 'en',
    provider: { '@id': ORG_ID },
    areaServed: site.areaServed.map((name) => ({ '@type': 'City', name })),
  };
}
