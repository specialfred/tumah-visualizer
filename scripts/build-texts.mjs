// Builds src/data/ohalos-text.json from the Sefaria export files in data/sources.
// Source files: https://storage.googleapis.com/sefaria-export/json/Mishnah/... (see data/sources/README.md)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => JSON.parse(readFileSync(join(root, 'data/sources', f), 'utf8'));

// Keep only <b>…</b> (used for dibbur hamaschil); drop every other tag and footnote marker.
function clean(s) {
  return s
    .replace(/<sup[^>]*>.*?<\/sup>/g, '')
    .replace(/<i[^>]*data-commentator[^>]*><\/i>/g, '')
    .replace(/<(?!\/?b>)[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const versions = {
  he: src('mishnah-he-toratemet.json'),
  en: src('mishnah-en-kulp.json'),
  bartenuraHe: src('bartenura-he.json'),
  bartenuraEn: src('bartenura-en.json'),
};

const chapters = versions.he.text.map((chapter, c) =>
  chapter.map((he, m) => ({
    ref: `${c + 1}:${m + 1}`,
    he: clean(he),
    en: clean(versions.en.text[c][m] ?? ''),
    bartenura: {
      he: (versions.bartenuraHe.text[c]?.[m] ?? []).map(clean).filter(Boolean),
      en: (versions.bartenuraEn.text[c]?.[m] ?? []).map(clean).filter(Boolean),
    },
  })),
);

const meta = Object.fromEntries(
  Object.entries(versions).map(([k, v]) => [
    k,
    { versionTitle: v.versionTitle, license: v.license ?? 'unknown', source: v.versionSource },
  ]),
);

writeFileSync(
  join(root, 'src/data/ohalos-text.json'),
  JSON.stringify({ title: { en: 'Mishnah Oholot', he: 'משנה אהלות' }, meta, chapters }),
);
console.log(`wrote ${chapters.length} chapters, ${chapters.flat().length} mishnayos`);
