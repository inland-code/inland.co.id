import type { APIRoute, GetStaticPaths } from 'astro';
import { getRoutes, type Route } from '@/lib/routes';
import { ogPath, renderOg } from '@/lib/og';

/** Gambar OG bermerek per halaman/artikel, dibuat saat build. */
export const getStaticPaths = (async () => {
  const routes = await getRoutes();
  return routes.map((route) => ({ params: { ogpath: ogPath(route.path).replace(/^\/og\//, '').replace(/\.jpg$/, '') }, props: { route } }));
}) satisfies GetStaticPaths;

const eyebrows: Record<string, { id: string; en: string }> = {
  layanan: { id: 'Layanan', en: 'Services' },
  arsitektur: { id: 'Arsitektur', en: 'Architecture' },
  konstruksi: { id: 'Konstruksi', en: 'Construction' },
  maintenance: { id: 'Maintenance', en: 'Maintenance' },
};

export const GET: APIRoute = async ({ props }) => {
  const route = (props as { route: Route }).route;
  const isPost = route.kind === 'post';
  const image = isPost ? route.entry.data.image : (route.entry.data.seo.ogImage ?? route.entry.data.hero.image);
  const jpg = await renderOg({
    title: isPost ? route.entry.data.title : route.entry.data.hero.title,
    eyebrow: isPost ? eyebrows[route.entry.data.category]?.[route.locale] : route.locale === 'id' ? 'Arsitek · Kontraktor · Maintenance' : 'Architect · Build · Maintenance',
    photoPath: `src/assets/images/${image}`,
    locale: route.locale,
  });
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
