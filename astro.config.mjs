// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://inland.co.id',
  // URL harus identik dengan situs WordPress lama: /slug/ (dengan trailing slash).
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  // Prefetch Astro (JS) dimatikan: navigasi instan ditangani Speculation Rules di <head> tanpa JavaScript.
  prefetch: false,
  image: {
    layout: 'constrained',
    // Dimatikan: CSS bawaan Astro tidak ber-layer sehingga mengalahkan utility Tailwind.
    responsiveStyles: false,
    breakpoints: [360, 480, 640, 768, 1024, 1280, 1600, 1920],
  },
  fonts: [
    {
      name: 'Roboto',
      cssVariable: '--font-roboto',
      provider: fontProviders.local(),
      fallbacks: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      optimizedFallbacks: true,
      display: 'swap',
      options: {
        variants: [
          {
            src: ['./node_modules/@fontsource-variable/roboto/files/roboto-latin-wght-normal.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
