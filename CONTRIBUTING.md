# Contributing to Pilzatlas-Lab

Pilzatlas-Lab is a scientific field-atlas and expedition-planning experiment. Contributions should improve evidence quality, interpretability, mapping, safety or field usefulness rather than add features without a clear purpose.

## Before a pull request

Run:

```bash
npm run check
npm run typecheck
npm run build
```

## Scientific contract

- Never relabel a heuristic suitability score as probability without calibration.
- Keep habitat, current fruiting, observations, confidence, trip quality, legal/conservation state and edibility separate.
- Treat data gaps as unknown, not ecological zero.
- Add source provenance and spatial/temporal limitations with new data adapters.
- Do not add exact public collection coordinates for sensitive/rare taxa.
- Remote identification is decision support, not culinary clearance.

## Code style

Use TypeScript for application/domain code and English for identifiers, comments and technical documentation. Keep external service adapters narrow, validated and observable.
