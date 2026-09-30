import { Fragment, useState } from 'react';
import text from '../data/ohalos-text.json';
import { COVERAGE } from '../scenes/coverage';
import { SCENARIOS } from '../scenes/index';
import type { Expectation } from '../scenes/types';
import type { ObjectResult } from '../engine/types';
import { formatRef, pick, useT } from './i18n';
import { STATUS_LABEL } from './Sidebar';
import { useStore } from './store';

/** Render Sefaria text, keeping only <b>…</b> (dibbur hamaschil) as bold. */
export function RichText({ s }: { s: string }) {
  const parts = s.split(/<b>(.*?)<\/b>/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

function verdict(r: ObjectResult | undefined): Expectation {
  if (!r || r.status !== 'tamei') return 'tahor';
  return r.sevenDay ? 'tamei7' : 'tameiErev';
}

function matches(want: Expectation, got: Expectation) {
  if (want === 'tamei') return got !== 'tahor';
  return want === got;
}

export function TextPanel() {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const ref = useStore((s) => s.mishnaRef);
  const scenarioId = useStore((s) => s.scenarioId);
  const loadScenario = useStore((s) => s.loadScenario);
  const modified = useStore((s) => s.modified);
  const evaluation = useStore((s) => s.evaluation);
  const scene = useStore((s) => s.scene);
  const [both, setBoth] = useState(false);
  const [showBartenura, setShowBartenura] = useState(false);
  const [c, m] = ref.split(':').map(Number);
  const mishna = text.chapters[c - 1][m - 1];
  const scenarios = SCENARIOS.filter((s) => s.ref === ref);
  const current = scenarios.find((s) => s.id === scenarioId);
  const cov = COVERAGE.find((x) => x.ref === ref);
  const other = lang === 'he' ? 'en' : 'he';

  const block = (l: 'he' | 'en', s: string) => (
    <p dir={l === 'he' ? 'rtl' : 'ltr'} className={l === 'he' ? 'font-serif text-[17px] leading-8 text-stone-900' : 'text-[14px] leading-6 text-stone-800'}>
      {s}
    </p>
  );

  return (
    <div className="space-y-5 p-4">
      <header>
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-stone-900">
            {lang === 'he' ? 'אהלות' : 'Ohalos'} {formatRef(ref, lang)}
          </h2>
          {cov && <span className="text-[11px] text-stone-500">{STATUS_LABEL[cov.status][lang]}</span>}
        </div>
        {cov?.needs && <p className="mt-1 text-[12px] leading-5 text-stone-500">{cov.needs}</p>}
      </header>

      <section className="space-y-3">
        {block(lang, lang === 'he' ? mishna.he : mishna.en)}
        {both && <div className="border-t border-stone-200 pt-3">{block(other, other === 'he' ? mishna.he : mishna.en)}</div>}
        <div className="flex gap-3 text-[12px]">
          <button className="text-stone-500 underline-offset-2 hover:underline" onClick={() => setBoth(!both)}>
            {both ? (lang === 'he' ? 'הסתר אנגלית' : 'Hide Hebrew') : lang === 'he' ? 'הצג גם אנגלית' : 'Show Hebrew too'}
          </button>
          <button className="text-stone-500 underline-offset-2 hover:underline" onClick={() => setShowBartenura(!showBartenura)}>
            {t('bartenura')} {showBartenura ? '▾' : '▸'}
          </button>
        </div>
        {showBartenura && (
          <ol className="space-y-2 rounded-lg bg-stone-50 p-3 ring-1 ring-stone-200" dir={lang === 'he' ? 'rtl' : 'ltr'}>
            {mishna.bartenura[lang].map((b, i) => (
              <li key={i} className={lang === 'he' ? 'font-serif text-[15px] leading-7 text-stone-800' : 'text-[13px] leading-6 text-stone-700'}>
                <RichText s={b} />
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500">{t('scenarios')}</h3>
        {scenarios.length === 0 && <p className="text-[13px] text-stone-500">{t('noScenarios')}</p>}
        <div className="space-y-1.5">
          {scenarios.map((s) => {
            const active = s.id === scenarioId;
            return (
              <button
                key={s.id}
                onClick={() => loadScenario(s.id)}
                className={`block w-full rounded-lg px-3 py-2 text-start text-[13px] ring-1 transition ${
                  active ? 'bg-stone-900 text-white ring-stone-900' : 'bg-white text-stone-800 ring-stone-200 hover:ring-stone-400'
                }`}
              >
                <div className="font-medium">{pick(s.title, lang)}</div>
                {s.shittos && <div className={`mt-0.5 text-[11px] ${active ? 'text-stone-300' : 'text-stone-500'}`}>{Object.values(s.shittos).join(', ')}</div>}
                {s.status === 'pending' && <div className="mt-0.5 text-[11px] text-amber-500">{t('pending')}</div>}
              </button>
            );
          })}
        </div>
      </section>

      {current && (
        <section className="rounded-lg bg-white p-3 ring-1 ring-stone-200">
          {current.clause && <blockquote className="mb-3 border-s-2 border-stone-300 ps-3 text-[13px] italic leading-6 text-stone-600">“{current.clause.en}”</blockquote>}
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500">{t('rulings')}</h3>
          {modified && <p className="mb-2 text-[12px] text-amber-600">{t('modified')}</p>}
          <ul className="space-y-1">
            {Object.entries(current.expect).map(([id, want]) => {
              const o = scene.objects.find((x) => x.id === id);
              const got = verdict(evaluation?.objects[id]);
              const ok = matches(want, got);
              return (
                <li key={id} className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="text-stone-700">{o ? pick(o.label, lang) : id}</span>
                  <span className="flex items-center gap-2">
                    <span className={want === 'tahor' ? 'text-teal-700' : 'text-rose-700'}>{want === 'tahor' ? t('tahor') : want === 'tameiErev' ? t('tameiErev') : want === 'tamei7' ? t('tamei7') : lang === 'he' ? 'טמא' : 'Tamei'}</span>
                    {evaluation && !modified && (
                      <span title={ok ? t('engineAgrees') : t('engineDisagrees')} className={ok ? 'text-emerald-600' : 'text-rose-600'}>
                        {ok ? '✓' : '✗'}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          {current.notes && <p className="mt-2 text-[12px] leading-5 text-stone-500">{current.notes}</p>}
        </section>
      )}
    </div>
  );
}
