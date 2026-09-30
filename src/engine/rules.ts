// The rule catalog. Every tumah the engine assigns cites one of these, and each rule cites the
// mishnayos it is derived from. Rules are general: no rule may mention a specific scenario.
import type { Text } from './types';

export interface RuleDef {
  id: string;
  name: Text;
  summary: Text;
  refs: string[];
}

const r = (id: string, en: string, he: string, summary: string, refs: string[]): RuleDef => ({
  id,
  name: { en, he },
  summary: { en: summary },
  refs,
});

export const RULES: Record<string, RuleDef> = Object.fromEntries(
  [
    r(
      'ohel',
      'Tent of the dead',
      'אהל המת',
      'Tumah in an air space at least a tefach cube, under a roof at least a tefach wide, defiles every susceptible thing in that space.',
      ['3:7', '12:6', '15:1', '15:2'],
    ),
    r(
      'tefach-opening',
      'Tefach opening',
      'פותח טפח',
      'Tumah passes between air spaces only through an opening at least a tefach square.',
      ['3:6', '3:7', '10:1', '11:1'],
    ),
    r(
      'maahil',
      'Overshadowing in the open',
      'מאהיל',
      'Outside a tent, tumah defiles what is directly above it and directly below it.',
      ['9:1', '12:2', '14:5'],
    ),
    r(
      'retzutzah',
      'Compressed tumah',
      'טומאה רצוצה בוקעת ועולה',
      'Tumah with no tefach cube of air around it breaks straight up to the sky and down to the depths.',
      ['7:1', '12:6', '14:7', '15:1', '15:7'],
    ),
    r(
      'yotzeis',
      'Tumah goes out, not in',
      'דרך הטומאה לצאת ואין דרכה להכנס',
      'Tumah inside a closed space goes out into the space it would be carried into; tumah outside does not enter.',
      ['3:7', '4:1', '4:2', '9:9', '15:5'],
    ),
    r(
      'no-exit',
      'No way out',
      'אין לה דרך לצאת',
      'A closed space whose only outlets are smaller than a tefach cannot let tumah out, so its tumah rises into the space above it.',
      ['3:7', '15:5'],
    ),
    r(
      'derech-yetzia',
      'The way out',
      'דרך יציאת הטומאה',
      'The closed doors of a space with tumah are tamei, since the tumah will be taken out through them; an open opening of the required size (or declared intent) saves the others.',
      ['7:3', '3:6'],
    ),
    r(
      'kelim-einam-chotzetzim',
      'Vessels and people do not block',
      'אדם וכלים עושין אהל לטמא ולא לטהר',
      'Things that can become tamei make a tent to bring tumah but do not block it; what rests on them is treated as inside their tent.',
      ['6:1', '9:1', '9:2'],
    ),
    r(
      'chatzitzah',
      'Blocking',
      'חציצה',
      'Things that cannot become tamei and stay put by themselves block tumah.',
      ['6:1', '6:2', '8:1', '8:5'],
    ),
    r(
      'tzamid-pasil',
      'Tightly sealed',
      'צמיד פתיל',
      'An earthenware vessel (or a vessel that cannot become tamei) closed with a tight lid protects what is inside it.',
      ['5:3', '8:6', '9:1'],
    ),
    r(
      'kli-cheres',
      'Earthenware from inside',
      'כלי חרס מיטמא מאוירו',
      'An earthenware vessel becomes tamei only when its inside air is in the ohel.',
      ['5:3', '8:6'],
    ),
    r(
      'chatzi-kotel',
      'Halves of a wall',
      'כותל המשמש את הבית נידון מחצה על מחצה',
      'Tumah (or a vessel) inside the thickness of a building element belongs to the space on its nearer side; in the exact middle it belongs to both.',
      ['6:3', '6:4', '4:1'],
    ),
    r(
      'karka-habayis',
      'The floor is the house',
      'ארצו של בית כמוהו עד התהום',
      'A closed gap smaller than a tefach under or inside a building belongs to the house above it, in both directions.',
      ['3:7', '15:5'],
    ),
    r(
      'maga',
      'Contact',
      'מגע',
      'Touching a tamei thing passes tumah along the chains of Ohalos chapter 1.',
      ['1:1', '1:2', '1:3', '1:4'],
    ),
  ].map((d) => [d.id, d]),
);
