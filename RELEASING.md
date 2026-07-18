# Releasing

Maintainer notes for cutting a release. If you're looking for how to *use* FlexTable, see the
[docs site](https://github.com/DoniLite/Flextable/tree/main/apps/docs) instead — this file is
about publishing the packages themselves.

## How it works

Versioning and publishing are two deliberately separate steps, driven by two workflows:

1. **[`version.yml`](.github/workflows/version.yml)** runs on every push to `main`. It looks at
   whatever [Changesets](https://github.com/changesets/changesets) are pending and opens (or
   updates) a **"Version Packages" pull request** that bumps the affected packages' versions and
   writes their `CHANGELOG.md` entries. It never publishes anything.
2. **[`release.yml`](.github/workflows/release.yml)** runs only when a **tag is pushed** — not on
   every merge to `main`. It builds, typechecks, tests, rewrites `workspace:*` internal
   dependencies to real versions (see
   [`scripts/rewrite-workspace-protocol.ts`](scripts/rewrite-workspace-protocol.ts) — required
   because `changeset publish` only does this rewrite natively for pnpm, not Bun), publishes to
   npm via [OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) (no `NPM_TOKEN`
   secret involved), and creates a GitHub Release for the pushed tag.

   `changeset publish` decides what needs publishing via `npm info`, which can occasionally return
   stale/empty data for a package that's actually already on npm. When that happens it attempts to
   republish, npm correctly rejects it, and `changeset publish`'s own recovery path for that exact
   case is broken against the npm version this workflow installs (`npm install -g npm@latest`, for
   OIDC support) — so a harmless "already published" case escalates into a fatal error for the
   *whole* publish command, even after every real package already landed. This happened releasing
   `v0.1.3`: all 6 changed packages published fine, but a stale `npm info @flextable/core` read
   triggered a redundant publish attempt that failed and killed the job before the GitHub Release
   step ran. [`scripts/publish-with-retry.ts`](scripts/publish-with-retry.ts) retries the publish
   step a few times before giving up; this is safe because `changeset publish` only ever attempts
   packages whose local version isn't already on npm, so a retry (or a manual re-run of the
   workflow, or `bun run release` locally) is a no-op for anything that already succeeded.

Merging the Version PR bumps versions on `main` but doesn't release anything by itself — pushing a
tag is the deliberate "go" moment.

## Day to day: adding a changeset

Any PR that changes a published package's behavior should include a changeset:

```sh
bun run changeset
```

This prompts for which packages changed and how (`patch` / `minor` / `major`), then writes a
markdown file under `.changeset/`. Commit that file as part of the PR. One changeset can cover
multiple packages if the change touches more than one (e.g. a `core` change that also affects
`react` and `vue`).

## Cutting a release

1. Merge PRs with their changesets as normal. `version.yml` keeps the "Version Packages" PR
   up to date automatically — you don't need to do anything for this step.
2. When you're ready to release everything currently queued up, review and merge the **Version
   Packages** PR. This bumps `package.json` versions and `CHANGELOG.md` files on `main`, and
   deletes the consumed changeset files. Nothing is published yet.
3. Tag the resulting commit and push the tag:

   ```sh
   git checkout main && git pull
   git tag v0.2.0   # highest version the Version PR just bumped — see "Release tag naming" below
   git push origin v0.2.0
   ```

   `release.yml` triggers on **any** tag push (not just `v*`), so use a real version-shaped tag
   name to avoid confusing an unrelated tag with a release trigger.
4. Watch the `Release` workflow run in the Actions tab. It publishes every package whose local
   version is ahead of what's on npm, then creates a GitHub Release for the pushed tag
   (auto-generated notes; skipped if a release for that tag already exists, so re-running the
   workflow after a partial failure is safe).

## Release tag naming

One tag names a release *batch* — everything published in a single `release.yml` run — not any
single package's version. Packages in this monorepo version independently via Changesets (there
are no `fixed`/`linked` groups in `.changeset/config.json`), so the packages included in one batch
can end up on different version numbers.

- Tag format: `vX.Y.Z`, matching semver, with no `@flextable/*` package prefix.
- Use the **highest** version number among the packages the Version Packages PR just bumped. For
  example, if that PR bumps `@flextable/react` from `0.1.2` to `0.1.3` and leaves
  `@flextable/core` at `0.1.2`, tag `v0.1.3` — not `v0.1.2`, and not a tag per package.
- Don't expect every package to be on the tag's version afterward. Check each package's own
  `package.json`/`CHANGELOG.md`, or its listing on npm, for what it actually published. The tag
  and the GitHub Release it creates are a batch marker, not a per-package version pointer.

## One-time setup: npm Trusted Publisher

OIDC trusted publishing requires each package to be configured on npmjs.com *before* the first
publish attempt: for every `@flextable/*` package, add this GitHub repository and the
`release.yml` workflow as a **Trusted Publisher** under the package's npm settings (this has to be
done once per package, and the package must already exist on npm — for a brand-new scope/package
name, publish once manually with `npm publish --access public` from a local machine with npm
auth, then switch it over to trusted publishing for every subsequent release).

Also confirm the `@flextable` npm org/scope used throughout `package.json` is one you actually
own — it's a placeholder chosen early in the migration and is trivial to rename before the first
real publish, but should be settled before setting up trusted publishers.
