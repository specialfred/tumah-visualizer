import { useEffect, useState } from 'react';
import { Inspector } from './Inspector';
import { ShittosPanel } from './ShittosPanel';
import { Sidebar } from './Sidebar';
import { TextPanel } from './TextPanel';
import { Viewport } from './Viewport';
import { STATUS_COLORS } from './colors';
import { pick, useT, type StringKey } from './i18n';
import { useStore, type RightTab } from './store';
import { TEMPLATES, type Template } from './templates';

export function App() {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const tab = useStore((s) => s.tab);
  const setTab = useStore((s) => s.setTab);
  useShortcuts();

  return (
    <div className="flex h-full flex-col bg-[#f4f1ea] text-stone-900" lang={lang} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-stone-200 bg-white/80 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">{t('appTitle')}</span>
          <span className="font-serif text-[15px] text-stone-500" dir="rtl">
            אהלות
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-0.5 text-[12.5px]">
          {(['en', 'he'] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`rounded-md px-2.5 py-1 ${lang === l ? 'bg-white shadow-sm' : 'text-stone-500'}`}>
              {l === 'en' ? 'English' : 'עברית'}
            </button>
          ))}
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="w-72 shrink-0 border-e border-stone-200 bg-white/70">
          <Sidebar />
        </aside>
        <main className="relative min-w-0 flex-1">
          <Viewport />
          <Toolbar />
          <MoveHint />
          <Legend />
          <Status />
        </main>
        <aside className="flex w-[400px] shrink-0 flex-col border-s border-stone-200 bg-[#faf8f4]">
          <div className="flex shrink-0 gap-1 border-b border-stone-200 px-3 pt-2">
            {(['text', 'inspect', 'shittos'] as RightTab[]).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`-mb-px border-b-2 px-3 py-2 text-[13px] font-medium ${tab === k ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
              >
                {t(k as StringKey)}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === 'text' && <TextPanel />}
            {tab === 'inspect' && <Inspector />}
            {tab === 'shittos' && <ShittosPanel />}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 20 L12 5 L21 20 Z" fill="none" stroke="#1c1917" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="16" r="2.4" fill="#e11d48" />
    </svg>
  );
}

function Toolbar() {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const addTemplate = useStore((s) => s.addTemplate);
  const newScene = useStore((s) => s.newScene);
  const undo = useStore((s) => s.undo);
  const canUndo = useStore((s) => s.history.length > 0);
  const [open, setOpen] = useState(false);
  const groups: Template['group'][] = ['tumah', 'vessels', 'people', 'building'];
  const groupLabel = { tumah: { en: 'Tumah', he: 'טומאה' }, vessels: { en: 'Vessels', he: 'כלים' }, people: { en: 'People', he: 'אדם' }, building: { en: 'Building', he: 'בנין' } };

  const toggle = (k: 'showAir' | 'xray' | 'labels', label: StringKey) => (
    <button
      onClick={() => setView({ [k]: !view[k] })}
      className={`rounded-md px-2.5 py-1 text-[12.5px] ${view[k] ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
    >
      {t(label)}
    </button>
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
      <div className="pointer-events-auto relative">
        <div className="flex items-center gap-1 rounded-xl bg-white/95 p-1 shadow-sm ring-1 ring-stone-900/10">
          <button onClick={() => setOpen(!open)} className="rounded-lg bg-stone-900 px-3 py-1 text-[12.5px] font-medium text-white">
            + {t('add')}
          </button>
          <button onClick={undo} disabled={!canUndo} className="rounded-lg px-2.5 py-1 text-[12.5px] text-stone-700 hover:bg-stone-100 disabled:opacity-40">
            {t('undo')}
          </button>
          <button onClick={newScene} className="rounded-lg px-2.5 py-1 text-[12.5px] text-stone-700 hover:bg-stone-100">
            {t('newScene')}
          </button>
        </div>
        {open && (
          <div className="mt-2 w-[440px] rounded-xl bg-white p-3 shadow-lg ring-1 ring-stone-900/10">
            <div className="grid grid-cols-2 gap-3">
              {groups.map((g) => (
                <div key={g}>
                  <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-stone-400">{pick(groupLabel[g], lang)}</div>
                  {TEMPLATES.filter((x) => x.group === g).map((x) => (
                    <button
                      key={x.id}
                      onClick={() => {
                        addTemplate(x.id);
                        setOpen(false);
                      }}
                      className="block w-full rounded-md px-2 py-1 text-start text-[12.5px] text-stone-800 hover:bg-stone-100"
                    >
                      {pick(x.label, lang)}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="pointer-events-auto flex items-center gap-1 rounded-xl bg-white/95 p-1 shadow-sm ring-1 ring-stone-900/10">
        {toggle('showAir', 'tameiAir')}
        {toggle('xray', 'xray')}
        {toggle('labels', 'labels')}
        <span className="mx-1 h-4 w-px bg-stone-200" />
        <span className="px-1 text-[11.5px] text-stone-500">{t('snap')}</span>
        {[
          [4, 'tefach'],
          [1, 'etzba'],
        ].map(([v, k]) => (
          <button
            key={k}
            onClick={() => setView({ snap: v as number })}
            className={`rounded-md px-2 py-1 text-[12.5px] ${view.snap === v ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            {t(k as StringKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Legend() {
  const t = useT();
  const items: [string, StringKey, string?][] = [
    [STATUS_COLORS.source, 'legendSource'],
    [STATUS_COLORS.tamei7, 'legendTamei7'],
    [STATUS_COLORS.tameiErev, 'legendErev'],
    [STATUS_COLORS.tahor, 'legendTahor'],
    ['#f43f5e', 'legendAir', 'opacity-30'],
  ];
  return (
    <div className="pointer-events-none absolute bottom-3 start-3 flex flex-wrap gap-3 rounded-xl bg-white/90 px-3 py-2 text-[12px] text-stone-700 shadow-sm ring-1 ring-stone-900/10">
      {items.map(([c, k, extra]) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 rounded-sm ${extra ?? ''}`} style={{ background: c }} />
          {t(k)}
        </span>
      ))}
    </div>
  );
}

function Status() {
  const t = useT();
  const ev = useStore((s) => s.evaluation);
  const err = useStore((s) => s.engineError);
  if (err) return <div className="absolute bottom-3 end-3 rounded-lg bg-rose-50 px-3 py-1.5 text-[12px] text-rose-700 ring-1 ring-rose-200">{err}</div>;
  if (!ev) return <div className="absolute bottom-3 end-3 text-[12px] text-stone-500">{t('computing')}</div>;
  return null;
}

// Arrow keys slide the selected object along the floor; Page Up / Page Down lift and lower it.
const NUDGE: Record<string, [number, number, number]> = {
  ArrowLeft: [-1, 0, 0],
  ArrowRight: [1, 0, 0],
  ArrowUp: [0, 1, 0],
  ArrowDown: [0, -1, 0],
  PageUp: [0, 0, 1],
  PageDown: [0, 0, -1],
};

function MoveHint() {
  const t = useT();
  const selected = useStore((s) => s.selected);
  if (!selected) return null;
  return (
    <div className="pointer-events-none absolute start-1/2 top-[72px] -translate-x-1/2 rounded-full bg-stone-900/85 px-3 py-1 text-[12px] text-white shadow rtl:translate-x-1/2">
      {t('moveHint')}
    </div>
  );
}

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const s = useStore.getState();
      if ((e.key === 'Delete' || e.key === 'Backspace') && s.selected) s.removeObject(s.selected);
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        s.undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'd' && s.selected) {
        e.preventDefault();
        s.duplicateObject(s.selected);
      } else if (e.key === 'Escape') s.select(null);
      else if (s.selected && e.key in NUDGE) {
        e.preventDefault();
        const [x, y, z] = NUDGE[e.key];
        s.nudge(s.selected, [x * s.view.snap, y * s.view.snap, z * s.view.snap]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
