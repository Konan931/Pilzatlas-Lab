# Pilzatlas BB — project state

Snapshot: 2026-09-11 · `0.2.0-alpha.1`

## Canonical repository

`Konan931/Pilzatlas-Lab`

The repository is being migrated away from the unrelated `compact-dev` bootstrap into the Pilzatlas codebase. The bootstrap history is preserved in Git, but compact-dev-specific runtime/tooling files are intentionally removed from the application tree.

## Implemented baseline

- v0.1.1 MapLibre 6 ESM compatibility fix
- deterministic species/region model invariants
- MapLibre/deck.gl/H3/ECharts application shell
- official BBK WMS bridge
- live weather adapter
- evidence/source-health UI
- local field notebook and identification safety gate

## v0.2 foundation

- Evidence Ledger types and temporal helpers
- explicit `UNKNOWN` evidence state
- Conservation Kernel mission dispositions
- Recon Protocol schema and species-sensitive non-detection semantics
- GBIF privacy-preserving H3 aggregation route
- BBK/LBGR WFS spatial sampler
- Brandenburg protected-area WFS screening route
- Supabase/PostGIS RLS migration prepared but not provisioned
- Wolfram validation-lab design
- Node 22 GitHub Actions pipeline with build gate

## Validation target

A branch is acceptable for review only when:

1. `npm run check` passes.
2. `npm run typecheck` passes against installed dependencies.
3. `npm run build` succeeds.
4. a generated `package-lock.json` is committed and CI is switched to `npm ci`.
5. no active project file still claims this repository is `compact-dev`.
