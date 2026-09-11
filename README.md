# Pilzatlas BB · Agent Toad on Trumpet Town

**Pilzatlas-Lab** is the canonical source repository for a scientific, interpretable mushroom field atlas and expedition planner for Berlin and Brandenburg.

It is built around one rule:

```text
habitat suitability
!= fruiting readiness
!= observation evidence
!= evidence confidence
!= trip quality
!= conservation/legal status
!= edibility
```

The atlas is not a secret-spot pinboard and does not present heuristic scores as finding probabilities.

## v0.2 foundation

- Next.js App Router + strict TypeScript
- MapLibre GL JS + OpenFreeMap vector basemap
- deck.gl + H3 analytical mission surfaces
- ECharts evidence/phenology views
- official Brandenburg BBK WMS bridge
- BBK + LBGR WFS point sampler with explicit scale/null semantics
- conservation screening against LfU protected-area WFS feature families
- GBIF positive-observation adapter returning coarse H3 aggregates rather than raw coordinates
- DWD/VBB/source-health adapters and explicit degraded-feed states
- species missions for Totentrompete, Parasol, Krause Glucke, Riesenbovist, Steinpilz, Marone, Trompetenpfifferling and Agaricus-group analysis
- local-first field notebook and Recon Protocol
- Supabase/PostGIS migration prepared for future opt-in authenticated sync; no hosted backend required
- Wolfram validation track for model/geodesy/route experiments

## Run locally

```bash
nvm use
npm install
npm run check
npm run typecheck
npm run dev
```

The branch CI also performs a production `next build`. Until the generated lockfile is committed, CI intentionally uses `npm install` with npm caching disabled. The lockfile artifact from the first successful run is then committed and CI switches to `npm ci`.

## Map/data policy

The default vector basemap is OpenFreeMap/MapLibre. Official Brandenburg services are kept in separate source adapters so map rendering, scientific evidence and legal/conservation interpretation never collapse into one layer.

Current official source families and freshness notes live in [DATA_SOURCES.md](./DATA_SOURCES.md). The v0.2 materialization plan is in [docs/data-engine.md](./docs/data-engine.md).

## Privacy and safety

Exact personal field coordinates remain local by default. GBIF data exposed to the browser are aggregated to coarse H3 cells. Any future synced personal observations use authenticated ownership policies and Row Level Security.

The application never certifies edibility remotely. High-confusion groups remain `NOT CLEARED FOR CONSUMPTION` when decisive features are missing.

Psychoactive taxa may be represented for taxonomy, ecology, phenology and coarse biodiversity research, but the project does not optimize precise collection locations, preparation, potency or use.

## DWP internal field voice

Scientific evidence comes first. Mission labels such as **TRUMPET TOWN**, **Holy Mycelia**, or `Grumsin.write_permission .. DENIED BY CONSERVATION KERNEL` are explicitly DWP lore and never scientific sources.
