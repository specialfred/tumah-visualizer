# Working on this project

## Workflow: Claude merges its own PRs

The owner does not review code; they review the finished app. So Claude works on its own
judgment:

- Commit, push, and open a PR for each piece of work.
- Merge the PR yourself once it is ready: CI green, `npm run typecheck` and `npm test` passing,
  and your own adversarial re-read of the diff done. Don't wait for a human code review.
- Report to the owner in terms of what the app now does, not how the code changed.

## Checks before pushing

```bash
npm run typecheck
npm test                 # every scenario is a test
npm run coverage-report  # after adding or changing scenarios; commit docs/COVERAGE.md
```

## Modeling mishnayos

Follow the process in [docs/DESIGN.md](docs/DESIGN.md#process-one-mishna-at-a-time): read the
mishna with Bartenura, build one scenario per ruling in `src/scenes/ohalos/chNN.ts`, and make
the engine pass it by changing a *general* rule, never a scenario-specific one. When no general
rule fits, mark the scenario `pending` with a note and record the tension in DESIGN.md. Keep
`src/scenes/coverage.ts` in step.

## Practical notes for building scenes

- Where objects overlap, the earlier one in the list wins (tumah always takes its cells). Put a
  vessel buried in straw or earth *before* the filling, or it will have no cells.
- Check that a vessel or person doesn't accidentally touch something tamei: contact chains
  (ch. 1) will make it tamei and the scenario will pass for the wrong reason. Leave a quarter
  tefach (one etzba) of air.
- Units in `build.ts` helpers are tefachim, in quarters (one etzba = 0.25).
- To see *why* an object is tamei, print `evaluate(scene, shittos).objects[id].reasons`; a quick
  `vite-node` script over `SCENARIOS` is the fastest way to debug.
- After a rule change, run the whole suite: rules interact (e.g. the slope rule of 7:2 first
  swallowed a hatch, a cloak under a portico and a drawer's outlet).

## Where things stand (Sept 2026)

See docs/COVERAGE.md for the full list. Deferred, each needing a new idea in the engine:

- **12:8** — which part of a doorway beyond the doorposts counts as the house (the lintel does,
  except per Rabbi Yose; the threshold is disputed; touching the threshold below a tefach).
- **9:16, 15:3** — a jar or jars in the open: an earthenware vessel shelters what is inside its
  belly only where there is an interruption between its inside air and the air outside.
- **10:4 / 10:5 pending** — a board in the lower hatch "seen as if in the upper" (DESIGN tension 8).
- **Chapter 5** (pots and ovens over hatches), **chapter 9** (the beehive), **chapter 13** (window
  sizes by purpose, DESIGN tension 4), **16:1** (carrying), **3:1–3:4** (combining measures,
  connected parts).

- **7:1** — a wall serving many stories: a closed tefach space in a wall defiles every story the
  wall serves (a closed grave, like the solid monument), but the engine only breaks tumah up and
  down.
- **14:1, 14:3** — a projection sloping down over a doorway brings tumah at any width within 12
  tefachim; needs a notion of what roofs a doorway rather than a tefach opening.
- **Earthenware blocks from outside** — an earthenware wall is not susceptible from its outside,
  so it blocks tumah coming at it (Bartenura on 6:2, 12:3), but not tumah from its own inside.
  Blocking is symmetric in the engine today. This one idea unlocks 12:3, 10:6, 10:7, much of
  chapter 5 and 11:8–11:9.
- **4:3** — a cupboard in a doorway: tumah inside a closed vessel should go out through its own
  door rather than all around; and the text (טמא) and Bartenura (טהור) differ on tumah in the house.
- **11:1** other shittos — a split of 4 tefachim or a tefach: the inner part's way out runs
  through the outer part.
- **15:8** — a golel (covering stone): tamei like the grave to whoever touches it, but only the
  part over the opening (or within 4 tefachim of the grave when its end is the golel); the
  courtyard of a tomb. Needs graves and golel as a kind of tumah.
- **10:2, 7:3** — the order of events: a foot over a small hatch before or after the tumah, intent
  formed before or after death, a blocked doorway being reopened. The engine has no time.
- **11:2's reed, 14:7's curtains** — DESIGN tensions 12 and 13.

Good next candidates: the earthenware idea above (it unlocks the most), then 16:1's movable
tumah (16:2's spindle), 4:3.
