import type { Env } from './env';

/**
 * Verifikasi token Cloudflare Access (header Cf-Access-Jwt-Assertion):
 * tanda tangan RS256 dengan kunci publik tim, audience, masa berlaku, dan email pemilik.
 * Access sudah memblokir di edge; verifikasi ini lapisan kedua agar API tidak bisa
 * dipanggil langsung lewat workers.dev tanpa melewati Access.
 */

type Jwk = JsonWebKey & { kid: string };
let certCache: { at: number; keys: Jwk[] } | undefined;

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function keys(team: string): Promise<Jwk[]> {
  if (certCache && Date.now() - certCache.at < 3600_000) return certCache.keys;
  const res = await fetch(`https://${team}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Gagal mengambil certs Access: ${res.status}`);
  const data = (await res.json()) as { keys: Jwk[] };
  certCache = { at: Date.now(), keys: data.keys };
  return data.keys;
}

export class AuthError extends Error {}

export async function requireAdmin(request: Request, env: Env): Promise<string> {
  const url = new URL(request.url);
  if (env.ADMIN_DEV_BYPASS === '1' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) return 'dev@localhost';

  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.ADMIN_EMAIL) throw new AuthError('Cloudflare Access / ADMIN_EMAIL belum dikonfigurasi');
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) throw new AuthError('Tidak ada token Access');

  const [h, p, sig] = token.split('.');
  if (!h || !p || !sig) throw new AuthError('Token tidak valid');
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h))) as { kid: string; alg: string };
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p))) as { aud: string | string[]; exp: number; email?: string; iss?: string };
  if (header.alg !== 'RS256') throw new AuthError('Algoritma token tidak didukung');

  const jwk = (await keys(env.ACCESS_TEAM_DOMAIN)).find((k) => k.kid === header.kid);
  if (!jwk) throw new AuthError('Kunci token tidak dikenal');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) throw new AuthError('Tanda tangan token tidak valid');

  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(env.ACCESS_AUD)) throw new AuthError('Audience token tidak cocok');
  if (payload.exp * 1000 < Date.now()) throw new AuthError('Token kedaluwarsa');
  if (payload.iss && payload.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) throw new AuthError('Penerbit token tidak cocok');
  const email = (payload.email ?? '').toLowerCase();
  if (!email || email !== env.ADMIN_EMAIL.toLowerCase()) throw new AuthError('Email tidak diizinkan');
  return email;
}
