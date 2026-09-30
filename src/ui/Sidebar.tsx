import { useMemo, useState } from 'react';
import text from '../data/ohalos-text.json';
import { COVERAGE } from '../scenes/coverage';
import { SCENARIOS } from '../scenes/index';
import type { MishnaStatus } from '../scenes/types';
import { formatRef, hebrewNumeral, useT } from './i18n';
import { useStore } from './store';

const DOT: Record<MishnaStatus, string> = {
  modeled: 'bg-emerald-500',
  partial: 'bg-amber-400',
  todo: 'bg-transparent ring-1 ring-inset ring-stone-400',
  catalog: 'bg-sky-300',
};

export const STATUS_LABEL: Record<MishnaStatus, { en: string; he: string }> = {
  modeled: { en: 'Modeled', he: 'ממודל' },
  partial: { en: 'Partly modeled', he: 'ממודל בחלקו' },
  todo: { en: 'Not yet modeled', he: 'עוד לא ממודל' },
  catalog: { en: 'Not spatial (tracked as data)', he: 'אינו מרחבי' },
};

export function Sidebar() {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const mishnaRef = useStore((s) => s.mishnaRef);
  const openMishna = useStore((s) => s.openMishna);
  const current = Number(mishnaRef.split(':')[0]);
  const [open, setOpen] = useState<Set<number>>(new Set([current]));
  const cov = useMemo(() => Object.fromEntries(COVERAGE.map((c) => [c.ref, c])), []);
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of SCENARIOS) m[s.ref] = (m[s.ref] ?? 0) + 1;
    return m;
  }, []);
  const totals = useMemo(() => {
    const r: Record<MishnaStatus, number> = { modeled: 0, partial: 0, todo: 0, catalog: 0 };
    for (const c of COVERAGE) r[c.status]++;
    return r;
  }, []);

  return (
    <nav className="flex h-full flex-col">
      <div className="border-b border-stone-200 px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">{lang === 'he' ? 'מסכת' : 'Tractate'}</div>
        <div className="font-serif text-lg text-stone-900">{lang === 'he' ? 'אהלות' : 'Ohalos'}</div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-600">
          {(Object.keys(totals) as MishnaStatus[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${DOT[k]}`} />
              {totals[k]} {STATUS_LABEL[k][lang].toLowerCase()}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {text.chapters.map((ch, ci) => {
          const n = ci + 1;
          const isOpen = open.has(n);
          return (
            <div key={n} className="mb-0.5">
              <button
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-100"
                onClick={() => {
                  const s = new Set(open);
                  if (isOpen) s.delete(n);
                  else s.add(n);
                  setOpen(s);
                }}
              >
                <span>
                  {t('chapter')} {lang === 'he' ? hebrewNumeral(n) : n}
                </span>
                <span className="flex items-center gap-0.5">
                  {ch.map((m) => (
                    <span key={m.ref} className={`inline-block h-1.5 w-1.5 rounded-full ${DOT[cov[m.ref]?.status ?? 'todo']}`} />
                  ))}
                </span>
              </button>
              {isOpen && (
                <div className="ms-2 border-s border-stone-200 ps-2">
                  {ch.map((m) => {
                    const c = cov[m.ref];
                    const active = m.ref === mishnaRef;
                    return (
                      <button
                        key={m.ref}
                        onClick={() => openMishna(m.ref)}
                        title={c?.needs}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-start text-[13px] ${
                          active ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${DOT[c?.status ?? 'todo']}`} />
                        <span className="w-10 shrink-0 font-mono text-[12px]">{formatRef(m.ref, lang)}</span>
                        <span className={`truncate ${lang === 'he' ? 'font-serif' : ''}`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
                          {(lang === 'he' ? m.he : m.en).slice(0, 48)}
                        </span>
                        {counts[m.ref] ? <span className={`ms-auto text-[10px] ${active ? 'text-stone-300' : 'text-stone-400'}`}>{counts[m.ref]}</span> : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
