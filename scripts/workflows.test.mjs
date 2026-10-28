import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const workflows = readdirSync(new URL('.github/workflows/', root))
  .filter((name) => /\.ya?ml$/i.test(name));

// Static regression guards for the current local-first architecture, not a
// general YAML validator or a security sandbox for arbitrary shell commands.
test('active workflows do not provision the optional backend', () => {
  assert.ok(workflows.length > 0, 'application CI must exist');
  for (const name of workflows) {
    const source = read(`.github/workflows/${name}`);
    assert.doesNotMatch(source, /terraform|TF_API_TOKEN|cli_config_credentials_token/i,
      `${name}: Terraform requires a separate infrastructure design and review`);
  }
});

test('Pilzatlas CI retains its triggers and required verification steps', () => {
  const ci = read('.github/workflows/ci.yml');
  assert.match(ci, /^name: Pilzatlas CI$/m);
  assert.match(ci, /^  pull_request:\s*$/m);
  assert.match(ci, /^  workflow_dispatch:\s*$/m);
  assert.match(ci, /^  push:\n    branches: \[main, "agent-toad\/\*\*"\]$/m);
  assert.match(ci, /^permissions:\n  contents: read$/m);
  assert.match(ci, /^          node-version-file: \.nvmrc$/m);
  const commands = [...ci.matchAll(/^      - run: (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(commands, [
    'npm ci --no-audit --no-fund',
    'npm run check',
    'npm run typecheck',
    'npm run build',
  ]);
  assert.doesNotMatch(ci, /continue-on-error|^\s+if:/m,
    'verification gates must not be skipped or allowed to fail');
});

test('workflow regression tests remain wired into the existing check gate', () => {
  const { scripts } = JSON.parse(read('package.json'));
  assert.equal(scripts.check,
    'node scripts/check.mjs && node --test scripts/workflows.test.mjs scripts/playground.test.mjs');
});
