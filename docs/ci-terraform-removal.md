# Remove the unused Terraform template

Reviewed on 2026-10-15 against main `3df40dfd004d64bb5d64b1e15ef3221a431764d7`.

## Evidence and decision

- No tracked `.tf` or `.tf.json` configuration exists on main or any fetched remote branch. No repository `AGENTS.md` was found.
- `README.md`, `PROJECT_STATE.md`, `supabase/README.md` and `.env.example` describe local operation and a prepared, unprovisioned, optional Supabase/PostGIS backend. The SQL migration is not Terraform configuration.
- The only Terraform implementation on main is the unconfigured GitHub template added in `3df40df`. No concrete Terraform infrastructure requirement was found.
- [Run 35393979845](https://github.com/Konan931/Pilzatlas-Lab/actions/runs/35393979845), job 105758480018: init reports an empty directory; plan fails with `No configuration files`; apply is skipped. The template's apply condition also incorrectly uses `refs/heads/"main"`.
- For [MapLibre PR #2](https://github.com/Konan931/Pilzatlas-Lab/pull/2), head `1c1ddd45c228fb152f71d3fd471b9524f7c2df57`, the separate [Pilzatlas CI run 35393979835](https://github.com/Konan931/Pilzatlas-Lab/actions/runs/35393979835) succeeded. PR #2 was still open and mergeable at review time.

Delete the unused workflow, including its production environment, token reference and automatic apply. Do not add dummy resources or merely repair the apply condition. This does not delete infrastructure, state, secrets or environments. `.github/workflows/ci.yml`, application code and dependency versions remain unchanged.

## Regression coverage and verified results

`npm run check` now also runs `node --test scripts/workflows.test.mjs`, using only built-in Node modules. Three static tests guard against reintroducing Terraform in active YAML workflows, preserve the current CI triggers/read permission/Node selection/ordered gates, and verify test integration. These are deliberately narrow repository contracts, not a general YAML validator or shell security analyzer.

Local checks performed:

- `npm ci --no-audit --no-fund`: passed (196 packages). Installation used the environment's Node 24.19.0 and emitted the expected Node engine warning plus an existing loaders.gl peer warning; no lockfile changes.
- Under Node **22.23.3**: `npm run check` (repository invariants and all 3 tests), `npm run typecheck`, `npm run build`: passed.
- Negative controls under Node 24.19.0: restoring the original Terraform template fails the workflow test; removing the build gate fails the CI contract test. Temporary mutations were reverted.
- Application CI compared byte-for-byte with the base: unchanged.
- `git diff --check`: passed.

Next.js automatically adjusted `tsconfig.json` during the build; those generated edits were reverted to keep this patch focused. No Terraform command or production deployment was run. Local build validation is not a claim that GitHub Actions for the new PR has completed.

## Separate PR and rollout

Use branch `fix/remove-unused-terraform-ci` against main, independently of the MapLibre dependency branch. Review the fresh Pilzatlas CI result before merging; do not merge automatically.

Repository rulesets returned an empty list. Reading classic branch protection returned HTTP 403 (`Resource not accessible by integration`), so required checks could not be fully verified. If `Terraform` is required there, a maintainer must remove that obsolete requirement while preserving `verify`/Pilzatlas CI. No protection settings were changed.

After this fix is approved and merged, update/rebase PR #2 onto main and inspect its fresh checks. Old failed runs remain historical; rerunning an old SHA still uses the old workflow and will not apply this fix.

Future Terraform adoption needs a separate design and review: real configuration in an explicit working directory, scoped validation/plan triggers, least-privilege credentials, no production secrets on untrusted PRs, and an explicitly approved apply through a protected environment. Update these regression contracts deliberately as part of that change; do not restore unattended `apply -auto-approve` on pushes.
