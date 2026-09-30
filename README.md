# Tumah Visualizer — Ohalos

An interactive 3D model of tumas meis as taught in Mishnah Ohalos. Build a scene out of houses,
vessels, people and tumah, drag things around, and see what becomes tamei, with the reason for
each and the mishnayos behind it. Every mishna's cases are pre-built, every dispute is a setting,
and the text (Hebrew or English, with Bartenura) is alongside.

The engine is a physics model: general rules (the tefach cube, tefach openings, compressed tumah,
what blocks and what doesn't, halves of a wall, the way out…) applied to any scene. Each
mishna's ruling is a test the rules must pass. See [docs/DESIGN.md](docs/DESIGN.md) for the model
and [docs/COVERAGE.md](docs/COVERAGE.md) for progress through all 134 mishnayos.

## Develop

```bash
npm install
npm run dev              # the app, at http://localhost:5173
npm test                 # every scenario is a test
npm run typecheck
npm run coverage-report  # regenerate docs/COVERAGE.md
npm run texts            # rebuild src/data/ohalos-text.json from data/sources
```

## Layout

- `src/engine` — the model: grid analysis, propagation rules, contact chains, shittos, rule catalog.
- `src/scenes` — scenarios per chapter (`ohalos/chNN.ts`) and the coverage list.
- `src/ui` — the app: 3D viewport, mishna browser, text, inspector, shittos.
- `data/sources` — texts from the Sefaria export, with licenses.

## Texts

From Sefaria's public export: the vocalized Hebrew (Torat Emet, public domain), the English of
Dr. Joshua Kulp (Mishnah Yomit, CC-BY), and Bartenura in Hebrew (Torat Emet, CC-BY-NC) and
English (trans. Rabbi Robert Alpert; license listed as unknown — to confirm before a public launch).
