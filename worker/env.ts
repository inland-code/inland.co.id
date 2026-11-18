export interface Env {
  ASSETS: Fetcher;
  /** D1 untuk pesan formulir kontak (opsional sampai dibuat). */
  DB?: D1Database;
  WHATSAPP_NUMBER: string;

  /* ---- Dashboard ---- */
  /** Email pemilik yang boleh masuk dashboard (dicek dari token Cloudflare Access). */
  ADMIN_EMAIL?: string;
  /** Domain tim Zero Trust, mis. "inland.cloudflareaccess.com". */
  ACCESS_TEAM_DOMAIN?: string;
  /** Application Audience (AUD) tag aplikasi Access untuk /admin. */
  ACCESS_AUD?: string;
  /** Secret: fine-grained PAT GitHub (Contents: read & write, Actions: read) khusus repo ini. */
  GITHUB_TOKEN?: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  /** Hanya untuk pengujian lokal (mock GitHub). */
  GITHUB_API?: string;
  /** "1" = lewati Access di localhost (hanya `wrangler dev`). */
  ADMIN_DEV_BYPASS?: string;
}
