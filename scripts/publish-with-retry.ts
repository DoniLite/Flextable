#!/usr/bin/env bun
/**
 * `changeset publish` runs each package's `npm publish` concurrently (up to
 * 10 at once — @changesets/cli's hardcoded NPM_PUBLISH_CONCURRENCY_LIMIT),
 * and npm trusted publishing's provenance/attestation step is prone to
 * transient failures under that concurrency. When a single `npm publish`
 * call fails that way, changesets treats it as fatal for the whole command
 * and exits non-zero — even when every other package (and often the
 * "failed" one too) already landed on the registry, stranding the rest of
 * the release pipeline (e.g. the GitHub Release step) unrun.
 *
 * Retrying is safe: changeset publish only ever attempts packages whose
 * local version isn't already published, so a retry is a no-op for
 * anything that already succeeded.
 */
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 15_000;

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const { exitCode } = Bun.spawnSync(['bunx', 'changeset', 'publish'], {
    stdout: 'inherit',
    stderr: 'inherit',
  });

  if (exitCode === 0) {
    process.exit(0);
  }

  if (attempt < MAX_ATTEMPTS) {
    console.error(
      `changeset publish failed (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${RETRY_DELAY_MS / 1000}s...`,
    );
    await Bun.sleep(RETRY_DELAY_MS);
  }
}

console.error(`changeset publish failed after ${MAX_ATTEMPTS} attempts`);
process.exit(1);
