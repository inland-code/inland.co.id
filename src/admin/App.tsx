import { useEffect, useState } from 'preact/hooks';
import { api, loadSchema, type Me, type StaticSchema } from './api';
import { StaticCtx, ToastCtx } from './state';
import { ErrorBox, Loading, Messages, MediaView, Overview, PageEditor, PagesList, PostEditor, PostsList, Redirects, Settings } from './views';

const NAV = [
  ['#/', 'Ringkasan'],
  ['#/pages', 'Halaman'],
  ['#/posts', 'Artikel'],
  ['#/media', 'Media'],
  ['#/messages', 'Pesan Masuk'],
  ['#/settings', 'Data Bisnis'],
  ['#/redirects', 'Redirect'],
] as const;

function useHash() {
  const [hash, setHash] = useState(location.hash || '#/');
  useEffect(() => {
    const on = () => setHash(location.hash || '#/');
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const [me, setMe] = useState<Me>();
  const [schema, setSchema] = useState<StaticSchema>();
  const [error, setError] = useState<string>();
  const [toasts, setToasts] = useState<{ id: number; kind: 'ok' | 'err'; text: string }[]>([]);

  useEffect(() => {
    Promise.all([api.me(), loadSchema()])
      .then(([m, s]) => {
        setMe(m);
        setSchema(s);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const toast = (t: { kind: 'ok' | 'err'; text: string }) => {
    const id = Date.now() + Math.random();
    setToasts((x) => [...x, { id, ...t }]);
    setTimeout(() => setToasts((x) => x.filter((y) => y.id !== id)), t.kind === 'err' ? 9000 : 5000);
  };

  if (error) return <div class="mx-auto max-w-lg p-10"><ErrorBox text={`Tidak bisa masuk dashboard: ${error}`} /></div>;
  if (!me || !schema) return <Loading text="Memuat dashboard…" />;

  const [route, query = ''] = hash.slice(1).split('?');
  const params = new URLSearchParams(query);
  const view = (() => {
    switch (route) {
      case '/pages': return <PagesList />;
      case '/pages/edit': return <PageEditor key={params.get('path')} path={params.get('path') ?? ''} />;
      case '/posts': return <PostsList />;
      case '/posts/edit': return <PostEditor key={params.get('path')} path={params.get('path') ?? ''} />;
      case '/media': return <MediaView />;
      case '/messages': return <Messages />;
      case '/settings': return <Settings />;
      case '/redirects': return <Redirects />;
      default: return <Overview me={me} />;
    }
  })();
  const active = (h: string) => (h === '#/' ? route === '/' || route === '' : route?.startsWith(h.slice(1)));

  return (
    <StaticCtx.Provider value={schema}>
      <ToastCtx.Provider value={toast}>
        <div class="min-h-dvh bg-surface-alt lg:grid lg:grid-cols-[15rem_1fr]">
          <aside class="bg-espresso-950 text-white/80 lg:sticky lg:top-0 lg:h-dvh">
            <div class="flex items-center justify-between px-5 py-5 lg:block">
              <p class="text-lg font-bold text-white">Inland <span class="text-brand-400">Dashboard</span></p>
              <p class="truncate text-xs text-white/50 lg:mt-1">{me.email}</p>
            </div>
            <nav class="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
              {NAV.map(([h, l]) => (
                <a href={h} class={`block shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${active(h) ? 'bg-brand-500 text-white' : 'hover:bg-white/10'}`}>{l}</a>
              ))}
              <a href="/" target="_blank" rel="noopener" class="block shrink-0 rounded-lg px-3 py-2 text-sm hover:bg-white/10">Lihat situs ↗</a>
            </nav>
          </aside>
          <main class="mx-auto w-full max-w-6xl p-5 sm:p-8">{view}</main>
        </div>
        <div class="fixed right-4 bottom-4 z-50 space-y-2" aria-live="polite">
          {toasts.map((t) => (
            <p class={`max-w-sm rounded-xl px-4 py-3 text-sm shadow-lg ${t.kind === 'ok' ? 'bg-espresso-900 text-white' : 'bg-red-600 text-white'}`}>{t.text}</p>
          ))}
        </div>
      </ToastCtx.Provider>
    </StaticCtx.Provider>
  );
}
