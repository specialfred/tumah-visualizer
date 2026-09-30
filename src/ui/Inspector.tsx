import { RULES } from '../engine/rules';
import { resolveProps } from '../engine/props';
import { TEFACH, type Material, type ObjectKind, type ObjectProps, type Reason, type SceneObject, type TumahKind } from '../engine/types';
import { formatRef, pick, useT } from './i18n';
import { anchorOf, useStore } from './store';

const KINDS: ObjectKind[] = ['vessel', 'person', 'food', 'structure', 'door', 'misc', 'animal', 'plant', 'tumah', 'cavity'];
const MATERIALS: Material[] = ['metal', 'wood', 'earthenware', 'glass', 'bone', 'cloth', 'leather', 'reed', 'stone', 'marble', 'earth', 'dung', 'plaster', 'flesh', 'food', 'plant'];
const TUMAH: TumahKind[] = ['kezayis', 'meis', 'rova-atzamos', 'rova-dam', 'shidra-gulgoles', 'etzem-kseorah'];

export function Inspector() {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const id = useStore((s) => s.selected);
  const scene = useStore((s) => s.scene);
  const evaluation = useStore((s) => s.evaluation);
  // While the engine catches up with an edit, the verdict below is for the scene as it was.
  const stale = useStore((s) => s.computing);
  const o = scene.objects.find((x) => x.id === id);
  if (!o) return <p className="p-4 text-[13px] leading-6 text-stone-500">{t('selectHint')}</p>;
  const r = evaluation?.objects[o.id];
  const status =
    o.kind === 'tumah'
      ? t('source')
      : !r
        ? '…'
        : r.status === 'tamei'
          ? r.sevenDay
            ? t('tamei7')
            : t('tameiErev')
          : r.status === 'insusceptible'
            ? t('insusceptible')
            : t('tahor');
  const pill =
    o.kind === 'tumah'
      ? 'bg-stone-900 text-white'
      : r?.status === 'tamei'
        ? r.sevenDay
          ? 'bg-rose-100 text-rose-800 ring-rose-300'
          : 'bg-amber-100 text-amber-800 ring-amber-300'
        : r?.status === 'insusceptible'
          ? 'bg-stone-100 text-stone-600 ring-stone-300'
          : 'bg-teal-50 text-teal-800 ring-teal-300';

  return (
    <div className="space-y-5 p-4">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-stone-900">{pick(o.label, lang)}</h2>
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ring-1 transition-opacity duration-200 ${pill} ${stale ? 'animate-pulse opacity-50' : ''}`}>{status}</span>
      </header>
      {r && r.reasons.length > 0 && (
        <section className={`transition-opacity duration-200 ${stale ? 'opacity-50' : ''}`}>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500">{t('why')}</h3>
          <Reasons reasons={r.reasons} />
        </section>
      )}
      <Editor o={o} />
    </div>
  );
}

function Reasons({ reasons }: { reasons: Reason[] }) {
  const lang = useStore((s) => s.lang);
  const openMishna = useStore((s) => s.openMishna);
  const scene = useStore((s) => s.scene);
  const setTab = useStore((s) => s.setTab);
  const seen = new Set<string>();
  const unique = reasons.filter((r) => {
    const k = `${r.rule}|${r.detail.en}|${r.via}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return (
    <ol className="space-y-2">
      {unique.map((r, i) => {
        const rule = RULES[r.rule];
        const via = scene.objects.find((o) => o.id === r.via);
        return (
          <li key={i} className="rounded-lg bg-white p-2.5 ring-1 ring-stone-200">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-medium text-stone-900">{rule ? pick(rule.name, lang) : r.rule}</span>
              {rule?.name.he && lang === 'en' && <span className="font-serif text-[13px] text-stone-500" dir="rtl">{rule.name.he}</span>}
            </div>
            <p className="mt-1 text-[12.5px] leading-5 text-stone-600">{r.detail.en}</p>
            {via && <p className="mt-1 text-[11.5px] text-stone-500">← {pick(via.label, lang)}</p>}
            {r.refs.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {r.refs.map((ref) => (
                  <button
                    key={ref}
                    onClick={() => {
                      openMishna(ref);
                      setTab('text');
                    }}
                    className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-700 hover:bg-stone-200"
                  >
                    {formatRef(ref, lang)}
                  </button>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function NumberField({ label, value, onChange, step = 0.25 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase text-stone-400">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!Number.isNaN(v)) onChange(v);
        }}
        className="w-full rounded-md border border-stone-300 bg-white px-2 py-1 font-mono text-[12px] text-stone-800 focus:border-stone-500 focus:outline-none"
      />
    </label>
  );
}

function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 text-[12.5px] text-stone-700">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="rounded-md border border-stone-300 bg-white px-2 py-1 text-[12px]">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

type Tri = 'auto' | 'yes' | 'no';
function TriField({ label, prop, o, resolved }: { label: string; prop: keyof ObjectProps; o: SceneObject; resolved: ObjectProps }) {
  const update = useStore((s) => s.updateObject);
  const cur: Tri = o.props?.[prop] === undefined ? 'auto' : o.props[prop] ? 'yes' : 'no';
  return (
    <label className="flex items-center justify-between gap-2 text-[12.5px] text-stone-700">
      <span>
        {label} <span className="text-stone-400">({resolved[prop] ? 'yes' : 'no'})</span>
      </span>
      <select
        value={cur}
        onChange={(e) =>
          update(o.id, (x) => {
            const props = { ...x.props };
            const v = e.target.value as Tri;
            if (v === 'auto') delete props[prop];
            else props[prop] = v === 'yes';
            return { ...x, props };
          })
        }
        className="rounded-md border border-stone-300 bg-white px-2 py-1 text-[12px]"
      >
        <option value="auto">auto</option>
        <option value="yes">yes</option>
        <option value="no">no</option>
      </select>
    </label>
  );
}

function Editor({ o }: { o: SceneObject }) {
  const t = useT();
  const update = useStore((s) => s.updateObject);
  const moveObjectTo = useStore((s) => s.moveObjectTo);
  const remove = useStore((s) => s.removeObject);
  const duplicate = useStore((s) => s.duplicateObject);
  const a = anchorOf(o);
  const resolved = resolveProps(o);
  const single = o.parts.length === 1 && !o.container;
  const tz = (v: number) => v / TEFACH;

  return (
    <section className="space-y-4">
      <div>
        <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500">{t('position')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['x', 'y', 'z'] as const).map((axis, k) => (
            <NumberField
              key={axis}
              label={axis}
              value={tz(a[k])}
              onChange={(v) => {
                const n = [...a] as [number, number, number];
                n[k] = Math.round(v * TEFACH);
                moveObjectTo(o.id, n);
              }}
            />
          ))}
        </div>
      </div>
      {single && (
        <div>
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500">{t('size')}</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['w', 'd', 'h'] as const).map((axis, k) => (
              <NumberField
                key={axis}
                label={axis}
                value={tz(o.parts[0].size[k])}
                onChange={(v) =>
                  update(o.id, (x) => {
                    const size = [...x.parts[0].size] as [number, number, number];
                    size[k] = Math.max(1, Math.round(v * TEFACH));
                    return { ...x, parts: [{ ...x.parts[0], size }] };
                  })
                }
              />
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">{t('properties')}</h3>
        <Select label="Kind" value={o.kind} options={KINDS} onChange={(kind) => update(o.id, (x) => ({ ...x, kind, tumah: kind === 'tumah' ? (x.tumah ?? { kind: 'kezayis' }) : undefined }))} />
        <Select label="Material" value={o.material} options={MATERIALS} onChange={(material) => update(o.id, (x) => ({ ...x, material }))} />
        {o.kind === 'tumah' && o.tumah && (
          <>
            <Select label="Tumah" value={o.tumah.kind} options={TUMAH} onChange={(kind) => update(o.id, (x) => ({ ...x, tumah: { ...x.tumah!, kind } }))} />
            <NumberField label="Measures (1 = a full shiur)" value={o.tumah.amount ?? 1} step={0.5} onChange={(amount) => update(o.id, (x) => ({ ...x, tumah: { ...x.tumah!, amount } }))} />
          </>
        )}
        {o.kind !== 'tumah' && o.kind !== 'cavity' && (
          <>
            <TriField label="Can become tamei" prop="susceptible" o={o} resolved={resolved} />
            <TriField label="Has vessel status" prop="vessel" o={o} resolved={resolved} />
            <TriField label="Stable (not floating/flapping)" prop="stable" o={o} resolved={resolved} />
            <TriField label="Part of the building" prop="structural" o={o} resolved={resolved} />
          </>
        )}
        {o.container && (
          <>
            <label className="flex items-center justify-between text-[12.5px] text-stone-700">
              <span>Sealed (צמיד פתיל)</span>
              <input type="checkbox" checked={!!o.container.sealed} disabled title="Rebuild from the palette to change the mouth" />
            </label>
            <NumberField
              label="Capacity (se’ah)"
              value={o.container.volumeSeah ?? 0}
              step={1}
              onChange={(volumeSeah) => update(o.id, (x) => ({ ...x, container: { ...x.container!, volumeSeah } }))}
            />
          </>
        )}
        {o.kind === 'door' && (
          <label className="flex items-center justify-between text-[12.5px] text-stone-700">
            <span>Intended way out (7:3)</span>
            <input type="checkbox" checked={!!o.intendedExit} onChange={(e) => update(o.id, (x) => ({ ...x, intendedExit: e.target.checked }))} />
          </label>
        )}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => duplicate(o.id)} className="rounded-md bg-stone-100 px-3 py-1.5 text-[12.5px] text-stone-800 hover:bg-stone-200">
          {t('duplicate')}
        </button>
        <button onClick={() => remove(o.id)} className="rounded-md bg-rose-50 px-3 py-1.5 text-[12.5px] text-rose-700 hover:bg-rose-100">
          {t('delete')}
        </button>
      </div>
    </section>
  );
}
