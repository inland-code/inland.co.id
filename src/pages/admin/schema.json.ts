import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { pageSchema, postSchema, siteSchema } from '@/content/schema';
import { getRoutes } from '@/lib/routes';
import { listImages } from '@/lib/media';

/**
 * Data statis untuk dashboard: JSON Schema form (dari zod), daftar translationKey
 * untuk pilihan tautan, dan daftar gambar saat build. Tidak berisi rahasia apa pun.
 */
export const GET: APIRoute = async () => {
  const opts = { io: 'input', unrepresentable: 'any' } as const;
  const routes = await getRoutes();
  const links = [
    ...new Map(
      routes
        .filter((r) => r.locale === 'id')
        .map((r) => [
          r.translationKey,
          { key: r.translationKey, title: r.kind === 'page' ? r.entry.data.hero.title : r.entry.data.title, path: r.path },
        ]),
    ).values(),
  ];
  const body = {
    page: z.toJSONSchema(pageSchema, opts),
    post: z.toJSONSchema(postSchema, opts),
    site: z.toJSONSchema(siteSchema, opts),
    links,
    images: listImages().sort(),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
};
