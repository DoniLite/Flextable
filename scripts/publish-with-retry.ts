#!/usr/bin/env bun
/**
 * `changeset publish` decides which packages still need publishing by
 * running `npm info <pkg>` first; that pre-check can return stale/empty
 * data for a package that's actually already on the registry (a documented
 * @changesets/cli caveat). When that happens it attempts to publish anyway,
 * npm correctly rejects it ("cannot publish over the previously published
 * version"), and @changesets/cli is *supposed* to recognize that specific
 * rejection and downgrade it to a no-op — but that recovery path only fires
 * when npm's `--json` error output sets `error.code === "E403"`, which the
 * npm version installed in CI (`npm install -g npm@latest`, required for
 * OIDC trusted publishing) doesn't appear to set. So a harmless, expected
 * "already published, skip" case instead surfaces as `result: "failed"`,
 * which @changesets/cli treats as fatal for the *whole* publish command —
 * even though every other package (and the misdetected one too) already
 * published successfully. That's exactly what happened releasing v0.1.3:
 * all 6 changed packages landed on npm, but a stale `npm info
 * @flextable/core` read triggered a redundant publish attempt that got
 * rejected, and the whole job died before the GitHub Release step ran.
 *
 * Retrying is safe: changeset publish only ever attempts packages whose
 * local version isn't already published, so a retry is a no-op for
 * anything that already succeeded (as confirmed against the npm registry
 * after the v0.1.3 failure).
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
