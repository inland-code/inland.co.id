import type { APIRoute } from 'astro';
import site from '@/data/site.json';
import { getRoutes } from '@/lib/routes';
import { absoluteUrl } from '@/lib/seo';

/** https://llmstxt.org — ringkasan situs untuk mesin AI. Versi lengkap (llms-full.txt) di Fase 5. */
export const GET: APIRoute = async () => {
  const routes = (await getRoutes()).filter((r) => !r.entry.data.seo.noindex);
  const line = (r: (typeof routes)[number]) => `- [${r.entry.data.seo.title}](${absoluteUrl(r.path)}): ${r.entry.data.seo.description}`;
  const body = [
    `# ${site.name}`,
    '',
    `> ${site.name} adalah perusahaan jasa arsitek, kontraktor, dan perawatan gedung berbasis di ${site.address.locality}, ${site.address.region}, melayani ${site.areaServed.join(', ')}.`,
    '',
    `Kontak: ${site.phoneDisplay} (WhatsApp) · ${site.email} · ${site.address.street}, ${site.address.locality} ${site.address.postalCode}`,
    '',
    '## Halaman (Bahasa Indonesia)',
    ...routes.filter((r) => r.kind === 'page' && r.locale === 'id').map(line),
    '',
    '## Artikel',
    ...routes.filter((r) => r.kind === 'post' && r.locale === 'id').map(line),
    '',
    '## Pages (English)',
    ...routes.filter((r) => r.locale === 'en').map(line),
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
