import type { Lang, Text } from '../engine/types';
import { useStore } from './store';

const STRINGS = {
  appTitle: { en: 'Tumah Visualizer', he: 'מדמה טומאה' },
  tractate: { en: 'Ohalos', he: 'אהלות' },
  chapter: { en: 'Chapter', he: 'פרק' },
  mishna: { en: 'Mishna', he: 'משנה' },
  text: { en: 'Text', he: 'לשון המשנה' },
  inspect: { en: 'Inspector', he: 'בדיקה' },
  shittos: { en: 'Shittos', he: 'שיטות' },
  bartenura: { en: 'Bartenura', he: 'ברטנורא' },
  scenarios: { en: 'Cases in this mishna', he: 'מקרים במשנה' },
  noScenarios: { en: 'No 3D cases for this mishna yet.', he: 'אין עדיין מקרים לדמות במשנה זו.' },
  rulings: { en: 'The mishna rules', he: 'דין המשנה' },
  engineAgrees: { en: 'engine agrees', he: 'המנוע מסכים' },
  engineDisagrees: { en: 'engine disagrees', he: 'המנוע חולק' },
  modified: { en: 'You changed this scene — the mishna’s rulings describe the original setup.', he: 'שינית את המקרה — דין המשנה מתייחס למקרה המקורי.' },
  pending: { en: 'Pending: the engine does not reproduce this ruling yet.', he: 'ממתין: המנוע עוד אינו משחזר דין זה.' },
  moveHint: {
    en: 'Drag to slide along the floor · Shift-drag to raise or lower · or use the arrow keys and Page Up/Down',
    he: 'גרור להזזה על הרצפה · Shift וגרירה להגבהה או הנמכה · או מקשי החצים ו־Page Up/Down',
  },
  selectHint: { en: 'Click an object to see why it is tamei or tahor, and to edit it.', he: 'לחץ על חפץ כדי לראות מדוע הוא טמא או טהור.' },
  tamei7: { en: 'Tamei — seven days', he: 'טמא טומאת שבעה' },
  tameiErev: { en: 'Tamei — until evening', he: 'טמא טומאת ערב' },
  tahor: { en: 'Tahor', he: 'טהור' },
  source: { en: 'Source of tumah', he: 'אב הטומאה' },
  insusceptible: { en: 'Does not become tamei', he: 'אינו מקבל טומאה' },
  why: { en: 'Why', he: 'מדוע' },
  add: { en: 'Add', he: 'הוסף' },
  newScene: { en: 'Empty scene', he: 'מקרה ריק' },
  undo: { en: 'Undo', he: 'בטל' },
  tameiAir: { en: 'Tamei air', he: 'אויר טמא' },
  xray: { en: 'See-through walls', he: 'קירות שקופים' },
  labels: { en: 'Labels', he: 'תוויות' },
  snap: { en: 'Snap', he: 'הצמדה' },
  tefach: { en: 'tefach', he: 'טפח' },
  etzba: { en: 'etzba', he: 'אצבע' },
  delete: { en: 'Delete', he: 'מחק' },
  duplicate: { en: 'Duplicate', he: 'שכפל' },
  position: { en: 'Position (tefachim)', he: 'מקום (טפחים)' },
  size: { en: 'Size (tefachim)', he: 'גודל (טפחים)' },
  properties: { en: 'Properties', he: 'תכונות' },
  default: { en: 'default', he: 'ברירת מחדל' },
  notModeled: { en: 'not modeled yet', he: 'עוד לא ממודל' },
  legendTamei7: { en: 'Tamei (7 days)', he: 'טמא שבעה' },
  legendErev: { en: 'Tamei (evening)', he: 'טמא ערב' },
  legendTahor: { en: 'Tahor', he: 'טהור' },
  legendSource: { en: 'Tumah', he: 'טומאה' },
  legendAir: { en: 'Tamei space', he: 'אהל טמא' },
  computing: { en: 'computing…', he: 'מחשב…' },
} satisfies Record<string, Text & { he: string }>;

export type StringKey = keyof typeof STRINGS;

export function useT() {
  const lang = useStore((s) => s.lang);
  return (k: StringKey) => STRINGS[k][lang];
}

export function pick(t: Text | undefined, lang: Lang): string {
  if (!t) return '';
  return (lang === 'he' && t.he) || t.en;
}

export function hebrewNumeral(n: number): string {
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  if (n === 15) return 'טו';
  if (n === 16) return 'טז';
  return tens[Math.floor(n / 10)] + ones[n % 10];
}

export function formatRef(ref: string, lang: Lang): string {
  if (lang === 'en') return ref;
  const [c, m] = ref.split(':').map(Number);
  return `${hebrewNumeral(c)}:${hebrewNumeral(m)}`;
}
