import type { APIRoute } from 'astro';
import site from '@/data/site.json';
import { getRoutes, type Route } from '@/lib/routes';
import { absoluteUrl } from '@/lib/seo';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** RSS artikel (menggantikan /feed/ WordPress; /feed/ di-redirect ke sini). */
export const GET: APIRoute = async () => {
  const posts = (await getRoutes())
    .filter((r): r is Extract<Route, { kind: 'post' }> => r.kind === 'post' && r.locale === 'id' && !r.entry.data.seo.noindex)
    .sort((a, b) => b.entry.data.publishedAt.getTime() - a.entry.data.publishedAt.getTime());
  const items = posts
    .map(
      (p) =>
        `<item><title>${esc(p.entry.data.title)}</title><link>${absoluteUrl(p.path)}</link><guid isPermaLink="true">${absoluteUrl(p.path)}</guid><pubDate>${p.entry.data.publishedAt.toUTCString()}</pubDate><category>${esc(p.entry.data.category)}</category><description>${esc(p.entry.data.excerpt)}</description></item>`,
    )
    .join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(site.name)} — Artikel</title><link>${absoluteUrl('/artikel/')}</link><atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml"/><description>${esc(site.tagline.id)}</description><language>id-ID</language>${items}</channel></rss>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
