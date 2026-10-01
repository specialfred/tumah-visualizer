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
      'Tumah in an air space at least a tefach cube, under a roof at least a tefach wide, defiles every susceptible thing in that space. The low space under a tent’s sloping side is part of the tent.',
      ['3:7', '7:2', '12:6', '12:7', '15:1', '15:2', '15:10'],
    ),
    r(
      'tefach-opening',
      'Tefach opening',
      'פותח טפח',
      'Tumah passes between air spaces only through an opening at least a tefach square: spaces join only where a tefach cube can move from one to the other.',
      ['3:6', '3:7', '10:1', '11:1', '15:2'],
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
      'Tumah with no tefach cube of air around it breaks straight up to the sky and down to the depths, reaching nothing beside it, even in the same small gap. A pillar is not a wall between two spaces, so tumah under it breaks up and down too.',
      ['6:6', '6:7', '7:1', '12:6', '14:7', '15:1', '15:4', '15:7'],
    ),
    r(
      'yotzeis',
      'Tumah goes out, not in',
      'דרך הטומאה לצאת ואין דרכה להכנס',
      'Tumah inside a closed space goes out into the space it would be carried into; tumah outside does not enter. A space closed off by something that is not part of the building (boards, a cupboard) lets its tumah out through it.',
      ['3:7', '4:1', '4:2', '9:9', '15:4', '15:5'],
    ),
    r(
      'no-exit',
      'No way out',
      'אין לה דרך לצאת',
      'A closed space whose only outlets are smaller than a tefach cannot let tumah out, so its tumah breaks through the building into the nearest spaces above and below it.',
      ['3:7', '6:5', '7:1', '15:5'],
    ),
    r(
      'derech-yetzia',
      'The way out',
      'דרך יציאת הטומאה',
      'The closed doors of a space with tumah are tamei, since the tumah will be taken out through them, with any tent in the doorway beyond them; an open opening of the required size (or declared intent) saves the others. Where the tumah goes out into the open, a roof over its way out that makes a tent beside it carries the tumah into that tent.',
      ['7:3', '3:6', '14:2', '14:4'],
    ),
    r(
      'kelim-einam-chotzetzim',
      'Vessels and people do not block',
      'אדם וכלים עושין אהל לטמא ולא לטהר',
      'Things that can become tamei make a tent to bring tumah but do not block it; what rests on them is treated as inside their tent. Such a roof over tumah, even seen through a small hatch, counts as full of tumah. It is as if not there, so it carries tumah through a hole in a ceiling only if the hole is a tefach square.',
      ['6:1', '9:1', '9:2', '10:4', '10:5', '11:3', '11:4', '12:4'],
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
      'Tumah (or a vessel) inside the thickness of a building element belongs to the space on its nearer side; in the exact middle it belongs to both. A closed cupboard in the wall is seen as solid.',
      ['6:3', '6:4', '6:7', '4:1'],
    ),
    r(
      'kli-cheres',
      'Earthenware',
      'כלי חרס אינו מטמא מגבו',
      'An earthenware vessel cannot become tamei from its outside, so it blocks tumah coming at it from outside, and it is not counted full of the tumah it roofs. Once tumah reaches its inside it is tamei and blocks nothing, and everything inside it is tamei.',
      ['10:6', '10:7', '12:3'],
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
      'Touching a tamei thing passes tumah along the chains of Ohalos chapter 1. The tent over the tumah is not counted as a link: what touches it is as if it touched the dead.',
      ['1:1', '1:2', '1:3', '1:4', '15:2'],
    ),
  ].map((d) => [d.id, d]),
);
