# Security upgrade candidate — October 2026

> Dependency-only upgrade on an isolated branch. No merge, deployment, Terraform changes, Supabase provisioning, or plugin connection.

- Base: `main` at `3df40dfd004d64bb5d64b1e15ef3221a431764d7`
- Node runtime remains `.nvmrc` 22 and `engines.node` >=22 <23.
- Direct packages: `next` 16.3.3 -> 16.4.3, `react` and `react-dom` 19.2.8 -> 19.3.1.
- Transitive packages: `sharp` 0.35.4 -> 0.35.5, native sharp binaries and libvips 1.3.4, Next.js SWC binaries 16.4.3, `@next/env` 16.4.3, `scheduler` 0.28.0.
- App source, map stack, GitHub workflows, environment files, Terraform configuration, and branch protections are unchanged.

## Lockfile provenance

- Updated the constrained npm lockfile graph (40 installed-package entries). Every new tarball retains SHA-512 integrity pinned against two independently available public package manifests; npm CI must still verify the actual registry archives before this branch can be approved.
- Compared package metadata against Next.js v16.4.3 and sharp v0.35.5 upstream manifests.
- The execution container cannot access npm/GitHub via its shell; local `npm ci` and `npm audit` were NOT run. The existing GitHub Actions Node 22 pipeline is the hosted verification gate.
- Before merge, independently regenerate with Node 22: `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`, review the diff, and confirm the clean `npm ci` installation.

## Test matrix

| Validation | Stage | Initial outcome |
|---|---|---|
| Root/lock versions; peer & optional dependency constraints; SHA-512 coverage | Static graph consistency | PASS |
| `npm ci --no-audit --no-fund` on Node 22 | Hosted Pilzatlas CI | PENDING |
| `npm run check` | Hosted Pilzatlas CI | PENDING |
| `npm run typecheck` | Hosted Pilzatlas CI | PENDING |
| `npm run build` | Hosted Pilzatlas CI | PENDING |
| `npm audit --json` plus GitHub security-alert triage | Security review | NOT RUN |
| MapLibre/deck.gl, WMS, GBIF H3, weather, conservation API smoke checks | GIS integration | NOT RUN |
| Browser/mobile smoke tests and Node 22 compatibility | Manual QA | NOT RUN |

## Release criteria and coordination

- Review the exact branch-head CI logs. An update with failed or missing checks remains blocked.
- The Terraform template fix (PR #7) and required-status-check cleanup remain a separate, explicitly approved work package. After its integration, rebase this branch and rerun the full checks.
- Do not automatically merge, deploy, grant plugin permissions, create Supabase resources, or rewrite existing Dependabot/Renovate PRs.

Security bulletin: https://nextjs.org/blog/nextjs-security-update-october-14-2026
