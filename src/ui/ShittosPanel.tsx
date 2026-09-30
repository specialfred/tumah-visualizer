import { DISPUTES } from '../engine/shittos';
import { formatRef, pick, useT } from './i18n';
import { useStore } from './store';

export function ShittosPanel() {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const shittos = useStore((s) => s.shittos);
  const setShitah = useStore((s) => s.setShitah);
  const openMishna = useStore((s) => s.openMishna);
  const sorted = [...DISPUTES].sort((a, b) => Number(b.modeled) - Number(a.modeled));
  return (
    <div className="space-y-3 p-4">
      <p className="text-[12.5px] leading-5 text-stone-500">
        {lang === 'he'
          ? 'בחר שיטה בכל מחלוקת. ברירת המחדל היא ההלכה לפי הברטנורא, או תנא קמא.'
          : 'Pick an opinion in each dispute. The default is the halacha per Bartenura where he rules, otherwise the first opinion in the mishna.'}
      </p>
      {sorted.map((d) => (
        <fieldset key={d.id} className={`rounded-lg bg-white p-3 ring-1 ring-stone-200 ${d.modeled ? '' : 'opacity-60'}`}>
          <legend className="sr-only">{pick(d.topic, lang)}</legend>
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="text-[13px] font-medium leading-5 text-stone-900">{pick(d.topic, lang)}</div>
            <button onClick={() => openMishna(d.ref)} className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-700 hover:bg-stone-200">
              {formatRef(d.ref, lang)}
            </button>
          </div>
          {!d.modeled && <div className="mb-1 text-[11px] text-stone-500">{t('notModeled')}</div>}
          <div className="space-y-1">
            {d.options.map((o) => (
              <label key={o.id} className="flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1 hover:bg-stone-50">
                <input
                  type="radio"
                  name={d.id}
                  className="mt-1 accent-stone-900"
                  checked={(shittos[d.id] ?? d.defaultOption) === o.id}
                  disabled={!d.modeled}
                  onChange={() => setShitah(d.id, o.id)}
                />
                <span className="text-[12.5px] leading-5">
                  <span className="font-medium text-stone-800">{pick(o.label, lang)}</span>
                  {o.id === d.defaultOption && <span className="ms-1 text-[10.5px] text-stone-400">({t('default')})</span>}
                  <span className="block text-stone-500">{o.summary.en}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
