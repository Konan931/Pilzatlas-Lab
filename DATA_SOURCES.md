# Evidence sources — 2026 research snapshot

Research refresh: **2026-09-11**. Runtime health does not imply scientific validity; it only indicates whether a source endpoint answers.

| Tier | Source | 2026 status / role | Atlas treatment |
| --- | --- | --- | --- |
| A | DWD CDC daily soil moisture | beech/pine/oak/spruce and other families; 2026 indexes current through 10 Sep | documented ETL target; model input only after real raster sampling |
| A | LfU Brandenburg BBK | WFS/WMS; metadata revised 2026; `app:bbk_fl`/line/point feature types | live WMS + WFS sampling; preserve survey/date limitations |
| A | LBGR/LGB Bodenarten & Substrate | OGC API Features + WFS; metadata 07 Jul 2026; overview scale 1:300,000 | regional soil signal only, never parcel-level truth |
| A | LfU Schutzgebiete | NSG/LSG/NNL/FFH/SPA + selected zonings; WFS metadata current 2026 | screening/VERIFY gate; ordinances remain legally authoritative |
| A | VBB GTFS / GTFS-RT | realtime provider currently reports limited coverage since 04 Jun 2026 | expose degraded state; never silently claim complete realtime |
| C | GBIF Occurrence API | current searchable occurrence store | positive evidence only; raw coordinates stay server-side, browser receives H3 r6 aggregates |
| B | BUND/DGfM/PSV sources | local season and identification expertise | expert context and verification |
| D | community/local reports | potentially fast current signal | temporally decayed supporting evidence only |

## Provenance envelope

```yaml
source_name:
source_url:
source_tier: A|B|C|D
retrieved_at:
observed_at:
spatial_resolution:
license:
claim_supported:
limitations:
```

Never conflate publication time, retrieval time and observation time. A missing response is `unknown`, not ecological absence.
