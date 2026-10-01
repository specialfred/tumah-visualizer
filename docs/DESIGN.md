# Design

A 3D, interactive model of tumas meis as taught in Mishnah Ohalos. You build a scene out of
rooms, vessels, people and pieces of tumah, and the engine shades what is tamei and explains why,
citing the mishnayos behind each step. Every mishna's cases are pre-built scenes, and every
dispute is a setting.

The central commitment: **the engine is a physics model, not a lookup table.** No rule may
mention a specific mishna's scene. Each mishna's ruling is a *test* the general rules must pass.
When they cannot, that is either a bug in the model or a real tension between mishnayos, and we
surface it (see [Tensions](#tensions)).

## Stack

- TypeScript, React, Vite. Three.js via `@react-three/fiber` and `drei` for the 3D view.
  Tailwind for the UI. Zustand for state.
- The engine (`src/engine`) is plain TypeScript with no UI dependencies, and runs in a Web
  Worker so dragging stays smooth.
- Tests: Vitest. Every scenario is a test (`src/scenes/scenarios.test.ts`).
- Texts: the Sefaria public export (see `data/sources/README.md`). Hebrew mishna (Torat Emet,
  vocalized), English (Kulp, CC-BY), and Bartenura in both languages.

## Units and space

The grid unit is one **etzba** (fingerbreadth); a tefach is 4 etzbaos and an amah 6 tefachim.
Space is a voxel grid with z pointing up. Everything below z = 0 is earth "until the depths"
(עד התהום); cavities (drains, cellars) are carved out of it.

Each object is a union of boxes plus physical properties. Most are derived from its kind and
material and can be overridden in the inspector:

| Property | Meaning | Source |
| --- | --- | --- |
| `susceptible` | Can become tamei (מקבל טומאה) | Stone, earth, dung vessels are not (5:5); 40-se'ah vessels are not (8:1) |
| `vessel` | Has the status of a vessel (תורת כלי) | A broken vessel loses it (9:3) |
| `stable` | Stays put by itself | Things that float, flap or hop neither bring nor block (8:5) |
| `solidSurface` | Can be a roof | Lattices block but do not bring (8:4) |
| `structural` | Part of the building | Walls, roofs, plaster, boards laid as a floor |
| `receivesFromInsideOnly` | Earthenware | Takes tumah only through its inside air |

From these the analysis derives, per object:

- **brings** (מביא): it can roof a tent.
- **separates** (חוצץ): it blocks tumah for everything. Only a stable thing that cannot become
  tamei and is not a vessel, and does not rest only on people or vessels (6:1, per Bartenura: a
  stone on four vessels, even dung vessels, defiles but does not purify).
- **guards its interior**: a vessel that cannot become tamei (9:1), or earthenware closed with
  a tight lid (8:6), keeps tumah out of its own inside, though it does not block for what is
  under or over it.

## The model

The analysis (`src/engine/grid.ts`) computes, for every cell:

1. **covered**: some roof-capable object (or the earth) lies above it.
2. **ohel**: the *morphological opening* of the covered, passable space by a tefach cube: a
   cell is in a tent if some tefach cube of covered, passable cells contains it. Vessels and
   people are passable (they do not block). This one operation encodes both
   *טפח על טפח על רום טפח* and *פותח טפח*: two spaces join only through an opening a tefach
   cube can pass.
3. **regions**: tents, and "pockets": covered gaps too small to be a tent. Two tents are one only
   where a tefach cube can slide from one to the other; tents whose cubes merely touch, like
   the spaces under two tablets meeting at a corner (15:2), stay apart.

Propagation (`src/engine/evaluate.ts`) handles each tumah source on its own, then sums the
exposures per target, so partial measures combine (8:6: two half-olives in two sealed jars
join in the house). The rules, in the order they apply:

| Rule | Hebrew | What it does | Refs |
| --- | --- | --- | --- |
| Tent of the dead | אהל המת | Tumah in a tent defiles every susceptible thing in it | 3:7, 12:6, 15:1 |
| Tefach opening | פותח טפח | Tents join only through a tefach passage (built into the opening) | 3:6, 3:7, 10:1 |
| Overshadowing in the open | מאהיל | Outside a tent, tumah defiles what is directly above and below it, up to anything that blocks | 9:1, 14:5 |
| Compressed tumah | טומאה רצוצה | No tefach of air around it: it breaks through up to the sky and down to the depths. It does not enter tents it passes. | 7:1, 12:6, 14:7, 15:1 |
| Vessels do not block | עושין אהל לטמא ולא לטהר | A vessel (or person, or something resting on them) roofing a tamei tent counts as full of tumah, which overshadows up and down | 6:1, 9:2 |
| Halves of a wall | מחצה על מחצה | Tumah or a vessel inside a building element belongs to the nearer side; in the middle, to both. A closed space whose only ways out are closed doors into another tent (a cupboard in the wall) is seen as solid | 6:3, 6:4, 6:7 |
| The floor is the house | ארצו של בית כמוהו | A closed gap under a house belongs to it, in both directions | 3:7, 15:5 |
| Goes out, not in | דרך הטומאה לצאת | Tumah in a closed space goes out into the space around it; tumah outside does not enter | 3:7, 4:1, 8:6 |
| No way out | | A closed space with only sub-tefach outlets breaks out through the building into the nearest spaces above and below it | 3:7, 6:5 |
| The way out | דרך יציאת הטומאה | The closed doors of a tent with tumah are tamei, unless an opening big enough for this tumah (a tefach for an exact olive's bulk, 4×4 for a corpse) is open or intended | 3:6, 7:3 |
| Going out under a roof | דרך הטומאה לצאת | Where a tent with tumah meets the open air, a roof over that edge that also makes a tent of its own beside it carries the tumah into that tent, even without a tefach between them. Only outward: tumah in that tent does not come back in | 14:4 |
| Tightly sealed | צמיד פתיל | See "guards its interior" | 5:3, 8:6 |
| Contact | מגע | Chains of chapter 1, as a state machine over touching objects | 1:1–1:4 |
| The tent is not counted | האהל אינו מן המנין | What roofs the tumah is tamei, but what touches it is as if it touched the dead | 1:3, 15:2 |
| Seen through a hatch | | A roof that cannot block, seen straight up from the tumah through a small hatch, counts as full of tumah | 10:5 |
| Pillars | | A building element with the same tent on opposite sides is not a wall: tumah under it breaks up and down | 6:6, 6:7 |
| Slopes of tents | כל שפועי אהלים כאהלים | A gap too low for a tefach cube, beside a tent and under that tent's own outer side, is part of the tent; a hole through the thickness of the roof's own object is not (4:1) | 7:2 |
| Swallowed tumah | רואין את הטומאה | Tumah packed inside something that is not part of the building, with no air around it, is compressed: it breaks straight up and down, and a tent it comes out into is tamei (Rabbi Yose) | 11:7 |
| Removable in halves | | Rabbi Yose: tumah in a closed space whose only outlet is small does not go out, since it can be taken out in halves | 4:2 |
| A person is hollow | אדם חלול | A person's body is open space under his skin, so it can be the tent that brings tumah (Beis Hillel). Beis Shammai: the body is solid; tumah does not spread through it, so he is never "full of tumah" as a whole, but he does not block: tumah under him breaks straight up through him (two people one above the other bring the tumah, 11:4) | 11:3–11:6 |

Small gaps are classified by what bounds them:

- bounded only by the building (walls, plaster, earth) → **halves**, measured through the
  building, with sub-tefach cavities treated as solid ("as if there is no cavity", Bartenura
  on 3:7). The depths are never a side, so a gap under a house belongs to the house.
- bounded by a movable thing (a cupboard, boards set up as a partition) → **goes out, not in**,
  through that thing into the tent beyond it (a gap under a cupboard, 4:1; behind boards, 15:4).
  The same holds for a whole closed tent behind such a partition.
- open air within a tefach on its sides → the tumah is effectively in the open, merely
  roofed over → **compressed** (under a narrow beam, 12:6).

In any small gap, compressed tumah reaches only what is directly above and below it, not the
rest of the gap (15:4, 15:7).

Every result carries its reasons: the rule, a sentence, the object it came through, and the
mishnayos. The inspector shows this chain, and each reference opens that mishna.

### Contact chains

A state machine over touching objects (`src/engine/contact.ts`), from 1:1–1:4. Being in the
tent of the dead counts as the first link.

| From | Vessel touching it | Person touching it |
| --- | --- | --- |
| The tumah | K1 (7 days) | A1 (7 days) |
| K1 | K2 (7) | A2 (7) |
| A1 | K3 (7) | evening |
| A2 | K3 (7) | evening |
| K2, K3 | evening | evening |

## Shittos

Disputes are data (`src/engine/shittos.ts`): an id, the mishna, the options, and a default (the
halacha per Bartenura where he rules, otherwise the tanna kamma). Rules read the selected option.
The UI lists every dispute and marks the ones the engine does not yet read.

Commentators' readings of *what the case is* (e.g. Bartenura reading 6:1's נדבך as a large
stone, not a chest) currently follow Bartenura. As we add Rambam, Rash and others, their
readings become options of the same kind, so a scene can be viewed "according to" each.

## Process: one mishna at a time

Each mishna and each shitah is a unit of work, tracked in `src/scenes/coverage.ts` and
[COVERAGE.md](COVERAGE.md) (they can be mirrored as GitHub issues):

1. Read the mishna with Bartenura and pin down each ruling.
2. Build a scenario per ruling (and per shitah) in `src/scenes/ohalos/chNN.ts`, citing the
   clause it demonstrates.
3. Run the tests. If the engine gets it wrong, change a *general* rule, never add a
   scenario-specific one, and re-run everything. A fix for one mishna must not break another.
4. If no general rule can satisfy both this mishna and an earlier one, record a tension below
   and mark the scenario `pending` with a note, rather than forcing it.

## Tensions

Places where the mishnayos, read naively, pull the model in different directions. Each is
either resolved by a distinction the model now encodes, or open.

1. **Vessels under a cupboard vs. under floorboards** (4:1 vs 15:5). Both are sub-tefach gaps
   under a flat thing on the floor. In 4:1 the vessels stay tahor ("the cupboard is like
   joined", Bartenura); in 15:5 they are tamei ("the floor of the house is the house to the
   depths"). *Resolved* by `structural`: boards laid as a floor are part of the house; a
   cupboard is a movable vessel.
2. **The 40-se'ah beehive** (8:1 vs chapter 9). 8:1 says a 40-se'ah hive both brings and
   blocks. In chapter 9, Bartenura reads the hive as 40 se'ah, yet it does not protect what is
   under or over it "because it is a vessel", and 9:12 cites the Sages that a 40-se'ah hive is
   like a broken one. *Open*: modeling chapter 9 will need to decide between readings.
3. **Tumah rising through less than a tefach** (14:5). With the upper projection overlapping
   the lower by less than a tefach, tumah beneath still reaches the space between them — which
   the tefach-opening rule forbids. *Open* (scenario pending).
4. **Windows smaller than a tefach** (13:1–13:4 vs 3:6–3:7). A window made for light passes
   tumah at the size of a drill hole. Opening sizes depend on purpose. *Open*: the model will
   need openings with a declared purpose.
5. **Compressed vs. enclosed small gaps** (12:6, 14:7 vs 3:7). Tumah under a narrow beam breaks
   up and down; tumah in a small drain under a house belongs to the house. *Resolved*
   provisionally by the "open air within a tefach" test. A more principled criterion is wanted.
6. **An open window vs. an open door** (3:6 vs 7:3). An opened door saves the other doors
   without any intent (7:3), while Bartenura on 3:6 requires intent to take the tumah out by a
   window. *Open*: the engine currently lets any sufficiently large open opening save the doors;
   the 3:6 scenarios use declared intent.
7. **The way out is rabbinic** (7:3, Bartenura: גזרו חכמים). The doorway rule is modeled
   alongside Torah-level rules; a future setting could separate the layers.
8. **A board in the lower of two hatches** (10:4, 10:5). Bartenura: something that can become
   tamei does not block, so it is seen as if it stopped up the upper hatch, and the upper story
   is tamei too. The engine derives the upper-hatch cases, but a board in the lower hatch
   leaves the upper story tahor: the tumah filling the board rises through the open upper hatch
   without entering the story around it. *Open* (scenarios pending).
9. **Nullified vs. movable fillings** (15:4, 15:6 vs 4:1). Straw or earth left in a house is
   modeled as part of the building, so a vessel packed in it with no tefach around it belongs to
   the house (15:6). Boards set up as a partition are modeled as movable, so tumah behind them
   goes out into the house (15:4). A case where the same filling must be both is not yet known.
10. **Going out under a roof** (14:4 vs 15:2). The tumah in a house goes out under a
   projection only three etzbaos wide over the doorway into the projection's tent, though the
   two spaces meet through less than a tefach. Tablets meeting at their edges (15:2) must not
   join the same way. *Resolved* provisionally: only a roof that is one object over both the
   way out and the other tent carries the tumah, and only outward (from a tent to where it
   meets the open air). Rabbi Eliezer, for whom the projection joins in both directions, would
   need 14:1's "a projection brings at any width".
11. **Tumah inside a table's square** (15:2, Bartenura, vs 6:1). Bartenura: tumah within the
   bottomless frame a table sits on is kept in by it. But the table top over it is a vessel,
   which counts as full of tumah and brings it down under its overhang (6:1, 9:2). *Open*: the
   engine follows 6:1; no scenario asserts Bartenura's reading.

## Roadmap

1. Finish the chapters that are nearly there (3, 4, 6, 10, 14, 15) and add scenarios for the
   implemented-but-untested rules (3:6, 7:3).
2. Chapter 5 and 9: earthenware over hatches, the beehive. Needs openings plugged loosely
   (tumah goes out but not in), and a decision on tension 2.
3. Chapters 11–13: people as tents (אדם חלול), split houses, opening sizes by purpose.
4. Carrying (משא) and connected objects (חיבורין), ch. 1:3 and 16.
5. More commentators as switchable readings (Rambam, Rash, Rosh).
6. Share scenes by link; export images.
