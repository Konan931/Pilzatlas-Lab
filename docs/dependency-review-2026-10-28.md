# Dependency review — 2026-10-28

## Baseline and change

Main: `bbafe7abb1a1da919a358774271114f522f1ce08`, containing merged PRs #7 and #9.
MapLibre PR #2 updated by a non-forced merge commit `33b8fbd950e93efcaa4fcf9fc84eaa9ed34f5926`, preserving both original branch history and main. The remotely created tree exactly matches the locally tested tree `56bd7ed207e95bacf65f1a6a731e4e58a64da417`.

The complete difference from main is two files, 13 additions / 13 deletions:
- package.json: maplibre-gl 6.9.0 -> 6.10.0.
- package-lock.json: root MapLibre pin and three package records: maplibre-gl 6.10.0, @maplibre/maplibre-gl-style-spec 26.4.4, @maplibre/mlt 1.3.0. Entries copied from the original Dependabot change, validated by clean npm ci.
- Next.js 16.4.3, React/React DOM 19.3.1, sharp 0.35.5, Node 22, application code and the complete CI repair remain intact.

## PR disposition

| PR | Result | Reason |
| --- | --- | --- |
| #2 | Updated, left open | Actual MapLibre improvement; fresh CI passed. Browser rendering remains unverified. |
| #3 | Closed, not merged | React DOM 19.3.0 superseded by 19.3.1 in main. |
| #5 | Closed, not merged | React 19.3.0 superseded by 19.3.1 in main. |
| #6 | Closed, not merged | Next.js 16.3.5 superseded by 16.4.3; reverting would lose newer fixes. |
| #4 | Closed, not merged | @types/node 26 is inappropriate for the supported Node 22 runtime; type definitions are not runtime security patches. |
| #8 | Retained open | Separate Actions/NVM management; npm stays with Dependabot. Groups React packages, limits Node types to 22, no automerge. |

No branch was deleted and no dependency ignore command was issued. #8 has not been activated by merging. Its proposed configuration, not current main, contains the Node-type major-version restriction.

## Security distinction

Closing obsolete version PRs does not dismiss advisories. The vendor's October 14 bulletin specifies Next.js 16.4.1 as a patched release and sharp >=0.35.5 as the image-processing workaround; main has 16.4.3 / 0.35.5. React's related advisory concerns react-server-dom packages, not simply the browser react package. Preserve the patched framework and the coordinated React 19.3.1 upgrade.

Sources:
- https://nextjs.org/blog/nextjs-security-update-october-14-2026
- https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3

A fresh npm audit on the updated MapLibre lockfile reported **13 affected package records: 10 high, 3 moderate, 0 critical**. These represent four underlying advisories, propagated through the dependency graph:

| Package in main and #2 | Version | Advisory |
| --- | --- | --- |
| fflate | 0.7.4 | GHSA-px8p-9vwx-vf98; malformed ZIP64 infinite loop |
| image-size | 0.7.5 | GHSA-w3rx-r6r6-pgpr; ICNS parser infinite loop |
| source-map-js | 1.2.1 | GHSA-68fv-2mgg-jv7q; indexed source-map denial of service |
| zod | 4.6.2 | GHSA-mrhx-c7xc-m3w5; oversized collection memory exhaustion |

All four package versions already exist in main. MapLibre #2 does not introduce or repair them. No force fix, downgrade or audit dismissal was applied. Audit suggestions include a disruptive deck.gl downgrade; fixes require a separate graph review and regression run. Exact exploitability depends on input paths; no claim of non-exploitability is made. Repository-private Dependabot alert triage was not available through the connector's exposed alert endpoints.

## Validation

- Isolated clean npm ci under Node **22.23.4**: PASS. Existing loaders.gl peer warnings remain.
- npm run check, including all three workflow tests: PASS.
- npm run typecheck: PASS before build-generated config changes.
- npm run build (Next.js 16.4.3): PASS.
- Build-generated next-env.d.ts / tsconfig.json edits reverted.
- Hosted Pilzatlas CI on exact updated PR head: PASS, https://github.com/Konan931/Pilzatlas-Lab/actions/runs/40751906001 .
- No Terraform workflow restored; no main merge or main application deployment performed.

Additional regression tests are supplied separately with the browser playground: H3 cells and deck.gl layer construction, note/GeoJSON handling, WMS request coordinates, invalid zoom and upstream HTTP failure. These do not create a WebGL context.

## Remaining application risks

- Desktop/iOS Safari/Android WebGL2 rendering, interleaved overlays, repeated region changes and GPU context loss need real-device tests.
- The existing application's BBK effect captures the initial checkbox value before map load; a toggle during initial loading may not be respected. Overlay recreation/finalization on region changes also needs browser QA. Neither was altered in this dependency-only PR.
- Existing WMS proxy validates zoom but not full x/y tile bounds, upstream PNG content type or timeout. The playground uses the public WMS directly and does not change that API.
- A build or the new constructor-level tests do not prove visual correctness, live data accuracy or safe field routing.
