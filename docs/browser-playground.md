# Pilzatlas browser playground

A buildless companion to the Next.js application. Open `/playground/index.html` when serving the repository app, or serve `public/playground` with an HTTP server. The private standalone Site is https://pilzatlas-field-playground.digital-welf-8377.chatgpt.site . Its source is mirrored from these four playground files into a separate Sites source repository. Future changes must synchronize both explicitly.

## Implemented

- Four Berlin/Brandenburg example regions and six species labels.
- MapLibre **6.10.0 ES modules** plus deck.gl **9.4.0** and h3-js **4.5.0**, loaded from pinned jsDelivr URLs with unpkg fallback.
- Interleaved MapLibreOverlay, 61 synthetic H3 resolution-8 cells per region, opacity control, optional demo line and local-note points.
- Optional real BBK WMS raster (initially off), EPSG:3857 / WMS 1.1.1, explicit source/load diagnostics.
- Map click or numeric coordinate entry, localStorage field notes, deletion and GeoJSON export. User text is rendered with textContent. No imported HTML or external upload parser.
- Notes/export initialize independently of network and graphics; failures do not silently erase saved data. Up to 1,000 notes / 2,000 characters per note. Export backups before clearing browser storage.
- Responsive layout, visible focus, labeled inputs and source/state indicators.

Species selection labels notes; it does not calculate a species-specific prediction. Uniform H3 cells are rendering fixtures, the short line is a demo connection, not a walkable route. No inferred harvest clearance, verified occurrence, current weather or protection clearance is supplied.

## Validation and limits

Node 22 tests cover persisted-note validation, GeoJSON longitude/latitude order, H3 cell counts and geographical bounds, real deck.gl constructor interoperability, and the existing WMS proxy's PNG/error behavior using a controlled fetch stub. All three original workflow regressions remain present; their exact expected command is extended to include the new test file.

Live BBK capabilities advertise biot_ausb_fl and EPSG:3857. A real 512×512 GetMap request returned HTTP 200, image/png, valid PNG bytes, and Access-Control-Allow-Origin: *. This proves that response only, not all tiles or future availability.

The managed environment lacks the supported browser-control tool. No screenshot, interactive end-to-end, WebGL rendering, storage UI interaction or real iPhone/Safari test is claimed. Test on the published page: toggle layers before/after load; change all regions; save a note containing angle brackets; reload; export and inspect coordinates; test denied storage, offline CDN failure, small-screen scrolling, repeated layer changes and GPU context loss.

The first CDN probe caught an obsolete .js path; the implementation uses MapLibre's published .mjs entry. Both module and worker assets are checked separately. CDN dependencies are pinned but not self-hosted; offline map support and SRI/transitive module integrity are not implemented. Base-map tiles are OpenStreetMap and require attribution and compliance with provider usage rules; no bulk prefetch/cache is added. All external requests disclose the normal network metadata to their providers.

This standalone static app has no connector calls, Supabase credentials, cloud synchronization or production API keys. It is a test surface, not the full field application.

## Integration choices

| Tool | Practical role | Priority / implementation boundary |
| --- | --- | --- |
| Sites | Private hosted playground | Implemented. |
| Supabase | Later cross-device observations, evidence, PostGIS | Next backend step: existing migration must be reviewed with per-user RLS, provenance and location privacy before provisioning. |
| Life Sciences Literature | Cited species/habitat evidence | Research pipeline; not a live collection forecast or image identification authority. |
| Wolfram | Independently check weighting, uncertainty, geospatial calculations | Offline model verification before scores enter UI. |
| AnyWhereMap | Conversational exploration and location selection | Useful assistant UI; not a substitute for the app's map renderer or a confirmed routing API. |
| Dropbox | Export/archive field evidence | Start with explicit export; no automatic location uploads. |
| Spreadsheets | Review observation datasets and model weights | GeoJSON is implemented; CSV conversion/curation is a separate workflow. |
| Google Calendar | Confirmed field-trip dates | Later explicit trip action; no scheduling performed. |
| Color Designer | Palette tuning | Optional design support; not required at runtime. |
| ToolCheck | Review future MCP providers | Supporting evidence only, not a security certification. |
| Picsart / Higgsfield / VideoZero | Onboarding visuals and explanations | Later, with factual imagery clearly distinguished from generated content. |
| Tripo 3D | Educational morphology models | No matching installed tool exposed in this session; not a dependency of the field MVP. |
| Flipbook / Publuu | Publish a prepared field-guide PDF | Later publishing workflow. |
| Common Room / Semrush | Outreach and discovery | Low priority for field utility; no contact or marketing operations performed. |
| Pets | Optional companion / character | Cosmetic; separate from evidence and field advice. |

Sites eligibility was inspected for the current workspace. Supabase, Dropbox, Google Calendar and several design/research tools are allowed at the policy layer; this does not prove a working connection, visitor consent or API suitability. Static-only Sites cannot invoke these connectors: live integrations require server routes and a fresh permission/connection review. No plugin has been added to the Site manifest.

## Next practical milestone

1. Run the published playground on iPhone Safari and desktop Chromium, record actual render/interaction failures.
2. Repair and test full-app map lifecycle / WMS robustness and the four outstanding transitive advisories before broad release.
3. Add one evidence-backed live workflow: coordinate -> dated observation/weather/source record -> user-owned persistent field note. Keep current evidence distinct from synthetic model fixtures.

Local validation on the sandbox branch: clean npm ci, all **8 tests**, typecheck and production build passed under Node **22.23.4**, using the unchanged main lockfile (application MapLibre 6.9.0). The same five additional tests also passed against the previously installed MapLibre 6.10.0 dependency set. The standalone CDN bundle intentionally exercises 6.10.0 independently of the application lockfile. Build-generated TypeScript config changes were reverted.
