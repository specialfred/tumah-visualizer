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
