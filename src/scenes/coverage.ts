// Coverage of every mishna in Ohalos. `status` here is the hand-maintained classification; the
// app and the coverage report combine it with the scenarios that actually exist and pass.
import type { MishnaCoverage, MishnaStatus } from './types';

const c = (ref: string, status: MishnaStatus, needs?: string): MishnaCoverage => ({ ref, status, needs });

export const COVERAGE: MishnaCoverage[] = [
  // Chapter 1 — chains of contact; kinds of tumah.
  c('1:1', 'modeled'),
  c('1:2', 'modeled'),
  c('1:3', 'partial', 'The tent does not count as a link (the Sages) is modeled; see 15:2. Not yet: Rabbi Akiva’s peg fixed in the tent (connected objects, חיבורין).'),
  c('1:4', 'modeled'),
  c('1:5', 'catalog', 'Tumas zav (midras) — outside tumas meis; listed for completeness.'),
  c('1:6', 'catalog', 'When a body begins to defile (death).'),
  c('1:7', 'catalog', 'Whole limbs defile at any size (source catalog).'),
  c('1:8', 'catalog', 'The 248 limbs; a limb without its flesh defiles by touch and carrying only.'),
  // Chapter 2 — what defiles, and how.
  ...['2:1', '2:2', '2:3', '2:4', '2:5', '2:6', '2:7'].map((r) =>
    c(r, 'catalog', 'Source catalog: which remains defile by tent, touch or carrying, and their measures (partly encoded in the engine’s source table).'),
  ),
  // Chapter 3.
  c('3:1', 'todo', 'Combining half-measures across touch, carrying and tent (Rabbi Dosa vs Sages).'),
  c('3:2', 'todo', 'Scattered corpse-mold; blood absorbed in the floor or a garment.'),
  c('3:3', 'todo', 'Blood poured on a slope or into a hollow; on a threshold. Hair, teeth and nails.'),
  c('3:4', 'todo', 'A corpse outside with its hair inside; flesh on bones partly inside (connected parts).'),
  c('3:5', 'catalog', 'What is “mixed blood”.'),
  c('3:6', 'partial', 'Modeled with intent to take the tumah out by a window (Bartenura). Not yet: an open window without intent, which the engine treats like an open door.'),
  c('3:7', 'partial', 'Drain cases modeled. Natural cavities and Rabbi Yehuda’s dispute not yet.'),
  // Chapter 4 — cupboards.
  c('4:1', 'partial', 'Modeled: the cupboard in the open with niches in its walls, the cupboard in a house, gaps under it. Not yet: Rabbi Yose’s halves.'),
  c('4:2', 'modeled'),
  c('4:3', 'todo', 'A cupboard standing in a doorway opening outward; its base under the lintel.'),
  // Chapter 5 — ovens and hatches.
  c('5:1', 'todo', 'An oven in a house with its mouth outside (Beis Shammai, Beis Hillel, Rabbi Akiva).'),
  c('5:2', 'todo', 'A perforated pot over a hatch. Beis Hillel (the halacha): the pot is tamei yet the upper story tahor, a stringency the engine cannot express: in it a tamei vessel does not block.'),
  c('5:3', 'partial', 'A whole pot over a hatch, its back to the tumah, protects the upper story. Not yet: whose pot it is (Beis Shammai: one not careful about purity protects only food, drink and earthenware).'),
  c('5:4', 'todo', 'A flagon of pure liquid; a woman kneading over the hatch.'),
  c('5:5', 'todo', 'Vessels of dung, stone or earth over a hatch; vessels known to be pure.'),
  c('5:6', 'todo', 'Vessels protect together with the walls of a tent only if they have a wall of a tefach.'),
  c('5:7', 'todo', 'A basket on pegs outside a wall; a pot hanging from a beam (Rabbi Akiva vs Sages).'),
  // Chapter 6.
  c('6:1', 'modeled'),
  c('6:2', 'modeled', 'The straw basket follows the barrel of figs.'),
  c('6:3', 'modeled'),
  c('6:4', 'modeled', 'Vessels in a wall between two houses (first half of the mishna) follow the same rule; no separate scenario yet.'),
  c('6:5', 'modeled', 'Per Rabbi Yehuda (all the plaster belongs to the upper story), as Bartenura reads the mishna.'),
  c('6:6', 'partial', 'Tumah under a pillar modeled. Not yet: a house serving a wall (tomb niches) with a covering thin as garlic skin.'),
  c('6:7', 'modeled', 'Cupboards one above the other follow the same rule as side by side.'),
  // Chapter 7.
  c('7:1', 'partial', 'One upper story over two houses modeled. Not yet: a wall serving many stories (all tamei), a beach wall, and a solid monument (touching a closed grave).'),
  c('7:2', 'partial', 'Sloping sides modeled. Not yet: touching the tent from inside or outside, a side trailing on the ground, and a tent over a hatch (Rabbi Yose vs Rabbi Shimon).'),
  c('7:3', 'partial', 'Doors, an opened door and intent modeled. Not yet: Beis Shammai/Beis Hillel on when intent works, and a blocked doorway being reopened.'),
  c('7:4', 'catalog', 'A woman in difficult labor carried between houses.'),
  c('7:5', 'catalog', 'Twins, one stillborn.'),
  c('7:6', 'catalog', 'Saving the mother’s life.'),
  // Chapter 8 — what brings and what blocks.
  c('8:1', 'catalog', 'Things that bring and block: object property table (40-se’ah vessels, spread sheets, herds, plants, pure food).'),
  c('8:2', 'catalog', 'Projections that can hold plaster (Rabbi Meir vs Sages).'),
  c('8:3', 'catalog', 'Things that bring but do not block.'),
  c('8:4', 'catalog', 'Things that block but do not bring (lattices, bed ropes).'),
  c('8:5', 'catalog', 'Things that neither bring nor block (unstable things, a flapping garment, a floating ship).'),
  c('8:6', 'modeled'),
  // Chapter 9 — the beehive.
  ...Array.from({ length: 14 }, (_, i) =>
    c(`9:${i + 1}`, 'todo', 'The beehive: a vessel protects its inside but not what is under or over it; holes plugged loosely let tumah out but not in; defective vs whole; 40 se’ah (see the 8:1 tension).'),
  ),
  c('9:15', 'todo', 'A coffin broad below and narrow above (touching the sides).'),
  c('9:16', 'todo', 'A jar in the open with tumah under its protruding sides.'),
  // Chapter 10 — hatches.
  c('10:1', 'modeled'),
  c('10:2', 'partial', 'The order of placement (the foot before or after the tumah) is not yet modeled.'),
  c('10:3', 'modeled'),
  c('10:4', 'partial', 'All rulings have scenarios. Pending: a board in the lower hatch, which Bartenura sees as if it stopped the upper one.'),
  c('10:5', 'partial', 'All rulings have scenarios. Pending: a board in the lower hatch with tumah under it (as in 10:4).'),
  c('10:6', 'partial', 'The pot on the floor modeled. Pending: the pot a tefach up, which protects together with the walls of the house though smaller than the hatch (DESIGN tension 8).'),
  c('10:7', 'partial', 'The pot on the floor and a tefach up, reaching a tefach under the lintel, modeled. Pending: less than a tefach under the lintel (DESIGN tension 14). Not yet: a pot stuck to the side of the lintel.'),
  // Chapter 11.
  c('11:1', 'partial', 'Beis Hillel (a split of any size) modeled. Not yet: Beis Shammai (4 tefachim) and Rabbi Yose (a tefach).'),
  c('11:2', 'partial', 'The split, a leg over it and a reed on the floor modeled. Pending: a reed over the split, or under it a tefach up (narrower than a tefach; DESIGN tension 12).'),
  c('11:3', 'modeled', 'Folded garments are modeled under 15:1, which repeats them.'),
  c('11:4', 'modeled'),
  c('11:5', 'modeled'),
  c('11:6', 'modeled'),
  c('11:7', 'partial', 'Rabbi Yose (the halacha) modeled. Not yet: Rabbi Meir (a neck a tefach wide), Rabbi Eliezer (the way out through its hind), Rabbi Yehuda ben Beseira; how long flesh stays in the belly (catalog).'),
  c('11:8', 'todo', 'A cellar, a candlestick and an olive basket.'),
  c('11:9', 'todo', 'Vessels between the rims of the basket and the cellar.'),
  // Chapter 12.
  c('12:1', 'partial', 'Modeled per the Sages. Not yet: Rabbi Yochanan ben Nuri, for whom an oven, even old, protects.'),
  c('12:2', 'todo', 'Netting over an oven with a sealed lid.'),
  c('12:3', 'partial', 'The board over the oven’s ends modeled, with Rabbi Yose. Not yet: the betach, and its projection (Rabbi Eliezer vs Rabbi Yehoshua).'),
  c('12:4', 'modeled'),
  c('12:5', 'modeled'),
  c('12:6', 'modeled', 'Round beams (circumference three tefachim) not yet: the grid models square cross-sections.'),
  c('12:7', 'modeled'),
  c('12:8', 'todo', 'An olive’s bulk stuck to the threshold or lintel; touching the threshold.'),
  // Chapter 13 — windows.
  c('13:1', 'todo', 'Minimum sizes of windows by purpose (light, air, use): opening sizes that depend on intent.'),
  c('13:2', 'todo', 'A window for air; a house built outside it.'),
  c('13:3', 'todo', 'A hole in a door (Rabbi Akiva vs Rabbi Tarfon).'),
  c('13:4', 'todo', 'Holes made for a rod, tongs or lamp.'),
  c('13:5', 'catalog', 'What reduces the size of an opening.'),
  c('13:6', 'catalog', 'What does not reduce it: “what is pure reduces, what is tamei does not”.'),
  // Chapter 14 — projections.
  c('14:1', 'todo', 'Projections and balconies above a doorway.'),
  c('14:2', 'partial', 'A projection over a closed doorway modeled. Not yet: over a window (any width), and Rabbi Yose.'),
  c('14:3', 'todo', 'A rod above a doorway (Rabbi Yehoshua vs Rabbi Yochanan ben Nuri).'),
  c('14:4', 'partial', 'Modeled per Rabbi Yehoshua (the halacha). Not yet: Rabbi Eliezer, and the courtyard surrounded by a portico.'),
  c('14:5', 'partial', 'An overlap of less than a tefach (Rabbi Eliezer vs Rabbi Yehoshua) is pending.'),
  c('14:6', 'modeled'),
  c('14:7', 'partial', 'Narrow projections modeled. Not yet: two curtains, the lower a tefach off the ground (DESIGN tension 13).'),
  // Chapter 15.
  c('15:1', 'modeled'),
  c('15:2', 'modeled', 'Not yet: Bartenura’s note that tumah inside the square is kept in (DESIGN tension 11).'),
  c('15:3', 'todo', 'Jars touching one another in the open.'),
  c('15:4', 'modeled', 'Modeled with boards from the side; boards or curtains under the beams follow the same rule.'),
  c('15:5', 'modeled'),
  c('15:6', 'partial', 'Straw left in the house (nullified) modeled. Not yet: a tefach of space above the straw, which makes it ordinary belongings that do not protect.'),
  c('15:7', 'partial', 'Earth filling a house modeled. Not yet: a tefach of space around the tumah, which makes it a closed grave defiling all around by touch.'),
  c('15:8', 'todo', 'The courtyard of a tomb; a beam used as a tomb’s covering stone.'),
  c('15:9', 'todo', 'A sealed jar or an animal used as a covering stone.'),
  c('15:10', 'modeled'),
  // Chapter 16.
  c('16:1', 'todo', 'Movable things convey tumah: to one carrying them at an ox-goad’s thickness, to others at a tefach (Rabbi Akiva).'),
  c('16:2', 'partial', 'The yoke over a grave modeled. Not yet: the spindle between two half-olives (a movable thing brings tumah onto itself at any thickness, 16:1). Mounds near a city (catalog).'),
  c('16:3', 'catalog', 'Finding corpses; when a place is a graveyard.'),
  c('16:4', 'catalog', 'How to search.'),
  c('16:5', 'catalog', 'Ending the search; gathering bones.'),
  // Chapters 17–18 — beis haperas and the lands of the nations.
  c('17:1', 'catalog', 'Plowing a grave makes a beis haperas.'),
  c('17:2', 'catalog', 'Where the beis haperas ends.'),
  c('17:3', 'catalog', 'Plowing that does not make a beis haperas.'),
  c('17:4', 'catalog', 'Soil washed down from a beis haperas.'),
  c('17:5', 'partial', 'The house and upper story over a lost grave modeled. Not spatial: soil from a beis haperas or abroad combining to the size of a seal (catalog).'),
  ...Array.from({ length: 10 }, (_, i) => c(`18:${i + 1}`, 'catalog', 'Beis haperas, gentile dwellings and places deemed pure: rules of status, not of space.')),
];
