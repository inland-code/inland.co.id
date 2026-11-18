import site from '@/data/site.json';
import type { Section } from '@/content.config';
import type { Locale } from '@/i18n/config';
import { resolveHref } from './links';
import { absoluteUrl } from './seo';
import type { Route } from './routes';

/**
 * Versi Markdown bersih tiap halaman untuk mesin AI / LLM (GEO).
 * Diturunkan dari data konten yang sama dengan HTML, jadi selalu sinkron.
 */

async function link(label: string, href: string, locale: Locale): Promise<string> {
  const url = await resolveHref(href, locale);
  return `[${label}](${url.startsWith('/') ? absoluteUrl(url) : url})`;
}

async function sectionToMd(s: Section, locale: Locale): Promise<string> {
  const h = (t?: string) => (t ? `## ${t}\n\n` : '');
  switch (s.type) {
    case 'trust':
      return s.items.map((i) => `- **${i.title}** — ${i.text}`).join('\n');
    case 'stats':
      return h(s.title) + s.items.map((i) => `- ${i.value}${i.suffix} ${i.label}`).join('\n');
    case 'service-cards': {
      const items = await Promise.all(
        s.items.map(async (i) => {
          const links = await Promise.all(i.links.map((l) => link(l.label, l.href, locale)));
          return `### ${i.title}\n\n${i.text}${links.length ? `\n\n${links.map((l) => `- ${l}`).join('\n')}` : ''}`;
        }),
      );
      return h(s.title) + (s.intro ? `${s.intro}\n\n` : '') + items.join('\n\n');
    }
    case 'value-cards':
      return (
        h(s.title) +
        s.items
          .map((i) =>
            [`### ${i.title}`, i.text, i.bullets.map((b) => `- **${b.title}** — ${b.text}`).join('\n')].filter(Boolean).join('\n\n'),
          )
          .join('\n\n')
      );
    case 'accordion-media':
      return h(s.title) + s.items.map((i, n) => `### ${s.numbered ? `${n + 1}. ` : ''}${i.title}\n\n${i.text}`).join('\n\n');
    case 'service-detail':
      return (
        `## ${s.title}\n\n${s.text}` +
        (s.bars.length ? `\n\n${s.bars.map((b) => `- ${b.label}`).join('\n')}` : '') +
        `\n\n${s.cards.map((c) => `### ${c.title}\n\n${c.text}`).join('\n\n')}`
      );
    case 'faq':
      return h(s.title) + s.items.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n');
    case 'testimonials':
      return h(s.title) + s.items.map((t) => `> ${t.quote}\n> — ${t.name}${t.location ? `, ${t.location}` : ''}`).join('\n\n');
    case 'gallery':
      return s.groups.map((g) => `## ${g.title}\n\n${g.images.map((i) => `- ${i.alt}`).join('\n')}`).join('\n\n');
    case 'gallery-teaser':
      return h(s.title) + s.images.map((i) => `- ${i.alt}`).join('\n');
    case 'banner':
    case 'cta':
      return `## ${s.title}\n\n${s.text}`;
    case 'table':
      return (
        h(s.title) +
        (s.intro ? `${s.intro}\n\n` : '') +
        `| ${s.columns.join(' | ')} |\n| ${s.columns.map(() => '---').join(' | ')} |\n` +
        s.rows.map((r) => `| ${r.join(' | ')} |`).join('\n') +
        (s.note ? `\n\n*${s.note}*` : '')
      );
    case 'areas':
      return h(s.title) + (s.intro ? `${s.intro}\n\n` : '') + s.areas.join(', ') + (s.note ? `\n\n${s.note}` : '');
    case 'contact':
    case 'latest-posts':
      return '';
  }
}

function contactBlock(locale: Locale): string {
  const a = site.address;
  return locale === 'id'
    ? `---\n\n**${site.name}** — ${site.tagline.id}\n\n- Alamat: ${a.street}, ${a.locality}, ${a.region} ${a.postalCode}\n- WhatsApp/Telepon: ${site.phoneDisplay}\n- Email: ${site.email}\n- Area layanan: ${site.areaServed.join(', ')}\n- Jam operasional: Senin–Jumat 08:00–17:00, Sabtu 08:00–13:00 WIB`
    : `---\n\n**${site.name}** — ${site.tagline.en}\n\n- Address: ${a.street}, ${a.locality}, ${a.region} ${a.postalCode}, Indonesia\n- WhatsApp/Phone: ${site.phoneDisplay}\n- Email: ${site.email}\n- Service area: ${site.areaServed.join(', ')}\n- Hours: Mon–Fri 08:00–17:00, Sat 08:00–13:00 (WIB)`;
}

export async function routeToMarkdown(route: Route): Promise<string> {
  const url = absoluteUrl(route.path);
  if (route.kind === 'post') {
    const d = route.entry.data;
    return (
      [
        `# ${d.title}`,
        `> ${d.excerpt}`,
        `URL: ${url}  \n${route.locale === 'id' ? 'Diterbitkan' : 'Published'}: ${d.publishedAt.toISOString().slice(0, 10)}`,
        (route.entry.body ?? '').trim(),
        contactBlock(route.locale),
      ].join('\n\n') + '\n'
    );
  }
  const d = route.entry.data;
  const parts = await Promise.all(d.sections.map((s) => sectionToMd(s, route.locale)));
  return (
    [
      `# ${d.hero.title}`,
      `> ${d.seo.description}`,
      `URL: ${url}`,
      d.hero.tagline ? `*${d.hero.tagline}*` : '',
      d.hero.body,
      ...parts,
      contactBlock(route.locale),
    ]
      .filter(Boolean)
      .join('\n\n') + '\n'
  );
}

/** "/" -> "/index.md", "/a/" -> "/a.md", "/en/" -> "/en/index.md" */
export function markdownPath(path: string): string {
  if (path === '/') return '/index.md';
  if (path === '/en/') return '/en/index.md';
  return path.replace(/\/$/, '') + '.md';
}
