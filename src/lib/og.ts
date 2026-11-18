import { readFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import site from '@/data/site.json';

/**
 * Gambar Open Graph bermerek 1200×630 (preview saat link dibagikan ke WhatsApp, Facebook, LinkedIn, X).
 * Dibuat saat build: foto halaman + panel gradien brand + logo + judul. Teks dirender menjadi path oleh satori,
 * lalu SVG diubah ke PNG oleh sharp — tidak butuh font sistem.
 */

const W = 1200;
const H = 630;
let fonts: { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] | undefined;
let logo: string | undefined;

async function assets() {
  fonts ??= [
    { name: 'Roboto', data: await readFile('node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Roboto', data: await readFile('node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff'), weight: 700, style: 'normal' },
  ];
  logo ??= `data:image/png;base64,${(await sharp('src/assets/brand/logo-inland.png').resize({ height: 120 }).png().toBuffer()).toString('base64')}`;
  return { fonts, logo };
}

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({ type, props: { style, children, ...extra } });

export async function renderOg(opts: { title: string; eyebrow?: string; photoPath: string; locale: 'id' | 'en' }): Promise<Buffer> {
  const { fonts, logo } = await assets();
  const photo = `data:image/jpeg;base64,${(await sharp(opts.photoPath).resize(560, H, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82 }).toBuffer()).toString('base64')}`;
  const title = opts.title.length > 90 ? `${opts.title.slice(0, 87).trim()}…` : opts.title;
  const size = title.length > 60 ? 50 : title.length > 36 ? 58 : 68;

  const tree = h('div', { display: 'flex', width: W, height: H, fontFamily: 'Roboto', background: '#fff' }, [
    h('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0, width: 640 - 112, height: H - 104, padding: '52px 56px', backgroundImage: 'linear-gradient(180deg, #f2821f 0%, #b45a19 58%, #704020 100%)', color: '#fff' }, [
      h('div', { display: 'flex', alignItems: 'center' }, [
        h('div', { display: 'flex', background: '#fff', borderRadius: 18, padding: '14px 20px' }, h('img', { height: 64 }, undefined, { src: logo, height: 64 })),
      ]),
      h('div', { display: 'flex', flexDirection: 'column' }, [
        ...(opts.eyebrow ? [h('div', { fontSize: 24, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#ffe9d3', marginBottom: 16 }, opts.eyebrow)] : []),
        h('div', { fontSize: size, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1 }, title),
      ]),
      h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 24, color: '#fff6ed' }, [
        h('div', { display: 'flex' }, 'inland.co.id'),
        h('div', { display: 'flex', background: '#2c1a10', color: '#fff', borderRadius: 999, padding: '10px 22px', fontWeight: 700, fontSize: 22 }, `WhatsApp ${site.phoneDisplay}`),
      ]),
    ]),
    h('img', { width: 560, height: H, objectFit: 'cover', flexShrink: 0 }, undefined, { src: photo, width: 560, height: H }),
  ]);

  const svg = await satori(tree as never, { width: W, height: H, fonts });
  return sharp(Buffer.from(svg)).jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
}

/** "/" -> "/og/index.jpg", "/a/" -> "/og/a.jpg", "/en/a/" -> "/og/en/a.jpg" */
export function ogPath(path: string): string {
  const clean = path.replace(/^\/|\/$/g, '');
  if (!clean) return '/og/index.jpg';
  if (clean === 'en') return '/og/en/index.jpg';
  return `/og/${clean}.jpg`;
}
