import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { pageSchema, postSchema } from './content/schema';

export type { Section } from './content/schema';

/** id entri = path file tanpa ekstensi (mis. "en/about-inland"), bukan field slug. */
const fileId = ({ entry }: { entry: string }) => entry.replace(/\.(json|mdx?)$/, '');

/**
 * Konvensi lokasi file:
 *   src/content/pages/<locale>/<nama>.json
 *   src/content/posts/<locale>/<nama>.md
 * Skema (dan label untuk dashboard) ada di src/content/schema.ts.
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pages', generateId: fileId }),
  schema: pageSchema,
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts', generateId: fileId }),
  schema: postSchema,
});

export const collections = { pages, posts };
