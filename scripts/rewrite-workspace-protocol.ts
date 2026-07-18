#!/usr/bin/env bun
/**
 * `changeset publish` only special-cases pnpm (running `pnpm publish`, which
 * rewrites `workspace:*` ranges to real versions when packing). For every
 * other package manager, including Bun, it falls back to plain `npm publish`,
 * which leaves `workspace:*` in the published package.json untouched. Run
 * this right before `changeset publish` in the release workflow to perform
 * that same rewrite ourselves.
 *
 * See https://github.com/DoniLite/Flextable/issues/3
 */
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

const DEP_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

const packagesDir = join(import.meta.dir, '..', 'packages');

async function loadWorkspacePackages() {
  const entries = await readdir(packagesDir, { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  const packages = await Promise.all(
    dirs.map(async (dir) => {
      const path = join(packagesDir, dir, 'package.json');
      const json = (await Bun.file(path).json()) as PackageJson;
      return { path, json };
    }),
  );

  return packages.filter(({ json }) => !json.private);
}

function resolveWorkspaceRange(range: string, version: string): string {
  const suffix = range.slice('workspace:'.length);
  if (suffix === '*' || suffix === '') return version;
  if (suffix === '^') return `^${version}`;
  if (suffix === '~') return `~${version}`;
  return suffix;
}

const packages = await loadWorkspacePackages();
const versionByName = new Map(packages.map(({ json }) => [json.name, json.version]));

let rewrittenCount = 0;

for (const { path, json } of packages) {
  let changed = false;

  for (const field of DEP_FIELDS) {
    const deps = json[field];
    if (!deps) continue;

    for (const [depName, range] of Object.entries(deps)) {
      if (!range.startsWith('workspace:')) continue;

      const version = versionByName.get(depName);
      if (!version) {
        throw new Error(
          `${json.name}: "${depName}": "${range}" in ${field} has no matching workspace package`,
        );
      }

      deps[depName] = resolveWorkspaceRange(range, version);
      changed = true;
    }
  }

  if (changed) {
    await Bun.write(path, `${JSON.stringify(json, null, 2)}\n`);
    rewrittenCount++;
    console.log(`rewrote workspace:* ranges in ${json.name}`);
  }
}

console.log(`done: ${rewrittenCount} package.json file(s) updated`);
